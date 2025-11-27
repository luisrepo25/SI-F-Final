"use client";

import { useEffect, useState, useMemo } from "react";
import { servicioSuscripciones, Suscripcion } from "@/api/lista-subs.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type EstadoFiltro = "todas" | "activas" | "vencidas" | "por_vencer";
type OrdenFiltro =
  | "recientes"
  | "proximas_vencer"
  | "precio_mayor"
  | "precio_menor";

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

export default function ListaSubsPage() {
  const [subs, setSubs] = useState<Suscripcion[]>([]);
  const [loading, setLoading] = useState(true);

  // filtros
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>("todas");
  const [orden, setOrden] = useState<OrdenFiltro>("recientes");
  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");

  useEffect(() => {
    const cargarSuscripciones = async () => {
      setLoading(true);
      const data = await servicioSuscripciones.listarSuscripciones();
      setSubs(data);
      setLoading(false);
    };
    cargarSuscripciones();
  }, []);

  const subsFiltradas = useMemo(() => {
    const ahora = new Date();

    let resultado = [...subs];

    // 🔍 Filtro por texto (nombre de proveedor o sitio web)
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      resultado = resultado.filter((s) => {
        const nombre = s.proveedor?.nombre_empresa?.toLowerCase() ?? "";
        const web = s.proveedor?.sitio_web?.toLowerCase() ?? "";
        return nombre.includes(q) || web.includes(q);
      });
    }

    // 📅 Filtro por rango de fechas (fecha_inicio)
    const dDesde = fechaDesde ? new Date(fechaDesde) : null;
    const dHasta = fechaHasta ? new Date(fechaHasta) : null;

    if (dDesde || dHasta) {
      resultado = resultado.filter((s) => {
        const fi = parseDate(s.fecha_inicio);
        if (!fi) return false;
        if (dDesde && fi < dDesde) return false;
        if (dHasta && fi > dHasta) return false;
        return true;
      });
    }

    // 🎛️ Filtro por estado
    resultado = resultado.filter((s) => {
      const fin = parseDate(s.fecha_fin);
      const esActiva = !!s.activa && fin !== null && fin >= ahora;
      const esVencida = fin !== null && fin < ahora;

      if (estadoFiltro === "activas") return esActiva;
      if (estadoFiltro === "vencidas") return esVencida;
      if (estadoFiltro === "por_vencer") {
        if (!fin) return false;
        const diffMs = fin.getTime() - ahora.getTime();
        const dias = diffMs / (1000 * 60 * 60 * 24);
        return esActiva && dias <= 30;
      }
      return true; // "todas"
    });

    // ↕️ Orden
    resultado.sort((a, b) => {
      const faIni = parseDate(a.fecha_inicio);
      const fbIni = parseDate(b.fecha_inicio);
      const faFin = parseDate(a.fecha_fin);
      const fbFin = parseDate(b.fecha_fin);

      if (orden === "recientes") {
        // fecha_inicio descendente
        return (fbIni?.getTime() || 0) - (faIni?.getTime() || 0);
      }

      if (orden === "proximas_vencer") {
        // fecha_fin ascendente
        return (faFin?.getTime() || Infinity) - (fbFin?.getTime() || Infinity);
      }

      if (orden === "precio_mayor") {
        return (b.plan.precio || 0) - (a.plan.precio || 0);
      }

      if (orden === "precio_menor") {
        return (a.plan.precio || 0) - (b.plan.precio || 0);
      }

      return 0;
    });

    return resultado;
  }, [subs, busqueda, estadoFiltro, orden, fechaDesde, fechaHasta]);

  return (
    <div className="p-6 space-y-6">
      {/* Título */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Suscripciones</h1>
        <p className="text-muted-foreground">
          Lista de proveedores con sus suscripciones activas e históricas.
        </p>
      </div>

      {/* Filtros */}
      <Card className="border-muted">
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Buscador */}
            <div className="space-y-1">
              <Label htmlFor="busqueda">Buscar proveedor / sitio web</Label>
              <Input
                id="busqueda"
                placeholder="Ej: Mi Empresa, misitio.com..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {/* Estado */}
            <div className="space-y-1">
              <Label>Estado</Label>
              <Select
                value={estadoFiltro}
                onValueChange={(v) => setEstadoFiltro(v as EstadoFiltro)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="activas">Activas</SelectItem>
                  <SelectItem value="por_vencer">Por vencer (30 días)</SelectItem>
                  <SelectItem value="vencidas">Vencidas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fecha desde */}
            <div className="space-y-1">
              <Label htmlFor="fecha-desde">Inicio desde</Label>
              <Input
                id="fecha-desde"
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
            </div>

            {/* Fecha hasta */}
            <div className="space-y-1">
              <Label htmlFor="fecha-hasta">Inicio hasta</Label>
              <Input
                id="fecha-hasta"
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
            </div>

            {/* Orden */}
            <div className="space-y-1 md:col-span-2 lg:col-span-4">
              <Label>Ordenar por</Label>
              <Select
                value={orden}
                onValueChange={(v) => setOrden(v as OrdenFiltro)}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Más recientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recientes">Más recientes (inicio)</SelectItem>
                  <SelectItem value="proximas_vencer">
                    Próximas a vencer
                  </SelectItem>
                  <SelectItem value="precio_mayor">
                    Precio: mayor a menor
                  </SelectItem>
                  <SelectItem value="precio_menor">
                    Precio: menor a mayor
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estados de carga / vacío */}
      {loading && (
        <p className="text-muted-foreground">Cargando suscripciones...</p>
      )}

      {!loading && subsFiltradas.length === 0 && (
        <p className="text-muted-foreground">
          No se encontraron suscripciones con los filtros aplicados.
        </p>
      )}

      {/* Grid responsive de tarjetas */}
      {!loading && subsFiltradas.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {subsFiltradas.map((s) => {
            const fin = parseDate(s.fecha_fin);
            const hoy = new Date();
            const esVencida = fin !== null && fin < hoy;
            const esPorVencer =
              fin !== null &&
              fin >= hoy &&
              (fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24) <= 30;

            return (
              <Card
                key={s.id}
                className="shadow-sm transition hover:shadow-md hover:border-primary/40"
              >
                <CardHeader className="space-y-1">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>{s.proveedor?.nombre_empresa || "Proveedor sin nombre"}</span>
                    <span
                      className={
                        esVencida
                          ? "rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700"
                          : esPorVencer
                          ? "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700"
                          : s.activa
                          ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
                          : "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                      }
                    >
                      {esVencida
                        ? "Vencida"
                        : esPorVencer
                        ? "Por vencer"
                        : s.activa
                        ? "Activa"
                        : "Inactiva"}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  
                  <p>
                    <span className="font-medium">Precio:</span>{" "}
                    {s.plan.precio} Bs
                  </p>
                  <p>
                    <span className="font-medium">Inicio:</span>{" "}
                    {s.fecha_inicio}
                  </p>
                  <p>
                    <span className="font-medium">Fin:</span>{" "}
                    {s.fecha_fin}
                  </p>
                  <p>
                    <span className="font-medium">Teléfono:</span>{" "}
                    {s.proveedor?.telefono || "—"}
                  </p>
                  <p>
                    <span className="font-medium">Sitio Web:</span>{" "}
                    {s.proveedor?.sitio_web || "—"}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
