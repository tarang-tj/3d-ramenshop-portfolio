// Noodle Catch: the round itself. One requestAnimationFrame loop, alive only while the cabinet
// overlay is open and either the attract screen or a round is on. Classic script, shared globals.

ARCADE.game = (function () {
  const LW = ARCADE.LW, LH = ARCADE.LH;
  const FLOOR = 424;

  const TYPES = [
    { k: '卵',   tag: '卵',   name: 'egg',    skill: 'Python',         c: '#f2cf72', ink: '#3a2408' },
    { k: '海苔', tag: '海',   name: 'nori',   skill: 'SQL',            c: '#44684f', ink: '#eef6ea' },
    { k: 'チャ', tag: 'チャ', name: 'chashu', skill: 'TypeScript',     c: '#c86a3e', ink: '#2a1205' },
    { k: 'ネギ', tag: 'ネ',   name: 'negi',   skill: 'Claude API',     c: '#84b24a', ink: '#1d2a0c' },
    { k: 'なると', tag: 'な', name: 'naruto', skill: 'RAG evaluation', c: '#f4ece0', ink: '#b83a52' },
    { k: 'メンマ', tag: 'メ', name: 'menma',  skill: 'Three.js',       c: '#c9a45a', ink: '#2e2007' },
  ];

  const G = {
    mode: 'idle', raf: 0, last: 0, clock: 0,
    items: [], bowlX: LW / 2, bowlTX: LW / 2,
    score: 0, combo: 0, bestCombo: 0, lives: 3, catches: 0,
    tally: {}, tLeft: 45, plate: 0, plateIdx: 0, spawn: 0.7, shake: 0, stats: null,
    hold: { l: false, r: false },
  };

  const clamp = function (v, a, b) { return v < a ? a : (v > b ? b : v); };
  const ctx2 = function () { return ARCADE.ctx; };

  function reset() {
    G.items.length = 0;
    G.bowlX = G.bowlTX = LW / 2;
    G.score = 0; G.combo = 0; G.bestCombo = 0; G.lives = 3; G.catches = 0;
    G.tally = {}; TYPES.forEach(function (t) { G.tally[t.skill] = 0; });
    G.tLeft = 45; G.plate = 0; G.plateIdx = 0; G.spawn = 0.6; G.shake = 0;
    G.hold.l = G.hold.r = false;
  }

  function loop(ts) {
    const dt = G.last ? Math.min(0.05, (ts - G.last) / 1000) : 0.016;
    G.last = ts; G.clock += dt;
    try {
      if (G.mode === 'title') attract(dt);
      else if (G.mode === 'play') { step(dt); if (G.mode === 'play') render(); }
    } catch (e) {
      G.mode = 'idle';   // one bad frame ends the round instead of wedging the loop
    }
    G.raf = (G.mode === 'title' || G.mode === 'play') ? requestAnimationFrame(loop) : 0;
  }
  // Always cancel and reschedule: a stale id must never leave the round unable to start.
  function spin() { if (G.raf) cancelAnimationFrame(G.raf); G.last = 0; G.raf = requestAnimationFrame(loop); }
  function halt() { if (G.raf) cancelAnimationFrame(G.raf); G.raf = 0; }

  // ── attract screen behind the title card ────────────────────────────────
  const drifters = [];
  function attract(dt) {
    const c = ctx2(); if (!c) return;
    if (!drifters.length) {
      for (let i = 0; i < 9; i++) drifters.push({ x: 40 + Math.random() * (LW - 80), y: Math.random() * LH, v: 34 + Math.random() * 46, t: i % TYPES.length });
    }
    backdrop(c);
    for (const d of drifters) {
      d.y += d.v * dt; if (d.y > LH + 24) { d.y = -24; d.x = 40 + Math.random() * (LW - 80); }
      piece(c, TYPES[d.t], d.x, d.y, 0.55);
    }
    bowl(c, LW / 2 + Math.sin(G.clock * 0.9) * 130, 0.85);
  }

  // ── round ───────────────────────────────────────────────────────────────
  function spawnOne() {
    const bug = Math.random() < 0.16;
    G.items.push({
      x: 44 + Math.random() * (LW - 88), y: -26,
      v: 152 + (45 - G.tLeft) * 2.3 + Math.random() * 46,
      w: (Math.random() - 0.5) * 1.2, bug: bug,
      t: bug ? null : TYPES[(Math.random() * TYPES.length) | 0],
    });
  }

  function step(dt) {
    if (G.plate > 0) { G.plate -= dt; return; }
    G.tLeft -= dt;
    if (G.tLeft <= 0) { G.tLeft = 0; finish(); return; }
    ARCADE.setHud(Math.ceil(G.tLeft) + 's left');

    const dir = (G.hold.r ? 1 : 0) - (G.hold.l ? 1 : 0);
    if (dir) G.bowlTX += dir * 440 * dt;
    G.bowlTX = clamp(G.bowlTX, 54, LW - 54);
    G.bowlX += (G.bowlTX - G.bowlX) * Math.min(1, dt * 15);
    if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 3.2);

    G.spawn -= dt;
    if (G.spawn <= 0) { spawnOne(); G.spawn = Math.max(0.26, 0.66 - (45 - G.tLeft) * 0.007) + Math.random() * 0.3; }

    for (let i = G.items.length - 1; i >= 0; i--) {
      const it = G.items[i];
      it.y += it.v * dt; it.x += it.w;
      if (it.x < 26 || it.x > LW - 26) it.w *= -1;
      if (it.y > FLOOR - 34 && it.y < FLOOR + 12 && Math.abs(it.x - G.bowlX) < 54) {
        G.items.splice(i, 1); it.bug ? hitBug() : hitCatch(it.t);
      } else if (it.y > LH + 30) {
        G.items.splice(i, 1);
        if (!it.bug) { G.combo = 0; }
      }
    }
  }

  function hitCatch(t) {
    const mult = Math.min(5, 1 + Math.floor(G.combo / 3));
    G.score += 10 * mult;
    G.combo++; if (G.combo > G.bestCombo) G.bestCombo = G.combo;
    G.catches++; G.tally[t.skill]++;
    ARCADE.blip(520 + Math.min(8, G.combo) * 42, 0.07, 'square', 0.028);
    if (G.catches % 5 === 0) {
      G.plate = 1.6;
      G.plateIdx = ((G.catches / 5) - 1) % ARCADE.cards.projects.length;
      ARCADE.blip(880, 0.16, 'triangle', 0.03);
    }
  }
  function hitBug() {
    G.lives--; G.combo = 0;
    if (!ARCADE.reduced) G.shake = 1;
    ARCADE.blip(140, 0.2, 'sawtooth', 0.035);
    if (G.lives <= 0) finish();
  }

  function finish() {
    G.mode = 'over';
    if (G.score > ARCADE.best) { ARCADE.best = G.score; ARCADE.saveBest(G.score); }
    ARCADE.setHud('Round over');
    render();
    G.stats = {
      score: G.score, best: ARCADE.best, tally: G.tally,
      bestCombo: G.bestCombo, lives: G.lives, types: TYPES,
    };
    ARCADE.cards.results(ctx2(), G.stats);
    ARCADE.showActions();
    halt();
  }

  // ── drawing ─────────────────────────────────────────────────────────────
  function backdrop(c) {
    const g = c.createLinearGradient(0, 0, 0, LH);
    g.addColorStop(0, '#1a1006'); g.addColorStop(0.7, '#271607'); g.addColorStop(1, '#38200b');
    c.fillStyle = g; c.fillRect(0, 0, LW, LH);
    c.strokeStyle = 'rgba(240,192,96,0.13)'; c.lineWidth = 1;
    for (let x = 0; x <= LW; x += 40) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, LH); c.stroke(); }
    c.fillStyle = 'rgba(139,26,26,0.4)'; c.fillRect(0, FLOOR + 20, LW, LH - FLOOR - 20);
    c.fillStyle = 'rgba(240,192,96,0.3)'; c.fillRect(0, FLOOR + 20, LW, 2);
  }

  function piece(c, t, x, y, s) {
    s = s || 1;
    c.save(); c.translate(x, y); c.scale(s, s);
    c.shadowColor = 'rgba(240,192,96,0.55)'; c.shadowBlur = 12;
    c.fillStyle = t.c;
    c.beginPath();
    if (t.name === 'nori') c.rect(-16, -13, 32, 26);
    else c.arc(0, 0, 16, 0, Math.PI * 2);
    c.fill();
    c.shadowBlur = 0;
    c.strokeStyle = 'rgba(255,238,200,0.6)'; c.lineWidth = 2; c.stroke();
    if (t.name === 'naruto') {
      c.strokeStyle = '#b83a52'; c.lineWidth = 2.4;
      c.beginPath(); c.arc(0, 0, 7, 0, Math.PI * 1.7); c.stroke();
    }
    c.fillStyle = t.ink; c.font = 'bold 12px "Noto Serif JP", Georgia, serif';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(t.tag, 0, 1);
    c.restore();
  }

  function bug(c, x, y) {
    c.save(); c.translate(x, y);
    c.font = '26px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('🐛', 0, 0);
    c.restore();
  }

  function bowl(c, x, s) {
    s = s || 1;
    c.save(); c.translate(x, FLOOR); c.scale(s, s);
    c.shadowColor = 'rgba(240,192,96,0.7)'; c.shadowBlur = 16;
    c.fillStyle = '#f6ecd6';
    c.beginPath(); c.moveTo(-54, 0); c.quadraticCurveTo(0, 58, 54, 0); c.closePath(); c.fill();
    c.shadowBlur = 0;
    c.fillStyle = '#8b1a1a'; c.fillRect(-54, -9, 108, 9);
    c.fillStyle = '#f0c060'; c.fillRect(-54, -11, 108, 2);
    c.fillStyle = '#2a1508'; c.font = 'bold 15px "Noto Serif JP", Georgia, serif';
    c.textAlign = 'center'; c.fillText('麺', 0, 24);
    c.restore();
  }

  function render() {
    const c = ctx2(); if (!c) return;
    c.save();
    if (G.shake > 0) c.translate((Math.random() - 0.5) * 8 * G.shake, (Math.random() - 0.5) * 6 * G.shake);
    backdrop(c);
    for (const it of G.items) { it.bug ? bug(c, it.x, it.y) : piece(c, it.t, it.x, it.y, 1); }
    bowl(c, G.bowlX, 1);
    hud(c);
    c.restore();
    if (G.plate > 0) ARCADE.cards.plate(c, G.plateIdx, G.plate);
  }

  function hud(c) {
    c.fillStyle = '#f0c060';
    c.font = 'bold 20px Georgia, serif'; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    c.fillText(String(G.score), 16, 30);
    c.font = '11px Georgia, serif'; c.fillStyle = '#e8922a';
    c.fillText('SCORE', 16, 44);
    c.textAlign = 'center'; c.fillStyle = '#f0c060'; c.font = 'bold 18px Georgia, serif';
    c.fillText(Math.ceil(G.tLeft) + 's', LW / 2, 30);
    if (G.combo > 2) {
      c.fillStyle = '#f5d98a'; c.font = 'bold 13px Georgia, serif';
      c.fillText('combo x' + Math.min(5, 1 + Math.floor(G.combo / 3)), LW / 2, 50);
    }
    c.textAlign = 'right'; c.font = '15px Georgia, serif'; c.fillStyle = '#e8922a';
    c.fillText('🍜'.repeat(Math.max(0, G.lives)), LW - 16, 40);
  }

  // ── API used by 85-arcade.js ────────────────────────────────────────────
  return {
    enterTitle: function () { G.mode = 'title'; G.clock = 0; spin(); },
    start: function () { reset(); G.mode = 'play'; ARCADE.setHud('45s left'); spin(); },
    stop: function () { halt(); G.mode = 'idle'; G.items.length = 0; },
    isRunning: function () { return G.mode === 'play'; },
    aim: function (x) { if (G.mode === 'play') G.bowlTX = clamp(x, 54, LW - 54); },
    hold: function (dir, down) { if (dir < 0) G.hold.l = !!down; else G.hold.r = !!down; },
    // The loop is stopped once a round is over, so a resize has to repaint the results itself.
    repaint: function () { if (G.mode === 'over' && G.stats) ARCADE.cards.results(ctx2(), G.stats); },
    suspend: function () { halt(); },
    wake: function () { if (G.mode === 'title' || G.mode === 'play') spin(); },
    types: TYPES,
    debug: function () { return { mode: G.mode, raf: G.raf, t: Math.round(G.tLeft * 10) / 10, n: G.items.length, sc: G.score, bx: Math.round(G.bowlX) }; },
  };
})();
