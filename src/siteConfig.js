// Configurações centrais do site — edite aqui para atualizar em todo o site.
export const siteConfig = {
  whatsappNumber: '5581985992524', // formato internacional, sem espaços ou símbolos
  whatsappMessage: 'Olá! Quero solicitar um orçamento.',
  instagramHandle: '@printmixx.oficial',
  instagramUrl: 'https://instagram.com/printmixx.oficial',
  address: {
    street: 'Rua João Pessoa, 186, 1º andar',
    neighborhood: 'Centro',
    city: 'Itapissuma - PE',
    zip: 'CEP: 53700-000',
  },
  hours: [
    { label: 'Segunda a sexta', value: '8h às 18h' },
    { label: 'Sábado', value: '8h às 13h' },
  ],
}

export function getWhatsappUrl(customMessage) {
  const msg = encodeURIComponent(customMessage || siteConfig.whatsappMessage)
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${msg}`
}

export function getMapsUrl() {
  const { street, neighborhood, city, zip } = siteConfig.address
  const query = encodeURIComponent(`${street}, ${neighborhood}, ${city}, ${zip}`)
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}

export function getMapsEmbedUrl() {
  const { street, neighborhood, city, zip } = siteConfig.address
  const query = encodeURIComponent(`${street}, ${neighborhood}, ${city}, ${zip}`)
  return `https://www.google.com/maps?q=${query}&output=embed`
}
