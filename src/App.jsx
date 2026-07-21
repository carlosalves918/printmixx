import Header from './components/Header'
import Hero from './components/Hero'
import FeaturedCategories from './components/FeaturedCategories'
import Services from './components/Services'
import WhyUs from './components/WhyUs'
import Gallery from './components/Gallery'
import Testimonials from './components/Testimonials'
import CTA from './components/CTA'
import Footer from './components/Footer'
import FloatingWhatsapp from './components/FloatingWhatsapp'
import TeamPrices from './components/TeamPrices'

export default function App() {
  // Rota interna e escondida — não tem link em nenhum lugar do site público.
  // Só quem digitar /equipe direto na barra de endereço chega nela, e mesmo
  // assim precisa do token de acesso da equipe para ver qualquer coisa.
  const isTeamRoute = window.location.pathname.replace(/\/+$/, '') === '/equipe'

  if (isTeamRoute) {
    return <TeamPrices />
  }

  return (
    <>
      <Header />
      <Hero />
      <div className="colorbar"></div>
      <FeaturedCategories />
      <Services />
      <WhyUs />
      <Gallery />
      <div className="colorbar"></div>
      <Testimonials />
      <CTA />
      <Footer />
      <FloatingWhatsapp />
    </>
  )
}
