const menu = document.querySelector('.menu-toggle');
const nav = document.getElementById('main-nav');
function closeMenu() {
  menu.setAttribute('aria-expanded', 'false');
  nav.classList.remove('open');
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('open', open);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('open')) {
    closeMenu();
    menu.focus();
  }
});
const motion = document.querySelector('.motion-toggle');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
function setPaused(paused) {
  document.body.classList.toggle('motion-paused', paused);
  motion.setAttribute('aria-pressed', String(paused));
  motion.setAttribute('aria-label', paused ? 'Resume animations' : 'Pause animations');
  motion.title = paused ? 'Resume animations' : 'Pause animations';
  motion.querySelector('span').textContent = paused ? '▷' : 'Ⅱ';
}
setPaused(reduced.matches);
if (reduced.matches) {
  motion.disabled = true;
  motion.title = 'Reduced motion enabled in your device settings';
  motion.setAttribute('aria-label', 'Animations disabled by reduced motion preference');
}
motion.addEventListener('click', () => {
  setPaused(!document.body.classList.contains('motion-paused'));
  updatePosition();
});
const sections = [...document.querySelectorAll('main > section[id]')];
const hero = document.getElementById('home');
const floatingPanels = [...document.querySelectorAll('.float-panel')];
const drift = [[-45, 150], [50, 110], [-35, 85], [40, 130]];
let ticking = false;
function updatePosition() {
  if (!reduced.matches && !document.body.classList.contains('motion-paused')) {
    const heroBounds = hero.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -heroBounds.top / heroBounds.height));
    floatingPanels.forEach((panel, index) => {
      panel.style.translate = `${drift[index][0] * progress}px ${drift[index][1] * progress}px`;
    });
  }
  const marker = window.scrollY + window.innerHeight * .35;
  const current = sections.filter(section => section.offsetTop <= marker).at(-1) || sections[0];
  document.querySelectorAll('nav a, .page-index a').forEach(link => {
    const active = link.getAttribute('href') === '#' + current.id;
    link.classList.toggle(link.closest('nav') ? 'active' : 'current', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  const max = document.documentElement.scrollHeight - window.innerHeight;
  document.documentElement.style.setProperty('--progress', `${max > 0 ? Math.min(100, window.scrollY / max * 100) : 0}%`);
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) { requestAnimationFrame(updatePosition); ticking = true; }
}, {passive:true});
window.addEventListener('resize', updatePosition);
updatePosition();
document.getElementById('year').textContent = new Date().getFullYear();
