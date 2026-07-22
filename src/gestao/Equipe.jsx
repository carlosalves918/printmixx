import { useEffect, useState } from 'react'
import logo from '../assets/logo.png'
import GestaoApp from './GestaoApp'

const TOKEN_KEY = 'pm_team_token'

async function checkToken(token) {
  const res = await fetch('/api/prices', {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`)
  return true
}

// Ponto de entrada da área da equipe (ícone de cadeado no header).
// Pede o token uma única vez e, depois de validado, dá acesso ao painel de
// gestão inteiro (dashboard, estoque, pedidos, precificação e tabela de preços).
export default function Equipe() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [tokenInput, setTokenInput] = useState('')
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    document.title = 'Painel interno — Print Mixx'
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => document.head.removeChild(meta)
  }, [])

  useEffect(() => {
    if (token) tryLogin(token)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function tryLogin(t) {
    setLoading(true)
    setLoginError('')
    try {
      await checkToken(t)
      localStorage.setItem(TOKEN_KEY, t)
      setToken(t)
      setAuthed(true)
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
            tryLogin(tokenInput.trim())
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

  return <GestaoApp token={token} onLogout={logout} />
}
