"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  User,
  Filter,
  Search,
  Clock,
  RefreshCw,
  X,
  MapPin,
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Star,
  Download,
  Printer,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  obtenerMisReservas,
  obtenerDetalleReserva,
  ReservaCliente,
} from "@/api/cliente-panel";
import { obtenerHistorialReprogramacion } from "@/api/historial-reprogramacion";
import { useToast } from "@/hooks/use-toast";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import RecomendacionesEquipaje from "./comunes/recomendaciones-equipaje";

// Funciones auxiliares
const formatearFechaReserva = (fecha: string): string => {
  return new Date(fecha).toLocaleDateString("es-BO");
};

const formatearMoneda = (monto: number): string => {
  return new Intl.NumberFormat("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(monto);
};

const obtenerColorEstado = (estado: string): string => {
  const colores: Record<string, string> = {
    reserva_inicial: "bg-blue-100 text-blue-800",
    confirmada: "bg-green-100 text-green-800",
    pagada: "bg-green-100 text-green-800",
    pendiente: "bg-yellow-100 text-yellow-800",
    cancelada: "bg-red-100 text-red-800",
    completada: "bg-purple-100 text-purple-800",
    reprogramada: "bg-orange-100 text-orange-800",
  };
  return colores[estado.toLowerCase()] || "bg-gray-100 text-gray-800";
};

const obtenerTextoEstado = (estado: string): string => {
  const textos: Record<string, string> = {
    reserva_inicial: "Reserva Inicial",
    confirmada: "Confirmada",
    pagada: "Pagada",
    pendiente: "Pendiente",
    cancelada: "Cancelada",
    completada: "Completada",
    reprogramada: "Reprogramada",
  };
  return textos[estado.toLowerCase()] || estado;
};

const obtenerIconoTipoTransaccion = (tipo?: string) => {
  switch (tipo) {
    case "reserva":
      return "📋";
    case "pago":
      return "💳";
    case "cancelacion":
      return "❌";
    case "reprogramacion":
      return "📅";
    default:
      return "📄";
  }
};

interface Notificacion {
  id: string;
  tipo: "viaje_proximo" | "documento_expira" | "promocion";
  titulo: string;
  descripcion: string;
  fechaCreacion: Date;
  prioridad: "alta" | "media" | "baja";
  reservaId?: number;
}

export default function ClientReservations() {
  const [reservations, setReservations] = useState<ReservaCliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [selectedReserva, setSelectedReserva] = useState<ReservaCliente | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [reservaToCancel, setReservaToCancel] = useState<ReservaCliente | null>(
    null
  );
  // Historial de reprogramaciones
  const [historialReprogramacion, setHistorialReprogramacion] = useState<any[]>(
    []
  );
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // Estados para favoritos y valoraciones
  const [favoritos, setFavoritos] = useState<Set<number>>(new Set());
  const [showValoracionModal, setShowValoracionModal] = useState(false);
  const [reservaToValorate, setReservaToValorate] =
    useState<ReservaCliente | null>(null);
  const [valoracion, setValoracion] = useState(5);
  const [comentario, setComentario] = useState("");

  // Estados para notificaciones
  const [notificacionesEliminadas, setNotificacionesEliminadas] = useState<
    Set<string>
  >(new Set());

  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  // Cargar reservas del usuario
  const cargarReservas = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para ver tus reservas",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const data = await obtenerMisReservas();
      setReservations(data || []);

      if (data && data.length > 0) {
        toast({
          title: "✅ Reservas cargadas",
          description: `Se encontraron ${data.length} reservas`,
        });
      } else {
        toast({
          title: "Información",
          description: "No tienes reservas registradas",
        });
      }
    } catch (error: any) {
      console.error("❌ Error al cargar reservas:", error);
      setReservations([]);

      // Mejorar el mensaje de error según el tipo de problema
      let errorMessage =
        "No se pudieron cargar las reservas. Intenta más tarde.";
      if (
        error.code === "ERR_NETWORK" ||
        error.message.includes("Network Error")
      ) {
        errorMessage =
          "Sin conexión al servidor. Verifica que el backend esté activo.";
      } else if (error.response?.status === 500) {
        errorMessage =
          "Error interno del servidor. El backend puede estar experimentando problemas.";
      } else if (error.response?.status === 401) {
        errorMessage = "Sesión expirada. Por favor, inicia sesión nuevamente.";
      }

      toast({
        title: "❌ Error de conexión",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReservas();
  }, [user]);

  // Filtro visual por estado
  const reservasFiltradas = reservations.filter(
    (reserva: ReservaCliente) => {
      const cumpleFiltro =
        filtro === "todas" ||
        reserva.estado.toLowerCase() === filtro.toLowerCase();
      const terminoBusqueda = busqueda.toLowerCase();
      const cumpleBusqueda =
        !terminoBusqueda ||
        reserva.id.toString().includes(terminoBusqueda) ||
        (reserva.paquete?.nombre || "").toLowerCase().includes(terminoBusqueda);
      return cumpleFiltro && cumpleBusqueda;
    }
  );

  // Funciones helper para estados
  const getEstadoColor = (estado: string) => {
    switch (estado.toUpperCase()) {
      case "PAGADA":
      case "CONFIRMADA":
        return "border-green-200 bg-green-50 text-green-700";
      case "PENDIENTE":
        return "border-yellow-200 bg-yellow-50 text-yellow-700";
      case "CANCELADA":
        return "border-red-200 bg-red-50 text-red-700";
      case "COMPLETADA":
        return "border-blue-200 bg-blue-50 text-blue-700";
      default:
        return "border-gray-200 bg-gray-50 text-gray-700";
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado.toUpperCase()) {
      case "PAGADA":
        return "Pagada";
      case "PENDIENTE":
        return "Pendiente";
      case "CANCELADA":
        return "Cancelada";
      case "CONFIRMADA":
        return "Confirmada";
      case "COMPLETADA":
        return "Completada";
      default:
        return estado;
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Función para formatear moneda
  const formatearMoneda = (monto: string | number, moneda: string = "USD") => {
    const valor = typeof monto === "string" ? parseFloat(monto) : monto;
    const simbolo = moneda === "USD" ? "$" : "Bs. ";
    return isNaN(valor) ? `${simbolo}0.00` : `${simbolo}${valor.toFixed(2)}`;
  };

  // Calcular estadísticas del cliente
  const estadisticasCliente = useMemo(() => {
    const totalReservas = reservations.length;
    const reservasPagadas = reservations.filter((r: ReservaCliente) =>
      ["PAGADA", "CONFIRMADA"].includes(r.estado.toUpperCase())
    ).length;
    const reservasPendientes = reservations.filter(
      (r: ReservaCliente) => r.estado.toUpperCase() === "PENDIENTE"
    ).length;
    const reservasCanceladas = reservations.filter(
      (r: ReservaCliente) => r.estado.toUpperCase() === "CANCELADA"
    ).length;
    const reservasCompletadas = reservations.filter(
      (r: ReservaCliente) => r.estado.toUpperCase() === "COMPLETADA"
    ).length;

    const gastoTotal = reservations
      .filter((r: ReservaCliente) =>
        ["PAGADA", "CONFIRMADA"].includes(r.estado.toUpperCase())
      )
      .reduce(
        (total: number, reserva: ReservaCliente) =>
          total + parseFloat(reserva.total.toString()),
        0
      );

    const totalPersonas = reservations.reduce(
      (total: number, reserva: ReservaCliente) => {
        return total + (reserva.numero_personas || 1); // Default a 1 si no está definido
      },
      0
    );

    const proximoViaje = reservations
      .filter((r: ReservaCliente) =>
        ["PAGADA", "CONFIRMADA"].includes(r.estado.toUpperCase())
      )
      .filter((r: ReservaCliente) => new Date(r.fecha) > new Date())
      .sort(
        (a: ReservaCliente, b: ReservaCliente) =>
          new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
      )[0];

    return {
      totalReservas,
      reservasPagadas,
      reservasPendientes,
      reservasCompletadas,
      reservasCanceladas,
      gastoTotal,
      proximoViaje,
      totalPersonas,
      monedaPrincipal: "USD",
    };
  }, [reservations]);

  // Función para abrir el modal de detalles
  const verDetallesReserva = async (reserva: ReservaCliente) => {
    setShowModal(true);
    setSelectedReserva(null);
    setLoadingHistorial(true);
    try {
      const reservaDetalle = await obtenerDetalleReserva(reserva.id.toString());
      setSelectedReserva(reservaDetalle);
      const data = await obtenerHistorialReprogramacion(reserva.id);
      setHistorialReprogramacion(data);
    } catch (err) {
      setHistorialReprogramacion([]);
    } finally {
      setLoadingHistorial(false);
    }
  };

  // Función para cerrar el modal
  const cerrarModal = () => {
    setShowModal(false);
    setSelectedReserva(null);
  };

  // Función para manejar favoritos
  const toggleFavorito = (reservaId: number) => {
    const nuevosFavoritos = new Set(favoritos);
    if (nuevosFavoritos.has(reservaId)) {
      nuevosFavoritos.delete(reservaId);
      toast({
        title: "Removido de Favoritos",
        description: "La reserva ha sido removida de tus favoritos",
      });
    } else {
      nuevosFavoritos.add(reservaId);
      toast({
        title: "Agregado a Favoritos",
        description: "La reserva ha sido agregada a tus favoritos",
      });
    }
    setFavoritos(nuevosFavoritos);
    localStorage.setItem(
      "favoritos-reservas",
      JSON.stringify(Array.from(nuevosFavoritos))
    );
  };

  // Exportar reservas
  const exportarReservas = () => {
    const fechaExporte = new Date().toLocaleDateString("es-ES");
    let contenido = `RESUMEN DE RESERVAS - ${user?.name || "Cliente"}\n`;
    contenido += `Fecha de exportación: ${fechaExporte}\n`;
    contenido += `==============================================\n\n`;

    contenido += `ESTADÍSTICAS:\n`;
    contenido += `• Total de reservas: ${estadisticasCliente.totalReservas}\n`;
    contenido += `• Reservas pagadas: ${estadisticasCliente.reservasPagadas}\n`;
    contenido += `• Gasto total: $${estadisticasCliente.gastoTotal.toFixed(
      2
    )}\n`;
    contenido += `• Personas viajadas: ${estadisticasCliente.totalPersonas}\n\n`;

    reservasFiltradas.forEach((reserva: ReservaCliente, index: number) => {
      contenido += `${index + 1}. RESERVA #${reserva.id}\n`;
      contenido += `   Estado: ${getEstadoTexto(reserva.estado)}\n`;
      contenido += `   Paquete: ${reserva.paquete?.nombre || "N/A"}\n`;
      contenido += `   Fecha de viaje: ${formatFecha(reserva.fecha)}\n`;
      contenido += `   Total: ${parseFloat(reserva.total.toString()).toFixed(
        2
      )} ${reserva.moneda}\n`;
      contenido += `   Personas: ${reserva.numero_personas || 1}\n\n`;
    });

    const blob = new Blob([contenido], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = `mis-reservas-${fechaExporte.replace(/\//g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "Exportación Completa",
      description: "Tus reservas han sido exportadas exitosamente",
    });
  };

  // Cargar favoritos desde localStorage
  useEffect(() => {
    const favoritosGuardados = localStorage.getItem("favoritos-reservas");
    if (favoritosGuardados) {
      setFavoritos(new Set(JSON.parse(favoritosGuardados)));
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tus reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Historial de Reservas
            </h1>
            <p className="text-gray-600">
              Historial completo de transacciones: reservas, pagos,
              cancelaciones y reprogramaciones
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0 items-center">
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-44 h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="todas">Todos los estados</option>
              <option value="completada">Completadas</option>
              <option value="cancelada">Canceladas</option>
              <option value="reprogramada">Reprogramadas</option>
              <option value="confirmada">Confirmadas</option>
              <option value="reserva_inicial">Reserva Inicial</option>
            </select>
            <Button onClick={exportarReservas} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button
              onClick={() => cargarReservas()}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Reservas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {estadisticasCliente.totalReservas}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Pagadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {estadisticasCliente.reservasPagadas}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Gasto Total</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${estadisticasCliente.gastoTotal.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Personas</p>
                <p className="text-2xl font-bold text-orange-600">
                  {estadisticasCliente.totalPersonas}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por ID de reserva o nombre del paquete..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas las reservas</option>
              <option value="pendiente">Pendientes</option>
              <option value="confirmada">Confirmadas</option>
              <option value="pagada">Pagadas</option>
              <option value="cancelada">Canceladas</option>
              <option value="completada">Completadas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de reservas */}
      <div className="space-y-4">
        {reservasFiltradas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {loading ? "Cargando reservas..." : "No hay reservas"}
            </h3>
            <p className="text-gray-600 mb-4">
              {busqueda || filtro !== "todas"
                ? "No se encontraron reservas con los filtros aplicados"
                : "Aún no tienes reservas registradas"}
            </p>
            {!loading && !busqueda && filtro === "todas" && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  ¡Explora nuestros paquetes turísticos y crea tu primera
                  reserva!
                </p>
                <a
                  href="/paquetes"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Ver Paquetes Disponibles
                </a>
              </div>
            )}
          </div>
        ) : (
          // @ts-ignore
          reservasFiltradas.map((reserva) => (
            <div
              key={reserva.id}
              className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${getEstadoColor(
                reserva.estado
              )}`}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">
                      {obtenerIconoTipoTransaccion(reserva.tipo_transaccion)}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {reserva.tipo_transaccion
                        ? `${
                            reserva.tipo_transaccion.charAt(0).toUpperCase() +
                            reserva.tipo_transaccion.slice(1)
                          } #${reserva.id}`
                        : `Reserva #${reserva.id}`}
                    </h3>
                    <Badge className={obtenerColorEstado(reserva.estado)}>
                      {obtenerTextoEstado(reserva.estado)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorito(reserva.id)}
                      className={
                        favoritos.has(reserva.id)
                          ? "text-yellow-500"
                          : "text-gray-400"
                      }
                    >
                      <Star
                        className="w-4 h-4"
                        fill={
                          favoritos.has(reserva.id) ? "currentColor" : "none"
                        }
                      />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>
                        {reserva.paquete?.nombre || "Paquete no disponible"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{formatearFechaReserva(reserva.fecha)}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{reserva.numero_personas || 1} personas</span>
                    </div>
                  </div>

                  {/* Información específica por tipo de transacción */}
                  {reserva.metodo_pago && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">💳 Método de pago:</span>{" "}
                      {reserva.metodo_pago}
                    </div>
                  )}

                  {reserva.motivo_cancelacion && (
                    <div className="mt-2 text-sm text-red-600">
                      <span className="font-medium">❌ Motivo:</span>{" "}
                      {reserva.motivo_cancelacion}
                    </div>
                  )}

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">
                      {reserva.tipo_transaccion === "reprogramacion"
                        ? "Sin costo"
                        : `${formatearMoneda(reserva.total)} ${reserva.moneda}`}
                    </span>

                    <div className="text-xs text-gray-500">
                      {formatearFechaReserva(reserva.created_at)}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 md:mt-0">
                  <Button
                    onClick={() => verDetallesReserva(reserva)}
                    variant="outline"
                    size="sm"
                  >
                    Ver Detalles
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de detalles simplificado */}
      {showModal && selectedReserva && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {" "}
            {/* Cambié max-w-2xl a max-w-4xl para más espacio */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Detalles de Reserva #{selectedReserva.id}
                </h2>
                <Button onClick={cerrarModal} variant="ghost" size="sm">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {" "}
                {/* Aumenté el espacio entre secciones */}
                {/* Información General (existente) */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Información General
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Estado:</span>
                      <Badge
                        className={`ml-2 ${obtenerColorEstado(
                          selectedReserva.estado
                        )}`}
                      >
                        {getEstadoTexto(selectedReserva.estado)}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-600">Paquete:</span>
                      <span className="ml-2 font-medium">
                        {selectedReserva.paquete?.nombre || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Fecha de inicio:</span>
                      <span className="ml-2">
                        {formatFecha(selectedReserva.fecha)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Fecha de fin:</span>
                      <span className="ml-2">
                        {selectedReserva.fecha_fin
                          ? formatFecha(selectedReserva.fecha_fin)
                          : "No especificada"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Número de personas:</span>
                      <span className="ml-2">
                        {selectedReserva.numero_personas || 1}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Precio total:</span>
                      <span className="ml-2 font-semibold">
                        {formatearMoneda(selectedReserva.total)}{" "}
                        {selectedReserva.moneda}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Fechas (existente) */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Fechas</h3>
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="text-gray-600">Reserva realizada:</span>
                      <span className="ml-2">
                        {formatFecha(selectedReserva.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                {/* NUEVA SECCIÓN: Recomendaciones de Equipaje */}
                <RecomendacionesEquipaje reservaId={selectedReserva.id} />
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                <Button onClick={cerrarModal} variant="outline">
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
