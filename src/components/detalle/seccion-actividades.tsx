import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Camera, Utensils } from "lucide-react"

interface Actividad {
  id: string
  nombre: string
  duracion: string
  dificultad: "Fácil" | "Moderado" | "Difícil"
  icono: "camera" | "utensils" | "users" | "clock"
}

interface PropsSeccionActividades {
  actividades: Actividad[]
}

const mapaIconos = {
  camera: Camera,
  utensils: Utensils,
  users: Users,
  clock: Clock,
}

export function SeccionActividades({ actividades }: PropsSeccionActividades) {
  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle className="font-heading font-bold text-lg">Actividades incluidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actividades.map((actividad) => {
            const ComponenteIcono = mapaIconos[actividad.icono]
            return (
              <div
                key={actividad.id}
                className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200"
              >
                <div className="bg-amber-500/10 p-2 rounded-lg">
                  <ComponenteIcono className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-semibold text-sm">{actividad.nombre}</h4>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {actividad.duracion}
                    </Badge>
                    <Badge
                      variant={
                        actividad.dificultad === "Fácil"
                          ? "default"
                          : actividad.dificultad === "Moderado"
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-xs"
                    >
                      {actividad.dificultad}
                    </Badge>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
