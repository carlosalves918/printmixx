import fachada from '../assets/fachada.jpg'
import panfleto from '../assets/panfleto.jpg'
import { useReveal } from '../hooks/useReveal'

export default function Gallery() {
  const headRef = useReveal()
  const tallRef = useReveal()
  const shortRef = useReveal()

  return (
    <section id="galeria">
      <div className="wrap">
        <div ref={headRef} className="section-head reveal">
          <span className="eyebrow">Portfólio</span>
          <h2>Nossa loja e nossos trabalhos</h2>
          <p>Um pouco do que produzimos e do espaço que preparamos para receber você.</p>
        </div>
        <div className="gallery-grid">
          <div ref={tallRef} className="gallery-item gallery-tall reveal">
            <img src={fachada} alt="Fachada da loja Print Mixx" />
            <span className="tag">Nossa fachada</span>
          </div>
          <div ref={shortRef} className="gallery-item gallery-short reveal">
            <img src={panfleto} alt="Serviços Print Mixx" style={{ objectPosition: 'top' }} />
            <span className="tag">Nosso catálogo</span>
          </div>
        </div>
      </div>
    </section>
  )
}
