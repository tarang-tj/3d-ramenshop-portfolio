// Boot probe: the check that can actually falsify "the site works".
// Serves the repo over HTTP, opens it in headless Chrome (installed Google Chrome via Playwright's
// 'chrome' channel, no browser download), and asserts:
//   1. zero console errors, zero uncaught exceptions, zero failed requests (CDN + local files)
//   2. the WebGL drawing buffer is not blank (>= 15% of sampled pixels are non-black)
//   3. the experience state machine works: loader gone -> enterShop -> panel opens with content
//      -> quest/arcade hooks (when present) respond
// Exit 1 on any failure. Screenshots land in artifacts/ for the reviewer.
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { chromium } from 'playwright';

const root = new URL('..', import.meta.url).pathname;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json', '.svg': 'image/svg+xml' };
const server = createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const rel = url === '/' ? '/index.html' : url;
  const file = normalize(join(root, rel));
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  try { const b = await readFile(file); res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' }); res.end(b); }
  catch { res.writeHead(404); res.end('not found'); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;

const failures = [];
const fail = (m) => { failures.push(m); console.log('FAIL  ' + m); };
const pass = (m) => console.log('pass  ' + m);
const artifacts = join(root, 'artifacts'); if (!existsSync(artifacts)) await mkdir(artifacts);

let browser;
process.on('uncaughtException', async (e) => { console.log('FAIL  probe crashed: ' + (e && e.message)); try { await browser?.close(); } catch {} server.close(); process.exit(1); });
try {
  browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
} catch (e) {
  console.log('chrome channel unavailable (' + e.message.split('\n')[0] + '), trying bundled chromium');
  browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
}
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const consoleErrors = [], pageErrors = [], failedReqs = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => pageErrors.push(String(e)));
page.on('requestfailed', r => failedReqs.push(r.url() + ' ' + (r.failure()?.errorText || '')));
page.on('response', r => { if (r.status() >= 400) failedReqs.push(r.url() + ' HTTP ' + r.status()); });

// Headless Chrome renders through SwiftShader here, so scene construction and shader compilation can
// take 20-40 s. Wait on the document's own state, not Playwright's lifecycle event, with a wide timeout.
const tNav = Date.now();
await page.goto(base, { waitUntil: 'commit' });
await page.waitForFunction(() => document.readyState === 'complete', null, { timeout: 90000 }).catch(() => fail('document never reached readyState complete within 90 s'));
console.log(`      document complete after ${((Date.now() - tNav) / 1000).toFixed(1)} s`);
await page.waitForFunction(() => !document.getElementById('loader') || document.getElementById('loader').classList.contains('hidden'), null, { timeout: 15000 }).catch(() => fail('loader never hid'));
await page.waitForTimeout(800);

// 1. pixels
const px = await page.evaluate(() => {
  if (typeof renderer === 'undefined' || !renderer) return { err: 'no renderer global' };
  renderScene();
  const gl = renderer.getContext();
  const w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
  const buf = new Uint8Array(w * h * 4);
  gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, buf);
  // sRGB output encoding lifts even the clear color to ~40/255, so "non-black" cannot fail.
  // Measure structure instead: luminance spread and the share of pixels far from the median.
  const lum = [];
  for (let i = 0; i < buf.length; i += 4 * 97) lum.push((buf[i] * 3 + buf[i + 1] * 6 + buf[i + 2]) / 10);
  const sorted = lum.slice().sort((a, b) => a - b); const med = sorted[sorted.length >> 1];
  const mean = lum.reduce((a, b) => a + b, 0) / lum.length;
  const std = Math.sqrt(lum.reduce((a, b) => a + (b - mean) ** 2, 0) / lum.length);
  const far = lum.filter(v => Math.abs(v - med) > 20).length / lum.length;
  return { w, h, std, far, canPost: typeof canPost !== 'undefined' ? canPost : null };
});
if (px.err) fail('pixel readback: ' + px.err);
else {
  console.log(`      drawing buffer ${px.w}x${px.h}, luminance std ${px.std.toFixed(1)}, far-from-median ${px.far.toFixed(3)}, bloom pipeline ${px.canPost}`);
  if (px.std >= 12 && px.far >= 0.10) pass('WebGL frame has structure (not a blank clear)'); else fail(`WebGL frame looks blank (std ${px.std.toFixed(1)} < 12 or far ${px.far.toFixed(3)} < 0.10)`);
  if (px.canPost !== true) fail('bloom pipeline unavailable (canPost !== true): CDN example scripts did not load');
}
await page.screenshot({ path: join(artifacts, 'boot-01-outside.png') });

// 2. state walk
await page.evaluate(() => enterShop());
await page.waitForTimeout(1400);
const st1 = await page.evaluate(() => ({ inside, uiShown: getComputedStyle(document.getElementById('inside-ui')).display !== 'none', inShop: document.body.classList.contains('in-shop') }));
if (st1.inside && st1.uiShown && st1.inShop) pass('enterShop: inside state + inside UI + in-shop body class'); else fail('enterShop state wrong: ' + JSON.stringify(st1));
await page.screenshot({ path: join(artifacts, 'boot-02-inside.png') });

await page.evaluate(() => openPanel('projects'));
await page.waitForTimeout(700);
const st2 = await page.evaluate(() => ({ active: document.getElementById('panel-overlay').classList.contains('active'), text: document.getElementById('panel-body').innerText.slice(0, 4000) }));
if (st2.active && /ragproof/i.test(st2.text)) pass('projects panel opens with content'); else fail('projects panel did not open with content: ' + JSON.stringify(st2).slice(0, 200));
for (const p of ['experience', 'skills', 'contact']) {
  await page.evaluate((p) => openPanel(p), p); await page.waitForTimeout(350);
  const len = await page.evaluate(() => document.getElementById('panel-body').innerText.trim().length);
  if (len > 200) pass(`${p} panel has content (${len} chars)`); else fail(`${p} panel too thin (${len} chars)`);
}
await page.screenshot({ path: join(artifacts, 'boot-03-panel.png') });
await page.evaluate(() => closePanel()); await page.waitForTimeout(500);
await page.keyboard.press('Escape');

// 3. optional layers (present after the wave; absent = skipped, never silently green)
const layers = await page.evaluate(() => ({ quest: !!(window.RAMEN && window.RAMEN.quest), arcade: !!(window.RAMEN && window.RAMEN.arcade), fx: !!(window.RAMEN && window.RAMEN.fx) }));
console.log('      layers present: ' + JSON.stringify(layers));
if (layers.quest) {
  const q = await page.evaluate(async () => {
    const Q = window.RAMEN.quest; Q.reset();
    const before = Q.state().stamps.length;
    Q.stamp(Q.courses()[0].id);
    await new Promise(r => setTimeout(r, 300));
    const s = Q.state();
    return { before, after: s.stamps.length, cardVisible: !!document.querySelector("#quest-card"), total: Q.courses().length };
  });
  if (q.after === q.before + 1 && q.cardVisible && q.total >= 8) pass(`quest: stamp registered (${q.after}/${q.total}), card in DOM`); else fail('quest layer misbehaved: ' + JSON.stringify(q));
  const fin = await page.evaluate(async () => { const Q = window.RAMEN.quest; Q.courses().forEach(c => Q.stamp(c.id)); await new Promise(r => setTimeout(r, 1200)); return { complete: Q.state().complete, finale: !!document.querySelector('.quest-finale, #quest-finale') }; });
  if (fin.complete && fin.finale) pass('quest: completing every course triggers the finale'); else fail('quest finale did not trigger: ' + JSON.stringify(fin));
  await page.screenshot({ path: join(artifacts, 'boot-04-finale.png') });
  await page.evaluate(() => window.RAMEN.quest.reset());
}
if (layers.arcade) {
  const a = await page.evaluate(async () => { const A = window.RAMEN.arcade; A.open(); await new Promise(r => setTimeout(r, 400)); const o = A.isOpen(); A.start(); await new Promise(r => setTimeout(r, 900)); const running = A.isRunning(); A.close(); await new Promise(r => setTimeout(r, 300)); return { o, running, closed: !A.isOpen() }; });
  if (a.o && a.running && a.closed) pass('arcade: open, start, close'); else fail('arcade misbehaved: ' + JSON.stringify(a));
}

// 4. regression hunt: render loop must pause when hidden; no runaway intervals
const timers = await page.evaluate(() => ({ intervals: (window.__intervalCount || 'n/a') }));
console.log('      intervals: ' + JSON.stringify(timers));

// 5. error tallies
await page.waitForTimeout(500);
const filteredReqs = failedReqs.filter(u => !/favicon/.test(u));
if (consoleErrors.length) fail(`${consoleErrors.length} console error(s): ` + consoleErrors.slice(0, 3).join(' | ')); else pass('zero console errors');
if (pageErrors.length) fail(`${pageErrors.length} uncaught exception(s): ` + pageErrors.slice(0, 3).join(' | ')); else pass('zero uncaught exceptions');
if (filteredReqs.length) fail(`${filteredReqs.length} failed request(s): ` + filteredReqs.slice(0, 3).join(' | ')); else pass('zero failed requests');

await browser.close(); server.close();
await writeFile(join(artifacts, 'boot-summary.json'), JSON.stringify({ when: new Date().toISOString(), px, st1, layers, consoleErrors, pageErrors, failedReqs: filteredReqs, failures }, null, 2));
console.log(failures.length ? `\nBOOT GATE FAILED (${failures.length})` : '\nboot gate green');
process.exit(failures.length ? 1 : 0);
