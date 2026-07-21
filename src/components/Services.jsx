import { useReveal } from '../hooks/useReveal'

const services = [
  {
    accent: 'var(--purple)',
    accentSoft: 'rgba(124,58,237,0.16)',
    title: 'Comunicação Visual',
    items: ['Banners e faixas', 'Fachadas e letreiros', 'Adesivagem de vitrines'],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M7 21h10M12 17v4" />
      </svg>
    ),
  },
  {
    accent: 'var(--cyan)',
    accentSoft: 'rgba(23,184,214,0.16)',
    title: 'Serviços Gráficos',
    items: ['Cartões de visita', 'Xerox P&B e color', 'Convites e currículos', 'Plastificação'],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
        <path d="M14 2v5h5" />
      </svg>
    ),
  },
  {
    accent: 'var(--magenta)',
    accentSoft: 'rgba(236,22,113,0.16)',
    title: 'Personalizados',
    items: ['Canecas e camisas', 'Chaveiros e sacolas', 'Kit festas — pegue e monte'],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 7h-9a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
        <path d="M9 7V4a2 2 0 0 1 2-2h1" />
        <path d="M4 11h4M4 15h4" />
      </svg>
    ),
  },
  {
    accent: 'var(--orange-2)',
    accentSoft: 'rgba(255,176,32,0.16)',
    title: 'Brindes',
    items: ['Brindes corporativos', 'Lembrancinhas de evento', 'Kits personalizados'],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 12v9H4v-9M2 7h20v5H2zM12 22V7M12 7c-1.5 0-4-1-4-3.2C8 2.3 9 2 10 2c1.6 0 2 2 2 5zM12 7c1.5 0 4-1 4-3.2C16 2.3 15 2 14 2c-1.6 0-2 2-2 5z" />
      </svg>
    ),
  },
  {
    accent: 'var(--yellow)',
    accentSoft: 'rgba(255,206,31,0.16)',
    title: 'Variedades',
    items: ['Materiais de escritório', 'Acessórios para celular', 'Laços decorativos', 'Informática'],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h8M12 8v8" />
      </svg>
    ),
  },
  {
    accent: 'var(--purple)',
    accentSoft: 'rgba(124,58,237,0.16)',
    title: 'Adesivos',
    items: ['Recorte eletrônico', 'Etiquetas e rótulos', 'Adesivos personalizados'],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="M4 10h16M10 4v16" strokeDasharray="2 2" />
      </svg>
    ),
  },
  {
    accent: 'var(--cyan)',
    accentSoft: 'rgba(23,184,214,0.16)',
    title: 'Sublimação',
    items: ['Camisas e uniformes', 'Canecas e squeezes', 'Estampas sob medida'],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 4h16v16H4z" />
        <path d="M4 10h16M10 4v16" />
      </svg>
    ),
  },
  {
    accent: 'var(--orange)',
    accentSoft: 'rgba(255,106,26,0.16)',
    title: 'E muito mais',
    items: ['Sob consulta e orçamento', 'Fale com a gente no WhatsApp'],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2 3 7v10l9 5 9-5V7z" />
        <path d="M3 7l9 5 9-5M12 12v10" />
      </svg>
    ),
  },
]

function ServiceCard({ service }) {
  const ref = useReveal()
  return (
    <div
      ref={ref}
      className="service-card reveal"
      style={{ '--card-accent': service.accent, '--card-accent-soft': service.accentSoft }}
    >
      <div className="service-icon">{service.icon}</div>
      <h3>{service.title}</h3>
      <ul>
        {service.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

export default function Services() {
  const headRef = useReveal()
  return (
    <section id="servicos">
      <div className="wrap">
        <div ref={headRef} className="section-head reveal">
          <span className="eyebrow">Catálogo completo</span>
          <h2>E ainda tem muito mais</h2>
          <p>
            Da comunicação visual à sublimação, o cardápio completo da Print Mixx — feito na
            régua e entregue rápido.
          </p>
        </div>
        <div className="services-grid">
          {services.map((service) => (
            <ServiceCard key={service.title} service={service} />
          ))}
        </div>
      </div>
    </section>
  )
}
