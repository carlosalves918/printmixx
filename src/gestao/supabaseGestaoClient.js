// Cliente Supabase do painel de gestão (estoque, insumos, pedidos, precificação)
// e também do login da equipe (Supabase Auth). Diferente de antes, essas
// variáveis deixaram de ser opcionais: sem elas, ninguém consegue logar em
// /equipe, porque é daqui que vem tanto a autenticação quanto os dados.
//
// Variáveis de ambiente (Vite), configure na Vercel/local .env:
//   VITE_SUPABASE_URL
//   VITE_SUPABASE_ANON_KEY
//
// Ver supabase/schema-gestao.sql (instalação nova) ou
// supabase/migration-multitenant.sql (upgrade de um banco já existente).

import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const gestaoSupabaseConfigured = Boolean(url && anonKey)

export const supabaseGestao = gestaoSupabaseConfigured
  ? createClient(url, anonKey)
  : null
