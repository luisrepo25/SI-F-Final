/**
 * API de Campañas de Notificaciones
 * Endpoints para gestión de campañas push del sistema
 */

import api from './axios';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export type EstadoCampana = 'BORRADOR' | 'PROGRAMADA' | 'EN_CURSO' | 'COMPLETADA' | 'CANCELADA';
export type TipoAudiencia = 'TODOS' | 'USUARIOS' | 'SEGMENTO';
// ✅ VALORES VÁLIDOS según backend (GUIA_SISTEMA_NOTIFICACIONES_FRONTEND.md sección 5.3)
export type TipoNotificacion = 'informativa' | 'promocional' | 'urgente' | 'campana_marketing' | 'actualizacion_sistema';

// Constantes de tipos válidos para validación
export const TIPOS_NOTIFICACION_VALIDOS: readonly TipoNotificacion[] = [
  'informativa',
  'promocional', 
  'urgente',
  'campana_marketing',
  'actualizacion_sistema'
] as const;

export const TIPOS_AUDIENCIA_VALIDOS: readonly TipoAudiencia[] = [
  'TODOS',
  'USUARIOS',
  'SEGMENTO'
] as const;

export interface Campana {
  id: number;
  nombre: string;
  descripcion?: string;
  titulo: string;
  cuerpo: string;
  tipo_notificacion: TipoNotificacion;
  tipo_audiencia: TipoAudiencia;
  estado: EstadoCampana;
  enviar_inmediatamente: boolean;
  fecha_programada?: string | null;
  fecha_enviada?: string | null;
  total_destinatarios: number;
  total_enviados: number;
  total_errores: number;
  total_leidos: number;
  usuarios_objetivo: number[];
  segmento_filtros: Record<string, any>;
  created_at: string;
  updated_at: string;
  puede_editarse: boolean;
  puede_activarse: boolean;
  puede_cancelarse: boolean;
}

export interface CampanaFormData {
  nombre: string;
  descripcion?: string;
  titulo: string;
  cuerpo: string;
  tipo_notificacion: TipoNotificacion;
  tipo_audiencia: TipoAudiencia;
  enviar_inmediatamente: boolean;
  fecha_programada?: string | null;
  usuarios_objetivo?: number[];
  segmento_filtros?: Record<string, any>;
}

// ✅ Estructura según GUIA_SISTEMA_NOTIFICACIONES_FRONTEND.md sección 4.2.3
export interface CampanaPreview {
  total_destinatarios: number;  // ✅ En la raíz
  campana: {
    id: number;
    nombre: string;
    estado: EstadoCampana;
  };
  contenido: {
    titulo: string;
    cuerpo: string;
    tipo_notificacion: TipoNotificacion;
  };
  segmentacion: {  // ✅ "segmentacion" no "estadisticas"
    tipo_audiencia: TipoAudiencia;
    total_destinatarios: number;
  };
  destinatarios_preview: Destinatario[];  // ✅ "destinatarios_preview" no "destinatarios"
  nota?: string;
}

export interface Destinatario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  tiene_dispositivo_fcm: boolean;
}

export interface CampanaMetricas {
  campana: Campana;
  tasa_exito: number;
  tasa_apertura: number;
  tasa_error: number;
  grafico_data: {
    labels: string[];
    values: number[];
  };
}

export interface ListaCampanasParams {
  estado?: EstadoCampana;
  tipo_audiencia?: TipoAudiencia;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

// ============================================================================
// FUNCIONES API
// ============================================================================

/**
 * Obtener lista de campañas con filtros opcionales
 */
export const obtenerCampanas = async (params?: ListaCampanasParams) => {
  const response = await api.get<Campana[]>('/campanas-notificacion/', { params });
  return response.data;
};

/**
 * Obtener detalle de una campaña específica
 */
export const obtenerCampana = async (id: number) => {
  const response = await api.get<Campana>(`/campanas-notificacion/${id}/`);
  return response.data;
};

/**
 * Crear nueva campaña
 */
export const crearCampana = async (data: CampanaFormData) => {
  const response = await api.post<Campana>('/campanas-notificacion/', data);
  return response.data;
};

/**
 * Actualizar campaña existente (solo si está en BORRADOR)
 */
export const actualizarCampana = async (id: number, data: Partial<CampanaFormData>) => {
  const response = await api.patch<Campana>(`/campanas-notificacion/${id}/`, data);
  return response.data;
};

/**
 * Eliminar campaña (solo si está en BORRADOR)
 */
export const eliminarCampana = async (id: number) => {
  await api.delete(`/campanas-notificacion/${id}/`);
};

/**
 * Obtener vista previa de destinatarios de una campaña
 */
export const obtenerPreview = async (id: number) => {
  const response = await api.get<CampanaPreview>(`/campanas-notificacion/${id}/preview/`);
  return response.data;
};

/**
 * Enviar notificación de prueba (al usuario actual o a uno específico)
 */
export const enviarPrueba = async (id: number, usuario_id?: number) => {
  const response = await api.post<{ mensaje: string; enviado: boolean }>(
    `/campanas-notificacion/${id}/enviar_test/`,
    usuario_id ? { usuario_id } : {}
  );
  return response.data;
};

/**
 * Activar campaña (ejecutar envío masivo)
 */
export const activarCampana = async (id: number) => {
  const response = await api.post<{ mensaje: string; campana: Campana }>(
    `/campanas-notificacion/${id}/activar/`,
    {}
  );
  return response.data;
};

/**
 * Cancelar campaña programada
 */
export const cancelarCampana = async (id: number) => {
  const response = await api.post<{ mensaje: string; campana: Campana }>(
    `/campanas-notificacion/${id}/cancelar/`,
    {}
  );
  return response.data;
};

/**
 * Actualizar métricas de una campaña
 */
export const actualizarMetricas = async (id: number) => {
  const response = await api.post<{ mensaje: string; campana: Campana }>(
    `/campanas-notificacion/${id}/actualizar_metricas/`,
    {}
  );
  return response.data;
};

/**
 * Duplicar una campaña existente
 */
export const duplicarCampana = async (id: number) => {
  const campana = await obtenerCampana(id);
  
  const nuevaCampana: CampanaFormData = {
    nombre: `${campana.nombre} (Copia)`,
    descripcion: campana.descripcion,
    titulo: campana.titulo,
    cuerpo: campana.cuerpo,
    tipo_notificacion: campana.tipo_notificacion,
    tipo_audiencia: campana.tipo_audiencia,
    enviar_inmediatamente: false,
    usuarios_objetivo: campana.usuarios_objetivo,
    segmento_filtros: campana.segmento_filtros,
  };
  
  return await crearCampana(nuevaCampana);
};

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Validar formulario de campaña
 * NOTA: Validaciones mínimas - la mayoría de restricciones están desactivadas
 */
export const validarFormularioCampana = (data: Partial<CampanaFormData>) => {
  const errores: Record<string, string> = {};

  // Validar nombre
  if (!data.nombre || data.nombre.trim() === '') {
    errores.nombre = 'El nombre es requerido';
  }

  // Título y cuerpo REQUERIDOS por el backend
  if (!data.titulo || data.titulo.trim() === '') {
    errores.titulo = 'El título es requerido';
  }

  if (!data.cuerpo || data.cuerpo.trim() === '') {
    errores.cuerpo = 'El cuerpo es requerido';
  }

  // Tipo de notificación requerido
  if (!data.tipo_notificacion) {
    errores.tipo_notificacion = 'Selecciona un tipo de notificación';
  } else {
    // Validar que sea uno de los 5 valores permitidos por el backend
    if (!TIPOS_NOTIFICACION_VALIDOS.includes(data.tipo_notificacion as TipoNotificacion)) {
      errores.tipo_notificacion = `Tipo inválido. Debe ser uno de: ${TIPOS_NOTIFICACION_VALIDOS.join(', ')}`;
    }
  }

  // Tipo de audiencia requerido
  if (!data.tipo_audiencia) {
    errores.tipo_audiencia = 'Selecciona un tipo de audiencia';
  }

  // Sin validación de usuarios específicos
  // if (data.tipo_audiencia === 'USUARIOS') {
  //   if (!data.usuarios_objetivo || data.usuarios_objetivo.length === 0) {
  //     errores.usuarios_objetivo = 'Debes seleccionar al menos un usuario';
  //   }
  // }

  // Sin validación de segmentos
  // if (data.tipo_audiencia === 'SEGMENTO') {
  //   if (!data.segmento_filtros || Object.keys(data.segmento_filtros).length === 0) {
  //     errores.segmento_filtros = 'Debes configurar al menos un filtro';
  //   }
  // }

  // Sin validación de fecha programada
  // if (!data.enviar_inmediatamente && !data.fecha_programada) {
  //   errores.fecha_programada = 'Debes especificar una fecha o marcar envío inmediato';
  // }

  // VALIDACIÓN DE FECHA FUTURA DESACTIVADA - Se permite programar en cualquier momento
  // if (data.fecha_programada) {
  //   const fechaSeleccionada = new Date(data.fecha_programada);
  //   const ahora = new Date();

  //   if (fechaSeleccionada <= ahora) {
  //     errores.fecha_programada = 'La fecha debe ser en el futuro';
  //   }
  // }

  return {
    esValido: Object.keys(errores).length === 0,
    errores,
  };
};

/**
 * Calcular métricas de una campaña
 */
export const calcularMetricasCampana = (campana: Campana) => {
  const tasaExito = campana.total_destinatarios > 0
    ? (campana.total_enviados / campana.total_destinatarios) * 100
    : 0;

  const tasaApertura = campana.total_enviados > 0
    ? (campana.total_leidos / campana.total_enviados) * 100
    : 0;

  const tasaError = campana.total_destinatarios > 0
    ? (campana.total_errores / campana.total_destinatarios) * 100
    : 0;

  return {
    tasaExito: tasaExito.toFixed(1),
    tasaApertura: tasaApertura.toFixed(1),
    tasaError: tasaError.toFixed(1),
  };
};
