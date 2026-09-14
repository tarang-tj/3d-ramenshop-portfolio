// Night Shift stamp rally finale: fireworks points, kanji confetti, the Regular Customer certificate, drone mode.
// Lane-owned file (see plans/260913-2217-ramen-levelup/wave-manifest.md). Classic script; shares the global scope.
//
// Everything animates off RAMEN.on('frame'); no new rAF loop, no new lights. Reduced-motion visitors get
// the certificate without the moving parts.
(function () {
  'use strict';
  if (!window.QUEST) return;
  var Q = window.QUEST;

  var reduced = false;
  try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { reduced = false; }

  var FW_MAX = 540;
  var points = null, fwPos = null, fwCol = null, fwBase = null, fwVel = null, fwLife = null, fwActive = 0;
  var burstTimer = 0, fireUntil = 0, running = false, elapsed = 0;
  var overlay = null, confetti = null, timers = [];
  var armed = false, celebrated = false, exitHook = null;

  function later(fn, ms) { var h = setTimeout(fn, ms); timers.push(h); return h; }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function ensurePoints() {
    if (points || typeof THREE === 'undefined' || typeof scene === 'undefined') return;
    var geo = new THREE.BufferGeometry();
    fwPos = new Float32Array(FW_MAX * 3);
    fwCol = new Float32Array(FW_MAX * 3);
    fwBase = new Float32Array(FW_MAX * 3);
    fwVel = new Float32Array(FW_MAX * 3);
    fwLife = new Float32Array(FW_MAX);
    for (var i = 0; i < FW_MAX; i++) fwPos[i * 3 + 1] = -9999;
    geo.setAttribute('position', new THREE.BufferAttribute(fwPos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(fwCol, 3));
    var mat = new THREE.PointsMaterial({
      size: 1.5, vertexColors: true, transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false, sizeAttenuation: true
    });
    points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    points.renderOrder = 999;
    points.visible = false;
    scene.add(points);
  }

  var PALETTE = [[1.0, 0.72, 0.30], [0.94, 0.75, 0.38], [0.86, 0.26, 0.18], [1.0, 0.93, 0.72]];

  function burst() {
    if (!points) return;
    var cx = (Math.random() - 0.5) * 76;
    var cy = 27 + Math.random() * 15;
    var cz = -72 - Math.random() * 46;
    var col = PALETTE[(Math.random() * PALETTE.length) | 0];
    var n = 70 + ((Math.random() * 30) | 0);
    for (var k = 0; k < n; k++) {
      var i = fwActive % FW_MAX; fwActive++;
      var th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      var sp = 5.5 + Math.random() * 6.5;
      fwPos[i * 3] = cx; fwPos[i * 3 + 1] = cy; fwPos[i * 3 + 2] = cz;
      fwVel[i * 3] = Math.sin(ph) * Math.cos(th) * sp;
      fwVel[i * 3 + 1] = Math.cos(ph) * sp;
      fwVel[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * sp;
      fwBase[i * 3] = col[0]; fwBase[i * 3 + 1] = col[1]; fwBase[i * 3 + 2] = col[2];
      fwLife[i] = 1;
    }
    points.geometry.attributes.position.needsUpdate = true;
    points.geometry.attributes.color.needsUpdate = true;
  }

  RAMEN.on('frame', function (dt) {
    if (!running || !points) return;
    elapsed += dt;
    if (elapsed < fireUntil) {
      burstTimer -= dt;
      if (burstTimer <= 0) { burst(); burstTimer = 0.45 + Math.random() * 0.45; }
    }
    var alive = 0;
    for (var i = 0; i < FW_MAX; i++) {
      if (fwLife[i] <= 0) continue;
      alive++;
      fwLife[i] -= dt * 0.36;
      var f = Math.max(0, fwLife[i]);
      fwVel[i * 3 + 1] -= 6.4 * dt;
      fwPos[i * 3] += fwVel[i * 3] * dt;
      fwPos[i * 3 + 1] += fwVel[i * 3 + 1] * dt;
      fwPos[i * 3 + 2] += fwVel[i * 3 + 2] * dt;
      var drag = Math.pow(0.92, dt * 60);
      fwVel[i * 3] *= drag; fwVel[i * 3 + 1] *= drag; fwVel[i * 3 + 2] *= drag;
      // Additive blending: fading the color toward black is the fade-out.
      var g = f * f * (0.78 + 0.22 * Math.sin(i + elapsed * 14));
      fwCol[i * 3] = fwBase[i * 3] * g;
      fwCol[i * 3 + 1] = fwBase[i * 3 + 1] * g;
      fwCol[i * 3 + 2] = fwBase[i * 3 + 2] * g;
      if (fwLife[i] <= 0) { fwPos[i * 3 + 1] = -9999; fwCol[i * 3] = fwCol[i * 3 + 1] = fwCol[i * 3 + 2] = 0; }
    }
    points.geometry.attributes.position.needsUpdate = true;
    points.geometry.attributes.color.needsUpdate = true;
    if (elapsed >= fireUntil && alive === 0) { running = false; points.visible = false; }
  });

  function startFireworks() {
    ensurePoints();
    if (!points) return;
    for (var i = 0; i < FW_MAX; i++) { fwLife[i] = 0; fwPos[i * 3 + 1] = -9999; }
    fwActive = 0; elapsed = 0; burstTimer = 0; fireUntil = 8; running = true;
    points.visible = true;
  }
  function stopFireworks() {
    running = false;
    if (points) { points.visible = false; for (var i = 0; i < FW_MAX; i++) { fwLife[i] = 0; fwPos[i * 3 + 1] = -9999; } }
  }

  var CONFETTI_KANJI = ['麺', '印', '祝', '常', '福', '味', '夜', '灯'];
  function startConfetti() {
    stopConfetti();
    confetti = document.createElement('div');
    confetti.className = 'quest-confetti';
    confetti.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 26; i++) {
      var s = document.createElement('span');
      s.textContent = CONFETTI_KANJI[i % CONFETTI_KANJI.length];
      s.style.left = (Math.random() * 98) + '%';
      s.style.animationDelay = (Math.random() * 2.4).toFixed(2) + 's';
      s.style.animationDuration = (3.4 + Math.random() * 2.2).toFixed(2) + 's';
      s.style.fontSize = (0.7 + Math.random() * 1.1).toFixed(2) + 'rem';
      confetti.appendChild(s);
    }
    document.body.appendChild(confetti);
    later(stopConfetti, 6200);
  }
  function stopConfetti() { if (confetti) { confetti.remove(); confetti = null; } }

  function duration() {
    var s = Q.st.startedAt, e = Q.st.completedAt;
    if (!s || !e || e <= s) return 'in one sitting';
    var secs = Math.round((e - s) / 1000);
    if (secs < 5) return 'in one sitting';
    if (secs < 60) return 'in ' + secs + ' seconds';
    var m = Math.floor(secs / 60), r = secs % 60;
    return 'in ' + m + ' minute' + (m === 1 ? '' : 's') + ' ' + r + ' seconds';
  }

  function certificate() {
    removeOverlay();
    overlay = document.createElement('div');
    overlay.id = 'quest-finale';
    overlay.className = 'quest-finale';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Regular Customer certificate');
    var seals = Q.DEFS.filter(function (d) { return d.kind === 'course'; }).map(function (d) {
      return '<span class="quest-cert-seal" title="' + d.title + '">' + d.kanji + '</span>';
    }).join('');
    overlay.innerHTML =
      '<div class="quest-cert">' +
        '<div class="quest-cert-head">常連証 · Regular Customer</div>' +
        '<div class="quest-cert-kanji">満</div>' +
        '<p class="quest-cert-line">All eight courses, ' + duration() + '.</p>' +
        '<div class="quest-cert-seals">' + seals + '</div>' +
        '<p class="quest-cert-note">Thanks for eating the whole menu. The kitchen is open if you want to talk about any of it.</p>' +
        '<div class="quest-cert-actions">' +
          '<button type="button" class="quest-cert-btn primary" id="quest-cert-hello">Say hello</button>' +
          '<button type="button" class="quest-cert-btn" id="quest-cert-copy">Copy link</button>' +
          '<button type="button" class="quest-cert-btn" id="quest-cert-close">Close</button>' +
        '</div>' +
        '<div class="quest-cert-foot" id="quest-cert-foot">Close this and the shop steps out for fireworks. Press V out there for drone mode.</div>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) dismiss(); });
    overlay.querySelector('#quest-cert-hello').addEventListener('click', function () {
      // A visitor heading for the contact panel does not want to be walked outside first.
      armed = false; clearTimers(); removeOverlay();
      if (typeof openPanel === 'function') openPanel('contact');
    });
    overlay.querySelector('#quest-cert-close').addEventListener('click', dismiss);
    overlay.querySelector('#quest-cert-copy').addEventListener('click', function () {
      var btn = this;
      var done = function () { btn.textContent = 'Link copied'; later(function () { btn.textContent = 'Copy link'; }, 2000); };
      try {
        navigator.clipboard.writeText(location.href).then(done, function () { btn.textContent = location.href; });
      } catch (e) { btn.textContent = location.href; }
    });
    var hello = overlay.querySelector('#quest-cert-hello');
    if (hello) { try { hello.focus(); } catch (e) { /* focus is best effort */ } }
    Q.droneUnlocked = true;
    if (typeof srAnnounce === 'function') {
      srAnnounce('Stamp rally complete. Regular Customer certificate earned ' + duration() + '. Drone mode unlocked, press V.');
    }
  }

  function removeOverlay() { if (overlay) { overlay.remove(); overlay = null; } }
  // Closing the certificate is the cue for the celebration, so the visitor is looking at the sky
  // rather than at a card when the fireworks go up.
  function dismiss() {
    removeOverlay();
    if (armed) { armed = false; clearTimers(); celebrate(); }
  }
  function isOpen() { return !!overlay; }

  // Fireworks live over the city, and the city is only visible from the alley. If the visitor is
  // still at the counter, step outside first and launch once the exit transition has landed.
  function celebrate() {
    if (celebrated || reduced) return;
    celebrated = true;
    var launched = false;
    var launch = function () {
      if (launched) return;
      launched = true;
      startFireworks(); startConfetti();
    };
    if (typeof inside !== 'undefined' && inside && typeof exitShop === 'function') {
      var onExit = function () { RAMEN.off('exit', onExit); exitHook = null; later(launch, 260); };
      exitHook = onExit;
      RAMEN.on('exit', onExit);
      exitShop();
      later(launch, 1800); // exitShop refuses while a transition is running; do not lose the finale
    } else {
      launch();
    }
  }

  function play() {
    celebrated = false;
    armed = true;
    later(certificate, reduced ? 60 : 520);
    later(function () { if (armed) dismiss(); }, reduced ? 4000 : 6000);
  }

  function stop() {
    armed = false; celebrated = false;
    if (exitHook) { RAMEN.off('exit', exitHook); exitHook = null; }
    clearTimers(); stopFireworks(); stopConfetti(); removeOverlay();
    if (Q.drone && Q.drone.off) Q.drone.off();
    Q.droneUnlocked = false;
  }


  Q.finale = { play: play, stop: stop, dismiss: dismiss, isOpen: isOpen };

  // A visitor who already finished the rally in an earlier visit keeps drone mode.
  Q.droneUnlocked = Q.droneUnlocked || Q.isComplete();
})();
