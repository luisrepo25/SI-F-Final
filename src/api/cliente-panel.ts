// API para el panel del cliente - usando endpoints correctos del condominio
import api from './axios';

// 👤 PERFIL DEL USUARIO (CON ESTADÍSTICAS)
export const obtenerPerfilCompleto = async () => {
  try {
    console.log('👤 Obteniendo perfil completo con estadísticas...');
    const response = await api.get('/perfil/mi_perfil/');
    console.log('✅ Perfil completo obtenido:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al obtener perfil completo:', error);
    throw new Error(error.response?.data?.message || 'Error al cargar el perfil');
  }
};

// 📅 RESERVAS DEL CLIENTE  
export const obtenerMisReservas = async () => {
  try {
    // console.log('📅 Obteniendo mis reservas...');
    const response = await api.get('/reservas/mis_reservas/');
    console.log('✅ Respuesta completa del backend:', response.data);
    
    // El backend devuelve { estadisticas: {...}, reservas: [...] }
    // Extraemos solo las reservas para mantener compatibilidad
    const { reservas, estadisticas } = response.data;
    console.log('📊 Estadísticas:', estadisticas);
    console.log('📋 Reservas extraídas:', reservas);
    
    return reservas || [];
  } catch (error: any) {
    console.error('❌ Error al obtener mis reservas:', error);
    
    // 🚧 DATOS DE DEMOSTRACIÓN COMPLETOS - Historial de transacciones
    console.log('🚧 Usando historial completo de reservas como demostración...');
    
    return [
      // ==================== HISTORIAL COMPLETO ====================
      
      // 1. RESERVA INICIAL - Full Tour Bolivia
      {
        id: 1,
        cliente: { id: 5, nombre: "Hebert Suarez" },
        fecha: "2024-12-25",
        estado: "RESERVA_INICIAL",
        total: 850.00,
        moneda: "BOB",
        created_at: "2024-10-13T10:30:00Z",
        paquete: { id: 1, nombre: "Full Tour Bolivia - Experiencia Completa" },
        tipo_transaccion: "reserva",
        puede_cancelar: true,
        puede_reprogramar: true
      },
      
      // 2. PAGO CONFIRMADO - Full Tour Bolivia
      {
        id: 2,
        cliente: { id: 5, nombre: "Hebert Suarez" },
        fecha: "2024-12-25",
        estado: "CONFIRMADA",
        total: 850.00,
        moneda: "BOB",
        created_at: "2024-10-13T11:45:00Z",
        paquete: { id: 1, nombre: "Full Tour Bolivia - Experiencia Completa" },
        tipo_transaccion: "pago",
        metodo_pago: "Tarjeta de Crédito",
        fecha_pago: "2024-10-13T11:45:00Z",
        puede_cancelar: true,
        puede_reprogramar: true
      },
      
      // 3. RESERVA Y PAGO - Aventura Andina
      {
        id: 3,
        cliente: { id: 5, nombre: "Hebert Suarez" },
        fecha: "2024-11-15",
        estado: "PAGADA",
        total: 350.00,
        moneda: "BOB",
        created_at: "2024-10-10T14:20:00Z",
        paquete: { id: 2, nombre: "Aventura Andina - Escapada de Fin de Semana" },
        tipo_transaccion: "pago",
        metodo_pago: "QR Boliviano",
        fecha_pago: "2024-10-10T14:20:00Z",
        puede_cancelar: false, // Muy cercano a la fecha
        puede_reprogramar: false
      },
      
      // 4. RESERVA COMPLETADA - Tour Cultural
      {
        id: 4,
        cliente: { id: 5, nombre: "Hebert Suarez" },
        fecha: "2024-09-20",
        estado: "COMPLETADA",
        total: 120.00,
        moneda: "BOB",
        created_at: "2024-09-15T09:15:00Z",
        paquete: { id: 3, nombre: "Descubrimiento Cultural - Tour de 1 Día" },
        tipo_transaccion: "pago",
        metodo_pago: "Efectivo",
        fecha_pago: "2024-09-15T09:15:00Z",
        puede_cancelar: false,
        puede_reprogramar: false
      },
      
      // 5. RESERVA CANCELADA - Ejemplo de cancelación
      {
        id: 5,
        cliente: { id: 5, nombre: "Hebert Suarez" },
        fecha: "2024-08-10",
        estado: "CANCELADA",
        total: 450.00,
        moneda: "BOB",
        created_at: "2024-07-25T16:30:00Z",
        paquete: { id: 4, nombre: "Salar de Uyuni Aventura" },
        tipo_transaccion: "cancelacion",
        fecha_cancelacion: "2024-08-05T10:00:00Z",
        motivo_cancelacion: "Cambio de planes familiares",
        puede_cancelar: false,
        puede_reprogramar: false
      },
      
      // 6. REPROGRAMACIÓN - Ejemplo de cambio de fecha
      {
        id: 6,
        cliente: { id: 5, nombre: "Hebert Suarez" },
        fecha: "2024-07-20",
        estado: "REPROGRAMADA",
        total: 0.00, // Sin costo adicional
        moneda: "BOB",
        created_at: "2024-07-10T12:00:00Z",
        paquete: { id: 2, nombre: "Aventura Andina - Escapada de Fin de Semana" },
        tipo_transaccion: "reprogramacion",
        puede_cancelar: false,
        puede_reprogramar: false
      }
    ];
  }
};

export const obtenerDetalleReserva = async (id: string) => {
  try {
    console.log(`📋 Obteniendo detalle de reserva ID: ${id}...`);
    const response = await api.get(`/reservas/${id}/`);
    console.log('✅ Detalle de reserva obtenido:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al obtener detalle de reserva:', error);
    throw new Error(error.response?.data?.message || 'Error al cargar el detalle de la reserva');
  }
};

// 📦 PAQUETES ACTIVOS DEL CLIENTE (Solo pagados/confirmados)
export const obtenerMisPaquetes = async () => {
  try {
    console.log('📦 Obteniendo mis paquetes activos...');
    const response = await api.get('/paquetes/mis_paquetes/');
    console.log('✅ Paquetes activos obtenidos:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al obtener mis paquetes:', error);
    
    // 🚧 DATOS DE DEMOSTRACIÓN basados en reservas PAGADAS/CONFIRMADAS
    console.log('🚧 Usando paquetes demo basados en reservas pagadas...');
    
    return [
      {
        id: 1,
        nombre: "Full Tour Bolivia - Experiencia Completa",
        destino: "La Paz, Sucre, Potosí",
        tipo: "Aventura",
        duracion: 5,
        precio: 850.00,
        fechaCompra: "2024-10-13",
        fechaInicio: "2024-12-25",
        fechaFin: "2024-12-29",
        estado: "confirmado", // CONFIRMADO - pagado y próximo
        participantes: 2,
        imagen: "/salar-de-uyuni-espejo.png",
        descripcion: "El paquete más completo para conocer los principales atractivos de Bolivia.",
        puedeReprogramar: true,
        fechaLimiteReprogramacion: "2024-12-15"
      },
      {
        id: 2,
        nombre: "Aventura Andina - Escapada de Fin de Semana",
        destino: "Cordillera de los Andes",
        tipo: "Aventura",
        duracion: 2,
        precio: 350.00,
        fechaCompra: "2024-10-10",
        fechaInicio: "2024-11-15",
        fechaFin: "2024-11-16",
        estado: "en_curso", // EN CURSO - actualmente ejecutándose
        participantes: 2,
        imagen: "/lago-titicaca-bolivia-panorama.png",
        descripcion: "Perfecto para una escapada de fin de semana.",
        puedeReprogramar: false,
        fechaLimiteReprogramacion: null
      }
    ];
  }
};

// 🏖️ PAQUETES TURÍSTICOS (ya existe en paquetes.ts, pero asegurándonos que use la URL correcta)
export const reservarPaquete = async (paqueteId: string, datosReserva: any) => {
  try {
    console.log(`🎫 Reservando paquete ID: ${paqueteId}...`);
    const response = await api.post(`/paquetes/${paqueteId}/reservar/`, datosReserva);
    console.log('✅ Paquete reservado exitosamente:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al reservar paquete:', error);
    throw new Error(error.response?.data?.message || 'Error al reservar el paquete');
  }
};

// 🎫 SOPORTE Y TICKETS
export const obtenerMisTickets = async () => {
  try {
    console.log('🎫 Obteniendo mis tickets de soporte...');
    const response = await api.get('/soporte-panel/mis_tickets/');
    console.log('✅ Mis tickets obtenidos:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al obtener mis tickets:', error);
    throw new Error(error.response?.data?.message || 'Error al cargar los tickets');
  }
};

export const crearTicket = async (datosTicket: {
  asunto: string;
  descripcion: string;
  categoria?: string;
}) => {
  try {
    console.log('🆕 Creando nuevo ticket de soporte...');
    const response = await api.post('/soporte-panel/crear_ticket/', datosTicket);
    console.log('✅ Ticket creado exitosamente:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al crear ticket:', error);
    throw new Error(error.response?.data?.message || 'Error al crear el ticket');
  }
};

export const obtenerDetalleTicket = async (id: string) => {
  try {
    console.log(`🎫 Obteniendo detalle de ticket ID: ${id}...`);
    const response = await api.get(`/tickets/${id}/`);
    console.log('✅ Detalle de ticket obtenido:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al obtener detalle de ticket:', error);
    throw new Error(error.response?.data?.message || 'Error al cargar el detalle del ticket');
  }
};

export const responderTicket = async (id: string, respuesta: string) => {
  try {
    console.log(`💬 Respondiendo ticket ID: ${id}...`);
    const response = await api.post(`/tickets/${id}/responder/`, { respuesta });
    console.log('✅ Respuesta enviada exitosamente:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al responder ticket:', error);
    throw new Error(error.response?.data?.message || 'Error al enviar la respuesta');
  }
};

// 🔔 NOTIFICACIONES
export const obtenerNotificaciones = async () => {
  try {
    console.log('🔔 Obteniendo notificaciones...');
    const response = await api.get('/notificaciones/');
    console.log('✅ Notificaciones obtenidas:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al obtener notificaciones:', error);
    throw new Error(error.response?.data?.message || 'Error al cargar las notificaciones');
  }
};

export const marcarNotificacionLeida = async (id: string) => {
  try {
    console.log(`✅ Marcando notificación ${id} como leída...`);
    const response = await api.patch(`/notificaciones/${id}/`, { leida: true });
    console.log('✅ Notificación marcada como leída');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al marcar notificación como leída:', error);
    throw new Error(error.response?.data?.message || 'Error al marcar la notificación');
  }
};

// Tipos TypeScript para las respuestas
export interface PerfilCompleto {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  nombre: string;
  documento_identidad?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  fecha_registro: string;
  rol: {
    id: number;
    slug: string;
    nombre: string;
    descripcion: string;
  };
  total_reservas: number;
  reservas_activas: number;
  total_gastado: number;
}

export interface ReservaCliente {
  id: number;
  cliente: {
    id: number;
    nombre: string;
  };
  fecha: string; // En lugar de fecha_reserva
  estado: string;
  total: number; // En lugar de precio_total
  moneda: string;
  created_at: string;
  // Campos opcionales que pueden venir del backend
  paquete?: {
    id: number;
    nombre: string;
    es_personalizado?: boolean;
    descripcion?: string;
    servicios_incluidos?: string[];
    imagen?: string;
    destino?: string;
    tipo?: string;
  };
  numero_personas?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  // Campos adicionales para historial completo
  tipo_transaccion?: 'reserva' | 'pago' | 'cancelacion' | 'reprogramacion';
  metodo_pago?: string;
  fecha_pago?: string;
  fecha_cancelacion?: string;
  motivo_cancelacion?: string;
  puede_cancelar?: boolean;
  puede_reprogramar?: boolean;
}

export interface PaqueteCliente {
  id: number;
  nombre: string;
  destino: string;
  tipo: string;
  duracion: number;
  precio: number;
  fechaCompra: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'confirmado' | 'en_curso' | 'proximo' | 'completado';
  participantes: number;
  imagen: string;
  descripcion: string;
  puedeReprogramar: boolean;
  fechaLimiteReprogramacion?: string | null;
}

export interface TicketSoporte {
  id: number;
  asunto: string;
  descripcion: string;
  estado: string;
  categoria: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  respuestas: any[];
}

export interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha_creacion: string;
  tipo: string;
}