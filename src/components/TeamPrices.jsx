import { useEffect, useState } from 'react'
import logo from '../assets/logo.png'

const TOKEN_KEY = 'pm_team_token'

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

export default function TeamPrices() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [tokenInput, setTokenInput] = useState('')
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [rows, setRows] = useState([])

  useEffect(() => {
    document.title = 'Painel interno — Print Mixx'
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => document.head.removeChild(meta)
  }, [])

  useEffect(() => {
    if (token) tryLoad(token)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function tryLoad(t) {
    setLoading(true)
    setLoginError('')
    try {
      const { items } = await apiCall(t, 'GET')
      setRows(items)
      setAuthed(true)
      localStorage.setItem(TOKEN_KEY, t)
      setToken(t)
    } catch (e) {
      setLoginError(e.message === 'Token inválido.' ? 'Token inválido.' : e.message)
      localStorage.removeItem(TOKEN_KEY)
      setAuthed(false)
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    setToken('')
    setAuthed(false)
    setRows([])
  }

  if (!authed) {
    return (
      <div className="tp-gate">
        <img src={logo} alt="Print Mixx" className="tp-gate-logo" />
        <h1>Painel interno</h1>
        <p>Acesso restrito à equipe Print Mixx.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            tryLoad(tokenInput.trim())
          }}
        >
          <input
            type="password"
            placeholder="Token de acesso"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            autoFocus
          />
          <button className="btn btn-primary" type="submit" disabled={loading || !tokenInput.trim()}>
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
        {loginError && <p className="tp-gate-error">{loginError}</p>}
        <a href="/" className="tp-gate-back">
          ← Voltar para o site
        </a>
      </div>
    )
  }

  return (
    <div className="tp-wrap">
      <div className="tp-topbar">
        <img src={logo} alt="Print Mixx" className="tp-topbar-logo" />
        <h1>Tabela de preços — uso interno</h1>
        <button className="tp-btn tp-btn-logout" onClick={logout}>
          Sair
        </button>
      </div>
      <p className="tp-hint">
        Essa tabela não aparece em nenhuma página pública do site. Edite os campos e clique em
        "Salvar" em cada linha para atualizar.
      </p>
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
    </div>
  )
}
