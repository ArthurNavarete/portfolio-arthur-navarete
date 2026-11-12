import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Site multipágina: a página inicial, um estudo de caso por projeto e a página de privacidade.
const pages = {
  index: 'index.html',
  'confeitaria-afetiva': 'projetos/confeitaria-afetiva/index.html',
  'planeart-ai-office': 'projetos/planeart-ai-office/index.html',
  'planeart-desktop': 'projetos/planeart-desktop/index.html',
  'planeart-arquitetura': 'projetos/planeart-arquitetura/index.html',
  privacidade: 'privacidade/index.html',
};

// Alvo amplo: navegadores de 2020 em diante (Chrome/Edge 87, Firefox 78, Safari 14), comuns em computadores antigos.
const legacy = ['es2020', 'chrome87', 'edge88', 'firefox78', 'safari14'];

export default defineConfig({
  build: {
    target: legacy,
    cssTarget: legacy,
    rollupOptions: {
      input: Object.fromEntries(Object.entries(pages).map(([name, file]) => [name, resolve(import.meta.dirname, file)])),
    },
  },
});
