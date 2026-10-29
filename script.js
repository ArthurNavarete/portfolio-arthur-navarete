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

// Títulos sobem palavra por palavra; o texto lido por leitores de tela não muda.
function splitWords(heading) {
  let index = 0;
  const walk = node => {
    [...node.childNodes].forEach(child => {
      if (child.nodeType === Node.ELEMENT_NODE) return walk(child);
      if (child.nodeType !== Node.TEXT_NODE || !child.textContent.trim()) return;
      const fragment = document.createDocumentFragment();
      child.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) return fragment.append(part);
        const word = document.createElement('span');
        word.className = 'w';
        word.innerHTML = `<span style="--i:${index++}"></span>`;
        word.firstChild.textContent = part;
        fragment.append(word);
      });
      child.replaceWith(fragment);
    });
  };
  walk(heading);
  heading.classList.add('split');
}
if (!reducedMotion.matches) document.querySelectorAll('.hero h1, .section-heading h2, .contact h2').forEach(splitWords);

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

const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

document.querySelectorAll('.project-card').forEach(card => {
  const visual = card.querySelector('.project-visual');
  const shot = card.querySelector('.project-shot');
  card.addEventListener('pointermove', event => {
    if (reducedMotion.matches || event.pointerType === 'touch') return;
    const box = card.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - .5;
    const y = (event.clientY - box.top) / box.height - .5;
    card.style.setProperty('--mx', `${event.clientX - box.left}px`);
    card.style.setProperty('--my', `${event.clientY - box.top}px`);
    if (!finePointer.matches || !card.classList.contains('is-visible')) return;
    card.classList.add('is-tilting');
    card.style.setProperty('--rx', `${(-y * 3).toFixed(2)}deg`);
    card.style.setProperty('--ry', `${(x * 4).toFixed(2)}deg`);
    const vbox = visual.getBoundingClientRect();
    visual.style.setProperty('--gx', `${event.clientX - vbox.left}px`);
    visual.style.setProperty('--gy', `${event.clientY - vbox.top}px`);
    shot?.style.setProperty('--px', `${(x * 14).toFixed(1)}px`);
  }, { passive: true });
  card.addEventListener('pointerleave', () => {
    card.classList.remove('is-tilting');
    card.style.removeProperty('--rx');
    card.style.removeProperty('--ry');
    shot?.style.removeProperty('--px');
  });
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
  const points = particles.map(particle => {
    const dx = pointer.x - particle.x;
    const dy = pointer.y - particle.y;
    const near = Math.max(0, 1 - Math.hypot(dx, dy) / 190);
    return { x: particle.x + dx * near * .12, y: particle.y + dy * near * .12, near, particle };
  });
  // Constelação: liga partículas próximas; perto do cursor a linha fica mais forte.
  context.lineWidth = .6;
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const a = points[i];
      const b = points[j];
      const link = 1 - Math.hypot(a.x - b.x, a.y - b.y) / 165;
      if (link <= 0) continue;
      context.strokeStyle = `rgba(139,217,220,${Math.min(.55, Math.sqrt(link) * .3 + Math.max(a.near, b.near) * .35).toFixed(3)})`;
      context.beginPath();
      context.moveTo(a.x, a.y);
      context.lineTo(b.x, b.y);
      context.stroke();
    }
  }
  for (const { x, y, near, particle } of points) {
    if (near > .35) {
      context.strokeStyle = `rgba(214,243,106,${(near - .35) * .7})`;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(pointer.x, pointer.y);
      context.stroke();
    }
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

// O HUD do topo inclina em camadas na direção do cursor.
const hud = document.querySelector('.hud');
hero.addEventListener('pointermove', event => {
  if (!hud || reducedMotion.matches || !finePointer.matches) return;
  const rect = hero.getBoundingClientRect();
  hud.style.setProperty('--hy', `${(((event.clientX - rect.left) / rect.width - .5) * 14).toFixed(2)}deg`);
  hud.style.setProperty('--hx', `${(-((event.clientY - rect.top) / rect.height - .5) * 10).toFixed(2)}deg`);
}, { passive: true });
hero.addEventListener('pointerleave', () => { hud?.style.removeProperty('--hx'); hud?.style.removeProperty('--hy'); });
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

// Parallax: prints e arte andam um pouco mais devagar que a página.
const parallaxItems = [...document.querySelectorAll('.project-shot')].map(el => ({ el, speed: .06 }));
const heroArt = document.querySelector('.hero-art');
if (heroArt) parallaxItems.push({ el: heroArt, speed: -.12, prop: 'transform' });
let parallaxQueued = false;
function updateParallax() {
  parallaxQueued = false;
  const middle = window.innerHeight / 2;
  for (const { el, speed, prop } of parallaxItems) {
    const box = el.getBoundingClientRect();
    if (box.bottom < -200 || box.top > window.innerHeight + 200) continue;
    const offset = ((box.top + box.height / 2 - middle) * speed).toFixed(1);
    if (prop) el.style.transform = `translate3d(0,${offset}px,0)`;
    else el.style.setProperty('--py', `${offset}px`);
  }
}
window.addEventListener('scroll', () => {
  if (reducedMotion.matches || parallaxQueued) return;
  parallaxQueued = true;
  requestAnimationFrame(updateParallax);
}, { passive: true });
if (!reducedMotion.matches) updateParallax();

// Botões magnéticos: só com mouse e sem preferência por menos movimento.
if (finePointer.matches && !reducedMotion.matches) {
  document.querySelectorAll('.button, .nav-contact, .contact-link').forEach(target => {
    target.addEventListener('pointermove', event => {
      const box = target.getBoundingClientRect();
      target.style.setProperty('--bx', `${((event.clientX - box.left - box.width / 2) * .22).toFixed(1)}px`);
      target.style.setProperty('--by', `${((event.clientY - box.top - box.height / 2) * .35).toFixed(1)}px`);
    }, { passive: true });
    target.addEventListener('pointerleave', () => {
      target.style.removeProperty('--bx');
      target.style.removeProperty('--by');
    });
  });

}

// Menu: marca a seção que está no meio da tela.
const navLinks = new Map([...document.querySelectorAll('.desktop-nav a')].map(a => [a.getAttribute('href').slice(1), a]));
if ('IntersectionObserver' in window) {
  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link, id) => link.classList.toggle('is-active', id === entry.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach((_, id) => { const section = document.getElementById(id); if (section) spy.observe(section); });
  spy.observe(hero);
}

// Relógio do HUD: só atualiza enquanto o topo está visível.
const hudClock = document.querySelector('.hud-clock');
if (hudClock) {
  const tick = () => { if (heroVisible && !document.hidden) hudClock.textContent = new Date().toLocaleTimeString('pt-BR'); };
  tick();
  setInterval(tick, 1000);
}

// Código do crachá: um padrão fixo derivado do nome (decorativo).
const badgeCode = document.querySelector('.badge-code');
if (badgeCode) {
  let seed = [...'ArthurNavarete'].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const cells = [];
  for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const finder = (x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5);
    if (finder ? !(x % 6 === 1 && y % 6 === 1) : seed % 3 === 0) cells.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
  }
  badgeCode.innerHTML = `<svg viewBox="0 0 9 9" fill="#0b1719">${cells.join('')}</svg>`;
}

// Crachá pendurado: arrastar inclina, soltar volta balançando como um pêndulo.
const badge = document.querySelector('.badge');
if (badge && finePointer.matches && !reducedMotion.matches) {
  let angle = 0;
  let velocity = 0;
  let dragging = false;
  let pivot = { x: 0, y: 0 };
  let swingRaf = 0;
  const apply = () => badge.style.setProperty('--sw', `${angle.toFixed(2)}deg`);
  const swing = () => {
    velocity = (velocity - angle * .018) * .965;
    angle += velocity;
    apply();
    swingRaf = Math.abs(angle) > .04 || Math.abs(velocity) > .04 ? requestAnimationFrame(swing) : 0;
  };
  const release = () => { if (!swingRaf) swingRaf = requestAnimationFrame(swing); };
  badge.addEventListener('pointerdown', event => {
    const parent = badge.offsetParent.getBoundingClientRect();
    pivot = { x: parent.left + badge.offsetLeft + badge.offsetWidth / 2, y: parent.top + badge.offsetTop };
    dragging = true;
    cancelAnimationFrame(swingRaf);
    swingRaf = 0;
    badge.setPointerCapture(event.pointerId);
    badge.classList.add('is-dragging');
  });
  badge.addEventListener('pointermove', event => {
    if (!dragging) return;
    const target = Math.max(-50, Math.min(50, -Math.atan2(event.clientX - pivot.x, event.clientY - pivot.y) * 180 / Math.PI));
    velocity = target - angle;
    angle = target;
    apply();
  });
  badge.addEventListener('pointerup', () => { dragging = false; badge.classList.remove('is-dragging'); velocity *= .6; release(); });
  badge.addEventListener('pointerenter', () => { if (!dragging) { velocity += 1.2; release(); } });
}

// Partículas que viram formas conforme a seção (telas largas, com movimento permitido).
const morph = document.querySelector('.morph');
if (morph && !reducedMotion.matches && window.matchMedia('(min-width: 1101px)').matches) {
  const ctx = morph.getContext('2d');
  const COUNT = 640;
  const shapes = [
    { el: document.getElementById('sobre'), shape: 'braces' },
    { el: document.getElementById('projetos'), shape: 'field' },
    { el: document.getElementById('metodo'), shape: 'nodes' },
    { el: document.querySelector('.toolbox'), shape: 'tag' },
    { el: document.getElementById('contato'), shape: 'field' },
  ].filter(item => item.el);
  let w = 0;
  let h = 0;
  let targets = {};
  let current = null;
  let morphRaf = 0;
  const dots = Array.from({ length: COUNT }, (_, i) => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, tx: 0, ty: 0, phase: i * .37, speed: .6 + Math.random() * .8, start: 0 }));

  function sample(draw) {
    const size = Math.round(Math.min(h * .62, w * .34));
    const off = document.createElement('canvas');
    off.width = off.height = size;
    const o = off.getContext('2d');
    o.fillStyle = o.strokeStyle = '#fff';
    draw(o, size);
    const data = o.getImageData(0, 0, size, size).data;
    const points = [];
    for (let y = 0; y < size; y += 3) for (let x = 0; x < size; x += 3) if (data[(y * size + x) * 4 + 3] > 128) points.push([x, y]);
    const left = w * .76 - size / 2;
    const top = h * .5 - size / 2;
    return Array.from({ length: COUNT }, () => { const [x, y] = points[Math.floor(Math.random() * points.length)] || [size / 2, size / 2]; return [left + x, top + y]; });
  }
  function buildTargets() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    w = innerWidth;
    h = innerHeight;
    morph.width = Math.round(w * ratio);
    morph.height = Math.round(h * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const glyph = text => (o, size) => { o.font = `800 ${size * .62}px Manrope, system-ui, sans-serif`; o.textAlign = 'center'; o.textBaseline = 'middle'; o.fillText(text, size / 2, size / 2); };
    targets = {
      braces: sample(glyph('{ }')),
      tag: sample(glyph('</>')),
      nodes: sample((o, size) => {
        o.lineWidth = size * .035;
        const pts = [[.15, .7], [.5, .3], [.85, .65]].map(([x, y]) => [x * size, y * size]);
        o.beginPath(); o.moveTo(...pts[0]); pts.slice(1).forEach(p => o.lineTo(...p)); o.stroke();
        pts.forEach(([x, y]) => { o.beginPath(); o.arc(x, y, size * .11, 0, Math.PI * 2); o.fill(); });
      }),
      field: Array.from({ length: COUNT }, () => [Math.random() * w, Math.random() * h]),
    };
    if (current) setShape(current, true);
  }
  function setShape(name, force) {
    if (name === current && !force) return;
    current = name;
    const list = targets[name];
    const order = list.map((_, i) => i).sort(() => Math.random() - .5);
    // Cada partícula parte num momento diferente: a figura se monta aos poucos.
    const now = performance.now();
    dots.forEach((dot, i) => { [dot.tx, dot.ty] = list[order[i]]; dot.start = now + Math.random() * 900; });
  }
  function activeShape() {
    const middle = innerHeight / 2;
    const hit = shapes.find(({ el }) => { const r = el.getBoundingClientRect(); return r.top <= middle && r.bottom >= middle; });
    return hit ? hit.shape : null;
  }
  function frame(time) {
    if (heroVisible) {
      morph.classList.remove('is-on');
      morphRaf = !document.hidden ? requestAnimationFrame(frame) : 0;
      return;
    }
    const name = activeShape();
    const on = !heroVisible && !!name;
    morph.classList.toggle('is-on', on);
    if (name) setShape(name);
    ctx.clearRect(0, 0, w, h);
    const t = time / 1000;
    for (const dot of dots) {
      const ease = time < dot.start ? 0 : .018 * dot.speed;
      dot.x += (dot.tx + Math.sin(t * .9 + dot.phase) * 2.2 - dot.x) * ease + Math.sin(t * .5 + dot.phase) * .08;
      dot.y += (dot.ty + Math.cos(t * .7 + dot.phase) * 2.2 - dot.y) * ease + Math.cos(t * .4 + dot.phase) * .08;
    }
    // Método tem fundo verde-limão: ali as partículas ficam escuras.
    ctx.fillStyle = current === 'nodes' ? 'rgba(16,34,22,.5)' : 'rgba(214,243,106,.55)';
    for (const dot of dots) ctx.fillRect(dot.x, dot.y, 1.6, 1.6);
    morphRaf = !document.hidden ? requestAnimationFrame(frame) : 0;
  }
  buildTargets();
  setShape('field');
  document.fonts?.ready.then(buildTargets);
  window.addEventListener('resize', buildTargets, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !morphRaf) morphRaf = requestAnimationFrame(frame); });
  morphRaf = requestAnimationFrame(frame);
}
