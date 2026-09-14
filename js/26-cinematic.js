// Cinematic intro. Once per browser session, the camera dollies from a rooftop vantage over the
// alley down to the default outside framing, behind 2.39:1 letterbox bars.
//
// It is a courtesy, never an obstacle. Any key, any click, any tap and it is gone. Entering the
// shop kills it instantly, which also keeps the boot probe honest: scripts/verify_boot.mjs calls
// enterShop() about 0.8 s after the loader hides and expects the inside state within 1.4 s, so the
// intro must never hold the camera once that happens.
//
// Skipped outright under prefers-reduced-motion.
(function(){
  'use strict';

  var KEY = 'ramen-intro-seen';
  var DURATION = 4.2;          // seconds of dolly, inside the 3.5 to 4.5 brief
  var OWNER = 'cinematic';

  if(typeof THREE === 'undefined' || typeof camera === 'undefined' || typeof RAMEN === 'undefined') return;

  var reduced = false;
  try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(_){}
  if(reduced) return;

  var seen = false;
  try { seen = sessionStorage.getItem(KEY) === '1'; } catch(_){ seen = false; }
  if(seen) return;
  try { sessionStorage.setItem(KEY, '1'); } catch(_){}

  if(typeof COUT === 'undefined' || !COUT) return;

  // Rooftop vantage: high and off to one side, looking down the alley at the shopfront, so the
  // move sweeps across the neon and the rain before settling into the default framing.
  var FROM_POS  = new THREE.Vector3(31, 47, 94);
  var FROM_LOOK = new THREE.Vector3(-4, 15, -6);
  var TO_POS    = COUT.pos.clone();
  var TO_LOOK   = COUT.look.clone();

  // Driven by the wall clock, not by accumulated frame deltas. On a slow GPU the frame delta is
  // clamped to 50 ms, so a dt-driven intro would stretch to tens of real seconds on exactly the
  // machines that can least afford it. Wall time keeps the move 4.2 s everywhere.
  var startedAt = 0;
  var running = true;
  var bars = null, hint = null;
  var _pos = new THREE.Vector3(), _look = new THREE.Vector3();

  function easeOutQuint(x){ return 1 - Math.pow(1 - x, 5); }
  function easeInOutCubic(x){ return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

  function buildOverlay(){
    try {
      bars = document.createElement('div');
      bars.id = 'cine-bars';
      bars.setAttribute('aria-hidden', 'true');
      var top = document.createElement('div'); top.className = 'cine-bar top';
      var bot = document.createElement('div'); bot.className = 'cine-bar bottom';
      bars.appendChild(top); bars.appendChild(bot);
      document.body.appendChild(bars);

      hint = document.createElement('div');
      hint.id = 'cine-hint';
      hint.setAttribute('aria-hidden', 'true');
      hint.textContent = 'Press any key to skip';
      document.body.appendChild(hint);

      sizeBars();
      // Next frame, so the transition has something to animate from.
      requestAnimationFrame(function(){
        if(!running) return;
        if(bars) bars.classList.add('active');
        sizeBars();
        if(hint) hint.classList.add('active');
      });
    } catch(_){ bars = null; hint = null; }
  }

  // True 2.39:1 crop: whatever is left over above and below the wide frame becomes the bars.
  function sizeBars(){
    if(!bars) return;
    var h = innerHeight, w = innerWidth;
    var target = w / 2.39;
    var bar = Math.max(0, (h - target) / 2);
    var kids = bars.getElementsByClassName('cine-bar');
    for(var i = 0; i < kids.length; i++) kids[i].style.height = bar.toFixed(1) + 'px';
  }

  function finish(){
    if(!running) return;
    running = false;
    if(RAMEN.cameraOverride === dolly) RAMEN.cameraOverride = null;
    RAMEN.unlockCamera(OWNER);
    try {
      if(bars){
        bars.classList.remove('active');
        var kids = bars.getElementsByClassName('cine-bar');
        for(var i = 0; i < kids.length; i++) kids[i].style.height = '0px';
      }
      if(hint) hint.classList.remove('active');
      var b = bars, hn = hint;
      bars = null; hint = null;
      setTimeout(function(){
        try { if(b && b.parentNode) b.parentNode.removeChild(b); } catch(_){}
        try { if(hn && hn.parentNode) hn.parentNode.removeChild(hn); } catch(_){}
      }, 700);
    } catch(_){}
    detach();
  }

  function onSkip(){ finish(); }

  function attach(){
    window.addEventListener('keydown', onSkip, true);
    window.addEventListener('pointerdown', onSkip, true);
    window.addEventListener('touchstart', onSkip, true);
    window.addEventListener('wheel', onSkip, true);
    window.addEventListener('resize', sizeBars);
  }
  function detach(){
    window.removeEventListener('keydown', onSkip, true);
    window.removeEventListener('pointerdown', onSkip, true);
    window.removeEventListener('touchstart', onSkip, true);
    window.removeEventListener('wheel', onSkip, true);
    window.removeEventListener('resize', sizeBars);
  }

  // Entering the shop always wins. Two guards, not one: the hook covers the normal path, and the
  // inside/transitioning check inside cameraOverride covers anything that sets the state directly.
  RAMEN.on('enter', finish);
  RAMEN.on('exit', finish);

  if(!RAMEN.lockCamera(OWNER)) return;
  attach();
  buildOverlay();

  // Runs after the main loop has placed the camera, so this is the last word on framing while the
  // intro is alive. No separate animation loop: the scene has exactly one clock.
  function dolly(cam){
    if(!running){ if(RAMEN.cameraOverride === dolly) RAMEN.cameraOverride = null; return; }
    if((typeof inside !== 'undefined' && inside) || (typeof transitioning !== 'undefined' && transitioning)){
      finish();
      return;
    }
    var now = performance.now() / 1000;
    if(!startedAt) startedAt = now;
    var elapsed = now - startedAt;
    var p = Math.min(elapsed / DURATION, 1);
    // Position eases out hard so the descent decelerates into the final framing; the look target
    // eases in and out so the pan across the alley never snaps.
    _pos.lerpVectors(FROM_POS, TO_POS, easeOutQuint(p));
    _look.lerpVectors(FROM_LOOK, TO_LOOK, easeInOutCubic(p));
    // A touch of drift, fading out as the move settles.
    var drift = (1 - p) * 0.6;
    _pos.x += Math.sin(elapsed * 0.9) * drift;
    _pos.y += Math.sin(elapsed * 1.4) * drift * 0.5;
    cam.position.copy(_pos);
    cam.lookAt(_look);
    if(p >= 1) finish();
  }
  RAMEN.cameraOverride = dolly;

  RAMEN.cinematic = {
    isRunning: function(){ return running; },
    skip: finish,
    duration: DURATION
  };
})();
