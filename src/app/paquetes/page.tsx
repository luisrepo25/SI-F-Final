"use client";
// Página principal de paquetes turísticos
import React, { useEffect, useState } from "react";
import { Navegacion } from "@/components/comunes/navegacion";
import PaqueteCard from "@/components/PaqueteCard";
import PaqueteDetalleVista from "@/components/PaqueteDetalleVista";
import api from "@/api/axios";

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
    const fetchPaquetes = async () => {
      try {
        console.log("📡 Intentando obtener paquetes del backend...");
        const response = await api.get('paquetes/');
        console.log('✅ Paquetes cargados:', response.data);
        setPaquetes(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error('❌ Error al cargar paquetes:', err);
        
        // Si es un timeout o error de conexión, mostrar mensaje útil
        if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
          console.warn("⏱️ Timeout al conectar con el backend. Por favor:");
          console.warn("1. Asegúrate de que el backend Django está ejecutándose en http://localhost:8000");
          console.warn("2. Recarga la página cuando el backend esté disponible");
          setError("El servidor está tardando demasiado. Por favor, recarga la página.");
        } else {
          setError("No se pudieron cargar los paquetes");
        }
        setLoading(false);
      }
    };
    
    fetchPaquetes();
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
