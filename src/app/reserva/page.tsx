"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import FlujoReservaModerno from "@/components/flujo-reserva-moderno";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Navegacion } from "@/components/comunes/navegacion";
import { PiePagina } from "@/components/comunes/pie-pagina";
import { Breadcrumbs } from "@/components/comunes/breadcrumbs";



export default function PaginaReserva() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [servicio, setServicio] = useState<{ id: number; nombre: string; precio: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const params = useSearchParams();
 


  useEffect(() => {
    const id = Number(searchParams.get("servicio"));
    const nombre = searchParams.get("nombre");
    const precioParam = searchParams.get("precio");

    if (!id) {
      setError("No se especificó un servicio para reservar.");
      setCargando(false);
      return;
    }

    // ✅ Intentar con datos de URL primero
    if (nombre && precioParam) {
      console.log("💰 Precio recibido desde URL:", precioParam);
      
      // Limpiar y convertir precio correctamente
      let precioLimpio = precioParam;
      
      // Si viene como "Bs. 500" o "Bs.500", extraer solo el número
      if (precioParam.includes("Bs.") || precioParam.includes("Bs ")) {
        precioLimpio = precioParam.replace(/Bs\.?\s*/i, "").trim();
      }
      
      // Remover cualquier caracter que no sea número, punto o coma
      precioLimpio = precioLimpio.replace(/[^\d.,]/g, "");
      
      // Reemplazar coma por punto para parsing
      precioLimpio = precioLimpio.replace(",", ".");
      
      const precio = parseFloat(precioLimpio);
      
      console.log("💰 Precio limpio extraído:", precioLimpio);
      console.log("💰 Precio parseado:", precio);
      
      setServicio({ id, nombre, precio: isNaN(precio) ? 0 : precio });
      setCargando(false);
      return;
    }

    setCargando(false);
  }, [searchParams]);

  const manejarReservaCompleta = (codigo: string) => {
    console.log("✅ Reserva completada:", codigo);
    router.push("/cliente?tab=reservas");
  };

  // 🌀 Pantalla de carga rápida
  if (cargando)
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 to-amber-50">
        <Navegacion />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-10 w-10 border-b-2 border-orange-600 rounded-full mx-auto" />
            <p className="mt-4 text-gray-600">Cargando servicio...</p>
          </div>
        </div>
        <PiePagina />
      </div>
    );

  // ⚠️ Error
  if (error || !servicio)
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 to-amber-50">
        <Navegacion />
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <Alert className="mb-6 max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "Error cargando servicio"}</AlertDescription>
          </Alert>
          <p className="text-gray-600 mb-4">Selecciona un paquete o destino para continuar.</p>
          <div className="flex gap-3 flex-col sm:flex-row">
            <button
              onClick={() => router.push("/paquetes")}
              className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition"
            >
              Ver Paquetes
            </button>
            <button
              onClick={() => router.push("/destinos")}
              className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition"
            >
              Ver Destinos
            </button>
          </div>
        </div>
        <PiePagina />
      </div>
    );

  // ✅ Vista principal optimizada
  return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 to-amber-50">
        <Navegacion />
        <div className="flex-1 container mx-auto px-4 py-8">
          <Breadcrumbs />
          <div className="mt-10 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Reservar: {servicio.nombre}</h1>
            <p className="text-gray-600 mt-2">Experiencia Turística en Bolivia</p>
          </div>

          <div className="mt-8">
            <FlujoReservaModerno
              servicioSeleccionado={servicio}
              onReservaCompleta={manejarReservaCompleta}
              numeroPersonas={parseInt(searchParams.get("personas") || "1")} // 🔹 nuevo parámetro
            />
          </div>
        </div>
        <PiePagina />
      </div>
  );
}
