/**
 * API para Reportes Inteligentes con IA
 * Procesa comandos de voz/texto en lenguaje natural y genera reportes
 * Backend: Django + OpenAI/LLM para NLP
 */

import api from './axios';
import { FiltrosReporte } from './reportes';

// ============================================================================
// TIPOS Y INTERFACES
// ============================================================================

/**
 * Comando de voz/texto del usuario
 */
export interface ComandoReporte {
  prompt: string;  // Texto transcrito o escrito por el usuario
  contexto?: string; // Contexto adicional (ej: "estoy en reportes dinámicos")
}

/**
 * Respuesta del backend después de procesar el comando con IA
 */
export interface RespuestaIA {
  interpretacion: string;  // Lo que entendió la IA
  accion: 'generar_reporte' | 'aplicar_filtros' | 'consulta' | 'ayuda' | 'no_entendido' | 'exportar_proyeccion' | 'mostrar_proyeccion' | 'ver_proyeccion';
  tipo_reporte?: 'paquetes' | 'ventas' | 'clientes';
  formato?: 'pdf' | 'excel' | 'docx';
  filtros?: Partial<FiltrosReporte>;
  respuesta_texto?: string;  // Respuesta en lenguaje natural para síntesis de voz
  datos?: any;  // Datos adicionales (ej: estadísticas)
  sugerencias?: string[];  // Sugerencias de seguimiento
  confianza?: number;  // Nivel de confianza del NLP (0-1)
}

/**
 * Historial de conversación con el asistente
 */
export interface MensajeIA {
  tipo: 'usuario' | 'asistente' | 'sistema';
  contenido: string;
  timestamp: Date;
  accion_ejecutada?: string;
}

// ============================================================================
// FUNCIONES API
// ============================================================================

/**
 * Procesa un comando de voz/texto con IA
 * 
 * @param comando - Comando en lenguaje natural
 * @returns Respuesta estructurada de la IA
 * 
 * @example
 * ```ts
 * const resultado = await procesarComandoIA({
 *   prompt: "Muéstrame las ventas de Santa Cruz en enero mayores a 500 dólares"
 * });
 * 
 * if (resultado.accion === 'generar_reporte') {
 *   // Generar reporte con los filtros extraídos
 *   await generarReporte(resultado.tipo_reporte!, resultado.filtros!);
 * }
 * ```
 */
export const procesarComandoIA = async (comando: ComandoReporte): Promise<RespuestaIA> => {
  try {
    console.log('🤖 Enviando comando a IA:', comando);
    
    const response = await api.post('/reportes/ia/procesar/', comando);
    
    console.log('✅ Respuesta de IA:', response.data);
    return response.data;
    
  } catch (error: any) {
    console.error('❌ Error al procesar comando con IA:', error);
    
    // Fallback: respuesta por defecto si el backend no está disponible
    return {
      interpretacion: 'No pude procesar tu solicitud.',
      accion: 'no_entendido',
      respuesta_texto: 'Lo siento, no pude entender tu comando. Por favor intenta reformularlo o usa los controles manuales.',
      sugerencias: [
        'Intenta ser más específico con las fechas',
        'Menciona el tipo de reporte (paquetes, ventas o clientes)',
        'Indica el formato deseado (PDF, Excel o Word)'
      ],
      confianza: 0
    };
  }
};

/**
 * Obtiene sugerencias de comandos de voz según el contexto
 * 
 * @param contexto - Contexto actual del usuario (opcional)
 * @returns Lista de ejemplos de comandos
 */
export const obtenerSugerenciasComandos = async (contexto?: string): Promise<string[]> => {
  try {
    const response = await api.get('/reportes/ia/sugerencias/', {
      params: { contexto }
    });
    return response.data.sugerencias || [];
  } catch (error) {
    console.warn('⚠️ No se pudieron cargar sugerencias, usando fallback');
    
    // Sugerencias por defecto
    return [
      "Genera un reporte de paquetes en PDF",
      "Muéstrame las ventas del último mes",
      "Clientes que compraron en diciembre en Excel",
      "Paquetes de La Paz mayores a 1000 dólares",
      "Ventas de Santa Cruz entre enero y marzo",
      "Exporta los clientes en formato Word",
      "¿Cuántas ventas tuvimos esta semana?",
      "Filtra por departamento Cochabamba",
      "Limpia todos los filtros",
      "Ayuda con los comandos de voz"
    ];
  }
};

/**
 * Consulta estadísticas o información sin generar reporte
 * Útil para preguntas como "¿cuántos clientes tenemos?"
 * 
 * @param pregunta - Pregunta del usuario
 * @returns Respuesta con datos estadísticos
 */
export const consultarEstadisticas = async (pregunta: string): Promise<RespuestaIA> => {
  try {
    const response = await api.post('/reportes/ia/consulta/', {
      pregunta
    });
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al consultar estadísticas:', error);
    throw new Error(
      error.response?.data?.error || 
      error.response?.data?.detail || 
      'Error al consultar estadísticas'
    );
  }
};

/**
 * Valida un comando antes de ejecutarlo (seguridad)
 * 
 * @param comando - Comando a validar
 * @returns true si es seguro, false si es potencialmente peligroso
 */
export const validarComando = async (comando: string): Promise<boolean> => {
  try {
    const response = await api.post('/reportes/ia/validar/', {
      comando
    });
    return response.data.es_seguro === true;
  } catch (error) {
    // Si falla la validación, por seguridad rechazar
    console.warn('⚠️ No se pudo validar comando, rechazando por seguridad');
    return false;
  }
};

// ============================================================================
// PROCESAMIENTO LOCAL (FALLBACK SIN BACKEND)
// ============================================================================

/**
 * Procesamiento NLP básico en frontend (fallback si backend no disponible)
 * Detecta palabras clave y extrae filtros simples
 * 
 * @param prompt - Texto del usuario
 * @returns Filtros extraídos
 */
export const procesarComandoLocal = (prompt: string): Partial<RespuestaIA> => {
  const textoLower = prompt.toLowerCase();
  
  // Detectar tipo de reporte
  let tipo_reporte: 'paquetes' | 'ventas' | 'clientes' | undefined;
  if (textoLower.includes('paquete')) tipo_reporte = 'paquetes';
  if (textoLower.includes('venta')) tipo_reporte = 'ventas';
  if (textoLower.includes('cliente')) tipo_reporte = 'clientes';
  
  // Detectar formato
  let formato: 'pdf' | 'excel' | 'docx' | undefined;
  if (textoLower.includes('pdf')) formato = 'pdf';
  if (textoLower.includes('excel') || textoLower.includes('xlsx')) formato = 'excel';
  if (textoLower.includes('word') || textoLower.includes('docx')) formato = 'docx';
  
  // Extraer filtros básicos
  const filtros: Partial<FiltrosReporte> = {};
  
  // Departamentos
  const departamentos = ['la paz', 'santa cruz', 'cochabamba', 'oruro', 'potosí', 'tarija', 'beni', 'pando', 'chuquisaca'];
  for (const dep of departamentos) {
    if (textoLower.includes(dep)) {
      filtros.departamento = dep.charAt(0).toUpperCase() + dep.slice(1);
    }
  }
  
  // Meses
  const meses: { [key: string]: number } = {
    'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4,
    'mayo': 5, 'junio': 6, 'julio': 7, 'agosto': 8,
    'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
  };
  for (const [mes, num] of Object.entries(meses)) {
    if (textoLower.includes(mes)) {
      filtros.mes = num;
    }
  }
  
  // Montos (regex básico)
  const montoMatch = textoLower.match(/(\d+)\s*(dólares|dolares|usd|bolivianos|bs)/);
  if (montoMatch) {
    const monto = parseInt(montoMatch[1]);
    if (textoLower.includes('mayor') || textoLower.includes('más de')) {
      filtros.monto_minimo = monto;
    } else if (textoLower.includes('menor') || textoLower.includes('menos de')) {
      filtros.monto_maximo = monto;
    }
  }
  
  // Personalizado
  if (textoLower.includes('personalizado') || textoLower.includes('custom')) {
    filtros.solo_personalizados = true;
  }
  
  // Destacado
  if (textoLower.includes('destacado') || textoLower.includes('featured')) {
    filtros.solo_destacados = true;
  }
  
  // Calcular confianza basada en qué tan completo es el comando
  let confianza = 0.3;  // Base baja
  
  if (tipo_reporte) confianza += 0.4;  // +0.4 si detectó tipo de reporte
  if (formato) confianza += 0.2;       // +0.2 si detectó formato
  if (Object.keys(filtros).length > 0) confianza += 0.1;  // +0.1 por cada filtro
  
  // Asegurar que esté entre 0 y 1
  confianza = Math.min(confianza, 1.0);
  
  console.log('🔍 Procesamiento local:', { tipo_reporte, formato, filtros, confianza });
  
  return {
    tipo_reporte,
    formato: formato || 'pdf',  // PDF por defecto si no se especifica
    filtros,
    accion: tipo_reporte ? 'generar_reporte' : 'no_entendido',
    interpretacion: tipo_reporte 
      ? `Generar reporte de ${tipo_reporte} en formato ${formato || 'PDF'}` 
      : 'No entendí el tipo de reporte',
    respuesta_texto: tipo_reporte
      ? `Entendido, generaré un reporte de ${tipo_reporte} en formato ${formato || 'PDF'}.`
      : 'No pude entender tu comando. Por favor menciona el tipo de reporte (paquetes, ventas o clientes).',
    confianza
  };
};

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Convierte filtros extraídos por IA a formato de API
 */
export const normalizarFiltros = (filtrosIA: any): FiltrosReporte => {
  const filtros: FiltrosReporte = {
    formato: filtrosIA.formato || 'docx',
    moneda: filtrosIA.moneda || 'USD'
  };
  
  // Copiar todos los filtros reconocidos
  const camposValidos = [
    'fecha_inicio', 'fecha_fin', 'departamento', 'tipo_destino', 
    'tipo_cliente', 'mes', 'trimestre', 'solo_destacados', 
    'solo_personalizados', 'duracion_dias', 'monto_minimo', 
    'monto_maximo', 'con_campana', 'solo_fines_semana', 'solo_dias_semana'
  ];
  
  for (const campo of camposValidos) {
    if (filtrosIA[campo] !== undefined && filtrosIA[campo] !== null) {
      (filtros as any)[campo] = filtrosIA[campo];
    }
  }
  
  return filtros;
};

/**
 * Genera un resumen legible de los filtros aplicados
 */
export const generarResumenFiltros = (filtros: Partial<FiltrosReporte>): string => {
  const partes: string[] = [];
  
  if (filtros.fecha_inicio) partes.push(`desde ${filtros.fecha_inicio}`);
  if (filtros.fecha_fin) partes.push(`hasta ${filtros.fecha_fin}`);
  if (filtros.departamento) partes.push(`en ${filtros.departamento}`);
  if (filtros.monto_minimo) partes.push(`mayores a ${filtros.monto_minimo} ${filtros.moneda || 'USD'}`);
  if (filtros.monto_maximo) partes.push(`menores a ${filtros.monto_maximo} ${filtros.moneda || 'USD'}`);
  if (filtros.solo_personalizados) partes.push('personalizados');
  if (filtros.solo_destacados) partes.push('destacados');
  if (filtros.mes) partes.push(`del mes ${filtros.mes}`);
  
  return partes.length > 0 ? partes.join(', ') : 'sin filtros';
};
