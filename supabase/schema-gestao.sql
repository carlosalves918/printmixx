-- Rode este script inteiro no SQL Editor do Supabase (Passo 3 do README).
-- Versão multi-tenant: cada gráfica (tenant) só enxerga os próprios dados.
-- Se você já tinha rodado uma versão antiga deste script num projeto com
-- dados de verdade, NÃO rode este arquivo por cima — use
-- supabase/migration-multitenant.sql, que faz o upgrade sem perder nada.

create extension if not exists pgcrypto;

-- ---------- Tenants (cada "gráfica" cadastrada no sistema) ----------
create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  criado_em timestamptz not null default now()
);

create table if not exists tenant_users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  papel text not null default 'dono', -- dono | operador | financeiro
  criado_em timestamptz not null default now(),
  unique (tenant_id, user_id)
);

-- Função auxiliar: devolve os tenants aos quais o usuário logado pertence.
-- Usada em todas as políticas de RLS abaixo, pra não repetir a mesma
-- subquery em cada tabela.
create or replace function public.tenant_ids_do_usuario()
returns setof uuid
language sql
stable
as $$
  select tenant_id from tenant_users where user_id = auth.uid()
$$;

-- Funções de gerenciamento de equipe (convidar/listar/remover colegas da
-- mesma gráfica). Ver detalhes de cada uma em migration-equipe.sql.
create or replace function public.listar_membros()
returns table (user_id uuid, email text, papel text, criado_em timestamptz)
language sql
security definer
stable
as $$
  select tu.user_id, au.email, tu.papel, tu.criado_em
  from tenant_users tu
  join auth.users au on au.id = tu.user_id
  where tu.tenant_id in (select tenant_ids_do_usuario())
  order by tu.criado_em asc
$$;

create or replace function public.convidar_membro(p_email text, p_papel text default 'operador')
returns text
language plpgsql
security definer
as $$
declare
  v_tenant_id uuid;
  v_user_id uuid;
begin
  select tenant_id into v_tenant_id from tenant_users where user_id = auth.uid() and papel = 'dono' limit 1;
  if v_tenant_id is null then
    raise exception 'Só o dono da gráfica pode convidar novos membros.';
  end if;

  select id into v_user_id from auth.users where email = p_email limit 1;
  if v_user_id is null then
    raise exception 'Não existe nenhuma conta com esse e-mail. Peça pra pessoa criar uma conta em /equipe primeiro.';
  end if;

  insert into tenant_users (tenant_id, user_id, papel)
  values (v_tenant_id, v_user_id, coalesce(p_papel, 'operador'))
  on conflict (tenant_id, user_id) do update set papel = excluded.papel;

  return 'ok';
end;
$$;

create or replace function public.remover_membro(p_user_id uuid)
returns text
language plpgsql
security definer
as $$
declare
  v_tenant_id uuid;
begin
  select tenant_id into v_tenant_id from tenant_users where user_id = auth.uid() and papel = 'dono' limit 1;
  if v_tenant_id is null then
    raise exception 'Só o dono da gráfica pode remover membros.';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'Você não pode remover a si mesmo.';
  end if;
  delete from tenant_users where tenant_id = v_tenant_id and user_id = p_user_id;
  return 'ok';
end;
$$;

grant execute on function public.listar_membros() to authenticated;
grant execute on function public.convidar_membro(text, text) to authenticated;
grant execute on function public.remover_membro(uuid) to authenticated;

-- ---------- Tabelas do painel (todas com tenant_id) ----------
create table if not exists insumos (
  id text not null,
  tenant_id uuid not null references tenants(id) on delete cascade,
  nome text not null,
  unidade text not null,
  custo numeric not null default 0,
  primary key (tenant_id, id)
);

create table if not exists produtos_custeio (
  id text not null,
  tenant_id uuid not null references tenants(id) on delete cascade,
  nome text not null,
  primary key (tenant_id, id)
);

create table if not exists composicao (
  id text not null,
  tenant_id uuid not null references tenants(id) on delete cascade,
  produto_id text not null,
  insumo_id text not null,
  qtd numeric not null default 0,
  primary key (tenant_id, id),
  foreign key (tenant_id, produto_id) references produtos_custeio(tenant_id, id) on delete cascade,
  foreign key (tenant_id, insumo_id) references insumos(tenant_id, id) on delete cascade
);

create table if not exists precificacao (
  produto_id text not null,
  tenant_id uuid not null references tenants(id) on delete cascade,
  margem numeric not null default 0.65,
  preco_praticado numeric not null default 0,
  primary key (tenant_id, produto_id),
  foreign key (tenant_id, produto_id) references produtos_custeio(tenant_id, id) on delete cascade
);

create table if not exists pedidos (
  id text not null,
  tenant_id uuid not null references tenants(id) on delete cascade,
  cliente text,
  telefone text,
  endereco text,
  canal text,
  itens text,
  itens_lista text,
  total numeric,
  status text,
  data text,
  primary key (tenant_id, id)
);

create table if not exists produtos_estoque (
  id text not null,
  tenant_id uuid not null references tenants(id) on delete cascade,
  nome text not null,
  categoria text not null,
  estoque numeric not null default 0,
  minimo numeric not null default 0,
  custo numeric not null default 0,
  preco numeric not null default 0,
  unidade text not null default 'un',
  primary key (tenant_id, id)
);

create table if not exists categorias (
  id text not null,
  tenant_id uuid not null references tenants(id) on delete cascade,
  label text not null,
  icon text not null default 'Tags',
  color text not null default '#9333EA',
  primary key (tenant_id, id)
);

create table if not exists canais (
  id text not null,
  tenant_id uuid not null references tenants(id) on delete cascade,
  label text not null,
  color text not null default '#9333EA',
  primary key (tenant_id, id)
);

-- Tabela da Tabela de Preços pública (a mesma usada pela função serverless
-- api/prices.js). Se você já tinha essa tabela criada manualmente (README
-- antigo), não rode este create — use a migração.
create table if not exists prices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  category text not null,
  item text not null,
  price text not null default '',
  notes text default '',
  updated_at timestamptz not null default now()
);

-- ---------- RLS: cada tenant só vê e mexe nos próprios dados ----------
alter table tenants enable row level security;
alter table tenant_users enable row level security;
alter table insumos enable row level security;
alter table produtos_custeio enable row level security;
alter table composicao enable row level security;
alter table precificacao enable row level security;
alter table pedidos enable row level security;
alter table produtos_estoque enable row level security;
alter table categorias enable row level security;
alter table canais enable row level security;
alter table prices enable row level security;

create policy "ve tenants em que participa" on tenants for select using (id in (select tenant_ids_do_usuario()));
create policy "cria tenant (onboarding)" on tenants for insert with check (auth.uid() is not null);
create policy "edita tenant proprio" on tenants for update using (id in (select tenant_ids_do_usuario()));

create policy "ve membros do proprio tenant" on tenant_users for select using (tenant_id in (select tenant_ids_do_usuario()));
create policy "entra no proprio tenant (onboarding)" on tenant_users for insert with check (user_id = auth.uid() or tenant_id in (select tenant_ids_do_usuario()));
create policy "gerencia membros do proprio tenant" on tenant_users for update using (tenant_id in (select tenant_ids_do_usuario()));
create policy "remove membros do proprio tenant" on tenant_users for delete using (tenant_id in (select tenant_ids_do_usuario()));

create policy "acesso por tenant - insumos" on insumos for all using (tenant_id in (select tenant_ids_do_usuario())) with check (tenant_id in (select tenant_ids_do_usuario()));
create policy "acesso por tenant - produtos_custeio" on produtos_custeio for all using (tenant_id in (select tenant_ids_do_usuario())) with check (tenant_id in (select tenant_ids_do_usuario()));
create policy "acesso por tenant - composicao" on composicao for all using (tenant_id in (select tenant_ids_do_usuario())) with check (tenant_id in (select tenant_ids_do_usuario()));
create policy "acesso por tenant - precificacao" on precificacao for all using (tenant_id in (select tenant_ids_do_usuario())) with check (tenant_id in (select tenant_ids_do_usuario()));
create policy "acesso por tenant - pedidos" on pedidos for all using (tenant_id in (select tenant_ids_do_usuario())) with check (tenant_id in (select tenant_ids_do_usuario()));
create policy "acesso por tenant - produtos_estoque" on produtos_estoque for all using (tenant_id in (select tenant_ids_do_usuario())) with check (tenant_id in (select tenant_ids_do_usuario()));
create policy "acesso por tenant - categorias" on categorias for all using (tenant_id in (select tenant_ids_do_usuario())) with check (tenant_id in (select tenant_ids_do_usuario()));
create policy "acesso por tenant - canais" on canais for all using (tenant_id in (select tenant_ids_do_usuario())) with check (tenant_id in (select tenant_ids_do_usuario()));

-- "prices" não usa RLS via anon key (só a função serverless, com a service_role
-- key, mexe nela) — a política abaixo é só uma segunda camada de segurança,
-- caso a chave anônima algum dia seja usada diretamente contra essa tabela.
create policy "acesso por tenant - prices" on prices for all using (tenant_id in (select tenant_ids_do_usuario())) with check (tenant_id in (select tenant_ids_do_usuario()));

-- ---------- Dados de exemplo (rode só se quiser testar com uma gráfica fictícia) ----------
-- Isso aqui NÃO cria um usuário nem tenant sozinho — sirva-se apenas depois de
-- já ter feito login uma vez pelo /equipe (que cria seu tenant no onboarding).
-- Troque 'SEU_TENANT_ID_AQUI' pelo id que aparece na tabela "tenants" caso
-- queira popular com os produtos de exemplo do protótipo original.
