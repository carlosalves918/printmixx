import fachada from '../assets/fachada.jpg'
import { useReveal } from '../hooks/useReveal'
import { getMapsEmbedUrl, getMapsUrl } from '../siteConfig'

export default function Gallery() {
  const headRef = useReveal()
  const tallRef = useReveal()
  const shortRef = useReveal()

  return (
    <section id="galeria">
      <div className="wrap">
        <div ref={headRef} className="section-head reveal">
          <span className="eyebrow">Onde estamos</span>
          <h2>Nossa loja e como chegar</h2>
          <p>Venha nos visitar — aqui você economiza de verdade. Confira nossa fachada e ache o caminho no mapa.</p>
        </div>
        <div className="gallery-grid">
          <div ref={tallRef} className="gallery-item gallery-tall reveal">
            <img src={fachada} alt="Fachada da loja Print Mixx" />
            <span className="tag">Nossa fachada</span>
          </div>
          <div ref={shortRef} className="gallery-item gallery-short gallery-map reveal">
            <iframe
              src={getMapsEmbedUrl()}
              title="Localização da Print Mixx no Google Maps"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            ></iframe>
            <a
              className="tag tag-link"
              href={getMapsUrl()}
              target="_blank"
              rel="noopener noreferrer"
            >
              Traçar rota →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
