import logo from '../assets/logo.png'
import WhatsappIcon from './icons/WhatsappIcon'
import { getWhatsappUrl } from '../siteConfig'

export default function Header() {
  return (
    <header>
      <nav className="nav">
        <img src={logo} alt="Print Mixx" className="nav-logo" />
        <div className="nav-links">
          <a href="#servicos">Serviços</a>
          <a href="#porque">Diferenciais</a>
          <a href="#galeria">Galeria</a>
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
