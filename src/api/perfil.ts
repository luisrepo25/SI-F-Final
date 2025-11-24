import axios from './axios'

// ==============================
// 🔹 INTERFACES
// ==============================

export interface PerfilUsuario {
  id: number;
  nombre: string;
  rubro: string;
  num_viajes: number;
  rol: {
    id: number;
    nombre: string;
    descripcion: string;
    slug: string;
  };
  telefono: string;
  fecha_nacimiento: string;
  genero: string;
  documento_identidad: string;
  pais: string;
  email: string;
  username: string;
  fecha_registro: string;
  ultimo_acceso: string;
  total_reservas: number;
  reservas_activas: number;
  total_gastado: number;
  created_at: string;
  updated_at: string;
}

export interface ReservaUsuario {
  id: number;
  fecha: string;
  estado: string;
  total: number;
  moneda: string;
  fecha_creacion: string;
  cupon_usado: number | null;
}

export interface MisReservasResponse {
  count: number;
  reservas: ReservaUsuario[];
}

// ==============================
// 🔹 SERVICIOS DE PERFIL
// ==============================

// Obtener perfil completo del usuario autenticado
export const obtenerMiPerfil = async (): Promise<PerfilUsuario> => {
  console.log('🔄 API: Obteniendo perfil completo del usuario...')
  const response = await axios.get('/perfil/mi_perfil/')
  console.log('✅ API: Perfil obtenido:', response.data)
  return response.data
}

// Obtener reservas del usuario autenticado
export const obtenerMisReservas = async (): Promise<MisReservasResponse> => {
  console.log('🔄 API: Obteniendo reservas del usuario...')
  const response = await axios.get('/perfil/mis_reservas/')
  console.log('✅ API: Reservas obtenidas:', response.data)
  return response.data
}

// Lista de perfiles (solo devuelve el del usuario autenticado)
export const listarPerfiles = async () => {
  console.log('🔄 API: Obteniendo lista de perfiles...')
  const response = await axios.get('/perfil/')
  console.log('✅ API: Perfiles obtenidos:', response.data)
  return response.data
}

// ==============================
// 🔹 HOOKS PARA REACT
// ==============================

export const usePerfilUsuario = () => {
  const cargarPerfil = async () => {
    try {
      const perfil = await obtenerMiPerfil()
      return { data: perfil, error: null }
    } catch (error) {
      console.error('❌ Error cargando perfil:', error)
      return { data: null, error: error }
    }
  }

  const cargarReservas = async () => {
    try {
      const reservas = await obtenerMisReservas()
      return { data: reservas, error: null }
    } catch (error) {
      console.error('❌ Error cargando reservas:', error)
      return { data: null, error: error }
    }
  }

  return {
    cargarPerfil,
    cargarReservas
  }
}

// ==============================
// 🔹 UTILIDADES
// ==============================

// Formatear total gastado
export const formatearTotalGastado = (total: number): string => {
  return `Bs. ${total.toFixed(2)}`
}

// Formatear fecha de reserva
export const formatearFechaReserva = (fecha: string): string => {
  return new Date(fecha).toLocaleDateString('es-BO')
}

// Obtener color del estado de reserva
export const obtenerColorEstado = (estado: string): string => {
  const colores = {
    'CONFIRMADA': 'text-green-600 bg-green-100',
    'PAGADA': 'text-blue-600 bg-blue-100',
    'PENDIENTE': 'text-yellow-600 bg-yellow-100',
    'CANCELADA': 'text-red-600 bg-red-100',
    'COMPLETADA': 'text-purple-600 bg-purple-100'
  }
  
  return colores[estado as keyof typeof colores] || 'text-gray-600 bg-gray-100'
}