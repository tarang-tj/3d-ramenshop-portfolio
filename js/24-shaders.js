// Custom surface shaders: rain puddles on the wet street, the neon hum on the rooftop sign, and
// additive light cones under the street lamps and the doorway.
//
// HARD CONSTRAINT: this file adds zero THREE.PointLight instances. The scene already runs at the
// fragment shader's uniform budget for lights on the GPUs this has to survive on, and the 14th
// point light made the shader fail to compile silently, which blacked the whole scene out (see the
// note in js/30-sky.js). Everything here is emissive geometry, additive blending and shader work.
//
// Every material is built inside a try/catch. If a shader fails to compile the mesh either keeps
// the material it already had or is never added, so a bad shader can dim the scene but can never
// blank it.
(function(){
  'use strict';

  if(typeof THREE === 'undefined' || typeof scene === 'undefined') return;

  var _reduced = false;
  try { _reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(_){}

  // Neon palette pulled from the signage already in the scene: the teal shop sign and the amber
  // facade tubes. The puddles reflect these two, so the ground agrees with the buildings.
  var NEON_TEAL  = new THREE.Color(0x38b8d8);
  var NEON_AMBER = new THREE.Color(0xe8922a);
  var NEON_RED   = new THREE.Color(0xcc3333);

  var frameHooks = [];

  // ── 1. Rain puddles ──────────────────────────────────────────────────────
  // Flat decals just above the street. Rain rings expand across each one and perturb the surface
  // normal, which bends the faked neon reflection and drives the fresnel term. Additive over the
  // dark wet asphalt reads as light sitting on standing water.
  var PUDDLE_VERT = [
    'varying vec2 vUv;',
    'varying vec3 vWorld;',
    'varying vec3 vView;',
    'void main(){',
    '  vUv = uv;',
    '  vec4 wp = modelMatrix * vec4(position, 1.0);',
    '  vWorld = wp.xyz;',
    '  vView = cameraPosition - wp.xyz;',
    '  gl_Position = projectionMatrix * viewMatrix * wp;',
    '}'
  ].join('\n');

  var PUDDLE_FRAG = [
    'uniform float uTime, uOpacity, uRingSpeed;',
    'uniform vec3 uNeonA, uNeonB, uNeonC;',
    'uniform vec2 uCenters[3];',
    'varying vec2 vUv;',
    'varying vec3 vWorld;',
    'varying vec3 vView;',
    'void main(){',
    '  vec2 uv = vUv;',
    '  // Soft elliptical mask so the decal has no visible edge.',
    '  float mask = 1.0 - smoothstep(0.26, 0.5, length(uv - 0.5));',
    '  if(mask <= 0.001) discard;',
    '',
    '  // Expanding rain rings. Three staggered impacts per puddle is enough to read as rain.',
    '  float rings = 0.0;',
    '  vec2 pert = vec2(0.0);',
    '  for(int i = 0; i < 3; i++){',
    '    vec2 d = uv - uCenters[i];',
    '    float r = length(d) + 0.0001;',
    '    float ph = fract(uTime * uRingSpeed + float(i) * 0.37);',
    '    float rad = ph * 0.62;',
    '    float w = smoothstep(0.075, 0.0, abs(r - rad)) * (1.0 - ph);',
    '    rings += w;',
    '    pert += (d / r) * w * sign(rad - r);',
    '  }',
    '',
    '  // Perturbed surface normal. Flat water plus ripples.',
    '  vec3 n = normalize(vec3(pert.x * 0.55, 1.0, pert.y * 0.55));',
    '  vec3 v = normalize(vView);',
    '  float fres = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 3.0);',
    '',
    '  // Faked reflection: the sign colours smeared along the view, bent by the ripples. Real',
    '  // reflections would need a second render pass, which this scene cannot afford.',
    '  float bandA = 0.5 + 0.5 * sin(vWorld.x * 0.42 + pert.x * 7.0);',
    '  float bandB = 0.5 + 0.5 * sin(vWorld.z * 0.7 + pert.y * 9.0 + 1.7);',
    '  vec3 refl = mix(uNeonA, uNeonB, bandA);',
    '  refl = mix(refl, uNeonC, bandB * 0.35);',
    '',
    '  float smear = 0.22 + 0.55 * bandB;',
    '  vec3 col = refl * smear * (0.35 + fres * 1.5) + refl * rings * 0.55;',
    '  float a = uOpacity * mask * (0.25 + fres * 0.8 + rings * 0.35);',
    '  gl_FragColor = vec4(col, a);',   // additive blending multiplies by alpha for us
    '}'
  ].join('\n');

  // x, z, radius. Kept off the doorway approach so they never sit under the camera on entry.
  var PUDDLE_SPOTS = [
    [-9.5, 9.5, 4.2], [7.5, 11.0, 5.0], [-15.0, 5.5, 3.4],
    [13.5, 5.0, 3.8], [1.5, 15.5, 5.4], [-4.0, 20.0, 4.6]
  ];
  var puddles = [];
  try {
    for(var i = 0; i < PUDDLE_SPOTS.length; i++){
      var s = PUDDLE_SPOTS[i];
      var mat = new THREE.ShaderMaterial({
        uniforms: {
          uTime:      { value: Math.random() * 10 },
          uOpacity:   { value: 0.20 + Math.random() * 0.10 },
          uRingSpeed: { value: 0.34 + Math.random() * 0.18 },
          uNeonA:     { value: NEON_AMBER.clone() },
          uNeonB:     { value: NEON_TEAL.clone() },
          uNeonC:     { value: NEON_RED.clone() },
          uCenters:   { value: [
            new THREE.Vector2(0.34 + Math.random() * 0.1, 0.40 + Math.random() * 0.1),
            new THREE.Vector2(0.62 + Math.random() * 0.1, 0.58 + Math.random() * 0.1),
            new THREE.Vector2(0.46 + Math.random() * 0.1, 0.70 + Math.random() * 0.1)
          ] }
        },
        vertexShader: PUDDLE_VERT,
        fragmentShader: PUDDLE_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      var m = new THREE.Mesh(new THREE.PlaneGeometry(s[2] * 2, s[2] * 1.5), mat);
      m.rotation.x = -Math.PI / 2;
      m.position.set(s[0], 0.035 + i * 0.002, s[1]);   // tiny y stagger avoids z-fighting
      m.renderOrder = 2;
      scene.add(m);
      puddles.push(m);
    }
  } catch(err){
    try { console.warn('[shaders] puddle material failed, street stays plain:', err && err.message); } catch(_){}
    for(var pi = 0; pi < puddles.length; pi++) scene.remove(puddles[pi]);
    puddles = [];
  }
  if(puddles.length){
    frameHooks.push(function(dt, t){
      if(typeof inside !== 'undefined' && inside) return;   // nothing outside is visible indoors
      for(var k = 0; k < puddles.length; k++) puddles[k].material.uniforms.uTime.value += dt;
    });
  }

  // ── 2. Neon hum on the rooftop sign ──────────────────────────────────────
  // Replaces the sign's basic material with the same texture under a shader that adds an emissive
  // pulse, a faint chromatic fringe, and an occasional flicker. The flicker rate is capped in JS
  // rather than in the shader so the cap is provable: at most 3 dips per second, and none at all
  // under prefers-reduced-motion.
  var SIGN_FRAG = [
    'uniform sampler2D uMap;',
    'uniform float uPulse, uFlicker, uChroma;',
    'varying vec2 vUv;',
    'void main(){',
    '  vec4 t = texture2D(uMap, vUv);',
    '  float aR = texture2D(uMap, vUv + vec2(uChroma, 0.0)).a;',
    '  float aB = texture2D(uMap, vUv - vec2(uChroma, 0.0)).a;',
    '  float base = max(t.a, 0.02);',
    '  vec3 rgb = t.rgb;',
    '  rgb.r *= mix(1.0, clamp(aR / base, 0.0, 2.0), 0.6);',
    '  rgb.b *= mix(1.0, clamp(aB / base, 0.0, 2.0), 0.6);',
    '  gl_FragColor = vec4(rgb * uPulse * uFlicker, t.a * mix(0.35, 1.0, uFlicker));',
    '}'
  ].join('\n');

  var signMat = null, signPrevMat = null;
  if(typeof signMesh !== 'undefined' && signMesh && signMesh.material && signMesh.material.map){
    try {
      signPrevMat = signMesh.material;
      signMat = new THREE.ShaderMaterial({
        uniforms: {
          uMap:     { value: signPrevMat.map },
          uPulse:   { value: 1.0 },
          uFlicker: { value: 1.0 },
          uChroma:  { value: 0.0016 }
        },
        vertexShader: [
          'varying vec2 vUv;',
          'void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'
        ].join('\n'),
        fragmentShader: SIGN_FRAG,
        transparent: true,
        depthWrite: false
      });
      signMesh.material = signMat;
    } catch(err){
      try { console.warn('[shaders] neon sign material failed, keeping the plain sign:', err && err.message); } catch(_){}
      if(signPrevMat) signMesh.material = signPrevMat;
      signMat = null;
    }
  }
  if(signMat){
    var flickerUntil = 0, flickerLevel = 1, nextFlicker = 3, flickerClock = 0, flickersThisSecond = 0, secondMark = 0;
    frameHooks.push(function(dt, t){
      if(typeof inside !== 'undefined' && inside) return;
      var u = signMat.uniforms;
      u.uPulse.value = 1.0 + Math.sin(t * 1.7) * 0.09 + Math.sin(t * 0.63) * 0.05;
      if(_reduced){ u.uFlicker.value = 1.0; return; }
      flickerClock += dt;
      if(flickerClock - secondMark >= 1){ secondMark = flickerClock; flickersThisSecond = 0; }
      if(flickerClock > nextFlicker && flickersThisSecond < 3){
        flickersThisSecond++;
        flickerUntil = flickerClock + 0.05 + Math.random() * 0.07;
        flickerLevel = 0.38 + Math.random() * 0.3;
        nextFlicker = flickerClock + 0.45 + Math.random() * 5.5;
      }
      u.uFlicker.value = flickerClock < flickerUntil ? flickerLevel : 1.0;
    });
  }

  // ── 3. Volumetric light cones ────────────────────────────────────────────
  // Additive hollow cones with a soft fresnel body and a vertical fade. Cheap stand-ins for light
  // shafts through the rain, and they cost no lights at all.
  var CONE_VERT = [
    'varying vec3 vN;',
    'varying vec3 vV;',
    'varying float vT;',
    'void main(){',
    '  vN = normalize(normalMatrix * normal);',
    '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
    '  vV = normalize(-mv.xyz);',
    '  vT = uv.y;',           // 1 at the tip, 0 at the wide end for ConeGeometry
    '  gl_Position = projectionMatrix * mv;',
    '}'
  ].join('\n');

  var CONE_FRAG = [
    'uniform vec3 uColor;',
    'uniform float uOpacity, uTime, uFlutter;',
    'varying vec3 vN;',
    'varying vec3 vV;',
    'varying float vT;',
    'void main(){',
    '  // Bright where the surface faces the camera, soft at the silhouette: the opposite of a rim',
    '  // light, which is what makes a hollow cone read as a solid shaft of light.',
    '  float f = pow(abs(dot(normalize(vN), normalize(vV))), 1.6);',
    '  float fade = smoothstep(0.0, 0.45, vT) * (0.25 + 0.75 * vT);',
    '  float flutter = 1.0 + sin(uTime * 1.3 + vT * 4.0) * uFlutter;',
    '  float a = uOpacity * f * fade * flutter;',
    '  gl_FragColor = vec4(uColor, a);',   // additive blending multiplies by alpha for us
    '}'
  ].join('\n');

  function lightCone(color, opacity, radius, height, x, y, z, tiltX){
    try {
      var mat = new THREE.ShaderMaterial({
        uniforms: {
          uColor:   { value: new THREE.Color(color) },
          uOpacity: { value: opacity },
          uTime:    { value: Math.random() * 20 },
          uFlutter: { value: _reduced ? 0.0 : 0.06 }
        },
        vertexShader: CONE_VERT,
        fragmentShader: CONE_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      var mesh = new THREE.Mesh(new THREE.ConeGeometry(radius, height, 20, 1, true), mat);
      mesh.position.set(x, y, z);
      if(tiltX) mesh.rotation.x = tiltX;
      mesh.renderOrder = 3;
      scene.add(mesh);
      return mesh;
    } catch(err){
      try { console.warn('[shaders] light cone skipped:', err && err.message); } catch(_){}
      return null;
    }
  }

  // Street lamp heads sit at x +/- 3.5 from the pole at z = 10, bulb at y 9.4. The cone tip meets
  // the bulb, the wide end lands on the wet street.
  var cones = [];
  cones.push(lightCone(0xffe8a0, 0.075, 4.6, 9.2, -12.5, 4.8, 10, 0));
  cones.push(lightCone(0xffe8a0, 0.075, 4.6, 9.2,  19.5, 4.8, 10, 0));
  // Doorway wash: spills out of the shop mouth onto the sidewalk, tilted toward the street.
  cones.push(lightCone(0xf0a83c, 0.10, 4.2, 8.6, 0, 3.9, 1.9, 0.20));
  cones = cones.filter(function(c){ return !!c; });
  if(cones.length){
    frameHooks.push(function(dt, t){
      if(typeof inside !== 'undefined' && inside){
        for(var c = 0; c < cones.length; c++) cones[c].visible = false;
        return;
      }
      for(var k = 0; k < cones.length; k++){
        cones[k].visible = true;
        cones[k].material.uniforms.uTime.value += dt;
      }
    });
  }

  // One frame subscription for the whole file. No extra rAF loop, no interval: the main loop is
  // the only clock, and it already bails when the tab is hidden.
  if(frameHooks.length){
    RAMEN.on('frame', function(dt, t){
      for(var i2 = 0; i2 < frameHooks.length; i2++){
        try { frameHooks[i2](dt, t); } catch(_){}
      }
    });
  }

  RAMEN.surfaces = {
    puddles: puddles.length,
    cones: cones.length,
    neonSign: !!signMat,
    reducedMotion: _reduced
  };
})();
