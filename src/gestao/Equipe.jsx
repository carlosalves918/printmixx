import { useEffect, useState } from 'react'
import logo from '../assets/logo.png'
import GestaoApp from './GestaoApp'
import { supabaseGestao, gestaoSupabaseConfigured } from './supabaseGestaoClient'

// Ponto de entrada da área da equipe (ícone de cadeado no header).
// Agora é um login de verdade (Supabase Auth: e-mail + senha), não mais um
// token compartilhado. Cada pessoa tem sua própria conta, e cada conta
// pertence a uma "gráfica" (tenant) — é isso que permite, no futuro, vender
// este mesmo painel para outras gráficas sem misturar os dados de ninguém.
export default function Equipe() {
  const [checking, setChecking] = useState(true)
  const [session, setSession] = useState(null)

  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [signupNotice, setSignupNotice] = useState('')

  const [tenantId, setTenantId] = useState(null)
  const [tenantNome, setTenantNome] = useState('')
  const [tenantChecked, setTenantChecked] = useState(false)
  const [novoTenantNome, setNovoTenantNome] = useState('')
  const [onboardLoading, setOnboardLoading] = useState(false)
  const [onboardError, setOnboardError] = useState('')

  useEffect(() => {
    document.title = 'Painel interno — Print Mixx'
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => document.head.removeChild(meta)
  }, [])

  // Observa a sessão do Supabase Auth (login, logout, token renovado etc.)
  useEffect(() => {
    if (!gestaoSupabaseConfigured) {
      setChecking(false)
      return
    }
    supabaseGestao.auth.getSession().then(({ data }) => {
      setSession(data?.session || null)
      setChecking(false)
    })
    const { data: listener } = supabaseGestao.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setTenantChecked(false)
      setTenantId(null)
    })
    return () => listener?.subscription?.unsubscribe()
  }, [])

  // Uma vez logado, descobre a qual gráfica (tenant) esse usuário pertence
  useEffect(() => {
    if (!session?.user) return
    let active = true
    ;(async () => {
      const { data, error } = await supabaseGestao
        .from('tenant_users')
        .select('tenant_id, tenants ( nome )')
        .eq('user_id', session.user.id)
        .limit(1)
        .maybeSingle()
      if (!active) return
      if (!error && data) {
        setTenantId(data.tenant_id)
        setTenantNome(data.tenants?.nome || '')
      }
      setTenantChecked(true)
    })()
    return () => {
      active = false
    }
  }, [session])

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setFormError('')
    setSignupNotice('')
    const { error } = await supabaseGestao.auth.signInWithPassword({ email, password })
    if (error) setFormError(error.message === 'Invalid login credentials' ? 'E-mail ou senha inválidos.' : error.message)
    setLoading(false)
  }

  async function handleSignup(e) {
    e.preventDefault()
    setLoading(true)
    setFormError('')
    setSignupNotice('')
    const { data, error } = await supabaseGestao.auth.signUp({ email, password })
    if (error) {
      setFormError(error.message)
    } else if (!data?.session) {
      setSignupNotice('Conta criada! Verifique seu e-mail para confirmar o acesso antes de entrar.')
    }
    setLoading(false)
  }

  async function criarGrafica() {
    if (!novoTenantNome.trim()) {
      setOnboardError('Dê um nome pra sua gráfica.')
      return
    }
    setOnboardLoading(true)
    setOnboardError('')
    try {
      const { data: tenant, error: tenantError } = await supabaseGestao
        .from('tenants')
        .insert({ nome: novoTenantNome.trim() })
        .select()
        .single()
      if (tenantError) throw tenantError

      const { error: memberError } = await supabaseGestao
        .from('tenant_users')
        .insert({ tenant_id: tenant.id, user_id: session.user.id, papel: 'dono' })
      if (memberError) throw memberError

      setTenantId(tenant.id)
      setTenantNome(tenant.nome)
    } catch (e) {
      setOnboardError(e.message)
    } finally {
      setOnboardLoading(false)
    }
  }

  function logout() {
    supabaseGestao.auth.signOut()
  }

  if (checking) return null

  if (!gestaoSupabaseConfigured) {
    return (
      <div className="tp-gate">
        <img src={logo} alt="Print Mixx" className="tp-gate-logo" />
        <h1>Painel interno</h1>
        <p className="tp-gate-info">
          O login do painel agora depende do Supabase configurado (VITE_SUPABASE_URL e
          VITE_SUPABASE_ANON_KEY). Configure essas variáveis de ambiente pra habilitar o acesso.
        </p>
        <a href="/" className="tp-gate-back">← Voltar para o site</a>
      </div>
    )
  }

  // Não logado: tela de login/cadastro
  if (!session) {
    return (
      <div className="tp-gate">
        <img src={logo} alt="Print Mixx" className="tp-gate-logo" />
        <h1>Painel interno</h1>
        <p>Acesso restrito à equipe Print Mixx.</p>
        <form
          className="tp-gate-form-stack"
          onSubmit={mode === 'login' ? handleLogin : handleSignup}
        >
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <button className="btn btn-primary" type="submit" disabled={loading || !email || !password}>
            {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>
        <button
          className="tp-gate-toggle"
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login')
            setFormError('')
            setSignupNotice('')
          }}
        >
          {mode === 'login' ? 'Ainda não tem conta? Criar uma' : 'Já tem conta? Entrar'}
        </button>
        {formError && <p className="tp-gate-error">{formError}</p>}
        {signupNotice && <p className="tp-gate-info">{signupNotice}</p>}
        <a href="/" className="tp-gate-back">← Voltar para o site</a>
      </div>
    )
  }

  // Logado, mas ainda checando se já pertence a alguma gráfica
  if (!tenantChecked) return null

  // Logado e sem gráfica associada: onboarding (cria a gráfica dele)
  if (!tenantId) {
    return (
      <div className="tp-gate">
        <img src={logo} alt="Print Mixx" className="tp-gate-logo" />
        <h1>Quase lá!</h1>
        <p>Dê um nome pra sua gráfica pra começar a usar o painel.</p>
        <form
          className="tp-gate-form-stack"
          onSubmit={(e) => {
            e.preventDefault()
            criarGrafica()
          }}
        >
          <input
            type="text"
            placeholder="Nome da gráfica (ex: Print Mixx)"
            value={novoTenantNome}
            onChange={(e) => setNovoTenantNome(e.target.value)}
            autoFocus
          />
          <button className="btn btn-primary" type="submit" disabled={onboardLoading}>
            {onboardLoading ? 'Criando...' : 'Criar e entrar'}
          </button>
        </form>
        {onboardError && <p className="tp-gate-error">{onboardError}</p>}
        <button className="tp-gate-toggle" onClick={logout}>Sair</button>
      </div>
    )
  }

  return <GestaoApp tenantId={tenantId} tenantNome={tenantNome} currentUserId={session.user.id} onLogout={logout} />
}
