# Portfólio de Arthur Navarete

Site pessoal em português do Brasil, feito com HTML, CSS e JavaScript, sem framework. O Vite gera os arquivos estáticos.

## Estrutura

| Caminho | Conteúdo |
|---|---|
| `index.html` | Página inicial: apresentação, trabalhos, sobre, estudos e contato |
| `projetos/<projeto>/index.html` | Um estudo de caso por projeto |
| `styles.css`, `script.js` | Identidade visual e efeitos originais da página inicial (HUD, partículas, cards 3D, crachá) |
| `effects.css`, `effects.js` | Efeitos adicionados: Works Wheel 3D, faixa gigante com telas, brilho holográfico, vidro líquido, circuitos desenhados pela rolagem e transição entre páginas |
| `signature.css`, `signature.js` | Intro de abertura (frases que saem do desfoque; ao rolar, "navarete" em metal líquido cai, solta faíscas e o preto se abre; uma vez por sessão, com botão para pular), esfera de pontos 1-bit no topo com as etiquetas software, web e automação, título formado por pontos (inspirados no Sinal), Limalha atrás do crachá do contato, frase que acende, trilho lateral e nome do rodapé (inspirados no Akari) |
| `noir.css`, `stars.js` | Fundo todo preto no estilo Sinal: pixels brancos que piscam e nuvens de pontilhado 1-bit que andam devagar atrás do conteúdo (home e estudos de caso) |
| `metal.css`, `metal.js` | Botão Mercúrio (anel de metal líquido) em todos os botões de contato e de projeto, e o texto em metal da intro. Escala única: 52 px nos botões principais, 44 px nos secundários |
| `public/curriculo-arthur-navarete.pdf` | Currículo aberto pelos links "Currículo" |
| `case.css`, `case.js` | Estudos de caso: tela que cresce com a rolagem, linha de leitura, faixa de telas com lente e visualizador |
| `public/projetos/` | Telas dos projetos (JPG original e WebP em 1440 e 800 px), sempre com dados fictícios |
| `vite.config.js` | Lista das páginas do build multipágina; uma página nova precisa entrar aqui e no `public/sitemap.xml` |
| `CONTENT_AUDIT.md` | Evidência de cada afirmação publicada e o que não pode ser afirmado |

## Desenvolvimento

```bash
npm ci
npm run dev
```

## Publicação na Hostinger

Importe este repositório como aplicativo web de frontend/Vite. Use a branch `main`, Node.js 22 ou 24, o comando `npm run build` e a pasta de saída `dist`. Não há comando de inicialização, API ou variáveis de ambiente.

Para verificar o build localmente:

```bash
npm run build
npm run preview
```

O site não tem formulário nem coleta de dados. Única dependência de produção: `@paper-design/shaders` 0.0.81 (Apache-2.0), usada pelo botão Mercúrio.

Os efeitos Mercúrio e Limalha foram adaptados de itens do Profitize Build, com licença pessoal de uso (não redistribuir os itens como estão). As fontes vêm do Google Fonts. Todos os efeitos têm versão estática com movimento reduzido e sem JavaScript.
