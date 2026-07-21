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
