import React, { useState, useEffect } from "react";
// Asumo que estas importaciones son correctas y que RecomendacionResponseBySession
// puede tener las propiedades `recommendation` y `error`.
import {
  obtenerRecomendacionPorSession,
  RecomendacionResponseBySession,
  ItemRecomendacion,
} from "@/api/recomendaciones";

interface RecomendacionesEquipajeProps {
  reservaId: number;
  className?: string;
}

// CORRECCIÓN 1: Se quita React.FC y se tipan las props directamente.
// Esto soluciona el error TS7031 y es la forma moderna de tipar componentes.
const RecomendacionesEquipaje = ({
  reservaId,
  className = "",
}: RecomendacionesEquipajeProps) => {
  const [recomendacion, setRecomendacion] =
    useState<RecomendacionResponseBySession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarRecomendacion = async () => {
      try {
        setLoading(true);
        setError(null); // Limpiar errores anteriores
        const data = await obtenerRecomendacionPorSession(reservaId.toString());
        setRecomendacion(data);

        // CORRECCIÓN 2: El error TS2339 indica que 'data.estado' no existe.
        // Asumimos que si hay un error a nivel de API, vendrá en una propiedad 'error'.
        if (data.error) {
          setError(data.error || "Error al generar recomendación");
        }
      } catch (err) {
        // Este catch maneja errores de red o si la petición falla
        setError("No se pudo cargar la recomendación de equipaje");
      } finally {
        setLoading(false);
      }
    };

    cargarRecomendacion();
  }, [reservaId]);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // CORRECCIÓN 2: El estado de error ahora se maneja únicamente con
  // la variable 'error'. La comprobación 'recomendacion?.estado === 'ERROR''
  // se elimina porque 'estado' no existe.
  if (error || recomendacion?.error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <p className="text-red-800 text-sm">
          {error || recomendacion?.error || 'Error al cargar recomendaciones'}
        </p>
      </div>
    );
  }

  // CORRECCIÓN 2: El bloque 'PENDIENTE' se elimina porque 'recomendacion.estado' no existe.
  // La lógica siguiente (recomendacion?.recommendation) manejará el caso
  // en que la recomendación aún no esté lista.

  // CORRECCIÓN 3: Se comprueba 'recommendation' (con doble 'm').
  // Este bloque ahora se encarga de los casos en que la carga finalizó,
  // no hay errores, pero la recomendación aún no existe (está pendiente o no generada).
  if (!recomendacion?.recommendation) {
    return (
      <div
        className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}
      >
        <p className="text-gray-600 text-center text-sm">
          La recomendación de equipaje se está generando o no está disponible.
        </p>
      </div>
    );
  }

  // CORRECCIÓN 3: Se accede a 'recommendation' (con doble 'm')
  // para solucionar el error TS2551.
  const { texto, items } = recomendacion.recommendation;

  return (
    <div className={`bg-white rounded-lg border p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🎒</span>
        <h3 className="font-semibold text-gray-900">
          Recomendaciones de Equipaje
        </h3>
      </div>
      <p className="text-gray-600 text-sm mb-4">{texto}</p>

      <div className="space-y-4">
        {items.map((categoria: ItemRecomendacion, index: number) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">
                {categoria.categoria}
              </h4>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  categoria.prioridad.toLowerCase() === "alta"
                    ? "bg-red-100 text-red-800"
                    : categoria.prioridad.toLowerCase() === "media"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                Prioridad {categoria.prioridad}
              </span>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-1">
              {categoria.items.map((item: string, itemIndex: number) => (
                <li
                  key={itemIndex}
                  className="flex items-center gap-2 text-sm p-1 rounded"
                >
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecomendacionesEquipaje;
