// Efeitos novos da home. Melhoria progressiva: sem JS ou com movimento reduzido, o CSS mostra versões estáticas.
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

// Vidro líquido: a refração por filtro SVG só funciona em navegadores Chromium; nos demais fica o vidro fosco.
if (CSS.supports('backdrop-filter', 'url(#refracao)') && /Chrome\//.test(navigator.userAgent)) document.documentElement.classList.add('refract');

// Faixa gigante: botão de pausa (movimento automático contínuo precisa de controle).
document.querySelectorAll('.mega-marquee').forEach((marquee) => {
  const button = marquee.querySelector('.mega-pause');
  button?.addEventListener('click', () => {
    const paused = marquee.classList.toggle('is-paused');
    button.setAttribute('aria-pressed', String(paused));
    button.textContent = paused ? 'Retomar faixa' : 'Pausar faixa';
  });
});

// Uma única leitura de rolagem por quadro para todos os efeitos guiados pela rolagem.
const onScroll = [];
let queued = false;
const run = () => { queued = false; onScroll.forEach((fn) => fn()); };
window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(run); } }, { passive: true });
window.addEventListener('resize', run, { passive: true });

// Works Wheel: o anel gira 45° por projeto conforme a seção atravessa a tela.
const wheel = document.querySelector('.wheel');
if (wheel && !reduced.matches) {
  const drum = wheel.querySelector('.wheel-drum');
  // Anel de 8 faces a 45°: os 4 projetos repetidos, para que as vizinhas apareçam em perspectiva.
  const originals = [...wheel.querySelectorAll('.wheel-face')];
  originals.forEach((face, i) => { const copy = face.cloneNode(true); copy.style.setProperty('--i', i + originals.length); copy.classList.remove('is-current'); drum.append(copy); });
  const ring = [...wheel.querySelectorAll('.wheel-face')];
  const faces = originals;
  const go = wheel.querySelector('.wheel-go');
  const name = wheel.querySelector('.wheel-name');
  const status = wheel.querySelector('.wheel-status');
  const count = wheel.querySelector('.wheel-count');
  const steps = faces.length - 1;
  let current = -1;
  const progress = () => {
    const box = wheel.getBoundingClientRect();
    return Math.min(1, Math.max(0, -box.top / (box.height - innerHeight)));
  };
  const update = () => {
    const box = wheel.getBoundingClientRect();
    if (box.bottom < 0 || box.top > innerHeight) return;
    const p = progress();
    drum.style.setProperty('--rot', `${(-p * steps * 45).toFixed(2)}deg`);
    ring.forEach((face) => face.style.setProperty('--sheen', `${(p * 300) % 100}%`));
    const index = Math.round(p * steps);
    if (index === current) return;
    current = index;
    const face = faces[index];
    ring.forEach((f) => f.classList.toggle('is-current', f === face));
    name.textContent = face.dataset.name;
    status.textContent = face.dataset.status;
    go.href = face.dataset.href;
    go.setAttribute('aria-label', `Ver estudo de caso: ${face.dataset.name}`);
    count.textContent = `${index + 1} / ${faces.length}`;
  };
  // Botões levam a rolagem até o projeto anterior ou seguinte.
  const scrollToIndex = (i) => {
    const top = wheel.getBoundingClientRect().top + window.scrollY;
    const range = wheel.offsetHeight - innerHeight;
    window.scrollTo({ top: top + (range * Math.min(steps, Math.max(0, i))) / steps, behavior: 'smooth' });
  };
  wheel.querySelector('[data-wheel="prev"]').addEventListener('click', () => scrollToIndex(current - 1));
  wheel.querySelector('[data-wheel="next"]').addEventListener('click', () => scrollToIndex(current + 1));
  onScroll.push(update);
  update();
}

// Linha desenhada pela rolagem: cada circuito entre seções se traça enquanto passa pela tela.
const circuits = [...document.querySelectorAll('.circuit')];
if (circuits.length && !reduced.matches) {
  onScroll.push(() => {
    for (const circuit of circuits) {
      const box = circuit.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight - box.top) / (innerHeight * 0.7)));
      circuit.style.setProperty('--draw', p.toFixed(3));
    }
  });
  run();
}
