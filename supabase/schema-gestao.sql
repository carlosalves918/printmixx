-- Rode este script inteiro no SQL Editor do Supabase (Passo 3 do README)

create table if not exists insumos (
  id text primary key,
  nome text not null,
  unidade text not null,
  custo numeric not null default 0
);

create table if not exists produtos_custeio (
  id text primary key,
  nome text not null
);

create table if not exists composicao (
  id text primary key,
  produto_id text references produtos_custeio(id) on delete cascade,
  insumo_id text references insumos(id) on delete cascade,
  qtd numeric not null default 0
);

create table if not exists precificacao (
  produto_id text primary key references produtos_custeio(id) on delete cascade,
  margem numeric not null default 0.65,
  preco_praticado numeric not null default 0
);

create table if not exists pedidos (
  id text primary key,
  cliente text,
  canal text,
  itens text,
  total numeric,
  status text,
  data text
);

create table if not exists produtos_estoque (
  id text primary key,
  nome text not null,
  categoria text not null,
  estoque numeric not null default 0,
  minimo numeric not null default 0,
  custo numeric not null default 0,
  preco numeric not null default 0,
  unidade text not null default 'un'
);

-- Habilita RLS (Row Level Security) em todas as tabelas
alter table insumos enable row level security;
alter table produtos_custeio enable row level security;
alter table composicao enable row level security;
alter table precificacao enable row level security;
alter table pedidos enable row level security;
alter table produtos_estoque enable row level security;

-- ATENÇÃO: essas políticas liberam leitura/escrita para qualquer pessoa que tenha
-- a URL + chave anônima do seu projeto (ninguém além de você terá essa chave se
-- você não publicá-la). Ok para uso pessoal/MEI. Se um dia quiser login com senha,
-- me avise que eu adiciono Supabase Auth e troco essas políticas por regras por usuário.

create policy "permitir tudo - insumos" on insumos for all using (true) with check (true);
create policy "permitir tudo - produtos_custeio" on produtos_custeio for all using (true) with check (true);
create policy "permitir tudo - composicao" on composicao for all using (true) with check (true);
create policy "permitir tudo - precificacao" on precificacao for all using (true) with check (true);
create policy "permitir tudo - pedidos" on pedidos for all using (true) with check (true);
create policy "permitir tudo - produtos_estoque" on produtos_estoque for all using (true) with check (true);

-- Dados iniciais (mesmos do protótipo) — rode depois de criar as tabelas acima

insert into insumos (id, nome, unidade, custo) values
  ('ins-01', 'Papel fotográfico adesivo A4 (topper/tags)', 'folha', 0.35),
  ('ins-02', 'Cartolina / papel cartão A4 (tags)', 'folha', 0.45),
  ('ins-03', 'Folha EVA 40x60cm 2mm', 'folha', 4.5),
  ('ins-04', 'Placa MDF 3mm (30x30cm aprox.)', 'placa', 11.0),
  ('ins-05', 'Fita de cetim (10-15mm)', 'metro', 0.5),
  ('ins-06', 'Saquinho celofane/organza', 'un', 0.4),
  ('ins-07', 'Impressão colorida (jato/laser)', 'impressão', 0.4),
  ('ins-08', 'Cola quente (bastão, por peça)', 'un', 0.2),
  ('ins-09', 'Vela lisa (base p/ personalizar)', 'un', 1.5),
  ('ins-10', 'Copo plástico/acrílico liso 350ml', 'un', 3.2),
  ('ins-11', 'Mão de obra', 'hora', 28.0)
on conflict (id) do nothing;

insert into produtos_custeio (id, nome) values
  ('pc-01', 'Topo de Bolo Personalizado'),
  ('pc-02', 'Kit Festa Completo (topo+tags+painel mini)'),
  ('pc-03', 'Lembrancinha Personalizada (saquinho)'),
  ('pc-04', 'Painel de Festa 1,5x1,5m'),
  ('pc-05', 'Convite Digital Personalizado'),
  ('pc-06', 'Tag Agradecimento (cartão)'),
  ('pc-07', 'Vela Personalizada de Aniversário'),
  ('pc-08', 'Copo Personalizado 350ml')
on conflict (id) do nothing;

insert into composicao (id, produto_id, insumo_id, qtd) values
  ('ci-01','pc-01','ins-01',1), ('ci-02','pc-01','ins-07',1), ('ci-03','pc-01','ins-08',1), ('ci-04','pc-01','ins-11',0.1),
  ('ci-05','pc-02','ins-01',2), ('ci-06','pc-02','ins-02',5), ('ci-07','pc-02','ins-03',2), ('ci-08','pc-02','ins-07',3),
  ('ci-09','pc-02','ins-05',2), ('ci-10','pc-02','ins-08',3), ('ci-11','pc-02','ins-11',0.6),
  ('ci-12','pc-03','ins-06',1), ('ci-13','pc-03','ins-02',1), ('ci-14','pc-03','ins-05',0.3), ('ci-15','pc-03','ins-11',0.05),
  ('ci-16','pc-04','ins-03',6), ('ci-17','pc-04','ins-07',4), ('ci-18','pc-04','ins-05',3), ('ci-19','pc-04','ins-11',1.5),
  ('ci-20','pc-05','ins-11',0.03),
  ('ci-21','pc-06','ins-02',1), ('ci-22','pc-06','ins-07',0.25), ('ci-23','pc-06','ins-11',0.02),
  ('ci-24','pc-07','ins-09',1), ('ci-25','pc-07','ins-01',1), ('ci-26','pc-07','ins-11',0.1),
  ('ci-27','pc-08','ins-10',1), ('ci-28','pc-08','ins-01',0.5), ('ci-29','pc-08','ins-11',0.05)
on conflict (id) do nothing;

insert into precificacao (produto_id, margem, preco_praticado) values
  ('pc-01', 0.65, 12.9),
  ('pc-02', 0.65, 69.9),
  ('pc-03', 0.65, 4.9),
  ('pc-04', 0.65, 129.9),
  ('pc-05', 0.8, 14.9),
  ('pc-06', 0.65, 1.5),
  ('pc-07', 0.65, 14.9),
  ('pc-08', 0.65, 12.9)
on conflict (produto_id) do nothing;

insert into pedidos (id, cliente, canal, itens, total, status, data) values
  ('#10482', 'Marina Ferreira', 'Shopee', 'Kit Festa Completo x1', 69.9, 'aguardando_nf', '20/07 09:14'),
  ('#10481', 'loja.decora_sp', 'TikTok Shop', 'Topo de Bolo x3', 38.7, 'emitida', '20/07 08:52'),
  ('#10480', 'Carlos Nogueira', 'Loja própria', 'Painel de Festa 1,5x1,5m', 129.9, 'emitida', '19/07 18:20'),
  ('#10479', 'ana.papelaria_rj', 'TikTok Shop', 'Lembrancinha x20', 98.0, 'erro', '19/07 17:03'),
  ('#10478', 'Rafael Souza', 'Shopee', 'Copo Personalizado x10', 129.0, 'aguardando_nf', '19/07 15:41'),
  ('#10477', 'Beatriz Lima', 'Shopee', 'Convite Digital x30', 90.0, 'emitida', '19/07 11:09')
on conflict (id) do nothing;

insert into produtos_estoque (id, nome, categoria, estoque, minimo, custo, preco, unidade) values
  ('PF-001', 'Topo de Bolo Personalizado', 'Festa', 8, 15, 2.9, 12.9, 'un'),
  ('PF-002', 'Kit Festa Completo (topo+tags+painel mini)', 'Festa', 5, 10, 24.5, 69.9, 'kit'),
  ('PF-003', 'Lembrancinha Personalizada (saquinho)', 'Festa', 140, 50, 1.4, 4.9, 'un'),
  ('PF-004', 'Painel de Festa 1,5x1,5m', 'Festa', 3, 6, 38.0, 129.9, 'un'),
  ('GR-001', 'Cartão de Visita (250un)', 'Gráfica', 6, 10, 28.0, 79.9, 'lote'),
  ('GR-002', 'Banner Lona 90x60cm', 'Gráfica', 3, 8, 22.0, 59.9, 'un'),
  ('GR-003', 'Adesivo Vinil Recorte (folha A4)', 'Gráfica', 42, 20, 3.1, 9.9, 'folha'),
  ('PP-001', 'Caderno Personalizado A5', 'Papelaria', 8, 15, 12.4, 34.9, 'un'),
  ('PP-002', 'Kit Caneta + Bloco de Notas', 'Papelaria', 65, 25, 4.8, 14.9, 'kit'),
  ('PP-003', 'Planner Personalizado 2026', 'Papelaria', 14, 15, 18.5, 49.9, 'un'),
  ('AC-001', 'Carregador Turbo USB-C 20W', 'Acessórios', 22, 15, 19.9, 39.9, 'un'),
  ('AC-002', 'Suporte Veicular Magnético', 'Acessórios', 9, 12, 14.5, 32.9, 'un'),
  ('AC-003', 'Cabo USB-C Reforçado 1m', 'Acessórios', 30, 20, 6.2, 16.9, 'un')
on conflict (id) do nothing;
