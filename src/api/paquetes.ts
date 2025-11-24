// Archivo eliminado por reinicio de funcionalidad de paquetes
import axios from './axios'

// ==============================
// 🎯 NUEVAS APIs BASADAS EN DOCUMENTACIÓN BACKEND
// ==============================

// Interfaces para las nuevas APIs
export interface DestinoIndividual {
  id: number;
  titulo: string;
  descripcion: string;
  duracion: string;
  capacidad_max: number;
  punto_encuentro: string;
  precio_usd: string;
  estado: string;
  imagen_url: string;
  categoria: {
    id: number;
    nombre: string;
  };
  servicios_incluidos: string[];
}

export interface PaqueteTuristico {
  id: number;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  tipo_descuento: string;
  monto: string;
  created_at: string;
  updated_at: string;
  servicios_incluidos: DestinoIndividual[];
  cupones_disponibles: {
    id: number;
    usos_restantes: number;
    cantidad_max: number;
    nro_usos: number;
  }[];
  precio_total_servicios: {
    total_usd: number;
    cantidad_servicios: number;
  };
}

export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ==============================
// 🏕️ API DE DESTINOS INDIVIDUALES
// ==============================

/**
 * Obtener todos los destinos individuales
 * Ejemplo: "Salar de Uyuni", "Isla del Sol", "Tiwanaku"
 */
export const obtenerDestinosIndividuales = async (filtros?: {
  estado?: 'Activo' | 'Inactivo';
  categoria?: number;
  precio_min?: number;
  precio_max?: number;
  buscar?: string;
}): Promise<ApiResponse<DestinoIndividual>> => {
  console.log('🏕️ API: Obteniendo destinos individuales...')
  
  const params = new URLSearchParams();
  if (filtros?.estado) params.append('estado', filtros.estado);
  if (filtros?.categoria) params.append('categoria', filtros.categoria.toString());
  if (filtros?.precio_min) params.append('precio_usd__gte', filtros.precio_min.toString());
  if (filtros?.precio_max) params.append('precio_usd__lte', filtros.precio_max.toString());
  if (filtros?.buscar) params.append('titulo__icontains', filtros.buscar);
  
  const url = `servicios/${params.toString() ? '?' + params.toString() : ''}`;
  const response = await axios.get(url);
  
  // Manejar tanto estructura paginada como array directo
  const data = response.data;
  const resultados = data.results || data || [];
  
  console.log('✅ API: Destinos individuales obtenidos:', resultados.length);
  console.log('🔍 API: Estructura de datos:', { 
    tieneResults: !!data.results, 
    esArray: Array.isArray(data),
    cantidadItems: resultados.length 
  });
  
  // Devolver siempre en formato ApiResponse
  return {
    count: data.count || resultados.length,
    next: data.next || null,
    previous: data.previous || null,
    results: resultados
  };
}

/**
 * Obtener un destino específico por ID
 */
export const obtenerDestinoIndividual = async (id: number): Promise<DestinoIndividual> => {
  console.log('🎯 API: Obteniendo destino ID:', id);
  const response = await axios.get(`servicios/${id}/`);
  console.log('✅ API: Destino obtenido:', response.data.titulo);
  return response.data;
}

// ==============================
// 📦 API DE PAQUETES TURÍSTICOS COMPLETOS
// ==============================

/**
 * Obtener todos los paquetes turísticos
 * Ejemplo: "Full Tour Bolivia", "Aventura Andina"
 */
export const obtenerPaquetesTuristicos = async (filtros?: {
  activo?: boolean;
  destacado?: boolean;
  disponible?: boolean;
  precio_min?: number;
  precio_max?: number;
  duracion?: string;
}): Promise<ApiResponse<PaqueteTuristico>> => {
  console.log('📦 API: Obteniendo paquetes turísticos...')
  
  const params = new URLSearchParams();
  if (filtros?.activo) params.append('activo', 'true');
  if (filtros?.destacado) params.append('destacado', 'true');
  if (filtros?.disponible) params.append('disponible', 'true');
  if (filtros?.precio_min) params.append('precio_min', filtros.precio_min.toString());
  if (filtros?.precio_max) params.append('precio_max', filtros.precio_max.toString());
  if (filtros?.duracion) params.append('duracion', filtros.duracion);
  
  const url = `paquetes/${params.toString() ? '?' + params.toString() : ''}`;
  const response = await axios.get(url);
  
  // Manejar tanto estructura paginada como array directo
  const data = response.data;
  const resultados = data.results || data || [];
  
  console.log('✅ API: Paquetes turísticos obtenidos:', resultados.length);
  console.log('🔍 API: Estructura de datos:', { 
    tieneResults: !!data.results, 
    esArray: Array.isArray(data),
    cantidadItems: resultados.length 
  });
  
  // Devolver siempre en formato ApiResponse
  return {
    count: data.count || resultados.length,
    next: data.next || null,
    previous: data.previous || null,
    results: resultados
  };
}

/**
 * Obtener paquetes destacados para homepage
 * Hasta 6 paquetes destacados para carousel principal
 */
export const obtenerPaquetesDestacados = async (): Promise<ApiResponse<PaqueteTuristico>> => {
  console.log('⭐ API: Obteniendo paquetes destacados...')
  const response = await axios.get('paquetes/destacados/');
  
  const data = response.data;
  const resultados = data.results || data || [];
  
  console.log('✅ API: Paquetes destacados obtenidos:', resultados.length);
  
  return {
    count: data.count || resultados.length,
    next: data.next || null,
    previous: data.previous || null,
    results: resultados
  };
}

/**
 * Obtener paquetes disponibles para reservar
 */
export const obtenerPaquetesDisponibles = async (): Promise<ApiResponse<PaqueteTuristico>> => {
  console.log('✅ API: Obteniendo paquetes disponibles para reservar...')
  const response = await axios.get('paquetes/disponibles/');
  
  const data = response.data;
  const resultados = data.results || data || [];
  
  console.log('✅ API: Paquetes disponibles obtenidos:', resultados.length);
  
  return {
    count: data.count || resultados.length,
    next: data.next || null,
    previous: data.previous || null,
    results: resultados
  };
}

/**
 * Obtener un paquete específico por ID
 */
export const obtenerPaqueteTuristico = async (id: number): Promise<PaqueteTuristico> => {
  console.log('📦 API: Obteniendo paquete turístico ID:', id);
  const response = await axios.get(`paquetes/${id}/`);
  console.log('✅ API: Paquete turístico obtenido:', response.data.descripcion);
  return response.data;
}

/**
 * Obtener itinerario detallado de un paquete
 */
export const obtenerItinerarioPaquete = async (id: number) => {
  console.log('📅 API: Obteniendo itinerario del paquete ID:', id);
  const response = await axios.get(`paquetes/${id}/itinerario/`);
  console.log('✅ API: Itinerario obtenido');
  return response.data;
}

// ==============================
// 🔹 FUNCIONES DE RESERVAS
// ==============================

/**
 * Preparar datos para reserva de destino individual
 */
export const prepararReservaDestino = (
  destino: DestinoIndividual,
  cantidadPersonas: number = 1,
  clienteId?: number
) => {
  const precio = parseFloat(destino.precio_usd || '0');
  const costoTotal = precio * cantidadPersonas;

  console.log('🎯 Preparando reserva para DESTINO:', {
    id: destino.id,
    titulo: destino.titulo,
    precio_usd: precio,
    cantidad_personas: cantidadPersonas,
    cliente_id: clienteId,
  });

  return {
    cliente_id: clienteId ?? null,
    total: costoTotal.toFixed(2),
    moneda: 'USD',
    detalles: [
      {
        servicio: destino.id,
        cantidad: cantidadPersonas,
        precio_unitario: precio.toFixed(2),
        fecha_servicio: new Date().toISOString(),
      },
    ],
    fecha_inicio: '',
    estado: '',
    acompanantes: [] as any[],
  };
}

/**
 * Preparar datos para reserva de paquete turístico
 */
export const prepararReservaPaquete = (
  paquete: PaqueteTuristico,
  cantidadPersonas: number = 1,
  clienteId?: number
) => {
  const precioBase = paquete.precio_total_servicios.total_usd;
  let precioConDescuento = precioBase;
  
  // Aplicar descuento si existe
  if (paquete.tipo_descuento === '%') {
    precioConDescuento = precioBase * (1 - parseFloat(paquete.monto) / 100);
  } else if (paquete.tipo_descuento === '$') {
    precioConDescuento = precioBase - parseFloat(paquete.monto);
  }
  
  const costoTotal = precioConDescuento * cantidadPersonas;

  console.log('📦 Preparando reserva para PAQUETE:', {
    id: paquete.id,
    descripcion: paquete.descripcion,
    precio_base: precioBase,
    precio_con_descuento: precioConDescuento,
    cantidad_personas: cantidadPersonas,
    cliente_id: clienteId,
  });

  // Crear detalles para cada servicio incluido
  const detalles = paquete.servicios_incluidos.map(servicio => ({
    servicio: servicio.id,
    cantidad: cantidadPersonas,
    precio_unitario: (parseFloat(servicio.precio_usd) * (precioConDescuento / precioBase)).toFixed(2),
    fecha_servicio: new Date().toISOString(),
  }));

  return {
    cliente_id: clienteId ?? null,
    total: costoTotal.toFixed(2),
    moneda: 'USD',
    detalles,
    fecha_inicio: paquete.fecha_inicio,
    estado: '',
    acompanantes: [] as any[],
  };
}

// ==============================
// 🔹 FUNCIONES DE BÚSQUEDA Y FILTROS
// ==============================

/**
 * Buscar destinos por término
 */
export const buscarDestinos = async (termino: string) => {
  console.log('🔍 API: Buscando destinos con término:', termino);
  return obtenerDestinosIndividuales({ 
    buscar: termino,
    estado: 'Activo'
  });
}

/**
 * Obtener destinos por categoría
 */
export const obtenerDestinosPorCategoria = async (categoriaId: number) => {
  console.log('🏷️ API: Obteniendo destinos de categoría:', categoriaId);
  return obtenerDestinosIndividuales({ 
    categoria: categoriaId,
    estado: 'Activo'
  });
}

/**
 * Obtener paquetes con descuentos
 */
export const obtenerPaquetesConDescuentos = async (descuentoMinimo?: number) => {
  console.log('💰 API: Obteniendo paquetes con descuentos...');
  const paquetes = await obtenerPaquetesTuristicos({ activo: true });
  
  if (descuentoMinimo) {
    paquetes.results = paquetes.results.filter(paquete => 
      parseFloat(paquete.monto) >= descuentoMinimo
    );
  }
  
  return paquetes;
}

// ==============================
// 🔹 FUNCIONES AUXILIARES
// ==============================

/**
 * Obtener categorías disponibles
 */
export const obtenerCategorias = async () => {
  console.log('🏷️ API: Obteniendo categorías...');
  const response = await axios.get('categorias/');
  console.log('✅ API: Categorías obtenidas:', response.data);
  return response.data;
}

/**
 * Calcular precio con descuento
 */
export const calcularPrecioConDescuento = (
  precioBase: number, 
  tipoDescuento: string, 
  montoDescuento: number
): number => {
  if (tipoDescuento === '%') {
    return precioBase * (1 - montoDescuento / 100);
  } else if (tipoDescuento === '$') {
    return precioBase - montoDescuento;
  }
  return precioBase;
}

// ==============================
// 🔹 FUNCIONES DE COMPATIBILIDAD (DEPRECATED)
// ==============================

/**
 * @deprecated Usar obtenerDestinosIndividuales en su lugar
 */
export const listarServicios = async () => {
  console.warn('⚠️ DEPRECATED: Use obtenerDestinosIndividuales() en lugar de listarServicios()')
  return obtenerDestinosIndividuales({ estado: 'Activo' });
}

/**
 * @deprecated Usar obtenerPaquetesTuristicos en su lugar
 */
export const listarPaquetes = async () => {
  console.warn('⚠️ DEPRECATED: Use obtenerPaquetesTuristicos() en lugar de listarPaquetes()')
  return obtenerPaquetesTuristicos({ activo: true });
}

/**
 * @deprecated Usar obtenerDestinoIndividual en su lugar
 */
export const obtenerServicio = async (id: string | number) => {
  console.warn('⚠️ DEPRECATED: Use obtenerDestinoIndividual() en lugar de obtenerServicio()')
  const response = await axios.get(`servicios/${id}/`)
  return response
}

/**
 * @deprecated Usar obtenerPaqueteTuristico en su lugar  
 */
export const obtenerPaquete = async (id: string | number) => {
  console.warn('⚠️ DEPRECATED: Use obtenerPaqueteTuristico() en lugar de obtenerPaquete()')
  const response = await axios.get(`paquetes/${id}/`)
  return response
}

/**
 * @deprecated - Solo para compatibilidad con código existente
 */
export const detectarTipoServicio = async (id: string | number) => {
  console.warn('⚠️ DEPRECATED: detectarTipoServicio() - Use las nuevas APIs específicas');
  try {
    // Intentar como paquete primero
    const paquete = await obtenerPaqueteTuristico(Number(id));
    if (paquete) {
      return { tipo: 'paquete' as const, data: paquete };
    }
  } catch (error) {
    // Intentar como destino individual
    try {
      const destino = await obtenerDestinoIndividual(Number(id));
      if (destino) {
        return { tipo: 'servicio' as const, data: destino };
      }
    } catch (error) {
      console.error('❌ ID no encontrado:', id);
      return null;
    }
  }
  return null;
}