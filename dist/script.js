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
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const sections = [...document.querySelectorAll('main > section[id]')];
const heroScroll = document.getElementById('home');
const hero = heroScroll.querySelector('.hero');
const header = document.querySelector('.site-header');
const floatingPanels = [...document.querySelectorAll('.float-panel')];
const startAngles = [-145, -35, 145, 35];
const storySlides = [...document.querySelectorAll('.story-slide')];
const storyMarkers = [...document.querySelectorAll('.story-progress span')];
const storyTransitions = [[.18, .30], [.45, .57], [.72, .84]];
function updateStory(progress) {
  let from = 0;
  let to = 0;
  let blend = 0;
  for (let index = 0; index < storyTransitions.length; index++) {
    const [start, end] = storyTransitions[index];
    if (progress >= end) { from = to = index + 1; }
    else if (progress > start) {
      from = index;
      to = index + 1;
      const t = (progress - start) / (end - start);
      blend = t * t * (3 - 2 * t);
      break;
    } else break;
  }
  const active = blend >= .5 ? to : from;
  storySlides.forEach((slide, index) => {
    const opacity = from === to ? Number(index === from) : index === from ? 1 - blend : index === to ? blend : 0;
    const offset = index === from ? -12 * (1 - opacity) : 12 * (1 - opacity);
    slide.style.opacity = opacity;
    slide.style.visibility = opacity > .001 ? 'visible' : 'hidden';
    slide.style.transform = `translateY(${offset}px)`;
    slide.setAttribute('aria-hidden', String(index !== active));
    storyMarkers[index].classList.toggle('active', index === active);
  });
}
let orbitEnabled = false;
function configureOrbit() {
  // Short landscape viewports retain ordinary scrolling so all content is reachable.
  orbitEnabled = !reduced.matches && window.innerHeight >= 620;
  document.documentElement.classList.toggle('scroll-orbit-enabled', orbitEnabled);
  if (!orbitEnabled) {
    floatingPanels.forEach(panel => { panel.style.translate = ''; panel.style.opacity = ''; });
    hero.style.removeProperty('--orbit-progress');
    updateStory(0);
  }
  updatePosition();
}
let ticking = false;
function updatePosition() {
  if (orbitEnabled) {
    const start = heroScroll.offsetTop - header.offsetHeight;
    const distance = heroScroll.offsetHeight - hero.offsetHeight;
    const progress = Math.max(0, Math.min(1, (window.scrollY - start) / distance));
    hero.style.setProperty('--orbit-progress', progress);
    updateStory(progress);
    const maxWidth = Math.max(...floatingPanels.map(panel => panel.offsetWidth));
    const maxHeight = Math.max(...floatingPanels.map(panel => panel.offsetHeight));
    const radiusX = Math.max(0, (hero.clientWidth - maxWidth) / 2 - 22);
    const radiusY = Math.max(0, (hero.clientHeight - maxHeight) / 2 - 32);
    floatingPanels.forEach((panel, index) => {
      const angle = (startAngles[index] + 360 * progress) * Math.PI / 180;
      const x = radiusX * Math.cos(angle) - panel.offsetWidth / 2;
      const y = radiusY * Math.sin(angle) - panel.offsetHeight / 2;
      panel.style.translate = `${x}px ${y}px`;
      // Keep the foreground copy readable as panels pass the sides on narrow screens.
      panel.style.opacity = hero.clientWidth <= 760 ? .18 + .47 * Math.abs(Math.sin(angle)) : .85;
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
window.addEventListener('resize', configureOrbit);
reduced.addEventListener('change', configureOrbit);
configureOrbit();
document.getElementById('year').textContent = new Date().getFullYear();
