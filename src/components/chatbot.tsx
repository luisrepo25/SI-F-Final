"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useToast } from "@/hooks/use-toast";

export default function ChatTurismo() {
  const [abierto, setAbierto] = useState(false);
  const [pregunta, setPregunta] = useState("");
  const [mensajes, setMensajes] = useState<
    { tipo: "user" | "bot"; texto: string }[]
  >([]);
  const [cargando, setCargando] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // ==================== NUEVO: Estados y hooks de voz ====================
  const [autoPlayResponse, setAutoPlayResponse] = useState(false); // Desactivado por defecto para no interrumpir
  const { toast } = useToast();
  
  // Hook de reconocimiento de voz (speech-to-text)
  const {
    transcript,
    isListening,
    isSupported: isSpeechRecognitionSupported,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition('es-ES');
  
  // Hook de síntesis de voz (text-to-speech)
  const {
    speak,
    cancel: cancelSpeech,
    isSpeaking,
    isSupported: isSpeechSynthesisSupported,
  } = useSpeechSynthesis('es-ES');
  // ========================================================================

  // Auto-scroll al final cuando llega un nuevo mensaje
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [mensajes]);

  // ==================== NUEVO: Sincronizar transcripción de voz con textarea ====================
  useEffect(() => {
    if (transcript && transcript.trim()) {
      setPregunta(transcript);
    }
  }, [transcript]);

  // ==================== NUEVO: Mostrar errores de voz con toast ====================
  useEffect(() => {
    if (speechError) {
      toast({
        title: "Error de Voz",
        description: speechError,
        variant: "destructive",
      });
    }
  }, [speechError, toast]);

  // ==================== NUEVO: Auto-reproducir respuestas del bot (opcional) ====================
  useEffect(() => {
    if (autoPlayResponse && mensajes.length > 0 && !cargando) {
      const lastMessage = mensajes[mensajes.length - 1];
      if (lastMessage.tipo === 'bot') {
        // Esperar un momento antes de hablar para que se vea el mensaje
        setTimeout(() => {
          speak(lastMessage.texto);
        }, 300);
      }
    }
  }, [mensajes, autoPlayResponse, speak, cargando]);

  // ==================== NUEVO: Limpiar síntesis al cerrar el chat ====================
  useEffect(() => {
    if (!abierto) {
      cancelSpeech();
      if (isListening) {
        stopListening();
      }
    }
  }, [abierto, cancelSpeech, isListening, stopListening]);
  // ========================================================================

  // 🔹 Función para detectar si hay un enlace en el texto del bot
  const renderMensaje = (texto: string, esMensajeBot: boolean = false) => {
    // Detecta URLs dentro del texto
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const partes = texto.split(urlRegex);

    return (
      <div>
        {partes.map((parte, i) => {
          if (parte.match(urlRegex)) {
            return (
              <button
                key={i}
                onClick={() => (window.location.href = parte)} // 👈 redirige en la misma pestaña
                className="block mt-1 bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded-lg transition-all duration-200"
              >
                👉 Ir al enlace
              </button>
            );
          }
          return <span key={i}>{parte}</span>;
        })}
        
        {/* ==================== NUEVO: Botón de audio en mensajes del bot ==================== */}
        {esMensajeBot && isSpeechSynthesisSupported && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isSpeaking) {
                cancelSpeech();
              } else {
                speak(texto);
              }
            }}
            className="ml-2 text-xs opacity-70 hover:opacity-100 transition-opacity"
            title={isSpeaking ? "Detener audio" : "Reproducir audio"}
          >
            {isSpeaking ? '⏸️' : '🔊'}
          </button>
        )}
        {/* ==================================================================================== */}
      </div>
    );
  };

  const enviar = async () => {
    if (!pregunta.trim()) return;

    const nuevoMensaje: { tipo: "user" | "bot"; texto: string } = { tipo: "user", texto: pregunta };
    setMensajes((prev) => [...prev, nuevoMensaje]);
    setPregunta("");
    setCargando(true);

    // ==================== NUEVO: Detener reconocimiento de voz al enviar ====================
    if (isListening) {
      stopListening();
    }
    // ========================================================================================

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chatbot/turismo/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pregunta }),
        }
      );

      const data = await res.json();
      const respuesta = data.respuesta || "No se pudo obtener respuesta 😅";
      setMensajes((prev) => [...prev, { tipo: "bot", texto: respuesta }]);
    } catch (error) {
      setMensajes((prev) => [
        ...prev,
        { tipo: "bot", texto: "⚠️ Error al conectar con el servidor." },
      ]);
    } finally {
      setCargando(false);
    }
  };

  // ==================== NUEVO: Manejar clic en botón de micrófono ====================
  const handleMicClick = () => {
    if (!isSpeechRecognitionSupported) {
      toast({
        title: "No Soportado",
        description: "Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };
  // ===================================================================================

  return (
    <>
      {/* 🌟 Botón flotante */}
      <button
        onClick={() => setAbierto(!abierto)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl transition-all duration-300 flex items-center justify-center z-50"
      >
        {abierto ? <X size={22} /> : <MessageCircle size={26} />}
      </button>

      {/* 💬 Ventana de chat */}
      {abierto && (
        <div className="fixed bottom-20 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl flex flex-col h-[500px] overflow-hidden z-40 animate-fade-in border border-gray-200">
          {/* Header con toggle de audio */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-3 py-2 flex items-center justify-between">
            <span className="font-semibold">Chat Turístico 🤖</span>
            {/* ==================== NUEVO: Toggle de auto-reproducción ==================== */}
            {isSpeechSynthesisSupported && (
              <button
                onClick={() => setAutoPlayResponse(!autoPlayResponse)}
                className="p-1.5 hover:bg-blue-700 rounded-md transition-colors"
                title={autoPlayResponse ? "Desactivar respuestas por voz" : "Activar respuestas por voz"}
              >
                {autoPlayResponse ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
            )}
            {/* =============================================================================== */}
          </div>

          {/* Área de mensajes */}
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          >
            {mensajes.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.tipo === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm leading-relaxed shadow-md ${
                    msg.tipo === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {renderMensaje(msg.texto, msg.tipo === 'bot')}
                </div>
              </div>
            ))}

            {cargando && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-2xl rounded-bl-none max-w-[70%] animate-pulse">
                  Escribiendo...
                </div>
              </div>
            )}
          </div>

          {/* Input con botón de micrófono */}
          <div className="p-3 border-t flex gap-2 bg-white">
            <textarea
              rows={1}
              className="flex-1 border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 resize-none"
              placeholder={isListening ? "🎤 Escuchando..." : "Escribe o habla tu pregunta..."}
              value={pregunta}
              onChange={(e) => setPregunta(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && enviar()}
            />
            
            {/* ==================== NUEVO: Botón de Micrófono ==================== */}
            {isSpeechRecognitionSupported && (
              <button
                onClick={handleMicClick}
                disabled={cargando}
                className={`px-3 py-2 rounded-lg font-medium transition-all ${
                  isListening
                    ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                    : cargando
                    ? "bg-gray-300 cursor-not-allowed text-gray-500"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
                title={isListening ? "Detener grabación (clic o automático)" : "Grabar mensaje de voz"}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            )}
            {/* ==================================================================== */}
            
            <button
              onClick={enviar}
              disabled={cargando}
              className={`px-4 py-2 rounded-lg text-white font-medium transition ${
                cargando
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Animación suave */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        /* Scrollbar bonita */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-thumb {
          background-color: #cbd5e0;
          border-radius: 3px;
        }
      `}</style>
    </>
  );
}
