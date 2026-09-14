// Interior: floor, ceiling, walls, counter, stools, bowls, menu board, lanterns, decals, clock, blocker.
// Split from the original single-file index.html on 2026-09-13; classic script, shares the global scope
// with every other js/*.js file. Load order is the numeric prefix.
const floorCanvas=(()=>{
  const c=document.createElement('canvas'); c.width=512; c.height=512;
  const ctx=c.getContext('2d');
  ctx.fillStyle='#130d07'; ctx.fillRect(0,0,512,512);
  const plankW=38, plankColors=['#1a1008','#160e06','#1e1308','#12100a','#1a1208'];
  for(let x=0;x<512;x+=plankW){
    ctx.fillStyle=plankColors[Math.floor(x/plankW)%plankColors.length];
    ctx.fillRect(x,0,plankW-1,512);
    // Wood grain lines
    for(let g=0;g<8;g++){
      const gy=Math.random()*512;
      ctx.strokeStyle=`rgba(0,0,0,${0.06+Math.random()*0.08})`;
      ctx.lineWidth=0.5+Math.random()*0.8;
      ctx.beginPath(); ctx.moveTo(x+2,gy); ctx.bezierCurveTo(x+plankW*0.4,gy+Math.random()*30-15,x+plankW*0.6,gy+Math.random()*30-15,x+plankW-2,gy+Math.random()*20-10); ctx.stroke();
    }
    // Dark edge
    const edgeG=ctx.createLinearGradient(x,0,x+3,0);
    edgeG.addColorStop(0,'rgba(0,0,0,0.35)'); edgeG.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=edgeG; ctx.fillRect(x,0,5,512);
  }
  // Plank joints every 64px
  for(let y=0;y<512;y+=64){
    ctx.strokeStyle='rgba(0,0,0,0.22)'; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(512,y); ctx.stroke();
  }
  return c;
})();
const floorTex=new THREE.CanvasTexture(floorCanvas);
floorTex.wrapS=floorTex.wrapT=THREE.RepeatWrapping; floorTex.repeat.set(6,10);
const iFloor=new THREE.Mesh(new THREE.PlaneGeometry(24,42),new THREE.MeshStandardMaterial({map:floorTex,roughness:0.32,metalness:0.08,envMapIntensity:0.4}));
iFloor.rotation.x=-Math.PI/2; iFloor.position.set(0,0.02,-20); scene.add(iFloor);
// Entrance threshold step
B(24,0.12,0.5,M(0x3a2810,0,0,0.6,0.4),0,0.06,-1.2);
const tlM=M(0x0a0806,0,0,0.95);
// Subtle floor grid — just z-direction planks aligned with wood grain
for(let z=-4;z>=-40;z-=8)B(24,0.008,0.04,tlM,0,0.03,z);
const iCeil=new THREE.Mesh(new THREE.PlaneGeometry(24,42),M(0x12100a));
iCeil.rotation.x=Math.PI/2; iCeil.position.set(0,12,-20); scene.add(iCeil);

// ── Ceiling texture — dark wood with subtle beam shadows ──────────────────
(()=>{
  const cc=document.createElement('canvas'); cc.width=512; cc.height=512;
  const ctx=cc.getContext('2d');
  ctx.fillStyle='#0e0c08'; ctx.fillRect(0,0,512,512);
  // Subtle plank pattern
  for(let x=0;x<512;x+=52){
    ctx.fillStyle=['#0e0b07','#100d08','#0c0a06'][Math.floor(x/52)%3];
    ctx.fillRect(x,0,51,512);
    ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.fillRect(x,0,2,512);
  }
  // Cross beam shadows
  for(let y=0;y<512;y+=128){
    const g=ctx.createLinearGradient(0,y,0,y+24);
    g.addColorStop(0,'rgba(0,0,0,0.35)'); g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g; ctx.fillRect(0,y,512,24);
  }
  const ceilTex=new THREE.CanvasTexture(cc);
  ceilTex.wrapS=ceilTex.wrapT=THREE.RepeatWrapping; ceilTex.repeat.set(4,7);
  iCeil.material=new THREE.MeshStandardMaterial({map:ceilTex,roughness:0.92});
})();

// ── Tea cup on counter ────────────────────────────────────────────────────
(()=>{
  const cupMat=new THREE.MeshStandardMaterial({color:0xf0e8d0,roughness:0.7});
  const cup=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.09,0.22,12),cupMat);
  cup.position.set(-9,5.47,-21.5); scene.add(cup);
  // Handle
  const handle=new THREE.Mesh(new THREE.TorusGeometry(0.08,0.018,6,10,Math.PI),
    new THREE.MeshStandardMaterial({color:0xe8d8b0,roughness:0.7}));
  handle.rotation.y=Math.PI/2; handle.position.set(-9.17,5.47,-21.5); scene.add(handle);
  // Tea surface
  const tea=new THREE.Mesh(new THREE.CircleGeometry(0.11,12),
    new THREE.MeshStandardMaterial({color:0x7a4a10,roughness:0.3,emissive:0x3a1804,emissiveIntensity:0.2}));
  tea.rotation.x=-Math.PI/2; tea.position.set(-9,5.58,-21.5); scene.add(tea);
  // Saucer
  const saucer=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.17,0.03,12),cupMat);
  saucer.position.set(-9,5.39,-21.5); scene.add(saucer);
})();

// ── Side projects bulletin board ──────────────────────────────────────────
(()=>{
  const bc=document.createElement('canvas'); bc.width=256; bc.height=320;
  const bCtx=bc.getContext('2d');
  bCtx.fillStyle='#2a180a'; bCtx.fillRect(0,0,256,320);
  // Cork texture
  for(let i=0;i<2000;i++){
    bCtx.fillStyle=`rgba(${180+Math.random()*40},${100+Math.random()*40},${30+Math.random()*30},0.12)`;
    bCtx.fillRect(Math.random()*256,Math.random()*320,Math.random()*4+1,Math.random()*2+1);
  }
  // Pin some cards
  const cards=[
    {x:14,y:18,w:108,h:70,col:'#f8f2e0',txt:'📊 Seattle\nHousing EDA',sub:'R · ggplot2'},
    {x:134,y:18,w:108,h:70,col:'#e8f4e8',txt:'🤖 LinkedIn\nScraper',sub:'Python · BS4'},
    {x:14,y:105,w:108,h:70,col:'#fef3e2',txt:'💰 Budget\nTracker',sub:'Excel · VBA'},
    {x:134,y:105,w:108,h:70,col:'#e8eef8',txt:'📈 Sales KPI\nDashboard',sub:'Power BI'},
    {x:74,y:192,w:108,h:70,col:'#f8e8f0',txt:'🎓 DSP Case\nDeck',sub:'Strategy · Deck'},
  ];
  cards.forEach(({x,y,w,h,col,txt,sub})=>{
    bCtx.fillStyle=col; bCtx.fillRect(x,y,w,h);
    bCtx.strokeStyle='rgba(0,0,0,0.12)'; bCtx.lineWidth=1; bCtx.strokeRect(x,y,w,h);
    bCtx.fillStyle='#cc2211'; bCtx.beginPath(); bCtx.arc(x+w/2,y+2,3,0,Math.PI*2); bCtx.fill();
    bCtx.fillStyle='#2a1a0a'; bCtx.font='bold 11px Georgia'; bCtx.textAlign='center';
    txt.split('\n').forEach((line,li)=>bCtx.fillText(line,x+w/2,y+22+li*16));
    bCtx.fillStyle='#6a4a2a'; bCtx.font='9px Georgia'; bCtx.fillText(sub,x+w/2,y+57);
  });
  bCtx.strokeStyle='#4a2a10'; bCtx.lineWidth=3; bCtx.strokeRect(2,2,252,316);
  const board=new THREE.Mesh(new THREE.PlaneGeometry(2.1,2.6),
    new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(bc),roughness:0.9}));
  board.rotation.y=Math.PI/2; board.position.set(-11.7,5.8,-8); scene.add(board);
  // Frame
  const fm=M(0x2a1808,0,0,0.7);
  B(2.2,0.12,0.06,fm,-11.72,7.14,-8); B(2.2,0.12,0.06,fm,-11.72,4.46,-8);
  B(0.12,2.75,0.06,fm,-11.72,5.8,-6.92); B(0.12,2.75,0.06,fm,-11.72,5.8,-9.08);
  // bulletin board lit by ambient
})();
[-8,-4.5,-1,2.5,6,9.5].forEach(sx=>{
  // Glass body
  const glass=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.12,0.4,10),
    new THREE.MeshStandardMaterial({color:0xaaccee,roughness:0.02,metalness:0.0,transparent:true,opacity:0.35}));
  glass.position.set(sx,5.58,-21.0); scene.add(glass);
  // Water inside
  const water=new THREE.Mesh(new THREE.CylinderGeometry(0.138,0.11,0.25,10),
    new THREE.MeshStandardMaterial({color:0x88aacc,roughness:0.0,metalness:0.0,transparent:true,opacity:0.25}));
  water.position.set(sx,5.52,-21.0); scene.add(water);
  // Glass rim
  const rim=new THREE.Mesh(new THREE.TorusGeometry(0.15,0.008,6,12),
    new THREE.MeshStandardMaterial({color:0xddeeff,roughness:0.05,metalness:0.1,transparent:true,opacity:0.6}));
  rim.rotation.x=Math.PI/2; rim.position.set(sx,5.78,-21.0); scene.add(rim);
});

// ── Per-seat mini menu cards ──────────────────────────────────────────────
[-8,-4.5,-1,2.5,6,9.5].forEach((sx,i)=>{
  const mc=document.createElement('canvas'); mc.width=96; mc.height=128;
  const mCtx=mc.getContext('2d');
  mCtx.fillStyle='#f8f3e4'; mCtx.fillRect(0,0,96,128);
  mCtx.strokeStyle='#8b1a1a'; mCtx.lineWidth=1.5; mCtx.strokeRect(4,4,88,120);
  mCtx.fillStyle='#8b1a1a'; mCtx.font='bold 11px Georgia'; mCtx.textAlign='center';
  mCtx.fillText('TJ麺',48,22);
  mCtx.strokeStyle='#8b1a1a33'; mCtx.lineWidth=0.8; mCtx.beginPath(); mCtx.moveTo(10,28); mCtx.lineTo(86,28); mCtx.stroke();
  mCtx.fillStyle='#3a2a1a'; mCtx.font='9px Georgia';
  ['醤油 ¥850','味噌 ¥900','塩  ¥800','豚骨 ¥950'].forEach((t,j)=>mCtx.fillText(t,48,42+j*18));
  const mini=new THREE.Mesh(new THREE.PlaneGeometry(0.35,0.47),
    new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(mc),roughness:0.9}));
  mini.position.set(sx+0.28,5.52,-20.7); mini.rotation.x=-0.25; scene.add(mini);
});

// ── Tanuki lucky figure near door ─────────────────────────────────────────
(()=>{
  // Body
  const body=new THREE.Mesh(new THREE.SphereGeometry(0.22,10,8),M(0x5a3a18,0,0,0.8));
  body.scale.y=1.2; body.position.set(-4.2,0.46,0.4); scene.add(body);
  // Head
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.16,10,8),M(0x5a3a18,0,0,0.8));
  head.position.set(-4.2,0.82,0.4); scene.add(head);
  // Hat — conical straw hat
  const hat=new THREE.Mesh(new THREE.ConeGeometry(0.22,0.14,10),M(0xc8a840,0,0,0.7));
  hat.position.set(-4.2,0.98,0.4); scene.add(hat);
  const hatBrim=new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.25,0.02,10),M(0xb09030,0,0,0.7));
  hatBrim.position.set(-4.2,0.91,0.4); scene.add(hatBrim);
  // Belly — the iconic round belly
  const belly=new THREE.Mesh(new THREE.SphereGeometry(0.14,8,6),M(0xf0e0c0,0,0,0.9));
  belly.position.set(-4.2,0.5,0.55); scene.add(belly);
  // Eyes
  [{x:-0.06},{x:0.06}].forEach(({x})=>{
    const eye=new THREE.Mesh(new THREE.SphereGeometry(0.025,6,5),
      new THREE.MeshStandardMaterial({color:0x1a1008,emissive:0x220800,emissiveIntensity:0.5}));
    eye.position.set(-4.2+x,0.86,0.54); scene.add(eye);
  });
  // Sake bottle it's holding
  const tbottle=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.045,0.22,7),M(0x1a1a2a,0,0,0.5,0.3));
  tbottle.position.set(-4.08,0.54,0.6); tbottle.rotation.z=0.4; scene.add(tbottle);
  // Lucky coin bag (traditional tanuki accessory)
  const bag=new THREE.Mesh(new THREE.SphereGeometry(0.07,6,5),M(0xd4a020,0,0,0.8));
  bag.position.set(-4.32,0.35,0.54); scene.add(bag);
  // Small wooden sign in front: 福 (luck)
  const sc=document.createElement('canvas'); sc.width=48; sc.height=36;
  const sCtx=sc.getContext('2d');
  sCtx.fillStyle='#c8a030'; sCtx.fillRect(0,0,48,36);
  sCtx.fillStyle='#2a1008'; sCtx.font='bold 22px Georgia'; sCtx.textAlign='center'; sCtx.textBaseline='middle'; sCtx.fillText('福',24,18);
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(0.25,0.19),
    new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(sc)}));
  sign.position.set(-4.2,0.32,0.65); scene.add(sign);
  // Tanuki and bulletin board lit by ambient
})();

// ── Canvas wall textures ──────────────────────────────────────────────────
// Wainscot wood panels (lower ~3 units) + plaster above
function mkWallTex(w,h){
  const c=document.createElement('canvas'); c.width=w; c.height=h;
  const ctx=c.getContext('2d');
  // Plaster upper zone — warm cream with subtle variation
  const plaster=ctx.createLinearGradient(0,0,w,h*0.45);
  plaster.addColorStop(0,'#1e1610'); plaster.addColorStop(1,'#1a1208');
  ctx.fillStyle=plaster; ctx.fillRect(0,0,w,h);
  // Noise texture on plaster
  for(let i=0;i<w*h*0.015;i++){
    const px=Math.random()*w, py=Math.random()*h*0.45;
    const a=Math.random()*0.04;
    ctx.fillStyle=`rgba(255,220,160,${a})`; ctx.fillRect(px,py,1,1);
  }
  // Wainscot divider rail
  const railY=Math.round(h*0.42);
  ctx.fillStyle='#3a2a12'; ctx.fillRect(0,railY-3,w,6);
  ctx.fillStyle='#4a3818'; ctx.fillRect(0,railY-1,w,2);
  // Wood panels lower zone
  const panelW=Math.round(w/6);
  for(let px=0;px<w;px+=panelW){
    // Base wood color
    ctx.fillStyle=['#1c1108','#1a0f07','#1e1209'][Math.floor(px/panelW)%3];
    ctx.fillRect(px+1,railY+4,panelW-2,h-railY-4);
    // Wood grain
    for(let g=0;g<6;g++){
      const gy=railY+4+Math.random()*(h-railY-8);
      ctx.strokeStyle=`rgba(0,0,0,${0.08+Math.random()*0.1})`; ctx.lineWidth=0.6;
      ctx.beginPath(); ctx.moveTo(px+2,gy); ctx.bezierCurveTo(px+panelW*0.3,gy+Math.random()*6-3,px+panelW*0.7,gy+Math.random()*6-3,px+panelW-2,gy+Math.random()*5-2); ctx.stroke();
    }
    // Panel edge shadow
    ctx.fillStyle='rgba(0,0,0,0.22)'; ctx.fillRect(px,railY+4,2,h-railY-4);
  }
  // Baseboard
  ctx.fillStyle='#2a1e0c'; ctx.fillRect(0,h-6,w,6);
  ctx.fillStyle='#3a2810'; ctx.fillRect(0,h-8,w,2);
  return new THREE.CanvasTexture(c);
}
// Left wall interior
// Left wall — full 42-unit depth
const leftWallTex=mkWallTex(512,384);
leftWallTex.wrapS=leftWallTex.wrapT=THREE.RepeatWrapping; leftWallTex.repeat.set(3.5,1);
const leftWallMat=new THREE.MeshStandardMaterial({map:leftWallTex,roughness:0.78,metalness:0.02});
const leftWallMesh=new THREE.Mesh(new THREE.PlaneGeometry(42,12),leftWallMat);
leftWallMesh.rotation.y=Math.PI/2; leftWallMesh.position.set(-11.85,6,-20); scene.add(leftWallMesh);
// Right wall — full 42-unit depth
const rightWallTex=mkWallTex(512,384);
rightWallTex.wrapS=rightWallTex.wrapT=THREE.RepeatWrapping; rightWallTex.repeat.set(3.5,1);
const rightWallMesh=new THREE.Mesh(new THREE.PlaneGeometry(42,12),new THREE.MeshStandardMaterial({map:rightWallTex,roughness:0.78,metalness:0.02}));
rightWallMesh.rotation.y=-Math.PI/2; rightWallMesh.position.set(11.85,6,-20); scene.add(rightWallMesh);

// ── Right wall display — sake price list ──────────────────────────────────
(()=>{
  const pc=document.createElement('canvas'); pc.width=256; pc.height=320;
  const pCtx=pc.getContext('2d');
  pCtx.fillStyle='#f5f0e0'; pCtx.fillRect(0,0,256,320);
  // Aged paper texture
  for(let i=0;i<500;i++){pCtx.fillStyle=`rgba(180,140,80,${Math.random()*0.04})`;pCtx.fillRect(Math.random()*256,Math.random()*320,Math.random()*8+1,1);}
  pCtx.strokeStyle='#3a2010'; pCtx.lineWidth=2.5; pCtx.strokeRect(6,6,244,308);
  pCtx.strokeStyle='#6a4020'; pCtx.lineWidth=1; pCtx.strokeRect(12,12,232,296);
  pCtx.fillStyle='#3a1a0a'; pCtx.font='bold 20px Georgia'; pCtx.textAlign='center';
  pCtx.shadowBlur=4; pCtx.shadowColor='rgba(0,0,0,0.3)';
  pCtx.fillText('本日のお品書き',128,42); pCtx.shadowBlur=0;
  pCtx.strokeStyle='#6a401566'; pCtx.lineWidth=1; pCtx.beginPath(); pCtx.moveTo(20,54); pCtx.lineTo(236,54); pCtx.stroke();
  pCtx.fillStyle='#4a2a12'; pCtx.font='14px Georgia';
  [['醤油　　¥850','shoyu ramen'],['味噌　　¥900','miso ramen'],['塩　　　¥800','shio ramen'],['豚骨　　¥950','tonkotsu'],['つけ麺　¥920','tsukemen'],['替え玉　¥150','extra noodle']].forEach(([jp,en],i)=>{
    const y=72+i*36;
    pCtx.fillStyle='#3a2010'; pCtx.font='13px Georgia'; pCtx.textAlign='left'; pCtx.fillText(jp,22,y);
    pCtx.fillStyle='#8a6030'; pCtx.font='10px Georgia'; pCtx.textAlign='left'; pCtx.fillText(en,22,y+14);
    if(i<5){pCtx.strokeStyle='rgba(100,60,20,0.15)';pCtx.beginPath();pCtx.moveTo(16,y+22);pCtx.lineTo(240,y+22);pCtx.stroke();}
  });
  const priceBoard=new THREE.Mesh(new THREE.PlaneGeometry(2.2,2.8),
    new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(pc),roughness:0.85,side:THREE.FrontSide}));
  priceBoard.rotation.y=-Math.PI/2; priceBoard.position.set(11.7,6.5,-15); scene.add(priceBoard);
  // Wood frame around it
  const fm=M(0x2a1808,0,0,0.7);
  [[2.5,0.12,-Math.PI/2],[0.12,3.1,-Math.PI/2]].forEach(([fw,fh,ry])=>{
    [-1.2,1.2].forEach(ox=>{
      const f=new THREE.Mesh(new THREE.BoxGeometry(fw,fh,0.06),fm);
      f.rotation.y=ry; f.position.set(11.65,6.5,-15+(fw<1?ox*1.5:0)); scene.add(f);
    });
  });
})();

// ── Kitchen pot silhouette in pass-through ────────────────────────────────
(()=>{
  // Large cooking pot visible through pass-through
  const pot=new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.5,0.55,14),
    M(0x1a1208,0,0,0.5,0.45));
  pot.position.set(-1.2,7.0,-40.6); scene.add(pot);
  const lid=new THREE.Mesh(new THREE.CylinderGeometry(0.65,0.62,0.12,14),M(0x2a2010,0,0,0.4,0.55));
  lid.position.set(-1.2,7.3,-40.6); scene.add(lid);
  const knob=new THREE.Mesh(new THREE.SphereGeometry(0.1,8,6),M(0x3a2810,0,0,0.3,0.6));
  knob.position.set(-1.2,7.42,-40.6); scene.add(knob);
  // Ladle
  const ladle=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,1.2,6),M(0x2a1a08,0,0,0.4,0.5));
  ladle.rotation.z=0.35; ladle.position.set(0.8,7.2,-40.6); scene.add(ladle);
  const ladleBowl=new THREE.Mesh(new THREE.SphereGeometry(0.18,8,5),M(0x2a1a08,0,0,0.4,0.5));
  ladleBowl.position.set(1.2,6.85,-40.6); scene.add(ladleBowl);
})();
// Side walls - now replaced by canvas textured meshes above; keep structural back box
B(24,12,0.3,M(0x1e1610),0,6,-41);
B(24.6,2,0.08,M(0x2a1e10),0,1,-41);
B(24.6,0.1,0.08,new THREE.MeshStandardMaterial({color:0xe8922a,emissive:0xe8922a,emissiveIntensity:0.9,roughness:0.6}),0,2.06,-41);
// Ceiling beams (cross beams at intervals)
for(let z=-6;z>=-37;z-=10)B(24,0.6,0.5,M(0x2a1e08),0,11.7,z);
// Vertical wall beams on side walls
[-9,-3,3,9].forEach(bx=>{
  B(0.25,12,0.22,M(0x2a1a08,0,0,0.7),bx,6,-1.9);
});

// ── Pendant ceiling fixtures above counter ────────────────────────────────
[-8,-3.5,2,7].forEach((px,i)=>{
  const cord=new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,3.0,5),M(0x1a1008));
  cord.position.set(px,10.5,-21.8); scene.add(cord);
  // Shade — smaller, more refined
  const shade=new THREE.Mesh(new THREE.ConeGeometry(0.48,0.65,14,1,true),
    new THREE.MeshStandardMaterial({color:0x2a1a08,roughness:0.55,metalness:0.45,side:THREE.DoubleSide}));
  shade.rotation.x=Math.PI; shade.position.set(px,8.9,-21.8); scene.add(shade);
  // Inner rim — thin and precise
  const shadeRim=new THREE.Mesh(new THREE.TorusGeometry(0.48,0.022,6,14),
    new THREE.MeshStandardMaterial({color:0xb08040,roughness:0.25,metalness:0.8}));
  shadeRim.position.set(px,8.59,-21.8); scene.add(shadeRim);
  // Top cap
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(0.055,0.055,0.08,8),M(0x2a1a08,0,0,0.4,0.6));
  cap.position.set(px,9.18,-21.8); scene.add(cap);
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(0.11,8,6),
    new THREE.MeshStandardMaterial({color:0xfff8d0,emissive:0xfff8d0,emissiveIntensity:3.2}));
  bulb.position.set(px,8.72,-21.8); scene.add(bulb);
  // Pendant light — only 2 actual lights for the 4 fixtures (performance)
  if(i%2===0) P(0xf0d060,1.8,px,8.0,-21.5,14);
});

// ── Interior lights ───────────────────────────────────────────────────────
const iAmb=new THREE.PointLight(0xf0c060,1.3,55); iAmb.position.set(0,10,-20); scene.add(iAmb);
P(0xf0a020,2.8,0,7,-20,35); // single strong interior fill
P(0xff9944,3.5,0,5,-38,22); // kitchen glow
// Entry cool sky bleed
P(0x6688bb,0.3,0,5,-2,14);

// ── Counter ───────────────────────────────────────────────────────────────
// Canvas counter top — dark wood grain
const ctCanvas=(()=>{
  const c=document.createElement('canvas'); c.width=256; c.height=128;
  const ctx=c.getContext('2d');
  ctx.fillStyle='#2e1e0a'; ctx.fillRect(0,0,256,128);
  for(let i=0;i<12;i++){
    ctx.strokeStyle=`rgba(0,0,0,${0.1+Math.random()*0.12})`; ctx.lineWidth=0.8+Math.random();
    const y=Math.random()*128;
    ctx.beginPath(); ctx.moveTo(0,y); ctx.bezierCurveTo(64,y+Math.random()*8-4,192,y+Math.random()*8-4,256,y+Math.random()*6-3); ctx.stroke();
  }
  return c;
})();
const ctTex=new THREE.CanvasTexture(ctCanvas); ctTex.wrapS=ctTex.wrapT=THREE.RepeatWrapping; ctTex.repeat.set(8,2);
const ctTop=new THREE.Mesh(new THREE.BoxGeometry(22,0.25,3),new THREE.MeshStandardMaterial({map:ctTex,roughness:0.22,metalness:0.18}));
ctTop.position.set(0,5.25,-22); scene.add(ctTop);
B(22,0.08,0.08,new THREE.MeshStandardMaterial({color:0xe8922a,emissive:0xe8922a,emissiveIntensity:2.8}),0,5.22,-20.5);
B(22,5,2.5,M(0x2a1e0c,0,0,0.82),0,2.5,-22);
// Counter reflection — shimmery strip on the counter surface reflecting bowl rims
const ctReflect = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 2.2),
  new THREE.MeshStandardMaterial({color:0x1a0e05,emissive:0xe8922a,emissiveIntensity:0.12,roughness:0.05,metalness:0.9,transparent:true,opacity:0.35})
);
ctReflect.rotation.x = -Math.PI/2; ctReflect.position.set(0, 5.28, -22.5); scene.add(ctReflect);

// ── Stools ────────────────────────────────────────────────────────────────
[-8,-4.5,-1,2.5,6,9.5].forEach((sx,idx)=>{
  const cushCols=[0x4a1010,0x3a1a08,0x4a2010,0x3a1015,0x451808,0x3a1010];
  const cush=new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.55,0.18,12),new THREE.MeshStandardMaterial({color:cushCols[idx],roughness:0.8,emissive:cushCols[idx],emissiveIntensity:0.08}));
  cush.position.set(sx,4.12,-19); scene.add(cush);
  [[-0.4,-0.4],[0.4,-0.4],[-0.4,0.4],[0.4,0.4]].forEach(([lx,lz])=>{
    const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,4,6),M(0x3a2a10,0,0,0.4,0.65));
    leg.position.set(sx+lx,2.02,-19+lz); scene.add(leg); // bottom at y:0.02 = floor
  });
  const fr=new THREE.Mesh(new THREE.TorusGeometry(0.55,0.04,6,12),M(0x3a2a10,0,0,0.4,0.65));
  fr.rotation.x=Math.PI/2; fr.position.set(sx,1.32,-19); scene.add(fr);
});

// ── Bowls & steam ─────────────────────────────────────────────────────────
const steamPtcls=[];
[-6,0,6].forEach(bx=>{
  const bowl=new THREE.Mesh(new THREE.CylinderGeometry(0.9,0.55,0.55,20),M(0x1a0d0d,0,0,0.5,0.15));
  bowl.position.set(bx,5.58,-22.5); scene.add(bowl);
  const broth=new THREE.Mesh(new THREE.CircleGeometry(0.85,20),new THREE.MeshStandardMaterial({color:0x4a2808,emissive:0x3a1804,emissiveIntensity:0.35,roughness:0.3}));
  broth.rotation.x=-Math.PI/2; broth.position.set(bx,5.86,-22.5); scene.add(broth);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(0.9,0.045,8,20),new THREE.MeshStandardMaterial({color:0xe8922a,emissive:0xe8922a,emissiveIntensity:2.8}));
  rim.rotation.x=Math.PI/2; rim.position.set(bx,5.87,-22.5); scene.add(rim);
  // bowl rim light removed — emissive rim handles glow
  for(let i=0;i<4;i++){
    const s=new THREE.Mesh(new THREE.SphereGeometry(0.1,4,4),new THREE.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:0.18,roughness:1}));
    s.position.set(bx+(Math.random()-0.5)*0.5,6.3+Math.random()*1.8,-22.5+(Math.random()-0.5)*0.4);
    s.userData={baseY:s.position.y,sp:0.007+Math.random()*0.007,ph:Math.random()*Math.PI*2,dr:(Math.random()-0.5)*0.004};
    scene.add(s); steamPtcls.push(s);
  }
});

// ── Interior seasoning - contact shadows + one cool wash ───────────────────
// Sprites/meshes only. NO new lights (the scene already runs at its documented
// point-light budget); these just add temperature contrast and grounding.
const _shadowTex=(()=>{
  const c=document.createElement('canvas'); c.width=c.height=64;
  const g=c.getContext('2d'), gr=g.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba(0,0,0,0.5)'); gr.addColorStop(0.6,'rgba(0,0,0,0.2)'); gr.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=gr; g.fillRect(0,0,64,64);
  return new THREE.CanvasTexture(c);
})();
function contactShadow(x,y,z,r){
  const m=new THREE.Mesh(new THREE.PlaneGeometry(r,r),
    new THREE.MeshBasicMaterial({map:_shadowTex,transparent:true,depthWrite:false,opacity:0.85}));
  m.rotation.x=-Math.PI/2; m.position.set(x,y,z); scene.add(m); return m;
}
[-8,-4.5,-1,2.5,6,9.5].forEach(sx=>contactShadow(sx,0.06,-19,2.3)); // under stools
[-6,0,6].forEach(bx=>contactShadow(bx,5.41,-22.5,1.7));             // under bowls
// Cool wash near the entrance side to break the warm sepia monotone
const _coolTex=(()=>{
  const c=document.createElement('canvas'); c.width=c.height=128;
  const g=c.getContext('2d'), gr=g.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,'rgba(106,134,184,0.55)'); gr.addColorStop(1,'rgba(106,134,184,0)');
  g.fillStyle=gr; g.fillRect(0,0,128,128);
  return new THREE.CanvasTexture(c);
})();
const coolWash=new THREE.Sprite(new THREE.SpriteMaterial({map:_coolTex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0.32}));
coolWash.position.set(-8,3.4,-11); coolWash.scale.set(17,14,1); scene.add(coolWash);

// ── Counter items — all grounded to counter top surface (y:5.375) ─────────
// Sake bottle: height 0.9, center = 5.375 + 0.45
const sake=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.2,0.9,10),M(0x0a1a2a,0x0a0f15,0.35,0.25,0.35));
sake.position.set(3.5,5.825,-22); scene.add(sake);
// Chopstick holder box: height 0.4, center = 5.375 + 0.2
B(0.6,0.4,0.4,M(0x3a2810,0,0,0.65),-3,5.575,-22);
// Chopsticks: height 0.7, sitting IN holder. Bottom at holder-bottom (5.175+...) → extend up. Center = 5.375+0.35
B(0.04,0.7,0.04,M(0x4a2810),-3.12,5.725,-22); B(0.04,0.7,0.04,M(0x4a2810),-2.88,5.725,-22);
// Napkin holder — base: height 0.05, center = 5.375 + 0.025
B(0.5,0.05,0.3,M(0x4a3820,0,0,0.4,0.5),7,5.4,-22.5);
// Napkin holder sides: height 0.35, bottom on base top (5.4), center = 5.4 + 0.175
B(0.02,0.35,0.3,M(0x4a3820,0,0,0.4,0.5),6.76,5.575,-22.5);
B(0.02,0.35,0.3,M(0x4a3820,0,0,0.4,0.5),7.24,5.575,-22.5);

// ── Menu stand ────────────────────────────────────────────────────────────
// Centered between the bowls at x:0, set back slightly so you can see it
// ── Menu stand — clean upright hotel/restaurant style ──────────────────────
const MSG=new THREE.Group();
// Dark wood frame
const frame=new THREE.Mesh(new THREE.BoxGeometry(1.3,1.72,0.055),M(0x2a1a08,0,0,0.5,0.5));
MSG.add(frame);
// Cream board face — warm so it reads clearly
const boardFace=new THREE.Mesh(new THREE.PlaneGeometry(1.16,1.58),
  new THREE.MeshStandardMaterial({color:0xf5edd8,roughness:0.85,emissive:0xf0e8c8,emissiveIntensity:0.06}));
boardFace.position.set(0,0.05,0.033); MSG.add(boardFace);
// Top accent bar
const topBar=new THREE.Mesh(new THREE.BoxGeometry(1.3,0.08,0.08),M(0x3a2a10,0,0,0.4,0.6));
topBar.position.set(0,0.9,0.02); MSG.add(topBar);
// Base plinth — flush with counter, no floating
const plinth=new THREE.Mesh(new THREE.BoxGeometry(1.45,0.06,0.42),M(0x221508,0,0,0.5,0.5));
plinth.position.set(0,-0.86,0.12); MSG.add(plinth);

const menuCardTex=(()=>{
  const c=document.createElement('canvas'); c.width=300; c.height=400;
  const ctx=c.getContext('2d');
  ctx.fillStyle='#f5f0e2'; ctx.fillRect(0,0,300,400);
  for(let i=0;i<60;i++){ctx.fillStyle=`rgba(0,0,0,${Math.random()*0.015})`;ctx.fillRect(Math.random()*300,Math.random()*400,Math.random()*30+5,1);}
  ctx.strokeStyle='#8b1a1a'; ctx.lineWidth=2.5; ctx.strokeRect(6,6,288,388);
  ctx.strokeStyle='#8b1a1a33'; ctx.lineWidth=1; ctx.strokeRect(14,14,272,372);
  ctx.fillStyle='#8b1a1a'; ctx.font='bold 28px Georgia'; ctx.textAlign='center';
  ctx.shadowBlur=7; ctx.shadowColor='#8b1a1a44'; ctx.fillText('TJ麺',150,54); ctx.shadowBlur=0;
  ctx.fillStyle='#8a6a3a'; ctx.font='11px Georgia'; ctx.fillText('お品書き  ·  MENU',150,75);
  ctx.strokeStyle='#8b1a1a33'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(24,85); ctx.lineTo(276,85); ctx.stroke();
  [['No.1','作品','Projects'],['No.2','経歴','Experience'],['No.3','技術','Skills'],['No.4','連絡','Contact']].forEach(([n,k,nm],i)=>{
    const y=112+i*70;
    ctx.fillStyle='#8b1a1a77'; ctx.font='11px Georgia'; ctx.fillText(n,150,y);
    ctx.fillStyle='#8b1a1a'; ctx.font='bold 30px Georgia'; ctx.fillText(k,150,y+30);
    ctx.fillStyle='#3a2a1a'; ctx.font='13px Georgia'; ctx.fillText(nm,150,y+52);
    if(i<3){ctx.strokeStyle='#8b1a1a1a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(24,y+62);ctx.lineTo(276,y+62);ctx.stroke();}
  });
  return new THREE.CanvasTexture(c);
})();

const menuCard=new THREE.Mesh(new THREE.PlaneGeometry(1.14,1.56),new THREE.MeshStandardMaterial({map:menuCardTex,color:0x8a8a8a,roughness:0.9}));
menuCard.position.set(0,0.05,0.042); menuCard.userData.menuCard=true; MSG.add(menuCard);

// Glowing "MENU" sign above stand
const menuSignCanvas=(()=>{
  const c=document.createElement('canvas'); c.width=256; c.height=64;
  const ctx=c.getContext('2d'); ctx.clearRect(0,0,256,64);
  ctx.shadowBlur=18; ctx.shadowColor='#f0c040';
  ctx.fillStyle='#f5d060'; ctx.font='bold 36px Georgia,serif';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('メニュー', 128, 32);
  return new THREE.CanvasTexture(c);
})();
const menuSignMesh=new THREE.Mesh(
  new THREE.PlaneGeometry(2.8,0.7),
  new THREE.MeshBasicMaterial({map:menuSignCanvas,transparent:true})
);
menuSignMesh.position.set(0,0.82,0.04); MSG.add(menuSignMesh);

// Glowing floor indicator under menu stand — amber pulse so it's obvious
const menuFloorGlow = new THREE.Mesh(
  new THREE.CircleGeometry(3.5, 24),
  new THREE.MeshStandardMaterial({
    color: 0xf0c040, emissive: 0xf0c040, emissiveIntensity: 0.22,
    transparent: true, opacity: 0.28, roughness: 0.1, metalness: 0.5
  })
);
menuFloorGlow.rotation.x = -Math.PI/2;
menuFloorGlow.position.set(0, 0.06, -21.5);
menuFloorGlow.visible = false;
scene.add(menuFloorGlow);

// Spotlight on menu stand
const menuLight = new THREE.PointLight(0xf0c060, 1.8, 7);
menuLight.position.set(0, 9, -21); scene.add(menuLight);

// Mount board on back wall, centered, eye level
MSG.position.set(0, 6.255, -21.5); scene.add(MSG);

// Click zone covers the wall board
const menuZone=new THREE.Mesh(
  new THREE.BoxGeometry(3.2, 4.0, 1.0),
  new THREE.MeshBasicMaterial({visible:false})
);
menuZone.position.set(0, 6.255, -21.5); menuZone.userData.menuCard=true; scene.add(menuZone);

// ── Kitchen ───────────────────────────────────────────────────────────────
B(6,3.5,0.4,M(0x0e0a06),0,5,-40.85);
const kGlow=new THREE.Mesh(new THREE.PlaneGeometry(5.5,3.2),new THREE.MeshStandardMaterial({color:0xff8833,emissive:0xff6622,emissiveIntensity:1.9,roughness:0.3,transparent:true,opacity:0.72}));
kGlow.position.set(0,5,-40.72); scene.add(kGlow);
const kfm=M(0x3a2810,0,0,0.75);
B(6.4,0.22,0.5,kfm,0,6.85,-40.8); B(6.4,0.22,0.5,kfm,0,3.38,-40.8);
B(0.22,3.5,0.5,kfm,-3.2,5,-40.8); B(0.22,3.5,0.5,kfm,3.2,5,-40.8);
P(0xff7722,4.5,0,6.5,-39,16);

// ── Kitchen dust motes (floating in the orange beam) ──────────────────────
const dustMotes = [];
for(let i=0;i<5;i++){
  const d=new THREE.Mesh(new THREE.SphereGeometry(0.04,3,3),
    new THREE.MeshBasicMaterial({color:0xff9944,transparent:true,opacity:Math.random()*0.4+0.1}));
  d.position.set((Math.random()-0.5)*4, 3+Math.random()*4, -38+Math.random()*2);
  d.userData={vy:(Math.random()-0.5)*0.008, vx:(Math.random()-0.5)*0.006, ph:Math.random()*Math.PI*2};
  d.visible=false;
  scene.add(d); dustMotes.push(d);
}

// ── Indoor warm golden ambient particles ──────────────────────────────────
const warmDust = [];
for(let i=0;i<5;i++){
  const d = new THREE.Mesh(
    new THREE.SphereGeometry(0.025,3,3),
    new THREE.MeshBasicMaterial({color:0xf0c060,transparent:true,opacity:Math.random()*0.25+0.05})
  );
  d.position.set((Math.random()-0.5)*20, Math.random()*9+0.5, -8-Math.random()*28);
  d.userData={vy:(Math.random()-0.5)*0.005, vx:(Math.random()-0.5)*0.004, ph:Math.random()*Math.PI*2, baseY:d.position.y};
  d.visible=false;
  scene.add(d); warmDust.push(d);
}

// ── Back-wall sake & condiment shelf ─────────────────────────────────────
// Full-height side columns (floor → shelf top) — replaces floating brackets
B(0.1,9.5,0.55,M(0x1a1208,0,0,0.78),-10.75,4.75,-30);
B(0.1,9.5,0.55,M(0x1a1208,0,0,0.78),-6.25,4.75,-30);
// Back panel — makes it look like a proper wall display unit
B(4.44,9.5,0.07,M(0x141008,0,0,0.88),-8.5,4.75,-30.3);
// Shelf board
B(4.5,0.12,0.6,M(0x3a2810,0,0,0.7),-8.5,8.5,-30);
// Lower shelf
B(4.4,0.1,0.55,M(0x2a1808,0,0,0.75),-8.5,4.8,-30);
// Base trim
B(4.5,0.08,0.55,M(0x1a1208,0,0,0.8),-8.5,0.04,-30);
// Sake/shochu bottles on shelf
const bottleColors=[0x0a1a2a,0x1a0a08,0x0a180a,0x1a1008];
[-10,-9,-8,-7].forEach((bx,i)=>{
  const bottle=new THREE.Mesh(
    new THREE.CylinderGeometry(0.12,0.14,0.8,10),
    new THREE.MeshStandardMaterial({color:bottleColors[i%4],roughness:0.2,metalness:0.1,transparent:true,opacity:0.85})
  );
  bottle.position.set(bx,8.95,-30); scene.add(bottle);
  // Label band
  const label=new THREE.Mesh(
    new THREE.CylinderGeometry(0.145,0.145,0.25,10),
    new THREE.MeshStandardMaterial({color:0xf5e8c0,roughness:0.8,emissive:0xf0d880,emissiveIntensity:0.08})
  );
  label.position.set(bx,9.0,-30); scene.add(label);
  // Cap
  const cap=new THREE.Mesh(
    new THREE.CylinderGeometry(0.06,0.1,0.12,8),
    new THREE.MeshStandardMaterial({color:0xcc3300,roughness:0.4,metalness:0.3})
  );
  cap.position.set(bx,9.38,-30); scene.add(cap);
});
// Sake shelf lit by iAmb already
const dM=new THREE.Mesh(new THREE.PlaneGeometry(5,0.9),new THREE.MeshBasicMaterial({map:mkSS('[ RAG ]','#22ccee',480,90,38),transparent:true}));
dM.position.set(-8,10,-40.72); scene.add(dM);
const aM=new THREE.Mesh(new THREE.PlaneGeometry(5,0.9),new THREE.MeshBasicMaterial({map:mkSS('SHIP IT','#e8922a',480,90,38),transparent:true}));
aM.position.set(8,10,-40.72); scene.add(aM);

// Specials board
const spTex=(()=>{
  const c=document.createElement('canvas'); c.width=320; c.height=200;
  const ctx=c.getContext('2d'); ctx.fillStyle='#0a1208'; ctx.fillRect(0,0,320,200);
  ctx.fillStyle='#c8e8c0'; ctx.font='bold 17px Georgia'; ctx.textAlign='center'; ctx.fillText('本日のおすすめ',160,30);
  ctx.strokeStyle='#3a5a3a'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(20,40); ctx.lineTo(300,40); ctx.stroke();
  ctx.fillStyle='#a0c8a0'; ctx.font='13px Georgia';
  ['醤油ラーメン　¥850','特製チャーシュー　+¥200','半熟卵　+¥100','ライス　¥150'].forEach((t,i)=>ctx.fillText(t,160,62+i*32));
  ctx.strokeStyle='#3a5a3a'; ctx.lineWidth=1.5; ctx.strokeRect(5,5,310,190);
  return new THREE.CanvasTexture(c);
})();
const spBoard=new THREE.Mesh(new THREE.PlaneGeometry(4.5,2.8),new THREE.MeshBasicMaterial({map:spTex}));
spBoard.position.set(-8,5.8,-40.72); scene.add(spBoard);

// Clock — live real-time, updates every minute
const clkCanvas = document.createElement('canvas'); clkCanvas.width=128; clkCanvas.height=128;
const clkCtx = clkCanvas.getContext('2d');
const clkTex = new THREE.CanvasTexture(clkCanvas);
function drawWallClock(){
  const now = new Date();
  const h=now.getHours()%12, m=now.getMinutes();
  clkCtx.clearRect(0,0,128,128);
  // Face
  clkCtx.fillStyle='#f0c860'; clkCtx.beginPath(); clkCtx.arc(64,64,60,0,Math.PI*2); clkCtx.fill();
  clkCtx.strokeStyle='#c8a030'; clkCtx.lineWidth=2; clkCtx.beginPath(); clkCtx.arc(64,64,58,0,Math.PI*2); clkCtx.stroke();
  // Hour numbers
  clkCtx.fillStyle='#3a2800'; clkCtx.font='bold 15px Georgia'; clkCtx.textAlign='center';
  [12,3,6,9].forEach((n,i)=>{const a=(i/4)*Math.PI*2-Math.PI/2;clkCtx.fillText(n,64+44*Math.cos(a),64+44*Math.sin(a)+5);});
  // Tick marks
  for(let i=0;i<12;i++){
    const a=i/12*Math.PI*2, r1=52, r2=i%3===0?44:49;
    clkCtx.strokeStyle='#7a5820'; clkCtx.lineWidth=i%3===0?2:1;
    clkCtx.beginPath(); clkCtx.moveTo(64+r1*Math.cos(a),64+r1*Math.sin(a)); clkCtx.lineTo(64+r2*Math.cos(a),64+r2*Math.sin(a)); clkCtx.stroke();
  }
  // Hour hand
  const ha=((h+m/60)/12)*Math.PI*2-Math.PI/2;
  clkCtx.strokeStyle='#1a1010'; clkCtx.lineWidth=4; clkCtx.lineCap='round';
  clkCtx.beginPath(); clkCtx.moveTo(64,64); clkCtx.lineTo(64+28*Math.cos(ha),64+28*Math.sin(ha)); clkCtx.stroke();
  // Minute hand
  const ma=(m/60)*Math.PI*2-Math.PI/2;
  clkCtx.strokeStyle='#cc1111'; clkCtx.lineWidth=2.5; clkCtx.lineCap='round';
  clkCtx.beginPath(); clkCtx.moveTo(64,64); clkCtx.lineTo(64+40*Math.cos(ma),64+40*Math.sin(ma)); clkCtx.stroke();
  // Center pin
  clkCtx.fillStyle='#8b1a1a'; clkCtx.beginPath(); clkCtx.arc(64,64,4,0,Math.PI*2); clkCtx.fill();
  clkTex.needsUpdate=true;
}
drawWallClock();
const clk=new THREE.Mesh(new THREE.CircleGeometry(0.85,20),new THREE.MeshStandardMaterial({map:clkTex,roughness:0.85}));
clk.position.set(9,8.5,-40.72); scene.add(clk);

// ── Interior lanterns — small traditional paper style, staggered naturally ─
const intLanterns=[];
// Positions: staggered heights and depths for natural look
[[-8,9.5,-22],[-3,8.2,-22],[3,9.0,-26],[8.5,8.6,-20]].forEach(([lx,ly,lz],i)=>{
  const g=new THREE.Group();
  // Thin cord
  const cordLen=12-ly+0.4;
  const str=new THREE.Mesh(new THREE.CylinderGeometry(0.01,0.01,cordLen,5),M(0x2a1808));
  str.position.y=cordLen/2; g.add(str);
  // Paper body — smaller, warm cream with red bands
  const body=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.22,0.72,12),
    new THREE.MeshStandardMaterial({color:0xf5e8d0,emissive:0xf0c060,emissiveIntensity:0.55,roughness:0.8}));
  body.position.y=-0.18; g.add(body);
  // Red decorative bands (just 3, thinner)
  [0,1,2].forEach(r=>{
    const rib=new THREE.Mesh(new THREE.TorusGeometry(0.225,0.018,5,12),
      new THREE.MeshStandardMaterial({color:0xaa1111,emissive:0xcc1111,emissiveIntensity:0.3,roughness:0.7}));
    rib.position.y=-0.32+r*0.28; rib.rotation.x=Math.PI/2; g.add(rib);
  });
  // Top/bottom caps
  ['top','bot'].forEach((s,ci)=>{
    const cap=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,0.06,8),M(0x3a1a08));
    cap.position.y=s==='top'?0.19:-0.55; g.add(cap);
  });
  // Warm inner glow mesh
  const inner=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,0.58,10),
    new THREE.MeshStandardMaterial({color:0xffe8a0,emissive:0xffcc50,emissiveIntensity:1.8,transparent:true,opacity:0.35}));
  inner.position.y=-0.18; g.add(inner);
  // Subtle warm light — not orange, soft amber
  // PointLight removed — inner emissive mesh handles glow
  g.position.set(lx,ly,lz); g.userData.panel=['projects','experience','skills','contact'][i];
  scene.add(g); intLanterns.push(g);
  // Cord to ceiling
  const cord=new THREE.Mesh(new THREE.CylinderGeometry(0.008,0.008,cordLen,4),M(0x2a1808));
  cord.position.set(lx,12-cordLen/2,lz); scene.add(cord);
  // Soft floor glow pool
  const flr=new THREE.Mesh(new THREE.CircleGeometry(1.0,14),
    new THREE.MeshBasicMaterial({color:0xffe090,transparent:true,opacity:0.07,side:THREE.DoubleSide}));
  flr.rotation.x=-Math.PI/2; flr.position.set(lx,0.05,lz); scene.add(flr);
});

// ── Interior blocker ──────────────────────────────────────────────────────
const blocker=B(24,12,0.2,M(0x0d0a06),0,6,-1.85);

// ── Raycaster ─────────────────────────────────────────────────────────────
