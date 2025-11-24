"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import Image from "next/image";
import { Servicio } from "@/lib/servicios";
import { useRouter } from "next/navigation";

interface PropsTarjetaDestino {
  id: number | string;
  nombre: string;
  ubicacion: string;
  descripcion: string;
  calificacion: number;
  urlImagen: string;
  precio?: string;
  reseñas?: number;
  duracion?: string;
}

export function TarjetaDestino({
  id,
  nombre,
  
  descripcion,
  calificacion,
  urlImagen,
  precio,
  reseñas = 0,
}: PropsTarjetaDestino) {
  const router = useRouter();
  const calificacionSegura = Math.max(0, Math.min(5, calificacion || 0));
  
  const handleVerDetalles = () => {
    router.push(`/destinos/${id}`);
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 bg-white border-0 shadow-lg group hover:shadow-xl hover:-translate-y-1 animate-fade-in">
      {/* Imagen */}
      <div className="relative h-64 overflow-hidden">
           <Image
             src={urlImagen || "/placeholder.svg"}
             alt={nombre}
             fill
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
        {precio && (
          <div className="absolute px-3 py-1 text-sm font-semibold text-white rounded-full shadow-lg top-4 right-4 bg-amber-500">
            USD. {precio}
          </div>
        )}
      </div>

      <CardContent className="p-6 space-y-4">
        {/* Ubicación */}
        {/* <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mr-1" />
          {ubicacion}
        </div> */}

        {/* Título */}
        <h3 className="text-xl font-bold transition-colors font-heading text-foreground group-hover:text-amber-600">
          {nombre}
        </h3>

        {/* Descripción */}
        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {descripcion}
        </p>

        {/* Calificación */}
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < Math.floor(calificacionSegura)
                  ? "text-amber-400 fill-amber-400"
                  : "text-gray-300"
              }`}
            />
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            {calificacionSegura.toFixed(1)} ({reseñas} reseñas)
          </span>
        </div>

        {/* Botón de acción */}
        <Button
          onClick={handleVerDetalles}
          className="w-full mt-2 bg-blue-500 text-white"
        >
          Ver detalles
        </Button>
      </CardContent>
    </Card>
  );
}
