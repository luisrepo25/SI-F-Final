
import React from "react";
import { useRouter } from "next/navigation";

interface PaqueteDetalleProps {
  paquete: {
    id: number;
    nombre: string;
    descripcion: string;
    duracion: string;
    precio_bob: string;
    imagen_principal: string;
    punto_salida: string;
    estado?: string;
    rating?: number;
    reviews?: number;
    max_personas?: number;
    incluye?: string[];
    no_incluye?: string[];
    servicios_incluidos?: any[];
    itinerario?: any[];
    precios?: any;
    disponibilidad?: any;
    imagenes_secundarias?: string[];
    [key: string]: any;
  };
  onBack: () => void;
}

const PaqueteDetalleVista: React.FC<PaqueteDetalleProps> = ({ paquete, onBack }: PaqueteDetalleProps) => {
  const router = useRouter();
  if (!paquete) return null;
  // Galería: principal + secundarias si existen
  const imagenes = [paquete.imagen_principal, ...(paquete.imagenes_secundarias || [])];
  // Simulación de rating y etiquetas (puedes adaptar a tu modelo real)
  const rating = paquete.rating || 4.5;
  const reviews = paquete.reviews || 25;
  const maxPersonas = paquete.max_personas || (paquete.disponibilidad?.cupos_disponibles ?? 20);
  const etiquetas = ["Paquete Turístico", paquete.estado || "Activo"];
  const ubicacion = paquete.punto_salida || "";
  // Servicios incluidos
  const servicios = paquete.servicios_incluidos || [];
  // Itinerario
  const itinerario = paquete.itinerario || [];
  // Precios
  const precios = paquete.precios || {};
  // Disponibilidad
  const disponibilidad = paquete.disponibilidad || {};

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4">
      <button className="mb-4 text-sm text-gray-500 hover:text-orange-600" onClick={onBack}>&larr; Volver a paquetes</button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Galería de imágenes */}
        <div className="col-span-1 flex flex-col items-center min-w-[320px]">
          <img src={imagenes[0]} alt={paquete.nombre} className="rounded-2xl w-full max-w-md h-80 md:h-96 object-cover mb-4 shadow-lg" />
          <div className="flex gap-2">
            {imagenes.map((img: string, idx: number) => (
              <img key={idx} src={img} alt={paquete.nombre + idx} className="w-16 h-16 object-cover rounded border cursor-pointer" />
            ))}
          </div>
        </div>
        {/* Info principal */}
        <div className="col-span-2 flex flex-col gap-4 min-w-[320px]">
          <div className="flex gap-2 items-center mb-1 flex-wrap">
            {etiquetas.map((et, i) => (
              <span key={i} className={`px-2 py-1 rounded text-xs font-semibold ${i === 0 ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>{et}</span>
            ))}
            <span className="ml-2 text-yellow-600 font-bold flex items-center text-sm">
              ★ {rating} <span className="ml-1 text-gray-500 font-normal">({reviews} reseñas)</span>
            </span>
          </div>
          <h2 className="text-4xl font-bold mb-1 leading-tight">{paquete.nombre}</h2>
          <div className="flex items-center gap-2 text-gray-600 mb-2 flex-wrap">
            <span className="text-base">📍 {ubicacion}</span>
          </div>
          <p className="text-gray-700 mb-2 text-lg max-w-2xl">{paquete.descripcion}</p>
          <div className="flex gap-4 mb-2 flex-wrap">
            <div className="bg-gray-100 rounded px-4 py-2 text-base flex items-center gap-2">
              <span className="text-blue-700">⏰</span> <b>{paquete.duracion}</b>
            </div>
            <div className="bg-gray-100 rounded px-4 py-2 text-base flex items-center gap-2">
              <span className="text-green-700">👥</span> Máx. personas <b>{maxPersonas}</b>
            </div>
          </div>
          <div className="bg-purple-50 rounded-2xl p-8 flex flex-col items-center mb-2 shadow max-w-lg border border-purple-200">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl font-semibold text-purple-700">Precio por persona</span>
              {precios.descuento_aplicado > 0 && (
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">-{precios.porcentaje_descuento}%</span>
              )}
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-5xl font-extrabold text-purple-800 leading-none">Bs. {precios.precio_bob ?? paquete.precio_bob}</span>
              {precios.precio_original_usd && (
                <span className="text-base text-gray-400 line-through">USD {precios.precio_original_usd}</span>
              )}
            </div>
            <button
              className="mt-4 w-full max-w-xs py-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-xl font-bold shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              onClick={() => {
                const params = new URLSearchParams({
                  servicio: String(paquete.id),
                  nombre: paquete.nombre,
                  precio: String(precios.precio_bob ?? paquete.precio_bob),
                });
                router.push(`/reserva?${params.toString()}`);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3-3-1.343-3-3zm0 0V7m0 4v4m0 0c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z" />
              </svg>
              Reservar Paquete
            </button>
          </div>
          {/* Disponibilidad */}
          <div className="flex gap-4 text-sm text-gray-600 flex-wrap">
            <span>Cupos disponibles: <b>{disponibilidad.cupos_disponibles}</b></span>
            <span>Cupos ocupados: <b>{disponibilidad.cupos_ocupados}</b></span>
            <span>Vigente: <b>{disponibilidad.esta_vigente ? 'Sí' : 'No'}</b></span>
          </div>
          {/* Servicios incluidos e Itinerario en grid horizontal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {servicios.length > 0 && (
              <div>
                <h3 className="font-bold text-blue-700 mb-2 flex items-center gap-2 text-lg">🧩 Servicios incluidos</h3>
                <div className="grid grid-cols-1 gap-3">
                  {servicios.map((s: any) => (
                    <div key={s.id} className="flex gap-3 items-center bg-blue-50 rounded p-2">
                      <img src={s.imagen_url} alt={s.titulo} className="w-12 h-12 object-cover rounded" />
                      <div>
                        <div className="font-semibold text-blue-900 text-sm">{s.titulo}</div>
                        <div className="text-xs text-gray-600 mb-1">{s.categoria}</div>
                        <div className="text-xs text-gray-700">{s.descripcion}</div>
                        {s.precio_usd && <div className="text-xs text-purple-700 mt-1">USD {s.precio_usd}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {itinerario.length > 0 && (
              <div>
                <h3 className="font-bold text-indigo-700 mb-2 flex items-center gap-2 text-lg">🗺️ Itinerario</h3>
                <div className="space-y-2">
                  {itinerario.map((dia: any, idx: number) => (
                    <div key={idx} className="bg-indigo-50 rounded p-2">
                      <div className="font-semibold text-indigo-900 mb-1 text-sm">Día {dia.dia}</div>
                      <ul className="ml-5 list-disc text-xs text-gray-700">
                        {(dia.actividades || []).map((act: any, i: number) => (
                          <li key={i}>
                            <span className="font-semibold">{act.titulo}</span>: {act.descripcion} <span className="text-xs text-gray-500">({act.hora_inicio} - {act.hora_fin})</span>
                            <div className="text-xs text-gray-500">Punto de encuentro: {act.punto_encuentro}</div>
                            {act.notas && <div className="text-xs text-gray-400">Notas: {act.notas}</div>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Incluye / No incluye */}
      <div className="flex flex-col md:flex-row gap-6 mt-8">
        <div className="flex-1 bg-white rounded-xl p-6 border shadow">
          <h3 className="font-bold text-green-700 mb-3 flex items-center gap-2 text-lg">✔️ Qué incluye este paquete</h3>
          <ul className="list-disc ml-5 text-base text-gray-700 space-y-1">
            {(paquete.incluye || []).map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="flex-1 bg-white rounded-xl p-6 border shadow">
          <h3 className="font-bold text-red-700 mb-3 flex items-center gap-2 text-lg">❌ No incluye</h3>
          <ul className="list-disc ml-5 text-base text-gray-700 space-y-1">
            {(paquete.no_incluye || []).map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaqueteDetalleVista;
