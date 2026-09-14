// Camera state and presets, hemisphere light, sky dome, moon, stars, clouds.
// Split from the original single-file index.html on 2026-09-13; classic script, shares the global scope
// with every other js/*.js file. Load order is the numeric prefix.
let inside=false, dragging=false, hovering=false;
let dragStart={x:0,y:0}, prevMouse={x:0,y:0}, yaw=0, pitch=0;
let targetFov = 55;

// Pre-allocated vectors — reused every frame to avoid GC pressure
const _breathV = new THREE.Vector3();
const _ldirV   = new THREE.Vector3();
const _rgtV    = new THREE.Vector3();
const _upV     = new THREE.Vector3(0,1,0);
const _oLookV  = new THREE.Vector3();
const _dirV    = new THREE.Vector3(); // for wheel scroll
const COUT={pos:new THREE.Vector3(0,16,58),look:new THREE.Vector3(0,12,0)};
const CIN ={pos:new THREE.Vector3(0,5,-6), look:new THREE.Vector3(0,5.5,-32)};
// Camera position when "looking at" the menu stand on the counter
const CMENU={pos:new THREE.Vector3(0,6.4,-14), look:new THREE.Vector3(0,6.3,-21.5)};
let ct={pos:COUT.pos.clone(),look:COUT.look.clone()};
let cc={pos:COUT.pos.clone(),look:COUT.look.clone()};

// ── Helpers ───────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0x1a1005,0.30));
// Hemisphere sky — cool blue-purple zenith, warm amber ground
const hemi = new THREE.HemisphereLight(0x1a2035, 0x2a1405, 0.34);
scene.add(hemi);

// ── Cursor-follow warm light: REMOVED ──────────────────────────────────
// Scene already has ~13 PointLights (moonGlow + street lamps + neon facade
// + interior fills + kitchen glow + stool highlights + menu spot + lantern
// lights). Adding a 14th pushed the fragment shader past this GPU's uniform
// budget — shader silently failed compile, renderer.render() became a no-op,
// canvas stayed at the clear color (black). A future revival would modulate
// an existing light's position/intensity based on cursor instead of adding
// a new light source. The animate-loop update below has a typeof guard so
// it becomes a no-op without this declaration.

// Kanji sprite particle system removed — each sprite allocated its own
// CanvasTexture, and 15 of them pushed GPU memory past the driver's comfort
// zone on reload, triggering "Error creating WebGL context". A future
// revival would use a single shared atlas texture and THREE.Points instead.
// Sky dome. Vertical gradient instead of a flat fill so the horizon glows and
// the zenith fades to near-black. Two textures (night / dawn) let the N toggle
// change the sky, not just the fog.
function mkSkyTex(horizonRGB, zenithRGB){
  const c=document.createElement('canvas'); c.width=4; c.height=256;
  const ctx=c.getContext('2d');
  const g=ctx.createLinearGradient(0,0,0,256); // top of canvas = zenith
  g.addColorStop(0,zenithRGB);
  g.addColorStop(0.55,'rgba('+Math.round(horizonRGB[0]*0.5)+','+Math.round(horizonRGB[1]*0.5)+','+Math.round(horizonRGB[2]*0.5)+',1)');
  g.addColorStop(1,'rgb('+horizonRGB[0]+','+horizonRGB[1]+','+horizonRGB[2]+')');
  ctx.fillStyle=g; ctx.fillRect(0,0,4,256);
  return new THREE.CanvasTexture(c);
}
const _skyTexNight = mkSkyTex([10,14,26],'rgb(4,3,8)');   // navy horizon glow to near-black zenith
const _skyTexDay   = mkSkyTex([58,42,32],'rgb(18,32,58)'); // warm dawn horizon to deep blue zenith
const skyDome = new THREE.Mesh(
  new THREE.SphereGeometry(180,16,8,0,Math.PI*2,0,Math.PI*0.5),
  new THREE.MeshBasicMaterial({map:_skyTexNight,side:THREE.BackSide})
);
skyDome.position.y = -5; scene.add(skyDome);
// Moon glow point light
const moonGlow = new THREE.PointLight(0xc8d8ff, 0.5, 200);
moonGlow.position.set(-40, 80, -100); scene.add(moonGlow);
// Visible moon disk - warm-white and near-opaque so bloom catches it gently
const moonDisk = new THREE.Mesh(
  new THREE.CircleGeometry(3.5, 24),
  new THREE.MeshBasicMaterial({color:0xfff4e0, transparent:true, opacity:0.96, side:THREE.FrontSide})
);
moonDisk.position.set(-42, 82, -102);
moonDisk.lookAt(0, 0, 0);
scene.add(moonDisk);
// Moon halo
const moonHalo = new THREE.Mesh(
  new THREE.CircleGeometry(5.5, 24),
  new THREE.MeshBasicMaterial({color:0xc0d0ff, transparent:true, opacity:0.12, side:THREE.FrontSide})
);
moonHalo.position.set(-42, 82, -101.5);
moonHalo.lookAt(0, 0, 0);
scene.add(moonHalo);
// Soft additive radial glow behind the moon (~2.5x diameter) so it reads as a
// glowing moon instead of a flat disc. Sprite + additive blend, kept subtle.
const _moonGlowTex = (()=>{
  const c=document.createElement('canvas'); c.width=c.height=128;
  const g=c.getContext('2d'), gr=g.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,'rgba(255,246,224,0.55)');
  gr.addColorStop(0.4,'rgba(228,236,255,0.18)');
  gr.addColorStop(1,'rgba(200,215,255,0)');
  g.fillStyle=gr; g.fillRect(0,0,128,128);
  return new THREE.CanvasTexture(c);
})();
const moonGlowSprite = new THREE.Sprite(new THREE.SpriteMaterial({
  map:_moonGlowTex, transparent:true, blending:THREE.AdditiveBlending, depthWrite:false, opacity:0.9
}));
moonGlowSprite.position.set(-42, 82, -102.5);
moonGlowSprite.scale.set(17.5, 17.5, 1);
scene.add(moonGlowSprite);

// ── Star field ────────────────────────────────────────────────────────────
const STAR_COUNT = 380;
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(STAR_COUNT * 3);
const starCol = new Float32Array(STAR_COUNT * 3);
const starData = [];
// Three brightness tiers so the field has depth instead of a uniform dust.
const _starTiers = [0.35, 0.6, 1.0];
for(let i=0;i<STAR_COUNT;i++){
  const theta = Math.random()*Math.PI*2;
  const phi = Math.random()*Math.PI*0.48; // upper hemisphere only
  const r = 140 + Math.random()*20;
  starPos[i*3]   = r*Math.sin(phi)*Math.cos(theta);
  starPos[i*3+1] = r*Math.cos(phi) + 10;
  starPos[i*3+2] = r*Math.sin(phi)*Math.sin(theta);
  const tier = _starTiers[Math.random()<0.12 ? 2 : (Math.random()<0.4 ? 1 : 0)];
  starCol[i*3] = 0.85*tier; starCol[i*3+1] = 0.93*tier; starCol[i*3+2] = tier; // faint cool-white
  starData.push({ph: Math.random()*Math.PI*2, sp: 0.4+Math.random()*1.2, base: 0.3+Math.random()*0.7});
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos,3));
starGeo.setAttribute('color', new THREE.BufferAttribute(starCol,3));
const starMat = new THREE.PointsMaterial({
  size:1.6, transparent:true, opacity:0.7,
  vertexColors:true, sizeAttenuation:false // constant pixel size, tiers via color
});
const stars = new THREE.Points(starGeo, starMat);
scene.add(stars);

// ── Night clouds ──────────────────────────────────────────────────────────
const cloudMeshes = [];
function mkCloudTex(){
  const c=document.createElement('canvas'); c.width=512; c.height=128;
  const ctx=c.getContext('2d');
  const grad=ctx.createRadialGradient(256,64,8,256,64,160);
  grad.addColorStop(0,'rgba(28,24,38,0.72)');
  grad.addColorStop(0.4,'rgba(20,18,30,0.45)');
  grad.addColorStop(1,'rgba(10,8,18,0)');
  ctx.fillStyle=grad; ctx.fillRect(0,0,512,128);
  return new THREE.CanvasTexture(c);
}
const cloudTex=mkCloudTex();
for(let i=0;i<3;i++){
  const cl=new THREE.Mesh(
    new THREE.PlaneGeometry(55+Math.random()*30, 12+Math.random()*8),
    new THREE.MeshBasicMaterial({map:cloudTex,transparent:true,opacity:0.55+Math.random()*0.3,depthWrite:false})
  );
  cl.rotation.x=-Math.PI/2;
  cl.position.set((Math.random()-0.5)*120, 38+Math.random()*18, -30-Math.random()*60);
  cl.userData={speed:0.018+Math.random()*0.012, startX:cl.position.x};
  scene.add(cl); cloudMeshes.push(cl);
}
