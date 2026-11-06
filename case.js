import './metal.js';
import './stars.js';
// Estudos de caso: menu, títulos, tela que cresce, linha de leitura, faixa de telas com lente e visualizador.
// Sem JavaScript, o CSS mostra tudo estático e os links levam às imagens.
document.documentElement.classList.add('js');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
if (CSS.supports('backdrop-filter', 'url(#refracao)') && /Chrome\//.test(navigator.userAgent)) document.documentElement.classList.add('refract');

// Menu do celular (mesmo comportamento da home).
const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const setMenu = (open) => {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  mobileMenu.hidden = !open;
  document.body.classList.toggle('menu-open', open);
  document.querySelector('main').inert = open;
  document.querySelector('footer').inert = open;
  if (open) mobileMenu.querySelector('a')?.focus();
};
menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
mobileMenu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && mobileMenu && !mobileMenu.hidden) { setMenu(false); menuButton.focus(); } });

// Título palavra por palavra; leitores de tela leem o texto original.
const title = document.querySelector('.case-head h1');
if (title && !reduced.matches) {
  title.setAttribute('aria-label', title.textContent.trim());
  let i = 0;
  title.innerHTML = title.textContent.trim().split(/\s+/).map((w) => `<span class="w" aria-hidden="true"><span style="--i:${i++}">${w}</span></span>`).join(' ');
  title.classList.add('split');
}

// Efeitos guiados pela rolagem, numa única leitura por quadro.
const grow = document.querySelector('.case-grow');
const content = document.querySelector('.case-content');
let queued = false;
const update = () => {
  queued = false;
  if (reduced.matches) return;
  if (grow) {
    const box = grow.getBoundingClientRect();
    const g = Math.min(1, Math.max(0, -box.top / (box.height - innerHeight) * 1.15));
    grow.style.setProperty('--g', g.toFixed(3));
  }
  if (content) {
    const box = content.getBoundingClientRect();
    const read = Math.min(1, Math.max(0, (innerHeight * 0.6 - box.top) / box.height));
    content.style.setProperty('--read', read.toFixed(3));
  }
};
window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
window.addEventListener('resize', update, { passive: true });
update();

// Faixa de telas: mouse ou foco abre uma tela; na tela aberta, uma lente amplia o ponto sob o cursor.
document.querySelectorAll('.screen-strip').forEach((strip) => {
  const screens = [...strip.querySelectorAll('.screen')];
  const activate = (target) => screens.forEach((s) => s.classList.toggle('is-active', s === target));
  screens.forEach((screen) => {
    screen.addEventListener('focus', () => activate(screen));
    screen.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') activate(screen); });
    const lens = document.createElement('span');
    lens.className = 'lens';
    lens.setAttribute('aria-hidden', 'true');
    lens.style.backgroundImage = `url("${screen.getAttribute('href')}")`;
    screen.append(lens);
    screen.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' || !screen.classList.contains('is-active') || reduced.matches) return;
      const box = screen.getBoundingClientRect();
      const img = screen.querySelector('img');
      const x = e.clientX - box.left, y = e.clientY - box.top;
      // A imagem cobre a tela aberta (object-fit: cover, ancorada no topo à esquerda); a lente mostra o dobro.
      const scale = Math.max(box.width / img.naturalWidth, box.height / img.naturalHeight) * 2;
      lens.style.left = `${x}px`;
      lens.style.top = `${y}px`;
      lens.style.backgroundSize = `${img.naturalWidth * scale}px auto`;
      lens.style.backgroundPosition = `${-(x * 2 - 95)}px ${-(y * 2 - 95)}px`;
      screen.classList.add('has-lens');
    });
    screen.addEventListener('pointerleave', () => screen.classList.remove('has-lens'));
  });
  strip.classList.add('is-ready');
});

// Visualizador de imagens (mesma marcação e estilo da home).
const lightbox = document.querySelector('.lightbox');
if (lightbox && typeof lightbox.showModal === 'function') {
  const image = lightbox.querySelector('img');
  const count = lightbox.querySelector('.lightbox-count');
  const caption = lightbox.querySelector('.lightbox-caption');
  let group = [], current = 0, swipeStart = null;
  const show = (index, dir = 1) => {
    current = (index + group.length) % group.length;
    const link = group[current];
    const apply = () => { image.src = link.href; image.alt = link.querySelector('img').alt; count.textContent = `${String(current + 1).padStart(2, '0')} / ${String(group.length).padStart(2, '0')}`; caption.textContent = link.dataset.caption || ''; image.classList.remove('is-switching'); };
    if (!lightbox.open || reduced.matches) return apply();
    image.style.setProperty('--dir', dir); image.classList.add('is-switching'); setTimeout(apply, 200);
  };
  document.querySelectorAll('[data-gallery]').forEach((link) => link.addEventListener('click', (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    group = [...document.querySelectorAll(`[data-gallery="${link.dataset.gallery}"]`)];
    lightbox.classList.toggle('is-single', group.length < 2);
    show(group.indexOf(link)); lightbox.showModal(); document.body.classList.add('lightbox-open');
  }));
  lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
  lightbox.querySelector('.lightbox-prev').addEventListener('click', () => show(current - 1, -1));
  lightbox.querySelector('.lightbox-next').addEventListener('click', () => show(current + 1, 1));
  lightbox.addEventListener('close', () => document.body.classList.remove('lightbox-open'));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });
  lightbox.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') show(current - 1, -1); if (e.key === 'ArrowRight') show(current + 1, 1); });
  lightbox.addEventListener('pointerdown', (e) => { swipeStart = e.clientX; });
  lightbox.addEventListener('pointerup', (e) => { if (swipeStart === null || group.length < 2) return; const d = e.clientX - swipeStart; swipeStart = null; if (Math.abs(d) > 50) show(current + (d < 0 ? 1 : -1), d < 0 ? 1 : -1); });
}
