// Wall painting, scooter, antenna blink, lo-fi generator, lightning, day and night, toasts, omikuji, greeting, Konami.
// Split from the original single-file index.html on 2026-09-13; classic script, shares the global scope
// with every other js/*.js file. Load order is the numeric prefix.
(()=>{
  const c=document.createElement('canvas'); c.width=220; c.height=160;
  const ctx=c.getContext('2d');
  const sk=ctx.createLinearGradient(0,0,0,160);
  sk.addColorStop(0,'#1a1030'); sk.addColorStop(1,'#2a1810');
  ctx.fillStyle=sk; ctx.fillRect(0,0,220,160);
  ctx.shadowBlur=20; ctx.shadowColor='#f0e060';
  ctx.fillStyle='#f5e870'; ctx.beginPath(); ctx.arc(165,38,16,0,Math.PI*2); ctx.fill();
  ctx.shadowBlur=0;
  ctx.fillStyle='rgba(26,16,48,0.45)'; ctx.beginPath(); ctx.arc(172,35,14,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#1e1828'; ctx.beginPath(); ctx.moveTo(0,160); ctx.lineTo(40,75); ctx.lineTo(80,100); ctx.lineTo(120,60); ctx.lineTo(160,85); ctx.lineTo(200,65); ctx.lineTo(220,80); ctx.lineTo(220,160); ctx.fill();
  ctx.fillStyle='#180e08'; ctx.beginPath(); ctx.moveTo(0,160); ctx.lineTo(50,110); ctx.lineTo(90,130); ctx.lineTo(140,95); ctx.lineTo(190,118); ctx.lineTo(220,105); ctx.lineTo(220,160); ctx.fill();
  ctx.fillStyle='#0a180a';
  [[30,150],[48,148],[62,145]].forEach(([x,y])=>{
    [0,12,24].forEach((dy,i)=>{const w=10-i*2;ctx.beginPath();ctx.moveTo(x-w,y-dy);ctx.lineTo(x+w,y-dy);ctx.lineTo(x,y-dy-14);ctx.fill();});
  });
  ctx.fillStyle='#cc2211'; ctx.fillRect(190,130,22,22);
  ctx.fillStyle='#faf0e0'; ctx.font='bold 11px Georgia'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('印',201,141);
  const frGrad=ctx.createLinearGradient(0,0,220,0); frGrad.addColorStop(0,'#6a3810'); frGrad.addColorStop(0.5,'#a06020'); frGrad.addColorStop(1,'#6a3810');
  ctx.strokeStyle=frGrad; ctx.lineWidth=6; ctx.strokeRect(3,3,214,154);
  ctx.strokeStyle='#c8a040'; ctx.lineWidth=1; ctx.strokeRect(8,8,204,144);
  const painting=new THREE.Mesh(new THREE.PlaneGeometry(3.8,2.75),
    new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),roughness:0.7,emissive:0x110808,emissiveIntensity:0.08}));
  painting.position.set(-11.72,7.2,-25); painting.rotation.y=Math.PI/2; scene.add(painting);
  // painting light removed for performance
})();

const elTimeDisp = document.getElementById('time-disp');
const elAvailBadge = document.getElementById('avail-badge');
const elOutsideUI = document.getElementById('outside-ui');

// ── Delivery scooter ─────────────────────────────────────────────────────
(()=>{
  const sx=-14, sz=9, smat=M(0x1a1a2a,0,0,0.6,0.3);
  const sred=M(0xcc2211,0xcc1100,0.08,0.55,0.2);
  const body=new THREE.Mesh(new THREE.BoxGeometry(1.8,0.7,0.7),sred);
  body.position.set(sx,1.05,sz); scene.add(body);
  B(0.8,0.14,0.55,M(0x1a1208,0,0,0.9),sx-0.2,1.45,sz);
  const shield=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.85,0.2),sred);
  shield.position.set(sx+0.72,0.88,sz); scene.add(shield);
  B(0.08,0.45,0.08,smat,sx+0.78,1.5,sz); B(0.08,0.08,0.8,smat,sx+0.78,1.72,sz);
  const wg=new THREE.TorusGeometry(0.42,0.07,7,16);
  const wm2=new THREE.MeshStandardMaterial({color:0x1a1408,roughness:0.8,metalness:0.3});
  const scFW=new THREE.Mesh(wg,wm2); scFW.position.set(sx+0.78,0.45,sz); scFW.rotation.y=Math.PI/2; scene.add(scFW);
  const scRW=new THREE.Mesh(wg,wm2); scRW.position.set(sx-0.78,0.45,sz); scRW.rotation.y=Math.PI/2; scene.add(scRW);
  B(0.7,0.55,0.6,M(0x2a1a08,0,0,0.75),sx-0.9,1.15,sz);
  const hl=new THREE.Mesh(new THREE.SphereGeometry(0.1,8,6),new THREE.MeshStandardMaterial({color:0xfffae0,emissive:0xfffae0,emissiveIntensity:1.5}));
  hl.position.set(sx+0.94,1.1,sz); scene.add(hl);
  // scooter light removed for performance
})();

// ── Cache antenna blink meshes ───────────────────────────────────────────
const _antBlinkCache = [];
scene.traverse(o=>{ if(o.userData.antBlink) _antBlinkCache.push(o); });

// ── Lo-fi music generator — warm café jazz ────────────────────────────────
// Previous version sounded creepy because: (1) 1200Hz lowpass cut all warmth,
// (2) pure sine oscillators with no detuning felt sterile/ethereal, (3) no sub
// bass to ground the pads, (4) master gain too loud (0.7). This rewrite uses
// paired detuned triangles per chord note for analog chorus warmth, a sub-bass
// that tracks the chord root, a soft-knee compressor on the master bus for
// mastering-like glue, and a warmer midrange crackle.
let lofiPlaying = false, lofiNodes = null;
function createLofi(){
  if(!audioCtx) initAudio();

  // Master bus: gain → compressor → warmth lowpass → output
  const master = audioCtx.createGain(); master.gain.value = 0;
  const comp = audioCtx.createDynamicsCompressor();
  comp.threshold.value = -20; comp.ratio.value = 3;
  comp.attack.value = 0.05;   comp.release.value = 0.25;
  comp.knee.value = 18;
  const masterLP = audioCtx.createBiquadFilter();
  masterLP.type = 'lowpass'; masterLP.frequency.value = 3600; masterLP.Q.value = 0.55;
  master.connect(comp); comp.connect(masterLP); masterLP.connect(audioCtx.destination);

  // Pad bus: shared lowpass for the dreamy roll-off
  const padGain = audioCtx.createGain(); padGain.gain.value = 0.028;
  const padFilter = audioCtx.createBiquadFilter();
  padFilter.type = 'lowpass'; padFilter.frequency.value = 2400; padFilter.Q.value = 0.8;
  padFilter.connect(padGain); padGain.connect(master);

  // Paired detuned triangle oscillators per chord tone — analog-chorus warmth
  const makeVoice = (freq, detuneCents) => {
    const a = audioCtx.createOscillator();
    a.type = 'triangle'; a.frequency.value = freq; a.detune.value = -detuneCents;
    const b = audioCtx.createOscillator();
    b.type = 'triangle'; b.frequency.value = freq; b.detune.value =  detuneCents;
    a.connect(padFilter); b.connect(padFilter); a.start(); b.start();
    return [a, b];
  };
  // Seed with Cmaj7. Each entry is a voice pair; updated in the chord loop below.
  const voices = [
    makeVoice(261.63, 6),  // root
    makeVoice(329.63, 7),  // third
    makeVoice(392.00, 5),  // fifth
    makeVoice(493.88, 8),  // maj7
  ];

  // Sub-bass — grounds the chord so pads don't float unmoored
  const bass = audioCtx.createOscillator();
  bass.type = 'sine'; bass.frequency.value = 130.81; // C3
  const bassGain = audioCtx.createGain(); bassGain.gain.value = 0.045;
  const bassLP = audioCtx.createBiquadFilter();
  bassLP.type = 'lowpass'; bassLP.frequency.value = 320; bassLP.Q.value = 0.7;
  bass.connect(bassLP); bassLP.connect(bassGain); bassGain.connect(master);
  bass.start();

  // Warm jazz progression: Cmaj7 → Fmaj7 → Dm7 → G7 (ii–V–I in disguise)
  const chords = [
    { freqs:[261.63, 329.63, 392.00, 493.88], bass:130.81 }, // Cmaj7
    { freqs:[349.23, 440.00, 523.25, 659.25], bass:174.61 }, // Fmaj7
    { freqs:[293.66, 349.23, 440.00, 523.25], bass:146.83 }, // Dm7
    { freqs:[392.00, 493.88, 587.33, 349.23], bass:196.00 }, // G7
  ];
  let chordIdx = 0;
  const chordInterval = setInterval(() => {
    if(!lofiPlaying) return;
    chordIdx = (chordIdx + 1) % chords.length;
    const c = chords[chordIdx];
    const t = audioCtx.currentTime;
    for(let i = 0; i < 4; i++){
      voices[i][0].frequency.exponentialRampToValueAtTime(c.freqs[i], t + 2.2);
      voices[i][1].frequency.exponentialRampToValueAtTime(c.freqs[i], t + 2.2);
    }
    bass.frequency.exponentialRampToValueAtTime(c.bass, t + 1.6);
  }, 3800);

  // Rhodes-ish pluck — triangle waveform, softer attack, longer release
  const pluckInterval = setInterval(() => {
    if(!lofiPlaying || !audioCtx) return;
    const notes = [523.25, 587.33, 659.25, 784.00, 659.25, 587.33];
    const note = notes[Math.floor(Math.random() * notes.length)];
    const freq = note * (Math.random() > 0.25 ? 1 : 0.5); // bias toward higher octave
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    const f = audioCtx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 1900; f.Q.value = 0.7;
    osc.connect(f); f.connect(g); g.connect(master);
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const now = audioCtx.currentTime;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.024, now + 0.055); // softer attack (was 0.01s)
    g.gain.exponentialRampToValueAtTime(0.001, now + 1.3); // longer release
    osc.start(now); osc.stop(now + 1.35);
  }, 1100 + Math.random() * 500);

  // Vinyl crackle — warmer midrange instead of sharp highs
  const crackle = audioCtx.createBufferSource();
  const cBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * 2, audioCtx.sampleRate);
  const cData = cBuf.getChannelData(0);
  for(let i = 0; i < cData.length; i++){
    cData[i] = (Math.random() * 2 - 1) * (Math.random() > 0.985 ? 0.45 : 0.005);
  }
  crackle.buffer = cBuf; crackle.loop = true;
  const crackleGain = audioCtx.createGain(); crackleGain.gain.value = 0.009;
  const crackleFilter = audioCtx.createBiquadFilter();
  crackleFilter.type = 'bandpass'; crackleFilter.frequency.value = 1400; // was 4000 (too sharp)
  crackleFilter.Q.value = 0.4;
  crackle.connect(crackleFilter); crackleFilter.connect(crackleGain); crackleGain.connect(master);
  crackle.start();

  return { master, chordInterval, pluckInterval, voices, bass, crackle };
}
function toggleLofi(){
  initAudio();
  lofiPlaying = !lofiPlaying;
  const btn = document.getElementById('music-btn');
  btn.classList.toggle('active', lofiPlaying);
  btn.setAttribute('aria-pressed', lofiPlaying?'true':'false');
  if(lofiPlaying){
    if(!lofiNodes) lofiNodes = createLofi();
    lofiNodes.master.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime+2.2);
  } else if(lofiNodes){
    lofiNodes.master.gain.linearRampToValueAtTime(0, audioCtx.currentTime+1);
    if(lofiNodes.chordInterval) clearInterval(lofiNodes.chordInterval);
    if(lofiNodes.pluckInterval) clearInterval(lofiNodes.pluckInterval);
  }
}
window.toggleLofi = toggleLofi;

// ── Lightning system — dramatic storm flashes every 18–35s ────────────
(function lightning(){
  const fl = document.getElementById('lightning-flash');
  if(!fl) return;
  function flash(){
    // Three-pulse pattern: primary + dim + secondary kick — mimics real lightning
    fl.style.opacity = '0.95';
    setTimeout(()=>{ fl.style.opacity = '0.25'; }, 70);
    setTimeout(()=>{ fl.style.opacity = '0.8';  }, 130);
    setTimeout(()=>{ fl.style.opacity = '0';    }, 260);
    // Hemisphere intensity boost removed — was causing shader recompilation
    // on some GPUs during lightning. DOM flash alone is visible enough.
    // Next strike between 18–35s
    setTimeout(flash, 18000 + Math.random() * 17000);
  }
  // First flash after 22s so it doesn't fire during intro
  setTimeout(flash, 22000);
})();

// ── Day/night toggle ────────────────────────────────────────────────────
let _nightMode = true;
window.toggleDayNight = function(){
  _nightMode = !_nightMode;
  const btn = document.getElementById('daynight-btn');
  // Note: hemi.intensity and cursor light color modulation removed — those
  // affect shader uniforms and can cause shader recompile on weaker GPUs.
  // Fog + clear color alone give a clear visible day/night change.
  if(_nightMode){
    if(scene.fog) scene.fog.color.setHex(0x070402);
    renderer.setClearColor(0x060402);
    // Full glow at night. Neon is the whole point after dark.
    _bloomStrengthTarget = BLOOM_STRENGTH;
    // Night sky: gradient dome, stars and moon visible.
    skyDome.material.map = _skyTexNight; skyDome.material.needsUpdate = true;
    stars.visible = true;
    moonDisk.visible = moonHalo.visible = true; moonGlow.visible = true;
    if(btn){ btn.textContent = '☾'; btn.classList.remove('day'); }
    showToast('夜', 'Night mode engaged. Neon rises.', 'Yoru \u00b7 Night');
  } else {
    if(scene.fog) scene.fog.color.setHex(0x1a1410);
    renderer.setClearColor(0x2a1f15);
    // Softer glow by day. Ambient light washes the neon out anyway.
    _bloomStrengthTarget = BLOOM_STRENGTH * 0.7;
    // Dawn sky: warmer dome, stars and moon hidden.
    skyDome.material.map = _skyTexDay; skyDome.material.needsUpdate = true;
    stars.visible = false;
    moonDisk.visible = moonHalo.visible = false; moonGlow.visible = false;
    if(btn){ btn.textContent = '\u2600'; btn.classList.add('day'); }
    showToast('朝', 'Dawn breaks over the shop.', 'Asa \u00b7 Day');
  }
  if(bloomPass) bloomPass.strength = _bloomStrengthTarget;
};

// ── Toast notification system ──────────────────────────────────────────
// Lightweight DOM toasts for easter eggs, time-aware greetings, and achievement feedback.
// Self-disposing after ~5.4s (animation: 0.38s in + 5s hold + 0.4s out).
function showToast(kanji, html, sub){
  // Case-study mode is deliberately quiet; notifications resume when it closes.
  if(document.getElementById('panel-overlay')?.classList.contains('active')) return;
  const stack = document.getElementById('toast-stack');
  if(!stack) return;
  const el = document.createElement('div');
  el.className = 'toast';
  const safeSub = sub ? '<span class="toast-sub">'+sub+'</span>' : '';
  el.innerHTML = '<span class="toast-kanji">'+kanji+'</span>'+html+safeSub;
  stack.appendChild(el);
  // Cap stack at 4 concurrent toasts so the corner doesn't become a wall
  while(stack.children.length > 4) stack.removeChild(stack.firstChild);
  setTimeout(()=> el.remove(), 5500);
}
window.showToast = showToast;

// ── Omikuji - press F anywhere to pull a fortune (10 handcrafted) ──────
const _omikuji = [
  { k:'大吉', en:'Great blessing',   m:"ragproof is watching. Your retrieval scores climb when you least expect it." },
  { k:'吉',   en:'Good fortune',     m:"A syllabus surrenders its deadlines to SyllabusAI. Someone gets their evening back." },
  { k:'中吉', en:'Middle fortune',   m:"AutoAppli drafts the outreach you were too tired to write. A reply arrives by dawn." },
  { k:'小吉', en:'Small fortune',    m:"Tonight the bug hides in the line you were sure was fine. Read it twice." },
  { k:'末吉', en:'Future fortune',   m:"The thing you ship at midnight meets its first real user by morning." },
  { k:'凶',   en:'Misfortune',       m:"Do not deploy on an empty stomach. Eat first, push second." },
  { k:'麺',   en:'Noodle',           m:"Eat the ramen within three minutes. Some deadlines are not negotiable." },
  { k:'運',   en:'Luck',             m:"Let the Coca-Cola capstone come up on its own. The work can speak for itself." },
  { k:'集中', en:'Focus',            m:"Close the seven tabs you know about. The late-night focus returns." },
  { k:'夢',   en:'Dream',            m:"The applied-AI role is real. Keep shipping things people can actually use." },
];
const _omikujiOverlay = document.getElementById('omikuji-overlay');
let _omikujiOpen = false;
function _closeOmikuji(){
  if(!_omikujiOpen) return;
  _omikujiOpen = false;
  _omikujiOverlay.classList.remove('active');
}
function _pullOmikuji(){
  const f = _omikuji[Math.floor(Math.random() * _omikuji.length)];
  document.getElementById('omikuji-kanji').textContent = f.k;
  document.getElementById('omikuji-en').textContent = f.en;
  document.getElementById('omikuji-msg').textContent = f.m;
  _omikujiOpen = true;
  _omikujiOverlay.classList.add('active'); // CSS drops the slide-in under reduced-motion
}
// Click anywhere on the fortune overlay dismisses it.
_omikujiOverlay.addEventListener('click', _closeOmikuji);
document.addEventListener('keydown', (e) => {
  // While a fortune is showing, any key dismisses it (Esc included).
  // Leave browser/OS shortcuts (Ctrl+R, Cmd+L, ...) alone.
  if(_omikujiOpen){
    if(!e.ctrlKey && !e.metaKey && !e.altKey) e.preventDefault();
    _closeOmikuji();
    return;
  }
  if(e.key !== 'f' && e.key !== 'F') return;
  if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)) return;
  // Don't fire over an open panel/menu/keyboard overlay \u2014 those own the screen.
  if(document.getElementById('panel-overlay').classList.contains('active')) return;
  if(document.getElementById('menu-overlay').classList.contains('active')) return;
  if(document.getElementById('kb-overlay').classList.contains('active')) return;
  _pullOmikuji();
});

// ── Time-aware opening greeting ─────────────────────────────────────────
// Shop "greets" you differently based on your local hour. Runs once after
// the loader fades and the scene is visible (~5.2s).
setTimeout(() => {
  const h = new Date().getHours();
  let k, greet, sub;
  if(h < 5)       { k='夜'; greet='Late-night ramen \u2014 the shop glows just for you.';      sub='Yoru \u00b7 Night'; }
  else if(h < 11) { k='朝'; greet='Morning prep. The broth simmers.';                           sub='Asa \u00b7 Morning'; }
  else if(h < 14) { k='昼'; greet='Midday rush. Grab a stool before it fills up.';              sub='Hiru \u00b7 Noon'; }
  else if(h < 17) { k='間'; greet='Afternoon lull. A slow moment for reflection.';              sub='Ma \u00b7 Afternoon'; }
  else if(h < 20) { k='夕'; greet='Evening service begins. A warm welcome.';                    sub='Yuu \u00b7 Evening'; }
  else if(h < 23) { k='夜'; greet='Dinner hour. The place hums.';                                sub='Yoru \u00b7 Night'; }
  else            { k='終'; greet='Closing soon \u2014 last order for noodles.';                sub='Owari \u00b7 Closing'; }
  showToast(k, greet, sub);
}, 5200);

// ── Konami Code Easter Egg — ramen rain! ──────────────────────────────
const _konamiSeq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let _konamiIdx = 0;
document.addEventListener('keydown', e => {
  if(e.key === _konamiSeq[_konamiIdx]) { _konamiIdx++; }
  else { _konamiIdx = e.key === _konamiSeq[0] ? 1 : 0; }
  if(_konamiIdx === _konamiSeq.length){
    _konamiIdx = 0;
    srAnnounce('Secret unlocked! Itadakimasu!');
    // Toast the achievement + engage 15s rainbow neon mode
    showToast('秘', '<strong>Secret menu unlocked</strong> \u2014 itadakimasu!', 'Konami \u00b7 Rainbow 15s');
    document.body.classList.add('rainbow-mode');
    setTimeout(()=> document.body.classList.remove('rainbow-mode'), 15000);
    // Ramen emoji rain
    for(let i=0;i<30;i++){
      const emoji = document.createElement('div');
      emoji.textContent = ['🍜','🍥','🥢','🍣','🍙','🍶'][Math.floor(Math.random()*6)];
      emoji.style.cssText = `position:fixed;top:-40px;left:${Math.random()*100}vw;font-size:${1.5+Math.random()*1.5}rem;z-index:9999;pointer-events:none;animation:emojiRain ${2+Math.random()*3}s linear ${Math.random()*1.5}s forwards;`;
      document.body.appendChild(emoji);
      setTimeout(()=>emoji.remove(), 6000);
    }
  }
});

// ── Animate ───────────────────────────────────────────────────────────────
