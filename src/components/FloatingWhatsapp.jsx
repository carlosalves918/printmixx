import WhatsappIcon from './icons/WhatsappIcon'
import { getWhatsappUrl } from '../siteConfig'

export default function FloatingWhatsapp() {
  return (
    <a
      className="float-wa"
      href={getWhatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chamar no WhatsApp"
    >
      <WhatsappIcon className="" />
    </a>
  )
}
