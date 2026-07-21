# Painel de preços interno — como configurar

O painel fica em `seusite.com.br/equipe` e não aparece em nenhum lugar do
site público (sem link no menu, bloqueado no robots.txt). Só quem souber a
URL e tiver o token de acesso consegue entrar.

Como o site é estático (Vercel), os preços ficam guardados num banco de
dados separado (Supabase, gratuito) e o token nunca fica exposto no código —
ele mora só nas variáveis de ambiente da Vercel, verificado por uma função
que roda no servidor (`api/prices.js`).

Sem os 3 passos abaixo, a página `/equipe` carrega mas mostra erro de
autenticação — é normal, falta plugar o banco de dados.

## 1. Criar o banco de dados (Supabase — gratuito)

1. Crie uma conta em https://supabase.com e um novo projeto.
2. No painel do projeto, vá em **SQL Editor** e rode:

   ```sql
   create table prices (
     id uuid primary key default gen_random_uuid(),
     category text not null,
     item text not null,
     price text not null default '',
     notes text default '',
     updated_at timestamptz not null default now()
   );

   -- Bloqueia qualquer leitura/escrita direta do navegador.
   -- Só a função da Vercel (que usa a service_role key) consegue acessar.
   alter table prices enable row level security;
   ```

3. Vá em **Project Settings → API** e copie dois valores:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **service_role key** (na seção "Project API keys" — é a chave secreta,
     não a `anon public`; nunca coloque essa chave no código do site)

## 2. Criar o token de acesso da equipe

Escolha uma senha/token forte (ex: um gerador de senhas, 20+ caracteres).
É isso que os funcionários vão digitar em `/equipe`. Pode ser o mesmo token
para todo mundo, ou vocês trocam periodicamente.

## 3. Configurar as variáveis de ambiente na Vercel

No projeto na Vercel: **Settings → Environment Variables**, adicione:

| Nome | Valor |
|---|---|
| `SUPABASE_URL` | a Project URL copiada acima |
| `SUPABASE_SERVICE_KEY` | a service_role key copiada acima |
| `TEAM_ACCESS_TOKEN` | o token que vocês escolheram para a equipe |

Depois de salvar, faça um novo deploy (a Vercel costuma pedir um redeploy
para novas variáveis entrarem em vigor).

## Pronto — usando o painel

- Acesse `https://seusite.com.br/equipe`
- Digite o token
- Adicione, edite ou exclua linhas da tabela de preços — cada linha tem seu
  próprio botão "Salvar"
- O botão "Sair" limpa o acesso salvo naquele navegador

## Um aviso importante sobre "oculto ao público"

Nenhum dado de preço fica no código do site nem é enviado para o navegador
de quem não tem o token — ele só existe no Supabase, protegido pela função
que confere o token no servidor. Isso é bem mais seguro do que só "esconder"
a tabela na página.

Ainda assim, vale lembrar: qualquer pessoa que descubra ou vaze o token
consegue ver e editar os preços. Trate o token como uma senha — não envie
por lugares públicos, e troque-o (só editando a variável de ambiente na
Vercel) se desconfiar que vazou.
