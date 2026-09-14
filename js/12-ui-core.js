// Cursor, interaction zones, stool and bowl data, seat and bowl cameras, clock facts, ambient audio.
// Split from the original single-file index.html on 2026-09-13; classic script, shares the global scope
// with every other js/*.js file. Load order is the numeric prefix.

// ── Cursor ────────────────────────────────────────────────────────────────
const cursorEl = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
let mx = innerWidth/2, my = innerHeight/2, rx = mx, ry = my;
const hoverLabel = document.getElementById('hover-label');
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursorEl.style.left=mx+'px'; cursorEl.style.top=my+'px';
  hoverLabel.style.left=mx+'px'; hoverLabel.style.top=my+'px';
});
(function tickRing(){ rx+=(mx-rx)*0.12; ry+=(my-ry)*0.12; cursorRing.style.left=rx+'px'; cursorRing.style.top=ry+'px'; requestAnimationFrame(tickRing); })();

function setHoverLabel(text){
  if(text){ hoverLabel.textContent=text; hoverLabel.classList.add('visible'); }
  else { hoverLabel.classList.remove('visible'); }
}

// ── HUD parallax ──────────────────────────────────────────────────────────
// Soft cursor-driven drift on the corner HUD — fulfills the transform-transition
// intent declared in the #time-disp / #avail-badge CSS block. Pure DOM, zero
// GPU cost. The existing CSS transition handles the smoothing; we just set a
// new target on each mousemove.
(function hudParallax(){
  const hudEls = Array.from(document.querySelectorAll('#time-disp, #avail-badge'));
  if (!hudEls.length) return;
  // Integer-pixel translate (not translate3d) keeps serif text crisp — promoted
  // layers interpolate on sub-pixel offsets and smear the glyphs.
  document.addEventListener('mousemove', (e) => {
    const tx = Math.round((e.clientX/innerWidth  - 0.5) * -12);
    const ty = Math.round((e.clientY/innerHeight - 0.5) *  -7);
    const t  = 'translate(' + tx + 'px, ' + ty + 'px)';
    for (const el of hudEls){ el.style.transform = t; }
  }, { passive: true });
})();

// ── Cursor trail ──────────────────────────────────────────────────────────
const trailCount = 4;
const trailDots = [];
const trailPos = Array.from({length:trailCount}, () => ({x:mx,y:my}));
for(let i=0;i<trailCount;i++){
  const d = document.createElement('div'); d.className='tr';
  const s = 1 - i/trailCount;
  d.style.cssText = `width:${5*s}px;height:${5*s}px;opacity:${0.5*s};transition:opacity 0.1s;`;
  document.getElementById('trail-container').appendChild(d);
  trailDots.push(d);
}
(function tickTrail(){
  trailPos.unshift({x:mx,y:my}); trailPos.length = trailCount+1;
  trailDots.forEach((d,i)=>{
    const p = trailPos[i+1]||trailPos[i];
    d.style.left=p.x+'px'; d.style.top=p.y+'px';
  });
  requestAnimationFrame(tickTrail);
})();

// ── Interaction system ────────────────────────────────────────────────────
const interactZones = [];
function mkZone(w,h,d,x,y,z,data){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({visible:false}));
  m.position.set(x,y,z); m.userData={...data,interact:true}; scene.add(m); interactZones.push(m); return m;
}

const stoolPositions=[-8,-4.5,-1,2.5,6,9.5];
const stoolOrders=['醤油','味噌','塩','豚骨','醤油','つけ麺'];
const stoolEnOrders=['Shoyu Ramen','Miso Ramen','Shio Ramen','Tonkotsu Ramen','Shoyu Ramen','Tsukemen'];
const stoolComments=['A classic. Good choice.','Bold. The Sapporo special.','Elegant — the purist\'s bowl.','Rich and heavy. Respect.','Back to basics. Respect.','For the noodle connoisseur.'];

const bowlFacts=[
  {emoji:'🍜',kanji:'醤油ラーメン',sub:'Tokyo-style Shoyu Ramen',
   body:'The <strong>original Tokyo ramen</strong>, developed in the 1910s. A clear amber broth built from soy tare and chicken-pork dashi, with medium-thick wavy noodles, 18-hour chashu pork, nori, narutomaki, and a soft-boiled egg marinated for exactly 8 hours. The soy sauce in the broth has been fermented for <strong>6 months</strong> and contains over 285 aroma compounds — more than most wines.'},
  {emoji:'🍜',kanji:'味噌ラーメン',sub:'Sapporo-style Miso Ramen',
   body:'Invented in <strong>Sapporo in 1955</strong> by chef Morito Omiya — a customer asked him to stir-fry the ingredients before adding broth. The result changed Japanese food forever. Thick, opaque broth from fermented soybean paste, served with corn, butter, and thick curly noodles. Best eaten within <strong>3 minutes</strong> before the noodles drink the broth.'},
  {emoji:'🍜',kanji:'塩ラーメン',sub:'Hakodate-style Shio Ramen',
   body:'<strong>The oldest style of ramen</strong> in Japan, brought from China in the late 1800s. Pure salt seasoning — no soy, no miso — lets the stock speak entirely for itself. The clear golden broth uses kelp dashi and chicken. In Hakodate, every family has a secret recipe. This bowl is the lightest of the four styles, and considered the hardest to make well.'},
];
[-6,0,6].forEach((bx,i)=>mkZone(2,1.8,2,bx,5.8,-22.5,{type:'bowl', bowlIdx:i, ...bowlFacts[i], hoverLabel:'↑ Inspect bowl'}));

stoolPositions.forEach((sx,i)=>mkZone(1.2,1.2,1.2,sx,4.12,-19,{type:'seat',seatIdx:i,hoverLabel:'Take a seat'}));

mkZone(0.7,1.4,0.7,3.5,5.8,-22,{type:'fact',hoverLabel:'Read label',emoji:'🫙',kanji:'醤油',sub:'Soy Sauce · Kikkoman',body:'This bottle has been brewing for <strong>6 months</strong>. Kikkoman\'s process is unchanged since 1661: wheat, soybeans, salt, and <em>koji</em> mold ferment together in cedar barrels, developing <strong>285+ aroma compounds</strong> — a more complex aromatic profile than most wines. Pasteurized at exactly 80°C. The recipe is kept in a vault in Noda, Japan.'});
mkZone(0.9,1.2,0.7,-3,5.8,-22,{type:'fact',hoverLabel:'Examine chopsticks',emoji:'🥢',kanji:'割り箸',sub:'Waribashi · Disposable Chopsticks',body:'Invented in <strong>1878</strong> in Japan\'s Yoshino forest — a region known for its cedar and cypress. Japan uses approximately <strong>24 billion pairs per year</strong>. The correct grip: hold the lower chopstick stationary like a pen; move only the upper one. Rule: never stick them upright in rice — that\'s a funeral rite called <em>hotoke-bashi</em>.'});
mkZone(0.8,1.2,0.8,11,0.8,3.5,{type:'cat',hoverLabel:'Pet Tama',emoji:'🐱',kanji:'たま',sub:'Tama · Shop Cat · 看板猫',body:'<strong>Tama</strong> has lived here for 7 years, found sleeping in the chopstick holder as a kitten. Named after the <strong>Tama Station Cat</strong> — the calico stationmaster who saved Kishi Station from closure in 2007. Cats are considered business good-luck charms in Japan. Tama judges your chopstick technique but won\'t say anything. She just knows.'});
mkZone(0.7,1.0,0.8,-4.2,0.6,0.5,{type:'fact',hoverLabel:'Meet the tanuki',emoji:'🦝',kanji:'たぬき',sub:'Tanuki · Lucky Raccoon Dog',body:'This is the shop\'s <strong>tanuki</strong> (狸) — a raccoon dog figurine that\'s been guarding the entrance for years. Tanuki are Japan\'s most beloved good luck charm, symbolizing <strong>prosperity, happiness, and good fortune</strong>. The hat means resilience, the sake bottle means hospitality, the big belly means contentment. The 福 (fuku) sign means "luck." Every ramen shop worth its salt has one near the door.'});
mkZone(2,2,0.5,9,8.5,-40.5,{type:'clock',hoverLabel:'Check the time',emoji:'🕰️',kanji:'時刻',sub:'Wall Clock'});

// Tea cup — shows coursework card
mkZone(0.5,0.5,0.5,-9,5.7,-21.5,{
  type:'fact',hoverLabel:'Your tea',emoji:'🍵',kanji:'お茶',sub:'Green Tea · Your Complimentary Cup',
  body:'Every guest gets a complimentary cup of <strong>sencha green tea</strong> while they wait. Brewed at 70°C — any hotter and the catechins turn bitter.<br><br><strong style="color:#3a2a1a;font-size:0.85rem;display:block;margin-top:0.6rem;margin-bottom:0.3rem">Relevant Coursework</strong><span style="font-size:0.74rem;color:#5a4a3a;line-height:2">Business Analytics · Data Mining &amp; ML · Financial Accounting · Operations Mgmt · Business Intelligence Systems · Statistical Analysis · Database Mgmt · Financial Modeling · Project Mgmt · Supply Chain Analytics · Corporate Finance · Marketing Analytics</span>',
});

// Bulletin board — shows side projects
mkZone(0.4,2.8,2.4,-11.5,5.8,-8,{
  type:'fact',hoverLabel:'Side projects',emoji:'📌',kanji:'小作品',sub:'Side Projects · Smaller Work',
  body:'<strong>ragproof</strong> <span style="font-size:0.65rem;color:#8a6a3a">Python · CLI · Docker</span><br>Open-source RAG evaluation harness built from scratch. Scores retrieval and generation: hit@k, MRR, NDCG, faithfulness, cost, embedding drift.<br><br><strong>SyllabusAI</strong> <span style="font-size:0.65rem;color:#8a6a3a">Claude API · Node.js · Supabase</span><br>Upload a syllabus, get every deadline in your calendar in seconds.<br><br><strong>AutoAppli</strong> <span style="font-size:0.65rem;color:#8a6a3a">Next.js · FastAPI · Claude API</span><br>AI job-application platform: resume tailoring, outreach drafts, and Kanban tracking.<br><br><strong>Jacobs\' Pharmacy 3D Recreation</strong> <span style="font-size:0.65rem;color:#8a6a3a">Blender · Python</span><br>Procedural recreation of the 1886 pharmacy where Coca-Cola was first served, generated from code. Coca-Cola internship capstone.',
});
mkZone(4.5,3.5,0.4,-11.6,7.2,-25,{type:'fact',hoverLabel:'View painting',emoji:'🎨',kanji:'夜景',sub:'Night Landscape · Ink & Woodblock',body:'A woodblock-inspired print in the style of <strong>Hiroshige\'s 53 Stations of the Tōkaidō</strong>. The crescent moon is a recurring motif in Edo-period landscapes — it represents transition, impermanence, and <em>mono no aware</em>. The mountains are loosely based on <strong>Mount Rainier</strong> reimagined as Mount Fuji. TJ picked it up at a Capitol Hill art market in 2022. The red stamp reads 印 — "seal."'});
mkZone(5,3,1.5,-8.5,7,-29.5,{type:'fact',hoverLabel:'Read sake shelf',emoji:'🍶',kanji:'純米大吟醸',sub:'Top-Grade Sake · Junmai Daiginjo',body:'These bottles are <strong>junmai daiginjo</strong> (純米大吟醸) — the highest classification of sake. To qualify, rice must be polished to <strong>50% or less</strong> of its original size, removing proteins and oils to reveal a clean, floral flavor. Served chilled at 8–10°C. The blue bottle is brewed in Niigata; the green in Kyoto. The red lacquer cap on the left indicates it\'s unpasteurized — <em>namazake</em>.'});
mkZone(5,3.5,0.4,-8,5.8,-40.5,{type:'fact',hoverLabel:"Read today's specials",emoji:'📋',kanji:'本日のおすすめ',sub:"Today's Specials · Chef Recommends",body:'<strong>醤油ラーメン ¥850</strong> — 18-hour chashu, nori, soft-boiled egg<br><strong>特製チャーシュー +¥200</strong> — double cut, caramelized soy glaze<br><strong>半熟卵 +¥100</strong> — marinated 8hr in soy tare<br><strong>ライス ¥150</strong> — short-grain, cooked in dashi<br><br><em>All broths simmered 12+ hours. Noodles made in-house each morning. No MSG. No shortcuts.</em>'});

// ── Interaction card UI ─────────────────────────────────────────────────────
let _icTimer=null;
function showInteractCard(data,dur=7500){
  // Do not let ambient facts compete with a case-study reading state.
  if(document.getElementById('panel-overlay')?.classList.contains('active')) return;
  clearTimeout(_icTimer);
  document.getElementById('ic-emoji').textContent=data.emoji||'';
  document.getElementById('ic-kanji').textContent=data.kanji||'';
  document.getElementById('ic-subtitle').textContent=data.sub||'';
  document.getElementById('ic-body').innerHTML=data.body||'';
  const prog=document.getElementById('ic-progress');
  prog.style.setProperty('--ic-dur',dur+'ms');
  prog.style.animation='none'; void prog.offsetWidth; prog.style.animation='';
  document.getElementById('interact-card').classList.add('visible');
  _icTimer=setTimeout(hideInteractCard,dur);
  srAnnounce((data.kanji||'')+'. '+(data.sub||''));
}
function hideInteractCard(){
  clearTimeout(_icTimer);
  document.getElementById('interact-card').classList.remove('visible');
}
window.hideInteractCard=hideInteractCard;

// Cat meow
function playMeow(){
  if(!audioCtx) return;
  const osc=audioCtx.createOscillator(),g=audioCtx.createGain(),f=audioCtx.createBiquadFilter();
  f.type='bandpass'; f.frequency.value=1100; f.Q.value=3.5;
  osc.connect(f); f.connect(g); g.connect(audioCtx.destination);
  osc.type='sine';
  osc.frequency.setValueAtTime(850,audioCtx.currentTime);
  osc.frequency.setValueAtTime(1350,audioCtx.currentTime+0.07);
  osc.frequency.exponentialRampToValueAtTime(680,audioCtx.currentTime+0.25);
  g.gain.setValueAtTime(0,audioCtx.currentTime);
  g.gain.linearRampToValueAtTime(0.08,audioCtx.currentTime+0.05);
  g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.38);
  osc.start(); osc.stop(audioCtx.currentTime+0.4);
}
// Cat purr
let _lastMeowTime = 0;
function playPurr(){
  if(!audioCtx) return;
  // Low rumble purr
  const osc=audioCtx.createOscillator(),g=audioCtx.createGain(),f=audioCtx.createBiquadFilter();
  f.type='lowpass'; f.frequency.value=200; f.Q.value=2;
  osc.connect(f); f.connect(g); g.connect(audioCtx.destination);
  osc.type='sawtooth'; osc.frequency.value=28;
  // Pulsing gain for purr rhythm
  const now=audioCtx.currentTime;
  for(let i=0;i<8;i++){
    g.gain.setValueAtTime(0.015, now+i*0.18);
    g.gain.linearRampToValueAtTime(0.04, now+i*0.18+0.08);
    g.gain.linearRampToValueAtTime(0.015, now+i*0.18+0.16);
  }
  g.gain.linearRampToValueAtTime(0, now+1.5);
  osc.start(now); osc.stop(now+1.6);
}

// ── Bowl inspect camera ─────────────────────────────────────────────────────
let bowlInspecting=false, _bowlReturnTimer=null;
// Camera positioned above and slightly forward from each bowl — telephoto down shot
const bowlCams=[
  {pos:new THREE.Vector3(-4.5,9.8,-17.2),look:new THREE.Vector3(-6,5.85,-22.5)},
  {pos:new THREE.Vector3(1.5, 9.8,-17.2),look:new THREE.Vector3(0,  5.85,-22.5)},
  {pos:new THREE.Vector3(7.5, 9.8,-17.2),look:new THREE.Vector3(6,  5.85,-22.5)},
];
function inspectBowl(idx, factData){
  if(bowlInspecting){ returnFromBowl(); return; }
  // Can't inspect from seated — stand first
  if(seated){ standUp(); }
  bowlInspecting=true;
  ct.pos.copy(bowlCams[idx].pos);
  ct.look.copy(bowlCams[idx].look);
  yaw=0; pitch=0; targetFov=40; // telephoto close-up
  showInteractCard({...factData}, 10000);
  clearTimeout(_bowlReturnTimer);
  _bowlReturnTimer=setTimeout(returnFromBowl, 10000);
  srAnnounce('Inspecting '+(factData.kanji||'ramen bowl')+'. Press Escape or wait 10 seconds to return.');
}
function returnFromBowl(){
  if(!bowlInspecting) return;
  bowlInspecting=false; clearTimeout(_bowlReturnTimer);
  ct.pos.copy(CIN.pos); ct.look.copy(CIN.look);
  targetFov=68; hideInteractCard();
}

// ── Seated camera
let seated=false,seatedIdx=-1;
const seatCams=stoolPositions.map(sx=>({
  pos:new THREE.Vector3(sx,5.4,-16),
  look:new THREE.Vector3(sx*0.2,5.55,-23),
}));
function takeSeat(idx){
  if(seated&&seatedIdx===idx){standUp();return;}
  if(bowlInspecting) returnFromBowl();
  seated=true; seatedIdx=idx;
  ct.pos.copy(seatCams[idx].pos); ct.look.copy(seatCams[idx].look);
  yaw=0; pitch=0; targetFov=72;
  document.getElementById('seated-overlay').classList.add('visible');
  document.getElementById('seated-order').textContent=stoolOrders[idx]+'　—　'+stoolComments[idx];
  if(audioCtx&&soundEnabled){
    const osc=audioCtx.createOscillator(),g=audioCtx.createGain();
    osc.connect(g); g.connect(audioCtx.destination);
    osc.type='sine'; osc.frequency.setValueAtTime(440,audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220,audioCtx.currentTime+0.18);
    g.gain.setValueAtTime(0.04,audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.22);
    osc.start(); osc.stop(audioCtx.currentTime+0.25);
  }
  srAnnounce('Seated at stool '+(idx+1)+'. '+stoolEnOrders[idx]+'. '+stoolComments[idx]+'. Click here or press Escape to stand up.');
}
function standUp(){
  if(!seated) return;
  seated=false; seatedIdx=-1;
  document.getElementById('seated-overlay').classList.remove('visible');
  // Only restore camera if still inside — don't overwrite outside camera
  if(inside){ ct.pos.copy(CIN.pos); ct.look.copy(CIN.look); targetFov=68; }
}
window.standUp=standUp;

// Silent reset used by exitShop — clears UI state without touching camera
function _clearSeatedState(){
  seated=false; seatedIdx=-1;
  bowlInspecting=false; clearTimeout(_bowlReturnTimer);
  document.getElementById('seated-overlay').classList.remove('visible');
  hideInteractCard();
}

function getClockFact(){
  const now=new Date(),hr=now.getHours(),mn=now.getMinutes();
  const t=String(hr).padStart(2,'0')+':'+String(mn).padStart(2,'0');
  const comment=hr<5?'You\'re up late. Ramen shops in Japan close at 2am.':
    hr<10?'Morning. Broth prep started at 5am. The bones have been simmering for hours.':
    hr<14?'Lunchtime. In Tokyo, the line outside Ichiran forms by 11:30am.':
    hr<17?'Quiet afternoon. Good time to review TJ\'s projects.':
    hr<20?'Dinner rush. Peak ramen hours: 7pm–10pm.':
    hr<23?'Evening. Ramen after 8pm hits differently.':'Late-night ramen (〆ラーメン) after a long day. No judgment.';
  return {emoji:'🕰️',kanji:'今 '+t,sub:'Current time in Seattle',body:'It\'s <strong>'+t+'</strong> in Seattle. '+comment+' The clock on the wall says the same thing — it updates in real time.'};
}

// ── Loader status cycling ─────────────────────────────────────────────────
(()=>{
  const msgs=['Warming up the kitchen…','Hanging the lanterns…','Setting out the bowls…','Turning on the neons…','Opening the noren…'];
  let mi=0;
  const el=document.getElementById('loader-status');
  if(el) setInterval(()=>{ el.style.opacity='0'; setTimeout(()=>{ el.textContent=msgs[++mi%msgs.length]; el.style.opacity='1'; },300); },900);
})();
function updateClock(){
  const now=new Date();
  const h=String(now.getHours()).padStart(2,'0'), m=String(now.getMinutes()).padStart(2,'0');
  const s=String(now.getSeconds()).padStart(2,'0');
  const el=document.querySelector('#time-disp .t'); if(el) el.textContent=h+':'+m+':'+s;
  // Time-aware subtitle
  const sub=document.querySelector('#time-disp .s');
  if(sub){
    const hr=now.getHours();
    const wx = hr<6?'Clear · Still':hr<10?'Overcast':hr<15?'Partly Cloudy':hr<19?'Cloudy':hr<22?'Light Rain':'Rain';
    sub.textContent = 'Seattle, WA · '+wx;
  }
  // Time-aware door hint
  const hint=document.querySelector('#outside-ui .hint');
  if(hint){
    const hr=now.getHours();
    const g=hr<5?'Still up? ':hr<12?'Good morning. ':hr<17?'Good afternoon. ':hr<21?'Good evening. ':'Late night. ';
    hint.textContent=g+'↑ Click the door to step inside';
  }
  // Update wall clock hands every minute (guard: drawWallClock may not exist yet on first call)
  if(now.getSeconds()===0) try{ drawWallClock(); }catch(e){}
}
updateClock(); setInterval(updateClock, 1000);

// ── Web Audio ambient sound ────────────────────────────────────────────────
let audioCtx=null, rainGainNode=null, indoorGainNode=null, soundEnabled=false;
function initAudio(){
  if(audioCtx) return;
  audioCtx = new (window.AudioContext||window.webkitAudioContext)();
  // White noise buffer for rain
  const bufLen = audioCtx.sampleRate * 3;
  const buf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
  const data = buf.getChannelData(0);
  for(let i=0;i<bufLen;i++) data[i] = Math.random()*2-1;
  function makeNoise(gain, filterFreq, filterQ, loopLen){
    const src = audioCtx.createBufferSource();
    src.buffer = buf; src.loop = true; src.loopEnd = loopLen||3;
    const filt = audioCtx.createBiquadFilter();
    filt.type='bandpass'; filt.frequency.value=filterFreq; filt.Q.value=filterQ;
    const g = audioCtx.createGain(); g.gain.value = 0;
    src.connect(filt); filt.connect(g); g.connect(audioCtx.destination);
    src.start(); return g;
  }
  rainGainNode = makeNoise(0, 1200, 0.4);
  indoorGainNode = makeNoise(0, 220, 2.2, 2.8);
  // Low rumble for interior
  const osc = audioCtx.createOscillator();
  osc.type='sine'; osc.frequency.value=55;
  const oscGain = audioCtx.createGain(); oscGain.gain.value=0;
  osc.connect(oscGain); oscGain.connect(audioCtx.destination); osc.start();
  indoorGainNode._oscGain = oscGain;
}
function setRainVolume(v, ramp=0.8){
  if(!audioCtx) return;
  const t = audioCtx.currentTime;
  rainGainNode.gain.linearRampToValueAtTime(soundEnabled?v:0, t+ramp);
}
function setIndoorVolume(v, ramp=0.8){
  if(!audioCtx) return;
  const t = audioCtx.currentTime;
  indoorGainNode.gain.linearRampToValueAtTime(soundEnabled?v:0, t+ramp);
  if(indoorGainNode._oscGain) indoorGainNode._oscGain.gain.linearRampToValueAtTime(soundEnabled?v*0.3:0, t+ramp);
}
function toggleSound(){
  initAudio();
  soundEnabled = !soundEnabled;
  const btn = document.getElementById('sound-btn');
  const wave = document.getElementById('sound-wave');
  btn.style.opacity = soundEnabled ? '1' : '0.45';
  btn.title = soundEnabled ? 'Sound on (S)' : 'Sound off (S)';
  wave.classList.toggle('active', soundEnabled);
  if(inside){ setRainVolume(0); setIndoorVolume(0.055); }
  else { setRainVolume(0.09); setIndoorVolume(0); }
  syncSoundBtn();
}
window.toggleSound = toggleSound;

// ── State ─────────────────────────────────────────────────────────────────
