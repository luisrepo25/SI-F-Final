import React from "react";

interface PaqueteDetalleProps {
  paquete: {
    id: number;
    nombre: string;
    descripcion: string;
    duracion: string;
    precio_bob: string;
    imagen_principal: string;
    punto_salida: string;
    [key: string]: any;
  };
  onClose: () => void;
}

const PaqueteDetalleModal: React.FC<PaqueteDetalleProps> = ({ paquete, onClose }: PaqueteDetalleProps) => {
  if (!paquete) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>
        <img
          src={paquete.imagen_principal}
          alt={paquete.nombre}
          className="w-full h-64 object-cover rounded mb-4"
        />
        <h2 className="text-2xl font-bold mb-2">{paquete.nombre}</h2>
        <p className="mb-2 text-gray-700">{paquete.descripcion}</p>
        <div className="mb-2 text-sm text-gray-600">
          <span className="font-semibold">Duración:</span> {paquete.duracion}
        </div>
        <div className="mb-2 text-sm text-gray-600">
          <span className="font-semibold">Punto de salida:</span> {paquete.punto_salida}
        </div>
        <div className="mb-2 text-green-700 font-bold text-lg">
          Bs. {paquete.precio_bob}
        </div>
        {/* Puedes agregar más detalles aquí según lo que quieras mostrar */}
      </div>
    </div>
  );
};

export default PaqueteDetalleModal;
