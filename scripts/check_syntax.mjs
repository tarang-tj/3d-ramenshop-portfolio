// Syntax gate: every inline <script> block in index.html and every js/*.js file must parse.
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const tmp = join(root, '.cache'); if (!existsSync(tmp)) mkdirSync(tmp);
let failed = 0;
function check(label, src) {
  const f = join(tmp, label.replace(/[^a-z0-9.-]/gi, '_') + '.js');
  writeFileSync(f, src);
  try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); console.log('pass  ' + label); }
  catch (e) { failed++; console.log('FAIL  ' + label + '\n' + e.stderr.toString().split('\n').slice(0, 6).join('\n')); }
}
const html = readFileSync(join(root, 'index.html'), 'utf8');
const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/g)];
inline.forEach((m, i) => check(`index.html inline script #${i + 1}`, m[1]));
const jsDir = join(root, 'js');
if (existsSync(jsDir)) for (const f of readdirSync(jsDir).filter(f => f.endsWith('.js')).sort()) check('js/' + f, readFileSync(join(jsDir, f), 'utf8'));
console.log(failed ? `\n${failed} syntax failure(s)` : '\nsyntax ok');
process.exit(failed ? 1 : 0);
