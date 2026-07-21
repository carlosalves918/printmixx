import logo from '../assets/logo.png'
import WhatsappIcon from './icons/WhatsappIcon'
import { getWhatsappUrl } from '../siteConfig'

export default function Header() {
  return (
    <header>
      <nav className="nav">
        <a href="#top" className="nav-logo-link" aria-label="Voltar para o início">
          <img src={logo} alt="Print Mixx" className="nav-logo" />
        </a>
        <div className="nav-links">
          <a href="#frentes">Especialidades</a>
          <a href="#servicos">Catálogo</a>
          <a href="#porque">Diferenciais</a>
          <a href="#galeria">Onde estamos</a>
          <a href="#depoimentos">Depoimentos</a>
        </div>
        <div className="nav-cta">
          <a href="/equipe" className="nav-team-link" title="Área da equipe" aria-label="Área da equipe">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="4" y="10" width="16" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          </a>
          <a
            className="btn btn-primary btn-sm"
            href={getWhatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsappIcon />
            Orçamento
          </a>
        </div>
      </nav>
    </header>
  )
}
