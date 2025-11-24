import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Navigation } from "lucide-react"

interface PropsMapaDestino {
  ubicacion: string
  coordenadas?: { lat: number; lng: number }
}

export function MapaDestino({ ubicacion, coordenadas }: PropsMapaDestino) {
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="font-heading font-bold text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Ubicación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-muted-foreground">{ubicacion}</div>

        {/* Mapa Simulado */}
        <div className="relative h-64 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-200/50 to-blue-200/50" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse">
            <div className="bg-primary text-primary-foreground p-2 rounded-full shadow-lg">
              <MapPin className="h-6 w-6" />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg text-sm">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-primary" />
              <span className="font-medium">{ubicacion}</span>
            </div>
          </div>
        </div>

        {coordenadas && (
          <div className="text-xs text-muted-foreground">
            Coordenadas: {coordenadas.lat.toFixed(6)}, {coordenadas.lng.toFixed(6)}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
