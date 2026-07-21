import { useReveal } from '../hooks/useReveal'

const testimonials = [
  {
    quote:
      'Pedi cartões de visita e ficou muito acima do que eu esperava. Entrega no prazo e preço justo.',
    name: 'Cliente Print Mixx',
    role: 'Comunicação Visual',
  },
  {
    quote:
      'Fiz camisas personalizadas para um evento e o resultado foi impecável. Recomendo demais.',
    name: 'Cliente Print Mixx',
    role: 'Sublimação',
  },
  {
    quote:
      'Atendimento rápido pelo WhatsApp e a arte ficou linda. Já virou minha gráfica de confiança.',
    name: 'Cliente Print Mixx',
    role: 'Serviços Gráficos',
  },
]

export default function Testimonials() {
  const headRef = useReveal()
  const rowRef = useReveal()

  return (
    <section id="depoimentos">
      <div className="wrap">
        <div ref={headRef} className="section-head reveal">
          <span className="eyebrow">Quem confia</span>
          <h2>Depoimentos</h2>
        </div>
        <div ref={rowRef} className="testi-row reveal">
          {testimonials.map((t) => (
            <div className="testi-card" key={t.name + t.role}>
              <div className="stars">★★★★★</div>
              <p>{t.quote}</p>
              <div className="testi-name">{t.name}</div>
              <div className="testi-role">{t.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
