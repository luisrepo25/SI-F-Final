"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { CalendarDays, MapPin, Users, Search } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function FormularioBusqueda() {
  const [datosBusqueda, setDatosBusqueda] = useState({
    ubicacion: "",
    fechaInicio: "",
    fechaFin: "",
    personas: "2",
  })

  const router = useRouter()

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault()

    if (!datosBusqueda.ubicacion.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor ingresa un destino para buscar",
        variant: "destructive",
      })
      return
    }

    if (!datosBusqueda.fechaInicio) {
      toast({
        title: "Campo requerido",
        description: "Por favor selecciona una fecha de inicio",
        variant: "destructive",
      })
      return
    }

    const parametrosBusqueda = new URLSearchParams({
      destino: datosBusqueda.ubicacion,
      fechaInicio: datosBusqueda.fechaInicio,
      fechaFin: datosBusqueda.fechaFin || "",
      personas: datosBusqueda.personas,
    })

    toast({
      title: "Buscando destinos...",
      description: `Buscando opciones para ${datosBusqueda.personas} persona(s) en ${datosBusqueda.ubicacion}`,
    })

    router.push(`/destinos?${parametrosBusqueda.toString()}`)
  }

  return (
    <Card className="p-6 bg-white/95 backdrop-blur-sm shadow-xl border-0 max-w-4xl mx-auto animate-fade-in-up">
      <form onSubmit={manejarEnvio} className="space-y-4 md:space-y-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-2">
          {/* Ubicación */}
          <div className="space-y-2">
            <Label htmlFor="ubicacion" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Destino
            </Label>
            <Input
              id="ubicacion"
              placeholder="¿A dónde quieres ir?"
              value={datosBusqueda.ubicacion}
              onChange={(e) => setDatosBusqueda({ ...datosBusqueda, ubicacion: e.target.value })}
              className="border-0 bg-muted/50 focus:bg-white transition-colors hover:shadow-md"
            />
          </div>

          {/* Fecha de Inicio */}
          <div className="space-y-2">
            <Label htmlFor="fechaInicio" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Fecha de inicio
            </Label>
            <Input
              id="fechaInicio"
              type="date"
              value={datosBusqueda.fechaInicio}
              onChange={(e) => setDatosBusqueda({ ...datosBusqueda, fechaInicio: e.target.value })}
              className="border-0 bg-muted/50 focus:bg-white transition-colors hover:shadow-md"
            />
          </div>

          {/* Fecha de Fin */}
          <div className="space-y-2">
            <Label htmlFor="fechaFin" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Fecha de fin
            </Label>
            <Input
              id="fechaFin"
              type="date"
              value={datosBusqueda.fechaFin}
              onChange={(e) => setDatosBusqueda({ ...datosBusqueda, fechaFin: e.target.value })}
              className="border-0 bg-muted/50 focus:bg-white transition-colors hover:shadow-md"
            />
          </div>

          {/* Personas */}
          <div className="space-y-2">
            <Label htmlFor="personas" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Personas
            </Label>
            <Input
              id="personas"
              type="number"
              min="1"
              max="20"
              value={datosBusqueda.personas}
              onChange={(e) => setDatosBusqueda({ ...datosBusqueda, personas: e.target.value })}
              className="border-0 bg-muted/50 focus:bg-white transition-colors hover:shadow-md"
            />
          </div>
        </div>

        {/* Botón de Búsqueda */}
        <div className="pt-4 md:pt-6">
          <Button
            type="submit"
            className="w-full md:w-auto bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105"
          >
            <Search className="h-5 w-5 mr-2" />
            Buscar Destinos
          </Button>
        </div>
      </form>
    </Card>
  )
}
