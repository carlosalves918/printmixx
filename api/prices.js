// Função serverless da Vercel — roda no servidor, nunca no navegador.
// Agora a autenticação é a mesma do resto do painel: cada usuário loga com
// e-mail/senha (Supabase Auth) e essa função confere o token de sessão dele,
// descobre a qual gráfica (tenant) ele pertence, e só deixa ver/editar os
// preços dessa gráfica.
//
// Variáveis de ambiente que precisam existir no projeto da Vercel:
//   SUPABASE_URL          -> URL do projeto Supabase (mesmo projeto do login)
//   SUPABASE_SERVICE_KEY  -> a service_role key do Supabase (NUNCA a anon key aqui)

import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  })
}

// Confere o token de sessão do usuário e devolve o tenant_id da gráfica dele
// (ou null se o token for inválido ou o usuário não pertencer a nenhuma gráfica).
async function getTenantId(supabase, req) {
  const auth = req.headers.authorization || ''
  const accessToken = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!accessToken) return null

  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken)
  if (userError || !userData?.user) return null

  const { data: membership } = await supabase
    .from('tenant_users')
    .select('tenant_id')
    .eq('user_id', userData.user.id)
    .limit(1)
    .maybeSingle()

  return membership?.tenant_id || null
}

export default async function handler(req, res) {
  const supabase = getSupabase()
  const tenantId = await getTenantId(supabase, req)

  if (!tenantId) {
    res.status(401).json({ error: 'Sessão inválida ou sem gráfica associada.' })
    return
  }

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('prices')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('category', { ascending: true })
        .order('item', { ascending: true })
      if (error) throw error
      res.status(200).json({ items: data })
      return
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      const { id, category, item, price, notes } = body || {}
      if (!category || !item) {
        res.status(400).json({ error: 'Categoria e item são obrigatórios.' })
        return
      }
      const row = { category, item, price: price || '', notes: notes || '', tenant_id: tenantId }
      let result
      if (id) {
        result = await supabase.from('prices').update(row).eq('id', id).eq('tenant_id', tenantId).select().single()
      } else {
        result = await supabase.from('prices').insert(row).select().single()
      }
      if (result.error) throw result.error
      res.status(200).json({ item: result.data })
      return
    }

    if (req.method === 'DELETE') {
      const id = req.query?.id
      if (!id) {
        res.status(400).json({ error: 'id é obrigatório.' })
        return
      }
      const { error } = await supabase.from('prices').delete().eq('id', id).eq('tenant_id', tenantId)
      if (error) throw error
      res.status(200).json({ ok: true })
      return
    }

    res.status(405).json({ error: 'Método não suportado.' })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Erro interno.' })
  }
}
