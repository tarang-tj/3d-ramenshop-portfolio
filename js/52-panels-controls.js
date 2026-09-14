// openPanel and closePanel, mouse, touch, keyboard, wheel, resize, visibility, chime, contact form, condensation, focus trap, panel scroll progress.
// Split from the original single-file index.html on 2026-09-13; classic script, shares the global scope
// with every other js/*.js file. Load order is the numeric prefix.

function openPanel(s, fromMenu=false){
  _panelFromMenu = fromMenu;
  _lastFocusedBeforeOverlay = document.activeElement;
  MSG.visible=false; // hide stand while reading full panel
  // A focused case study deserves an uncluttered reading surface.
  document.getElementById('interact-card')?.classList.remove('visible');
  document.getElementById('toast-stack')?.replaceChildren();
  srAnnounce(PANEL_LABELS[s] + ' panel opened. Use arrow keys or Tab to navigate.');
  // Audio tick if sound enabled
  if(audioCtx && soundEnabled){
    const osc=audioCtx.createOscillator();
    const g=audioCtx.createGain();
    osc.connect(g); g.connect(audioCtx.destination);
    osc.type='sine'; osc.frequency.setValueAtTime(880,audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440,audioCtx.currentTime+0.08);
    g.gain.setValueAtTime(0.06,audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.12);
    osc.start(); osc.stop(audioCtx.currentTime+0.12);
  }
  const prevIdx = PANEL_ORDER.indexOf(currentPanel);  const newIdx  = PANEL_ORDER.indexOf(s);
  const dir = newIdx > prevIdx ? 'right' : newIdx < prevIdx ? 'left' : null;
  currentPanel = s;
  document.querySelectorAll('.inside-nav-btn').forEach(b=>{
    b.classList.toggle('active', b.dataset.panel === s);
  });
  document.getElementById('menu-overlay').classList.remove('active');
  document.getElementById('panel-body').innerHTML = panels[s];

  // Scroll hint on long panels
  if(s === 'projects'){
    document.getElementById('panel-body').innerHTML += '<div class="scroll-hint">↓ scroll for more</div>';
  }

  const idx = newIdx;
  const prev = idx > 0 ? PANEL_ORDER[idx-1] : null;
  const next = idx < PANEL_ORDER.length-1 ? PANEL_ORDER[idx+1] : null;
  const dots = PANEL_ORDER.map((p,i)=>`<button class="panel-dot${i===idx?' active':''}" onclick="openPanel('${p}')" aria-label="${PANEL_LABELS[p]}" aria-current="${i===idx?'true':'false'}" title="${PANEL_LABELS[p]}"></button>`).join('');
  document.getElementById('panel-body').innerHTML += `<div class="panel-nav">
    <button class="panel-nav-btn"${!prev?' disabled':''} onclick="${prev?`openPanel('${prev}')`:''}" aria-label="${prev?'Previous: '+PANEL_LABELS[prev]:'No previous panel'}">${prev?'← '+PANEL_LABELS[prev]:'← Prev'}</button>
    <div class="panel-nav-dots" role="tablist" aria-label="Panel navigation">${dots}</div>
    <button class="panel-nav-btn"${!next?' disabled':''} onclick="${next?`openPanel('${next}')`:''}" aria-label="${next?'Next: '+PANEL_LABELS[next]:'No next panel'}">${next?PANEL_LABELS[next]+' →':'Next →'}</button>
  </div>`;

  // Update overlay aria-label
  const overlay = document.getElementById('panel-overlay');
  overlay.setAttribute('aria-label', PANEL_LABELS[s] + ' Panel');
  const card = _panelCard;
  overlay.classList.add('active');
  if(card && dir){
    card.classList.remove('slide-right','slide-left');
    void card.offsetWidth;
    card.classList.add('slide-'+dir);
  }
  if(card) card.scrollTop = 0;
  // Auto-focus close button for keyboard users
  requestAnimationFrame(()=>{
    const closeBtn = overlay.querySelector('.panel-close');
    if(closeBtn && document.activeElement && document.activeElement.tagName==='BUTTON') closeBtn.focus();
  });

  if(s==='skills') requestAnimationFrame(()=>requestAnimationFrame(()=>{
    document.querySelectorAll('.skill-bar-fill').forEach((el,i)=>{
      setTimeout(()=>{ el.style.width=el.dataset.w+'%'; }, i*55+60);
    });
  }));
}
function closePanel(){
  const el=document.getElementById('panel-overlay');
  if(!el.classList.contains('active')) return; // already closed
  el.classList.add('overlay-closing');
  MSG.visible=true;
  setTimeout(()=>{
    el.classList.remove('active','overlay-closing');
    if(_panelFromMenu){
      document.getElementById('menu-overlay').classList.add('active');
    } else if(inside && !transitioning){
      ct.pos.copy(CIN.pos); ct.look.copy(CIN.look); targetFov=68;
      if(_lastFocusedBeforeOverlay){try{_lastFocusedBeforeOverlay.focus();}catch(e){}}
    }
    document.querySelectorAll('.inside-nav-btn').forEach(b=>b.classList.remove('active'));
    srAnnounce('Panel closed');
  },200);
}
window.openPanel=openPanel; window.closePanel=closePanel;
function closeMenu(){
  const el=document.getElementById('menu-overlay');
  if(!el.classList.contains('active')) return; // already closed
  el.classList.add('overlay-closing');
  document.getElementById('panel-overlay').classList.remove('active');
  setTimeout(()=>{
    el.classList.remove('active','overlay-closing');
    // Only restore interior camera if we're still inside and not mid-transition
    if(inside && !transitioning){
      ct.pos.copy(CIN.pos); ct.look.copy(CIN.look);
      targetFov=68;
    }
    if(_lastFocusedBeforeOverlay){try{_lastFocusedBeforeOverlay.focus();}catch(e){}}
  },200);
}
// Moved here from the interaction file: function declarations only hoist within their own script file.
window.closeMenu=closeMenu;

// ── Events ────────────────────────────────────────────────────────────────
let clickStart={x:0,y:0}; // separate from dragStart — not updated mid-drag
renderer.domElement.addEventListener('mousemove',e=>{
  prevMouse.x=e.clientX; prevMouse.y=e.clientY; checkHover(e);
  if(dragging){
    const dx=e.clientX-dragStart.x, dy=e.clientY-dragStart.y;
    yaw-=dx*0.0028; pitch-=dy*0.0028;
    const yl=inside?0.58:0.44;
    yaw=Math.max(-yl,Math.min(yl,yaw)); pitch=Math.max(-0.38,Math.min(0.38,pitch));
    dragStart.x=e.clientX; dragStart.y=e.clientY;
  }
});
renderer.domElement.addEventListener('mousedown',e=>{
  dragging=true;
  dragStart.x=e.clientX; dragStart.y=e.clientY;
  clickStart.x=e.clientX; clickStart.y=e.clientY;
  cursorRing.classList.add('dragging');
  // Spawn ripple
  const r=document.createElement('div'); r.className='click-ripple';
  r.style.left=e.clientX+'px'; r.style.top=e.clientY+'px';
  document.body.appendChild(r);
  setTimeout(()=>r.remove(), 700);
});
renderer.domElement.addEventListener('mouseup',e=>{
  dragging=false;
  cursorRing.classList.remove('dragging');
  if(Math.hypot(e.clientX-clickStart.x,e.clientY-clickStart.y)<8)handleClick(e);
});
function handleClick(e){
  if(transitioning) return;
  if(document.getElementById('menu-overlay').classList.contains('active'))return;
  if(document.getElementById('panel-overlay').classList.contains('active'))return;
  m2d.x=(e.clientX/innerWidth)*2-1; m2d.y=-(e.clientY/innerHeight)*2+1;
  ray.setFromCamera(m2d,camera);
  if(!inside){
    if(ray.intersectObject(doorZone).length>0) enterShop();
  } else {
    if(ray.intersectObjects([menuZone,menuCard],true).length>0){openMenu();return;}
    const lh=ray.intersectObjects(intLanterns,true);
    if(lh.length>0){let o=lh[0].object;while(o&&!o.userData.panel)o=o.parent;if(o&&o.userData.panel){openPanel(o.userData.panel);return;}}
    // Interact zones
    const ih=ray.intersectObjects(interactZones,true);
    if(ih.length>0){
      const d=ih[0].object.userData;
      if(d.type==='seat'){ takeSeat(d.seatIdx); return; }
      if(d.type==='bowl'){ inspectBowl(d.bowlIdx, d); return; }
      if(d.type==='cat'){
        const now=performance.now();
        if(now-_lastMeowTime<800){ playPurr(); } else { playMeow(); }
        _lastMeowTime=now;
        showInteractCard(d); return;
      }
      if(d.type==='clock'){ showInteractCard(getClockFact()); return; }
      if(d.type==='fact'){ showInteractCard(d); return; }
    }
  }
}
let tPrev={x:0,y:0}, tClickStart={x:0,y:0};
renderer.domElement.addEventListener('touchstart',e=>{
  tPrev.x=e.touches[0].clientX; tPrev.y=e.touches[0].clientY;
  tClickStart.x=tPrev.x; tClickStart.y=tPrev.y;
  dragging=true; dragStart.x=tPrev.x; dragStart.y=tPrev.y;
  _lastTouchTime=performance.now();
},{passive:true});
renderer.domElement.addEventListener('touchend',e=>{
  dragging=false;
  const lx=e.changedTouches[0].clientX, ly=e.changedTouches[0].clientY;
  if(Math.hypot(lx-tClickStart.x, ly-tClickStart.y)<12){
    handleClick({clientX:lx, clientY:ly});
  } else {
    // Apply momentum flick
    yaw -= _touchVX * 0.004 * 8;
    pitch -= _touchVY * 0.004 * 8;
    const yl=inside?0.58:0.44;
    yaw=Math.max(-yl,Math.min(yl,yaw)); pitch=Math.max(-0.38,Math.min(0.38,pitch));
  }
  _touchVX=0; _touchVY=0;
});
renderer.domElement.addEventListener('touchcancel',()=>{ dragging=false; _touchVX=0; _touchVY=0; });

// ESC + keyboard shortcuts
document.addEventListener('keydown',e=>{
  // Never intercept when user is typing
  if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)) return;

  const panelOpen = document.getElementById('panel-overlay').classList.contains('active');
  const menuOpen  = document.getElementById('menu-overlay').classList.contains('active');
  const kbOpen    = document.getElementById('kb-overlay').classList.contains('active');

  if(e.key==='Escape'){
    if(kbOpen)  { document.getElementById('kb-overlay').classList.remove('active'); return; }
    if(panelOpen){ closePanel(); return; }
    if(menuOpen) { closeMenu();  return; }
    if(bowlInspecting){ returnFromBowl(); return; }
    if(seated)   { standUp(); return; }
    hideInteractCard();
    return;
  }

  // Panel arrow navigation
  if(panelOpen){
    const cur = PANEL_ORDER.indexOf(currentPanel);
    if(e.key==='ArrowRight'||e.key==='ArrowDown'){
      if(cur<PANEL_ORDER.length-1){ e.preventDefault(); openPanel(PANEL_ORDER[cur+1]); return; }
    }
    if(e.key==='ArrowLeft'||e.key==='ArrowUp'){
      if(cur>0){ e.preventDefault(); openPanel(PANEL_ORDER[cur-1]); return; }
    }
    if(e.key==='Home'){ e.preventDefault(); openPanel(PANEL_ORDER[0]); return; }
    if(e.key==='End')  { e.preventDefault(); openPanel(PANEL_ORDER[PANEL_ORDER.length-1]); return; }
    return;
  }

  // Number keys open panels directly (inside shop)
  if(inside && !transitioning && !menuOpen && !kbOpen){
    if(e.key==='1') { openPanel('projects');   return; }
    if(e.key==='2') { openPanel('experience'); return; }
    if(e.key==='3') { openPanel('skills');     return; }
    if(e.key==='4') { openPanel('contact');    return; }
    if(e.key==='m'||e.key==='M') { openMenu(); return; }
    // H to step back outside
    if(e.key==='h'||e.key==='H') { exitShop(); return; }
  }

  // Enter/E to enter shop from outside
  if(!inside && !transitioning && !kbOpen && (e.key==='Enter'||e.key==='e'||e.key==='E')) { enterShop(); return; }

  // Global shortcuts
  if(e.key==='s'||e.key==='S') toggleSound();
  if(e.key==='l'||e.key==='L') toggleLofi();
  if(e.key==='n'||e.key==='N') toggleDayNight();
  if(e.key==='?') toggleKb();
});

// Backdrop click to close
document.getElementById('menu-overlay').addEventListener('click',e=>{
  if(e.target===document.getElementById('menu-overlay')) closeMenu();
});
document.getElementById('panel-overlay').addEventListener('click',e=>{
  if(e.target===document.getElementById('panel-overlay')) closePanel();
});

renderer.domElement.addEventListener('wheel',e=>{
  camera.getWorldDirection(_dirV);
  cc.pos.addScaledVector(_dirV,-e.deltaY*(inside?0.018:0.022));
  // Clamp zoom bounds
  if(!inside){ cc.pos.z=Math.max(12,Math.min(80,cc.pos.z)); }
  else { cc.pos.z=Math.max(-40,Math.min(-3,cc.pos.z)); }
},{passive:true});

// Touch momentum
let _touchVX=0, _touchVY=0, _lastTouchTime=0;
renderer.domElement.addEventListener('touchmove',e=>{
  if(!dragging) return;
  const now2=performance.now();
  const dtT=Math.max(1, now2-_lastTouchTime);
  const dx=e.touches[0].clientX-tPrev.x, dy=e.touches[0].clientY-tPrev.y;
  _touchVX=dx/dtT; _touchVY=dy/dtT; _lastTouchTime=now2;
  yaw-=dx*0.004; pitch-=dy*0.004;
  const yl=inside?0.58:0.44;
  yaw=Math.max(-yl,Math.min(yl,yaw)); pitch=Math.max(-0.38,Math.min(0.38,pitch));
  tPrev.x=e.touches[0].clientX; tPrev.y=e.touches[0].clientY;
},{passive:true});
// Debounced resize — avoids layout thrash while dragging window edge or rotating device
let _resizeTimer;
window.addEventListener('resize',()=>{
  clearTimeout(_resizeTimer);
  _resizeTimer=setTimeout(()=>{
    camera.aspect=innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight);
    applyDPR();
    // Keep the bloom composer sized to the same effective DPR as the renderer.
    if(composer){
      composer.setPixelRatio(renderer.getPixelRatio());
      composer.setSize(innerWidth,innerHeight);
      if(bloomPass) bloomPass.setSize(innerWidth/2,innerHeight/2);
    }
  },120);
});
// Pause rendering when tab is hidden so the scene isn't fighting the user's other work for GPU
let _pageHidden=false;
document.addEventListener('visibilitychange',()=>{
  _pageHidden=document.hidden;
  // Reset time reference so dt doesn't explode on resume
  if(!_pageHidden && typeof lastTime!=='undefined') lastTime=performance.now();
});

function playChime(){
  if(!audioCtx||!soundEnabled) return;
  [[523.25,0],[783.99,0.14]].forEach(([freq,delay])=>{
    const osc=audioCtx.createOscillator(), g=audioCtx.createGain();
    osc.connect(g); g.connect(audioCtx.destination);
    osc.type='sine'; osc.frequency.value=freq;
    const s=audioCtx.currentTime+delay;
    g.gain.setValueAtTime(0,s); g.gain.linearRampToValueAtTime(0.07,s+0.02);
    g.gain.exponentialRampToValueAtTime(0.001,s+0.55);
    osc.start(s); osc.stop(s+0.6);
  });
}
function playSlurp(){
  if(!audioCtx||!soundEnabled) return;
  const osc=audioCtx.createOscillator(), g=audioCtx.createGain();
  const f=audioCtx.createBiquadFilter(); f.type='bandpass'; f.frequency.value=700; f.Q.value=4;
  osc.connect(f); f.connect(g); g.connect(audioCtx.destination);
  osc.type='sawtooth';
  osc.frequency.setValueAtTime(580,audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(180,audioCtx.currentTime+0.2);
  g.gain.setValueAtTime(0.06,audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.25);
  osc.start(); osc.stop(audioCtx.currentTime+0.28);
}
function copyEmail(){
  navigator.clipboard.writeText('tarangjammalamadaka9@gmail.com').then(()=>{
    const btn=document.getElementById('copy-email-btn');
    if(btn){btn.textContent='✓ Copied'; btn.classList.add('copied'); setTimeout(()=>{btn.textContent='Copy';btn.classList.remove('copied');},2200);}
  }).catch(()=>{});
}
function sendContactForm(){
  const name = document.getElementById('cf-name')?.value.trim() || '';
  const email = document.getElementById('cf-email')?.value.trim() || '';
  const msg  = document.getElementById('cf-msg')?.value.trim() || '';
  if(!msg){ const m=document.getElementById('cf-msg'); if(m){m.focus();m.style.borderColor='#8b1a1a';setTimeout(()=>m.style.borderColor='',1500);} return; }
  const subject = encodeURIComponent('Portfolio Contact' + (name ? ' — '+name : ''));
  const body = encodeURIComponent(
    (name  ? 'Name: '+name+'\n'  : '') +
    (email ? 'Email: '+email+'\n': '') +
    '\n' + msg
  );
  window.open('https://mail.google.com/mail/?view=cm&to=tarangjammalamadaka9%40gmail.com&su='+subject+'&body='+body,'_blank','noopener');
}
window.sendContactForm = sendContactForm;
window.copyEmail=copyEmail;

// ── Door condensation (visible from inside) ───────────────────────────────
const condCanvas=document.createElement('canvas'); condCanvas.width=256; condCanvas.height=512;
const condCtx=condCanvas.getContext('2d');
const condGrad=condCtx.createLinearGradient(0,0,0,512);
condGrad.addColorStop(0,'rgba(175,205,230,0.06)'); condGrad.addColorStop(0.5,'rgba(175,205,230,0.12)'); condGrad.addColorStop(1,'rgba(175,205,230,0.05)');
condCtx.fillStyle=condGrad; condCtx.fillRect(0,0,256,512);
for(let i=0;i<28;i++){
  const cx=Math.random()*240+8, cy=Math.random()*380+20, ch=25+Math.random()*70;
  condCtx.strokeStyle=`rgba(180,215,245,${0.12+Math.random()*0.18})`; condCtx.lineWidth=0.6+Math.random()*0.8;
  condCtx.beginPath(); condCtx.moveTo(cx,cy); condCtx.bezierCurveTo(cx+(Math.random()-0.5)*10,cy+ch*0.35,cx+(Math.random()-0.5)*10,cy+ch*0.7,cx+(Math.random()-0.5)*6,cy+ch); condCtx.stroke();
}
for(let i=0;i<45;i++){
  condCtx.fillStyle=`rgba(195,220,248,${0.1+Math.random()*0.22})`;
  const cr=0.8+Math.random()*2.8;
  condCtx.beginPath(); condCtx.arc(Math.random()*250+3,Math.random()*505+3,cr,0,Math.PI*2); condCtx.fill();
}
const condMesh=new THREE.Mesh(
  new THREE.PlaneGeometry(4.7,6.9),
  new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(condCanvas),transparent:true,opacity:0,side:THREE.FrontSide,depthWrite:false})
);
condMesh.position.set(0,5.05,0.22); scene.add(condMesh);
let condTarget=0; // animated opacity target

// ── Focus trap utility ────────────────────────────────────────────────────
function getFocusable(el){
  return [...el.querySelectorAll('button:not([disabled]),[href],[tabindex]:not([tabindex="-1"]),input,select,textarea')].filter(e=>e.offsetParent!==null);
}
function trapFocus(overlay){
  overlay.addEventListener('keydown',function trap(e){
    if(e.key!=='Tab') return;
    const els=getFocusable(overlay);
    if(!els.length) return;
    const first=els[0], last=els[els.length-1];
    if(e.shiftKey){ if(document.activeElement===first){e.preventDefault();last.focus();} }
    else { if(document.activeElement===last){e.preventDefault();first.focus();} }
  });
}
// Wire up traps once
['menu-overlay','panel-overlay','kb-overlay'].forEach(id=>{
  const el=document.getElementById(id); if(el) trapFocus(el);
});
function openOverlayFocus(overlayId){
  const el=document.getElementById(overlayId);
  if(!el) return;
  requestAnimationFrame(()=>{
    const first=getFocusable(el)[0]; if(first) first.focus();
  });
}

// ── Sound button aria-pressed sync ────────────────────────────────────────
function syncSoundBtn(){
  const btn=document.getElementById('sound-btn');
  if(btn) btn.setAttribute('aria-pressed', soundEnabled?'true':'false');
}
function toggleKb(){
  const ov=document.getElementById('kb-overlay');
  ov.classList.toggle('active');
  if(ov.classList.contains('active')) openOverlayFocus('kb-overlay');
}
window.toggleKb = toggleKb;
let _cachedPanelCard = null;
document.querySelector('.panel-card').addEventListener('scroll', e=>{
  const fill = document.getElementById('panel-progress-fill');
  if(!fill) return;
  if(!_cachedPanelCard || !_cachedPanelCard.isConnected) _cachedPanelCard = document.querySelector('.panel-card');
  if(!_cachedPanelCard) return;
  const pct = _cachedPanelCard.scrollTop / Math.max(1, _cachedPanelCard.scrollHeight - _cachedPanelCard.clientHeight) * 100;
  fill.style.width = Math.min(100, pct) + '%';
}, {passive:true, capture:true});
// ── Interior wall painting — framed mountain landscape ───────────────────
