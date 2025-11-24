/**
 * Hook personalizado para reconocimiento de voz usando Web Speech API
 * Compatible con Chrome, Edge y navegadores basados en Chromium
 * 
 * @param lang - Código de idioma (por defecto 'es-ES')
 * @returns Objeto con transcript, isListening, isSupported, error y funciones de control
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export interface UseSpeechRecognitionReturn {
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition(lang: string = 'es-ES'): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  // Detectar si el navegador soporta Speech Recognition
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!isSupported) {
      console.warn('⚠️ Web Speech API no soportada en este navegador');
      return;
    }

    try {
      // Inicializar reconocimiento con el constructor apropiado
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognitionAPI() as ISpeechRecognition;

      // Configuración del reconocimiento
      recognition.continuous = false; // Solo una frase (más estable)
      recognition.interimResults = true; // Mostrar resultados parciales
      recognition.lang = lang;

      // Handler: cuando inicia el reconocimiento
      recognition.onstart = () => {
        console.log('🎤 Reconocimiento de voz iniciado');
        setIsListening(true);
        setError(null);
      };

      // Handler: procesar resultados de voz
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        // Iterar sobre todos los resultados
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart;
          } else {
            interimTranscript += transcriptPart;
          }
        }

        // Actualizar el transcript (priorizar final sobre interim)
        const newTranscript = finalTranscript || interimTranscript;
        setTranscript(newTranscript);
        console.log('📝 Transcript:', newTranscript);
      };

      // Handler: manejar errores
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('❌ Error en reconocimiento de voz:', event.error);
        setIsListening(false);
        
        // Mensajes de error amigables en español
        switch (event.error) {
          case 'not-allowed':
          case 'permission-denied':
            setError('Permiso de micrófono denegado. Por favor, habilítalo en la configuración del navegador.');
            break;
          case 'no-speech':
            setError('No se detectó voz. Intenta hablar más cerca del micrófono.');
            break;
          case 'audio-capture':
            setError('No se encontró micrófono. Verifica que esté conectado.');
            break;
          case 'network':
            setError('Error de red. Verifica tu conexión a Internet.');
            break;
          case 'aborted':
            // Abortado intencionalmente, no mostrar error
            setError(null);
            break;
          default:
            setError(`Error de reconocimiento de voz: ${event.error}`);
        }
      };

      // Handler: cuando termina el reconocimiento
      recognition.onend = () => {
        console.log('🛑 Reconocimiento de voz finalizado');
        setIsListening(false);
      };

      recognitionRef.current = recognition;

      // Cleanup: detener reconocimiento al desmontar componente
      return () => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch (err) {
            console.warn('Error al limpiar reconocimiento:', err);
          }
        }
      };
    } catch (err) {
      console.error('Error inicializando Web Speech API:', err);
      setError('No se pudo inicializar el reconocimiento de voz.');
    }
  }, [isSupported, lang]);

  // Función para iniciar la escucha
  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.');
      return;
    }

    if (recognitionRef.current && !isListening) {
      try {
        setError(null);
        setTranscript('');
        recognitionRef.current.start();
      } catch (err: any) {
        console.error('Error al iniciar reconocimiento:', err);
        // Si ya está activo, intentar reiniciarlo
        if (err.message && err.message.includes('already started')) {
          try {
            recognitionRef.current.stop();
            setTimeout(() => {
              if (recognitionRef.current) {
                recognitionRef.current.start();
              }
            }, 100);
          } catch (retryErr) {
            setError('No se pudo iniciar el reconocimiento de voz.');
          }
        } else {
          setError('No se pudo iniciar el reconocimiento de voz.');
        }
      }
    }
  }, [isSupported, isListening]);

  // Función para detener la escucha
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Error al detener reconocimiento:', err);
      }
    }
  }, [isListening]);

  // Función para resetear el transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    transcript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
