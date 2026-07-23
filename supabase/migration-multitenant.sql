-- MIGRAÇÃO: transforma o banco single-tenant que você já tem (com os dados
-- reais da Print Mixx) num banco multi-tenant, sem perder nada.
--
-- Rode este script INTEIRO, de uma vez, no SQL Editor do Supabase do projeto
-- que você já usa hoje. Não rode schema-gestao.sql por cima deste banco —
-- ele é só para quem está começando do zero.
--
-- Pré-requisito: a tabela "prices" já precisa existir (você criou ela
-- manualmente seguindo o README antigo). Se você nunca configurou a Tabela
-- de Preços, comente/remova as linhas que mexem em "prices" abaixo.

create extension if not exists pgcrypto;

create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  criado_em timestamptz not null default now()
);

create table if not exists tenant_users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  papel text not null default 'dono',
  criado_em timestamptz not null default now(),
  unique (tenant_id, user_id)
);

-- Cria o tenant "Print Mixx" e migra todos os dados existentes pra ele
do $$
declare
  v_tenant_id uuid;
begin
  insert into tenants (nome) values ('Print Mixx') returning id into v_tenant_id;

  alter table insumos add column if not exists tenant_id uuid;
  alter table produtos_custeio add column if not exists tenant_id uuid;
  alter table composicao add column if not exists tenant_id uuid;
  alter table precificacao add column if not exists tenant_id uuid;
  alter table pedidos add column if not exists tenant_id uuid;
  alter table produtos_estoque add column if not exists tenant_id uuid;
  alter table categorias add column if not exists tenant_id uuid;
  alter table canais add column if not exists tenant_id uuid;

  update insumos set tenant_id = v_tenant_id where tenant_id is null;
  update produtos_custeio set tenant_id = v_tenant_id where tenant_id is null;
  update composicao set tenant_id = v_tenant_id where tenant_id is null;
  update precificacao set tenant_id = v_tenant_id where tenant_id is null;
  update pedidos set tenant_id = v_tenant_id where tenant_id is null;
  update produtos_estoque set tenant_id = v_tenant_id where tenant_id is null;
  update categorias set tenant_id = v_tenant_id where tenant_id is null;
  update canais set tenant_id = v_tenant_id where tenant_id is null;

  -- Só mexe em "prices" se ela já existir nesse banco
  if to_regclass('public.prices') is not null then
    execute 'alter table prices add column if not exists tenant_id uuid';
    execute 'update prices set tenant_id = $1 where tenant_id is null' using v_tenant_id;
  end if;

  raise notice 'Tenant "Print Mixx" criado com id: %', v_tenant_id;
end $$;

-- Torna tenant_id obrigatório e ajusta as chaves primárias
alter table insumos alter column tenant_id set not null;
alter table produtos_custeio alter column tenant_id set not null;
alter table composicao alter column tenant_id set not null;
alter table precificacao alter column tenant_id set not null;
alter table pedidos alter column tenant_id set not null;
alter table produtos_estoque alter column tenant_id set not null;
alter table categorias alter column tenant_id set not null;
alter table canais alter column tenant_id set not null;

alter table insumos add constraint insumos_tenant_fkey foreign key (tenant_id) references tenants(id) on delete cascade;
alter table produtos_custeio add constraint produtos_custeio_tenant_fkey foreign key (tenant_id) references tenants(id) on delete cascade;
alter table composicao add constraint composicao_tenant_fkey foreign key (tenant_id) references tenants(id) on delete cascade;
alter table precificacao add constraint precificacao_tenant_fkey foreign key (tenant_id) references tenants(id) on delete cascade;
alter table pedidos add constraint pedidos_tenant_fkey foreign key (tenant_id) references tenants(id) on delete cascade;
alter table produtos_estoque add constraint produtos_estoque_tenant_fkey foreign key (tenant_id) references tenants(id) on delete cascade;
alter table categorias add constraint categorias_tenant_fkey foreign key (tenant_id) references tenants(id) on delete cascade;
alter table canais add constraint canais_tenant_fkey foreign key (tenant_id) references tenants(id) on delete cascade;

alter table insumos drop constraint insumos_pkey, add primary key (tenant_id, id);
alter table produtos_custeio drop constraint produtos_custeio_pkey, add primary key (tenant_id, id);
alter table composicao drop constraint composicao_pkey, add primary key (tenant_id, id);
alter table precificacao drop constraint precificacao_pkey, add primary key (tenant_id, produto_id);
alter table pedidos drop constraint pedidos_pkey, add primary key (tenant_id, id);
alter table produtos_estoque drop constraint produtos_estoque_pkey, add primary key (tenant_id, id);
alter table categorias drop constraint categorias_pkey, add primary key (tenant_id, id);
alter table canais drop constraint canais_pkey, add primary key (tenant_id, id);

-- Corrige as foreign keys de composicao/precificacao pra apontar pro par (tenant_id, id)
alter table composicao drop constraint if exists composicao_produto_id_fkey;
alter table composicao drop constraint if exists composicao_insumo_id_fkey;
alter table composicao add constraint composicao_produto_fkey foreign key (tenant_id, produto_id) references produtos_custeio (tenant_id, id) on delete cascade;
alter table composicao add constraint composicao_insumo_fkey foreign key (tenant_id, insumo_id) references insumos (tenant_id, id) on delete cascade;

alter table precificacao drop constraint if exists precificacao_produto_id_fkey;
alter table precificacao add constraint precificacao_produto_fkey foreign key (tenant_id, produto_id) references produtos_custeio (tenant_id, id) on delete cascade;

-- Ajusta "prices" (se existir)
do $$
begin
  if to_regclass('public.prices') is not null then
    execute 'alter table prices alter column tenant_id set not null';
    execute 'alter table prices add constraint prices_tenant_fkey foreign key (tenant_id) references tenants(id) on delete cascade';
  end if;
end $$;

-- Função auxiliar usada nas políticas de RLS abaixo
create or replace function public.tenant_ids_do_usuario()
returns setof uuid
language sql
stable
as $$
  select tenant_id from tenant_users where user_id = auth.uid()
$$;

-- Troca as políticas antigas ("permitir tudo") pelas novas, restritas por tenant
drop policy if exists "permitir tudo - insumos" on insumos;
drop policy if exists "permitir tudo - produtos_custeio" on produtos_custeio;
drop policy if exists "permitir tudo - composicao" on composicao;
drop policy if exists "permitir tudo - precificacao" on precificacao;
drop policy if exists "permitir tudo - pedidos" on pedidos;
drop policy if exists "permitir tudo - produtos_estoque" on produtos_estoque;
drop policy if exists "permitir tudo - categorias" on categorias;
drop policy if exists "permitir tudo - canais" on canais;

alter table tenants enable row level security;
alter table tenant_users enable row level security;

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

do $$
begin
  if to_regclass('public.prices') is not null then
    execute 'alter table prices enable row level security';
    execute 'create policy "acesso por tenant - prices" on prices for all using (tenant_id in (select tenant_ids_do_usuario())) with check (tenant_id in (select tenant_ids_do_usuario()))';
  end if;
end $$;

-- ---------- ÚLTIMO PASSO (faça DEPOIS de logar uma vez pelo /equipe) ----------
-- 1. Acesse /equipe no site, clique em "Ainda não tem conta? Criar uma",
--    cadastre-se com seu e-mail e senha.
-- 2. Quando o painel pedir o nome da gráfica, pode criar qualquer nome
--    temporário (ex: "temp") — vamos substituir pelo tenant real agora.
-- 3. Volte aqui e rode o bloco abaixo, trocando 'seu-email@aqui.com' pelo
--    e-mail que você usou para criar a conta. Isso te conecta como DONO
--    da gráfica "Print Mixx" que já tem todos os dados migrados acima.

-- insert into tenant_users (tenant_id, user_id, papel)
-- select t.id, u.id, 'dono'
-- from tenants t, auth.users u
-- where t.nome = 'Print Mixx' and u.email = 'seu-email@aqui.com'
-- on conflict (tenant_id, user_id) do nothing;

-- 4. Depois disso, pode remover (delete) o tenant temporário "temp" e o
--    vínculo antigo em tenant_users, se quiser limpar.
