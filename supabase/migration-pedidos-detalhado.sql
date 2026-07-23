-- Adiciona ao pedido os campos de cliente (telefone, endereço) e a lista
-- detalhada de itens (produto, unidade, valor unitário, quantidade), usada
-- pelo novo modal de "Detalhes / PDF" na aba Vendas.
-- Rode isso DEPOIS de já ter rodado migration-multitenant.sql.

alter table pedidos add column if not exists telefone text;
alter table pedidos add column if not exists endereco text;
alter table pedidos add column if not exists itens_lista text;
