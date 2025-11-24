/**
 * Hook personalizado para comandos de voz inteligentes en reportes
 * Integra reconocimiento de voz + procesamiento NLP + síntesis de voz
 * 
 * @example
 * ```tsx
 * const {
 *   iniciarComando,
 *   procesando,
 *   ultimoComando,
 *   respuestaIA
 * } = useVoiceCommands({
 *   onComandoProcesado: (respuesta) => {
 *     if (respuesta.accion === 'generar_reporte') {
 *       generarReporte(respuesta.tipo_reporte!, respuesta.filtros!);
 *     }
 *   }
 * });
 * ```
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useSpeechSynthesis } from './useSpeechSynthesis';
import { 
  procesarComandoIA, 
  RespuestaIA, 
  MensajeIA,
  procesarComandoLocal 
} from '@/api/reportes-ia';

// ============================================================================
// TIPOS
// ============================================================================

export interface UseVoiceCommandsOptions {
  /** Callback cuando se procesa un comando exitosamente */
  onComandoProcesado?: (respuesta: RespuestaIA) => void;
  
  /** Callback cuando ocurre un error */
  onError?: (error: string) => void;
  
  /** Habilitar síntesis de voz automática para respuestas */
  autoResponder?: boolean;
  
  /** Usar procesamiento local si backend no disponible */
  usarFallbackLocal?: boolean;
  
  /** Contexto para mejorar interpretación de IA */
  contexto?: string;
  
  /** Idioma para reconocimiento y síntesis */
  idioma?: string;
}

export interface UseVoiceCommandsReturn {
  /** Iniciar captura de comando de voz */
  iniciarComando: () => void;
  
  /** Detener captura de voz */
  detenerComando: () => void;
  
  /** Procesar un comando de texto (sin voz) */
  procesarComandoTexto: (texto: string) => Promise<void>;
  
  /** Estado: ¿está escuchando? */
  escuchando: boolean;
  
  /** Estado: ¿está procesando con IA? */
  procesando: boolean;
  
  /** Estado: ¿está hablando la respuesta? */
  hablando: boolean;
  
  /** Transcripción actual del reconocimiento de voz */
  transcripcion: string;
  
  /** Último comando enviado */
  ultimoComando: string | null;
  
  /** Última respuesta de la IA */
  respuestaIA: RespuestaIA | null;
  
  /** Historial de mensajes */
  historial: MensajeIA[];
  
  /** Limpiar historial */
  limpiarHistorial: () => void;
  
  /** Soporte de navegador */
  soporteVoz: boolean;
  soporteSintesis: boolean;
  
  /** Error actual */
  error: string | null;
  
  /** Detener respuesta de voz */
  detenerRespuestaVoz: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useVoiceCommands(options: UseVoiceCommandsOptions = {}): UseVoiceCommandsReturn {
  const {
    onComandoProcesado,
    onError,
    autoResponder = true,
    usarFallbackLocal = true,
    contexto,
    idioma = 'es-ES'
  } = options;
  
  // Estados
  const [procesando, setProcesando] = useState(false);
  const [ultimoComando, setUltimoComando] = useState<string | null>(null);
  const [respuestaIA, setRespuestaIA] = useState<RespuestaIA | null>(null);
  const [historial, setHistorial] = useState<MensajeIA[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Hooks de voz
  const {
    transcript: transcripcion,
    isListening: escuchando,
    isSupported: soporteVoz,
    error: errorVoz,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition(idioma);
  
  const {
    speak,
    cancel: cancelSpeech,
    isSpeaking: hablando,
    isSupported: soporteSintesis
  } = useSpeechSynthesis(idioma);
  
  // Ref para detectar cuando se completa la transcripción
  const transcripcionPrevia = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // ============================================================================
  // EFECTOS
  // ============================================================================
  
  // Detectar errores de reconocimiento de voz
  useEffect(() => {
    if (errorVoz) {
      setError(errorVoz);
      if (onError) onError(errorVoz);
    }
  }, [errorVoz, onError]);
  
  // ============================================================================
  // AUTO-EJECUCIÓN: Procesa automáticamente cuando detecta silencio de 1.0s
  // Reducido de 1.5s a 1.0s para ejecución más rápida
  // ============================================================================
  useEffect(() => {
    if (escuchando && transcripcion && transcripcion !== transcripcionPrevia.current) {
      transcripcionPrevia.current = transcripcion;
      
      // Limpiar timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // ⏱️ TIMER DE SILENCIO: 1.0 segundos sin cambios = comando completo
      timeoutRef.current = setTimeout(() => {
        const textoLimpio = transcripcion.trim();
        
        // Validar mínimo 5 caracteres para evitar ruidos
        if (textoLimpio.length > 5) {
          console.log('🎯 Silencio detectado (1.0s) - Procesando automáticamente:', textoLimpio);
          stopListening();
          procesarComando(textoLimpio);
        }
      }, 1000);  // 1000ms = 1.0 segundos (REDUCIDO para ser más rápido)
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [transcripcion, escuchando, stopListening]);
  
  // ============================================================================
  // FUNCIONES
  // ============================================================================
  
  /**
   * Procesa un comando (interno)
   */
  const procesarComando = useCallback(async (comando: string) => {
    try {
      setProcesando(true);
      setError(null);
      setUltimoComando(comando);
      
      // Agregar comando al historial
      const mensajeUsuario: MensajeIA = {
        tipo: 'usuario',
        contenido: comando,
        timestamp: new Date()
      };
      setHistorial(prev => [...prev, mensajeUsuario]);
      
      console.log('🎤 Procesando comando:', comando);
      
      let respuesta: RespuestaIA;
      
      try {
        // Intentar procesar con backend
        respuesta = await procesarComandoIA({
          prompt: comando,
          contexto: contexto
        });
      } catch (backendError) {
        console.warn('⚠️ Backend no disponible, usando procesamiento local');
        
        if (usarFallbackLocal) {
          // Fallback: procesamiento local básico
          const resultadoLocal = procesarComandoLocal(comando);
          respuesta = {
            interpretacion: `Procesado localmente: ${comando}`,
            accion: resultadoLocal.accion || 'no_entendido',
            tipo_reporte: resultadoLocal.tipo_reporte,
            formato: resultadoLocal.formato,
            filtros: resultadoLocal.filtros,
            respuesta_texto: resultadoLocal.tipo_reporte 
              ? `Entendido, generaré un reporte de ${resultadoLocal.tipo_reporte}.`
              : 'No pude entender tu comando. Intenta ser más específico.',
            confianza: resultadoLocal.confianza || 0.5
          };
        } else {
          throw backendError;
        }
      }
      
      setRespuestaIA(respuesta);
      
      // Agregar respuesta al historial
      const mensajeAsistente: MensajeIA = {
        tipo: 'asistente',
        contenido: respuesta.respuesta_texto || respuesta.interpretacion,
        timestamp: new Date(),
        accion_ejecutada: respuesta.accion
      };
      setHistorial(prev => [...prev, mensajeAsistente]);
      
      // Síntesis de voz automática
      if (autoResponder && soporteSintesis && respuesta.respuesta_texto) {
        speak(respuesta.respuesta_texto);
      }
      
      // Callback
      if (onComandoProcesado) {
        onComandoProcesado(respuesta);
      }
      
      console.log('✅ Comando procesado:', respuesta);
      
    } catch (err: any) {
      const mensajeError = err.message || 'Error al procesar comando';
      console.error('❌ Error procesando comando:', err);
      setError(mensajeError);
      
      if (onError) {
        onError(mensajeError);
      }
      
      // Agregar error al historial
      const mensajeSistema: MensajeIA = {
        tipo: 'sistema',
        contenido: `Error: ${mensajeError}`,
        timestamp: new Date()
      };
      setHistorial(prev => [...prev, mensajeSistema]);
      
    } finally {
      setProcesando(false);
      resetTranscript();
    }
  }, [contexto, autoResponder, soporteSintesis, onComandoProcesado, onError, usarFallbackLocal]);
  
  /**
   * Iniciar captura de comando de voz
   */
  const iniciarComando = useCallback(() => {
    if (!soporteVoz) {
      const msg = 'Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.';
      setError(msg);
      if (onError) onError(msg);
      return;
    }
    
    setError(null);
    resetTranscript();
    startListening();
    
    console.log('🎤 Iniciando captura de comando...');
  }, [soporteVoz, startListening, resetTranscript, onError]);
  
  /**
   * Detener captura de voz
   */
  const detenerComando = useCallback(() => {
    stopListening();
    
    // Procesar lo que se haya capturado hasta ahora
    if (transcripcion.trim().length > 5) {
      procesarComando(transcripcion);
    }
  }, [stopListening, transcripcion, procesarComando]);
  
  /**
   * Procesar un comando de texto (sin voz)
   */
  const procesarComandoTexto = useCallback(async (texto: string) => {
    await procesarComando(texto);
  }, [procesarComando]);
  
  /**
   * Limpiar historial
   */
  const limpiarHistorial = useCallback(() => {
    setHistorial([]);
    setRespuestaIA(null);
    setUltimoComando(null);
    setError(null);
  }, []);
  
  /**
   * Detener respuesta de voz
   */
  const detenerRespuestaVoz = useCallback(() => {
    cancelSpeech();
  }, [cancelSpeech]);
  
  // ============================================================================
  // RETURN
  // ============================================================================
  
  return {
    iniciarComando,
    detenerComando,
    procesarComandoTexto,
    escuchando,
    procesando,
    hablando,
    transcripcion,
    ultimoComando,
    respuestaIA,
    historial,
    limpiarHistorial,
    soporteVoz,
    soporteSintesis,
    error,
    detenerRespuestaVoz
  };
}
