import { useReveal } from '../hooks/useReveal'
import { getWhatsappUrl } from '../siteConfig'
import WhatsappIcon from './icons/WhatsappIcon'
import imgGrafica from '../assets/prod-grafica.png'
import imgVariedades from '../assets/prod-variedades.png'
import imgPersonalizados from '../assets/prod-personalizados.png'

const CheckIcon = ({ color }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9.5" opacity="0.35" />
    <path d="M8 12.5l2.7 2.7L16.5 9" />
  </svg>
)

const categories = [
  {
    accent: 'var(--purple)',
    accentSoft: 'rgba(124,58,237,0.14)',
    glow: 'rgba(124,58,237,0.45)',
    eyebrow: 'Frente 01',
    title: 'Serviços Gráficos',
    desc: 'Sua marca impressa com acabamento de gráfica profissional.',
    items: ['Cartões de visita', 'Xerox P&B e color', 'Banners e faixas', 'Convites', 'Currículos', 'Plastificação'],
    img: imgGrafica,
    imgAlt: 'Cartões de visita e banner personalizado Print Mixx',
    waMessage: 'Olá! Quero orçamento de Serviços Gráficos.',
  },
  {
    accent: 'var(--orange-2)',
    accentSoft: 'rgba(255,176,32,0.14)',
    glow: 'rgba(255,150,20,0.45)',
    eyebrow: 'Frente 02',
    title: 'Variedades',
    desc: 'Do escritório ao dia a dia — praticidade em um só lugar.',
    items: ['Materiais de escritório', 'Acessórios para celular', 'Laços decorativos', 'Informática'],
    img: imgVariedades,
    imgAlt: 'Materiais de escritório, laços e acessórios Print Mixx',
    waMessage: 'Olá! Quero orçamento de Variedades.',
  },
  {
    accent: 'var(--cyan)',
    accentSoft: 'rgba(23,184,214,0.14)',
    glow: 'rgba(23,184,214,0.45)',
    eyebrow: 'Frente 03',
    title: 'Personalizados',
    desc: 'Sua marca ou sua ideia estampada em produtos que emocionam.',
    items: ['Canecas', 'Camisas', 'Chaveiros', 'Sacolas', 'Kit festas — pegue e monte'],
    img: imgPersonalizados,
    imgAlt: 'Canecas, camisas e kit de aniversário personalizados Print Mixx',
    waMessage: 'Olá! Quero orçamento de Personalizados (canecas, camisas, chaveiros).',
  },
]

function CategoryCard({ cat }) {
  const ref = useReveal()
  return (
    <div
      ref={ref}
      className="feature-card reveal"
      style={{ '--f-accent': cat.accent, '--f-accent-soft': cat.accentSoft, '--f-glow': cat.glow }}
    >
      <span className="feature-eyebrow">{cat.eyebrow}</span>
      <h3>{cat.title}</h3>
      <p className="feature-desc">{cat.desc}</p>
      <ul className="feature-list">
        {cat.items.map((item) => (
          <li key={item}>
            <span className="check-ic">
              <CheckIcon color={cat.accent} />
            </span>
            {item}
          </li>
        ))}
      </ul>
      <a
        className="btn btn-ghost btn-sm feature-cta"
        style={{ borderColor: cat.accent, alignSelf: 'flex-start' }}
        href={getWhatsappUrl(cat.waMessage)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <WhatsappIcon className="wa-icon" />
        Orçamento de {cat.title}
      </a>
      <div className="feature-img">
        <img src={cat.img} alt={cat.imgAlt} loading="lazy" />
      </div>
    </div>
  )
}

export default function FeaturedCategories() {
  const headRef = useReveal()
  return (
    <section id="frentes" className="feature-section">
      <div className="wrap">
        <div ref={headRef} className="section-head reveal center">
          <span className="eyebrow center">As 3 frentes da Print Mixx</span>
          <h2>Tudo o que sua marca precisa, em um lugar só</h2>
          <p>
            De um cartão de visita a um kit de festa personalizado — três especialidades, um único
            padrão de qualidade.
          </p>
        </div>
        <div className="feature-grid">
          {categories.map((cat) => (
            <CategoryCard key={cat.title} cat={cat} />
          ))}
        </div>
      </div>
    </section>
  )
}
