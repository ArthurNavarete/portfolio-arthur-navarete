// Efeitos de assinatura: Limalha (item licenciado do Profitize Build, adaptado à paleta do site), a intro, o título
// formado por pontos (inspirados na landing page Sinal), o globo de pontos com Maringá (cobe), a frase que acende, o trilho lateral e o nome
// do rodapé (inspirados na landing page Akari). O botão Mercúrio fica em metal.js. Tudo é melhoria progressiva.
import { mountMetalText } from './metal.js';
import './stars.js';
import createGlobe from 'cobe';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ========== Limalha: fundo do contato ========== */
const LIMALHA_FS = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_hover;
uniform float u_dpr;
uniform vec2 u_center;
out vec4 o;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_c3;
uniform vec3 u_c4;
#define CORAL u_c1
#define GELO u_c2
#define ANIL u_c3
#define ABISMO u_c4
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y); }
float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; } return v; }
float grain(vec2 p) { uvec2 q = uvec2(ivec2(p) + 4096); uint h = (q.x * 1597334677u) ^ (q.y * 3812015801u); h = (h ^ (h >> 16u)) * 0x45d9f3bu; h ^= h >> 16u; return float(h) / 4294967295.0; }
const float PAPER = 0.0;
const float CELL = 0.0068;
const float NL = 20.0;
vec2 poleN, poleS, poleC, poleD; float qM; vec2 mpos;
void setup(float asp, float t, vec2 m) {
  float wide = smoothstep(0.8, 1.3, asp); float hx = 0.5 * asp;
  vec2 cen = mix(vec2(0.0, -0.2), vec2(0.5 * hx, -0.02), wide) + vec2(0.03 * sin(t * 1.1), 0.03 * cos(t * 0.9));
  float ang = mix(1.35, 0.35, wide) + 0.25 * sin(t * 0.8);
  float sep = mix(0.15, 0.21, wide) * (1.0 + 0.08 * sin(t * 1.4 + 1.0));
  vec2 ax = vec2(cos(ang), sin(ang)) * sep; poleN = cen - ax; poleS = cen + ax;
  vec2 c2 = cen + mix(vec2(0.12, -0.3), vec2(0.2 * hx, -0.3), wide) + vec2(0.04 * cos(t * 1.3), 0.03 * sin(t * 1.7));
  float a2 = mix(0.3, -0.5, wide) + 0.3 * sin(t * 1.2 + 2.0);
  vec2 ax2 = vec2(cos(a2), sin(a2)) * 0.075; poleC = c2 + ax2; poleD = c2 - ax2;
  mpos = m; qM = -0.5 * u_hover;
}
vec2 pole(vec2 x, vec2 c, float q) { vec2 r = x - c; return q * r / (dot(r, r) + 0.0003); }
vec2 field(vec2 x) { return pole(x, poleN, 1.0) + pole(x, poleS, -1.0) + pole(x, poleC, 0.75) + pole(x, poleD, -0.75) + pole(x, mpos, qM); }
float stream(vec2 x) { vec2 a = x - poleN, b = x - poleS, c = x - poleC, e = x - poleD, d = x - mpos;
  return atan(a.y, a.x) - atan(b.y, b.x) + 0.75 * (atan(c.y, c.x) - atan(e.y, e.x)) + qM * atan(d.y, d.x); }
void main() {
  float asp = u_res.x / u_res.y;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec2 m = (u_mouse - 0.5) * vec2(asp, 1.0);
  float t = u_time * 0.05; float px = 1.0 / u_res.y;
  setup(asp, t, m);
  float la = 0.7 + 0.8 * sin(t * 1.7);
  vec3 L = normalize(vec3(cos(la), sin(la), 1.0)); vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  vec2 sh = -L.xy * 1.6 * px - vec2(0.0, 0.6 * px);
  vec2 gi = floor(p / CELL); float hw = max(0.075 * CELL, 0.5 * px);
  float cov = 0.0, shad = 0.0; vec3 lit = vec3(0.0);
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 id = gi + vec2(i, j);
    float h1 = hash(id), h2 = hash(id + 17.3), h3 = hash(id + 41.7);
    vec2 fp = (id + 0.5 + 0.6 * (vec2(h1, h2) - 0.5)) * CELL;
    vec2 B = field(fp); float s = length(B); float ls = log(s);
    float reach = smoothstep(0.45, 1.4, ls);
    float spacing = 6.2832 / (NL * s);
    float wl = smoothstep(1.6 * CELL, 4.0 * CELL, spacing);
    float ch = cos(stream(fp) * NL + 1.6 * noise(fp * 9.0));
    float chain = smoothstep(0.1 - 0.5 * noise(fp * 4.0 + 3.0), 0.95, ch);
    float dens = reach * mix(0.95, 0.28 + 0.72 * chain, wl);
    if (dens < 0.02 || h3 > dens) continue;
    float ang = atan(B.y, B.x) + (h1 - 0.5) * 0.12; vec2 dir = vec2(cos(ang), sin(ang));
    float len = CELL * mix(0.6, 1.0, smoothstep(0.3, 2.5, ls)) * (0.85 + 0.15 * h2);
    vec2 r = p - fp; float u = dot(r, dir), v = dot(r, vec2(-dir.y, dir.x));
    float tu = clamp(u / len, -1.0, 1.0); float wv = hw * (1.0 - 0.6 * tu * tu);
    float d = length(vec2(max(abs(u) - len, 0.0), v)); float a = smoothstep(wv + px, wv - px * 0.5, d);
    vec2 rs = r - sh; float ds = length(vec2(max(abs(dot(rs, dir)) - len, 0.0), dot(rs, vec2(-dir.y, dir.x))));
    shad = max(shad, smoothstep(wv + 2.5 * px, wv - px, ds));
    if (a <= 0.0) continue;
    vec3 T = normalize(vec3(dir, (h2 - 0.5) * 0.6)); float th = dot(T, H);
    float sp = pow(sqrt(max(1.0 - th * th, 0.0)), 60.0); float tl = dot(T, L); float df = sqrt(max(1.0 - tl * tl, 0.0));
    float rim = clamp(v / max(wv, 1e-5) * 0.5 + 0.5, 0.0, 1.0);
    vec3 c = CORAL * (0.2 + 0.6 * df * (0.6 + 0.4 * rim)) + ANIL * 0.18 * (1.0 - df) * (1.0 - rim);
    c += GELO * sp * 1.6;
    lit = mix(lit, c, a); cov = max(cov, a);
  }
  vec2 rn = p - poleN, rs2 = p - poleS;
  float glow = exp(-dot(rn, rn) * 7.0) + exp(-dot(rs2, rs2) * 7.0);
  float fib = fbm(p * vec2(9.0, 2.5) + 3.0) - 0.5;
  vec3 bg = ABISMO * (0.85 + 0.3 * fib) + CORAL * 0.07 * glow;
  bg *= 1.0 - 0.5 * shad * (1.0 - cov);
  bg += (grain(gl_FragCoord.xy) - 0.5) * 0.03;
  vec3 col = mix(bg, lit, cov);
  col *= smoothstep(1.6, 0.4, length(p * vec2(0.55, 0.9)));
  o = vec4(col, 1.0);
}`;
const hex = (h) => { const n = parseInt(h.replace('#', ''), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };
function mountLimalha(stage, host) {
  const canvas = document.createElement('canvas');
  stage.append(canvas);
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false });
  if (!gl) { canvas.remove(); stage.classList.add('no-gl'); return; }
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, '#version 300 es\nvoid main() { vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2); gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0); }'));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, LIMALHA_FS));
  gl.linkProgram(prog); gl.useProgram(prog);
  gl.bindVertexArray(gl.createVertexArray());
  const U = (n) => gl.getUniformLocation(prog, n);
  const u = { res: U('u_res'), time: U('u_time'), mouse: U('u_mouse'), hover: U('u_hover'), dpr: U('u_dpr'), center: U('u_center') };
  // Paleta do site: limalha verde-limão envelhecido, brilho claro, aço ciano, fundo do site.
  [['u_c1', '#c3d48a'], ['u_c2', '#edf2e7'], ['u_c3', '#8bd9dc'], ['u_c4', '#091316']].forEach(([n, c]) => gl.uniform3fv(U(n), hex(c)));
  gl.uniform2f(u.center, 0, 0);
  let dpr = 1, raf = 0, last = performance.now(), visible = false;
  const target = { x: 0.5, y: 0.5, h: 0 }, cur = { x: 0.5, y: 0.5, h: 0 };
  const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); canvas.width = Math.max(1, Math.round(stage.clientWidth * dpr)); canvas.height = Math.max(1, Math.round(stage.clientHeight * dpr)); gl.viewport(0, 0, canvas.width, canvas.height); };
  const draw = (time) => {
    gl.uniform2f(u.res, canvas.width, canvas.height); gl.uniform1f(u.time, time); gl.uniform1f(u.dpr, dpr);
    gl.uniform2f(u.mouse, cur.x, cur.y); gl.uniform1f(u.hover, cur.h);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const frame = (now) => {
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    const k = 1 - Math.pow(0.94, 60 * dt), kh = 1 - Math.pow(0.96, 60 * dt);
    cur.x += (target.x - cur.x) * k; cur.y += (target.y - cur.y) * k; cur.h += (target.h - cur.h) * kh;
    draw(now / 1000);
    raf = visible ? requestAnimationFrame(frame) : 0;
  };
  const still = () => draw(18);
  host.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    target.x = (e.clientX - r.left) / r.width; target.y = 1 - (e.clientY - r.top) / r.height; target.h = 1;
    if (reduced) { cur.x = target.x; cur.y = target.y; cur.h = 1; still(); }
  }, { passive: true });
  host.addEventListener('pointerleave', () => { target.h = 0; if (reduced) { cur.h = 0; still(); } });
  new ResizeObserver(() => { size(); if (reduced || !raf) still(); }).observe(stage);
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (reduced) return;
    if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }, { rootMargin: '100px' }).observe(stage);
  size(); still();
}
const limalha = document.querySelector('.limalha-stage');
if (limalha) { try { mountLimalha(limalha, limalha.closest('section')); } catch (err) { console.warn('limalha: ficou o fundo liso', err); } }

/* ========== Globo de pontos no topo (biblioteca cobe, MIT): continentes em pontos brancos no preto, Maringá
   marcado em verde com etiqueta presa ao ponto. Balança em torno do Brasil, pode ser arrastado (segue no embalo e
   depois volta para Maringá) e encolhe e some quando o topo sai da tela. ========== */
const globeCanvas = document.querySelector('.orb');
if (globeCanvas) {
  const art = globeCanvas.parentElement;
  const MARINGA = [-23.4205, -51.9333];
  const toPhi = (lon) => Math.PI - ((lon * Math.PI) / 180 - Math.PI / 2);
  let phi = toPhi(MARINGA[1]), vel = 0, drag = null, visible = true, globe = null;
  const theta = -0.32; // inclina para mostrar o hemisfério sul
  const start = () => {
    const size = globeCanvas.clientWidth, dpr = Math.min(devicePixelRatio || 1, 2);
    globe?.destroy();
    globe = createGlobe(globeCanvas, {
      devicePixelRatio: dpr, width: size * dpr, height: size * dpr,
      phi, theta, dark: 1, diffuse: 2.2, mapSamples: innerWidth < 1100 ? 12000 : 20000, mapBrightness: 12,
      baseColor: [0.7, 0.7, 0.7], markerColor: [0.84, 0.95, 0.42], glowColor: [0.2, 0.22, 0.14],
      markers: [{ location: MARINGA, size: 0.07, id: 'maringa' }], markerElevation: 0.02,
    });
  };
  start();
  // A cobe 2 não tem laço próprio: cada quadro chama update() (só com o topo visível e a aba ativa).
  const loop = () => {
    if (visible && !document.hidden && globe) {
      if (!drag && !reduced) {
        // Balança devagar em torno do Brasil; depois de um arrasto, o embalo gasta e ele volta para Maringá.
        const t = performance.now() / 1000, home = toPhi(MARINGA[1]) + Math.sin(t * 0.25) * 0.55;
        const nearest = home + Math.round((phi - home) / (Math.PI * 2)) * Math.PI * 2;
        phi += vel + (Math.abs(vel) < 0.002 ? (nearest - phi) * 0.012 : 0); vel *= 0.95;
      }
      globe.update({ phi, theta });
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  addEventListener('resize', () => { clearTimeout(start.t); start.t = setTimeout(start, 200); });
  // Arrastar para girar; ao soltar, a velocidade do gesto vira embalo.
  globeCanvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, phi, last: e.clientX }; globeCanvas.setPointerCapture(e.pointerId); globeCanvas.classList.add('is-dragging'); });
  globeCanvas.addEventListener('pointermove', (e) => { if (!drag) return; phi = drag.phi + (e.clientX - drag.x) / 180; vel = (e.clientX - drag.last) / 900; drag.last = e.clientX; });
  const release = () => { drag = null; globeCanvas.classList.remove('is-dragging'); };
  globeCanvas.addEventListener('pointerup', release); globeCanvas.addEventListener('pointercancel', release);
  // Some com a rolagem: escala e opacidade guiadas pela posição do topo.
  if (!reduced) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(art);
    addEventListener('scroll', () => {
      if (!visible) return;
      const k = Math.min(1, Math.max(0, -art.getBoundingClientRect().top / (art.clientHeight * 0.9)));
      art.style.setProperty('--out', k.toFixed(3));
    }, { passive: true });
  }
}

/* ========== Sinal + Akari: nome gigante do rodapé, montado por pontos que chovem ========== */
const footWord = document.querySelector('.foot-word');
if (footWord) {
  const span = footWord.querySelector('span');
  const fit = () => {
    footWord.style.setProperty('--fw-size', '100px');
    const ratio = footWord.clientWidth / span.getBoundingClientRect().width;
    footWord.style.setProperty('--fw-size', `${Math.floor(100 * ratio * 0.98)}px`);
  };
  fit();
  document.fonts?.ready.then(fit);
  addEventListener('resize', fit, { passive: true });
  if (reduced) footWord.classList.add('is-formed');
  else {
    const canvas = footWord.querySelector('canvas');
    const form = () => {
      const W = footWord.clientWidth, H = footWord.clientHeight, dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = W * dpr; canvas.height = H * dpr;
      const c = canvas.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
      const off = document.createElement('canvas'); off.width = W; off.height = H;
      const o = off.getContext('2d'); const s = getComputedStyle(span);
      o.font = `${s.fontWeight} ${s.fontSize} ${s.fontFamily}`; o.textBaseline = 'top'; o.fillStyle = '#fff';
      const sr = span.getBoundingClientRect(), fr = footWord.getBoundingClientRect();
      o.save(); o.translate(sr.left - fr.left, sr.top - fr.top);
      // Desenha letra a letra para respeitar o espaçamento negativo do CSS.
      const ls = parseFloat(s.letterSpacing) || 0; let x = 0;
      for (const ch of span.textContent) { o.fillText(ch, x, parseFloat(s.fontSize) * 0.05); x += o.measureText(ch).width + ls; }
      o.restore();
      const data = o.getImageData(0, 0, W, H).data; const targets = [];
      for (let y = 0; y < H; y += 4) for (let xx = 0; xx < W; xx += 4) if (data[(y * W + xx) * 4 + 3] > 128) targets.push([xx, y]);
      const drops = targets.map(([tx, ty]) => ({ tx, ty, x: tx + (Math.random() - 0.5) * 40, y: -Math.random() * H * 1.4 - 20, d: Math.random() * 900 + (tx / W) * 300 }));
      const t0 = performance.now();
      const step = (now) => {
        const el = now - t0; c.clearRect(0, 0, W, H); c.fillStyle = '#e9efe9';
        for (const p of drops) {
          const k = Math.max(0, Math.min(1, (el - p.d) / 700)); const e = 1 - Math.pow(1 - k, 3);
          c.fillRect(p.x + (p.tx - p.x) * e, p.y + (p.ty - p.y) * e, 2, 2);
        }
        if (el > 1300) footWord.classList.add('is-formed');
        if (el < 2400) requestAnimationFrame(step);
        else { canvas.style.transition = 'opacity .8s'; canvas.style.opacity = '0'; }
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); (document.fonts?.ready || Promise.resolve()).then(form); } }, { threshold: 0.3 });
    io.observe(footWord);
  }
}

/* ========== Akari: a frase do Sobre acende de cinza para branco, linha a linha ========== */
const statement = document.querySelector('.about-statement');
if (statement) {
  const wrap = (node) => [...node.childNodes].forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      child.textContent.split(/(\s+)/).forEach((part) => { if (!part) return; if (/^\s+$/.test(part)) frag.append(part); else { const s = document.createElement('span'); s.className = 'lw'; s.textContent = part; frag.append(s); } });
      child.replaceWith(frag);
    } else if (child.nodeType === Node.ELEMENT_NODE) wrap(child);
  });
  wrap(statement);
  const assign = () => {
    let line = -1, top = null;
    statement.querySelectorAll('.lw').forEach((w) => { if (w.offsetTop !== top) { top = w.offsetTop; line++; } w.classList.add('light-line'); w.style.setProperty('--l', line); });
  };
  assign();
  addEventListener('resize', assign, { passive: true });
  if (reduced) statement.classList.add('is-lit');
  else new IntersectionObserver(([e], io) => { if (e.isIntersecting) { statement.classList.add('is-lit'); io.disconnect(); } }, { threshold: 0.4 }).observe(statement);
}

/* ========== Akari: repertório num trilho lateral guiado pela rolagem vertical ========== */
const toolbox = document.querySelector('.toolbox');
if (toolbox && !reduced && matchMedia('(min-width: 1101px)').matches) {
  const track = toolbox.querySelector('.toolbox-content');
  const bar = document.createElement('div'); bar.className = 'rail-progress'; bar.setAttribute('aria-hidden', 'true'); bar.innerHTML = '<i></i>';
  toolbox.querySelector('.toolbox-layout').append(bar);
  toolbox.classList.add('rail-on');
  let distance = 0;
  const layout = () => { distance = Math.max(0, track.scrollWidth - innerWidth + 120); toolbox.style.height = `${innerHeight + distance}px`; };
  const update = () => {
    const r = toolbox.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
    track.style.setProperty('--rail-x', `${-p * distance}px`);
    bar.style.setProperty('--rail-p', p.toFixed(3));
  };
  layout(); update();
  addEventListener('resize', () => { layout(); update(); }, { passive: true });
  addEventListener('scroll', update, { passive: true });
  // Teclado: o foco num item dentro do trilho rola a página até ele ficar visível.
  track.addEventListener('focusin', (e) => {
    const items = [...track.children]; const i = items.findIndex((it) => it.contains(e.target));
    if (i < 0) return;
    const top = toolbox.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + (distance * i) / Math.max(1, items.length - 1) });
  });
}

/* ========== Título do topo formado por pontos (Sinal): cada ponto nasce perto da sua letra, espalhado como ruído
   1-bit, e se junta a ela; quando quase todos pousam, o texto real aparece e os pontos somem juntos. ========== */
function formTitleFromDots() {
  const title = document.querySelector('.hero h1');
  if (!title) return Promise.resolve();
  const root = document.documentElement;
  root.classList.add('title-forming');
  const W = innerWidth, H = innerHeight, dpr = Math.min(devicePixelRatio || 1, 2);
  const canvas = document.createElement('canvas'); canvas.className = 'title-dots'; canvas.setAttribute('aria-hidden', 'true');
  canvas.width = W * dpr; canvas.height = H * dpr; document.body.append(canvas);
  const c = canvas.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
  const off = document.createElement('canvas'); off.width = W; off.height = H;
  const o = off.getContext('2d', { willReadFrequently: true }); o.textBaseline = 'top';
  const words = title.querySelectorAll('.w > span').length ? [...title.querySelectorAll('.w > span')] : [title];
  const accent = getComputedStyle(root).getPropertyValue('--accent').trim() || '#d6f36a';
  const dots = [];
  for (const word of words) {
    const r = word.getBoundingClientRect(); const s = getComputedStyle(word);
    if (r.bottom < 0 || r.top > H || !r.width) continue;
    o.clearRect(0, 0, W, H);
    o.font = `${s.fontWeight} ${s.fontSize} ${s.fontFamily}`; o.fillStyle = '#fff';
    const ls = parseFloat(s.letterSpacing) || 0; let x = r.left;
    const y = r.top + (r.height - parseFloat(s.fontSize)) / 2;
    for (const ch of word.textContent) { o.fillText(ch, x, y); x += o.measureText(ch).width + ls; }
    const ox = Math.max(0, Math.floor(r.left - 4)), oy = Math.max(0, Math.floor(r.top - 4));
    const bw = Math.min(W - ox, Math.ceil(r.width + 8)), bh = Math.min(H - oy, Math.ceil(r.height + 8));
    const data = o.getImageData(ox, oy, bw, bh).data;
    const isAccent = !!word.closest('em');
    for (let yy = 0; yy < bh; yy += 3) for (let xx = 0; xx < bw; xx += 3) if (data[(yy * bw + xx) * 4 + 3] > 128) {
      const ang = Math.random() * Math.PI * 2, d = 20 + Math.random() * Math.random() * 110;
      dots.push({ tx: ox + xx, ty: oy + yy, sx: ox + xx + Math.cos(ang) * d, sy: oy + yy + Math.sin(ang) * d * 0.6, delay: Math.random() * 260, a: isAccent });
    }
  }
  return new Promise((resolve) => {
    const t0 = performance.now(); let revealed = false;
    const step = (now) => {
      const el = now - t0;
      c.clearRect(0, 0, W, H);
      c.globalAlpha = revealed ? Math.max(0, 1 - (el - 760) / 320) : 1;
      for (const p of dots) {
        const k = Math.max(0, Math.min(1, (el - p.delay) / 520)); if (k === 0) continue;
        const e = 1 - Math.pow(1 - k, 3);
        c.fillStyle = p.a ? accent : '#f2f2ef';
        c.fillRect(Math.round(p.sx + (p.tx - p.sx) * e), Math.round(p.sy + (p.ty - p.sy) * e), 2, 2);
      }
      if (!revealed && el > 760) { revealed = true; root.classList.remove('title-forming'); }
      if (el < 1100) requestAnimationFrame(step); else { canvas.remove(); resolve(); }
    };
    requestAnimationFrame(step);
  });
}

/* ========== Intro (estudada no centralpi.com.br com o RES; mesma mecânica, marca e texto próprios).
   1. As frases entram saindo do desfoque. 2. A pessoa rola (ou toca, ou aperta uma tecla): "navarete" em metal
   líquido cai, esmaga as frases numa linha de luz e solta faíscas. 3. O preto se abre a partir da linha e os pontos
   formam o título. Uma vez por sessão; "Pular abertura" vai direto ao site. ========== */
function sparkBurst(canvas, y, x0, x1) {
  const dpr = Math.min(devicePixelRatio || 1, 2), W = innerWidth, H = innerHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  const c = canvas.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
  const n = innerWidth < 700 ? 140 : 280, parts = [];
  for (let i = 0; i < n; i++) {
    const x = x0 + Math.random() * (x1 - x0), dir = Math.random() < 0.5 ? -1 : 1, sp = 3 + Math.random() * 11;
    parts.push({ x, y: y + (Math.random() - 0.5) * 4, vx: dir * sp * (0.4 + Math.random()), vy: -Math.random() * 7 - 1, life: 40 + Math.random() * 60, age: 0, hot: Math.random() < 0.55 });
  }
  return new Promise((resolve) => {
    const step = () => {
      c.clearRect(0, 0, W, H);
      let alive = 0;
      for (const p of parts) {
        if (p.age > p.life) continue; alive++;
        p.age++; p.vy += 0.32; p.vx *= 0.975; p.x += p.vx; p.y += p.vy;
        const k = 1 - p.age / p.life;
        c.strokeStyle = p.hot ? `rgba(214,243,106,${k})` : `rgba(255,255,255,${k * 0.9})`;
        c.lineWidth = p.hot ? 1.6 : 1.1;
        c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - p.vx * 1.8, p.y - p.vy * 1.8); c.stroke();
      }
      if (alive) requestAnimationFrame(step); else { c.clearRect(0, 0, W, H); resolve(); }
    };
    requestAnimationFrame(step);
  });
}

(() => {
  const title = document.querySelector('.hero h1');
  if (!title || reduced) return;
  let seen = null;
  try { seen = sessionStorage.getItem('intro-visto'); } catch { /* sem armazenamento: mostra a intro */ }
  const startTitle = (x, y) => (document.fonts?.ready || Promise.resolve()).then(() => formTitleFromDots(x, y));
  const heroCore = () => { const core = document.querySelector('.hero-art'); const r = core?.getBoundingClientRect(); return r?.width ? [r.left + r.width / 2, r.top + r.height / 2] : [innerWidth * 0.7, innerHeight * 0.45]; };
  if (seen) { document.documentElement.classList.add('title-forming'); requestAnimationFrame(() => startTitle(...heroCore())); return; }

  const root = document.documentElement;
  root.classList.add('intro-running');
  const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const intro = document.createElement('div');
  intro.className = 'intro';
  intro.setAttribute('role', 'dialog');
  intro.setAttribute('aria-label', 'Abertura do portfólio de Arthur Navarete');
  intro.innerHTML = `<div class="intro-veil intro-veil--top"></div><div class="intro-veil intro-veil--bottom"></div>
    <div class="intro-lines" aria-hidden="true">
      <p class="intro-line intro-line--kicker">// arthur navarete</p>
      <p class="intro-line intro-line--big">Software que organiza.</p>
      <p class="intro-line intro-line--big">Interfaces que fazem sentido.</p>
    </div>
    <div class="intro-flash" aria-hidden="true"></div>
    <div class="intro-metal" aria-hidden="true"><b>navarete</b></div>
    <canvas class="intro-sparks" aria-hidden="true"></canvas>
    <p class="intro-hint" aria-hidden="true"><span>MARINGÁ, PR · ${now}</span><span>ROLE PARA ENTRAR <i>↓</i></span></p>
    <button class="intro-skip" type="button">Pular abertura</button>`;
  document.body.append(intro);
  const metal = intro.querySelector('.intro-metal');
  const lines = intro.querySelector('.intro-lines');
  let metalMount = null;
  // O metal é preparado enquanto as frases entram; se não ficar pronto a tempo, cai o texto prateado em CSS.
  (document.fonts?.ready || Promise.resolve()).then(() => {
    const px = parseFloat(getComputedStyle(metal.querySelector('b')).fontSize);
    return mountMetalText(metal, 'navarete', `800 ${px}px Manrope, Inter, sans-serif`);
  }).then((m) => { metalMount = m; }).catch(() => {});
  requestAnimationFrame(() => requestAnimationFrame(() => intro.classList.add('is-in')));

  let state = 'waiting';
  const cleanup = () => {
    removeEventListener('wheel', onWheel); removeEventListener('keydown', onKey);
    intro.removeEventListener('click', onClick); removeEventListener('touchstart', onTouchStart); removeEventListener('touchmove', onTouchMove);
  };
  const end = () => {
    metalMount?.dispose(); intro.remove();
    root.classList.remove('intro-running');
    try { sessionStorage.setItem('intro-visto', '1'); } catch { /* ok */ }
  };
  const skip = () => {
    if (state === 'done') return; state = 'done'; cleanup(); end();
    root.classList.add('title-forming'); startTitle(innerWidth / 2, innerHeight / 2);
  };
  const go = () => {
    if (state !== 'waiting') return;
    state = 'playing'; cleanup();
    const lr = lines.getBoundingClientRect();
    const lineY = Math.round(lr.top + lr.height / 2);
    intro.style.setProperty('--line-y', `${lineY}px`);
    intro.classList.add('is-in', 'is-falling');
    setTimeout(() => {
      intro.classList.add('is-crush');
      sparkBurst(intro.querySelector('.intro-sparks'), lineY, lr.left + lr.width * 0.08, lr.right - lr.width * 0.08);
    }, 400);
    setTimeout(() => { intro.classList.add('is-open'); root.classList.remove('intro-running'); root.classList.add('title-forming'); }, 720);
    // No fim, o "navarete" da intro voa até a marca do topo e encolhe para o tamanho dela.
    // Medido quando o metal já pousou (sem a animação de impacto, que mexe na escala).
    setTimeout(() => {
      const brand = document.querySelector('.brand-metal')?.getBoundingClientRect();
      if (brand?.width) {
        metal.style.animation = 'none';
        const m = metal.getBoundingClientRect(), sc = brand.width / (m.width * 0.82);
        intro.style.setProperty('--to-x', `${(brand.left + brand.width / 2 - (m.left + m.width / 2)).toFixed(1)}px`);
        intro.style.setProperty('--to-y', `${(brand.top + brand.height / 2 - (m.top + m.height / 2)).toFixed(1)}px`);
        intro.style.setProperty('--to-s', sc.toFixed(3));
      }
      intro.classList.add('is-leaving');
    }, 900);
    setTimeout(() => startTitle(innerWidth / 2, lineY), 1450);
    setTimeout(() => { state = 'done'; end(); }, 2600);
  };
  const onWheel = (e) => { if (e.deltaY > 0) go(); };
  const onKey = (e) => { if (['ArrowDown', 'PageDown', ' ', 'Enter', 'Spacebar'].includes(e.key) && e.target === document.body) { e.preventDefault(); go(); } };
  const onClick = (e) => { if (!e.target.closest('.intro-skip')) go(); };
  let touchY = 0;
  const onTouchStart = (e) => { touchY = e.touches[0].clientY; };
  const onTouchMove = (e) => { if (touchY - e.touches[0].clientY > 24) go(); };
  addEventListener('wheel', onWheel, { passive: true });
  addEventListener('keydown', onKey);
  intro.addEventListener('click', onClick);
  addEventListener('touchstart', onTouchStart, { passive: true });
  addEventListener('touchmove', onTouchMove, { passive: true });
  intro.querySelector('.intro-skip').addEventListener('click', skip);
})();
