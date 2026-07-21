import { useReveal } from '../hooks/useReveal'

const reasons = [
  {
    title: 'Qualidade garantida',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17l-6.2 3.3 1.6-6.8L2.2 8.9l6.9-.6z" />
      </svg>
    ),
  },
  {
    title: 'Atendimento rápido',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </svg>
    ),
  },
  {
    title: 'Melhor preço',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 12V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h9" />
        <path d="M16 16l4 4M20 16l-4 4" />
      </svg>
    ),
  },
  {
    title: 'Entrega ágil',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 12h4l3 8 4-16 3 8h4" />
      </svg>
    ),
  },
  {
    title: 'Arte profissional',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l7.5 7.5" />
      </svg>
    ),
  },
]

export default function WhyUs() {
  const headRef = useReveal()
  const gridRef = useReveal()
  return (
    <section id="porque" className="why-section">
      <div className="wrap">
        <div ref={headRef} className="section-head reveal" style={{ marginBottom: '44px' }}>
          <span className="eyebrow">Diferenciais</span>
          <h2>Por que escolher a Print Mixx?</h2>
        </div>
        <div ref={gridRef} className="why-grid reveal">
          {reasons.map((reason) => (
            <div className="why-item" key={reason.title}>
              <div className="icon-wrap">{reason.icon}</div>
              <h4>{reason.title}</h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
