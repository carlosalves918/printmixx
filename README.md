# Print Mixx — Landing Page

Landing page da Print Mixx, feita em React + Vite. Estrutura em componentes, pronta para rodar
localmente e publicar na Vercel (ou GitHub Pages).

## Estrutura do projeto

```
printmixx-react/
├── index.html
├── vite.config.js
├── package.json
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css          # todos os estilos e variáveis de cor da marca
│   ├── siteConfig.js       # WhatsApp, Instagram, endereço e horário — edite aqui
│   ├── hooks/
│   │   └── useReveal.js    # animação de entrada ao rolar a página
│   ├── assets/             # logo, fachada, panfleto
│   └── components/
│       ├── Header.jsx
│       ├── Hero.jsx
│       ├── Services.jsx
│       ├── WhyUs.jsx
│       ├── Gallery.jsx
│       ├── Testimonials.jsx
│       ├── CTA.jsx
│       ├── Footer.jsx
│       ├── FloatingWhatsapp.jsx
│       └── icons/WhatsappIcon.jsx
```

## Rodando localmente

Você precisa ter o [Node.js](https://nodejs.org) instalado (versão 18 ou superior).

```bash
npm install
npm run dev
```

Isso abre o site em `http://localhost:5173`.

## Editando conteúdo

- **WhatsApp, Instagram, endereço e horário**: edite `src/siteConfig.js`. Todo o site puxa
  as informações desse arquivo, então basta trocar em um lugar só.
- **Textos de cada seção**: cada seção é um componente separado dentro de `src/components/`.
- **Cores e estilos**: tudo fica em `src/index.css`, nas variáveis no topo do arquivo (`:root`).
- **Imagens**: troque os arquivos em `src/assets/` mantendo o mesmo nome, ou importe um novo
  arquivo no componente correspondente (`Header.jsx`, `Hero.jsx`, `Gallery.jsx`, `Footer.jsx`).

## Publicando na Vercel (recomendado)

1. Suba este projeto para um repositório no GitHub:

```bash
git init
git add .
git commit -m "Landing page Print Mixx"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/printmixx.git
git push -u origin main
```

2. Entre em [vercel.com](https://vercel.com), clique em **Add New → Project**, e importe esse
   repositório do GitHub.

3. A Vercel detecta sozinha que é um projeto Vite/React. Não precisa mudar nenhuma configuração
   — clique em **Deploy**.

4. Em alguns segundos o site estará no ar em um endereço tipo
   `https://printmixx.vercel.app`. Toda vez que você der `git push`, a Vercel publica
   automaticamente a nova versão.

## Publicando no GitHub Pages (alternativa)

Se preferir usar o GitHub Pages em vez da Vercel:

1. Abra `vite.config.js` e troque `base: '/'` por `base: '/printmixx/'` (ou o nome do seu
   repositório, se for diferente).

2. Instale as dependências e publique:

```bash
npm install
npm run deploy
```

3. No GitHub, vá em **Settings → Pages** e confirme que a branch de publicação está como
   `gh-pages`.

## Domínio próprio (opcional)

Tanto na Vercel quanto no GitHub Pages, você pode apontar um domínio próprio (ex:
`printmixx.com.br`) depois, nas configurações de domínio de cada plataforma.
