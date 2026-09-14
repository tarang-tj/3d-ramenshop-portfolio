// Noodle Catch: the arcade cabinet in the corner, the CRT overlay shell, the entry points,
// and the RAMEN.arcade test API. The round itself lives in js/86-arcade-game.js.
// Classic script, shares the global scope with every other js/*.js file.

const ARCADE = {
  LW: 640, LH: 480,          // logical play field; the canvas scales to it
  isOpenFlag: false,
  el: null, canvas: null, ctx: null, titleEl: null, actionsEl: null, hudEl: null,
  scale: 1, dpr: 1,
  reduced: false,
  game: null,                // filled in by 86-arcade-game.js
  best: 0,
  _onKey: null, _onMove: null, _onTouch: null, _onUp: null, _onResize: null, _onVis: null,
};

try { ARCADE.reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) {}

ARCADE.loadBest = function () {
  try {
    const raw = localStorage.getItem('ramen.arcade.v1');
    if (raw) { const v = JSON.parse(raw); if (v && typeof v.best === 'number' && isFinite(v.best)) return v.best; }
  } catch (e) {}
  return 0;
};
ARCADE.saveBest = function (n) {
  try { localStorage.setItem('ramen.arcade.v1', JSON.stringify({ best: n })); } catch (e) {}
};
ARCADE.best = ARCADE.loadBest();

// Short chip-style blips. Silent unless the visitor already turned sound on.
ARCADE.blip = function (freq, dur, type, vol) {
  if (typeof audioCtx === 'undefined' || !audioCtx) return;
  if (typeof soundEnabled === 'undefined' || !soundEnabled) return;
  try {
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.type = type || 'square';
    const t0 = audioCtx.currentTime, d = dur || 0.09;
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(vol || 0.03, t0);
    g.gain.exponentialRampToValueAtTime(0.0006, t0 + d);
    o.start(t0); o.stop(t0 + d + 0.02);
  } catch (e) {}
};

// ── Overlay DOM (built once, lazily) ───────────────────────────────────────
ARCADE.build = function () {
  if (ARCADE.el) return;
  const wrap = document.createElement('div');
  wrap.id = 'arcade-overlay';
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-modal', 'true');
  wrap.setAttribute('aria-label', 'Noodle Catch arcade game');
  wrap.innerHTML =
    '<div class="arc-cab">' +
      '<div class="arc-head"><span class="arc-mark">遊</span> Noodle Catch <span class="arc-sub">麺キャッチ</span></div>' +
      '<div class="arc-screen">' +
        '<canvas id="arc-canvas"></canvas>' +
        '<div class="arc-scan" aria-hidden="true"></div>' +
        '<div class="arc-vig" aria-hidden="true"></div>' +
        '<div class="arc-card" id="arc-title">' +
          '<div class="arc-card-kanji">麺キャッチ</div>' +
          '<div class="arc-card-name">NOODLE CATCH</div>' +
          '<div class="arc-card-line">Catch the toppings. Dodge the bugs. Every fifth catch plates a project.</div>' +
          '<button class="arc-coin" id="arc-coin" type="button">INSERT COIN</button>' +
          '<div class="arc-card-hint">Mouse, touch, or arrow keys. Esc leaves.</div>' +
          '<div class="arc-card-best">Best <span id="arc-best">0</span></div>' +
        '</div>' +
        '<div class="arc-actions" id="arc-actions">' +
          '<button class="arc-btn" id="arc-again" type="button">Play again</button>' +
          '<button class="arc-btn" id="arc-see" type="button">See the projects</button>' +
        '</div>' +
      '</div>' +
      '<div class="arc-foot"><span id="arc-hud">45s left</span><button class="arc-quit" id="arc-quit" type="button">Leave the cabinet ✕</button></div>' +
    '</div>';
  document.body.appendChild(wrap);
  ARCADE.el = wrap;
  ARCADE.canvas = wrap.querySelector('#arc-canvas');
  ARCADE.ctx = ARCADE.canvas.getContext('2d');
  ARCADE.titleEl = wrap.querySelector('#arc-title');
  ARCADE.actionsEl = wrap.querySelector('#arc-actions');
  ARCADE.hudEl = wrap.querySelector('#arc-hud');
  wrap.querySelector('#arc-coin').addEventListener('click', function () { ARCADE.startRound(); });
  wrap.querySelector('#arc-again').addEventListener('click', function () { ARCADE.startRound(); });
  wrap.querySelector('#arc-quit').addEventListener('click', function () { ARCADE.close(); });
  wrap.querySelector('#arc-see').addEventListener('click', function () {
    ARCADE.close();
    if (typeof openPanel === 'function') setTimeout(function () { try { openPanel('projects'); } catch (e) {} }, 260);
  });
  if (ARCADE.reduced) wrap.classList.add('arc-calm');
};

ARCADE.resize = function () {
  if (!ARCADE.canvas) return;
  const r = ARCADE.canvas.getBoundingClientRect();
  if (!r.width || !r.height) return;
  ARCADE.dpr = Math.min(window.devicePixelRatio || 1, 2);
  ARCADE.canvas.width = Math.round(r.width * ARCADE.dpr);
  ARCADE.canvas.height = Math.round(r.height * ARCADE.dpr);
  ARCADE.scale = r.width / ARCADE.LW;
  ARCADE.ctx.setTransform(ARCADE.scale * ARCADE.dpr, 0, 0, ARCADE.scale * ARCADE.dpr, 0, 0);
};

ARCADE.showTitle = function () {
  if (ARCADE.titleEl) ARCADE.titleEl.classList.remove('arc-gone');
  if (ARCADE.actionsEl) ARCADE.actionsEl.classList.remove('arc-on');
  const b = ARCADE.el && ARCADE.el.querySelector('#arc-best');
  if (b) b.textContent = String(ARCADE.best);
};
ARCADE.hideTitle = function () {
  if (ARCADE.titleEl) ARCADE.titleEl.classList.add('arc-gone');
  if (ARCADE.actionsEl) ARCADE.actionsEl.classList.remove('arc-on');
};
ARCADE.showActions = function () { if (ARCADE.actionsEl) ARCADE.actionsEl.classList.add('arc-on'); };
ARCADE.setHud = function (txt) { if (ARCADE.hudEl) ARCADE.hudEl.textContent = txt; };

// ── Open / close ───────────────────────────────────────────────────────────
ARCADE.open = function () {
  if (ARCADE.isOpenFlag) return;
  ARCADE.build();
  ARCADE.isOpenFlag = true;
  ARCADE.el.classList.add('arc-live');
  document.body.classList.add('arcade-open');
  ARCADE.resize();
  ARCADE.showTitle();
  ARCADE.setHud('Ready');

  ARCADE._onKey = function (e) {
    if (!ARCADE.isOpenFlag) return;
    e.stopPropagation();
    if (e.key === 'Escape') { e.preventDefault(); ARCADE.close(); return; }
    if (e.key === 'Enter' || e.key === ' ') {
      // Let a focused button do its own job instead of hijacking the key.
      if (e.target && e.target.tagName === 'BUTTON') return;
      if (!ARCADE.game.isRunning()) { e.preventDefault(); if (e.type === 'keydown') ARCADE.startRound(); }
      return;
    }
    const k = e.key;
    const left = (k === 'ArrowLeft' || k === 'a' || k === 'A');
    const right = (k === 'ArrowRight' || k === 'd' || k === 'D');
    if (left || right) { e.preventDefault(); ARCADE.game.hold(left ? -1 : 1, e.type === 'keydown'); }
  };
  ARCADE._onMove = function (e) {
    const r = ARCADE.canvas.getBoundingClientRect();
    ARCADE.game.aim((e.clientX - r.left) / ARCADE.scale);
  };
  ARCADE._onTouch = function (e) {
    if (!e.touches || !e.touches.length) return;
    const r = ARCADE.canvas.getBoundingClientRect();
    ARCADE.game.aim((e.touches[0].clientX - r.left) / ARCADE.scale);
  };
  ARCADE._onResize = function () { ARCADE.resize(); };
  ARCADE._onVis = function () {
    if (!ARCADE.isOpenFlag) return;
    if (document.hidden) ARCADE.game.suspend(); else ARCADE.game.wake();
  };
  document.addEventListener('keydown', ARCADE._onKey, true);
  document.addEventListener('keyup', ARCADE._onKey, true);
  ARCADE.canvas.addEventListener('mousemove', ARCADE._onMove);
  ARCADE.canvas.addEventListener('touchstart', ARCADE._onTouch, { passive: true });
  ARCADE.canvas.addEventListener('touchmove', ARCADE._onTouch, { passive: true });
  window.addEventListener('resize', ARCADE._onResize);
  document.addEventListener('visibilitychange', ARCADE._onVis);

  // Park the 3D loop while the cabinet is up. It is fully covered, and the game wants the frames.
  try { if (typeof _pageHidden !== 'undefined') _pageHidden = true; } catch (e) {}

  ARCADE.game.enterTitle();
  const coin = ARCADE.el.querySelector('#arc-coin');
  if (coin) setTimeout(function () { try { coin.focus(); } catch (e) {} }, 60);
  ARCADE.blip(420, 0.07, 'square', 0.03);
};

ARCADE.close = function () {
  if (!ARCADE.isOpenFlag) return;
  ARCADE.isOpenFlag = false;
  ARCADE.game.stop();
  document.removeEventListener('keydown', ARCADE._onKey, true);
  document.removeEventListener('keyup', ARCADE._onKey, true);
  ARCADE.canvas.removeEventListener('mousemove', ARCADE._onMove);
  ARCADE.canvas.removeEventListener('touchstart', ARCADE._onTouch);
  ARCADE.canvas.removeEventListener('touchmove', ARCADE._onTouch);
  window.removeEventListener('resize', ARCADE._onResize);
  document.removeEventListener('visibilitychange', ARCADE._onVis);
  ARCADE._onKey = ARCADE._onMove = ARCADE._onTouch = ARCADE._onResize = ARCADE._onVis = null;
  ARCADE.el.classList.remove('arc-live');
  document.body.classList.remove('arcade-open');
  try {
    if (typeof lastTime !== 'undefined') lastTime = performance.now();
    if (typeof _pageHidden !== 'undefined') _pageHidden = document.hidden;
  } catch (e) {}
};

ARCADE.startRound = function () {
  if (!ARCADE.isOpenFlag) ARCADE.open();
  ARCADE.hideTitle();
  ARCADE.game.start();
};

// ── Entry points ───────────────────────────────────────────────────────────
RAMEN.on('interact', function (d) {
  if (!d || !d.arcade) return;
  // handleClick shows the fact card right after this hook returns, so clear it on the way in.
  setTimeout(function () {
    if (typeof hideInteractCard === 'function') hideInteractCard();
    ARCADE.open();
  }, 120);
});

document.addEventListener('keydown', function (e) {
  if (e.key !== 'p' && e.key !== 'P') return;
  if (ARCADE.isOpenFlag) return;
  if (['INPUT', 'TEXTAREA', 'SELECT'].indexOf(document.activeElement && document.activeElement.tagName) >= 0) return;
  const busy = ['panel-overlay', 'menu-overlay', 'kb-overlay'].some(function (id) {
    const el = document.getElementById(id); return el && el.classList.contains('active');
  });
  if (busy) return;
  if (typeof inside !== 'undefined' && !inside) return;
  ARCADE.open();
});

(function chip() {
  const host = document.getElementById('inside-ui');
  if (!host) return;
  const b = document.createElement('button');
  b.id = 'arcade-chip'; b.type = 'button';
  b.setAttribute('aria-label', 'Play Noodle Catch');
  b.innerHTML = '<span aria-hidden="true">遊</span> Arcade';
  b.addEventListener('click', function () { ARCADE.open(); });
  host.appendChild(b);
})();

// ── Test API ───────────────────────────────────────────────────────────────
RAMEN.arcade = {
  open: function () { ARCADE.open(); },
  close: function () { ARCADE.close(); },
  isOpen: function () { return !!ARCADE.isOpenFlag; },
  start: function () { ARCADE.startRound(); },
  isRunning: function () { return !!(ARCADE.game && ARCADE.game.isRunning()); },
  highScore: function () { return ARCADE.best; },
};
