# Print Mixx — site + painel de gestão (um projeto só)

Este projeto junta os dois sistemas que existiam separados:

- a **fan page / site institucional** (o que qualquer visitante vê);
- o **painel de gestão** (dashboard, estoque, pedidos, precificação e a
  tabela de preços), escondido atrás do ícone de cadeado 🔒 no header, que
  agora pede login de verdade (e-mail + senha) em vez de um token
  compartilhado — e cada conta pertence a uma "gráfica" (tenant), pensado
  pra um dia dar pra vender este mesmo painel pra outras gráficas.

Tudo roda como um único app React (Vite), publicado como um único projeto na
Vercel.

## Estrutura do projeto

```
printmixx-unified/
├── api/
│   └── prices.js            # função serverless: confere o token e fala com o Supabase
├── supabase/
│   └── schema-gestao.sql    # tabelas opcionais do painel de gestão (estoque, pedidos etc.)
├── src/
│   ├── main.jsx
│   ├── App.jsx               # decide: site público OU /equipe
│   ├── index.css             # estilos da fan page + estilos da tabela de preços
│   ├── siteConfig.js         # WhatsApp, Instagram, endereço e horário
│   ├── assets/                # logo, fotos
│   ├── components/            # seções da fan page (Header, Hero, Galeria, etc.)
│   └── gestao/                 # tudo que fica atrás do cadeado
│       ├── Equipe.jsx           # login (e-mail/senha) + onboarding da gráfica
│       ├── GestaoApp.jsx        # dashboard completo (estoque, pedidos, precificação...)
│       ├── PrecosTab.jsx        # a Tabela de Preços, como uma aba do painel
│       ├── supabaseGestaoClient.js
│       └── gestao-tailwind.css  # Tailwind isolado, usado só dentro do painel
├── tailwind.config.js         # Tailwind escaneia só src/gestao — não mexe na fan page
└── vercel.json
```

## Como o login funciona agora

1. O ícone de cadeado no header leva para `/equipe`.
2. Lá, cada pessoa faz login com **e-mail e senha** (Supabase Auth) — ou
   cria uma conta nova, se ainda não tiver.
3. No primeiro acesso, quem ainda não pertence a nenhuma gráfica cria uma
   (é o "tenant" — pode ser o nome da sua própria gráfica). A partir daí,
   todos os dados que essa conta grava ficam isolados dessa gráfica: se
   você um dia vender este sistema pra outra gráfica, ela cria a conta dela
   e nunca vê os dados da Print Mixx (nem vice-versa).
4. Validado, dá acesso ao painel inteiro: Dashboard, Cadastros, Estoque,
   Insumos, Composição de Custo, Precificação, **Tabela de Preços**, Vendas,
   Clientes, Custos e Notas Fiscais — tudo dentro do mesmo menu lateral.

## Rodando localmente

Precisa do [Node.js](https://nodejs.org) 18+.

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. O site público funciona sem nenhuma
configuração extra. Para testar o `/equipe`, configure as variáveis de
ambiente abaixo primeiro.

## Configurando o login e o painel (obrigatório)

Diferente de antes, isso deixou de ser opcional: sem o Supabase configurado,
`/equipe` nem mostra o formulário de login.

1. Crie uma conta gratuita em [supabase.com](https://supabase.com) → **New
   project** (ou use um projeto que você já tenha).
2. No **SQL Editor**:
   - Se é um projeto **novo**, rode o script `supabase/schema-gestao.sql`
     inteiro.
   - Se você **já tinha** o painel rodando com a versão antiga (token único,
     dados reais salvos), rode `supabase/migration-multitenant.sql` no lugar
     — ele faz o upgrade preservando tudo que já existe. Leia os comentários
     no final do arquivo: tem um passo manual pra você virar "dono" da
     gráfica depois de criar sua conta.
3. Em **Authentication → Providers → Email**, confira se "Confirm email"
   está do jeito que você quer: **ligado** exige que a pessoa clique num
   link enviado por e-mail antes do primeiro login (mais seguro, mas
   depende do Supabase conseguir mandar e-mail); **desligado** deixa entrar
   na hora, direto após criar a conta (mais simples pra uso interno/testes).
4. Em **Project Settings → API**, copie a **Project URL** e a **anon
   public key**.
5. Em **Project Settings → API**, copie também a **service_role key** (a
   secreta — usada só no servidor, nunca no navegador).
6. Configure essas variáveis de ambiente (na Vercel: **Settings →
   Environment Variables**; localmente: crie um arquivo `.env` a partir de
   `.env.example`):

   | Nome | Valor |
   |---|---|
   | `VITE_SUPABASE_URL` | a Project URL |
   | `VITE_SUPABASE_ANON_KEY` | a anon public key |
   | `SUPABASE_URL` | a mesma Project URL |
   | `SUPABASE_SERVICE_KEY` | a service_role key |

7. Acesse `/equipe`, clique em "Ainda não tem conta? Criar uma", cadastre-se
   e crie o nome da sua gráfica quando for pedido. Se você estava migrando
   dados antigos (passo 2), não esqueça o passo manual do final do
   `migration-multitenant.sql`.

## Editando conteúdo da fan page

- **WhatsApp, Instagram, endereço e horário**: `src/siteConfig.js`.
- **Textos de cada seção**: componentes em `src/components/`.
- **Cores e estilos da fan page**: `src/index.css` (variáveis em `:root`).
- **Imagens**: troque os arquivos em `src/assets/` mantendo o nome, ou
  importe um novo arquivo no componente correspondente.

## Publicando na Vercel

1. Suba este projeto para um repositório no GitHub.
2. Em [vercel.com](https://vercel.com) → **Add New → Project** → importe o
   repositório.
3. A Vercel detecta sozinha que é Vite/React. Antes de clicar em **Deploy**,
   adicione as variáveis de ambiente da seção acima.
4. Deploy. Toda vez que der `git push`, a Vercel publica a nova versão
   automaticamente.

## Sobre segurança

- O login do `/equipe` é feito pelo Supabase Auth (e-mail + senha) — nada de
  token compartilhado. A função serverless `api/prices.js` confere o token
  de sessão de cada usuário e só mostra/edita os preços da gráfica dele.
- Cada gráfica (tenant) só enxerga os próprios dados: isso é garantido pelo
  Row Level Security (RLS) do Postgres, não só pelo código do front-end —
  mesmo que alguém tente burlar a tela, o banco recusa qualquer leitura ou
  escrita fora do tenant do usuário logado.
- Dentro de uma mesma gráfica, por enquanto todo mundo que faz parte dela
  (papel "dono", "operador" ou "financeiro") tem acesso a tudo — dá pra
  restringir por papel depois, se precisar.
