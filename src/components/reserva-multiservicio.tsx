"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navegacion } from "./comunes/navegacion";
import api from "@/api/axios";

type ServicioCarrito = {
  id: number;
  nombre: string;
  precio: number;
  duracion?: string;
  requiere_horario?: boolean;
  imagen_url?: string;
  imagen?: string;
  fecha?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
};

const ReservaMultiservicio = () => {
  const [carrito, setCarrito] = useState<ServicioCarrito[]>([]);
  const [total, setTotal] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("itinerario_multiservicio");
      let arr: ServicioCarrito[] = [];
      try {
        arr = raw ? JSON.parse(raw) : [];
      } catch {
        arr = [];
      }
      setCarrito(
        arr.map((s) => ({
          ...s,
          fecha: s.fecha || "",
          fecha_inicio: s.fecha_inicio || "",
          fecha_fin: s.fecha_fin || "",
          requiere_horario: s.requiere_horario || false,
          duracion: s.duracion || "",
          imagen_url: s.imagen_url || s.imagen || "/placeholder.svg",
        }))
      );
    }
  }, []);

  useEffect(() => {
    setTotal(carrito.reduce((acc, s) => acc + (s.precio || 0), 0));
  }, [carrito]);

  function actualizarFecha(
    idx: number,
    campo: keyof ServicioCarrito,
    valor: string
  ) {
    const nuevo = [...carrito];
    nuevo[idx] = { ...nuevo[idx], [campo]: valor };
    setCarrito(nuevo);
    if (typeof window !== "undefined") {
      localStorage.setItem("itinerario_multiservicio", JSON.stringify(nuevo));
    }
  }

  function eliminarServicio(idx: number) {
    const nuevo = carrito.filter((_, i) => i !== idx);
    setCarrito(nuevo);
    if (typeof window !== "undefined") {
      localStorage.setItem("itinerario_multiservicio", JSON.stringify(nuevo));
    }
  }

  async function confirmarReserva() {
    // Obtener el usuario autenticado
    let clienteId = null;
    if (typeof window !== "undefined") {
      const userRaw = localStorage.getItem("user");
      if (userRaw) {
        try {
          const user = JSON.parse(userRaw);
          clienteId = user.id || user.pk || null;
        } catch {}
      }
    }

    if (!clienteId) {
      setMensaje("Debes iniciar sesión para reservar");
      // Opcional: redirigir a login
      // router.push('/login');
      return;
    }

    // Helper para extraer solo la fecha YYYY-MM-DD
    const toDateOnly = (dateStr: string) => {
      if (!dateStr) return "";
      return dateStr.split("T")[0];
    };
    // Helper para convertir fecha a formato ISO completo (para fecha_inicio/fecha_fin si se requiere)
    const toISO = (dateStr: string, time?: string) => {
      if (!dateStr) return null;
      if (dateStr.includes("T")) return dateStr;
      return `${dateStr}${time ? "T" + time : "T00:00:00"}`;
    };
    const data = {
      fecha: toDateOnly(carrito[0]?.fecha || ""),
      estado: "PENDIENTE",
      total,
      moneda: "USD",
      cliente: clienteId,
      servicios: carrito.map(({ id, fecha, fecha_inicio, fecha_fin }) => ({
        servicio: id,
        fecha: toDateOnly(fecha || ""),
        fecha_inicio: fecha_inicio ? toISO(fecha_inicio) : undefined,
        fecha_fin: fecha_fin ? toISO(fecha_fin, "23:59:59") : undefined,
      })),
    };
    try {
      const result = await api.post("/reservas-multiservicio/", data);
      const reservaId = result.data.reserva_id || result.data.id;
      setMensaje("Reserva creada: " + reservaId);
      if (reservaId) {
        // Limpiar carrito después de reservar
        if (typeof window !== "undefined") {
          localStorage.removeItem("itinerario_multiservicio");
        }
        setTimeout(() => {
          router.push(`/pago?reserva_id=${reservaId}`);
        }, 1500);
      }
    } catch (error: any) {
      console.error("Error al crear reserva:", error);
      const errorMsg =
        error.response?.data?.detail ||
        "Error al crear la reserva. Intenta nuevamente.";
      setMensaje(errorMsg);
    }
  }

  return (
    <div className="min-h-screen w-full bg-amber-50">
      <Navegacion />
      {/* Carrito como tarjeta debajo del navigation */}
      <div className="flex justify-center w-full mt-4">
        <div className="bg-white rounded-2xl shadow-2xl p-5 flex flex-col items-center gap-2 border border-blue-200 min-w-[220px] max-w-xs w-full">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-blue-700 text-lg">Reserva</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
              {carrito.length} servicios
            </span>
          </div>
          <div className="font-semibold text-green-700 text-md mb-2">
            Total: USD {total}
          </div>
        </div>
      </div>
      <h2 className="text-5xl font-extrabold mb-8 text-blue-900 text-center tracking-tight mt-8">
        Reserva de Múltiples Servicios
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 w-full px-0">
        {carrito.length === 0 ? (
          <div className="col-span-full text-gray-500 text-center text-xl py-12">
            No hay servicios seleccionados para reservar.
          </div>
        ) : (
          carrito.map((s, idx) => (
            <div
              key={s.id}
              className="flex flex-col bg-white rounded-3xl shadow-2xl p-6 min-h-[200px] transition-transform hover:scale-105 hover:shadow-blue-200 w-full max-w-md mx-auto mb-8"
            >
              <div className="flex flex-row items-center gap-4">
                <img
                  src={s.imagen_url}
                  alt={s.nombre}
                  className="w-32 h-32 object-cover rounded-2xl shadow-md"
                />
                <div className="flex flex-col flex-1">
                  <div className="font-extrabold text-xl text-blue-900 mb-1">
                    {s.nombre}
                  </div>
                  <div className="text-blue-700 mb-1 text-base font-semibold">
                    Duración: {s.duracion}
                  </div>
                  <div className="text-green-700 font-bold mb-2 text-lg">
                    USD {isNaN(s.precio) ? "0" : s.precio}
                  </div>
                </div>
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-2 mt-4">
                <label className="block text-blue-800 font-semibold mb-1 md:mb-0">
                  Fecha:
                </label>
                <input
                  type="date"
                  value={s.fecha || ""}
                  onChange={(e) =>
                    actualizarFecha(idx, "fecha", e.target.value)
                  }
                  className="border-2 border-blue-300 rounded-xl px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:w-auto"
                  required
                />
              </div>
              {s.requiere_horario && (
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-blue-800 font-semibold mb-1">
                      Inicio:
                    </label>
                    <input
                      type="datetime-local"
                      value={s.fecha_inicio || ""}
                      onChange={(e) =>
                        actualizarFecha(idx, "fecha_inicio", e.target.value)
                      }
                      className="border-2 border-blue-300 rounded-xl px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-blue-800 font-semibold mb-1">
                      Fin:
                    </label>
                    <input
                      type="datetime-local"
                      value={s.fecha_fin || ""}
                      onChange={(e) =>
                        actualizarFecha(idx, "fecha_fin", e.target.value)
                      }
                      className="border-2 border-blue-300 rounded-xl px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                    />
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => eliminarServicio(idx)}
                className="bg-red-600 text-white px-4 py-2 rounded-xl mt-4 w-full font-semibold hover:bg-red-700 transition"
              >
                Eliminar
              </button>
            </div>
          ))
        )}
      </div>
      <div className="mt-8 font-bold text-xl text-green-700 text-center">
        Total: USD {total}
      </div>
      <button
        type="button"
        onClick={confirmarReserva}
        className="bg-green-600 text-white px-4 py-3 rounded-xl w-full mt-6 text-lg font-bold"
      >
        Confirmar y pagar
      </button>
      {mensaje && (
        <div className="mt-4 text-blue-700 font-semibold text-center">
          {mensaje}
        </div>
      )}
    </div>
  );
};

export default ReservaMultiservicio;
