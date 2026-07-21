import logo from '../assets/logo.png'
import { siteConfig, getMapsUrl } from '../siteConfig'

export default function Footer() {
  const { address, hours, instagramHandle, instagramUrl, whatsappNumber } = siteConfig
  const displayNumber = `(${whatsappNumber.slice(2, 4)}) ${whatsappNumber.slice(4, 9)}-${whatsappNumber.slice(9)}`

  return (
    <footer>
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-col">
            <img src={logo} alt="Print Mixx" className="footer-logo" />
            <p style={{ maxWidth: '280px' }}>
              Tudo para imprimir. Tudo para destacar. Comunicação visual, papelaria e
              personalizados com a melhor qualidade da região.
            </p>
          </div>

          <div className="footer-col">
            <h5>Contato</h5>
            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
              {displayNumber}
            </a>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
              {instagramHandle}
            </a>
          </div>

          <div className="footer-col">
            <h5>Endereço</h5>
            <a href={getMapsUrl()} target="_blank" rel="noopener noreferrer">
              {address.street}
              <br />
              {address.neighborhood}, {address.city}
              <br />
              {address.zip}
            </a>
          </div>

          <div className="footer-col">
            <h5>Horário</h5>
            {hours.map((h) => (
              <p key={h.label}>
                {h.label}: {h.value}
              </p>
            ))}
          </div>
        </div>

        <div className="colorbar short" style={{ marginBottom: '22px' }}></div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Print Mixx. Todos os direitos reservados.</span>
          <span style={{ fontFamily: "'Space Mono', monospace" }}>Sua ideia, nossa impressão.</span>
        </div>
      </div>
    </footer>
  )
}
