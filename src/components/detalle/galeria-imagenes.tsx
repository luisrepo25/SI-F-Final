"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import Image from "next/image"

interface PropsGaleriaImagenes {
  imagenes: string[]
  titulo: string
}

export function GaleriaImagenes({ imagenes, titulo }: PropsGaleriaImagenes) {
  const [imagenActual, setImagenActual] = useState(0)
  const [mostrarLightbox, setMostrarLightbox] = useState(false)

  const siguienteImagen = () => {
    setImagenActual((prev) => (prev + 1) % imagenes.length)
  }

  const imagenAnterior = () => {
    setImagenActual((prev) => (prev - 1 + imagenes.length) % imagenes.length)
  }

  return (
    <>
      <div className="relative">
        

        <div className="grid grid-cols-4 gap-2 h-96 animate-fade-in">
          {/* Imagen Principal */}
          <div className="relative col-span-4 overflow-hidden rounded-lg cursor-pointer md:col-span-3 group">
            <Image
              src={imagenes[imagenActual] || "/placeholder.svg"}
              alt={`${titulo} - Imagen ${imagenActual + 1}`}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              width={600}
              height={400}
              onClick={() => setMostrarLightbox(true)}
            />
            {imagenes.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute text-white transition-opacity transform -translate-y-1/2 border-0 opacity-0 left-2 top-1/2 bg-black/50 hover:bg-black/70 group-hover:opacity-100"
                  onClick={imagenAnterior}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute text-white transition-opacity transform -translate-y-1/2 border-0 opacity-0 right-2 top-1/2 bg-black/50 hover:bg-black/70 group-hover:opacity-100"
                  onClick={siguienteImagen}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          <div className="flex-col hidden gap-2 md:flex h-96">
            {imagenes.slice(0, 4).map((imagen, index) => (
              <div
                key={index}
                className={`relative overflow-hidden rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
                  index === imagenActual ? "ring-2 ring-amber-500" : ""
                } ${index < 4 ? "h-1/4" : ""}`}
                style={{ minHeight: "88px" }}
                onClick={() => setImagenActual(index)}
              >
                <Image
                  src={imagen || "/placeholder.svg"}
                  alt={`${titulo} - Miniatura ${index + 1}`}
                  className="object-cover w-full h-full"
                  width={150}
                  height={100}
                />
                {index === 3 && imagenes.length > 4 && (
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white bg-black/50">
                    +{imagenes.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {mostrarLightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fade-in">
          <Button
            variant="secondary"
            size="sm"
            className="absolute text-white border-0 top-4 right-4 bg-white/20 hover:bg-white/30"
            onClick={() => setMostrarLightbox(false)}
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={imagenes[imagenActual] || "/placeholder.svg"}
              alt={`${titulo} - Imagen ${imagenActual + 1}`}
              className="object-contain max-w-full max-h-full"
              width={800}
              height={600}
            />
            {imagenes.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute text-white transform -translate-y-1/2 border-0 left-4 top-1/2 bg-white/20 hover:bg-white/30"
                  onClick={imagenAnterior}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute text-white transform -translate-y-1/2 border-0 right-4 top-1/2 bg-white/20 hover:bg-white/30"
                  onClick={siguienteImagen}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
