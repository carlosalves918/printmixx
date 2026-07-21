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

export default function App() {
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
