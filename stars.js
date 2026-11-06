// Fundo animado no estilo da landing page Sinal: pixels brancos de 2 a 3 px que piscam (alguns em grupos) e nuvens
// de pontilhado 1-bit (matriz de Bayer) que andam devagar atrás do conteúdo. O cursor acende um halo de pontilhado
// verde e afasta os pixels por perto. Desligado com movimento reduzido.
const reducedStars = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reducedStars) {
  const canvas = document.createElement('canvas');
  canvas.className = 'sinal-stars';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, stars = [];
  // Cursor: alvo (mx, my) e posição suavizada (cx, cy); força 0..1 some quando o cursor sai da janela.
  const RAD = 260;
  let mx = -9999, my = -9999, cx = -9999, cy = -9999, force = 0, forceTarget = 0;
  const build = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round((W * H) / 11000);
    stars = [];
    for (let i = 0; i < n; i++) {
      const x = Math.random() * W, y = Math.random() * H * 1.5, s = Math.random() < 0.8 ? 2 : 3;
      const a = 0.25 + Math.random() * 0.65, depth = 0.04 + Math.random() * 0.12;
      stars.push({ x, y, s, a, depth, on: Math.random() < 0.85 });
      // Um em cada sete vira um pequeno grupo, como os aglomerados do Sinal.
      if (Math.random() < 0.14) for (let k = 0; k < 2 + Math.floor(Math.random() * 3); k++) stars.push({ x: x + (Math.random() * 4 - 2) * s, y: y + (Math.random() * 4 - 2) * s, s: 2, a: a * 0.8, depth, on: true });
    }
  };
  // Nuvens: soma de ondas suaves vira manchas; cada célula acende um pixel se passar do limiar de Bayer 4x4.
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
  const CELL = innerWidth < 760 ? 7 : 6;
  // O halo do cursor é agrupado em 4 tons de verde e desenhado no fim: trocar a cor a cada ponto custa caro.
  const HALO = [0.32, 0.45, 0.6, 0.78].map((a) => `rgba(214,243,106,${a})`);
  // Buffers fixos por tom (x, y intercalados) para não criar lixo a cada quadro.
  const haloBuf = [0, 1, 2, 3].map(() => new Float32Array(8192)), haloLen = [0, 0, 0, 0];
  // As nuvens só são recalculadas quando o tempo ou a rolagem mudam (dirty); o cursor redesenha a partir do cache.
  let cache = new Float32Array(0), dirty = true;
  const clouds = (t, sy) => {
    haloLen.fill(0);
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    const k = 1 / 260, drift = sy * 0.00035;
    const size = Math.ceil(W / CELL) * Math.ceil(H / CELL);
    if (cache.length !== size) { cache = new Float32Array(size); dirty = true; }
    const fresh = dirty; dirty = false; let idx = 0;
    for (let gy = 0, j = 0; gy < H; gy += CELL, j++) {
      const v = gy * k + drift;
      for (let gx = 0, i = 0; gx < W; gx += CELL, i++, idx++) {
        const u = gx * k;
        if (fresh) {
          const n = (Math.sin(u * 1.7 + v * 0.6 + t * 0.11) + Math.sin(u * 0.5 - v * 1.9 - t * 0.07) + Math.sin((u + v) * 1.1 + t * 0.05)) / 3;
          cache[idx] = (n - 0.32) * 1.3; // só as cristas viram nuvem
        }
        const d = cache[idx];
        let halo = 0;
        if (force > 0.01) { const dx = gx - cx, dy = gy - cy; if (dx * dx + dy * dy < RAD * RAD) { const f = 1 - Math.hypot(dx, dy) / RAD; halo = f * f * 1.05 * force; } }
        const b = BAYER[(j & 3) * 4 + (i & 3)];
        const base = d > 0 ? d * 0.75 : 0;
        if (halo > 0.02 && base + halo > b) { if (halo > base) { const l = Math.min(3, (halo * 4) | 0), n = haloLen[l]; if (n < 8190) { haloBuf[l][n] = gx; haloBuf[l][n + 1] = gy; haloLen[l] = n + 2; } } else ctx.fillRect(gx, gy, 2, 2); }
        else if (base > b) ctx.fillRect(gx, gy, 2, 2);
      }
    }
    for (let l = 0; l < 4; l++) { const n = haloLen[l], buf = haloBuf[l]; if (!n) continue; ctx.fillStyle = HALO[l]; for (let i = 0; i < n; i += 2) ctx.fillRect(buf[i], buf[i + 1], 2, 2); }
  };
  const t0 = performance.now();
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    const sy = scrollY, span = H * 1.5;
    clouds((performance.now() - t0) / 1000, sy);
    for (const p of stars) {
      if (!p.on) continue;
      const y = (((p.y - sy * p.depth) % span) + span) % span;
      if (y > H) continue;
      let x = p.x, yy = y, a = p.a;
      if (force > 0.01) { // os pixels perto do cursor se afastam dele e acendem
        const dx = x - cx, dy = yy - cy, dist = Math.hypot(dx, dy);
        if (dist < RAD && dist > 0.1) { const f = (1 - dist / RAD) ** 2 * force; x += (dx / dist) * f * 34; yy += (dy / dist) * f * 34; a = Math.min(1, a + f); }
      }
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fillRect(Math.round(x), Math.round(yy), p.s, p.s);
    }
  };
  let queued = false;
  const request = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; draw(); }); } };
  build(); draw();
  addEventListener('resize', () => { build(); dirty = true; request(); });
  // Na rolagem só redesenha a partir do cache; o deslocamento das nuvens é recalculado no próximo tique (90 ms).
  addEventListener('scroll', request, { passive: true });
  // Segue o cursor com atraso suave; o laço só roda enquanto o halo ainda está se movendo.
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let running = false;
    const follow = () => {
      cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18; force += (forceTarget - force) * 0.12;
      draw();
      if (Math.abs(mx - cx) + Math.abs(my - cy) > 0.5 || Math.abs(forceTarget - force) > 0.01) requestAnimationFrame(follow); else running = false;
    };
    const wake = () => { if (!running) { running = true; requestAnimationFrame(follow); } };
    addEventListener('pointermove', (e) => { if (cx < -9000) { cx = e.clientX; cy = e.clientY; } mx = e.clientX; my = e.clientY; forceTarget = 1; wake(); }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { forceTarget = 0; wake(); });
  }
  // Cintilação: a cada 140 ms alguns pixels trocam de estado (barato: só redesenha ~150 quadrados).
  setInterval(() => {
    if (document.hidden) return;
    for (let i = 0; i < Math.max(2, stars.length * 0.03); i++) { const p = stars[(Math.random() * stars.length) | 0]; p.on = !p.on; }
    dirty = true; request();
  }, 90); // ~11 quadros por segundo bastam: nuvens e pixels andam devagar
}
