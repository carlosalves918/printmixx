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
import Equipe from './gestao/Equipe'

export default function App() {
  // Rota interna e escondida — não tem link em nenhum lugar do site público,
  // exceto o ícone de cadeado no header. Só quem clicar nele (ou digitar
  // /equipe direto) chega aqui, e mesmo assim precisa do token de acesso da
  // equipe para ver qualquer coisa: dashboard, estoque, pedidos, precificação
  // e a tabela de preços, tudo dentro do mesmo painel.
  const isTeamRoute = window.location.pathname.replace(/\/+$/, '').toLowerCase() === '/equipe'

  if (isTeamRoute) {
    return <Equipe />
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
