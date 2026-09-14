// The animate loop and loader dismissal.
// Split from the original single-file index.html on 2026-09-13; classic script, shares the global scope
// with every other js/*.js file. Load order is the numeric prefix.
let t=0, lastTime=performance.now(), _frame=0;
// Cursor parallax targets (NDC-ish, -1..1), lerped each frame inside animate()
let _parX=0, _parY=0;
camera.position.copy(COUT.pos); camera.lookAt(COUT.look);

function animate(){
  requestAnimationFrame(animate);
  // Tab is backgrounded — skip all work. Browser already throttles rAF, but bailing saves the calc.
  if(_pageHidden) return;
  // Skip heavy work when overlays are fully covering the scene
  const _panelOpen = document.getElementById('panel-overlay').classList.contains('active');
  const _menuOpen = document.getElementById('menu-overlay').classList.contains('active');
  if((_panelOpen || _menuOpen) && !transitioning){
    // Still render at low rate for background visibility, but skip particle/light updates
    if(_frame % 8 === 0) { try { renderScene(); } catch(_){} }
    _frame++;
    return;
  }
  const now=performance.now();
  const dt=Math.min((now-lastTime)/1000, 0.05);
  lastTime=now; t+=dt; _frame++;
  const _skipFrame = _frame % 2 !== 0; // throttle non-critical updates
  const _skip3 = _frame % 3 !== 0; // heavier throttle for decorative updates

  // Cache shared pow — 0.85 alpha is snappier than 0.88
  const pow85 = Math.pow(0.85, dt*60);
  const lerpF = 1-pow85;
  cc.pos.lerp(ct.pos, lerpF); cc.look.lerp(ct.look, lerpF);

  const springDecay = Math.pow(0.82, dt*60);
  if(!dragging){ yaw*=springDecay; pitch*=springDecay; }

  const breathAmt = dragging ? 0 : 1;
  const breathY = Math.sin(t*0.72)*0.032 + Math.sin(t*1.18)*0.018;
  const breathX = Math.sin(t*0.51)*0.015;

  _breathV.copy(cc.pos);
  _breathV.y += breathY * breathAmt;
  _breathV.x += breathX * breathAmt;

  // Cursor parallax — gentle scene drift following the mouse when not actively dragging.
  // Lerp toward cursor NDC (-1..1) so motion feels silky instead of twitchy. Paused during
  // drag (breathAmt=0) so the user's direct input owns the camera.
  const _ndcX = (mx/innerWidth  - 0.5) * 2;
  const _ndcY = (my/innerHeight - 0.5) * 2;
  _parX += (_ndcX - _parX) * 0.055;
  _parY += (_ndcY - _parY) * 0.055;
  _breathV.x += _parX * 0.95 * breathAmt;
  _breathV.y += -_parY * 0.58 * breathAmt;
  _breathV.z += -Math.abs(_parY) * 0.15 * breathAmt; // slight dolly-in when looking up/down
  // Cursor-follow warm light: maps NDC to world space with heavy damping
  if (typeof _cursorLight !== 'undefined'){
    const _clx = _parX * 12;
    const _cly = 5.5 - _parY * 4;
    _cursorLight.position.x += (_clx - _cursorLight.position.x) * 0.085;
    _cursorLight.position.y += (_cly - _cursorLight.position.y) * 0.085;
  }
  // Kanji sprite drift
  if (typeof _kanjiParticles !== 'undefined'){
    for (let i=0; i<_kanjiParticles.length; i++){
      const sp = _kanjiParticles[i];
      sp.position.y += sp.userData.speed * dt * 2.2;
      if (sp.position.y > 24){
        sp.position.y = -8;
        sp.position.x = (Math.random() - 0.5) * 52;
      }
      sp.material.opacity = 0.05 + 0.12 * Math.abs(Math.sin(t * 0.35 + sp.userData.phase));
    }
  }

  _ldirV.subVectors(cc.look, _breathV).normalize();
  _rgtV.crossVectors(_ldirV, _upV).normalize();
  _oLookV.copy(cc.look)
    .addScaledVector(_rgtV, Math.sin(yaw)*20)
    .addScaledVector(_upV, Math.sin(pitch)*14);
  camera.position.copy(_breathV);
  camera.lookAt(_oLookV);
  if(RAMEN.cameraOverride){ try { RAMEN.cameraOverride(camera, dt, t); } catch(_){} }
  RAMEN.emit('frame', dt, t);

  // Name + HUD parallax — use cached refs
  if(!inside){
    if(elOutsideUI) elOutsideUI.style.transform=`translateX(calc(-50% + ${yaw*16}px))`;
    if(elTimeDisp)  elTimeDisp.style.transform  = `translateX(${yaw*-8}px) translateY(${pitch*-4}px)`;
    if(elAvailBadge) elAvailBadge.style.transform = `translateX(${yaw*8}px) translateY(${pitch*-4}px)`;
  }

  // Smooth FOV transition — reuse cached pow85
  if(Math.abs(camera.fov - targetFov) > 0.05){
    camera.fov += (targetFov - camera.fov) * lerpF;
    camera.updateProjectionMatrix();
  }

  // Breathing rain intensity (ebbs and flows over ~25s cycles)
  const rainIntensity = 0.65 + Math.sin(t*0.04)*0.22 + Math.sin(t*0.11)*0.13;
  rain.material.opacity = 0.32 * rainIntensity;
  const dtRain = dt * 60; // normalize to 60fps baseline — must be before any block that uses it

  // ── Exterior-only updates (skip when inside for performance) ─────────────
  if(!inside){
    // Rain streaks — dt-scaled per-streak speed variation
    const ra=rainGeo.attributes.position.array;
    for(let i=0;i<RC;i++){
      const spd = rainSpeeds[i];
      const fall = 0.28 * spd * dtRain * (0.9 + rainIntensity * 0.1);
      const drift = 0.1 * spd * dtRain;
      ra[i*6+1]-=fall; ra[i*6+4]-=fall;
      ra[i*6]-=drift;  ra[i*6+3]-=drift;
      if(ra[i*6+1]<0){
        const nx=(Math.random()-0.5)*90, ny=55, nz=(Math.random()-0.5)*90;
        const len=0.5+Math.random()*1.4;
        ra[i*6]=nx; ra[i*6+1]=ny; ra[i*6+2]=nz;
        ra[i*6+3]=nx-0.25*spd; ra[i*6+4]=ny-len; ra[i*6+5]=nz;
      }
    }
    rainGeo.attributes.position.needsUpdate=true;

    // Rain splash rings (throttled)
    if(!_skip3) splashPool.forEach(ring => {
      ring.userData.age += dt*3;
      if(ring.userData.age > ring.userData.maxAge){
        ring.userData.age = 0;
        ring.userData.maxAge = 0.6 + Math.random()*0.7;
        ring.position.set((Math.random()-0.5)*30, 0.03, Math.random()*12+2);
        ring.scale.setScalar(0.1);
      }
      const p = ring.userData.age / ring.userData.maxAge;
      ring.scale.setScalar(0.1 + p * 2.5);
      ring.material.opacity = (1-p) * 0.42;
    });

    // Street reflections (throttled)
    if(!_skip3) reflections.forEach(r => {
      r.material.emissiveIntensity = r.userData.base + Math.sin(t*2.2+r.userData.ph)*0.1;
      r.material.opacity = 0.35 + Math.sin(t*1.6+r.userData.ph)*0.08;
    });

    // Bokeh — dt-scaled
    const ba=bokehGeo.attributes.position.array;
    for(let i=0;i<BC;i++){
      ba[i*3+1]+=(bkD[i].vy+Math.sin(t*0.4+bkD[i].ph)*0.003)*dtRain;
      ba[i*3]+=bkD[i].vx*dtRain;
      if(ba[i*3+1]>16||ba[i*3+1]<1)bkD[i].vy*=-1;
      if(Math.abs(ba[i*3])>20)bkD[i].vx*=-1;
    }
    bokehGeo.attributes.position.needsUpdate=true;

    // Fireflies — gentle wandering with glow pulse (throttled)
    if(!_skipFrame){ const ffa = fireflyGeo.attributes.position.array;
    for(let i=0;i<FIREFLY_COUNT;i++){
      ffa[i*3]   += (ffData[i].vx + Math.sin(t*0.6+ffData[i].ph)*0.005) * dtRain;
      ffa[i*3+1] += (ffData[i].vy + Math.sin(t*0.8+ffData[i].ph)*0.003) * dtRain;
      if(ffa[i*3+1] < 1 || ffa[i*3+1] > 10) ffData[i].vy *= -1;
      if(Math.abs(ffa[i*3]) > 25) ffData[i].vx *= -1;
    }
    fireflyGeo.attributes.position.needsUpdate = true;
    fireflyMat.opacity = 0.3 + Math.sin(t*0.5)*0.15; }

    // Splash rings handled separately below

    // Building window flicker — deterministic noise, no Math.random() per frame
    if(!_skipFrame) flickerWindows.forEach(w=>{
      const noise = Math.sin(t*0.8+w.ph)*0.12 + Math.sin(t*2.1+w.ph*1.7)*0.06;
      const flick = Math.sin(t*37.3+w.ph*11)>0.97 ? 0 : 1;  // rare blink via sin
      w.mesh.material.emissiveIntensity = (w.base + noise) * flick;
    });
  } // end !inside guard

  // dtRain declared above before all blocks

  // ── Interior-only updates ─────────────────────────────────────────────────
  if(inside){
    // Ambient light breathing — slow candle-warmth variation
    iAmb.intensity = 1.28 + Math.sin(t*0.22)*0.10 + Math.sin(t*0.07)*0.05;

    // Counter reflection shimmer
    ctReflect.material.emissiveIntensity = 0.1 + Math.sin(t*1.4)*0.04 + Math.sin(t*2.8)*0.02;

    // Steam — throttled
    if(!_skipFrame) steamPtcls.forEach(s=>{
      s.position.y += s.userData.sp * dtRain * 2;
      s.position.x += (Math.sin(t*1.8+s.userData.ph)*0.004 + s.userData.dr) * dtRain * 2;
      const lr=(s.position.y-s.userData.baseY)/2.8;
      s.material.opacity=0.2*(1-lr); s.scale.setScalar(1+lr*0.8);
      if(s.position.y>s.userData.baseY+2.8){s.position.y=s.userData.baseY;s.material.opacity=0.18;s.scale.setScalar(1);}
    });

    // Kitchen dust motes + warm dust — throttled
    if(!_skip3){
      dustMotes.forEach(d=>{
        d.position.y += (d.userData.vy + Math.sin(t*0.8+d.userData.ph)*0.004) * dtRain * 3;
        d.position.x += d.userData.vx * dtRain * 3;
        d.material.opacity = 0.15 + Math.sin(t*1.2+d.userData.ph)*0.1;
        if(d.position.y<2.5||d.position.y>7.5) d.userData.vy*=-1;
        if(Math.abs(d.position.x)>3) d.userData.vx*=-1;
      });
      warmDust.forEach(d=>{
        d.position.y += (d.userData.vy + Math.sin(t*0.5+d.userData.ph)*0.003) * dtRain * 3;
        d.position.x += d.userData.vx * dtRain * 3;
        d.material.opacity = 0.05 + Math.sin(t*0.8+d.userData.ph)*0.08;
        if(d.position.y < 0.5 || d.position.y > 9.5) d.userData.vy *= -1;
        if(Math.abs(d.position.x) > 11) d.userData.vx *= -1;
      });
    }
  }

  // ── Always-on updates ─────────────────────────────────────────────────────

  // Exterior lanterns + noren (visible outside, not inside)
  if(!inside){
    extLanterns.forEach((lg,i)=>{lg.rotation.z=Math.sin(t*0.65+i*0.9)*0.065;});
    // Antenna blink — slow red pulse
    _antBlinkCache.forEach(o=>{ o.material.emissiveIntensity=3*(Math.sin(t*1.4)>0.7?1:0.1); });
    // Noren — organic wave using both axes
    norenMeshes.forEach((n,i)=>{ 
      n.rotation.y = Math.sin(t*0.55+n.userData.phase)*0.042;
      n.rotation.z = Math.sin(t*0.32+n.userData.phase*0.7)*0.014;
    });
    // Night clouds + stars
    if(!_skipFrame) cloudMeshes.forEach(cl=>{
      cl.position.x += cl.userData.speed * dtRain;
      if(cl.position.x > cl.userData.startX + 90) cl.position.x = cl.userData.startX - 90;
    })
    // Star twinkle — simple global pulse
    starMat.opacity = 0.55 + Math.sin(t*0.35)*0.12 + Math.sin(t*0.87)*0.08;
  } else {
    intLanterns.forEach((lg,i)=>{lg.rotation.z=Math.sin(t*0.48+i*1.3)*0.042;});
    starMat.opacity = 0;
  }

  // ── Exterior-only always-on effects ─────────────────────────────────────
  if(!inside){
    doorGlass.material.emissiveIntensity = (hovering ? 0.52 : 0.22) + Math.sin(t*1.6)*0.04;
    // Rooftop sign lights — slow warm pulse
    const sp = 0.85 + Math.sin(t*0.4)*0.15;
    signLights[0].intensity = 2.8 * sp;
    signLights[1].intensity = 2.2 * (0.85 + Math.sin(t*0.4+1.0)*0.15);
    signLights[2].intensity = 1.6 * (0.85 + Math.sin(t*0.4+2.0)*0.15);
    const fl=Math.sin(t*22)>0.92?0:1;
    openMesh.material.opacity=0.75+fl*0.25;
    openLight.intensity=(0.9+fl*0.9)*(0.85+Math.sin(t*0.8)*0.15);
    const yfl=Math.sin(t*19.7)>0.86?0.25:Math.sin(t*3.2)>0.92?0.6:1;
    yakiMesh.material.opacity = 0.72 + yfl * 0.28;
    izakayaMesh.material.opacity = 0.65 + Math.sin(t*0.7)*0.35;
    h24Mesh.material.opacity = 0.8 + Math.sin(t*1.8)*0.2;
    karaMesh.material.opacity = 0.6 + (Math.sin(t*14)>0.85?0:1)*0.4;
    if(typeof yakinikuMesh!=='undefined') yakinikuMesh.material.opacity = 0.7 + Math.sin(t*1.1)*0.3;
    if(typeof hotelMesh!=='undefined') hotelMesh.material.opacity = 0.65 + (Math.sin(t*9)>0.88?0.1:1)*0.35;
    catTail.rotation.z = Math.sin(t*2.1)*0.55 + 0.28;
    const blink=Math.sin(t*1.1)*Math.sin(t*0.7);
    eyeMat.emissiveIntensity=blink>0.95?0.05:3;
    moonDisk.lookAt(camera.position);
    moonHalo.lookAt(camera.position);
    moonGlow.intensity = 0.45 + Math.sin(t*0.18)*0.1;
    if(!_skipFrame) passingCars.forEach(c=>{
      c.x += c.speed * dtRain * 0.11;
      if(c.x > 90) c.x = -90;
      c.tl1.position.x = c.x - 0.65; c.tl2.position.x = c.x + 0.65;
      c.cl.position.x = c.x;
      const pulse = 2.3 + Math.sin(t*8+c.z)*0.3;
      c.tl1.material.emissiveIntensity = pulse;
      c.tl2.material.emissiveIntensity = pulse;
      c.cl.intensity = 1.6 + Math.sin(t*8+c.z)*0.2;
    });
    if(!_skipFrame){
    awningDrips.forEach(d=>{
      d.userData.t += dt*2;
      if(!d.userData.falling){
        if(d.userData.t > d.userData.interval){
          d.userData.falling=true; d.userData.t=0;
          d.position.set(d.userData.startX+(Math.random()-0.5)*0.5,d.userData.startY,3.5);
        }
        d.material.opacity=0;
      } else {
        d.position.y -= d.userData.speed * dtRain * 2;
        const life=(d.userData.startY-d.position.y)/5;
        d.material.opacity=life<0.15?life/0.15*0.7:(1-life)*0.7;
        d.scale.setScalar(1+life*0.6);
        if(d.position.y<0){d.userData.falling=false;d.userData.t=0;d.userData.interval=0.8+Math.random()*2.5;d.material.opacity=0;}
      }
    });
    steamVentPtcls.forEach(sv=>{
      sv.position.y += sv.userData.sp * dtRain * 2;
      sv.position.x += Math.sin(t*1.2+sv.userData.ph)*0.003 * dtRain * 2;
      const life=(sv.position.y-sv.userData.baseY)/2.2;
      sv.material.opacity=life<0.3?life/0.3*0.28:(1-life)*0.28;
      sv.scale.setScalar(1+life*1.2);
      if(sv.position.y>sv.userData.baseY+2.2){sv.position.y=sv.userData.baseY;sv.position.x=sv.userData.bx+(Math.random()-0.5)*0.8;}
    });
    }
  } else {
    // Ensure exterior lights off when inside
    passingCars.forEach(c=>{c.cl.intensity=0;c.tl1.material.emissiveIntensity=0;c.tl2.material.emissiveIntensity=0;});
  }

  // ── Interior-only always-on effects ──────────────────────────────────────
  if(inside){
    menuSignMesh.material.opacity = 0.65 + Math.sin(t*1.1)*0.35;
    menuLight.intensity = 2.0 + Math.sin(t*2.3+1.2)*0.5;
    menuFloorGlow.material.emissiveIntensity = 0.18 + Math.sin(t*1.1)*0.1;
    menuFloorGlow.material.opacity = 0.22 + Math.sin(t*1.1)*0.1;
    kGlow.material.emissiveIntensity=1.8+Math.sin(t*13)*0.18+Math.sin(t*7.3)*0.12;
  }

  // Condensation fade (lerp toward target, always-on)
  condMesh.material.opacity += (condTarget - condMesh.material.opacity) * (1 - Math.pow(0.985, dt*60));

  // Rain audio tracks intensity (outside only)
  if(!inside && audioCtx && soundEnabled && rainGainNode){
    const tv = 0.09 * rainIntensity;
    rainGainNode.gain.setTargetAtTime(tv, audioCtx.currentTime, 1.2);
  }

  // Animate entrance sparks (pooled)
  if(window._sparkPool) window._sparkPool.forEach((s,i)=>{
    const d=window._sparkData[i]; if(!d.active)return;
    d.life-=dt*1.2; if(d.life<=0){d.active=false;s.visible=false;return;}
    s.position.x+=d.vx; s.position.y+=d.vy; d.vy-=0.003;
    s.position.z+=d.vz; s.material.opacity=d.life*0.8; s.scale.setScalar(d.life);
  });

  // Wrap main render in try/catch — a single render failure (mid context-loss,
  // shader recompile, etc.) shouldn't stop the animate loop from trying next frame.
  try { renderScene(); } catch(_) {}
}
animate();
RAMEN.ready = true;

setTimeout(()=>{
  const l=document.getElementById('loader'); l.classList.add('hidden');
  setTimeout(()=>{if(l.parentNode)l.parentNode.removeChild(l);},1000);
},2400);

// ── Night Shift portfolio layer ──────────────────────────────────────────
// This adds a guided editorial path without replacing the free-form 3D shop.
