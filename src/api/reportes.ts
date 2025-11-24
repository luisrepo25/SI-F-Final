import api from "./axios";

// Tipos de datos
export interface FiltrosReporte {
  formato: 'docx' | 'pdf' | 'excel' | 'json';  // docx para clientes, json para paquetes/ventas
  moneda?: 'USD' | 'BOB' | 'AMBAS';
  fecha_inicio?: string;
  fecha_fin?: string;
  // Filtros geográficos
  departamento?: string;
  ciudad?: string;
  tipo_destino?: 'Natural' | 'Histórico' | 'Urbano' | 'Rural' | 'Mixto';
  // Filtros temporales
  solo_fines_semana?: boolean;
  solo_dias_semana?: boolean;
  mes?: number;
  año?: number;
  trimestre?: number;
  // Filtros de cliente
  tipo_cliente?: 'nuevo' | 'recurrente' | 'vip';
  cliente_id?: number;
  // Filtros de paquete
  tipo_paquete?: 'paquete' | 'servicio';
  categoria?: string;
  solo_destacados?: boolean;
  solo_personalizados?: boolean;
  duracion_dias?: number;
  // Filtros de monto
  monto_minimo?: number;
  monto_maximo?: number;
  // Filtros de estado
  estado?: string;
  estados?: string[];
  // Filtros de campaña
  con_campana?: boolean;
  campana_id?: number;
  // Otros
  limite?: number;
}

export interface ReporteResponse {
  success: boolean;
  data?: any;
  error?: string;
  archivo?: Blob;
  contentDisposition?: string | null;
}

// Función helper para construir query string
const buildQueryString = (filtros: FiltrosReporte): string => {
  const params = new URLSearchParams();
  
  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, String(v)));
      } else {
        params.append(key, String(value));
      }
    }
  });
  
  return params.toString();
};

// Función helper para descargar archivos
export const descargarArchivo = async (blob: Blob, filtros: FiltrosReporte, tipoReporte: string, contentDisposition?: string | null) => {
  console.log('📥 Iniciando descarga de archivo:', {
    blobType: blob.type,
    blobSize: blob.size,
    tipoReporte,
    formato: filtros.formato
  });
  
  // Verificar si el blob está vacío
  if (blob.size === 0) {
    console.error('❌ Blob vacío - Sin datos');
    throw new Error('El archivo está vacío. Verifica los filtros aplicados.');
  }
  
  // Verificar si el blob es realmente un archivo o un JSON de error
  if (blob.type === 'application/json') {
    const text = await blob.text();
    console.error('⚠️ El backend devolvió JSON en lugar de archivo:', text);
    throw new Error('El backend devolvió un error en lugar del archivo');
  }

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  
  // Intentar extraer el nombre del archivo del header Content-Disposition
  let filename = `${tipoReporte}_${new Date().toISOString().split('T')[0]}`;
  
  if (contentDisposition) {
    const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
    if (matches && matches[1]) {
      filename = matches[1].replace(/['"]/g, '');
      console.log('📎 Nombre de archivo del backend:', filename);
    }
  } else {
    // Si no hay Content-Disposition, generar nombre con extensión apropiada
    let extension: string = filtros.formato;
    if (filtros.formato === 'excel') {
      extension = 'xlsx';
    } else if (filtros.formato === 'docx') {
      extension = 'docx';
    }
    filename = `${filename}.${extension}`;
    console.log('📎 Nombre de archivo generado:', filename);
  }
  
  a.download = filename;
  
  document.body.appendChild(a);
  a.click();
  console.log('✅ Descarga iniciada:', filename);
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

/**
 * Generar reporte de paquetes
 */
export const generarReporteProductos = async (filtros: FiltrosReporte): Promise<ReporteResponse> => {
  try {
    const queryString = buildQueryString(filtros);
    const url = `/reportes/productos/?${queryString}`;
    
    console.log('📡 [generarReporteProductos] Request completo:', {
      url: `${api.defaults.baseURL}${url}`,
      filtros,
      queryString,
      formato: filtros.formato
    });
    
    if (filtros.formato === 'json') {
      const response = await api.get(url);
      console.log('✅ [generarReporteProductos] Respuesta JSON recibida');
      return { success: true, data: response.data };
    } else {
      const response = await api.get(url, {
        responseType: 'blob'
      });
      
      console.log('📦 [generarReporteProductos] Blob recibido:', {
        type: response.data.type,
        size: response.data.size,
        headers: response.headers
      });
      
      // Verificar si el blob es realmente un archivo o un error JSON
      if (response.data.type === 'application/json') {
        const text = await response.data.text();
        
        try {
          const jsonData = JSON.parse(text);
          
          // Si tiene estructura de datos válida, mostrar mensaje específico
          if (jsonData.paquetes || jsonData.productos || jsonData.filtros_aplicados) {
            console.error('❌ [generarReporteProductos] Backend devolvió JSON en lugar de archivo');
            return { 
              success: false, 
              error: `El backend aún no implementa la exportación a ${filtros.formato.toUpperCase()}. Solo devuelve JSON. Por favor, contacta al equipo de backend para implementar la generación de archivos ${filtros.formato.toUpperCase()}.`
            };
          }
          
          // Si es un error del backend
          console.error('❌ [generarReporteProductos] Error del backend:', jsonData);
          return { 
            success: false, 
            error: jsonData.error || jsonData.detail || jsonData.message || 'Error al generar reporte' 
          };
        } catch (parseError) {
          console.error('❌ [generarReporteProductos] No se pudo parsear JSON de error');
          return {
            success: false,
            error: 'El backend devolvió JSON pero no se pudo procesar'
          };
        }
      }
      
      console.log('✅ [generarReporteProductos] Archivo blob válido recibido');
      return { 
        success: true, 
        archivo: response.data,
        contentDisposition: response.headers['content-disposition']
      };
    }
  } catch (error: any) {
    console.error('❌ [generarReporteProductos] Error:', error);
    console.error('❌ Response data:', error.response?.data);
    console.error('❌ Response status:', error.response?.status);
    
    // Si el error tiene un blob de respuesta, intentar extraer el mensaje
    if (error.response?.data instanceof Blob && error.response.data.type === 'application/json') {
      const text = await error.response.data.text();
      const errorData = JSON.parse(text);
      return { 
        success: false, 
        error: errorData.error || errorData.detail || 'Error al generar reporte de paquetes' 
      };
    }
    
    return { 
      success: false, 
      error: error.response?.data?.error || error.message || 'Error al generar reporte de paquetes' 
    };
  }
};

/**
 * Generar reporte de ventas
 */
export const generarReporteVentas = async (filtros: FiltrosReporte): Promise<ReporteResponse> => {
  try {
    const queryString = buildQueryString(filtros);
    
    if (filtros.formato === 'json') {
      const response = await api.get(`/reportes/ventas/?${queryString}`);
      return { success: true, data: response.data };
    } else {
      const response = await api.get(`/reportes/ventas/?${queryString}`, {
        responseType: 'blob'
      });
      
      // Verificar si el blob es realmente un archivo o un error JSON
      if (response.data.type === 'application/json') {
        const text = await response.data.text();
        
        try {
          const jsonData = JSON.parse(text);
          
          // Si tiene estructura de datos válida, mostrar mensaje específico
          if (jsonData.ventas || jsonData.reservas || jsonData.filtros_aplicados) {
            return { 
              success: false, 
              error: `El backend aún no implementa la exportación a ${filtros.formato.toUpperCase()}. Solo devuelve JSON. Por favor, contacta al equipo de backend para implementar la generación de archivos ${filtros.formato.toUpperCase()}.`
            };
          }
          
          // Si es un error del backend
          return { 
            success: false, 
            error: jsonData.error || jsonData.detail || jsonData.message || 'Error al generar reporte' 
          };
        } catch (parseError) {
          return {
            success: false,
            error: 'El backend devolvió JSON pero no se pudo procesar'
          };
        }
      }
      
      console.log('✅ Archivo blob válido recibido (ventas)');
      return { 
        success: true, 
        archivo: response.data,
        contentDisposition: response.headers['content-disposition']
      };
    }
  } catch (error: any) {
    console.error('Error generando reporte de ventas:', error);
    
    // Si el error tiene un blob de respuesta, intentar extraer el mensaje
    if (error.response?.data instanceof Blob && error.response.data.type === 'application/json') {
      const text = await error.response.data.text();
      const errorData = JSON.parse(text);
      return { 
        success: false, 
        error: errorData.error || errorData.detail || 'Error al generar reporte de ventas' 
      };
    }
    
    return { 
      success: false, 
      error: error.response?.data?.error || error.message || 'Error al generar reporte de ventas' 
    };
  }
};

/**
 * Generar reporte de clientes
 * Nota: El backend v2.2.0 ya no soporta JSON, solo genera archivos descargables (DOCX por defecto)
 */
export const generarReporteClientes = async (filtros: FiltrosReporte): Promise<ReporteResponse> => {
  try {
    const queryString = buildQueryString(filtros);
    console.log('🔍 Generando reporte de clientes con filtros:', filtros);
    console.log('🔍 Query string:', queryString);
    console.log('🔍 URL completa:', `/reportes/clientes/?${queryString}`);
    
    // El backend siempre devuelve un archivo descargable (DOCX, PDF o Excel)
    const response = await api.get(`/reportes/clientes/?${queryString}`, {
      responseType: 'blob'
    });
    
    console.log('📦 Respuesta blob recibida:', {
      type: response.data.type,
      size: response.data.size,
      status: response.status
    });
    
    // Verificar si el blob es realmente un archivo o un error JSON
    if (response.data.type === 'application/json') {
      const text = await response.data.text();
      console.warn('⚠️ Backend devolvió JSON en lugar de archivo:', text);
      
      try {
        const jsonData = JSON.parse(text);
        
        // Si tiene estructura de datos válida, mostrar mensaje específico
        if (jsonData.clientes || jsonData.filtros_aplicados) {
          return { 
            success: false, 
            error: `El backend aún no implementa la exportación a ${filtros.formato.toUpperCase()}. Solo devuelve JSON. Por favor, contacta al equipo de backend para implementar la generación de archivos ${filtros.formato.toUpperCase()}.`
          };
        }
        
        // Si es un error del backend
        return { 
          success: false, 
          error: jsonData.error || jsonData.detail || jsonData.message || 'Error al generar reporte' 
        };
      } catch (parseError) {
        return {
          success: false,
          error: 'El backend devolvió JSON pero no se pudo procesar'
        };
      }
    }
    
    console.log('✅ Archivo blob válido recibido (clientes)');
    return { 
      success: true, 
      archivo: response.data,
      contentDisposition: response.headers['content-disposition']
    };
  } catch (error: any) {
    console.error('❌ Error capturado generando reporte de clientes:', error);
    console.error('❌ Status:', error.response?.status);
    console.error('❌ Status Text:', error.response?.statusText);
    
    // Si el error tiene un blob de respuesta, intentar extraer el mensaje
    if (error.response?.data instanceof Blob) {
      console.log('📦 Error tiene blob de respuesta, tipo:', error.response.data.type);
      
      if (error.response.data.type === 'application/json') {
        const text = await error.response.data.text();
        console.error('⚠️ Contenido del error (JSON):', text);
        const errorData = JSON.parse(text);
        return { 
          success: false, 
          error: errorData.error || errorData.detail || errorData.message || 'Error al generar reporte de clientes' 
        };
      } else {
        // El blob no es JSON, intentar leerlo como texto
        const text = await error.response.data.text();
        console.error('⚠️ Contenido del error (texto):', text);
        return {
          success: false,
          error: text || 'Error desconocido del servidor'
        };
      }
    }
    
    return { 
      success: false, 
      error: error.response?.data?.error || error.response?.data?.detail || error.message || 'Error al generar reporte de clientes' 
    };
  }
};
