"use client";

import { Button } from "@/components/ui/button";
import { Navegacion } from "@/components/comunes/navegacion";
import { Breadcrumbs } from "@/components/comunes/breadcrumbs";
import { PiePagina } from "@/components/comunes/pie-pagina";
import { FiltrosBusqueda } from "@/components/destinos/filtros-busqueda";
import { EncabezadoResultados } from "@/components/destinos/encabezado-resultados";
import { TarjetaDestino } from "@/components/inicio/tarjeta-destino";
import { ItemListaDestino } from "@/components/destinos/item-lista-destino";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Servicio } from "@/lib/servicios";
import { serviciosFallback } from "@/lib/servicios-fallback";

export default function PaginaDestinos() {
  const { toast } = useToast();
  const [filtros, setFiltros] = useState({
    rangoPrecios: [20, 500] as [number, number],
    categorias: [] as string[],
    calificacion: 1,
    duracion: [] as string[],
  });

  const [vistaActual, setVistaActual] = useState<"grid" | "list">("grid");
  const [ordenarPor, setOrdenarPor] = useState("relevancia");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [Servicios, setServicios] = useState<Servicio[]>([]);
  const [cargando, setCargando] = useState(true);

  const manejarLimpiarFiltros = () => {
    setFiltros({
      rangoPrecios: [20, 500],
      categorias: [],
      calificacion: 1,
      duracion: [],
    });
  };

  /**
   * 🔁 Adaptador: convierte los datos del backend a la interfaz Servicio del frontend
   */
  const adaptarServicio = (apiData: Servicio): Servicio => {
    return {
      id: apiData.id,
      titulo: apiData.titulo,
      precio_usd:apiData.precio_usd || "0.00",
      categoria: apiData.categoria, 
      duracion: apiData.duracion
        ? apiData.duracion
        : "1", 
      descripcion:
        apiData.descripcion ||
        "Sin descripción disponible. Consulte más información en el detalle del servicio.",
      servicios_incluidos:
        apiData.servicios_incluidos && Array.isArray(apiData.servicios_incluidos)
          ? apiData.servicios_incluidos
          : [],
      estado: apiData.estado || "Activo",
      // normalizar imagen_url: aceptar string o string[] según lo que venga
      imagen_url: Array.isArray(apiData.imagen_url)
        ? apiData.imagen_url
        : apiData.imagen_url
        ? apiData.imagen_url
        : "/placeholder.svg",
      proveedor: (apiData as any).proveedor || { id: 0, rol: { id: 0, created_at: null, updated_at: null, nombre: 'Proveedor' }, created_at: null, updated_at: null, nombre: 'Proveedor', rubro: null, num_viajes: 0, telefono: null, fecha_nacimiento: null, genero: null, documento_identidad: null, pais: null, user: 0 },
      capacidad_max: (apiData as any).capacidad_max || 1,
      punto_encuentro: (apiData as any).punto_encuentro || '',
      created_at: apiData.created_at || "",
      updated_at: apiData.updated_at || "",
    };
  };

  /**
   * 📡 Fetch de destinos individuales desde la NUEVA API
   */
  useEffect(() => {
  const fetchServicios = async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const destino = params.get("destino");
      const fechaInicio = params.get("fechaInicio");
      const fechaFin = params.get("fechaFin");

      console.log("🧭 Filtros de búsqueda:", { destino, fechaInicio, fechaFin });

      const { obtenerDestinosIndividuales } = await import("@/api/paquetes");
      const response = await obtenerDestinosIndividuales({ estado: "Activo" });

      let resultados = response.results || serviciosFallback;

      // 🔍 Filtrar por destino (ubicación)
      if (destino) {
        resultados = resultados.filter((d: any) =>
          d.titulo.toLowerCase().includes(destino.toLowerCase()) ||
          d.categoria?.nombre?.toLowerCase().includes(destino.toLowerCase())
        );
      }

      // (Opcional) si querés filtrar por fecha (si tu backend lo soporta, se puede integrar)
      // Por ahora, solo filtramos por destino textual.

      if (resultados.length === 0) {
        toast({
          title: "Sin resultados",
          description: `No se encontraron destinos para "${destino}"`,
          variant: "destructive",
        });
      }

      setServicios(resultados.map((r: any) => adaptarServicio(r)));
    } catch (error) {
      console.error("❌ Error cargando destinos:", error);
      setServicios(serviciosFallback);
    } finally {
      setCargando(false);
    }
  };

  fetchServicios();
}, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      <Navegacion />
      <Breadcrumbs />

      {/* Contenido principal */}
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Panel de filtros */}
          <div className="lg:w-80">
            <FiltrosBusqueda
              filtros={filtros}
              alCambiarFiltros={setFiltros}
              alLimpiarFiltros={manejarLimpiarFiltros}
              estaAbierto={mostrarFiltros}
            />
          </div>

          {/* Listado de resultados */}
          <div className="flex-1">
            <EncabezadoResultados
              totalResultados={Servicios.length}
              vistaActual={vistaActual}
              alCambiarVista={setVistaActual}
              alAlternarFiltros={() => setMostrarFiltros(!mostrarFiltros)}
              ordenarPor={ordenarPor}
              alCambiarOrden={setOrdenarPor}
            />

            {cargando ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando destinos...</p>
                </div>
              </div>
            ) : (
              <div
                className={
                  vistaActual === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "space-y-6"
                }
              >
                {Servicios.map((servicio) =>
                  vistaActual === "grid" ? (
                    <TarjetaDestino
                      key={servicio.id}
                      id={servicio.id}
                      nombre={servicio.titulo}
                      ubicacion={servicio.categoria?.nombre || "Sin categoría"}
                      descripcion={servicio.descripcion}
                      calificacion={4.5}
                      urlImagen={servicio.imagen_url || "/placeholder.svg"}
                      precio={servicio.precio_usd}
                      duracion={servicio.duracion}
                    />
                  ) : (
                    <ItemListaDestino key={servicio.id} {...servicio} />
                  )
                )}
              </div>
            )}

            {/* Estado vacío */}
            {!cargando && Servicios.length === 0 && (
              <div className="py-16 text-center bg-white border shadow-sm rounded-xl border-amber-200">
                <div className="max-w-md mx-auto">
                  <h3 className="mb-3 text-2xl font-bold text-gray-800 font-heading">
                    No se encontraron servicios
                  </h3>
                  <p className="mb-6 text-lg text-gray-600">
                    Intenta ajustar tus filtros para ver más resultados
                  </p>
                  <Button
                    onClick={manejarLimpiarFiltros}
                    className="px-6 py-3 font-semibold text-white rounded-lg bg-amber-500 hover:bg-amber-600"
                  >
                    Limpiar todos los filtros
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

  

      <PiePagina />
    </div>
  );
}
