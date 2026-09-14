// Raycast hover, enterShop and exitShop transitions, menu open.
// Split from the original single-file index.html on 2026-09-13; classic script, shares the global scope
// with every other js/*.js file. Load order is the numeric prefix.
const ray=new THREE.Raycaster();
const m2d=new THREE.Vector2();

function checkHover(e){
  m2d.x=(e.clientX/innerWidth)*2-1; m2d.y=-(e.clientY/innerHeight)*2+1;
  ray.setFromCamera(m2d,camera);
  // Don't show hover labels when any overlay is active
  const anyOverlay=document.getElementById('menu-overlay').classList.contains('active')||
    document.getElementById('panel-overlay').classList.contains('active')||
    document.getElementById('kb-overlay').classList.contains('active');
  if(anyOverlay){
    if(hovering){hovering=false;cursorEl.classList.remove('hover');cursorRing.classList.remove('hover');setHoverLabel(null);}
    return;
  }
  const wasH=hovering;
  if(!inside){
    const dHit = ray.intersectObject(doorZone).length>0;
    hovering = dHit;
    doorGlass.material.emissiveIntensity = dHit ? 0.52 : 0.22;
    setHoverLabel(dHit ? 'Enter →' : null);
  } else {
    const menuHit=ray.intersectObjects([menuZone,menuCard],true).length>0;
    const lh=ray.intersectObjects(intLanterns,true); // single cast
    const lanternHit=lh.length>0;
    const ih=ray.intersectObjects(interactZones,true);
    const interactHit=ih.length>0;
    hovering=menuHit||lanternHit||interactHit;
    if(menuHit) setHoverLabel('View Menu');
    else if(lanternHit){
      let o=lh[0].object; while(o&&!o.userData.panel)o=o.parent;
      setHoverLabel(o&&o.userData.panel?o.userData.panel.charAt(0).toUpperCase()+o.userData.panel.slice(1):null);
    } else if(interactHit){
      setHoverLabel(ih[0].object.userData.hoverLabel||'Interact');
    } else setHoverLabel(null);
  }
  if(hovering!==wasH){cursorEl.classList.toggle('hover',hovering);cursorRing.classList.toggle('hover',hovering);}
}

// ── Transitions ───────────────────────────────────────────────────────────
const fadeEl=document.getElementById('scene-fade');
let transitioning = false;

function enterShop(){
  if(transitioning || inside) return;
  transitioning = true;
  fadeEl.classList.add('active');
  setHoverLabel(null);
  setTimeout(()=>{
    inside=true; yaw=0; pitch=0;
    // Entrance particle burst — golden sparks (pooled, no extra rAF)
    if(!window._sparkPool) {
      window._sparkPool = []; window._sparkData = [];
      for(let i=0;i<12;i++){
        const s = new THREE.Mesh(new THREE.SphereGeometry(0.04,3,3),
          new THREE.MeshBasicMaterial({color:0xf0c060,transparent:true,opacity:0}));
        s.visible=false; scene.add(s); window._sparkPool.push(s);
        window._sparkData.push({vx:0,vy:0,vz:0,life:0,active:false});
      }
    }
    window._sparkPool.forEach((s,i)=>{
      const d=window._sparkData[i];
      s.position.set((Math.random()-0.5)*3, 4+Math.random()*3, -4);
      d.vx=(Math.random()-0.5)*0.06; d.vy=Math.random()*0.05+0.02; d.vz=-Math.random()*0.08;
      d.life=1; d.active=true; s.visible=true; s.material.opacity=0.8; s.scale.setScalar(1);
    });
    ct.pos.copy(CIN.pos); ct.look.copy(CIN.look); cc.pos.copy(CIN.pos); cc.look.copy(CIN.look);
    document.getElementById('outside-ui').style.display='none';
    document.getElementById('avail-badge').style.display='none';
    document.getElementById('time-disp').style.display='none';
    document.getElementById('inside-ui').style.display='block';
    updateExperienceMode(true);
    // Reset inside-hint animation by re-inserting the element
    const hint = document.getElementById('inside-hint');
    const p = hint.parentNode; const clone = hint.cloneNode(true); hint.remove(); p.appendChild(clone);
    rain.visible=false; bokeh.visible=false; blocker.visible=false; cityGroup.visible=false;
    splashPool.forEach(r=>{r.visible=false;});
    dustMotes.forEach(d=>{d.visible=true;});
    warmDust.forEach(d=>{d.visible=true;});
    menuFloorGlow.visible=true;
    scene.fog.color.set(0x1a0e05); scene.fog.near=20; scene.fog.far=65;
    hemi.groundColor.set(0x3a1a05); hemi.intensity=0.4;
    targetFov = 68;
    condTarget = 0.52; // show condensation inside
    setRainVolume(0,0.6); setIndoorVolume(0.055,1.2);
    playChime();
    setTimeout(()=>playSlurp(), 320);
    fadeEl.classList.remove('active');
    transitioning = false;
    // Highlight nav buttons sequentially to draw recruiter attention
    const navBtns = document.querySelectorAll('.inside-nav-btn');
    navBtns.forEach((btn, i) => {
      setTimeout(() => {
        btn.style.transition = 'color 0.3s, border-bottom-color 0.3s, background 0.3s';
        btn.style.color = '#f0c060';
        btn.style.borderBottomColor = '#f0c060';
        setTimeout(() => { btn.style.color = ''; btn.style.borderBottomColor = ''; }, 400);
      }, 300 + i * 150);
    });
  },470);
  setTimeout(()=>{ transitioning=false; },1500); // safety net
}
function exitShop(){
  if(transitioning || !inside) return;
  transitioning = true;
  // Force-close all overlays immediately — no animation, no camera side effects
  ['menu-overlay','panel-overlay','kb-overlay'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.classList.remove('active','overlay-closing');
  });
  document.getElementById('canvas-blocker').classList.remove('active');
  MSG.visible=true;
  fadeEl.classList.add('active');
  setHoverLabel(null);
  setTimeout(()=>{
    inside=false; yaw=0; pitch=0;
    _clearSeatedState();
    ct.pos.copy(COUT.pos); ct.look.copy(COUT.look); cc.pos.copy(COUT.pos); cc.look.copy(COUT.look);
    targetFov=55;
    document.getElementById('outside-ui').style.display='block';
    document.getElementById('avail-badge').style.display='flex';
    document.getElementById('time-disp').style.display='block';
    if(elTimeDisp) elTimeDisp.style.transform='';
    if(elAvailBadge) elAvailBadge.style.transform='';
    document.getElementById('inside-ui').style.display='none';
    updateExperienceMode(false);
    rain.visible=true; bokeh.visible=true; blocker.visible=true; cityGroup.visible=true;
    splashPool.forEach(r=>{r.visible=true;});
    dustMotes.forEach(d=>{d.visible=false;});
    warmDust.forEach(d=>{d.visible=false;});
    menuFloorGlow.visible=false;
    scene.fog.color.set(0x070402); scene.fog.near=65; scene.fog.far=220;
    hemi.groundColor.set(0x2a1405); hemi.intensity=0.6;
    condTarget=0;
    setRainVolume(0.09,1.0); setIndoorVolume(0,0.5);
    fadeEl.classList.remove('active');
    transitioning=false;
  },470);
  // Safety net: force-clear transitioning if something goes wrong
  setTimeout(()=>{ transitioning=false; },1500);
}
window.exitShop=exitShop;
window.enterShop=enterShop;

// ── Menu / Panel ──────────────────────────────────────────────────────────
function srAnnounce(msg){ const el=document.getElementById('sr-status'); if(el){ el.textContent=''; requestAnimationFrame(()=>el.textContent=msg); } }

let _lastFocusedBeforeOverlay = null;

function _blockCanvas(){ document.getElementById('canvas-blocker').classList.add('active'); }
function _unblockCanvas(){ document.getElementById('canvas-blocker').classList.remove('active'); MSG.visible=true; }

function openMenu(){
  _lastFocusedBeforeOverlay = document.activeElement;
  MSG.visible=true;
  // Camera glides to face the menu card on the counter
  ct.pos.copy(CMENU.pos); ct.look.copy(CMENU.look);
  targetFov=38;
  // Show overlay after camera is already moving — slight delay so zoom is felt first
  setTimeout(()=>{
    document.getElementById('menu-overlay').classList.add('active');
    openOverlayFocus('menu-overlay');
  },280);
  srAnnounce('Portfolio menu opened');
}
