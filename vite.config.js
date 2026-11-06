import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Site multipágina: a página inicial e um estudo de caso por projeto.
const pages = {
  index: 'index.html',
  'confeitaria-afetiva': 'projetos/confeitaria-afetiva/index.html',
  'planeart-ai-office': 'projetos/planeart-ai-office/index.html',
  'planeart-desktop': 'projetos/planeart-desktop/index.html',
  'planeart-arquitetura': 'projetos/planeart-arquitetura/index.html',
};

export default defineConfig({
  build: {
    rollupOptions: {
      input: Object.fromEntries(Object.entries(pages).map(([name, file]) => [name, resolve(import.meta.dirname, file)])),
    },
  },
});
