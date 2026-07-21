import logo from '../assets/logo.png'
import printerImg from '../assets/printer-hero.png'
import WhatsappIcon from './icons/WhatsappIcon'
import { getWhatsappUrl } from '../siteConfig'

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-grid"></div>
      <div className="hero-splash hero-splash-a"></div>
      <div className="hero-splash hero-splash-b"></div>

      <div className="regmark" style={{ top: '120px', left: '4%' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.5">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 2v6M12 16v6M2 12h6M16 12h6" />
        </svg>
      </div>
      <div className="regmark" style={{ bottom: '10%', right: '6%' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--magenta)" strokeWidth="1.5">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 2v6M12 16v6M2 12h6M16 12h6" />
        </svg>
      </div>

      <div className="wrap hero-inner">
        <div className="hero-copy">
          <span className="hero-badge">
            <span className="dot"></span> Menor preço da região
          </span>
          <img src={logo} alt="Print Mixx" className="hero-logo" />
          <h1>
            Tudo para imprimir.
            <br />
            <span className="line2">Tudo para destacar.</span>
          </h1>
          <p className="sub">
            Comunicação visual, papelaria, personalizados, brindes, adesivos e muito mais — sua
            marca com qualidade profissional e entrega ágil.
          </p>
          <div className="hero-ctas">
            <a
              className="btn btn-primary"
              href={getWhatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsappIcon />
              Solicitar orçamento
            </a>
            <a className="btn btn-ghost" href="#servicos">
              Ver serviços
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-visual-glow"></div>
          <img src={printerImg} alt="Impressora Print Mixx imprimindo comunicação visual colorida" className="hero-visual-img" />
          <div className="ribbon-stack" aria-hidden="true">
            <span className="ribbon ribbon-1">Menor</span>
            <span className="ribbon ribbon-2">Preço</span>
            <span className="ribbon ribbon-3">da região!</span>
          </div>
        </div>
      </div>
    </section>
  )
}
