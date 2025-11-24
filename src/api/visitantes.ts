import api from './axios';

// ========================================
// 🔹 API DE VISITANTES (BACKEND DJANGO)
// ========================================

export interface VisitanteData {
  nombre: string;
  apellido: string;
  fecha_nac: string; // YYYY-MM-DD
  nacionalidad: string;
  nro_doc: string;
  email: string;
  telefono: string;
  es_titular: boolean;
}

export interface Visitante extends VisitanteData {
  id: number;
  created_at: string;
  updated_at: string;
}

// Crear nuevo visitante
export const crearVisitante = async (data: VisitanteData) => {
  console.log('👥 API: Creando visitante:', data);
  const response = await api.post('visitantes/', data);
  console.log('✅ API: Visitante creado:', response.data);
  return response;
};

// Listar visitantes (con filtros opcionales)
export const listarVisitantes = async (filtros?: {
  es_titular?: boolean;
  nacionalidad?: string;
  email?: string;
}) => {
  console.log('📋 API: Listando visitantes con filtros:', filtros);
  const params = new URLSearchParams();
  if (filtros) {
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString());
    });
  }
  
  const response = await api.get(`visitantes/${params.toString() ? '?' + params.toString() : ''}`);
  console.log('✅ API: Visitantes obtenidos:', response.data);
  return response;
};

// Obtener visitante específico
export const obtenerVisitante = async (id: number) => {
  console.log('👤 API: Obteniendo visitante ID:', id);
  const response = await api.get(`visitantes/${id}/`);
  console.log('✅ API: Visitante obtenido:', response.data);
  return response;
};

// Actualizar visitante
export const actualizarVisitante = async (id: number, data: Partial<VisitanteData>) => {
  console.log('🔄 API: Actualizando visitante ID:', id, 'Datos:', data);
  const response = await api.patch(`visitantes/${id}/`, data);
  console.log('✅ API: Visitante actualizado:', response.data);
  return response;
};

// Eliminar visitante
export const eliminarVisitante = async (id: number) => {
  console.log('🗑️ API: Eliminando visitante ID:', id);
  const response = await api.delete(`visitantes/${id}/`);
  console.log('✅ API: Visitante eliminado');
  return response;
};

// ========================================
// 🔹 API DE ASOCIACIÓN RESERVA-VISITANTES  
// ========================================

export interface ReservaVisitanteData {
  reserva_id: number;
  visitante_id: number;
}

export interface ReservaVisitante extends ReservaVisitanteData {
  id: number;
  created_at: string;
}

// Asociar visitante a reserva
export const asociarVisitanteReserva = async (reservaId: number, visitanteId: number) => {
  const data: ReservaVisitanteData = {
    reserva_id: reservaId,
    visitante_id: visitanteId
  };
  
  console.log('🔗 API: Asociando visitante a reserva:', data);
  
  try {
    console.log('⏱️ Enviando request con timeout de 10s...');
    const response = await api.post('reserva-visitantes/', data, { timeout: 10000 });
    console.log('✅ API: Asociación creada:', response.data);
    return response;
  } catch (error: any) {
    console.error('❌ ERROR en asociación visitante-reserva:');
    console.error('📋 Datos enviados:', data);
    console.error('🚨 Error completo:', error);
    
    if (error.code === 'ECONNABORTED') {
      console.error('⏰ TIMEOUT: El servidor no respondió en 10 segundos');
    } else if (error.response) {
      console.error('🔴 Status:', error.response?.status);
      console.error('🔴 Status text:', error.response?.statusText);
      console.error('🔴 Response data:', error.response?.data);
      console.error('🔴 Headers:', error.response?.headers);
    } else if (error.request) {
      console.error('📡 Sin respuesta del servidor:', error.request);
    } else {
      console.error('🔧 Error de configuración:', error.message);
    }
    
    throw error;
  }
};

// Listar asociaciones (visitantes de una reserva o reservas de un visitante)
export const listarAsociaciones = async (filtros?: {
  reserva?: number;
  visitante?: number;
}) => {
  console.log('🔗 API: Listando asociaciones con filtros:', filtros);
  const params = new URLSearchParams();
  if (filtros) {
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString());
    });
  }
  
  const response = await api.get(`reserva-visitantes/${params.toString() ? '?' + params.toString() : ''}`);
  console.log('✅ API: Asociaciones obtenidas:', response.data);
  return response;
};

// Obtener visitantes de una reserva específica
export const obtenerVisitantesReserva = async (reservaId: number) => {
  return listarAsociaciones({ reserva: reservaId });
};

// Obtener reservas de un visitante específico
export const obtenerReservasVisitante = async (visitanteId: number) => {
  return listarAsociaciones({ visitante: visitanteId });
};

// Eliminar asociación
export const eliminarAsociacion = async (asociacionId: number) => {
  console.log('🗑️ API: Eliminando asociación ID:', asociacionId);
  const response = await api.delete(`reserva-visitantes/${asociacionId}/`);
  console.log('✅ API: Asociación eliminada');
  return response;
};

// ========================================
// 🔹 FUNCIONES DE UTILIDAD
// ========================================

// Convertir datos del formulario frontend a formato backend
export const convertirFormularioAVisitante = (
  datosFormulario: {
    nombre: string;
    apellido: string;
    documento: string;
    fecha_nacimiento: string;
    nacionalidad: string;
    email: string;
    telefono: string;
  },
  esTitular: boolean = false
): VisitanteData => {
  return {
    nombre: datosFormulario.nombre,
    apellido: datosFormulario.apellido,
    fecha_nac: datosFormulario.fecha_nacimiento, // Cambio de nombre del campo
    nacionalidad: datosFormulario.nacionalidad,
    nro_doc: datosFormulario.documento, // Cambio de nombre del campo
    email: datosFormulario.email,
    telefono: datosFormulario.telefono,
    es_titular: esTitular
  };
};

export default {
  crearVisitante,
  listarVisitantes,
  obtenerVisitante,
  actualizarVisitante,
  eliminarVisitante,
  asociarVisitanteReserva,
  listarAsociaciones,
  obtenerVisitantesReserva,
  obtenerReservasVisitante,
  eliminarAsociacion,
  convertirFormularioAVisitante
};