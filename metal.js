// Mercúrio: anel de metal líquido nos botões de contato e de projetos (home e estudos de caso).
import {
  ShaderMount,
  liquidMetalFragmentShader,
  toProcessedLiquidMetal,
  getShaderColorFromString,
  ShaderFitOptions,
  LiquidMetalShapes,
} from '@paper-design/shaders';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ========== Mercúrio: anel de metal líquido nos botões principais ========== */
function ringMask(w, h, ring) {
  const k = 4;
  const c = new OffscreenCanvas(Math.round(w * k), Math.round(h * k));
  const x = c.getContext('2d');
  x.fillStyle = '#fff';
  x.beginPath(); x.roundRect(0, 0, c.width, c.height, c.height / 2); x.fill();
  const t = ring * k;
  x.globalCompositeOperation = 'destination-out';
  x.beginPath(); x.roundRect(t, t, c.width - t * 2, c.height - t * 2, c.height / 2 - t); x.fill();
  return c;
}
const maskCache = new Map();
let maskQueue = Promise.resolve();
function processedMask(w, h, ring) {
  const key = `${w}x${h}:${ring}`;
  let p = maskCache.get(key);
  if (!p) {
    p = maskQueue.then(async () => {
      const blob = await ringMask(w, h, ring).convertToBlob({ type: 'image/png' });
      const { pngBlob } = await toProcessedLiquidMetal(new File([blob], 'mask.png', { type: 'image/png' }));
      const img = new Image();
      img.src = URL.createObjectURL(pngBlob);
      await img.decode();
      return img;
    });
    maskQueue = p.catch(() => {});
    maskCache.set(key, p);
  }
  return p;
}
async function mountMetalRing(el) {
  const image = await processedMask(el.offsetWidth, el.offsetHeight, 2);
  if (!el.isConnected || !el.__wantMetal) return null;
  const mount = new ShaderMount(el, liquidMetalFragmentShader, {
    u_colorBack: getShaderColorFromString('rgba(0,0,0,0)'),
    u_colorTint: getShaderColorFromString('#eef7cf'),
    u_image: image, u_isImage: true, u_shape: LiquidMetalShapes.none,
    u_repetition: 1.5, u_softness: 0.15, u_shiftRed: 0.3, u_shiftBlue: 0.3, u_distortion: 0.08, u_contour: 0.2, u_angle: 90,
    u_fit: ShaderFitOptions.contain, u_scale: 1, u_rotation: 0, u_offsetX: 0, u_offsetY: 0, u_originX: 0.5, u_originY: 0.5, u_worldWidth: 0, u_worldHeight: 0,
  }, undefined, reduced ? 0 : 1, 0, 2, undefined, ['u_image']);
  el.classList.add('is-ready');
  return mount;
}
// Cada botão Mercúrio usa um contexto WebGL: só fica montado enquanto está perto da tela, e é desmontado
// quando sai (o navegador limita quantos contextos uma página pode ter).
if (typeof OffscreenCanvas !== 'undefined') {
  const metalIO = new IntersectionObserver((entries) => entries.forEach(async (e) => {
    const el = e.target;
    if (e.isIntersecting) {
      if (el.__wantMetal) return;
      el.__wantMetal = true;
      // Espera o navegador ficar ocioso: preparar a máscara do metal é pesado e não pode cair no meio da rolagem.
      await new Promise((r) => (window.requestIdleCallback ? requestIdleCallback(r, { timeout: 1200 }) : setTimeout(r, 200)));
      if (!el.__wantMetal) return;
      try { const m = await mountMetalRing(el); if (m && el.__wantMetal) el.__metal = m; else m?.dispose(); } catch (err) { console.warn('metal: ficou o anel liso', err); }
    } else if (el.__wantMetal) {
      el.__wantMetal = false;
      el.__metal?.dispose(); el.__metal = null; el.classList.remove('is-ready');
    }
  }), { rootMargin: '200px' });
  setTimeout(() => document.querySelectorAll('.metal-btn__metal').forEach((el) => metalIO.observe(el)), 250);
}


// Texto em metal líquido (usado pela intro): a máscara é o próprio texto desenhado num canvas.
export async function mountMetalText(el, text, font) {
  if (typeof OffscreenCanvas === 'undefined') return null;
  const w = el.offsetWidth, h = el.offsetHeight, k = 2;
  const c = new OffscreenCanvas(Math.round(w * k), Math.round(h * k));
  const x = c.getContext('2d');
  x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = font.replace(/(\d+(?:\.\d+)?)px/, (m, n) => `${n * k}px`);
  x.fillText(text, c.width / 2, c.height / 2);
  const blob = await c.convertToBlob({ type: 'image/png' });
  const { pngBlob } = await toProcessedLiquidMetal(new File([blob], 'texto.png', { type: 'image/png' }));
  const img = new Image(); img.src = URL.createObjectURL(pngBlob); await img.decode();
  if (!el.isConnected) return null;
  const mount = new ShaderMount(el, liquidMetalFragmentShader, {
    u_colorBack: getShaderColorFromString('rgba(0,0,0,0)'),
    u_colorTint: getShaderColorFromString('#ffffff'),
    u_image: img, u_isImage: true, u_shape: LiquidMetalShapes.none,
    u_repetition: 2, u_softness: 0.1, u_shiftRed: 0.35, u_shiftBlue: 0.35, u_distortion: 0.07, u_contour: 0.4, u_angle: 70,
    u_fit: ShaderFitOptions.contain, u_scale: 1, u_rotation: 0, u_offsetX: 0, u_offsetY: 0, u_originX: 0.5, u_originY: 0.5, u_worldWidth: 0, u_worldHeight: 0,
  }, undefined, reduced ? 0 : 1, 0, 2, undefined, ['u_image']);
  el.classList.add('is-ready');
  return mount;
}
