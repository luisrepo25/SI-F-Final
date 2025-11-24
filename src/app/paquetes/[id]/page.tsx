"use client";
// Página de detalle de un paquete turístico
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface ServicioIncluido {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  imagen_url: string;
  precio_usd: number;
}

interface Actividad {
  orden: number;
  hora_inicio: string;
  hora_fin: string;
  titulo: string;
  descripcion: string;
  punto_encuentro: string;
  notas: string;
  categoria: string;
}

interface DiaItinerario {
  dia: number;
  actividades: Actividad[];
}

interface PaqueteDetalle {
  id: number;
  nombre: string;
  descripcion: string;
  duracion: string;
  precio_bob: string;
  precio_base: string;
  imagen_principal: string;
  punto_salida: string;
  incluye: string[];
  no_incluye: string[];
  servicios_incluidos: ServicioIncluido[];
  itinerario: DiaItinerario[];
}

const DetallePaquetePage: React.FC = () => {
  const params = useParams();
  const id = params?.id;
  const [paquete, setPaquete] = useState<PaqueteDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/paquetes/${id}/`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar el paquete");
        return res.json();
      })
      .then((data) => {
        setPaquete(data);
        setLoading(false);
      })
      .catch(() => {
        setError("No se pudo cargar el paquete");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-8 text-center">Cargando...</div>;
  if (error || !paquete) return <div className="p-8 text-center text-red-500">{error || "No encontrado"}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <img
          src={paquete.imagen_principal}
          alt={paquete.nombre}
          className="w-full md:w-2/5 h-64 object-cover rounded-xl shadow"
        />
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{paquete.nombre}</h1>
          <p className="text-gray-700 mb-2">{paquete.descripcion}</p>
          <div className="flex flex-wrap gap-4 mb-2 text-sm text-gray-600">
            <span>⏱️ {paquete.duracion}</span>
            <span>📍 {paquete.punto_salida}</span>
            <span className="font-bold text-green-600">Bs. {paquete.precio_bob}</span>
            <span className="text-gray-400 line-through">USD {paquete.precio_base}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold">Incluye:</span>
            <ul className="list-disc ml-6 text-gray-700">
              {paquete.incluye.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="mb-2">
            <span className="font-semibold">No incluye:</span>
            <ul className="list-disc ml-6 text-gray-700">
              {paquete.no_incluye.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <button
            className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 text-lg"
            onClick={() => window.location.href = `/flujo-reserva-moderna?paquete=${paquete.id}`}
          >
            Reservar Paquete
          </button>
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-4">Servicios Incluidos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {paquete.servicios_incluidos.map((serv) => (
          <div key={serv.id} className="bg-white rounded-lg shadow p-4 flex gap-4">
            <img src={serv.imagen_url} alt={serv.titulo} className="w-24 h-24 object-cover rounded" />
            <div>
              <h3 className="font-bold text-lg">{serv.titulo}</h3>
              <p className="text-gray-600 text-sm mb-1">{serv.descripcion}</p>
              <span className="text-xs text-gray-500">{serv.categoria}</span>
              <div className="font-semibold text-green-700">USD {serv.precio_usd}</div>
            </div>
          </div>
        ))}
      </div>
      <h2 className="text-2xl font-bold mb-4">Itinerario</h2>
      <div className="space-y-4">
        {paquete.itinerario.map((dia) => (
          <div key={dia.dia} className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Día {dia.dia}</h4>
            <ul className="space-y-2">
              {dia.actividades.map((act, i) => (
                <li key={i} className="border-l-4 border-orange-400 pl-4">
                  <div className="flex flex-wrap gap-2 items-center text-sm mb-1">
                    <span className="font-bold">{act.titulo}</span>
                    <span className="text-gray-500">{act.categoria}</span>
                    <span>🕒 {act.hora_inicio} - {act.hora_fin}</span>
                  </div>
                  <div className="text-gray-700 text-sm">{act.descripcion}</div>
                  <div className="text-xs text-gray-500">Punto de encuentro: {act.punto_encuentro}</div>
                  <div className="text-xs text-gray-400 italic">{act.notas}</div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DetallePaquetePage;
