import { Navegacion } from "@/components/comunes/navegacion";
import { FormularioBusqueda } from "@/components/inicio/formulario-busqueda";
import { DestinosDestacados } from "@/components/inicio/destinos-destacados";
import { PiePagina } from "@/components/comunes/pie-pagina";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
export default function PaginaInicio() {
  return (
    <div className="min-h-screen w-full">
      <Navegacion />

      {/* Sección Hero con animaciones */}
      <section className="relative min-h-[85vh] w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Fondo animado con imagen de playa boliviana */}

        <video
          className="absolute inset-0 h-full w-full object-cover z-0"
          src="/Video.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
        {/* Overlay para mejorar legibilidad */}
        <div className="absolute inset-0 bg-black/40 z-5"></div>

        {/* Contenido con animaciones de entrada */}
        <div className="relative z-10 text-center max-w-4xl mx-auto space-y-8">
          {/* Título Principal con animación */}
          <div className="space-y-4 animate-fade-in-up">
            <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-7xl text-white leading-tight drop-shadow-2xl animate-title-glow">
              Descubre la{" "}
              <span className="text-amber-300 animate-pulse">Magia</span> de
              Bolivia
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-lg animate-fade-in-up-delay">
              Explora paisajes impresionantes, cultura vibrante y aventuras
              únicas en el corazón de Sudamérica
            </p>
          </div>

          {/* Formulario de Búsqueda con animación */}
          <div className="pt-8 animate-fade-in-up-delay-2">
            <FormularioBusqueda />
          </div>

          {/* Botón CTA con animaciones mejoradas */}
          <div className="pt-6 animate-fade-in-up-delay-3">
            <Button
              size="lg"
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-10 py-5 text-lg rounded-xl transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/50 hover:scale-110 group border-2 border-amber-400 animate-bounce-subtle"
            >
              Comienza tu aventura
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-3 group-hover:scale-125 transition-all duration-300" />
            </Button>
          </div>
        </div>
      </section>

      {/* Estadísticas Rápidas con animaciones */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-3 group hover:scale-105 transition-transform duration-300 animate-fade-in-up">
              <div className="text-4xl lg:text-5xl font-heading font-black text-amber-600 group-hover:text-amber-500 transition-colors duration-300 animate-counter">
                50+
              </div>
              <div className="text-gray-600 font-medium text-lg group-hover:text-gray-800 transition-colors duration-300">
                Destinos únicos
              </div>
            </div>
            <div className="space-y-3 group hover:scale-105 transition-transform duration-300 animate-fade-in-up-delay">
              <div className="text-4xl lg:text-5xl font-heading font-black text-amber-600 group-hover:text-amber-500 transition-colors duration-300 animate-counter-delay">
                10,000+
              </div>
              <div className="text-gray-600 font-medium text-lg group-hover:text-gray-800 transition-colors duration-300">
                Viajeros felices
              </div>
            </div>
            <div className="space-y-3 group hover:scale-105 transition-transform duration-300 animate-fade-in-up-delay-2">
              <div className="text-4xl lg:text-5xl font-heading font-black text-amber-600 group-hover:text-amber-500 transition-colors duration-300 animate-counter-delay-2">
                4.9
              </div>
              <div className="text-gray-600 font-medium text-lg group-hover:text-gray-800 transition-colors duration-300">
                Calificación promedio
              </div>
            </div>
          </div>
        </div>
      </section>

      <DestinosDestacados />
      <PiePagina />
    </div>
  );
}
