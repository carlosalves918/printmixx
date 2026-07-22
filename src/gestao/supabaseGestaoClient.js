// Cliente Supabase do painel de gestão (estoque, insumos, pedidos, precificação).
// É independente do banco de preços públicos (/api/prices), que já tem seu próprio
// backend seguro. Este aqui é opcional: se as variáveis de ambiente abaixo não
// estiverem configuradas, o painel simplesmente funciona só com os dados de
// exemplo, sem gravar nada — nada quebra.
//
// Variáveis de ambiente (Vite), configure na Vercel/local .env:
//   VITE_SUPABASE_URL
//   VITE_SUPABASE_ANON_KEY
//
// Ver supabase/schema.sql (pasta gestao-schema/) para criar as tabelas.

import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const gestaoSupabaseConfigured = Boolean(url && anonKey)

export const supabaseGestao = gestaoSupabaseConfigured
  ? createClient(url, anonKey)
  : null
