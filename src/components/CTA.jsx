import WhatsappIcon from './icons/WhatsappIcon'
import { getWhatsappUrl } from '../siteConfig'

export default function CTA() {
  return (
    <section className="cta-section">
      <div className="regmark" style={{ top: '30px', left: '10%' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="1.5">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 2v6M12 16v6M2 12h6M16 12h6" />
        </svg>
      </div>
      <div className="regmark" style={{ bottom: '40px', right: '12%' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="1.5">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 2v6M12 16v6M2 12h6M16 12h6" />
        </svg>
      </div>
      <span className="eyebrow" style={{ justifyContent: 'center', marginBottom: '16px' }}>
        Vamos começar
      </span>
      <h2>Pronto para destacar sua marca?</h2>
      <p>Fale agora com a gente e receba seu orçamento sem compromisso.</p>
      <a className="btn cta-big" href={getWhatsappUrl()} target="_blank" rel="noopener noreferrer">
        <WhatsappIcon className="wa-icon" />
        Chamar no WhatsApp
      </a>
    </section>
  )
}
