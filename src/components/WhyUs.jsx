import { useReveal } from '../hooks/useReveal'
import fachada from '../assets/fachada.jpg'
import { getMapsUrl } from '../siteConfig'

const reasons = [
  {
    title: 'Qualidade garantida',
    desc: 'Acabamento de gráfica profissional em cada peça que sai daqui.',
    accent: 'var(--purple)',
    accentSoft: 'rgba(124,58,237,0.18)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17l-6.2 3.3 1.6-6.8L2.2 8.9l6.9-.6z" />
      </svg>
    ),
  },
  {
    title: 'Atendimento rápido',
    desc: 'Resposta na hora pelo WhatsApp, do orçamento à entrega.',
    accent: 'var(--cyan)',
    accentSoft: 'rgba(23,184,214,0.18)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </svg>
    ),
  },
  {
    title: 'Melhor preço',
    desc: 'O menor preço da região, sem abrir mão da qualidade.',
    accent: 'var(--orange-2)',
    accentSoft: 'rgba(255,176,32,0.18)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 12V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h9" />
        <path d="M16 16l4 4M20 16l-4 4" />
      </svg>
    ),
  },
  {
    title: 'Entrega ágil',
    desc: 'Prazos curtos porque sabemos que sua marca não pode esperar.',
    accent: 'var(--magenta)',
    accentSoft: 'rgba(236,22,113,0.18)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 12h4l3 8 4-16 3 8h4" />
      </svg>
    ),
  },
  {
    title: 'Arte profissional',
    desc: 'Criação e diagramação sob medida para sua ideia se destacar.',
    accent: 'var(--yellow)',
    accentSoft: 'rgba(255,206,31,0.18)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l7.5 7.5" />
      </svg>
    ),
  },
]

function ReasonCard({ reason }) {
  const ref = useReveal()
  return (
    <div
      ref={ref}
      className="reason-card reveal"
      style={{ '--r-accent': reason.accent, '--r-accent-soft': reason.accentSoft }}
    >
      <div className="reason-icon">{reason.icon}</div>
      <h4>{reason.title}</h4>
      <p>{reason.desc}</p>
    </div>
  )
}

export default function WhyUs() {
  const headRef = useReveal()
  const photoRef = useReveal()

  return (
    <section id="porque" className="why-section">
      <div className="wrap why-layout">
        <div className="why-content">
          <div ref={headRef} className="section-head reveal">
            <span className="eyebrow">Diferenciais</span>
            <h2>
              Por que escolher a <span className="grad-text">Print Mixx?</span>
            </h2>
            <p>Cinco motivos que fazem clientes voltarem sempre que precisam imprimir ou destacar a marca.</p>
          </div>
          <div className="reason-grid">
            {reasons.map((reason) => (
              <ReasonCard key={reason.title} reason={reason} />
            ))}
          </div>
        </div>

        <div ref={photoRef} className="why-photo reveal">
          <img src={fachada} alt="Fachada da loja Print Mixx, venha nos visitar" />
          <div className="why-photo-caption">
            <span className="why-photo-eyebrow">Venha nos visitar</span>
            <strong>Aqui você economiza de verdade</strong>
            <a href={getMapsUrl()} target="_blank" rel="noopener noreferrer" className="why-photo-link">
              Ver no mapa →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
