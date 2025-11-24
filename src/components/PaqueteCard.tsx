// Componente de tarjeta para mostrar un paquete turístico en el grid principal
import React from "react";

interface PaqueteCardProps {
  id: number;
  nombre: string;
  descripcion: string;
  duracion: string;
  precio_bob: string;
  imagen_principal: string;
  punto_salida: string;
  onVerDetalle: (id: number) => void;
}

const PaqueteCard: React.FC<PaqueteCardProps> = ({
  id,
  nombre,
  descripcion,
  duracion,
  precio_bob,
  imagen_principal,
  punto_salida,
  onVerDetalle,
}: PaqueteCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full">
      <img
        src={imagen_principal}
        alt={nombre}
        className="w-full h-48 object-cover"
        loading="lazy"
      />
      <div className="p-4 flex flex-col flex-1">
        <h2 className="font-bold text-lg mb-1">{nombre}</h2>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{descripcion}</p>
        <div className="flex items-center text-xs text-gray-500 mb-2 gap-2">
          <span>⏱️ {duracion}</span>
          <span>•</span>
          <span>📍 {punto_salida}</span>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <span className="font-bold text-green-600 text-base">Bs. {precio_bob}</span>
          <button
            className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded transition"
            onClick={() => onVerDetalle(id)}
          >
            Ver Detalles
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaqueteCard;
