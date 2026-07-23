import { useEffect, useState } from 'react'
import { supabaseGestao } from './supabaseGestaoClient'

async function getAccessToken() {
  const { data } = await supabaseGestao.auth.getSession()
  const token = data?.session?.access_token
  if (!token) throw new Error('Sessão expirada. Faça login novamente.')
  return token
}

async function apiCall(method, body, id) {
  const accessToken = await getAccessToken()
  const url = id ? `/api/prices?id=${encodeURIComponent(id)}` : '/api/prices'
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`)
  return data
}

function EditableRow({ row, categorias, onSaved, onDeleted }) {
  const [draft, setDraft] = useState(row)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const dirty = JSON.stringify(draft) !== JSON.stringify(row)

  async function save() {
    setSaving(true)
    setError('')
    try {
      const { item } = await apiCall('POST', draft, draft.id)
      onSaved(item)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!window.confirm(`Excluir "${row.item}"?`)) return
    setSaving(true)
    setError('')
    try {
      await apiCall('DELETE', null, row.id)
      onDeleted(row.id)
    } catch (e) {
      setError(e.message)
      setSaving(false)
    }
  }

  return (
    <tr className="tp-row">
      <td>
        <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
          {categorias.map((c) => (
            <option key={c.id} value={c.label}>{c.label}</option>
          ))}
          {!categorias.some((c) => c.label === draft.category) && draft.category && (
            <option value={draft.category}>{draft.category}</option>
          )}
        </select>
      </td>
      <td>
        <input value={draft.item} onChange={(e) => setDraft({ ...draft, item: e.target.value })} />
      </td>
      <td>
        <input value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} />
      </td>
      <td>
        <input value={draft.notes || ''} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
      </td>
      <td className="tp-row-actions">
        <button className="tp-btn tp-btn-save" disabled={!dirty || saving} onClick={save}>
          {saving ? '...' : 'Salvar'}
        </button>
        <button className="tp-btn tp-btn-del" disabled={saving} onClick={remove}>
          Excluir
        </button>
      </td>
      {error && (
        <td colSpan={5} className="tp-row-error">
          {error}
        </td>
      )}
    </tr>
  )
}

function NewRow({ categorias, onCreated }) {
  const empty = { category: categorias[0]?.label || '', item: '', price: '', notes: '' }
  const [draft, setDraft] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function create() {
    if (!draft.category || !draft.item) {
      setError('Preencha ao menos categoria e item.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const { item } = await apiCall('POST', draft)
      onCreated(item)
      setDraft(empty)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <tr className="tp-row tp-row-new">
      <td>
        <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
          <option value="">Selecione a categoria</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.label}>{c.label}</option>
          ))}
        </select>
      </td>
      <td>
        <input placeholder="Item / serviço" value={draft.item} onChange={(e) => setDraft({ ...draft, item: e.target.value })} />
      </td>
      <td>
        <input placeholder="Preço" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} />
      </td>
      <td>
        <input placeholder="Observações" value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
      </td>
      <td className="tp-row-actions">
        <button className="tp-btn tp-btn-save" disabled={saving} onClick={create}>
          {saving ? '...' : '+ Adicionar'}
        </button>
      </td>
      {error && (
        <td colSpan={5} className="tp-row-error">
          {error}
        </td>
      )}
    </tr>
  )
}

// Aba "Tabela de Preços" dentro do painel de gestão. Usa a mesma sessão de
// login (Supabase Auth) do resto do painel para falar com a função serverless
// /api/prices, que confere o token de sessão e descobre a gráfica (tenant) do
// usuário antes de mostrar ou editar qualquer preço.
export default function PrecosTab({ tenantId, categorias = [] }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    apiCall('GET')
      .then(({ items }) => {
        if (active) setRows(items)
      })
      .catch((e) => {
        if (active) setError(e.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [tenantId])

  return (
    <div className="tp-wrap tp-wrap-embedded">
      <p className="tp-hint">
        Essa tabela é a mesma que fica escondida do site público. Edite os campos e clique em
        "Salvar" em cada linha para atualizar — some na hora para quem tiver acesso.
        {categorias.length === 0 && ' Cadastre categorias em "Cadastros" para poder classificá-las aqui.'}
      </p>
      {loading && <p className="tp-hint">Carregando preços...</p>}
      {error && <p className="tp-gate-error">{error}</p>}
      {!loading && !error && (
        <table className="tp-table">
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Item / serviço</th>
              <th>Preço</th>
              <th>Observações</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <EditableRow
                key={row.id}
                row={row}
                categorias={categorias}
                onSaved={(updated) => setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))}
                onDeleted={(id) => setRows((prev) => prev.filter((r) => r.id !== id))}
              />
            ))}
            <NewRow categorias={categorias} onCreated={(created) => setRows((prev) => [...prev, created])} />
          </tbody>
        </table>
      )}
    </div>
  )
}
