import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import BookingForm from "@/components/BookingForm";
import TestimonialsSection from "@/components/TestimonialsSection";
import ApartmentCard, { ApartmentProps } from "@/components/ApartmentCard";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Shield, Heart, Stethoscope, MapPin, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// Sample dental services data - Procedimentos Odontológicos
const featuredServices: ApartmentProps[] = [
  {
    id: "1",
    name: "Limpeza e Profilaxia",
    description: "Limpeza profissional completa com aplicação de flúor e orientações personalizadas de higiene bucal.",
    price: 120,
    capacity: 1,
    size: 30,
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&h=600&fit=crop",
    location: "Consultório Principal",
    features: ["Limpeza", "Flúor", "Orientação", "Raio-X", "Avaliação", "Polimento"]
  },
  {
    id: "2",
    name: "Implantes Dentários",
    description: "Implantes de alta qualidade com tecnologia avançada e acompanhamento completo durante todo o processo.",
    price: 2500,
    capacity: 1,
    size: 60,
    image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800&h=600&fit=crop",
    location: "Sala Cirúrgica",
    features: ["Implante", "Prótese", "Acompanhamento", "Garantia", "Raio-X 3D", "Pós-operatório"]
  },
  {
    id: "3",
    name: "Ortodontia",
    description: "Tratamento ortodôntico personalizado com aparelhos modernos e eficazes para alinhamento dental.",
    price: 350,
    capacity: 1,
    size: 45,
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&h=600&fit=crop",
    location: "Consultório Ortodôntico", 
    features: ["Aparelho", "Manutenção", "Acompanhamento", "Moldagem", "Planejamento"]
  },
  {
    id: "4",
    name: "Clareamento Dental",
    description: "Clareamento profissional para um sorriso mais branco e radiante com técnicas seguras e eficazes.",
    price: 450,
    capacity: 1,
    size: 90,
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&h=600&fit=crop",
    location: "Consultório Estético",
    features: ["Clareamento", "Moldeira", "Gel", "LED", "Manutenção", "Orientação"]
  },
  {
    id: "5",
    name: "Restaurações",
    description: "Restaurações estéticas em resina ou porcelana para recuperar função e beleza dos dentes danificados.",
    price: 180,
    capacity: 1,
    size: 45,
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&h=600&fit=crop",
    location: "Consultório Geral",
    features: ["Restauração", "Estética", "Durabilidade", "Naturalidade", "Funcionalidade"]
  },
  {
    id: "6",
    name: "Tratamento de Canal",
    description: "Endodontia especializada para preservar dentes com infecções ou lesões pulpares usando técnicas modernas.",
    price: 380,
    capacity: 1,
    size: 60,
    image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800&h=600&fit=crop",
    location: "Consultório Endodôntico",
    features: ["Endodontia", "Microscopia", "Preservação", "Alívio da dor", "Técnica moderna"]
  },
  {
    id: "7",
    name: "Periodontia",
    description: "Tratamento especializado de doenças gengivais e periodontais para manter gengivas saudáveis.",
    price: 280,
    capacity: 1,
    size: 60,
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&h=600&fit=crop",
    location: "Consultório Periodontal",
    features: ["Periodontia", "Gengiva", "Prevenção", "Raspagem", "Manutenção"]
  },
  {
    id: "8",
    name: "Próteses Dentárias",
    description: "Próteses fixas e removíveis personalizadas para restaurar função mastigatória e estética do sorriso.",
    price: 1200,
    capacity: 1,
    size: 90,
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&h=600&fit=crop",
    location: "Laboratório Protético",
    features: ["Prótese", "Personalizada", "Funcionalidade", "Estética", "Conforto", "Durabilidade"]
  }
];

export default function Index() {
  const { t } = useLanguage();
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);
  
  // Feature items
  const features = [
    {
      icon: <Star className="h-8 w-8 text-primary" />,
      title: t.home.amenities.features.beachfront.title,
      description: t.home.amenities.features.beachfront.description
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: t.home.amenities.features.pools.title,
      description: t.home.amenities.features.pools.description
    },
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: t.home.amenities.features.restaurant.title,
      description: t.home.amenities.features.restaurant.description
    },
    {
      icon: <Stethoscope className="h-8 w-8 text-primary" />,
      title: t.home.amenities.features.wifi.title,
      description: t.home.amenities.features.wifi.description
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: t.home.amenities.features.bar.title,
      description: t.home.amenities.features.bar.description
    },
    {
      icon: <MapPin className="h-8 w-8 text-primary" />,
      title: t.home.amenities.features.location.title,
      description: t.home.amenities.features.location.description
    }
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Welcome Section */}
        <section id="welcome" className="section">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="animate-fade-in [animation-delay:100ms]">
                <span className="text-sm text-primary font-medium uppercase tracking-wider">
                  {t.home.welcome.subtitle}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">
                  {t.home.welcome.title}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {t.home.welcome.description1}
                </p>
                <p className="text-muted-foreground mb-8">
                  {t.home.welcome.description2}
                </p>
                <Button asChild className="btn-primary">
                  <Link to="/about">
                    {t.home.welcome.learnMore} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              
              <div className="relative animate-fade-in [animation-delay:300ms]">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800&h=600&fit=crop"
                    alt="Consultório moderno" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 w-2/3 rounded-2xl overflow-hidden shadow-xl">
                  <img 
                    src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400&h=300&fit=crop"
                    alt="Equipamentos odontológicos" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-6 -right-6 w-1/2 rounded-2xl overflow-hidden shadow-xl">
                  <img 
                    src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&h=300&fit=crop"
                    alt="Atendimento personalizado" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Booking Form Section */}
        <section className="relative py-20 accent-gradient overflow-hidden">
          <div className="container relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="animate-fade-in">
                <span className="text-sm text-white font-medium uppercase tracking-wider">
                  {t.home.booking.subtitle}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6 text-white">
                  {t.home.booking.title}
                </h2>
                <p className="text-white/90 mb-6">
                  {t.home.booking.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {t.home.booking.benefits.map((item, index) => (
                    <li key={index} className="flex items-center text-white">
                      <div className="h-5 w-5 rounded-full bg-white/20 text-white flex items-center justify-center mr-3">
                        <ArrowRight className="h-3 w-3" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <BookingForm />
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
            <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute bottom-10 right-40 w-48 h-48 rounded-full bg-white/30 blur-3xl" />
          </div>
        </section>
        
        {/* Featured Apartments */}
        <section className="section">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
              <span className="text-sm text-primary font-medium uppercase tracking-wider">
                {t.home.featuredApartments.subtitle}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
                {t.home.featuredApartments.title}
              </h2>
              <p className="text-muted-foreground">
                {t.home.featuredApartments.description}
              </p>
            </div>
            
            <div className="relative">
              <Carousel 
                opts={{
                  align: "start",
                  loop: true,
                }}
                plugins={[Autoplay({ delay: 3000 })]}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {featuredServices.map((service, index) => (
                    <CarouselItem key={service.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                      <div className="animate-fade-in" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
                        <ApartmentCard apartment={service} />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="-left-4 text-secondary border-secondary/20 hover:bg-secondary hover:text-secondary-foreground" />
                <CarouselNext className="-right-4 text-secondary border-secondary/20 hover:bg-secondary hover:text-secondary-foreground" />
              </Carousel>
            </div>
            
              <div className="text-center mt-12">
                <Button asChild className="btn-secondary">
                  <Link to="/apartments">
                    {t.home.featuredApartments.viewAll} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <TestimonialsSection />
        
        {/* Features Section */}
        <section className="section bg-secondary/5">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
              <span className="text-sm text-secondary font-medium uppercase tracking-wider">
                {t.home.amenities.subtitle}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
                {t.home.amenities.title}
              </h2>
              <p className="text-muted-foreground">
                {t.home.amenities.description}
              </p>
            </div>
            
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <div 
                    key={index} 
                    className="feature-card flex flex-col items-center text-center animate-fade-in"
                    style={{ animationDelay: `${(index + 1) * 100}ms` }}
                  >
                    <div className="mb-4 p-3 rounded-full bg-secondary/10">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="relative py-24 bg-primary/5">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t.home.cta.title}
              </h2>
              <p className="text-muted-foreground mb-8">
                {t.home.cta.description}
              </p>
              <Button asChild size="lg" className="btn-secondary">
                <Link to="/booking">{t.home.cta.bookNow}</Link>
              </Button>
            </div>
          </div>
          
          {/* Decorative waves */}
          <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden">
            <svg 
              className="absolute bottom-0 w-full h-24 fill-background"
              preserveAspectRatio="none"
              viewBox="0 0 1440 74"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M0,37.1L40,34.5C80,32,160,27,240,29.6C320,32,400,42,480,42.9C560,44,640,35,720,32.1C800,30,880,34,960,40.8C1040,47,1120,56,1200,56.6C1280,57,1360,48,1400,43.3L1440,39.1L1440,74L1400,74C1360,74,1280,74,1200,74C1120,74,1040,74,960,74C880,74,800,74,720,74C640,74,560,74,480,74C400,74,320,74,240,74C160,74,80,74,40,74L0,74Z"
                className="animate-wave opacity-50"
              />
              <path 
                d="M0,37.1L40,34.5C80,32,160,27,240,29.6C320,32,400,42,480,42.9C560,44,640,35,720,32.1C800,30,880,34,960,40.8C1040,47,1120,56,1200,56.6C1280,57,1360,48,1400,43.3L1440,39.1L1440,74L1400,74C1360,74,1280,74,1200,74C1120,74,1040,74,960,74C880,74,800,74,720,74C640,74,560,74,480,74C400,74,320,74,240,74C160,74,80,74,40,74L0,74Z"
                className="animate-wave opacity-100 [animation-delay:-4s]"
              />
            </svg>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
