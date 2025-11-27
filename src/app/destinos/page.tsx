"use client";

import { Button } from "@/components/ui/button";
import { Navegacion } from "@/components/comunes/navegacion";
import { Breadcrumbs } from "@/components/comunes/breadcrumbs";
import { PiePagina } from "@/components/comunes/pie-pagina";
import { FiltrosBusqueda } from "@/components/destinos/filtros-busqueda";
import { EncabezadoResultados } from "@/components/destinos/encabezado-resultados";
import { TarjetaDestino } from "@/components/inicio/tarjeta-destino";
import { ItemListaDestino } from "@/components/destinos/item-lista-destino";

import { useState, useEffect, useMemo } from "react";
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

  const [serviciosOriginales, setServiciosOriginales] = useState<Servicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [categoriasAPI, setCategoriasAPI] = useState<string[]>([]);

  const manejarLimpiarFiltros = () => {
    setFiltros({
      rangoPrecios: [20, 500],
      categorias: [],
      calificacion: 1,
      duracion: [],
    });
  };

  const adaptarServicio = (apiData: Servicio): Servicio => ({
    id: apiData.id,
    titulo: apiData.titulo,
    precio_usd: apiData.precio_usd || "0.00",
    categoria: apiData.categoria,
    duracion: apiData.duracion || "1",
    descripcion:
      apiData.descripcion ||
      "Sin descripción disponible. Consulte más información en el detalle del servicio.",
    servicios_incluidos:
      apiData.servicios_incluidos && Array.isArray(apiData.servicios_incluidos)
        ? apiData.servicios_incluidos
        : [],
    estado: apiData.estado || "Activo",
    imagen_url: Array.isArray(apiData.imagen_url)
      ? apiData.imagen_url
      : apiData.imagen_url || "/placeholder.svg",
    proveedor: (apiData as any).proveedor || null,
    capacidad_max: (apiData as any).capacidad_max || 1,
    punto_encuentro: (apiData as any).punto_encuentro || "",
    created_at: apiData.created_at || "",
    updated_at: apiData.updated_at || "",
  });

  useEffect(() => {
    const fetchServicios = async () => {
      setCargando(true);
      try {
        const params = new URLSearchParams(window.location.search);
        const queryDestino = params.get("destino");

        const { obtenerDestinosIndividuales } = await import("@/api/paquetes");
        const response = await obtenerDestinosIndividuales({ estado: "Activo" });

        let resultados = response.results || serviciosFallback;

        if (queryDestino) {
          resultados = resultados.filter((d: any) =>
            d.titulo.toLowerCase().includes(queryDestino.toLowerCase())
          );
        }

        setServiciosOriginales(resultados.map((r: any) => adaptarServicio(r)));
      } catch (error) {
        console.error("❌ Error cargando destinos:", error);
        setServiciosOriginales(serviciosFallback);
      } finally {
        setCargando(false);
      }
    };

    fetchServicios();
  }, []);

  // FILTROS APLICADOS
  const serviciosFiltrados = useMemo(() => {
    let resultados = [...serviciosOriginales];

    // FILTRO: PRECIO
    resultados = resultados.filter(
      (s) =>
        Number(s.precio_usd) >= filtros.rangoPrecios[0] &&
        Number(s.precio_usd) <= filtros.rangoPrecios[1]
    );

    // FILTRO: CATEGORÍAS (MEJORADO)
if (filtros.categorias.length > 0) {
  resultados = resultados.filter((s) => {
    const nombreCat = s.categoria?.nombre?.toLowerCase() ?? "";

    return filtros.categorias.some((cat) => {
      const c = cat.toLowerCase();

      // Ecológica
      if (c === "ecologica") {
        return (
          nombreCat.includes("eco") ||
          nombreCat.includes("ecolog") ||
          nombreCat.includes("ambient") ||
          nombreCat.includes("sosten")
        );
      }

      // Naturaleza
      if (c === "naturaleza") {
        return (
          nombreCat.includes("natur") ||
          nombreCat.includes("fauna") ||
          nombreCat.includes("flora") ||
          nombreCat.includes("paisaje")
        );
      }

      // Cultural
      if (c === "cultural") {
        return nombreCat.includes("cultur");
      }

      // Aventura
      if (c === "aventura") {
        return nombreCat.includes("avent");
      }

      // Gastronomía
      if (c === "gastronomia") {
        return (
          nombreCat.includes("gastro") ||
          nombreCat.includes("comida") ||
          nombreCat.includes("culin")
        );
      }

      // Historia
      if (c === "historia") {
        return nombreCat.includes("hist");
      }

      // Religioso
      if (c === "religioso") {
        return nombreCat.includes("reli");
      }

      // Comparación estándar
      return nombreCat.includes(c);
    });
  });
}

    return resultados;
  }, [serviciosOriginales, filtros]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      <Navegacion />
      <Breadcrumbs />

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

          {/* Resultados */}
          <div className="flex-1">
            <EncabezadoResultados
              totalResultados={serviciosFiltrados.length}
              vistaActual={vistaActual}
              alCambiarVista={setVistaActual}
              alAlternarFiltros={() => setMostrarFiltros(!mostrarFiltros)}
              ordenarPor={ordenarPor}
              alCambiarOrden={setOrdenarPor}
            />

            {cargando ? (
              <div className="flex justify-center py-16">Cargando...</div>
            ) : (
              <div
                className={
                  vistaActual === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "space-y-6"
                }
              >
                {serviciosFiltrados.map((s) =>
                  vistaActual === "grid" ? (
                    <TarjetaDestino
                      key={s.id}
                      id={s.id}
                      nombre={s.titulo}
                      ubicacion={s.categoria?.nombre || "Sin categoría"}
                      descripcion={s.descripcion}
                      calificacion={4.5}
                      urlImagen={s.imagen_url}
                      precio={s.precio_usd}
                      duracion={s.duracion}
                    />
                  ) : (
                    <ItemListaDestino key={s.id} {...s} />
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <PiePagina />
    </div>
  );
}
