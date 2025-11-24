"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface EstadoFiltros {
  rangoPrecios: [number, number]
  categorias: string[]
  calificacion: number
  duracion: string[]
}

interface PropsFiltrosBusqueda {
  filtros: EstadoFiltros
  alCambiarFiltros: (filtros: EstadoFiltros) => void
  alLimpiarFiltros: () => void
  estaAbierto?: boolean
  alCerrar?: () => void
}

export function FiltrosBusqueda({
  filtros,
  alCambiarFiltros,
  alLimpiarFiltros,
  estaAbierto,
  alCerrar,
}: PropsFiltrosBusqueda) {
  const categorias = [
    { id: "cultural", etiqueta: "Cultural", cantidad: 24 },
    { id: "naturaleza", etiqueta: "Naturaleza", cantidad: 18 },
    { id: "aventura", etiqueta: "Aventura", cantidad: 15 },
    { id: "gastronomia", etiqueta: "Gastronomía", cantidad: 12 },
    { id: "historia", etiqueta: "Historia", cantidad: 20 },
    { id: "religioso", etiqueta: "Religioso", cantidad: 8 },
  ]

  const duraciones = [
    { id: "medio-dia", etiqueta: "Medio día" },
    { id: "dia-completo", etiqueta: "Día completo" },
    { id: "2-3-dias", etiqueta: "2-3 días" },
    { id: "semana", etiqueta: "Una semana" },
    { id: "mas-semana", etiqueta: "Más de una semana" },
  ]

  const manejarCambioCategoria = (idCategoria: string, marcado: boolean) => {
    const nuevasCategorias = marcado
      ? [...filtros.categorias, idCategoria]
      : filtros.categorias.filter((c) => c !== idCategoria)

    alCambiarFiltros({ ...filtros, categorias: nuevasCategorias })
  }

  const manejarCambioDuracion = (idDuracion: string, marcado: boolean) => {
    const nuevaDuracion = marcado ? [...filtros.duracion, idDuracion] : filtros.duracion.filter((d) => d !== idDuracion)

    alCambiarFiltros({ ...filtros, duracion: nuevaDuracion })
  }

  const manejarCambioPrecio = (valor: number[]) => {
    alCambiarFiltros({ ...filtros, rangoPrecios: [valor[0], valor[1]] })
  }

  const manejarCambioCalificacion = (valor: number[]) => {
    alCambiarFiltros({ ...filtros, calificacion: valor[0] })
  }

  return (
    <div className={`${estaAbierto ? "block" : "hidden"} lg:block`}>
      <Card className="sticky top-24 shadow-lg border-amber-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gradient-to-r from-amber-50 to-blue-50">
          <CardTitle className="font-heading font-bold text-xl text-gray-800">Filtros de Búsqueda</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={alLimpiarFiltros}
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-100 font-medium"
            >
              Limpiar todo
            </Button>
            {alCerrar && (
              <Button variant="ghost" size="sm" onClick={alCerrar} className="lg:hidden">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-8 p-6">
          {/* Rango de Precios */}
          <div className="space-y-4">
            <Label className="font-semibold text-gray-800 text-base">Precio por persona (USD)</Label>
            <div className="px-3">
              <Slider
                value={filtros.rangoPrecios}
                onValueChange={manejarCambioPrecio}
                max={500}
                min={20}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-3 font-medium">
                <span className="bg-amber-100 px-2 py-1 rounded">${filtros.rangoPrecios[0]}</span>
                <span className="bg-amber-100 px-2 py-1 rounded">${filtros.rangoPrecios[1]}+</span>
              </div>
            </div>
          </div>

          {/* Categorías */}
          <div className="space-y-4">
            <Label className="font-semibold text-gray-800 text-base">Tipo de experiencia</Label>
            <div className="space-y-3">
              {categorias.map((categoria) => (
                <div
                  key={categoria.id}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-amber-50 transition-colors"
                >
                  <Checkbox
                    id={categoria.id}
                    checked={filtros.categorias.includes(categoria.id)}
                    onCheckedChange={(marcado) => manejarCambioCategoria(categoria.id, !!marcado)}
                    className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                  />
                  <Label htmlFor={categoria.id} className="flex-1 text-sm cursor-pointer font-medium text-gray-700">
                    {categoria.etiqueta}
                  </Label>
                  <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full font-medium">
                    ({categoria.cantidad})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Calificación */}
          <div className="space-y-4">
            <Label className="font-semibold text-gray-800 text-base">Calificación mínima</Label>
            <div className="px-3">
              <Slider
                value={[filtros.calificacion]}
                onValueChange={manejarCambioCalificacion}
                max={5}
                min={1}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-3">
                <span>1★</span>
                <span className="font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
                  {filtros.calificacion}★ o más
                </span>
                <span>5★</span>
              </div>
            </div>
          </div>

          {/* Duración */}
          <div className="space-y-4">
            <Label className="font-semibold text-gray-800 text-base">Duración del tour</Label>
            <div className="space-y-3">
              {duraciones.map((duracion) => (
                <div
                  key={duracion.id}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Checkbox
                    id={duracion.id}
                    checked={filtros.duracion.includes(duracion.id)}
                    onCheckedChange={(marcado) => manejarCambioDuracion(duracion.id, !!marcado)}
                    className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <Label htmlFor={duracion.id} className="flex-1 text-sm cursor-pointer font-medium text-gray-700">
                    {duracion.etiqueta}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
