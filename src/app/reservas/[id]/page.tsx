"use client";
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { obtenerDetalleReserva } from '@/api/cliente-panel';
import { obtenerHistorialReprogramacion } from '@/api/historial-reprogramacion';
import { useReglasReprogramacion } from '@/hooks/useReglasReprogramacion';
import axios from '@/api/axios';
import { Navegacion } from '@/components/comunes/navegacion';
import { CalendarDays, Users, BadgeDollarSign, User, FileText, CreditCard, MapPin, RefreshCw } from 'lucide-react';

export default function Page({ params }: { params: { id: string } }) {
  const [reserva, setReserva] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [historial, setHistorial] = useState<any[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(true);
  const [showReprogramar, setShowReprogramar] = useState(false);
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [motivo, setMotivo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const { reglas, configuraciones, loading: loadingReglas, error: errorReglas } = useReglasReprogramacion();
  const [motivoBloqueo, setMotivoBloqueo] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchReserva() {
      try {
        const data = await obtenerDetalleReserva(params.id);
        setReserva(data);
      } catch (err) {
        setReserva({});
      } finally {
        setLoading(false);
      }
    }
    async function fetchHistorial() {
      try {
        setLoadingHistorial(true);
        const data = await obtenerHistorialReprogramacion(params.id);
        setHistorial(Array.isArray(data) ? data : []);
      } catch {
        setHistorial([]);
      } finally {
        setLoadingHistorial(false);
      }
    }
    fetchReserva();
    fetchHistorial();
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      setShowReprogramar(sp.get('reprogramar') === '1');
    }
  }, [params.id]);

  // Validación de reglas de reprogramación
  useEffect(() => {
    if (!showReprogramar || !reserva || loadingReglas) return;
    let motivo = null;
    // 1. Límite de reprogramaciones
    const maxReprogramaciones = configuraciones.find((c: any) => c.clave === 'max_reprogramaciones_por_reserva');
    if (maxReprogramaciones && reserva.numero_reprogramaciones >= parseInt(maxReprogramaciones.valor)) {
      motivo = `Ya alcanzó el máximo de reprogramaciones permitidas (${maxReprogramaciones.valor}).`;
    }
    // 2. Tiempo mínimo de anticipación
    if (!motivo) {
      const reglaTiempoMin = reglas.find((r: any) => r.tipo_regla === 'TIEMPO_MINIMO');
      if (reglaTiempoMin && nuevaFecha) {
        const horasMin = parseInt(reglaTiempoMin.valor_numerico || reglaTiempoMin.limite_hora || '0');
        const fechaNueva = new Date(nuevaFecha);
        const fechaActual = new Date();
        const diffHoras = (fechaNueva.getTime() - fechaActual.getTime()) / (1000 * 60 * 60);
        if (diffHoras < horasMin) {
          motivo = `Solo puede reprogramar con al menos ${horasMin} horas de anticipación.`;
        }
      }
    }
    // 3. Días blackout
    if (!motivo) {
      const reglaBlackout = reglas.find((r: any) => r.tipo_regla === 'DIAS_BLACKOUT');
      if (reglaBlackout && nuevaFecha) {
        const fechasBloqueadas = (reglaBlackout.valor_texto || '').split(',').map((f: string) => f.trim());
        const fechaNuevaStr = nuevaFecha.split('T')[0];
        if (fechasBloqueadas.includes(fechaNuevaStr)) {
          motivo = `No se permite reprogramar para la fecha seleccionada (${fechaNuevaStr}).`;
        }
      }
    }
    setMotivoBloqueo(motivo);
  }, [showReprogramar, reserva, reglas, configuraciones, nuevaFecha, loadingReglas]);

  // Formatear fechas
  const formatDate = (date: string) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) +
      ' ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const handleReprogramar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');
    if (motivoBloqueo) {
      setMensaje(motivoBloqueo);
      return;
    }
    try {
      // PUT /reservas/{id}/
      // Calcular nueva fecha_fin manteniendo la duración original
      let nuevaFechaFin = reserva.fecha_fin;
      if (reserva.fecha_inicio && reserva.fecha_fin && nuevaFecha) {
        const inicioOriginal = new Date(reserva.fecha_inicio);
        const finOriginal = new Date(reserva.fecha_fin);
        const duracionMs = finOriginal.getTime() - inicioOriginal.getTime();
        const nuevaFechaInicio = new Date(nuevaFecha);
        const nuevoFin = new Date(nuevaFechaInicio.getTime() + duracionMs);
        nuevaFechaFin = nuevoFin.toISOString();
      }
      const payload = {
        fecha: nuevaFecha.split('T')[0],
        fecha_inicio: nuevaFecha,
        fecha_fin: nuevaFechaFin,
        estado: 'REPROGRAMADA',
        total: reserva.total,
        cliente_id: reserva.cliente?.id,
        cupon: reserva.cupon || null,
        fecha_original: reserva.fecha_inicio,
        fecha_reprogramacion: nuevaFecha,
        numero_reprogramaciones: (reserva.numero_reprogramaciones || 0) + 1,
        motivo_reprogramacion: motivo,
        reprogramado_por: reserva.cliente?.id, // o el usuario logueado
      };
      await axios.put(`/reservas/${params.id}/`, payload);
      // POST /historial-reprogramacion/
      await axios.post('/historial-reprogramacion/', {
        reserva: reserva.id,
        fecha_anterior: reserva.fecha_inicio,
        fecha_nueva: nuevaFecha,
        motivo,
        reprogramado_por: reserva.cliente?.id,
        notificacion_enviada: true,
      });
      setMensaje('Reprogramación enviada correctamente.');
      setShowReprogramar(false);
      setReserva({
        ...reserva,
        fecha_inicio: nuevaFecha,
        fecha_fin: nuevaFechaFin,
        numero_reprogramaciones: (reserva.numero_reprogramaciones || 0) + 1
      });
    } catch (err: any) {
      setMensaje('Error al reprogramar.');
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-lg text-gray-500">Cargando reserva...</span>
      </div>
    );
  }
  return (
    <>
      <Navegacion />
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-primary">Reserva #{params.id}</h1>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${reserva.estado === 'PAGADA' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{reserva.estado}</span>
        </div>
        {/* Formulario de reprogramación */}
        {showReprogramar && (
          <form onSubmit={handleReprogramar} className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-bold mb-2 text-orange-700">Reprogramar Reserva</h2>
            <div className="mb-3">
              <label className="block font-semibold mb-1">Nueva fecha y hora de inicio</label>
              <input type="datetime-local" className="border rounded px-3 py-2 w-full" value={nuevaFecha} onChange={e => setNuevaFecha(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="block font-semibold mb-1">Motivo de reprogramación</label>
              <textarea className="border rounded px-3 py-2 w-full" value={motivo} onChange={e => setMotivo(e.target.value)} required />
            </div>
            {motivoBloqueo && (
              <div className="mb-2 text-red-700 font-semibold">{motivoBloqueo}</div>
            )}
            <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded" disabled={!!motivoBloqueo || loadingReglas}>
              Enviar solicitud
            </button>
            {mensaje && <div className="mt-2 text-green-700 font-semibold">{mensaje}</div>}
            {errorReglas && <div className="mt-2 text-red-700 font-semibold">{errorReglas}</div>}
            <div className="mt-2 text-xs text-gray-500">* Validación realizada solo en frontend para experiencia de usuario.</div>
          </form>
        )}
  <div className="bg-white rounded-xl shadow-lg p-6 space-y-4 border">
          {/* Historial de reprogramaciones */}
          <div className="mt-8">
            <h2 className="text-lg font-bold mb-2 text-orange-700 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-orange-700" />
              Historial de reprogramaciones
            </h2>
            {loadingHistorial ? (
              <div className="text-gray-500">Cargando historial...</div>
            ) : historial.length === 0 ? (
              <div className="text-gray-400">No hay reprogramaciones para esta reserva.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border">
                  <thead>
                    <tr className="bg-orange-50">
                      <th className="px-3 py-2 border">Fecha anterior</th>
                      <th className="px-3 py-2 border">Nueva fecha</th>
                      <th className="px-3 py-2 border">Motivo</th>
                      <th className="px-3 py-2 border">Estado</th>
                      <th className="px-3 py-2 border">Solicitada el</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((h, idx) => (
                      <tr key={idx} className="even:bg-orange-50">
                        <td className="px-3 py-2 border">{formatDate(h.fecha_anterior)}</td>
                        <td className="px-3 py-2 border">{formatDate(h.fecha_nueva)}</td>
                        <td className="px-3 py-2 border">{h.motivo}</td>
                        <td className="px-3 py-2 border">{h.estado || '-'}</td>
                        <td className="px-3 py-2 border">{formatDate(h.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* Nombre del paquete */}
          {(reserva.paquete?.nombre || reserva.paquete?.id) && (
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-semibold">Paquete:</span>
              <span>{reserva.paquete?.nombre || `ID ${reserva.paquete?.id}` || 'No disponible'}</span>
            </div>
          )}
          {/* Cliente */}
          {reserva.cliente?.nombre && (
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              <span className="font-semibold">Cliente:</span>
              <span>{reserva.cliente.nombre}</span>
            </div>
          )}
          {/* Fechas */}
          {(reserva.fecha_inicio || reserva.fecha) && (
            <div className="flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-primary" />
              <span className="font-semibold">Fecha de inicio:</span>
              <span>{formatDate(reserva.fecha_inicio || reserva.fecha)}</span>
            </div>
          )}
          {reserva.fecha_fin && (
            <div className="flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-primary" />
              <span className="font-semibold">Fecha de fin:</span>
              <span>{formatDate(reserva.fecha_fin)}</span>
            </div>
          )}
          {/* Total pagado */}
          {reserva.total && (
            <div className="flex items-center gap-3">
              <BadgeDollarSign className="w-5 h-5 text-primary" />
              <span className="font-semibold">Total pagado:</span>
              <span className="text-lg font-bold">{reserva.total} {reserva.moneda || 'BOB'}</span>
            </div>
          )}
          {/* Participantes */}
          {reserva.numero_personas && (
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <span className="font-semibold">Participantes:</span>
              <span>{reserva.numero_personas}</span>
            </div>
          )}
          {/* Método de pago */}
          {reserva.metodo_pago && (
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-primary" />
              <span className="font-semibold">Método de pago:</span>
              <span>{reserva.metodo_pago}</span>
            </div>
          )}
          {/* Ubicación */}
          {(reserva.paquete?.ubicacion || reserva.paquete?.destino) && (
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="font-semibold">Ubicación:</span>
              <span>{reserva.paquete?.ubicacion || reserva.paquete?.destino}</span>
            </div>
          )}
          {/* Descripción */}
          {reserva.paquete?.descripcion && (
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-semibold">Descripción:</span>
              <span>{reserva.paquete.descripcion}</span>
            </div>
          )}
          {/* Fecha de creación */}
          {reserva.created_at && (
            <div className="flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-primary" />
              <span className="font-semibold">Creada el:</span>
              <span>{formatDate(reserva.created_at)}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
