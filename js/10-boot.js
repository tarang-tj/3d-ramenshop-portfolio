// Renderer bootstrap: WebGL fallback, adaptive DPR, context-loss recovery, bloom composer, renderScene.
// Split from the original single-file index.html on 2026-09-13; classic script, shares the global scope
// with every other js/*.js file. Load order is the numeric prefix.
// ── Setup ──────────────────────────────────────────────────────────────────
// ── WebGL availability + renderer creation with graceful fallback ───────
// If the browser can't give us a WebGL context (old GPU, hardware accel
// disabled, context limit hit on Safari, locked-down corporate laptop),
// we show a clean text-only portfolio instead of a blank screen. A recruiter
// on a restricted machine should still be able to get to the resume.
function _showWebGLFallback(errMsg){
  document.title = 'Tarang (TJ) Jammalamadaka · Applied AI & Full-Stack Engineer';
  document.body.innerHTML =
    '<style>'+
    'html,body{height:100%;margin:0;padding:0;background:#060402;color:#f0c060;'+
    'font-family:"Noto Serif JP",Georgia,serif;cursor:auto;}'+
    '.fb-wrap{max-width:640px;margin:0 auto;padding:3.5rem 2rem;line-height:1.7;}'+
    '.fb-wrap h1{color:#f5d070;font-size:clamp(2rem,5vw,3rem);letter-spacing:0.1em;'+
    'text-shadow:0 0 18px rgba(232,146,42,0.5);margin:0 0 0.2rem;}'+
    '.fb-wrap .sub{font-size:0.7rem;letter-spacing:0.32em;text-transform:uppercase;'+
    'color:#c8a86a;margin-bottom:2rem;display:block;}'+
    '.fb-wrap p{color:#e8c88a;margin:1rem 0;font-size:0.95rem;}'+
    '.fb-wrap a{color:#f0c060;text-decoration:none;border-bottom:1px solid rgba(232,146,42,0.3);'+
    'padding-bottom:1px;transition:border-color 0.2s;}'+
    '.fb-wrap a:hover{border-color:#f0c060;}'+
    '.fb-links{display:flex;flex-wrap:wrap;gap:0.8rem 1.4rem;margin-top:1rem;}'+
    '.fb-note{font-size:0.68rem;color:#8a7040;letter-spacing:0.08em;margin-top:2.5rem;'+
    'padding-top:1.2rem;border-top:1px solid rgba(232,146,42,0.12);font-style:italic;}'+
    '</style>'+
    '<div class="fb-wrap">'+
    '<h1>TJ Jammalamadaka</h1>'+
    '<span class="sub">Applied AI &amp; Full-Stack Engineer \u00b7 UW Bothell MIS</span>'+
    '<p>The interactive 3D ramen shop couldn\u2019t start on this device \u2014 usually WebGL is disabled or the GPU is busy.</p>'+
    '<p>Here are the direct links you\u2019re probably looking for:</p>'+
    '<div class="fb-links">'+
      '<a href="https://github.com/tarang-tj">GitHub</a>'+
      '<a href="https://linkedin.com/in/tarang-tj">LinkedIn</a>'+
      '<a href="https://autoappli.com">AutoAppli \u2014 live</a>'+
      '<a href="https://syllabusai.net">SyllabusAI \u2014 live</a>'+
      '<a href="mailto:tarangjammalamadaka9@gmail.com">tarangjammalamadaka9@gmail.com</a>'+
    '</div>'+
    '<p>UW Bothell \u00b7 GPA 3.7 \u00b7 Dean\u2019s List \u00b7 Graduating June 2027 \u00b7 Open to Applied-AI and forward-deployed engineering roles starting June 2027.</p>'+
    '<div class="fb-note">To see the interactive version: try another browser (Chrome / Firefox / Safari), or enable hardware acceleration in settings.'+ (errMsg ? '<br><br><span style="opacity:0.5">Error: '+errMsg+'</span>' : '') +'</div>'+
    '</div>';
}
let scene, camera, renderer;
try {
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x070402, 65, 220);
  camera = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, 0.1, 400);
  renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: false });
  // Probe: if getContext actually succeeded, renderer.domElement will have a working gl context
  if (!renderer.getContext()) throw new Error('WebGL context probe returned null');
} catch (err) {
  console.error('[Portfolio] WebGL unavailable:', err);
  _showWebGLFallback(err && err.message);
  // The scene is now split across several classic scripts. window.stop() aborts the rest of the
  // document load so the later files never run against an undefined renderer.
  try { window.stop(); } catch(_) {}
  throw err; // halt this script; fallback is now showing
}
renderer.setSize(innerWidth, innerHeight);
// Adaptive pixel ratio with graceful degradation on GPU stress.
// Previous cap of 0.75 rendered at ~37% effective resolution on retina displays — far too soft.
// Start at 1.25 on desktop (1.0 on mobile/low-end). If the GPU loses context (happens on
// laptops that hot-switch integrated/discrete graphics), the handler below drops a notch
// and reapplies, so the scene recovers gracefully instead of going blank.
const _coarsePtr = matchMedia('(pointer:coarse)').matches;
const _lowCore = (navigator.hardwareConcurrency || 4) <= 4;
// Quality-degradation ladder. Start crisp: desktop caps at 2x (retina sharp),
// mobile/low-core at 1.5x. Each GPU context loss steps DOWN one rung (see the
// contextlost handler), so a stressed GPU trades resolution for stability
// instead of going blank. applyDPR() always clamps to the device's real DPR.
const _dprLadder = (_coarsePtr || _lowCore) ? [1.5, 1.25, 1.0, 0.85] : [2, 1.5, 1.25, 1.0];
let _dprStep = 0;
let _dprCap = _dprLadder[_dprStep];
let _contextLossCount = 0;
function applyDPR(){ renderer.setPixelRatio(Math.min(devicePixelRatio, _dprCap)); }
applyDPR();
// Shadow maps disabled — nothing casts/receives shadows; saves full render pass
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.setClearColor(0x060402);
document.body.insertBefore(renderer.domElement, document.getElementById('cursor'));

// ── WebGL context loss recovery ──────────────────────────────────────────
// Keeps the scene working if the GPU driver resets (common on hybrid-graphics
// laptops and under heavy parallel GPU load). Without this, a single context
// loss leaves the scene blank until reload.
renderer.domElement.addEventListener('webglcontextlost', (e) => {
  e.preventDefault();                                  // Tell the browser we'll handle restore
  _contextLossCount++;
  // Step down the DPR ladder so the restored context renders lighter and is
  // less likely to lose context again.
  _dprStep = Math.min(_dprStep + 1, _dprLadder.length - 1);
  _dprCap = _dprLadder[_dprStep];
  try { console.warn('[WebGL] Context lost (' + _contextLossCount + '). Will recover on restore at DPR cap ' + _dprCap + '.'); } catch(_) {}
  // After 3 losses, the GPU clearly can't sustain this scene. Give up on 3D
  // and show the text fallback so the user sees their resume + links, not a
  // black screen they can't use.
  if (_contextLossCount >= 3) {
    try { console.warn('[WebGL] 3+ context losses — showing text fallback.'); } catch(_) {}
    _showWebGLFallback('WebGL context lost ' + _contextLossCount + ' times — GPU unable to sustain 3D scene');
  }
}, false);
renderer.domElement.addEventListener('webglcontextrestored', () => {
  // Wrap in try/catch: if ANY console/API oddity throws mid-recovery, we still want
  // the renderer config reapplied. An incomplete restore leaves the scene black forever.
  try {
    // Use console.log (not info/debug) — some browser extensions stub those to undefined
    try { console.log('[WebGL] Context restored — reapplying renderer config at DPR cap ' + _dprCap); } catch(_) {}
    // Three.js re-uploads buffers/textures internally, but the high-level config needs re-set
    applyDPR();
    renderer.setSize(innerWidth, innerHeight);
    renderer.setClearColor(0x060402);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    // Post-processing render targets are tied to the old GL context, so rebuild.
    buildComposer();
  } catch (restoreErr) {
    try { console.warn('[WebGL] Restore handler threw:', restoreErr); } catch(_) {}
  }
}, false);

// ── Bloom post-processing (UnrealBloom) ──────────────────────────────────
// The scene is mostly emissive light sources (neon, lanterns, shop windows).
// A tasteful bloom makes them glow instead of reading as flat colored planes.
// canPost is false if the example CDN scripts were blocked; in that case the
// render path below falls straight through to renderer.render(). No glow, but
// the scene still works exactly as before.
const canPost = !!(THREE.EffectComposer && THREE.RenderPass && THREE.UnrealBloomPass && THREE.ShaderPass && THREE.CopyShader);
// Tunable bloom look. Kept as named consts so the glow is one edit away.
// strength = how bright the glow, radius = how far it spreads, threshold =
// how bright a pixel must be before it blooms (high, so only emissives catch).
const BLOOM_STRENGTH = 0.55;
const BLOOM_RADIUS   = 0.4;
const BLOOM_THRESHOLD = 0.82;
let composer = null, bloomPass = null;
let _bloomStrengthTarget = BLOOM_STRENGTH;
function buildComposer(){
  if(!canPost){ composer = null; bloomPass = null; return; }
  try {
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));
    // Bloom runs at HALF resolution. Cheaper, and the blur hides the low res.
    bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(innerWidth/2, innerHeight/2),
      _bloomStrengthTarget, BLOOM_RADIUS, BLOOM_THRESHOLD
    );
    composer.addPass(bloomPass);
    composer.setSize(innerWidth, innerHeight);      // picks up renderer's effective DPR
    bloomPass.setSize(innerWidth/2, innerHeight/2); // re-force half-res after setSize
  } catch(err){
    try { console.warn('[Bloom] Composer build failed, falling back to plain render:', err); } catch(_) {}
    composer = null; bloomPass = null;
  }
}
buildComposer();
// Single render entry point. Uses the composer when bloom is available,
// otherwise the plain renderer. Both paths are exercised.
function renderScene(){
  if(composer){ composer.render(); }
  else { renderer.render(scene, camera); }
}
