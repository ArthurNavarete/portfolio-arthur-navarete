document.documentElement.classList.add('js');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const progress = document.querySelector('.scroll-progress');
const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const pageMain = document.querySelector('main');
const pageFooter = document.querySelector('footer');
const year = document.getElementById('year');

year.textContent = new Date().getFullYear();

function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
}

window.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress, { passive: true });
updateProgress();

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu');
  mobileMenu.hidden = true;
  document.body.classList.remove('menu-open');
  pageMain.inert = false;
  pageFooter.inert = false;
}

menuButton.addEventListener('click', () => {
  const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(willOpen));
  menuButton.setAttribute('aria-label', willOpen ? 'Fechar menu' : 'Abrir menu');
  mobileMenu.hidden = !willOpen;
  document.body.classList.toggle('menu-open', willOpen);
  pageMain.inert = willOpen;
  pageFooter.inert = willOpen;
  if (willOpen) mobileMenu.querySelector('a')?.focus();
});

mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileMenu.hidden) {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 761px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .08, rootMargin: '0px 0px -30px 0px' });
  reveals.forEach(el => observer.observe(el));
} else {
  reveals.forEach(el => el.classList.add('is-visible'));
}

document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('pointermove', event => {
    if (reducedMotion.matches || event.pointerType === 'touch') return;
    const box = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${event.clientX - box.left}px`);
    card.style.setProperty('--my', `${event.clientY - box.top}px`);
  }, { passive: true });
});

const canvas = document.querySelector('.hero-particles');
const context = canvas.getContext('2d');
const hero = document.querySelector('.hero');
let particles = [];
let raf = 0;
let width = 0;
let height = 0;
let pointer = { x: -1000, y: -1000 };
let heroVisible = true;

function setupParticles() {
  if (!context || reducedMotion.matches) return;
  const bounds = hero.getBoundingClientRect();
  width = bounds.width;
  height = bounds.height;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  const count = Math.min(58, Math.round(width / 24));
  particles = Array.from({ length: count }, (_, index) => ({
    x: (index * 89.37) % width,
    y: (index * 153.19) % height,
    radius: index % 7 === 0 ? 1.5 : .75,
    speed: .18 + (index % 5) * .06
  }));
}

function drawParticles() {
  if (!context || reducedMotion.matches || document.hidden || !heroVisible) return;
  context.clearRect(0, 0, width, height);
  for (const particle of particles) {
    const dx = pointer.x - particle.x;
    const dy = pointer.y - particle.y;
    const near = Math.max(0, 1 - Math.hypot(dx, dy) / 190);
    const x = particle.x - dx * near * .05;
    const y = particle.y - dy * near * .05;
    context.beginPath();
    context.arc(x, y, particle.radius + near * .9, 0, Math.PI * 2);
    context.fillStyle = `rgba(214,243,106,${.26 + near * .55})`;
    context.fill();
    particle.y -= particle.speed;
    if (particle.y < -5) particle.y = height + 5;
  }
  raf = requestAnimationFrame(drawParticles);
}

hero.addEventListener('pointermove', event => {
  const rect = hero.getBoundingClientRect();
  pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
}, { passive: true });
hero.addEventListener('pointerleave', () => { pointer = { x: -1000, y: -1000 }; });
window.addEventListener('resize', setupParticles, { passive: true });
document.addEventListener('visibilitychange', () => {
  cancelAnimationFrame(raf);
  if (!document.hidden && heroVisible) drawParticles();
});
if ('IntersectionObserver' in window) {
  const heroObserver = new IntersectionObserver(entries => {
    heroVisible = entries[0].isIntersecting;
    cancelAnimationFrame(raf);
    if (heroVisible && !document.hidden) drawParticles();
  });
  heroObserver.observe(hero);
}
reducedMotion.addEventListener('change', () => {
  cancelAnimationFrame(raf);
  context?.clearRect(0, 0, width, height);
  if (!reducedMotion.matches) { setupParticles(); drawParticles(); }
  reveals.forEach(el => el.classList.add('is-visible'));
});
setupParticles();
drawParticles();

// Visualizador: os links continuam abrindo a imagem quando o JavaScript não roda.
const lightbox = document.querySelector('.lightbox');
if (lightbox && typeof lightbox.showModal === 'function') {
  const lightboxImage = lightbox.querySelector('img');
  const lightboxCount = lightbox.querySelector('.lightbox-count');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  let group = [];
  let current = 0;
  let swipeStart = null;

  function showImage(index, direction = 1) {
    current = (index + group.length) % group.length;
    const link = group[current];
    const apply = () => {
      lightboxImage.src = link.href;
      lightboxImage.alt = link.querySelector('img').alt;
      lightboxCount.textContent = `${String(current + 1).padStart(2, '0')} / ${String(group.length).padStart(2, '0')}`;
      lightboxCaption.textContent = link.dataset.caption || '';
      lightboxImage.classList.remove('is-switching');
    };
    if (!lightbox.open || reducedMotion.matches) return apply();
    lightboxImage.style.setProperty('--dir', direction);
    lightboxImage.classList.add('is-switching');
    setTimeout(apply, 200);
  }

  document.querySelectorAll('[data-gallery]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      group = [...document.querySelectorAll(`[data-gallery="${link.dataset.gallery}"]`)];
      lightbox.classList.toggle('is-single', group.length < 2);
      showImage(group.indexOf(link));
      lightbox.showModal();
      document.body.classList.add('lightbox-open');
    });
  });

  lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
  lightbox.querySelector('.lightbox-prev').addEventListener('click', () => showImage(current - 1, -1));
  lightbox.querySelector('.lightbox-next').addEventListener('click', () => showImage(current + 1, 1));
  lightbox.addEventListener('close', () => document.body.classList.remove('lightbox-open'));
  lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
  lightbox.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') showImage(current - 1, -1);
    if (event.key === 'ArrowRight') showImage(current + 1, 1);
  });
  lightbox.addEventListener('pointerdown', event => { swipeStart = event.clientX; });
  lightbox.addEventListener('pointerup', event => {
    if (swipeStart === null || group.length < 2) return;
    const distance = event.clientX - swipeStart;
    swipeStart = null;
    if (Math.abs(distance) > 50) showImage(current + (distance < 0 ? 1 : -1), distance < 0 ? 1 : -1);
  });
}
