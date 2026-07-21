// Função serverless da Vercel — roda no servidor, nunca no navegador.
// É aqui (e só aqui) que o token da equipe e a chave do banco de dados ficam
// guardados, lidos das variáveis de ambiente da Vercel. Nada disso entra no
// código que é enviado para o navegador do visitante do site.
//
// Variáveis de ambiente que precisam existir no projeto da Vercel:
//   TEAM_ACCESS_TOKEN     -> o "token" que a equipe digita para entrar em /equipe
//   SUPABASE_URL          -> URL do projeto Supabase (ex: https://xxxx.supabase.co)
//   SUPABASE_SERVICE_KEY  -> a service_role key do Supabase (NUNCA a anon key aqui)
//
// Ver SETUP-PRECOS.md na raiz do projeto para o passo a passo completo.

import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  })
}

function checkToken(req) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  return Boolean(process.env.TEAM_ACCESS_TOKEN) && token === process.env.TEAM_ACCESS_TOKEN
}

export default async function handler(req, res) {
  if (!checkToken(req)) {
    res.status(401).json({ error: 'Token inválido.' })
    return
  }

  const supabase = getSupabase()

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('prices')
        .select('*')
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
      const row = { category, item, price: price || '', notes: notes || '' }
      let result
      if (id) {
        result = await supabase.from('prices').update(row).eq('id', id).select().single()
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
      const { error } = await supabase.from('prices').delete().eq('id', id)
      if (error) throw error
      res.status(200).json({ ok: true })
      return
    }

    res.status(405).json({ error: 'Método não suportado.' })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Erro interno.' })
  }
}
