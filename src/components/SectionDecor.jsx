// Elementos gráficos de fundo reutilizáveis — marcas de registro (referência ao
// universo gráfico) e blobs coloridos de assinatura da marca, usados para dar mais
// vida ao fundo de seções que ficariam "secas" só com cards sobre fundo liso.

const REGMARK = (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
    <circle cx="12" cy="12" r="8" />
    <path d="M12 2v6M12 16v6M2 12h6M16 12h6" />
  </svg>
)

export function Regmark({ color, style }) {
  return (
    <div className="regmark" style={{ ...style, color }}>
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 2v6M12 16v6M2 12h6M16 12h6" />
      </svg>
    </div>
  )
}

export function SectionBlob({ color, style }) {
  return (
    <div
      className="section-blob"
      style={{ background: `radial-gradient(circle, ${color}, transparent 70%)`, ...style }}
      aria-hidden="true"
    />
  )
}

export default function SectionDecor({ marks = [], blobs = [] }) {
  return (
    <>
      {blobs.map((b, i) => (
        <SectionBlob key={`blob-${i}`} color={b.color} style={b.style} />
      ))}
      {marks.map((m, i) => (
        <Regmark key={`mark-${i}`} color={m.color} style={m.style} />
      ))}
    </>
  )
}
