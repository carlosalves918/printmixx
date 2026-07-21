import fachada from '../assets/fachada.jpg'
import { useReveal } from '../hooks/useReveal'
import { getMapsEmbedUrl, getMapsUrl } from '../siteConfig'
import SectionDecor from './SectionDecor'

export default function Gallery() {
  const headRef = useReveal()
  const tallRef = useReveal()
  const shortRef = useReveal()

  return (
    <section id="galeria" className="gallery-section">
      <SectionDecor
        blobs={[
          { color: 'rgba(23,184,214,0.22)', style: { width: 320, height: 320, top: -90, left: -110 } },
          { color: 'rgba(255,106,26,0.2)', style: { width: 280, height: 280, bottom: -90, right: -90 } },
        ]}
        marks={[
          { color: 'var(--purple)', style: { top: 30, right: '10%' } },
          { color: 'var(--orange-2)', style: { bottom: 30, left: '8%' } },
        ]}
      />
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
