// Final colour grade. One full-resolution ShaderPass appended after bloom, so everything the
// scene and the bloom pass produce passes through a single filmic look: S-curve contrast,
// teal-orange split toning, lifted blacks, vignette, edge chromatic aberration, animated film
// grain and a cheap anamorphic bright-streak term.
//
// Deliberately one pass, not five. Each extra full-screen pass costs another render target and
// another full-buffer read on integrated GPUs, and the headless SwiftShader gate feels every one.
//
// No-ops safely when the CDN example scripts were blocked (canPost false) or the composer failed
// to build. Rebuilt through the 'composer' hook so context loss and resize keep the grade.
(function(){
  'use strict';

  var _reduced = false;
  try { _reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(_){}

  // Grade presets. Values are tuned against the boot probe readback, not by eye alone:
  // the interior frame must land at mean luminance 55 to 130 with std at or above 35.
  var GRADES = {
    night: {
      exposure: 1.10, contrast: 0.28, lift: 0.014, sat: 1.14,
      shadow: [-0.016, 0.012, 0.042], highlight: [0.040, 0.016, -0.026],
      vignette: 0.44, aberration: 1.0, grain: 0.050, streak: 0.55
    },
    nightInside: {
      exposure: 1.16, contrast: 0.33, lift: 0.008, sat: 1.08,
      shadow: [-0.012, 0.007, 0.030], highlight: [0.034, 0.012, -0.022],
      vignette: 0.44, aberration: 0.55, grain: 0.044, streak: 0.0
    },
    day: {
      exposure: 1.14, contrast: 0.18, lift: 0.026, sat: 1.05,
      shadow: [-0.008, 0.010, 0.032], highlight: [0.028, 0.014, -0.012],
      vignette: 0.24, aberration: 0.6, grain: 0.032, streak: 0.22
    },
    dayInside: {
      exposure: 1.10, contrast: 0.22, lift: 0.018, sat: 1.03,
      shadow: [-0.006, 0.005, 0.022], highlight: [0.024, 0.010, -0.010],
      vignette: 0.30, aberration: 0.4, grain: 0.028, streak: 0.0
    }
  };

  var GradeShader = {
    uniforms: {
      tDiffuse:    { value: null },
      uTime:       { value: 0 },
      uResolution: { value: null },   // filled with a Vector2 at build time
      uIntensity:  { value: 1.0 },
      uExposure:   { value: 1.0 },
      uContrast:   { value: 0.3 },
      uLift:       { value: 0.02 },
      uSat:        { value: 1.1 },
      uShadow:     { value: null },
      uHighlight:  { value: null },
      uVignette:   { value: 0.9 },
      uAberration: { value: 1.0 },
      uGrain:      { value: 0.05 },
      uStreak:     { value: 0.5 }
    },
    vertexShader: [
      'varying vec2 vUv;',
      'void main(){',
      '  vUv = uv;',
      '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
      '}'
    ].join('\n'),
    // GLSL ES 1.0 only. No dynamic loop bounds, no textureLod, no bit ops: this has to compile
    // on a WebGL1 context and on the software rasterizer the boot probe uses.
    fragmentShader: [
      'uniform sampler2D tDiffuse;',
      'uniform vec2 uResolution;',
      'uniform float uTime, uIntensity, uExposure, uContrast, uLift, uSat;',
      'uniform float uVignette, uAberration, uGrain, uStreak;',
      'uniform vec3 uShadow, uHighlight;',
      'varying vec2 vUv;',
      '',
      'float hash21(vec2 p){',
      '  p = fract(p * vec2(233.34, 851.73));',
      '  p += dot(p, p + 23.45);',
      '  return fract(p.x * p.y);',
      '}',
      '',
      '// Matches the sRGB encode three.js applies when a built-in pass renders to the canvas.',
      '// The composer buffers hold linear light, so this pass owns the encode now that it is last.',
      'vec3 toSRGB(vec3 c){',
      '  c = max(c, 0.0);',
      '  return mix(pow(c, vec3(0.41666)) * 1.055 - 0.055, c * 12.92, vec3(lessThanEqual(c, vec3(0.0031308))));',
      '}',
      '',
      'void main(){',
      '  vec2 uv = vUv;',
      '  vec2 ctr = uv - 0.5;',
      '  float r2 = dot(ctr, ctr);',
      '',
      '  // ---- linear light -------------------------------------------------',
      '  // Chromatic aberration: zero at the optical centre, growing toward the corners the way',
      '  // a real lens does. Two extra fetches, and only when the grade asks for it.',
      '  vec3 lin;',
      '  if(uAberration > 0.001){',
      '    vec2 off = ctr * r2 * uAberration * 0.0075;',
      '    lin.r = texture2D(tDiffuse, uv + off).r;',
      '    lin.g = texture2D(tDiffuse, uv).g;',
      '    lin.b = texture2D(tDiffuse, uv - off).b;',
      '  } else {',
      '    lin = texture2D(tDiffuse, uv).rgb;',
      '  }',
      '',
      '  // Anamorphic streak: a short horizontal smear of the brightest pixels only, so neon and',
      '  // lantern cores get a lens bar without paying for a second blur pass.',
      '  if(uStreak > 0.001){',
      '    vec3 st = vec3(0.0);',
      '    for(int i = 1; i <= 2; i++){',
      '      float o = float(i) * 11.0 / max(uResolution.x, 1.0);',
      '      st += max(texture2D(tDiffuse, uv + vec2(o, 0.0)).rgb - 0.55, 0.0);',
      '      st += max(texture2D(tDiffuse, uv - vec2(o, 0.0)).rgb - 0.55, 0.0);',
      '    }',
      '    lin += st * uStreak * vec3(0.20, 0.26, 0.40);',
      '  }',
      '',
      '  // toSRGB costs three pow calls, so the untouched copy is only built when something',
      '  // actually needs to blend toward it.',
      '  vec3 src = uIntensity < 0.999 ? toSRGB(lin) : vec3(0.0);',
      '  vec3 col = toSRGB(lin * uExposure);',
      '',
      '  // ---- display space --------------------------------------------------',
      '  // Filmic S-curve. smoothstep pulls the midtones apart without crushing either end,',
      '  // then we blend back toward the straight value by the contrast amount.',
      '  vec3 cc = clamp(col, 0.0, 1.0);',
      '  col = mix(col, cc * cc * (3.0 - 2.0 * cc), uContrast);',
      '',
      '  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));',
      '  col = mix(vec3(lum), col, uSat);',
      '',
      '  // Split toning: cool the shadows, warm the highlights.',
      '  float sw = 1.0 - smoothstep(0.0, 0.55, lum);',
      '  float hw = smoothstep(0.35, 1.0, lum);',
      '  col += uShadow * sw + uHighlight * hw;',
      '',
      '  // Lifted blacks so nothing reads as dead pixel-black.',
      '  col = col * (1.0 - uLift) + uLift;',
      '',
      '  // Vignette, eased so it falls off softly instead of ringing.',
      '  col *= 1.0 - uVignette * smoothstep(0.10, 0.80, r2);',
      '',
      '  // Fine film grain, weighted toward the midtones so highlights stay clean.',
      '  if(uGrain > 0.001){',
      '    float g = hash21(uv * uResolution * 0.5 + uTime);',
      '    col += (g - 0.5) * uGrain * (0.35 + 0.9 * (1.0 - min(abs(lum - 0.45) * 1.6, 1.0)));',
      '  }',
      '',
      '  col = max(col, 0.0);',
      '  gl_FragColor = vec4(uIntensity < 0.999 ? mix(src, col, uIntensity) : col, 1.0);',
      '}'
    ].join('\n')
  };

  // A ShaderMaterial that fails to compile does not throw: three logs the GLSL error and renders
  // the mesh with a dead program. try/catch around the constructor therefore proves nothing. This
  // compiles the material for real against a throwaway scene, swallows the log while it does, and
  // reports link status, so callers can fall back to a working material before anything is drawn.
  // Published on the hook bus so js/24-shaders.js uses the same check.
  RAMEN.compilesOk = function(mesh){
    try {
      if(typeof renderer === 'undefined' || !renderer || !mesh) return true;
      var probe = new THREE.Scene();
      probe.add(mesh);
      var prev = console.error, failed = false;
      console.error = function(){ failed = true; };
      try { renderer.compile(probe, camera); } catch(e){ failed = true; }
      console.error = prev;
      probe.remove(mesh);
      if(failed) return false;
      var gl = renderer.getContext();
      var prog = mesh.material && mesh.material.program;
      if(prog && prog.program && !gl.getProgramParameter(prog.program, gl.LINK_STATUS)) return false;
      return true;
    } catch(e){ return true; }   // if the probe itself cannot run, do not block the material
  };

  var pass = null;
  var enabled = true;
  var intensity = 1.0;
  var gradeName = 'night';
  var grainTime = 0;

  function applyGrade(g){
    if(!pass) return;
    var u = pass.uniforms;
    u.uExposure.value   = g.exposure;
    u.uContrast.value   = g.contrast;
    u.uLift.value       = g.lift;
    u.uSat.value        = g.sat;
    u.uVignette.value   = g.vignette;
    u.uAberration.value = g.aberration;
    u.uGrain.value      = g.grain;
    u.uStreak.value     = g.streak;
    u.uShadow.value.set(g.shadow[0], g.shadow[1], g.shadow[2]);
    u.uHighlight.value.set(g.highlight[0], g.highlight[1], g.highlight[2]);
  }

  // The composer is rebuilt from scratch on boot, on context restore and on resize, so the pass
  // is created fresh every time. Holding on to an old pass would keep a dead render target.
  function attach(comp){
    pass = null;
    if(!comp) return;
    if(typeof THREE === 'undefined' || !THREE.ShaderPass) return;
    try {
      var shader = {
        uniforms: THREE.UniformsUtils.clone(GradeShader.uniforms),
        vertexShader: GradeShader.vertexShader,
        fragmentShader: GradeShader.fragmentShader
      };
      shader.uniforms.uResolution.value = new THREE.Vector2(innerWidth, innerHeight);
      shader.uniforms.uShadow.value = new THREE.Vector3();
      shader.uniforms.uHighlight.value = new THREE.Vector3();
      var p = new THREE.ShaderPass(shader);
      // Validate before the pass is ever in the chain. A dead grade program renders to the canvas,
      // so a failure here would black the whole page out rather than merely dropping an effect.
      if(!RAMEN.compilesOk(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), p.material))){
        try { console.warn('[fx] grade shader did not compile, rendering ungraded'); } catch(_){}
        return;
      }
      comp.addPass(p);
      pass = p;
      pass.enabled = enabled;
      pass.uniforms.uIntensity.value = intensity;
      applyGrade(GRADES[gradeName] || GRADES.night);
      if(RAMEN.fx) RAMEN.fx.pass = pass;
    } catch(err){
      // A compile failure must never take the scene with it. Without the pass the composer
      // still ends at bloom and renders exactly as it did before this layer existed.
      pass = null;
      try { console.warn('[fx] grade pass unavailable, rendering ungraded:', err && err.message); } catch(_){}
    }
  }
  RAMEN.on('composer', function(ctx){ attach(ctx && ctx.composer); });

  RAMEN.on('frame', function(dt, t){
    if(!pass || !pass.enabled) return;
    var night = (typeof _nightMode === 'undefined') ? true : !!_nightMode;
    var within = (typeof inside !== 'undefined') && !!inside;
    var name = night ? (within ? 'nightInside' : 'night') : (within ? 'dayInside' : 'day');
    if(name !== gradeName){ gradeName = name; applyGrade(GRADES[name]); }
    // Under reduced motion the grain is still there, it just stops moving: no flicker, no crawl.
    if(!_reduced) grainTime += dt * 11.0;
    pass.uniforms.uTime.value = grainTime;
    var u = pass.uniforms.uResolution.value;
    if(u && (u.x !== innerWidth || u.y !== innerHeight)) u.set(innerWidth, innerHeight);
  });

  // Public surface. The boot probe looks for RAMEN.fx to confirm the layer is live.
  RAMEN.fx = {
    get enabled(){ return enabled; },
    set enabled(v){ enabled = !!v; if(pass) pass.enabled = enabled; },
    setGrade: function(name){
      if(!GRADES[name]) return false;
      gradeName = name; applyGrade(GRADES[name]); return true;
    },
    setIntensity: function(v){
      intensity = Math.max(0, Math.min(1, Number(v) || 0));
      if(pass) pass.uniforms.uIntensity.value = intensity;
      return intensity;
    },
    grades: function(){ return Object.keys(GRADES); },
    reducedMotion: _reduced,
    pass: null
  };

  // The shader now owns the vignette and the grain. Retiring the two CSS overlays stops the
  // scene being graded twice, and takes two always-animating full-screen layers off the
  // compositor. The scanline overlay stays: it is a different look and costs nothing.
  // When the grade cannot run, the CSS layers are left exactly as they were.
  // buildComposer() already ran in js/10-boot.js, long before this file loaded, so the boot
  // composer exists and never fired the hook for us. Attach to it directly here; the hook above
  // covers every later rebuild (resize, context restore).
  if(typeof composer !== 'undefined' && composer) attach(composer);

  if(pass){
    try { document.body.classList.add('fx-shader-grade'); } catch(_){}
  }
})();
