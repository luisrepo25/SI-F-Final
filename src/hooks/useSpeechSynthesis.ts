/**
 * Hook personalizado para síntesis de voz (texto a voz) usando Web Speech API
 * Compatible con la mayoría de navegadores modernos
 * 
 * @param lang - Código de idioma (por defecto 'es-ES')
 * @returns Objeto con funciones speak, cancel, pause, resume y estados isSpeaking, isPaused, isSupported
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseSpeechSynthesisReturn {
  speak: (text: string, options?: SpeechSynthesisOptions) => void;
  cancel: () => void;
  pause: () => void;
  resume: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
}

export interface SpeechSynthesisOptions {
  rate?: number;  // Velocidad (0.1 - 10, default: 1)
  pitch?: number; // Tono (0 - 2, default: 1)
  volume?: number; // Volumen (0 - 1, default: 1)
}

export function useSpeechSynthesis(lang: string = 'es-ES'): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Detectar si el navegador soporta Speech Synthesis
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Monitorear el estado de speech synthesis
  useEffect(() => {
    if (!isSupported) {
      console.warn('⚠️ Speech Synthesis API no soportada en este navegador');
      return;
    }

    // Verificar periódicamente el estado (algunos navegadores no disparan eventos correctamente)
    const checkStatus = setInterval(() => {
      if (window.speechSynthesis) {
        const speaking = window.speechSynthesis.speaking;
        const paused = window.speechSynthesis.paused;
        
        setIsSpeaking(speaking);
        setIsPaused(paused);
      }
    }, 100);

    // Cleanup: cancelar síntesis y limpiar intervalo al desmontar
    return () => {
      clearInterval(checkStatus);
      if (window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch (err) {
          console.warn('Error al limpiar speech synthesis:', err);
        }
      }
    };
  }, [isSupported]);

  // Función para reproducir texto
  const speak = useCallback((text: string, options?: SpeechSynthesisOptions) => {
    if (!isSupported) {
      console.warn('Speech synthesis no soportado en este navegador');
      return;
    }

    if (!text || text.trim().length === 0) {
      console.warn('No hay texto para reproducir');
      return;
    }

    try {
      // Cancelar cualquier síntesis en curso
      window.speechSynthesis.cancel();

      // Crear nueva utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      
      // Aplicar opciones personalizadas o usar valores por defecto
      utterance.rate = options?.rate ?? 1.0;
      utterance.pitch = options?.pitch ?? 1.0;
      utterance.volume = options?.volume ?? 1.0;

      // Event handlers
      utterance.onstart = () => {
        console.log('🔊 Síntesis de voz iniciada');
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        console.log('✅ Síntesis de voz finalizada');
        setIsSpeaking(false);
        setIsPaused(false);
        currentUtteranceRef.current = null;
      };

      utterance.onerror = (event) => {
        console.error('❌ Error en síntesis de voz:', event.error);
        setIsSpeaking(false);
        setIsPaused(false);
        currentUtteranceRef.current = null;
      };

      utterance.onpause = () => {
        console.log('⏸️ Síntesis de voz pausada');
        setIsPaused(true);
      };

      utterance.onresume = () => {
        console.log('▶️ Síntesis de voz reanudada');
        setIsPaused(false);
      };

      // Guardar referencia y reproducir
      currentUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Error al reproducir texto:', err);
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [isSupported, lang]);

  // Función para cancelar la síntesis
  const cancel = useCallback(() => {
    if (isSupported && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
        currentUtteranceRef.current = null;
        console.log('🛑 Síntesis de voz cancelada');
      } catch (err) {
        console.error('Error al cancelar síntesis:', err);
      }
    }
  }, [isSupported]);

  // Función para pausar la síntesis
  const pause = useCallback(() => {
    if (isSupported && window.speechSynthesis && isSpeaking && !isPaused) {
      try {
        window.speechSynthesis.pause();
        setIsPaused(true);
        console.log('⏸️ Síntesis de voz pausada');
      } catch (err) {
        console.error('Error al pausar síntesis:', err);
      }
    }
  }, [isSupported, isSpeaking, isPaused]);

  // Función para reanudar la síntesis
  const resume = useCallback(() => {
    if (isSupported && window.speechSynthesis && isPaused) {
      try {
        window.speechSynthesis.resume();
        setIsPaused(false);
        console.log('▶️ Síntesis de voz reanudada');
      } catch (err) {
        console.error('Error al reanudar síntesis:', err);
      }
    }
  }, [isSupported, isPaused]);

  return {
    speak,
    cancel,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported,
  };
}
