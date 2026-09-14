// Hook bus for the scene. Later files (post FX, quest, arcade, cinematic) register here instead of
// editing the core files, so parallel work never collides. Classic script; shares global scope.
//
//   RAMEN.on('frame', (dt, t) => {})        every animated frame, after the camera is placed, before render
//   RAMEN.on('enter'|'exit', () => {})      shop entered / left (fires after state and UI flip)
//   RAMEN.on('interact', (evt) => {})       any 3D hotspot hit: {type:'seat'|'bowl'|'cat'|'clock'|'fact'|'lantern'|'menu'|'door', ...userData}
//   RAMEN.on('panel', ({panel}) => {})      a content panel opened
//   RAMEN.on('composer', ({composer, bloomPass}) => {})   composer (re)built: append passes here
//   RAMEN.cameraOverride = (camera, dt, t) => {}   optional; runs after default placement, may move the camera
//   RAMEN.camLock = 'owner-id' | null       cooperative lock so two layers never fight over the camera
window.RAMEN = {
  version: 2,
  _h: {},
  on(name, fn){ (this._h[name] = this._h[name] || []).push(fn); return fn; },
  off(name, fn){ const l = this._h[name]; if(l){ const i = l.indexOf(fn); if(i >= 0) l.splice(i, 1); } },
  emit(name, a, b){
    const l = this._h[name]; if(!l) return;
    for(let i = 0; i < l.length; i++){ try { l[i](a, b); } catch(e){ try { console.error('[RAMEN hook ' + name + ']', e); } catch(_){} } }
  },
  cameraOverride: null,
  camLock: null,
  lockCamera(owner){ if(this.camLock && this.camLock !== owner) return false; this.camLock = owner; return true; },
  unlockCamera(owner){ if(this.camLock === owner) this.camLock = null; },
  // filled by the core files as they run
  ready: false,
};
