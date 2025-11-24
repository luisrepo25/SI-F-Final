import { Button } from "@/components/ui/button"
import { TarjetaDestino } from "./tarjeta-destino"

const destinosDestacados = [
  {
    id: "salar-de-uyuni",
    nombre: "Salar de Uyuni",
    ubicacion: "Potosí, Bolivia",
    descripcion:
      "El desierto de sal más grande del mundo, un espejo natural que refleja el cielo creando paisajes surrealistas únicos en el planeta.",
    calificacion: 4.9,
  imagen: "/placeholder.svg",
    precio: "Desde $120",
  },
  {
    id: "lago-titicaca",
    nombre: "Lago Titicaca",
    ubicacion: "La Paz, Bolivia",
    descripcion:
      "El lago navegable más alto del mundo, hogar de las místicas Islas del Sol y la Luna, cuna de la civilización inca.",
    calificacion: 4.8,
  imagen: "/placeholder.svg",
    precio: "Desde $85",
  },
  {
    id: "la-paz",
    nombre: "La Paz",
    ubicacion: "La Paz, Bolivia",
    descripcion:
      "La capital más alta del mundo, una ciudad vibrante entre montañas con mercados coloridos, arquitectura colonial y cultura indígena viva.",
    calificacion: 4.7,
  imagen: "/placeholder.svg",
    precio: "Desde $60",
  },
  {
    id: "potosi",
    nombre: "Potosí",
    ubicacion: "Potosí, Bolivia",
    descripcion:
      "Ciudad colonial Patrimonio de la Humanidad, famosa por sus minas de plata y arquitectura barroca perfectamente conservada.",
    calificacion: 4.6,
  imagen: "/placeholder.svg",
    precio: "Desde $45",
  },
  {
    id: "sucre",
    nombre: "Sucre",
    ubicacion: "Chuquisaca, Bolivia",
    descripcion:
      "La ciudad blanca de Bolivia, capital constitucional con hermosa arquitectura colonial y un ambiente universitario vibrante.",
    calificacion: 4.7,
  imagen: "/placeholder.svg",
    precio: "Desde $55",
  },
  {
    id: "cochabamba",
    nombre: "Valle de Cochabamba",
    ubicacion: "Cochabamba, Bolivia",
    descripcion:
      "Conocido como la ciudad de la eterna primavera, famoso por su clima perfecto, gastronomía excepcional y el Cristo de la Concordia.",
    calificacion: 4.5,
  imagen: "/placeholder.svg",
    precio: "Desde $50",
  },
]

export function DestinosDestacados() {
  
  return (
    
    <section className="relative px-4 py-20 overflow-hidden sm:px-6 lg:px-8 bg-gradient-to-b from-white/50 to-amber-50/30">
     
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-32 h-32 rounded-full top-20 left-10 bg-amber-200/10 animate-float-slow"></div>
        <div className="absolute w-24 h-24 rounded-full top-40 right-20 bg-blue-200/10 animate-float-slower"></div>
        <div className="absolute w-20 h-20 rounded-full bottom-32 left-1/4 bg-amber-300/10 animate-float-fast"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-16 space-y-4 text-center animate-fade-in-up">
          <h2 className="text-3xl font-black font-heading sm:text-4xl lg:text-5xl text-foreground animate-title-glow">
            Destinos <span className="text-primary">Destacados</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg leading-relaxed text-muted-foreground animate-fade-in-up-delay">
            Descubre los lugares más impresionantes de Bolivia, desde paisajes naturales únicos hasta ciudades llenas de
            historia y cultura
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {
          destinosDestacados.map((destino, index) => (
            <div
              key={destino.id}
              className="animate-card-entrance hover-lift"
              style={{
                animationDelay: `${index * 0.1}s`,
                opacity: 0,
              }}
            >
              <TarjetaDestino
                id={destino.id}
                nombre={destino.nombre}
                ubicacion={destino.ubicacion}
                descripcion={destino.descripcion}
                calificacion={destino.calificacion}
                urlImagen={destino.imagen}
                precio={destino.precio}
              />
            </div>
          ))}
        </div>

        <div className="mt-12 text-center animate-fade-in-up-delay-3">
          <Button
            size="lg"
            variant="outline"
            className="px-8 py-3 font-semibold transition-all duration-300 bg-transparent border-primary text-primary hover:bg-primary hover:text-primary-foreground hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
          >
            Ver todos los destinos
          </Button>
        </div>
      </div>
    </section>
  )
}
