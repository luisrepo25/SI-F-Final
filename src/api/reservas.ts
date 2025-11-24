import axios from './axios';

// Obtener todas las reservas (con timeout extendido)
export const listarReservas = () => {
  console.log('📋 API: Solicitando lista completa de reservas con timeout extendido');
  return axios.get('reservas/', { 
    timeout: 30000 // 30 segundos para cargar todas las reservas
  });
};

// Crear una nueva reserva
export const crearReserva = async (data: any) => {
  try {
    // Clonar el objeto y eliminar el campo 'estado' si existe
    const { estado, ...dataSinEstado } = data || {};
    console.log('🚀 API: Enviando reserva al backend');
    console.log('🚀 API: URL:', 'reservas/');
    console.log('🚀 API: Datos a enviar:', JSON.stringify(dataSinEstado, null, 2));

    const response = await axios.post('reservas/', dataSinEstado);

    console.log('✅ API: Respuesta exitosa');
    console.log('✅ API: Status:', response.status);
    console.log('✅ API: Data:', response.data);

    return response;
  } catch (error: any) {
    console.error('❌ API: Error al crear reserva:', error);
    console.error('❌ API: URL completa:', axios.defaults.baseURL + 'reservas/');
    console.error('❌ API: Status code:', error.response?.status);
    console.error('❌ API: Status text:', error.response?.statusText);
    console.error('❌ API: Response headers:', error.response?.headers);
    console.error('❌ API: Request headers:', error.config?.headers);
    console.error('❌ API: Request data enviada:', error.config?.data);

    // Si es error 500, es probable que sea HTML
    if (error.response?.status === 500) {
      console.error('🚨 ERROR 500 DETECTADO - PROBLEMA EN EL SERVIDOR BACKEND');
      console.error('📄 CONTENT TYPE:', error.response?.headers?.['content-type']);

      if (typeof error.response?.data === 'string') {
        console.error('📄 RESPUESTA COMPLETA (primeros 2000 chars):', error.response.data.substring(0, 2000));

        // Buscar información específica del error Django
        const djangoErrorMatch = error.response.data.match(/<h1>(.*?)<\/h1>/);
        if (djangoErrorMatch) {
          console.error('🎯 TÍTULO DEL ERROR:', djangoErrorMatch[1]);
        }

        // Buscar el traceback
        const tracebackMatch1 = error.response.data.match(/Traceback[\s\S]*?(?=<\/pre>|$)/);
        if (tracebackMatch1) {
          console.error('📋 TRACEBACK ENCONTRADO:', tracebackMatch1[0]);
        }

        const exceptionMatch = error.response.data.match(/<pre class="exception_value">([\s\S]*?)<\/pre>/);
        if (exceptionMatch) {
          console.error('🎯 EXCEPCIÓN ESPECÍFICA:', exceptionMatch[1]);
        }

        // Buscar el traceback completo
        const tracebackMatch2 = error.response.data.match(/<div id="traceback">([\s\S]*?)<\/div>/);
        if (tracebackMatch2) {
          console.error('🎯 TRACEBACK COMPLETO:', tracebackMatch2[1]);
        }
      }
    } 
    // Si es error 400, analizar errores de validación
    else if (error.response?.status === 400) {
      console.error('🚨 ERROR 400 DETECTADO - PROBLEMA DE VALIDACIÓN');
      console.error('📋 DATOS DE VALIDACIÓN:', JSON.stringify(error.response.data, null, 2));
      
      // Analizar errores específicos de campos
      if (typeof error.response.data === 'object') {
        Object.keys(error.response.data).forEach(campo => {
          console.error(`🔴 Error en campo "${campo}":`, error.response.data[campo]);
        });
      }
    } 
    else {
      console.error('❌ API: Response data completa:', JSON.stringify(error.response?.data, null, 2));
    }
    
    // Analizar error específico de campos faltantes
    if (error.response?.data && typeof error.response.data === 'object') {
      console.error('❌ API: Análisis detallado del error:');
      if (error.response.data.details) {
        console.error('❌ API: Campos con problemas:', error.response.data.details);
      }
      if (error.response.data.usuario) {
        console.error('❌ API: Error en usuario:', error.response.data.usuario);
      }
      if (error.response.data.servicios) {
        console.error('❌ API: Error en servicios:', error.response.data.servicios);
      }
      if (error.response.data.acompanantes) {
        console.error('❌ API: Error en acompañantes:', error.response.data.acompanantes);
      }
    }
    
    throw error;
  }
};

// Editar una reserva existente
export const editarReserva = async (id: string, data: any) => {
  try {
    console.log('🔄 API: Editando reserva con ID:', id);
    console.log('🔄 API: Datos a enviar:', data);
    console.log('🔄 API: URL completa:', `/reservas/${id}/`);
    
    const response = await axios.put(`/reservas/${id}/`, data);
    console.log('✅ API: Respuesta exitosa:');
    console.log('✅ API: Status:', response.status);
    console.log('✅ API: Data completa devuelta por backend:', response.data);
    console.log('✅ API: Estado específico devuelto:', response.data?.estado);
    console.log('✅ API: Tipo del estado devuelto:', typeof response.data?.estado);
    
    return response;
  } catch (error: any) {
    console.error('❌ API: Error al editar reserva:', error);
    console.error('❌ API: Respuesta del servidor:', error.response?.data);
    console.error('❌ API: Status code:', error.response?.status);
    console.error('❌ API: Headers:', error.response?.headers);
    throw error;
  }
};

// Eliminar una reserva
export const eliminarReserva = (id: string) => axios.delete(`/reservas/${id}/`);

// ============================================
// 🎯 APIS ESPECÍFICAS PARA CLIENTES
// ============================================

// Interfaz para las estadísticas de reservas
export interface EstadisticasReservas {
  total_reservas: number;
  por_estado: {
    PENDIENTE: number;
    CONFIRMADA: number;
    PAGADA: number;
    CANCELADA: number;
    COMPLETADA: number;
    REPROGRAMADA: number;
  };
}

// Interfaz para la respuesta de mis reservas
export interface MisReservasResponse {
  estadisticas: EstadisticasReservas;
  reservas: any[]; // Usar la interfaz Reserva existente si está definida
}

// 1. Obtener todas las reservas del cliente autenticado con estadísticas
export const obtenerMisReservasCompletas = async (filtros: any = {}): Promise<MisReservasResponse> => {
  try {
    console.log('🔄 API: Obteniendo mis reservas completas con filtros:', filtros);
    
    // Intentar usar la API específica primero
    try {
      // Construir parámetros de query
      const params = new URLSearchParams();
      Object.keys(filtros).forEach(key => {
        if (filtros[key]) {
          params.append(key, filtros[key]);
        }
      });
      
      const response = await axios.get(`reservas/mis_reservas/?${params.toString()}`);
      
      console.log('✅ API: Mis reservas obtenidas exitosamente (API específica)');
      console.log('📊 API: Estadísticas:', response.data.estadisticas);
      console.log('📋 API: Reservas:', response.data.reservas?.length || 0, 'reservas encontradas');
      
      return response.data;
    } catch (apiError: any) {
      console.log('⚠️ API específica no disponible, usando fallback:', apiError.response?.status);
      
      // Fallback: usar la API general y filtrar manualmente
      console.log('🔄 API: Usando API general como fallback...');
      const response = await axios.get('reservas/', { timeout: 30000 });
      
      if (response && response.data && Array.isArray(response.data)) {
        // Simular la estructura de respuesta esperada
        const reservas = response.data;
        
        // Calcular estadísticas manualmente
        const estadisticas = {
          total_reservas: reservas.length,
          por_estado: {
            PENDIENTE: reservas.filter(r => r.estado?.toUpperCase() === 'PENDIENTE').length,
            CONFIRMADA: reservas.filter(r => r.estado?.toUpperCase() === 'CONFIRMADA').length,
            PAGADA: reservas.filter(r => r.estado?.toUpperCase() === 'PAGADA').length,
            CANCELADA: reservas.filter(r => r.estado?.toUpperCase() === 'CANCELADA').length,
            COMPLETADA: reservas.filter(r => r.estado?.toUpperCase() === 'COMPLETADA').length,
            REPROGRAMADA: reservas.filter(r => r.estado?.toUpperCase() === 'REPROGRAMADA').length,
          }
        };
        
        console.log('✅ API: Fallback exitoso');
        console.log('📊 API: Estadísticas calculadas:', estadisticas);
        console.log('📋 API: Reservas encontradas:', reservas.length);
        
        return {
          estadisticas,
          reservas
        };
      } else {
        throw new Error('Respuesta inválida de la API de fallback');
      }
    }
  } catch (error: any) {
    console.error('❌ API: Error al obtener mis reservas:', error);
    console.error('❌ API: Response:', error.response?.data);
    
    // Como último recurso, devolver estructura vacía
    return {
      estadisticas: {
        total_reservas: 0,
        por_estado: {
          PENDIENTE: 0,
          CONFIRMADA: 0,
          PAGADA: 0,
          CANCELADA: 0,
          COMPLETADA: 0,
          REPROGRAMADA: 0,
        }
      },
      reservas: []
    };
  }
};

// 2. Obtener solo las reservas activas del cliente
export const obtenerReservasActivas = async () => {
  try {
    console.log('🔄 API: Obteniendo reservas activas del cliente');
    
    const response = await axios.get('reservas/reservas_activas/');
    
    console.log('✅ API: Reservas activas obtenidas:', response.data.count || 0);
    
    return response.data;
  } catch (error: any) {
    console.error('❌ API: Error al obtener reservas activas:', error);
    throw error;
  }
};

// 3. Obtener historial completo con reprogramaciones
export const obtenerHistorialCompleto = async () => {
  try {
    console.log('🔄 API: Obteniendo historial completo de reservas');
    
    const response = await axios.get('reservas/historial_completo/');
    
    console.log('✅ API: Historial completo obtenido:', response.data.count || 0);
    
    return response.data;
  } catch (error: any) {
    console.error('❌ API: Error al obtener historial completo:', error);
    throw error;
  }
};

// 4. Obtener detalle específico de una reserva
export const obtenerDetalleReserva = async (id: number | string) => {
  try {
    console.log('🔄 API: Obteniendo detalle de reserva ID:', id);
    
    const response = await axios.get(`reservas/${id}/`);
    
    console.log('✅ API: Detalle de reserva obtenido');
    console.log('📋 API: Reserva:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('❌ API: Error al obtener detalle de reserva:', error);
    throw error;
  }
};

// 5. Cancelar una reserva específica
export const cancelarReserva = async (id: number | string) => {
  try {
    console.log('🔄 API: Cancelando reserva ID:', id);
    
    const response = await axios.patch(`reservas/${id}/`, {
      estado: 'CANCELADA'
    });
    
    console.log('✅ API: Reserva cancelada exitosamente');
    
    return response.data;
  } catch (error: any) {
    console.error('❌ API: Error al cancelar reserva:', error);
    throw error;
  }
};
