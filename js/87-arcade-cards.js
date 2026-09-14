// Noodle Catch: the project card that plates every fifth catch, and the end-of-round results screen.
// Drawn straight onto the game canvas. Classic script, shared global scope.

ARCADE.cards = (function () {
  const LW = ARCADE.LW, LH = ARCADE.LH;

  const projects = [
    ['ragproof', 'RAG evaluation harness, 54 tests, Docker, green CI'],
    ['SyllabusAI', 'syllabus to calendar in seconds, live at syllabusai.net'],
    ['AutoAppli', 'AI job-application platform: tailoring, outreach drafts, kanban'],
    ['Pokemon TCG AI Battle Challenge', '245 of 6,807 on Kaggle, top 3.60%'],
    ['Message Notification Router', '14th of 1,983 at HackerRank Orchestrate'],
    ['Model Sentinel', 'production ML guardian over DataHub lineage'],
    ['Economic Pulse', 'live FRED macro tracker with rolling regression'],
    ['this portfolio', 'hand-written Three.js, no frameworks, no build step'],
  ];

  function wrap(c, text, x, y, maxW, lh) {
    const words = String(text).split(' ');
    let line = '';
    for (let i = 0; i < words.length; i++) {
      const test = line ? line + ' ' + words[i] : words[i];
      if (c.measureText(test).width > maxW && line) { c.fillText(line, x, y); y += lh; line = words[i]; }
      else line = test;
    }
    if (line) c.fillText(line, x, y);
    return y + lh;
  }

  function plate(c, idx, remaining) {
    const p = projects[idx % projects.length];
    const w = 420, h = 150, x = (LW - w) / 2, y = 130;
    const a = Math.min(1, remaining * 3.4);
    c.save();
    c.globalAlpha = a;
    c.fillStyle = 'rgba(8,4,1,0.93)'; c.fillRect(x, y, w, h);
    c.strokeStyle = '#e8922a'; c.lineWidth = 2; c.strokeRect(x, y, w, h);
    c.fillStyle = '#8a6a3a'; c.font = '10px Georgia, serif'; c.textAlign = 'left';
    c.fillText('PLATED', x + 18, y + 26);
    c.fillStyle = '#f0c060'; c.font = 'bold 19px "Noto Serif JP", Georgia, serif';
    c.fillText(p[0], x + 18, y + 52);
    c.fillStyle = '#e8d5b0'; c.font = '13px Georgia, serif';
    wrap(c, p[1], x + 18, y + 80, w - 36, 19);
    c.fillStyle = '#e8922a'; c.fillRect(x, y + h - 3, w * Math.min(1, remaining / 1.6), 3);
    c.restore();
  }

  function results(c, s) {
    // At phone widths the canvas scales down hard, so a 12 px label lands near 6 CSS px.
    // Below that threshold the rows stack and the type grows to stay readable.
    const narrow = (ARCADE.scale || 1) < 0.8;
    c.save();
    c.fillStyle = '#0a0603'; c.fillRect(0, 0, LW, LH);
    c.textAlign = 'center';
    c.fillStyle = '#8a6a3a'; c.font = (narrow ? '17px' : '11px') + ' Georgia, serif';
    c.fillText(s.lives > 0 ? 'TIME UP' : 'THE BUGS WON', LW / 2, narrow ? 30 : 44);
    c.fillStyle = '#f0c060'; c.font = 'bold ' + (narrow ? '42px' : '46px') + ' Georgia, serif';
    c.fillText(String(s.score), LW / 2, narrow ? 78 : 92);
    c.fillStyle = '#e8922a'; c.font = (narrow ? '18px' : '12px') + ' Georgia, serif';
    c.fillText('best ' + s.best + '   ·   longest combo ' + s.bestCombo, LW / 2, narrow ? 100 : 114);

    let max = 1;
    for (const t of s.types) max = Math.max(max, s.tally[t.skill] || 0);
    c.textAlign = 'left';
    if (narrow) stacked(c, s, max); else table(c, s, max);

    // The action buttons sit over the bottom of the canvas, so the caption only fits wide.
    if (!narrow) {
      c.textAlign = 'center';
      c.fillStyle = '#8a6a3a'; c.font = '11px Georgia, serif';
      c.fillText('Each topping is something TJ builds with.', LW / 2, 374);
    }
    c.restore();
  }

  function table(c, s, max) {
    c.fillStyle = '#8a6a3a'; c.font = '10px Georgia, serif';
    c.fillText('WHAT YOU CAUGHT', 92, 146);
    const top = 160, rowH = 30, barX = 250, barW = 282;
    s.types.forEach(function (t, i) {
      const y = top + i * rowH, n = s.tally[t.skill] || 0;
      c.fillStyle = '#e8d5b0'; c.font = '13px "Noto Serif JP", Georgia, serif';
      c.fillText(t.k, 92, y + 14);
      c.fillStyle = '#c8b08a'; c.font = '12px Georgia, serif';
      c.fillText(t.skill, 156, y + 14);
      bar(c, t, n, max, barX, y + 3, barW, 14, '12px');
    });
  }

  function stacked(c, s, max) {
    const top = 112, rowH = 44, barX = 48, barW = LW - 168;
    s.types.forEach(function (t, i) {
      const y = top + i * rowH, n = s.tally[t.skill] || 0;
      c.fillStyle = '#e8d5b0'; c.font = '22px "Noto Serif JP", Georgia, serif';
      c.fillText(t.k + '  ' + t.skill, barX, y + 18);
      bar(c, t, n, max, barX, y + 26, barW, 14, '20px');
    });
  }

  function bar(c, t, n, max, x, y, w, h, font) {
    c.fillStyle = 'rgba(232,146,42,0.14)'; c.fillRect(x, y, w, h);
    c.fillStyle = t.c; c.fillRect(x, y, Math.max(n ? 8 : 0, w * (n / max)), h);
    c.fillStyle = '#f0c060'; c.font = 'bold ' + font + ' Georgia, serif';
    c.fillText(String(n), x + w + 10, y + h - 2);
  }

  return { projects: projects, plate: plate, results: results };
})();
