// Archivo eliminado por reinicio de funcionalidad de paquetes
import axios from './axios';

// ============================================
// PAQUETES Y SERVICIOS API
// ============================================

// Obtener todos los paquetes
export const listarPaquetes = async () => {
  try {
    console.log('🔄 API: Solicitando lista de paquetes...');
    const response = await axios.get('paquetes/');
    console.log('✅ API: Paquetes obtenidos:', response.data);
    return response;
  } catch (error: any) {
    console.error('❌ API: Error al obtener paquetes:', error);
    console.error('❌ API: Respuesta del servidor:', error.response?.data);
    throw error;
  }
};

// Obtener todos los servicios individuales
export const listarServicios = async () => {
  try {
    console.log('🔄 API: Solicitando lista de servicios...');
    const response = await axios.get('servicios/');
    console.log('✅ API: Servicios obtenidos:', response.data);
    return response;
  } catch (error: any) {
    console.error('❌ API: Error al obtener servicios:', error);
    console.error('❌ API: Respuesta del servidor:', error.response?.data);
    throw error;
  }
};

// Obtener un paquete específico
export const obtenerPaquete = async (id: string | number) => {
  try {
    console.log('📦 API: Obteniendo paquete ID:', id);
    const response = await axios.get(`paquetes/${id}/`);
    console.log('✅ API: Paquete obtenido:', response.data);
    return response;
  } catch (error: any) {
    console.error('❌ API: Error al obtener paquete:', error);
    throw error;
  }
};

// Obtener un servicio específico
export const obtenerServicio = async (id: string | number) => {
  try {
    console.log('🔧 API: Obteniendo servicio ID:', id);
    const response = await axios.get(`servicios/${id}/`);
    console.log('✅ API: Servicio obtenido:', response.data);
    return response;
  } catch (error: any) {
    console.error('❌ API: Error al obtener servicio:', error);
    throw error;
  }
};

// ========================================
// FUNCIONES HELPER PARA RESERVAS
// ========================================

// Detectar si un ID corresponde a un paquete o servicio
export const detectarTipoServicio = async (id: string | number) => {
  try {
    // Intentar obtener como paquete primero
    try {
      const paqueteResponse = await obtenerPaquete(id);
      if (paqueteResponse.data) {
        return {
          tipo: 'paquete',
          data: paqueteResponse.data
        };
      }
    } catch (error) {
      // Si falla, intentar como servicio
      console.log('📦 No es un paquete, intentando como servicio...');
    }

    // Intentar obtener como servicio
    const servicioResponse = await obtenerServicio(id);
    if (servicioResponse.data) {
      return {
        tipo: 'servicio',
        data: servicioResponse.data
      };
    }

    throw new Error('ID no encontrado ni como paquete ni como servicio');
  } catch (error) {
    console.error('❌ Error detectando tipo de servicio:', error);
    throw error;
  }
};

// Preparar payload para reservar un SERVICIO INDIVIDUAL
export const prepararReservaServicio = (servicio: any, cantidadPersonas: number = 1) => {
  const total = parseFloat(servicio.costo) * cantidadPersonas;
  
  console.log('🔧 Preparando reserva para SERVICIO INDIVIDUAL:', {
    id: servicio.id,
    titulo: servicio.titulo,
    costo: servicio.costo,
    cantidadPersonas,
    total
  });

  return {
    total: total.toFixed(2),
    moneda: "BOB",
    detalles: [{
      servicio: servicio.id,
      cantidad: cantidadPersonas,
      precio_unitario: servicio.costo.toString(),
      fecha_servicio: new Date().toISOString()
    }]
  };
};

// Preparar payload para reservar un PAQUETE con precio total del paquete
export const prepararReservaPaquete = async (paquete: any, cantidadPersonas: number = 1) => {
  console.log('📦 Preparando reserva para PAQUETE:', {
    id: paquete.id,
    nombre: paquete.nombre,
    precio_por_persona: paquete.precio,
    cantidad_personas: cantidadPersonas,
    servicios_incluidos: paquete.servicios
  });

  // NUEVO: Usar el precio total del paquete (precio por persona * cantidad)
  const precioPorPersona = parseFloat(paquete.precio);
  const totalPaquete = precioPorPersona * cantidadPersonas;

  // ESTRATEGIA NUEVA: No usar servicios individuales para evitar que el backend sobrescriba precios
  // En su lugar, crear un detalle que represente directamente el paquete
  const detalles: any[] = [];

  // Crear un detalle especial para el paquete completo
  detalles.push({
    // CAMBIO CRÍTICO: En lugar de usar un servicio existente,
    // vamos a usar el ID del paquete como si fuera un "servicio especial"
    servicio: paquete.id, // Usar el ID del paquete como identificador del item
    cantidad: cantidadPersonas,
    precio_unitario: precioPorPersona.toFixed(2), // PRECIO DEL PAQUETE
    fecha_servicio: new Date().toISOString(),
    // Metadatos del paquete
    tipo_item: 'paquete',
    paquete_id: paquete.id,
    paquete_nombre: paquete.nombre || 'Paquete Completo',
    descripcion: `Paquete: ${paquete.nombre || 'Completo'} - ${cantidadPersonas} persona(s)`
  });

  console.log('� Paquete configurado SIN referencia a servicios:', {
    tipo: 'PAQUETE_DIRECTO',
    precio_unitario: precioPorPersona.toFixed(2),
    total_calculado: totalPaquete.toFixed(2),
    no_usa_servicios_individuales: true
  });

  console.log('📦 Paquete procesado CORRECTAMENTE:', {
    precio_por_persona_mostrado: paquete.precio,
    cantidad_personas: cantidadPersonas,
    total_paquete_calculado: totalPaquete.toFixed(2),
    metodo: 'PRECIO_TOTAL_PAQUETE_SIN_SERVICIOS'
  });

  return {
    total: totalPaquete.toFixed(2),
    moneda: "BOB",
    detalles
  };
};