import { useEffect, useState } from 'react'

async function apiCall(token, method, body, id) {
  const url = id ? `/api/prices?id=${encodeURIComponent(id)}` : '/api/prices'
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`)
  return data
}

function EditableRow({ row, token, onSaved, onDeleted }) {
  const [draft, setDraft] = useState(row)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const dirty = JSON.stringify(draft) !== JSON.stringify(row)

  async function save() {
    setSaving(true)
    setError('')
    try {
      const { item } = await apiCall(token, 'POST', draft, draft.id)
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
      await apiCall(token, 'DELETE', null, row.id)
      onDeleted(row.id)
    } catch (e) {
      setError(e.message)
      setSaving(false)
    }
  }

  return (
    <tr className="tp-row">
      <td>
        <input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
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

function NewRow({ token, onCreated }) {
  const empty = { category: '', item: '', price: '', notes: '' }
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
      const { item } = await apiCall(token, 'POST', draft)
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
        <input placeholder="Categoria" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
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

// Aba "Tabela de Preços" dentro do painel de gestão. Usa o mesmo token de acesso
// da equipe (já validado na tela de login do painel) para falar com a função
// serverless /api/prices, que é quem realmente confere o token e fala com o banco.
export default function PrecosTab({ token }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    apiCall(token, 'GET')
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
  }, [token])

  return (
    <div className="tp-wrap tp-wrap-embedded">
      <p className="tp-hint">
        Essa tabela é a mesma que fica escondida do site público. Edite os campos e clique em
        "Salvar" em cada linha para atualizar — some na hora para quem tiver acesso.
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
                token={token}
                onSaved={(updated) => setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))}
                onDeleted={(id) => setRows((prev) => prev.filter((r) => r.id !== id))}
              />
            ))}
            <NewRow token={token} onCreated={(created) => setRows((prev) => [...prev, created])} />
          </tbody>
        </table>
      )}
    </div>
  )
}
