"use client";
// Página principal de paquetes turísticos
import React, { useEffect, useState } from "react";
import { Navegacion } from "@/components/comunes/navegacion";
import PaqueteCard from "@/components/PaqueteCard";
import PaqueteDetalleVista from "@/components/PaqueteDetalleVista";

interface Paquete {
  id: number;
  nombre: string;
  descripcion: string;
  duracion: string;
  precio_bob: string;
  imagen_principal: string; 
  punto_salida: string;
}



const PaquetesPage: React.FC = () => {
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paqueteSeleccionado, setPaqueteSeleccionado] = useState<Paquete | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://si-b-final-production.up.railway.app/api'}/paquetes/`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar paquetes");
        return res.json();
      })
      .then((data) => {
        setPaquetes(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("No se pudieron cargar los paquetes");
        setLoading(false);
      });
  }, []);

  const handleVerDetalle = (id: number) => {
    const paquete = paquetes.find((p) => p.id === id);
    if (paquete) setPaqueteSeleccionado(paquete);
  };

  const handleVolver = () => setPaqueteSeleccionado(null);

  return (
    <div className="w-full min-h-[80vh] bg-white">
      <Navegacion />
    {/* <p>{JSON.stringify(paquetes)}</p> */}
      {!paqueteSeleccionado ? (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Paquetes Turísticos</h1>
          {loading && <p className="text-center">Cargando paquetes...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paquetes.map((p) => (
              <PaqueteCard
                key={p.id}
                id={p.id}
                nombre={p.nombre}
                descripcion={p.descripcion}
                duracion={p.duracion}
                precio_bob={p.precio_bob}
                imagen_principal={p.imagen_principal}
                punto_salida={p.punto_salida}
                onVerDetalle={handleVerDetalle}
              />
            ))}
          </div>
        </div>
      ) : (
        <PaqueteDetalleVista paquete={paqueteSeleccionado} onBack={handleVolver} />
      )}
    </div>
  );
};

export default PaquetesPage;
