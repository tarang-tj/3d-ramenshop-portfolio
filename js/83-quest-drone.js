// Night Shift stamp rally drone mode: the free-fly camera unlocked by finishing the rally.
// Lane-owned file (see plans/260913-2217-ramen-levelup/wave-manifest.md). Classic script; shares the global scope.
//
// Cooperative by design: it takes the camera only through RAMEN.lockCamera('drone') and hands it straight
// back on the way out, so a cinematic or arcade layer that already owns the view is never overridden.
(function () {
  'use strict';
  if (!window.QUEST) return;
  var Q = window.QUEST;
  var droneOn = false;

  var dPos = null, dYaw = 0, dPitch = 0, keys = {}, dragging2 = false, lastPt = { x: 0, y: 0 };
  var _eul = null, _fwd = null, _rgt = null;

  function setDrone(on) {
    if (typeof THREE === 'undefined' || typeof camera === 'undefined') return;
    if (on) {
      if (!RAMEN.lockCamera('drone')) {
        if (typeof showToast === 'function') showToast('待', 'Another view owns the camera right now.', 'Drone mode');
        return;
      }
      dPos = camera.position.clone();
      dYaw = camera.rotation.y; dPitch = camera.rotation.x;
      _eul = _eul || new THREE.Euler(0, 0, 0, 'YXZ');
      _fwd = _fwd || new THREE.Vector3(); _rgt = _rgt || new THREE.Vector3();
      droneOn = true;
      document.body.classList.add('quest-drone');
      RAMEN.cameraOverride = droneFrame;
      if (typeof showToast === 'function') showToast('飛', 'Drone mode on. WASD or arrows to fly, drag to look.', 'Press V to land');
      if (typeof srAnnounce === 'function') srAnnounce('Drone mode on. Use W A S D to fly and drag to look. Press V to land.');
    } else {
      droneOn = false;
      document.body.classList.remove('quest-drone');
      RAMEN.cameraOverride = null;
      RAMEN.unlockCamera('drone');
      keys = {};
      if (typeof srAnnounce === 'function') srAnnounce('Drone mode off.');
    }
  }

  function droneFrame(cam, dt) {
    if (!droneOn || !dPos) return;
    var sp = (keys.shift ? 26 : 12) * Math.min(dt, 0.05);
    _eul.set(dPitch, dYaw, 0, 'YXZ');
    cam.quaternion.setFromEuler(_eul);
    var fwd = _fwd.set(0, 0, -1).applyQuaternion(cam.quaternion);
    var right = _rgt.set(1, 0, 0).applyQuaternion(cam.quaternion);
    if (keys.f) dPos.addScaledVector(fwd, sp);
    if (keys.b) dPos.addScaledVector(fwd, -sp);
    if (keys.l) dPos.addScaledVector(right, -sp);
    if (keys.r) dPos.addScaledVector(right, sp);
    if (keys.up) dPos.y += sp;
    if (keys.dn) dPos.y -= sp;
    dPos.y = Math.max(0.6, Math.min(120, dPos.y));
    cam.position.copy(dPos);
  }

  var KEYMAP = { w: 'f', s: 'b', a: 'l', d: 'r', q: 'dn', e: 'up', arrowup: 'f', arrowdown: 'b', arrowleft: 'l', arrowright: 'r' };
  document.addEventListener('keydown', function (ev) {
    if (['INPUT', 'TEXTAREA', 'SELECT'].indexOf(document.activeElement && document.activeElement.tagName) >= 0) return;
    if (ev.key === 'v' || ev.key === 'V') {
      if (!Q.droneUnlocked && !droneOn) return;
      ev.preventDefault(); setDrone(!droneOn); return;
    }
    if (!droneOn) return;
    var k = KEYMAP[String(ev.key).toLowerCase()];
    if (k) { keys[k] = true; ev.preventDefault(); }
    if (ev.key === 'Shift') keys.shift = true;
    if (ev.key === 'Escape') { ev.preventDefault(); setDrone(false); }
  });
  document.addEventListener('keyup', function (ev) {
    var k = KEYMAP[String(ev.key).toLowerCase()];
    if (k) keys[k] = false;
    if (ev.key === 'Shift') keys.shift = false;
  });
  document.addEventListener('mousedown', function (e) { if (droneOn) { dragging2 = true; lastPt.x = e.clientX; lastPt.y = e.clientY; } });
  document.addEventListener('mouseup', function () { dragging2 = false; });
  document.addEventListener('mousemove', function (e) {
    if (!droneOn || !dragging2) return;
    dYaw -= (e.clientX - lastPt.x) * 0.0032;
    dPitch = Math.max(-1.3, Math.min(1.3, dPitch - (e.clientY - lastPt.y) * 0.0032));
    lastPt.x = e.clientX; lastPt.y = e.clientY;
  });
  document.addEventListener('touchstart', function (e) {
    if (!droneOn || !e.touches.length) return;
    dragging2 = true; lastPt.x = e.touches[0].clientX; lastPt.y = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchend', function () { dragging2 = false; });
  document.addEventListener('touchmove', function (e) {
    if (!droneOn || !dragging2 || !e.touches.length) return;
    dYaw -= (e.touches[0].clientX - lastPt.x) * 0.005;
    dPitch = Math.max(-1.3, Math.min(1.3, dPitch - (e.touches[0].clientY - lastPt.y) * 0.005));
    lastPt.x = e.touches[0].clientX; lastPt.y = e.touches[0].clientY;
  }, { passive: true });
  Q.drone = { on: function () { setDrone(true); }, off: function () { setDrone(false); }, isOn: function () { return droneOn; } };
})();
