// Mesh helpers (M, B, P), street, shopfront, signs, lanterns, city, cars, rain, bokeh, fireflies.
// Split from the original single-file index.html on 2026-09-13; classic script, shares the global scope
// with every other js/*.js file. Load order is the numeric prefix.
const M=(c,e=0,ei=0,r=0.8,m=0)=>new THREE.MeshStandardMaterial({color:c,emissive:e,emissiveIntensity:ei,roughness:r,metalness:m});
function B(w,h,d,mat,x,y,z){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);o.position.set(x,y,z);scene.add(o);return o;}
function P(c,i,x,y,z,dist=12){const l=new THREE.PointLight(c,i,dist);l.position.set(x,y,z);scene.add(l);return l;}

// ── Ground ────────────────────────────────────────────────────────────────
// Canvas asphalt texture — slight variation, wet-dark
const asphaltCanvas=(()=>{
  const c=document.createElement('canvas'); c.width=512; c.height=512;
  const ctx=c.getContext('2d');
  ctx.fillStyle='#0c0906'; ctx.fillRect(0,0,512,512);
  // Aggregate texture noise
  for(let i=0;i<3000;i++){
    const v=Math.random()*18;
    ctx.fillStyle=`rgba(${v},${v*0.85},${v*0.7},${0.15+Math.random()*0.2})`;
    ctx.fillRect(Math.random()*512,Math.random()*512,Math.random()*3+1,Math.random()*3+1);
  }
  // Subtle crack lines
  for(let i=0;i<8;i++){
    ctx.strokeStyle=`rgba(0,0,0,${0.25+Math.random()*0.2})`; ctx.lineWidth=0.5;
    const x=Math.random()*512, y=Math.random()*512;
    ctx.beginPath(); ctx.moveTo(x,y);
    ctx.lineTo(x+(Math.random()-0.5)*120,y+(Math.random()-0.5)*120); ctx.stroke();
  }
  return c;
})();
const asphaltTex=new THREE.CanvasTexture(asphaltCanvas);
asphaltTex.wrapS=asphaltTex.wrapT=THREE.RepeatWrapping; asphaltTex.repeat.set(8,8);

// Wet street — low roughness gives PBR specular highlights from every point light
const street=new THREE.Mesh(new THREE.PlaneGeometry(160,160),
  new THREE.MeshStandardMaterial({map:asphaltTex,color:0x0c0906,roughness:0.06,metalness:0.78}));
street.rotation.x=-Math.PI/2; scene.add(street);

// Wet sidewalk
const sidewalk=new THREE.Mesh(new THREE.PlaneGeometry(36,14),
  new THREE.MeshStandardMaterial({color:0x141008,roughness:0.08,metalness:0.65}));
sidewalk.rotation.x=-Math.PI/2; sidewalk.position.set(0,0.01,7); scene.add(sidewalk);

// Puddles and reflection streaks removed — the wet street PBR material
// (roughness:0.06, metalness:0.78) handles the wet look via specular
// highlights from the scene's point lights. Splash rings animate naturally.
const puddleMeshes=[];
const reflections=[];

// Ground fill lights removed for performance — wet street PBR handles this

// ── Facade ────────────────────────────────────────────────────────────────
B(26,22,0.8,M(0x1a1108,0,0,0.92),0,11,-1);
for(let y=2;y<=20;y+=3.2)B(26,0.1,0.05,M(0x0d0b06,0,0,1),0,y,-0.55);
B(0.8,22,0.9,M(0x221a0c),-12.5,11,-0.9); B(0.8,22,0.9,M(0x221a0c),12.5,11,-0.9);
const NS=new THREE.MeshStandardMaterial({color:0xe8922a,emissive:0xe8922a,emissiveIntensity:2.2});
const ns1=B(0.08,22,0.08,NS,-12.9,11,-0.44); const ns2=B(0.08,22,0.08,NS,12.9,11,-0.44);
P(0xe8922a,2.5,0,11,0,14); // single merged facade neon light
B(27.5,2.5,1.2,M(0x201808),0,23.25,-1);
B(27.5,0.25,1.4,M(0x2a1e0e),0,24.5,-0.9);
B(27.5,0.1,0.1,new THREE.MeshStandardMaterial({color:0xe8922a,emissive:0xe8922a,emissiveIntensity:1.8}),0,24.62,-0.18);
// cornice light removed for performance

// ── Awning ────────────────────────────────────────────────────────────────
B(26,0.22,4.5,M(0x8b1a1a,0,0,0.9),0,10.5,1.25);
const AWS=new THREE.MeshStandardMaterial({color:0xfff5dc,roughness:0.95});
for(let x=-12;x<=12;x+=1.8)B(0.6,0.24,4.5,AWS,x,10.5,1.25);
const awNeon=new THREE.MeshStandardMaterial({color:0xf0c040,emissive:0xf0c040,emissiveIntensity:2.8});
B(26,0.1,0.1,awNeon,0,10.36,3.5); P(0xf0c040,2.2,0,9.5,4.5,18);
for(let x=-12;x<=12;x+=0.85)B(0.07,0.48,0.07,M(0x9b2a2a),x,10.12,3.5);

// ── Noren ────────────────────────────────────────────────────────────────
const norenMeshes = [];
[0x8b1a1a,0x1a3a8b,0x8b1a1a,0x1a3a8b,0x8b1a1a].forEach((c,i)=>{
  const n = B(0.82,2.9,0.05,M(c,c,0.12,0.85),-2+i,7.55,0.1);
  n.userData = {phase: i * 0.4}; norenMeshes.push(n);
});

// ── Umbrella stand (by door, classic Japanese ramen shop detail) ──────────
(()=>{
  // Stand bucket
  B(0.32,0.72,0.32,M(0x2a2010,0,0,0.75,0.3),3.8,0.36,0.6);
  // Umbrellas in the bucket
  const umbCols=[0x1a3a8b,0x8b1a1a,0x1a5a2a,0x6a1a6a];
  umbCols.forEach((col,i)=>{
    const umb=new THREE.Mesh(
      new THREE.CylinderGeometry(0.04,0.03,1.45,7),
      new THREE.MeshStandardMaterial({color:col,roughness:0.7,emissive:col,emissiveIntensity:0.05})
    );
    umb.position.set(3.8+(i-1.5)*0.09, 0.95, 0.6+(i%2===0?0.06:-0.06));
    umb.rotation.z = (i-1.5)*0.06;
    scene.add(umb);
    // Umbrella tip
    const tip=new THREE.Mesh(new THREE.ConeGeometry(0.04,0.12,6),
      new THREE.MeshStandardMaterial({color:col,roughness:0.5}));
    tip.position.set(umb.position.x, 1.73, umb.position.z); scene.add(tip);
  });
})();

// ── Door ──────────────────────────────────────────────────────────────────
const dfm=M(0x3a2800,0x2a1800,0.08,0.45,0.25);
B(0.22,7.2,0.35,dfm,-2.5,5,0); B(0.22,7.2,0.35,dfm,2.5,5,0); B(5.5,0.22,0.35,dfm,0,8.7,0);
const doorGlassMat=new THREE.MeshStandardMaterial({color:0x1a1005,emissive:0xe8922a,emissiveIntensity:0.22,transparent:true,opacity:0.55,roughness:0.05});
const doorGlass=B(4.8,7,0.1,doorGlassMat,0,5,0.05);
B(0.06,7,0.06,M(0x3a2800,0,0,0.5,0.3),0,5,0.1);
B(4.8,0.06,0.06,M(0x3a2800,0,0,0.5,0.3),0,6.5,0.1);
P(0xe8922a,2.8,0,4,2.5,12);
const doorZone=new THREE.Mesh(new THREE.BoxGeometry(5.5,8,3),new THREE.MeshBasicMaterial({visible:false}));
doorZone.position.set(0,5,1); doorZone.userData.door=true; scene.add(doorZone);

// Door handle — brass, horizontal, right side
(()=>{
  const hm=new THREE.MeshStandardMaterial({color:0x8a7040,roughness:0.22,metalness:0.9});
  const h=new THREE.Mesh(new THREE.CylinderGeometry(0.048,0.048,0.54,10),hm);
  h.rotation.z=Math.PI/2; h.position.set(1.85,4.82,0.22); scene.add(h);
  B(0.07,0.07,0.22,hm,1.6,4.82,0.12); B(0.07,0.07,0.22,hm,2.1,4.82,0.12);
})();

// Welcome mat at entrance
(()=>{
  const mc=document.createElement('canvas'); mc.width=256; mc.height=96;
  const mx=mc.getContext('2d');
  for(let i=0;i<8;i++){mx.fillStyle=i%2===0?'#200c04':'#180a02';mx.fillRect(i*32,0,32,96);}
  mx.strokeStyle='#3a1a08'; mx.lineWidth=3; mx.strokeRect(6,6,244,84);
  mx.fillStyle='#7a5520'; mx.font='bold 22px Georgia'; mx.textAlign='center';
  mx.textBaseline='middle'; mx.shadowBlur=6; mx.shadowColor='#e8922a44';
  mx.fillText('TJ麺',128,48);
  const mat=new THREE.Mesh(new THREE.BoxGeometry(3.8,0.055,1.2),
    new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(mc),roughness:0.92}));
  mat.position.set(0,0.028,1.6); scene.add(mat);
})();

// ── Facade windows ────────────────────────────────────────────────────────
const WG=new THREE.MeshStandardMaterial({color:0xf0c060,emissive:0xf0c060,emissiveIntensity:0.75,roughness:0.25});
const WF=M(0x2a1e0e,0,0,0.5,0.3);
function fWin(x,y){
  B(2.8,2.0,0.28,M(0x0d0a05),x,y,-1.06); B(2.5,1.7,0.05,WG,x,y,-0.88);
  B(2.8,0.1,0.1,WF,x,y+1.0,-0.82); B(2.8,0.1,0.1,WF,x,y-1.0,-0.82);
  B(0.1,2.0,0.1,WF,x-1.4,y,-0.82); B(0.1,2.0,0.1,WF,x+1.4,y,-0.82); B(0.1,2.0,0.1,WF,x,y,-0.82);
}
fWin(-8,14.5); fWin(-2.5,14.5); fWin(2.5,14.5); fWin(8,14.5);

// ── Rooftop sign ──────────────────────────────────────────────────────────
function mkSign(){
  const c=document.createElement('canvas'); c.width=1024; c.height=230;
  const ctx=c.getContext('2d'); ctx.clearRect(0,0,1024,230);
  ctx.shadowBlur=38; ctx.shadowColor='#f0c040';
  ctx.fillStyle='#c8a028'; ctx.font='bold 128px Georgia,serif'; ctx.textAlign='left';
  ctx.fillText('TJ',48,162); ctx.shadowColor='#cc2222'; ctx.fillStyle='#aa1111'; ctx.fillText('麺',310,162);
  ctx.shadowBlur=7; ctx.fillStyle='#f5d858'; ctx.fillText('TJ',48,162);
  ctx.fillStyle='#ee3333'; ctx.fillText('麺',310,162); ctx.shadowBlur=0;
  return new THREE.CanvasTexture(c);
}
function mkSub(){
  const c=document.createElement('canvas'); c.width=2048; c.height=108;
  const ctx=c.getContext('2d'); ctx.clearRect(0,0,2048,108);
  const txt='Applied AI & Full-Stack Engineer  ·  UW Bothell  ·  MIS 2027';
  const pad=24;
  // Fit guard: shrink the font until the text fits inside the canvas width.
  // Deterministic, so an edited tagline never overflows the sub-sign plane.
  ctx.textAlign='center';
  let fs=43;
  ctx.font=fs+'px Georgia,serif';
  while(fs>10 && ctx.measureText(txt).width > c.width - 2*pad){
    fs--; ctx.font=fs+'px Georgia,serif';
  }
  ctx.shadowBlur=14; ctx.shadowColor='#22aacc'; ctx.fillStyle='#38b8d8';
  ctx.fillText(txt,1024,60);
  ctx.shadowBlur=0; ctx.fillStyle='#55d0ee';
  ctx.fillText(txt,1024,60);
  return new THREE.CanvasTexture(c);
}
const signMesh=new THREE.Mesh(new THREE.PlaneGeometry(18,3.8),new THREE.MeshBasicMaterial({map:mkSign(),transparent:true}));
signMesh.position.set(-2,20.8,-0.18); scene.add(signMesh);
const subMesh=new THREE.Mesh(new THREE.PlaneGeometry(28,2.0),new THREE.MeshBasicMaterial({map:mkSub(),transparent:true}));
subMesh.position.set(0,18.2,-0.18); scene.add(subMesh);
const signLights=[];
signLights.push(P(0xe8922a,3.5,0,21,4,20));
signLights.push({intensity:0}); // placeholder
signLights.push({intensity:0}); // placeholder

// ── Side signs ────────────────────────────────────────────────────────────
function mkSS(text,col,w,h,fs){
  const c=document.createElement('canvas'); c.width=w; c.height=h;
  const ctx=c.getContext('2d'); ctx.clearRect(0,0,w,h);
  ctx.shadowBlur=22; ctx.shadowColor=col; ctx.fillStyle=col;
  ctx.font=`bold ${fs}px Georgia,serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
  const lines=text.split('\n');
  const lineH=h/lines.length;
  lines.forEach((line,i)=>ctx.fillText(line,w/2,lineH*(i+0.5)));
  return new THREE.CanvasTexture(c);
}
const openMesh=new THREE.Mesh(new THREE.PlaneGeometry(1.2,4.5),new THREE.MeshBasicMaterial({map:mkSS('O\nP\nE\nN','#cc3333',80,320,52),transparent:true}));
openMesh.position.set(5.5,5.5,-0.28); scene.add(openMesh);
const openLight=P(0xcc3333,1.8,5.5,5,1,6);
const ramenMesh=new THREE.Mesh(new THREE.PlaneGeometry(1.5,4.0),new THREE.MeshBasicMaterial({map:mkSS('ラ\nー\nメ\nン','#f0c040',80,320,44),transparent:true}));
ramenMesh.position.set(-5.5,5.5,-0.28); scene.add(ramenMesh);
// ラーメン light removed

// ── Exterior lanterns ─────────────────────────────────────────────────────
const extLanterns=[];
[-10,-5,0,5,10].forEach(lx=>{
  const g=new THREE.Group();
  const str=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,1.5,6),M(0x4a3010));
  str.position.y=0.75; g.add(str);
  const body=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,1.2,12),new THREE.MeshStandardMaterial({color:0xcc1111,emissive:0xee2222,emissiveIntensity:1.5,roughness:0.7})); // raised past bloom threshold so lantern shades glow
  body.position.y=-0.4; g.add(body);
  for(let r=0;r<5;r++){const rib=new THREE.Mesh(new THREE.TorusGeometry(0.5,0.025,6,12),M(0x8b0000));rib.position.y=-0.1+r*0.25;rib.rotation.x=Math.PI/2;g.add(rib);}
  const tass=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.01,0.5,6),M(0xf0c040));
  tass.position.y=-1.25; g.add(tass);
  // PointLight removed — emissive body handles lantern glow
  g.position.set(lx,10.2,2.0); scene.add(g); extLanterns.push(g);
  const gp=new THREE.Mesh(new THREE.CircleGeometry(2.8,16),new THREE.MeshStandardMaterial({color:0xff4422,emissive:0xff4422,emissiveIntensity:0.22,transparent:true,opacity:0.38}));
  gp.rotation.x=-Math.PI/2; gp.position.set(lx,0.02,2.0); scene.add(gp);
});

// ── City horizon glow — layered amber + purple + blue haze ────────────────
(()=>{
  // Main warm amber glow (street level city warmth)
  const h1=document.createElement('canvas'); h1.width=1024; h1.height=200;
  const c1=h1.getContext('2d');
  const g1=c1.createLinearGradient(0,200,0,0);
  g1.addColorStop(0,'rgba(100,40,10,0.65)'); g1.addColorStop(0.45,'rgba(60,22,35,0.4)'); g1.addColorStop(1,'rgba(10,6,22,0)');
  c1.fillStyle=g1; c1.fillRect(0,0,1024,200);
  // Hotspot center glow
  const rg=c1.createRadialGradient(512,200,0,512,200,500);
  rg.addColorStop(0,'rgba(140,55,15,0.35)'); rg.addColorStop(1,'rgba(0,0,0,0)');
  c1.fillStyle=rg; c1.fillRect(0,0,1024,200);
  const glow1=new THREE.Mesh(new THREE.PlaneGeometry(500,32),
    new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(h1),transparent:true,depthWrite:false}));
  glow1.position.set(0,5,-168); scene.add(glow1);

  // Upper purple/blue city haze
  const h2=document.createElement('canvas'); h2.width=512; h2.height=128;
  const c2=h2.getContext('2d');
  const g2=c2.createLinearGradient(0,128,0,0);
  g2.addColorStop(0,'rgba(30,15,60,0.4)'); g2.addColorStop(1,'rgba(5,5,20,0)');
  c2.fillStyle=g2; c2.fillRect(0,0,512,128);
  const glow2=new THREE.Mesh(new THREE.PlaneGeometry(500,24),
    new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(h2),transparent:true,depthWrite:false}));
  glow2.position.set(0,22,-165); scene.add(glow2);

  // Cool blue district glow (left side)
  const h3=document.createElement('canvas'); h3.width=256; h3.height=128;
  const c3=h3.getContext('2d');
  const rg3=c3.createRadialGradient(30,128,0,30,128,220);
  rg3.addColorStop(0,'rgba(20,80,160,0.35)'); rg3.addColorStop(1,'rgba(0,0,0,0)');
  c3.fillStyle=rg3; c3.fillRect(0,0,256,128);
  const glow3=new THREE.Mesh(new THREE.PlaneGeometry(200,20),
    new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(h3),transparent:true,depthWrite:false}));
  glow3.position.set(-130,10,-162); scene.add(glow3);

  // Add a warm right-district glow too
  const h4=document.createElement('canvas'); h4.width=256; h4.height=128;
  const c4=h4.getContext('2d');
  const rg4=c4.createRadialGradient(226,128,0,226,128,220);
  rg4.addColorStop(0,'rgba(160,60,20,0.3)'); rg4.addColorStop(1,'rgba(0,0,0,0)');
  c4.fillStyle=rg4; c4.fillRect(0,0,256,128);
  const glow4=new THREE.Mesh(new THREE.PlaneGeometry(200,20),
    new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(h4),transparent:true,depthWrite:false}));
  glow4.position.set(130,10,-162); scene.add(glow4);
})();

// ── More exterior neon on neighboring buildings ────────────────────────────
// Izakaya sign on left building
const izakayaMesh=new THREE.Mesh(new THREE.PlaneGeometry(1.8,3.2),
  new THREE.MeshBasicMaterial({map:mkSS('居\n酒\n屋','#44aaff',80,240,52),transparent:true}));
izakayaMesh.position.set(-24,13,-2); scene.add(izakayaMesh);
// 24H sign
const h24Mesh=new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.1),
  new THREE.MeshBasicMaterial({map:mkSS('24H','#44ff88',220,110,58),transparent:true}));
h24Mesh.position.set(24,12,-2); scene.add(h24Mesh);
// Karaoke sign 
const karaMesh=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.2),
  new THREE.MeshBasicMaterial({map:mkSS('カラオケ','#ff44aa',240,120,38),transparent:true}));
karaMesh.position.set(-26,8,-2); scene.add(karaMesh);
const flickerWindows = [];
function sideBld(x,w,h,z,depth,wc){
  B(w,h,depth,M(0x12100a),x,h/2,z);
  const mats=[1.3,0.6,0.25].map(a=>new THREE.MeshStandardMaterial({color:wc,emissive:wc,emissiveIntensity:a,roughness:0.3,transparent:true,opacity:0.88})); // brightest tier crosses bloom threshold
  for(let r=0;r<Math.floor(h/4);r++)for(let c=0;c<Math.floor(w/3.5);c++){
    if(Math.random()<0.45)continue;
    const wm=new THREE.Mesh(new THREE.BoxGeometry(1.4,1.8,0.05),mats[Math.floor(Math.random()*3)].clone());
    wm.position.set(x-w/2+2+c*3.5,2+r*4,z+depth/2+0.05); scene.add(wm);
    // Some windows flicker randomly (TV/people moving)
    if(Math.random()<0.08) flickerWindows.push({mesh:wm, ph:Math.random()*Math.PI*2, base:wm.material.emissiveIntensity});
  }
}
sideBld(-20,14,28,-4,18,0xe8c060); sideBld(20,14,22,-4,18,0xf0b060);
sideBld(-30,10,18,-6,14,0xd0b070); sideBld(30,10,24,-6,14,0xc0a060);
// ── Mid-distance city layer (z:-30 to -55) — windows visible ─────────────
// ── City background group — hidden when inside shop ───────────────────────
const cityGroup = new THREE.Group(); scene.add(cityGroup);

// Override B() and P() scoped helpers to add to cityGroup
function CB(w,h,d,mat,x,y,z){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat instanceof THREE.Material?mat:new THREE.MeshStandardMaterial({color:mat})); m.position.set(x,y,z); cityGroup.add(m); return m; }

function midBld(x,w,h,z,winCol=0xe8c060){
  CB(w,h,10,M(0x0b0907),x,h/2,z);
  for(let r=0;r<Math.floor(h/5);r++) for(let c=0;c<Math.floor(w/4);c++){
    if(Math.random()<0.55) continue;
    const ei=0.25+Math.random()*0.35;
    const wm=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.5,0.05),
      new THREE.MeshStandardMaterial({color:winCol,emissive:winCol,emissiveIntensity:ei,roughness:0.3,transparent:true,opacity:0.75}));
    wm.position.set(x-w/2+2+c*4,2.5+r*5,z+5.05); cityGroup.add(wm);
    if(Math.random()<0.08) flickerWindows.push({mesh:wm,ph:Math.random()*Math.PI*2,base:ei});
  }
}
midBld(-16,12,38,-32,0xe8c880); midBld(16,10,44,-32,0xf0b860);
midBld(-32,14,52,-40,0xd8b870); midBld(32,12,48,-40,0xe0c068);
midBld(-8,8, 34,-36,0xf0d080);  midBld( 8,8, 42,-36,0xe8c070);
midBld(-44,16,58,-48,0xc8a860); midBld( 44,16,55,-48,0xd0b068);
midBld(-22,10,32,-55,0xe0c870); midBld( 22,10,40,-55,0xd8b860);

// ── Far silhouette layer (z:-65 to -90) — silhouettes only ───────────────
function farBld(x,w,h,z){
  CB(w,h,8,M(0x080705),x,h/2,z);
  for(let r=0;r<Math.floor(h/7);r++) for(let c=0;c<Math.floor(w/6);c++){
    if(Math.random()<0.8) continue;
    const wm=new THREE.Mesh(new THREE.BoxGeometry(1.0,1.2,0.04),
      new THREE.MeshStandardMaterial({color:0xf0d880,emissive:0xf0d880,emissiveIntensity:0.18+Math.random()*0.15,roughness:0.4,transparent:true,opacity:0.6}));
    wm.position.set(x-w/2+3+c*6,3+r*7,z+4.04); cityGroup.add(wm);
  }
}
farBld(-14,18,62,-68); farBld(14,16,70,-68);
farBld(-38,14,55,-72); farBld(38,14,60,-72);
farBld(-58,20,75,-78); farBld(58,20,68,-78);
farBld(-24,12,48,-85); farBld(24,12,52,-85);
farBld(-70,24,80,-88); farBld( 70,22,72,-88);

// ── Very far — pure dark silhouettes at z:-100 ───────────────────────────
[-70,-22,22,70].forEach((bx,i)=>{
  const bh=35+[42,55,38,48][i];
  CB(12+i%3*4,bh,6,M(0x060503),bx,bh/2,-100);
});

// ── Ultra-far layer z:-115 (simplified) ──────────────────────────────
(()=>{
  const heights=[72,95,66,102,78,88];
  for(let i=0;i<6;i++){
    const x=-80+i*32; const h=heights[i];
    CB(18,h,5,M(0x050402),x,h/2,-115);
  }
})();

// ── Extreme far z:-140 (simplified) ──────────────────────────────────
(()=>{
  [[-80,24,110],[-22,20,130],[0,28,148],[22,20,132],[80,24,112]].forEach(([x,w,h])=>{
    CB(w,h,4,M(0x040301),x,h/2,-140);
  });
})();

// ── Horizon megastructures z:-165 (simplified) ───────────────────────
(()=>{
  [[-120,40,65],[-40,32,85],[0,32,108],[40,40,88],[120,40,68]].forEach(([x,w,h])=>{
    CB(w,h,3,M(0x030201),x,h/2,-165);
  });
})();

// ── Rooftop details on near buildings ─────────────────────────────────────
// Water towers
function waterTower(x,y,z){
  const tank=new THREE.Mesh(new THREE.CylinderGeometry(0.7,0.7,1.4,8),M(0x1a1208,0,0,0.8));
  tank.position.set(x,y+1.4,z); scene.add(tank);
  const roof=new THREE.Mesh(new THREE.ConeGeometry(0.78,0.55,8),M(0x1a1208,0,0,0.8));
  roof.position.set(x,y+2.4,z); scene.add(roof);
  [0.65,-0.65].forEach(ox=>[0.65,-0.65].forEach(oz=>{
    B(0.07,1.5,0.07,M(0x181008),x+ox,y+0.75,z+oz);
  }));
}
waterTower(-21,28,-4); waterTower(31,24,-6); waterTower(-9,38,-34); waterTower(20,44,-36);

// Antenna / cell tower
function antenna(x,y,z){
  B(0.06,4.5,0.06,M(0x1a1208),x,y+2.25,z);
  B(0.8,0.05,0.05,M(0x1a1208),x,y+4.5,z);
  const blink=new THREE.Mesh(new THREE.SphereGeometry(0.08,6,5),
    new THREE.MeshStandardMaterial({color:0xff2222,emissive:0xff2222,emissiveIntensity:3}));
  blink.position.set(x,y+4.65,z); blink.userData.antBlink=true; scene.add(blink);
}
antenna(-16,28,-2); antenna(22,22,-4); antenna(-36,52,-46); antenna(36,55,-46);

// Rooftop billboard on right near building
(()=>{
  const bc=document.createElement('canvas'); bc.width=256; bc.height=128;
  const bCtx=bc.getContext('2d');
  const bg=bCtx.createLinearGradient(0,0,256,0);
  bg.addColorStop(0,'#0a0520'); bg.addColorStop(1,'#1a0530');
  bCtx.fillStyle=bg; bCtx.fillRect(0,0,256,128);
  bCtx.fillStyle='#22ccee'; bCtx.font='bold 28px Georgia'; bCtx.textAlign='center';
  bCtx.shadowBlur=16; bCtx.shadowColor='#22ccee';
  bCtx.fillText('HIROSHI\'S', 128, 42);
  bCtx.fillStyle='#e8922a'; bCtx.font='20px Georgia';
  bCtx.shadowColor='#e8922a'; bCtx.fillText('定食・ラーメン', 128, 78);
  bCtx.strokeStyle='#22ccee44'; bCtx.lineWidth=2; bCtx.strokeRect(4,4,248,120);
  const bb=new THREE.Mesh(new THREE.PlaneGeometry(5,2.5),
    new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(bc),transparent:true}));
  bb.position.set(22,27,-3); scene.add(bb);
  B(5.2,0.12,0.18,M(0x1a1208),22,25.86,-3);
  B(5.2,0.12,0.18,M(0x1a1208),22,28.14,-3);
  B(0.12,2.5,0.18,M(0x1a1208),19.4,27,-3);
  B(0.12,2.5,0.18,M(0x1a1208),24.6,27,-3);
})();

// New neon signs on mid-distance buildings
const yakinikuMesh=new THREE.Mesh(new THREE.PlaneGeometry(1.6,3.0),
  new THREE.MeshBasicMaterial({map:mkSS('焼\n肉\n↑','#ff6622',80,200,52),transparent:true}));
yakinikuMesh.position.set(-16,16,-31); scene.add(yakinikuMesh);
const hotelMesh=new THREE.Mesh(new THREE.PlaneGeometry(3.2,1.0),
  new THREE.MeshBasicMaterial({map:mkSS('HOTEL','#cc88ff',320,100,48),transparent:true}));
hotelMesh.position.set(17,18,-31); scene.add(hotelMesh);

// ── Street props ──────────────────────────────────────────────────────────
function lamp(x,z){
  B(0.18,10,0.18,M(0x2a2010,0,0,0.6,0.4),x,5,z);
  B(3.5,0.12,0.12,M(0x2a2010,0,0,0.6,0.4),x+1.75,9.5,z);
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(0.28,8,8),new THREE.MeshStandardMaterial({color:0xfffae0,emissive:0xfffae0,emissiveIntensity:4}));
  bulb.position.set(x+3.5,9.4,z); scene.add(bulb);
  if(x>0) P(0xffe8a0,2.5,x+3.5,9,z,18); // only one street lamp lights
}
lamp(-16,10); lamp(16,10);
// Volumetric light cones removed for performance
B(2.2,5,1.4,M(0x0a1a3a,0,0,0.7),-15,2.5,5);
// Vending machine screen — product display
(()=>{
  const vc=document.createElement('canvas'); vc.width=256; vc.height=384;
  const vCtx=vc.getContext('2d');
  vCtx.fillStyle='#050d1a'; vCtx.fillRect(0,0,256,384);
  // Header
  vCtx.fillStyle='#1a3a6a'; vCtx.fillRect(0,0,256,40);
  vCtx.fillStyle='#66bbff'; vCtx.font='bold 18px Georgia'; vCtx.textAlign='center'; vCtx.fillText('お飲み物',128,26);
  // Products grid
  const prods=[['コーヒー','#cc8822'],['緑茶','#448822'],['水','#2266cc'],['ジュース','#cc4422']];
  prods.forEach(([name,col],i)=>{
    const row=Math.floor(i/2), colIdx=i%2;
    const x=14+colIdx*120, y=56+row*150;
    vCtx.fillStyle=col+'33'; vCtx.fillRect(x,y,110,130);
    vCtx.strokeStyle=col; vCtx.lineWidth=1.5; vCtx.strokeRect(x,y,110,130);
    vCtx.fillStyle='#ffffff'; vCtx.font='12px Georgia'; vCtx.textAlign='center';
    vCtx.fillText(name,x+55,y+70);
    vCtx.fillStyle=col; vCtx.font='bold 11px Georgia';
    vCtx.fillText('¥120',x+55,y+100);
  });
  const vmTex=new THREE.CanvasTexture(vc);
  const vmScreen=new THREE.Mesh(new THREE.BoxGeometry(1.8,3,0.1),
    new THREE.MeshStandardMaterial({map:vmTex,emissive:0x2255cc,emissiveIntensity:0.35,roughness:0.15}));
  vmScreen.position.set(-15,2.8,5.72); scene.add(vmScreen);
})();
// ── Bicycle (proper geometry) ─────────────────────────────────────────────
(()=>{
  const bx=14, bz=6, bmat=M(0x2a1a08,0,0,0.55,0.5);
  // Wheels
  const wg=new THREE.TorusGeometry(0.55,0.06,8,18);
  const wm=new THREE.MeshStandardMaterial({color:0x1a1408,roughness:0.6,metalness:0.4});
  const wL=new THREE.Mesh(wg,wm); wL.position.set(bx-0.85,0.58,bz); wL.rotation.y=Math.PI/2; scene.add(wL);
  const wR=new THREE.Mesh(wg,wm); wR.position.set(bx+0.85,0.58,bz); wR.rotation.y=Math.PI/2; scene.add(wR);
  // Spokes (cross bars)
  [0,Math.PI/2].forEach(a=>{
    [bx-0.85,bx+0.85].forEach(wx=>{
      const sp=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,1.0,4),bmat);
      sp.position.set(wx,0.58,bz); sp.rotation.z=a; scene.add(sp);
    });
  });
  // Main frame tubes
  [[bx-0.85,0.58,bz, bx,1.0,bz, 0.04,1.2], // down tube approx (seat to rear)
   [bx+0.85,0.58,bz, bx,1.0,bz, 0.04,1.2], // chain stay
  ].forEach(([x1,y1,z1,x2,y2,z2,r,l])=>{
    const mid=new THREE.Mesh(new THREE.CylinderGeometry(r,r,l,6),bmat);
    mid.position.set((x1+x2)/2,(y1+y2)/2,(z1+z2)/2);
    mid.rotation.z=Math.atan2(y2-y1,x2-x1);
    scene.add(mid);
  });
  // Top tube (horizontal)
  B(1.7,0.07,0.07,bmat,bx,1.05,bz);
  // Seat post + saddle
  B(0.06,0.5,0.06,bmat,bx,0.8,bz);
  B(0.55,0.06,0.16,bmat,bx,1.08,bz);
  // Handlebar stem + bar
  B(0.06,0.4,0.06,bmat,bx+0.72,0.85,bz);
  B(0.06,0.06,0.7,bmat,bx+0.72,1.1,bz);
})();

// Chalkboard
B(2.2,2.8,0.1,M(0x0a1208),-7.5,4.5,0.5);
const chkTex=(()=>{
  const c=document.createElement('canvas'); c.width=256; c.height=320;
  const ctx=c.getContext('2d'); ctx.fillStyle='#0c1810'; ctx.fillRect(0,0,256,320);
  ctx.fillStyle='#c8e0c0'; ctx.font='22px Georgia'; ctx.textAlign='center'; ctx.fillText('今日のランチ',128,44);
  ctx.fillStyle='#a0c8a0'; ctx.font='15px Georgia'; ctx.fillText('LUNCH SPECIAL',128,68);
  ctx.strokeStyle='#4a6a4a'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(20,80); ctx.lineTo(236,80); ctx.stroke();
  ctx.fillStyle='#e0ffe0'; ctx.font='17px Georgia';
  ['醤油 ¥850','味噌 ¥900','塩  ¥800','豚骨 ¥950'].forEach((t,i)=>ctx.fillText(t,128,108+i*38));
  return new THREE.CanvasTexture(c);
})();
const chkPlane=new THREE.Mesh(new THREE.PlaneGeometry(2.0,2.6),new THREE.MeshBasicMaterial({map:chkTex}));
chkPlane.position.set(-7.5,4.5,0.56); scene.add(chkPlane);

// ── Utility pole (right side, classic Tokyo street) ───────────────────────
(()=>{
  const px=18, pz=8;
  // Main pole
  B(0.22,14,0.22,M(0x1a1408,0,0,0.7,0.3),px,7,pz);
  // Cross arms
  B(4,0.12,0.12,M(0x1a1408,0,0,0.6,0.3),px,12.5,pz);
  B(3,0.1,0.1,M(0x1a1408,0,0,0.6,0.3),px,11.5,pz);
  // Insulators (small spheres)
  [-1.8,1.8].forEach(ox=>{
    const ins=new THREE.Mesh(new THREE.SphereGeometry(0.1,6,6),M(0x3a3020,0,0,0.5));
    ins.position.set(px+ox,12.5,pz); scene.add(ins);
  });
  // Power lines as LineSegments
  const wireVerts=new Float32Array([
    px-1.8,12.5,pz,  -13,12.8,0,   // left wire to facade left
    px+1.8,12.5,pz,  13,12.8,0,    // right wire to facade right
    px,11.5,pz,      -5,11.8,-8,   // mid wire
  ]);
  const wireGeo=new THREE.BufferGeometry();
  wireGeo.setAttribute('position',new THREE.BufferAttribute(wireVerts,3));
  const wireMat=new THREE.LineBasicMaterial({color:0x2a2010,transparent:true,opacity:0.7});
  scene.add(new THREE.LineSegments(wireGeo,wireMat));
})();

// ── Sidewalk steam vent grate ─────────────────────────────────────────────
B(1.2,0.06,0.8,M(0x2a2015,0,0,0.8,0.5),-10,0.04,5);
// Grate slats
for(let gx=-0.4;gx<=0.4;gx+=0.2){
  B(0.04,0.08,0.8,M(0x1a1808,0,0,0.6,0.6),-10+gx,0.06,5);
}
const steamVentPtcls=[];
for(let i=0;i<6;i++){
  const sv=new THREE.Mesh(
    new THREE.SphereGeometry(0.06+Math.random()*0.06,4,4),
    new THREE.MeshBasicMaterial({color:0xaabbcc,transparent:true,opacity:0.0})
  );
  sv.position.set(-10+(Math.random()-0.5)*0.8, Math.random()*1.5, 5+(Math.random()-0.5)*0.5);
  sv.userData={baseY:sv.position.y,sp:0.012+Math.random()*0.01,ph:Math.random()*Math.PI*2,bx:-10};
  scene.add(sv); steamVentPtcls.push(sv);
}

// ── YAKITORI neon cross sign on right building ────────────────────────────
const yakiTex=mkSS('焼\n鳥','#ff8822',80,160,52);
const yakiMesh=new THREE.Mesh(
  new THREE.PlaneGeometry(1.2,2.4),
  new THREE.MeshBasicMaterial({map:yakiTex,transparent:true})
);
yakiMesh.position.set(22,14,-3.5); scene.add(yakiMesh);
// side lamp removed; B(0.4,0.38,0.32,M(0x181310),11,0.88,3.5);
B(0.18,0.18,0.1,M(0x181310),10.78,1.12,3.4); B(0.18,0.18,0.1,M(0x181310),11.22,1.12,3.4);
const eyeMat=new THREE.MeshStandardMaterial({color:0x22ff44,emissive:0x22ff44,emissiveIntensity:3});
const eL=new THREE.Mesh(new THREE.SphereGeometry(0.042,6,6),eyeMat); eL.position.set(10.84,0.91,3.34); scene.add(eL);
const eR=new THREE.Mesh(new THREE.SphereGeometry(0.042,6,6),eyeMat); eR.position.set(11.16,0.91,3.34); scene.add(eR);
// Cat tail
const catTail=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.045,0.65,7),M(0x181310));
catTail.position.set(10.52,0.58,3.56); scene.add(catTail);

// Cat name sign — "たま" (Tama)
(()=>{
  const tc=document.createElement('canvas'); tc.width=96; tc.height=36;
  const tCtx=tc.getContext('2d');
  tCtx.fillStyle='rgba(240,225,175,0.93)'; tCtx.fillRect(3,3,90,30);
  tCtx.strokeStyle='#8b6020'; tCtx.lineWidth=1.5; tCtx.strokeRect(3,3,90,30);
  tCtx.fillStyle='#3a1e08'; tCtx.font='bold 18px Georgia,serif';
  tCtx.textAlign='center'; tCtx.textBaseline='middle'; tCtx.fillText('たま',48,18);
  const tamaSign=new THREE.Mesh(
    new THREE.PlaneGeometry(0.7,0.26),
    new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(tc),transparent:true})
  );
  tamaSign.position.set(11,1.5,3.42); scene.add(tamaSign);
})();

// Small succulent on counter left end
(()=>{
  const pot=new THREE.Mesh(new THREE.CylinderGeometry(0.19,0.14,0.3,10),
    new THREE.MeshStandardMaterial({color:0x9a3820,roughness:0.85}));
  pot.position.set(-9.8,5.44,-22); scene.add(pot);
  const dirt=new THREE.Mesh(new THREE.CircleGeometry(0.18,10),M(0x3a2010));
  dirt.rotation.x=-Math.PI/2; dirt.position.set(-9.8,5.6,-22); scene.add(dirt);
  const plant=new THREE.Mesh(new THREE.SphereGeometry(0.24,8,6),
    new THREE.MeshStandardMaterial({color:0x2a5018,roughness:0.9,emissive:0x0e2008,emissiveIntensity:0.15}));
  plant.scale.set(1,0.75,1); plant.position.set(-9.8,5.78,-22); scene.add(plant);
  // Rosette leaves
  for(let i=0;i<6;i++){
    const leaf=new THREE.Mesh(new THREE.SphereGeometry(0.1,5,4),
      new THREE.MeshStandardMaterial({color:0x3a6522,roughness:0.8,emissive:0x0a1804,emissiveIntensity:0.1}));
    const a=i/6*Math.PI*2;
    leaf.position.set(-9.8+0.2*Math.cos(a),5.82,-22+0.2*Math.sin(a));
    leaf.scale.set(0.7,0.5,0.7); scene.add(leaf);
  }
})();

// ── Passing cars — tail lights drifting across background street ──────────
const passingCars=[];
for(let i=0;i<2;i++){
  const carX = -80 + i*80 + Math.random()*30;
  const carZ = 34 + Math.random()*12;
  // Tail light pair
  const tlMat=new THREE.MeshStandardMaterial({color:0xff2211,emissive:0xff1100,emissiveIntensity:2.5,roughness:0.3});
  const tl1=new THREE.Mesh(new THREE.BoxGeometry(0.28,0.18,0.08),tlMat.clone());
  const tl2=new THREE.Mesh(new THREE.BoxGeometry(0.28,0.18,0.08),tlMat.clone());
  tl1.position.set(carX-0.65,0.88,carZ); scene.add(tl1);
  tl2.position.set(carX+0.65,0.88,carZ); scene.add(tl2);
  const cl={position:{x:carX},intensity:0}; // light removed, using emissive only
  passingCars.push({tl1,tl2,cl,x:carX,z:carZ,speed:3+Math.random()*2.5});
}

// ── Awning rain drips ────────────────────────────────────────────────────
const awningDrips = [];
for(let i=0;i<8;i++){
  const drip = new THREE.Mesh(
    new THREE.SphereGeometry(0.04,5,5),
    new THREE.MeshBasicMaterial({color:0x9aaabb,transparent:true,opacity:0.0})
  );
  const startX = (Math.random()-0.5)*24;
  drip.position.set(startX, 10.12, 3.5);
  drip.userData = {
    startX, startY:10.12, phase: Math.random()*Math.PI*2,
    speed: 0.06+Math.random()*0.04, interval: 1+Math.random()*2,
    t: Math.random()*3, falling: false
  };
  scene.add(drip); awningDrips.push(drip);
}

// ── Rain ─────────────────────────────────────────────────────────────────
const RC=60;
const rainGeo=new THREE.BufferGeometry();
const rainPos=new Float32Array(RC*6);
const rainSpeeds = new Float32Array(RC); // per-streak speed variation
for(let i=0;i<RC;i++){
  const x=(Math.random()-0.5)*90, y=Math.random()*55, z=(Math.random()-0.5)*90;
  const len = 0.5 + Math.random()*1.4; // varied streak lengths
  const spd = 0.7 + Math.random()*0.6;
  rainPos[i*6]=x;      rainPos[i*6+1]=y;       rainPos[i*6+2]=z;
  rainPos[i*6+3]=x-0.25*spd; rainPos[i*6+4]=y-len; rainPos[i*6+5]=z;
  rainSpeeds[i] = spd;
}
rainGeo.setAttribute('position',new THREE.BufferAttribute(rainPos,3));
const rain=new THREE.LineSegments(rainGeo,new THREE.LineBasicMaterial({color:0x9aaabb,transparent:true,opacity:0.32}));
scene.add(rain);

// ── Rain splash rings (on sidewalk/street) ────────────────────────────────
const splashPool = [];
const SPLASH_COUNT = 6;
for(let i=0;i<SPLASH_COUNT;i++){
  const maxAge = 0.6+Math.random()*0.7;
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.05,0.12,14),
    new THREE.MeshBasicMaterial({color:0x9aaabb,transparent:true,opacity:0,side:THREE.DoubleSide})
  );
  ring.rotation.x = -Math.PI/2;
  ring.position.set((Math.random()-0.5)*28, 0.03, Math.random()*10+2);
  ring.userData = {age: Math.random()*maxAge, maxAge}; // stagger start times
  scene.add(ring); splashPool.push(ring);
}

// ── Bokeh ─────────────────────────────────────────────────────────────────
const BC=15, bokehGeo=new THREE.BufferGeometry(), bkPos=new Float32Array(BC*3), bkD=[];
for(let i=0;i<BC;i++){
  bkPos[i*3]=(Math.random()-0.5)*40; bkPos[i*3+1]=Math.random()*15+1; bkPos[i*3+2]=(Math.random()-0.5)*30+15;
  bkD.push({vy:(Math.random()-0.5)*0.01,vx:(Math.random()-0.5)*0.008,ph:Math.random()*Math.PI*2});
}
bokehGeo.setAttribute('position',new THREE.BufferAttribute(bkPos,3));
const bokeh=new THREE.Points(bokehGeo,new THREE.PointsMaterial({color:0xe8c060,size:0.055,transparent:true,opacity:0.22,sizeAttenuation:true}));
scene.add(bokeh);

// ── Fireflies ──────────────────────────────────────────────────────────
const FIREFLY_COUNT = 8;
const fireflyGeo = new THREE.BufferGeometry();
const ffPos = new Float32Array(FIREFLY_COUNT * 3);
const ffData = [];
for(let i=0;i<FIREFLY_COUNT;i++){
  ffPos[i*3] = (Math.random()-0.5)*40;
  ffPos[i*3+1] = 1 + Math.random()*8;
  ffPos[i*3+2] = (Math.random()-0.5)*20 + 10;
  ffData.push({
    vx:(Math.random()-0.5)*0.015, vy:(Math.random()-0.5)*0.01,
    ph:Math.random()*Math.PI*2, sp:0.3+Math.random()*1.5,
    baseY:ffPos[i*3+1]
  });
}
fireflyGeo.setAttribute('position', new THREE.BufferAttribute(ffPos,3));
const fireflyMat = new THREE.PointsMaterial({
  color:0xaaff44, size:0.18, transparent:true, opacity:0.0,
  sizeAttenuation:true
});
const fireflies = new THREE.Points(fireflyGeo, fireflyMat);
scene.add(fireflies);

// ── Interior structure ────────────────────────────────────────────────────
// Canvas wood floor — dark hardwood planks
