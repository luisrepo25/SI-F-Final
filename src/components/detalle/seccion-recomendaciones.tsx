import { TarjetaDestino } from "../inicio/tarjeta-destino"

interface Recomendacion {
  id: string
  nombre: string
  ubicacion: string
  descripcion: string
  calificacion: number
  imagenUrl: string
  precio: string
}

interface PropsSeccionRecomendaciones {
  recomendaciones: Recomendacion[]
}

export function SeccionRecomendaciones({ recomendaciones }: PropsSeccionRecomendaciones) {
  return (
    <section className="py-12 animate-fade-in-up">
      <div className="mb-8">
        <h2 className="font-heading font-bold text-2xl text-foreground mb-2">Destinos relacionados</h2>
        <p className="text-muted-foreground">Otros lugares que podrían interesarte</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recomendaciones.map((recomendacion, index) => (
          <div key={recomendacion.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <TarjetaDestino
              id={Number(recomendacion.id)}
              nombre={recomendacion.nombre}
              ubicacion={recomendacion.ubicacion}
              descripcion={recomendacion.descripcion}
              calificacion={recomendacion.calificacion}
                urlImagen={recomendacion.imagenUrl}
              precio={recomendacion.precio}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
