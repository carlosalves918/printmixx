# Print Mixx — Landing Page

Landing page da Print Mixx, feita em React + Vite. Estrutura em componentes, pronta para rodar
localmente e publicar no GitHub Pages.

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

## Publicando no GitHub Pages

1. Crie um repositório no GitHub (ex: `printmixx`) e suba este projeto:

```bash
git init
git add .
git commit -m "Landing page Print Mixx"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/printmixx.git
git push -u origin main
```

2. Abra `vite.config.js` e `package.json` e troque `SEU-USUARIO` e `printmixx` pelo seu
   usuário e nome real do repositório, se for diferente:

   - Em `vite.config.js`: `base: '/printmixx/'`
   - Em `package.json`: `"homepage": "https://SEU-USUARIO.github.io/printmixx"`

3. Instale as dependências e publique:

```bash
npm install
npm run deploy
```

Isso builda o site e publica automaticamente na branch `gh-pages`.

4. No GitHub, vá em **Settings → Pages** e confirme que a branch de publicação está como
   `gh-pages` (o comando acima já cria e envia essa branch). Em alguns minutos o site estará
   no ar em `https://SEU-USUARIO.github.io/printmixx`.

Sempre que quiser atualizar o site depois de mudar algo, rode `npm run deploy` de novo.

## Domínio próprio (opcional)

Se você comprar um domínio próprio (ex: `printmixx.com.br`), pode apontá-lo para o GitHub
Pages criando um arquivo `public/CNAME` com o domínio dentro, e configurando o DNS conforme a
[documentação do GitHub Pages](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site).
