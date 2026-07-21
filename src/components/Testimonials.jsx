import { useReveal } from '../hooks/useReveal'
import imgGrafica from '../assets/prod-grafica.png'
import imgPersonalizados from '../assets/prod-personalizados.png'
import imgVariedades from '../assets/prod-variedades.png'

const testimonials = [
  {
    quote:
      'Pedi cartões de visita e ficou muito acima do que eu esperava. Entrega no prazo e preço justo.',
    name: 'Cliente Print Mixx',
    role: 'Comunicação Visual',
    accent: 'var(--purple)',
    img: imgGrafica,
  },
  {
    quote:
      'Fiz camisas personalizadas para um evento e o resultado foi impecável. Recomendo demais.',
    name: 'Cliente Print Mixx',
    role: 'Sublimação',
    accent: 'var(--cyan)',
    img: imgPersonalizados,
  },
  {
    quote:
      'Atendimento rápido pelo WhatsApp e a arte ficou linda. Já virou minha gráfica de confiança.',
    name: 'Cliente Print Mixx',
    role: 'Serviços Gráficos',
    accent: 'var(--orange-2)',
    img: imgVariedades,
  },
]

function TestiCard({ t }) {
  const ref = useReveal()
  return (
    <div ref={ref} className="testi-card reveal" style={{ '--t-accent': t.accent }}>
      <span className="testi-quote-mark" aria-hidden="true">&ldquo;</span>
      <div className="stars">★★★★★</div>
      <p>{t.quote}</p>
      <div className="testi-foot">
        <div className="testi-thumb">
          <img src={t.img} alt="" aria-hidden="true" />
        </div>
        <div>
          <div className="testi-name">{t.name}</div>
          <div className="testi-role">{t.role}</div>
        </div>
      </div>
    </div>
  )
}

export default function Testimonials() {
  const headRef = useReveal()

  return (
    <section id="depoimentos">
      <div className="wrap">
        <div ref={headRef} className="section-head reveal center">
          <span className="eyebrow center">Quem confia</span>
          <h2>
            O que dizem sobre a <span className="grad-text">Print Mixx</span>
          </h2>
        </div>
        <div className="testi-row">
          {testimonials.map((t) => (
            <TestiCard key={t.name + t.role} t={t} />
          ))}
        </div>
      </div>
    </section>
  )
}
