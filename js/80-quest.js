// Night Shift stamp rally: quest state, course definitions, stamping logic, persistence. Exposes RAMEN.quest.
// Lane-owned file (see plans/260913-2217-ramen-levelup/wave-manifest.md). Classic script; shares the global scope.
//
// The quest never gates content. Every panel, lantern and quick link stays one click away; collecting
// stamps is a reward layer laid on top of the shop. 81-quest-ui.js draws the card, 82-quest-finale.js
// runs the finale and drone mode. Both register themselves on the QUEST object defined here.
(function () {
  'use strict';

  var KEY = 'ramen.quest.v1';

  // The eight courses that count, in service order, plus the bonus stamps. Facts here are ledger-true
  // and must not grow: one title, one line, nothing else.
  var DEFS = [
    { id: 'ragproof',           num: '一', kanji: '証', title: 'ragproof',           one: 'Open-source RAG evaluation harness, 54 tests, Docker, green CI',    kind: 'course', hit: 'seat0' },
    { id: 'syllabusai',         num: '二', kanji: '暦', title: 'SyllabusAI',         one: 'Syllabus to calendar in seconds, live at syllabusai.net',           kind: 'course', hit: 'seat1' },
    { id: 'autoappli',          num: '三', kanji: '職', title: 'AutoAppli',          one: 'AI job-application platform: tailoring, outreach drafts, kanban',   kind: 'course', hit: 'seat2' },
    { id: 'ptcg',               num: '四', kanji: '戦', title: 'Pokemon TCG agent',  one: 'Pokemon TCG AI Battle Challenge, 245 of 6,807 on Kaggle (top 3.60%)', kind: 'course', hit: 'seat3' },
    { id: 'orchestrate-router', num: '五', kanji: '報', title: 'Notification Router', one: 'Message Notification Router, 14th of 1,983 at HackerRank Orchestrate', kind: 'course', hit: 'seat4' },
    { id: 'model-sentinel',     num: '六', kanji: '番', title: 'Model Sentinel',     one: 'Production ML guardian over DataHub lineage, Apache-2.0',           kind: 'course', hit: 'seat5' },
    { id: 'economic-pulse',     num: '七', kanji: '脈', title: 'Economic Pulse',     one: 'Live FRED macro tracker with rolling regression',                   kind: 'course', hit: 'bowl0' },
    { id: 'ramen-portfolio',    num: '八', kanji: '麺', title: 'This ramen shop',    one: 'This shop: hand-written Three.js, no frameworks, no build step',    kind: 'course', hit: 'bowl1' },
    { id: 'tama-approved', num: '猫', kanji: '猫', title: 'Tama approved',  one: 'The shop cat let you pet her. That counts for something.', kind: 'bonus', hit: 'cat' },
    { id: 'night-shift',   num: '時', kanji: '時', title: 'Night shift',    one: 'You checked the clock. The broth has been on since 5am.',  kind: 'bonus', hit: 'clock' },
    { id: 'chefs-tasting', num: '味', kanji: '味', title: "Chef's tasting", one: 'You looked into all three bowls, salt included.',           kind: 'bonus', hit: 'bowl2' },
    { id: 'regular',       num: '常', kanji: '常', title: 'Regular',        one: 'You read every room in the shop.',                          kind: 'bonus', hit: 'panels' }
  ];

  var COURSE_IDS = DEFS.filter(function (d) { return d.kind === 'course'; }).map(function (d) { return d.id; });
  var BY_ID = {};
  DEFS.forEach(function (d) { BY_ID[d.id] = d; });

  var PANELS = ['projects', 'experience', 'skills', 'contact'];

  var st = { stamps: [], panels: [], startedAt: null, completedAt: null, onboarded: false };
  var timers = [];

  function later(fn, ms) {
    var h = setTimeout(function () {
      var i = timers.indexOf(h); if (i >= 0) timers.splice(i, 1);
      fn();
    }, ms);
    timers.push(h);
    return h;
  }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return;
      var p = JSON.parse(raw);
      if (!p || typeof p !== 'object') return;
      st.stamps = (p.stamps || []).filter(function (id) { return !!BY_ID[id]; });
      st.panels = (p.panels || []).filter(function (x) { return PANELS.indexOf(x) >= 0; });
      st.startedAt = p.startedAt || null;
      st.completedAt = p.completedAt || null;
      st.onboarded = !!p.onboarded;
    } catch (e) { /* private mode or blocked storage: run the rally in memory */ }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* nothing to do */ }
  }

  function isComplete() {
    return COURSE_IDS.every(function (id) { return st.stamps.indexOf(id) >= 0; });
  }
  function courseCount() {
    return st.stamps.filter(function (id) { return BY_ID[id] && BY_ID[id].kind === 'course'; }).length;
  }

  function publicState() {
    return {
      stamps: st.stamps.slice(),
      complete: isComplete(),
      startedAt: st.startedAt,
      completedAt: st.completedAt
    };
  }

  // The single code path every stamp travels, whether it came from a 3D hotspot or the test API.
  function stamp(id, opts) {
    var def = BY_ID[id];
    if (!def) return false;
    if (st.stamps.indexOf(id) >= 0) return false;
    if (!st.startedAt) st.startedAt = Date.now();
    st.stamps.push(id);
    var wasComplete = !!st.completedAt;
    if (!wasComplete && isComplete()) st.completedAt = Date.now();
    save();
    if (QUEST.ui && QUEST.ui.onStamp) { try { QUEST.ui.onStamp(def, opts || {}); } catch (e) { /* UI is optional */ } }
    if (!wasComplete && st.completedAt) {
      later(function () {
        if (QUEST.finale && QUEST.finale.play) { try { QUEST.finale.play(); } catch (e) { /* finale is optional */ } }
      }, 300);
    }
    return true;
  }

  function reset() {
    clearTimers();
    // Mutated in place: 81 and 82 hold a reference to this object.
    st.stamps.length = 0; st.panels.length = 0;
    st.startedAt = null; st.completedAt = null; st.onboarded = false;
    try { localStorage.removeItem(KEY); } catch (e) { /* nothing to do */ }
    if (QUEST.finale && QUEST.finale.stop) { try { QUEST.finale.stop(); } catch (e) { /* optional */ } }
    if (QUEST.ui && QUEST.ui.render) { try { QUEST.ui.render(); } catch (e) { /* optional */ } }
  }

  // Deep link from a stamp into the matching case study. The content lane adds the project-<slug> ids;
  // when one is missing the panel still opens, just without the scroll.
  function openCourse(id) {
    if (typeof openPanel !== 'function') return;
    openPanel('projects');
    later(function () {
      var card = document.querySelector('.panel-card');
      var target = card && card.querySelector('#project-' + id);
      if (target && target.scrollIntoView) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 450);
  }

  // One busy test for every quest key. A reading surface, a dialog or the certificate all mean
  // the quest layer keeps its hands off the keyboard.
  function busy() {
    var ids = ['panel-overlay', 'menu-overlay', 'kb-overlay', 'omikuji-overlay'];
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el && el.classList.contains('active')) return true;
    }
    if (document.getElementById('quest-finale')) return true;
    var tag = document.activeElement && document.activeElement.tagName;
    return ['INPUT', 'TEXTAREA', 'SELECT'].indexOf(tag) >= 0;
  }

  var QUEST = {
    KEY: KEY,
    busy: busy,
    DEFS: DEFS,
    BY_ID: BY_ID,
    COURSE_IDS: COURSE_IDS,
    st: st,
    ui: null,
    finale: null,
    stamp: stamp,
    save: save,
    later: later,
    courseCount: courseCount,
    isComplete: isComplete,
    state: publicState,
    get onboarded() { return st.onboarded; },
    markOnboarded: function () { st.onboarded = true; save(); }
  };
  window.QUEST = QUEST;

  load();
  QUEST.st = st;

  // ── Hotspot wiring: observe, never intercept. Seats still seat you, bowls still open. ──
  RAMEN.on('interact', function (d) {
    if (!d || !d.type) return;
    var hit = d.type === 'seat' ? 'seat' + d.seatIdx
      : d.type === 'bowl' ? 'bowl' + d.bowlIdx
      : d.type === 'cat' ? 'cat'
      : d.type === 'clock' ? 'clock' : null;
    if (!hit) return;
    for (var i = 0; i < DEFS.length; i++) {
      if (DEFS[i].hit === hit) { stamp(DEFS[i].id, { source: 'hotspot' }); return; }
    }
  });

  RAMEN.on('panel', function (e) {
    var p = e && e.panel;
    if (PANELS.indexOf(p) < 0) return;
    if (st.panels.indexOf(p) < 0) { st.panels.push(p); save(); }
    if (st.panels.length >= PANELS.length) stamp('regular', { source: 'panels' });
  });

  RAMEN.on('enter', function () {
    if (QUEST.ui && QUEST.ui.onEnter) { try { QUEST.ui.onEnter(); } catch (e) { /* optional */ } }
  });
  RAMEN.on('exit', function () {
    if (QUEST.ui && QUEST.ui.onExit) { try { QUEST.ui.onExit(); } catch (e) { /* optional */ } }
  });

  // ── Public test and console API ──
  RAMEN.quest = {
    courses: function () {
      return DEFS.map(function (d) { return { id: d.id, title: d.title, one: d.one, kind: d.kind }; });
    },
    state: publicState,
    stamp: function (id) { return stamp(id, { source: 'api' }); },
    reset: reset,
    open: function () { if (QUEST.ui && QUEST.ui.open) QUEST.ui.open(); },
    close: function () { if (QUEST.ui && QUEST.ui.close) QUEST.ui.close(); },
    toggle: function () { if (QUEST.ui && QUEST.ui.toggle) QUEST.ui.toggle(); },
    openCourse: openCourse
  };
})();
