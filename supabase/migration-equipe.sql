-- Adiciona à conta de gráfica a possibilidade de convidar/remover colegas de
-- equipe (múltiplos usuários no mesmo tenant, com papéis diferentes).
-- Rode isso DEPOIS de já ter rodado migration-multitenant.sql (ou
-- schema-gestao.sql, se for instalação nova) — é só um complemento.

-- Lista os membros da(s) gráfica(s) do usuário logado, com e-mail (que ele
-- não conseguiria ler direto de auth.users por causa do RLS interno do
-- Supabase Auth).
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

-- Convida alguém que JÁ TENHA CONTA (feita em /equipe) pra entrar na mesma
-- gráfica do usuário logado. Só quem é "dono" pode convidar.
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

-- Remove alguém da gráfica. Só o "dono" pode remover, e ninguém remove a
-- si mesmo por aqui (evita ficar sem dono sem querer).
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
