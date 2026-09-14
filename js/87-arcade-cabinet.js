// The Noodle Catch cabinet: meshes, hotspot, and the attract loop on its little screen.
// Split out of js/85-arcade.js to keep both files small. Classic script, shared global scope.

(function cabinet() {
  if (typeof THREE === 'undefined' || typeof scene === 'undefined') return;
  const g = new THREE.Group();
  const shell = new THREE.MeshStandardMaterial({ color: 0x241408, roughness: 0.62, metalness: 0.12 });
  const trim = new THREE.MeshStandardMaterial({ color: 0xe8922a, emissive: 0xe8922a, emissiveIntensity: 0.42, roughness: 0.5 });
  function box(w, h, d, mat, x, y, z) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); g.add(m); return m;
  }
  box(1.9, 3.4, 1.3, shell, 0, 1.7, 0);          // body
  box(2.05, 0.16, 1.45, trim, 0, 3.46, 0);       // marquee light bar
  box(1.75, 0.5, 0.12, shell, 0, 1.62, 0.66);    // control deck lip
  box(0.34, 0.1, 0.34, trim, -0.4, 1.9, 0.7);    // two buttons
  box(0.34, 0.1, 0.34, trim, 0.4, 1.9, 0.7);

  const sc = document.createElement('canvas'); sc.width = 128; sc.height = 160;
  const sx = sc.getContext('2d');
  const tex = new THREE.CanvasTexture(sc);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.15),
    new THREE.MeshBasicMaterial({ map: tex }));
  screen.position.set(0, 2.55, 0.67); g.add(screen);

  // Marquee text plate
  const mq = document.createElement('canvas'); mq.width = 256; mq.height = 64;
  const mx = mq.getContext('2d');
  mx.fillStyle = '#140a03'; mx.fillRect(0, 0, 256, 64);
  mx.fillStyle = '#f0c060'; mx.font = 'bold 30px Georgia, serif'; mx.textAlign = 'center';
  mx.fillText('遊 NOODLE CATCH', 128, 42);
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(1.75, 0.44),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(mq) }));
  plate.position.set(0, 3.28, 0.67); g.add(plate);

  g.position.set(8.9, 0, -15.6);
  g.rotation.y = -Math.PI / 2 + 0.42;
  scene.add(g);

  if (typeof mkZone === 'function') {
    mkZone(2.0, 3.6, 2.2, 8.4, 1.8, -15.6, {
      type: 'fact', arcade: true, hoverLabel: 'Play Noodle Catch',
      emoji: '🕹️', kanji: '遊', sub: 'Arcade · Noodle Catch',
      body: 'A cabinet someone wheeled in and never wheeled out. Catch the toppings, dodge the bugs, and every fifth catch plates one of the projects. Press P any time you are inside.',
    });
  }

  // Attract loop rides the shared frame hook, so it never opens a second animation loop.
  let acc = 0, drift = 0;
  RAMEN.on('frame', function (dt) {
    acc += dt || 0.016;
    if (acc < 0.12) return;
    drift += acc; acc = 0;
    sx.fillStyle = '#0a0602'; sx.fillRect(0, 0, 128, 160);
    sx.fillStyle = '#f0c060'; sx.font = 'bold 15px Georgia, serif'; sx.textAlign = 'center';
    sx.fillText('麺', 64, 26);
    sx.font = '9px Georgia, serif'; sx.fillStyle = '#e8922a';
    sx.fillText('NOODLE CATCH', 64, 42);
    for (let i = 0; i < 5; i++) {
      const y = ((drift * 26 + i * 31) % 120) + 48;
      const x = 20 + ((i * 37 + 11) % 88);
      sx.fillStyle = ['#f0c060', '#c8462a', '#d9d2b4', '#6f9a3a', '#e8922a'][i];
      sx.beginPath(); sx.arc(x, y, 4.5, 0, Math.PI * 2); sx.fill();
    }
    sx.fillStyle = '#f5e8d0';
    sx.beginPath(); sx.arc(64 + Math.sin(drift * 1.6) * 26, 150, 13, Math.PI, 0, true); sx.fill();
    if (Math.floor(drift) % 2 === 0) {
      sx.fillStyle = '#f0c060'; sx.font = '7px Georgia, serif';
      sx.fillText('PRESS P', 64, 60);
    }
    tex.needsUpdate = true;
  });
})();

