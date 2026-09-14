// How a visitor reaches Noodle Catch: the cabinet hotspot, the P key, and the 遊 Arcade chip.
// Split out of js/85-arcade.js to keep both files small. Classic script, shared global scope.

ARCADE.typing = function (e) {
  const el = (e && e.target) || document.activeElement;
  if (!el) return false;
  if (el.isContentEditable) return true;
  return ['INPUT', 'TEXTAREA', 'SELECT'].indexOf(el.tagName) >= 0;
};
ARCADE.screenBusy = function () {
  return ['panel-overlay', 'menu-overlay', 'kb-overlay', 'omikuji-overlay'].some(function (id) {
    const el = document.getElementById(id); return el && el.classList.contains('active');
  });
};

RAMEN.on('interact', function (d) {
  if (!d || !d.arcade) return;
  // handleClick shows the fact card right after this hook returns, so clear it on the way in.
  setTimeout(function () {
    if (typeof hideInteractCard === 'function') hideInteractCard();
    ARCADE.open();
  }, 120);
});

// P opens the cabinet, but only from inside the shop and only when nothing else has the screen.
// The gate fails closed: if the shop state cannot be read, the key does nothing.
// Capture phase on purpose: js/54-extras.js dismisses an open fortune from a bubble-phase
// listener without stopping propagation, so by the bubble phase the omikuji class is already
// gone and the guard below would read a stale screen.
document.addEventListener('keydown', function (e) {
  if (e.key !== 'p' && e.key !== 'P') return;
  if (ARCADE.isOpenFlag) return;
  if (ARCADE.typing(e)) return;
  if (typeof inside === 'undefined' || inside !== true) return;
  if (typeof transitioning !== 'undefined' && transitioning) return;
  if (ARCADE.screenBusy()) return;
  ARCADE.open();
}, true);

(function chip() {
  const host = document.getElementById('inside-ui');
  if (!host) return;
  const b = document.createElement('button');
  b.id = 'arcade-chip'; b.type = 'button';
  b.setAttribute('aria-label', 'Play Noodle Catch');
  b.innerHTML = '<span aria-hidden="true">遊</span> Arcade';
  b.addEventListener('click', function () { ARCADE.open(); });
  host.appendChild(b);
})();

