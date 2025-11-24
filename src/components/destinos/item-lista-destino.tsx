import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Clock, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Servicio } from "@/lib/servicios";

export function ItemListaDestino({
  id,
  titulo,
  descripcion,
  imagen_url,
  categoria,
  precio_usd,
  duracion,
  capacidad_max,
}: Servicio) {
  const calificacion = 5; // temporal o futura propiedad del backend

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-fade-in">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Imagen principal */}
          <div className="relative w-full h-48 overflow-hidden sm:w-80 sm:h-auto">
            <Image
              src={Array.isArray(imagen_url) ? imagen_url[0] : imagen_url || "/placeholder.svg"}
              alt={titulo}
              fill
              className="object-cover w-full h-full"
            />
            <div className="absolute px-2 py-1 text-xs font-semibold rounded top-3 left-3 bg-primary text-primary-foreground">
              {typeof categoria === "string" ? categoria : categoria?.nombre}
            </div>
          </div>

          {/* Contenido */}
          <div className="flex flex-col justify-between flex-1 p-6">
            <div className="space-y-3">
              {/* Título */}
              <h3 className="text-xl font-bold transition-colors font-heading text-foreground hover:text-primary">
                <Link href={`/destinos/${id}`}>{titulo}</Link>
              </h3>

              {/* Descripción */}
              <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                {descripcion}
              </p>

              {/* Información rápida */}
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                {duracion && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {duracion}
                  </div>
                )}
                {capacidad_max && (
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    Hasta {capacidad_max} personas
                  </div>
                )}
              </div>

              {/* Calificación */}
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(calificacion)
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {calificacion.toFixed(1)} (
                  {Math.floor(Math.random() * 500) + 100} reseñas)
                </span>
              </div>
            </div>

            {/* Precio y botón */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t">
              <div className="text-right">
                <div className="text-2xl font-bold font-heading text-primary">
                  USD{" "}
                  {typeof precio_usd === "string"
                    ? precio_usd
                    : precio_usd}
                </div>
                <div className="text-xs text-muted-foreground">por persona</div>
              </div>
              <Link href={`/destinos/${id}`} className="w-full">
                <Button className="w-full mt-2 bg-blue-500 text-white hover:bg-blue-600">
                  Ver detalles
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
