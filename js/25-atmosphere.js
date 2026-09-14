// Atmosphere: layered ground fog outside and per-star twinkle.
// Split out of js/24-shaders.js to keep both files readable. Loaded straight after it.
//
// Denser rain lives in js/32-exterior.js, where the streak buffer is built: only the RC count
// changed there, the main loop already scales its work to RC.
(function(){
  'use strict';

  if(typeof THREE === 'undefined' || typeof scene === 'undefined') return;

  var _reduced = false;
  try { _reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(_){}

  // ── Ground fog ───────────────────────────────────────────────────────────
  // Three wide planes lying low over the street. A soft radial canvas texture keeps the edges
  // invisible, and each layer drifts at its own rate so the bank never looks like flat cards.
  // Normal blending, not additive: fog should soften the street, not light it.
  var fogLayers = [];
  try {
    var fc = document.createElement('canvas');
    fc.width = fc.height = 256;
    var fx2 = fc.getContext('2d');
    var grd = fx2.createRadialGradient(128, 128, 10, 128, 128, 128);
    grd.addColorStop(0.00, 'rgba(112,124,150,0.22)');
    grd.addColorStop(0.45, 'rgba(84,96,124,0.11)');
    grd.addColorStop(1.00, 'rgba(60,70,96,0)');
    fx2.fillStyle = grd; fx2.fillRect(0, 0, 256, 256);
    // A few softer blobs so the layer is not a perfect disc.
    for(var b = 0; b < 7; b++){
      var bx = 40 + Math.random() * 176, by = 60 + Math.random() * 136, br = 30 + Math.random() * 55;
      var bg = fx2.createRadialGradient(bx, by, 2, bx, by, br);
      bg.addColorStop(0, 'rgba(124,136,160,0.10)');
      bg.addColorStop(1, 'rgba(84,96,124,0)');
      fx2.fillStyle = bg; fx2.fillRect(bx - br, by - br, br * 2, br * 2);
    }
    var fogTex = new THREE.CanvasTexture(fc);
    var LAYERS = [
      { y: 0.50, w: 96,  h: 46, op: 0.11,  sp: 0.30, z: 18 },
      { y: 1.45, w: 118, h: 54, op: 0.075, sp: -0.21, z: 8 },
      { y: 2.70, w: 140, h: 62, op: 0.045, sp: 0.13, z: -6 }
    ];
    for(var i = 0; i < LAYERS.length; i++){
      var L = LAYERS[i];
      var mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(L.w, L.h),
        new THREE.MeshBasicMaterial({ map: fogTex, transparent: true, opacity: L.op, depthWrite: false })
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(0, L.y, L.z);
      mesh.renderOrder = 1;
      mesh.userData = { speed: L.sp, baseX: 0, baseOp: L.op, phase: Math.random() * Math.PI * 2 };
      scene.add(mesh);
      fogLayers.push(mesh);
    }
  } catch(err){
    try { console.warn('[atmosphere] ground fog skipped:', err && err.message); } catch(_){}
    fogLayers = [];
  }

  // ── Star twinkle ─────────────────────────────────────────────────────────
  // The main loop already breathes the whole field's opacity. This adds per-star variation on top
  // by rewriting the colour attribute, so the sky reads as individual stars rather than one sheet.
  // Throttled to every third frame: 380 stars is cheap, but it is also decorative.
  var starsOk = (typeof starGeo !== 'undefined' && typeof starData !== 'undefined' &&
                 starGeo && starGeo.attributes && starGeo.attributes.color && starData.length > 0);
  var starBase = null;
  if(starsOk){
    try { starBase = Float32Array.from(starGeo.attributes.color.array); }
    catch(_){ starsOk = false; }
  }

  var twinkleFrame = 0;
  RAMEN.on('frame', function(dt, t){
    var within = (typeof inside !== 'undefined') && !!inside;

    if(fogLayers.length){
      for(var i = 0; i < fogLayers.length; i++){
        var f = fogLayers[i];
        if(within){ f.visible = false; continue; }
        f.visible = true;
        if(_reduced) continue;
        f.position.x += f.userData.speed * dt;
        if(f.position.x > 42) f.position.x = -42;
        if(f.position.x < -42) f.position.x = 42;
        f.material.opacity = f.userData.baseOp * (0.78 + Math.sin(t * 0.13 + f.userData.phase) * 0.22);
      }
    }

    if(!starsOk || within) return;
    twinkleFrame++;
    if(twinkleFrame % 3 !== 0) return;
    var arr = starGeo.attributes.color.array;
    for(var s = 0; s < starData.length; s++){
      var d = starData[s];
      // Static stars under reduced motion: the field still varies in brightness star to star,
      // it just never changes.
      var k = _reduced ? d.base : (d.base + Math.sin(t * d.sp + d.ph) * 0.32 + Math.sin(t * d.sp * 2.7 + d.ph) * 0.12);
      if(k < 0.12) k = 0.12; else if(k > 1.25) k = 1.25;
      var o = s * 3;
      arr[o]     = starBase[o]     * k;
      arr[o + 1] = starBase[o + 1] * k;
      arr[o + 2] = starBase[o + 2] * k;
    }
    starGeo.attributes.color.needsUpdate = true;
  });

  RAMEN.atmosphere = { fogLayers: fogLayers.length, twinkle: starsOk, reducedMotion: _reduced };
})();
