"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Grid, List } from "lucide-react"

interface PropiedadesEncabezadoResultados {
  totalResultados: number
  vistaActual: "grid" | "list"
  alCambiarVista: (vista: "grid" | "list") => void
  alAlternarFiltros: () => void
  ordenarPor: string
  alCambiarOrden: (orden: string) => void
}

export function EncabezadoResultados({
  totalResultados,
  vistaActual,
  alCambiarVista,
  alAlternarFiltros,
  ordenarPor,
  alCambiarOrden,
}: PropiedadesEncabezadoResultados) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-fade-in">
      <div className="flex items-center space-x-4">
        <h1 className="font-heading font-bold text-2xl text-foreground">Destinos en Bolivia</h1>
        <span className="text-muted-foreground">{totalResultados} resultados encontrados</span>
      </div>

      <div className="flex items-center space-x-3">
        {/* Toggle de Filtros Móvil */}
        <Button
          variant="outline"
          size="sm"
          onClick={alAlternarFiltros}
          className="lg:hidden bg-transparent hover:bg-amber-50 transition-colors"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>

        {/* Ordenamiento */}
        <Select value={ordenarPor} onValueChange={alCambiarOrden}>
          <SelectTrigger className="w-48 hover:border-amber-300 transition-colors">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Más relevantes</SelectItem>
            <SelectItem value="rating">Mejor calificados</SelectItem>
            <SelectItem value="price-low">Precio: menor a mayor</SelectItem>
            <SelectItem value="price-high">Precio: mayor a menor</SelectItem>
            <SelectItem value="name">Nombre A-Z</SelectItem>
          </SelectContent>
        </Select>

        {/* Toggle de Vista */}
        <div className="hidden sm:flex border rounded-lg p-1 bg-white/80 backdrop-blur-sm">
          <Button
            variant={vistaActual === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => alCambiarVista("grid")}
            className="px-3 transition-all hover:scale-105"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={vistaActual === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => alCambiarVista("list")}
            className="px-3 transition-all hover:scale-105"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
