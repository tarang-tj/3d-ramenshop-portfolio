// Night Shift stamp rally UI: stamp card DOM, hanko stamp animation, finale. Injects its own DOM.
// Lane-owned file (see plans/260913-2217-ramen-levelup/wave-manifest.md). Classic script; shares the global scope.
//
// The card is a paper slip in the bottom-left corner of the shop, collapsed to a tab until the visitor
// wants it. Outside the shop it shrinks to a progress pill beside the chapter rail. All styles live in
// css/quest.css; this file only builds and updates nodes.
(function () {
  'use strict';
  if (!window.QUEST) return;
  var Q = window.QUEST;

  var root = null, tab = null, body = null, grid = null, bonus = null, count = null, pill = null;
  var open = false;
  var shakeTimer = null;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function build() {
    root = document.createElement('div');
    root.id = 'quest-card';
    root.className = 'quest-card';
    root.innerHTML =
      '<button type="button" class="quest-tab" id="quest-tab" aria-expanded="false" aria-controls="quest-body">' +
        '<span class="quest-tab-jp">スタンプ</span><span class="quest-count" id="quest-count">0/8</span>' +
      '</button>' +
      '<div class="quest-body" id="quest-body" hidden>' +
        '<div class="quest-head"><span class="quest-head-jp">スタンプラリー</span><span class="quest-head-en">Stamp rally</span></div>' +
        '<p class="quest-lede">Sit at every stool and inspect the bowls. Eight stamps, eight projects.</p>' +
        '<div class="quest-grid" id="quest-grid"></div>' +
        '<div class="quest-bonus" id="quest-bonus"></div>' +
        '<div class="quest-foot"><span class="quest-key">G closes this card</span>' +
        '<button type="button" class="quest-reset" id="quest-reset">Reset rally</button></div>' +
      '</div>';
    document.body.appendChild(root);

    pill = document.createElement('div');
    pill.id = 'quest-pill';
    pill.className = 'quest-pill';
    pill.setAttribute('aria-hidden', 'true');
    pill.textContent = 'スタンプ 0/8';
    document.body.appendChild(pill);

    grid = root.querySelector('#quest-grid');
    bonus = root.querySelector('#quest-bonus');
    count = root.querySelector('#quest-count');
    tab = root.querySelector('#quest-tab');
    body = root.querySelector('#quest-body');

    tab.addEventListener('click', toggle);
    root.querySelector('#quest-reset').addEventListener('click', function () {
      RAMEN.quest.reset();
      if (typeof srAnnounce === 'function') srAnnounce('Stamp rally reset. No stamps collected.');
    });

    Q.DEFS.forEach(function (d) {
      var el = document.createElement('button');
      el.type = 'button';
      el.className = 'quest-slot' + (d.kind === 'bonus' ? ' is-bonus' : '');
      el.dataset.id = d.id;
      el.innerHTML =
        '<span class="quest-hanko" aria-hidden="true">' + esc(d.kanji) + '</span>' +
        '<span class="quest-slot-num" aria-hidden="true">' + esc(d.num) + '</span>' +
        '<span class="quest-slot-name">' + esc(d.title) + '</span>';
      el.addEventListener('click', function () {
        if (d.kind === 'course') RAMEN.quest.openCourse(d.id);
      });
      (d.kind === 'bonus' ? bonus : grid).appendChild(el);
    });
    render();
  }

  function render() {
    if (!root) return;
    var have = Q.st.stamps;
    var n = Q.courseCount();
    var label = n + '/8';
    count.textContent = label;
    pill.textContent = 'スタンプ ' + label;
    pill.classList.toggle('is-full', n >= 8);
    root.classList.toggle('is-complete', Q.isComplete());
    Q.DEFS.forEach(function (d) {
      var el = root.querySelector('.quest-slot[data-id="' + d.id + '"]');
      if (!el) return;
      var got = have.indexOf(d.id) >= 0;
      el.classList.toggle('stamped', got);
      el.setAttribute('aria-label', d.title + (got ? ', collected. ' + d.one : ', not collected yet'));
      if (!got) el.classList.remove('thunk');
    });
  }

  function setOpen(next) {
    if (!root) return;
    open = next;
    body.hidden = !open;
    root.classList.toggle('open', open);
    tab.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  function toggle() { setOpen(!open); }

  // Short wooden knock: a stamp hitting paper. Silent unless the visitor turned sound on.
  function thunkSound() {
    try {
      if (typeof audioCtx === 'undefined' || !audioCtx || !soundEnabled) return;
      var now = audioCtx.currentTime;
      var osc = audioCtx.createOscillator(), g = audioCtx.createGain(), f = audioCtx.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = 900;
      osc.connect(f); f.connect(g); g.connect(audioCtx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.09);
      g.gain.setValueAtTime(0.09, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.start(now); osc.stop(now + 0.18);
    } catch (e) { /* audio is a nicety, never a requirement */ }
  }

  function onStamp(def, opts) {
    render();
    if (!root) return;
    var el = root.querySelector('.quest-slot[data-id="' + def.id + '"]');
    if (el) { el.classList.remove('thunk'); void el.offsetWidth; el.classList.add('thunk'); }
    root.classList.remove('shake'); void root.offsetWidth; root.classList.add('shake');
    clearTimeout(shakeTimer);
    shakeTimer = setTimeout(function () { root && root.classList.remove('shake'); }, 420);
    thunkSound();

    var read = def.kind === 'course'
      ? '<button type="button" class="quest-toast-link" onclick="RAMEN.quest.openCourse(\'' + def.id + '\')">Read the course</button>'
      : '';
    var n = Q.courseCount();
    var sub = def.kind === 'course' ? 'Stamp ' + n + ' of 8' : 'Bonus stamp';
    if (typeof showToast === 'function') {
      showToast(def.kanji, '<strong>' + esc(def.title) + '</strong><br>' + esc(def.one) + read, sub);
    }
    if (typeof srAnnounce === 'function') {
      srAnnounce('Stamp collected: ' + def.title + '. ' + def.one + '. ' + sub + '.');
    }
    if (opts && opts.source === 'hotspot' && !open && def.kind === 'course') {
      // A quiet nudge toward the card without stealing the visitor's click.
      root.classList.add('nudge');
      setTimeout(function () { root && root.classList.remove('nudge'); }, 1200);
    }
  }

  function onEnter() {
    if (Q.onboarded) return;
    Q.markOnboarded();
    setTimeout(function () {
      if (typeof showToast === 'function') {
        showToast('印', 'Stamp rally: sit at every stool and inspect the bowls to collect 8 stamps.', 'Press G for your card');
      }
      if (typeof srAnnounce === 'function') {
        srAnnounce('Stamp rally available. Sit at every stool and inspect the bowls to collect 8 stamps. Press G to open your stamp card.');
      }
    }, 1600);
  }
  function onExit() { setOpen(false); }

  document.addEventListener('keydown', function (e) {
    if (['INPUT', 'TEXTAREA', 'SELECT'].indexOf(document.activeElement && document.activeElement.tagName) >= 0) return;
    var busy = ['panel-overlay', 'menu-overlay', 'kb-overlay'].some(function (id) {
      var el = document.getElementById(id); return el && el.classList.contains('active');
    });
    if ((e.key === 'g' || e.key === 'G') && !busy) { e.preventDefault(); toggle(); return; }
    if (e.key === 'Escape') {
      // Only swallow Escape when this layer actually had something open.
      if (Q.finale && Q.finale.isOpen && Q.finale.isOpen()) { e.preventDefault(); Q.finale.dismiss(); return; }
      if (open) { e.preventDefault(); setOpen(false); }
    }
  });

  build();
  Q.ui = { onStamp: onStamp, onEnter: onEnter, onExit: onExit, render: render, open: function () { setOpen(true); }, close: function () { setOpen(false); }, toggle: toggle, isOpen: function () { return open; } };
})();
