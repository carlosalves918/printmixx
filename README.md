# Print Mixx — site + painel de gestão (um projeto só)

Este projeto junta os dois sistemas que existiam separados:

- a **fan page / site institucional** (o que qualquer visitante vê);
- o **painel de gestão** (dashboard, estoque, pedidos, precificação e a
  tabela de preços), escondido atrás do ícone de cadeado 🔒 no header, que
  só abre com o token de acesso da equipe.

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
│       ├── Equipe.jsx           # tela de login (token) + porta de entrada do painel
│       ├── GestaoApp.jsx        # dashboard completo (estoque, pedidos, precificação...)
│       ├── PrecosTab.jsx        # a Tabela de Preços, como uma aba do painel
│       ├── supabaseGestaoClient.js
│       └── gestao-tailwind.css  # Tailwind isolado, usado só dentro do painel
├── tailwind.config.js         # Tailwind escaneia só src/gestao — não mexe na fan page
└── vercel.json
```

## Como o cadeado funciona

1. O ícone de cadeado no header leva para `/equipe`.
2. Lá, pede um **token de acesso** (uma senha só da equipe).
3. O token é conferido pela função serverless `api/prices.js`, que roda no
   servidor da Vercel — o token nunca fica exposto no código do site.
4. Validado uma vez, dá acesso ao painel inteiro: Dashboard, Estoque,
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

## Configurando o cadeado e a Tabela de Preços (obrigatório)

A Tabela de Preços (e o próprio login do `/equipe`) depende de um banco
Supabase e de variáveis de ambiente. Sem isso, `/equipe` carrega mas o login
sempre dá erro — é esperado.

1. Crie uma conta gratuita em [supabase.com](https://supabase.com) → **New
   project**.
2. No **SQL Editor**, rode:

   ```sql
   create table prices (
     id uuid primary key default gen_random_uuid(),
     category text not null,
     item text not null,
     price text not null default '',
     notes text default '',
     updated_at timestamptz not null default now()
   );

   alter table prices enable row level security;
   ```

3. Em **Project Settings → API**, copie a **Project URL** e a **service_role
   key** (a secreta, não a `anon public`).
4. Escolha um **token de acesso** forte para a equipe (20+ caracteres).
5. Configure essas 3 variáveis de ambiente (na Vercel: **Settings →
   Environment Variables**; localmente: crie um arquivo `.env` a partir de
   `.env.example`):

   | Nome | Valor |
   |---|---|
   | `TEAM_ACCESS_TOKEN` | o token escolhido no passo 4 |
   | `SUPABASE_URL` | a Project URL |
   | `SUPABASE_SERVICE_KEY` | a service_role key |

Pronto: `/equipe` → digitar o token → acesso liberado ao painel e à Tabela
de Preços.

## Configurando o resto do painel (opcional)

Dashboard, Estoque, Insumos, Composição de Custo, Precificação, Vendas,
Clientes e Notas Fiscais funcionam **sem nenhuma configuração extra** — usam
dados de exemplo que ficam só na memória do navegador enquanto a aba está
aberta. Se quiser que esses dados sejam salvos de verdade entre uma visita e
outra:

1. No mesmo projeto Supabase do passo anterior (ou um novo), rode o script
   `supabase/schema-gestao.sql` inteiro no **SQL Editor**.
2. Em **Project Settings → API**, copie a **Project URL** e a **anon
   public key** (essa é a pública, diferente da service_role usada acima).
3. Configure mais duas variáveis de ambiente:

   | Nome | Valor |
   |---|---|
   | `VITE_SUPABASE_URL` | a Project URL |
   | `VITE_SUPABASE_ANON_KEY` | a anon public key |

Sem login extra: quem já passou pelo token do `/equipe` tem acesso a essa
parte também. Se algum dia quiser um login individual por funcionário nessa
parte específica, dá pra adicionar depois (Supabase Auth resolve isso).

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

- A **Tabela de Preços** e o **login do `/equipe`** são seguros de verdade:
  o token só é conferido no servidor (`api/prices.js`), e a chave do banco
  nunca chega ao navegador do visitante.
- O restante do painel de gestão (estoque, pedidos, precificação) é uma
  ferramenta interna de uso único-usuário: qualquer pessoa com o token entra
  em tudo. Ótimo para uso pessoal/uma equipe pequena de confiança; se um dia
  precisar de permissões diferentes por pessoa, isso dá pra evoluir depois.
