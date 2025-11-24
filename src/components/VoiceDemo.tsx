/**
 * Componente de prueba para verificar funcionalidades de voz
 * Este componente es opcional y puede ser eliminado
 * 
 * Para usarlo, impórtalo en cualquier página:
 * import VoiceDemo from '@/components/VoiceDemo';
 */

'use client';

import { useState } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, Play, Square } from 'lucide-react';

export default function VoiceDemo() {
  const [textToSpeak, setTextToSpeak] = useState('Hola, esta es una prueba de síntesis de voz en español.');
  
  // Hooks de voz
  const {
    transcript,
    isListening,
    isSupported: isRecognitionSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition('es-ES');

  const {
    speak,
    cancel,
    isSpeaking,
    isSupported: isSynthesisSupported,
  } = useSpeechSynthesis('es-ES');

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">🎤 Demo de Funcionalidades de Voz</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Reconocimiento de Voz */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Reconocimiento de Voz
            </CardTitle>
            <CardDescription>Speech-to-Text (STT)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Estado de soporte */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Estado:</span>
              <Badge variant={isRecognitionSupported ? "default" : "destructive"}>
                {isRecognitionSupported ? '✅ Soportado' : '❌ No Soportado'}
              </Badge>
            </div>

            {/* Estado de escucha */}
            {isRecognitionSupported && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Escuchando:</span>
                <Badge variant={isListening ? "default" : "secondary"}>
                  {isListening ? '🔴 Activo' : '⚪ Inactivo'}
                </Badge>
              </div>
            )}

            {/* Botones de control */}
            <div className="flex gap-2">
              <Button
                onClick={startListening}
                disabled={!isRecognitionSupported || isListening}
                className="flex-1"
                variant={isListening ? "destructive" : "default"}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4 mr-2" />
                    Escuchando...
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Iniciar
                  </>
                )}
              </Button>
              
              <Button
                onClick={stopListening}
                disabled={!isListening}
                variant="outline"
              >
                <Square className="w-4 h-4 mr-2" />
                Detener
              </Button>

              <Button
                onClick={resetTranscript}
                variant="outline"
              >
                Limpiar
              </Button>
            </div>

            {/* Transcripción */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Transcripción:</label>
              <div className="p-3 bg-gray-50 border rounded-lg min-h-[100px]">
                {transcript || (
                  <span className="text-gray-400 italic">
                    Haz clic en "Iniciar" y habla...
                  </span>
                )}
              </div>
            </div>

            {/* Errores */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                ⚠️ {error}
              </div>
            )}

            {/* Información */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>💡 <strong>Consejo:</strong> Habla claramente cerca del micrófono</p>
              <p>🌐 <strong>Mejor en:</strong> Chrome, Edge</p>
            </div>
          </CardContent>
        </Card>

        {/* Síntesis de Voz */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Síntesis de Voz
            </CardTitle>
            <CardDescription>Text-to-Speech (TTS)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Estado de soporte */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Estado:</span>
              <Badge variant={isSynthesisSupported ? "default" : "destructive"}>
                {isSynthesisSupported ? '✅ Soportado' : '❌ No Soportado'}
              </Badge>
            </div>

            {/* Estado de reproducción */}
            {isSynthesisSupported && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Reproduciendo:</span>
                <Badge variant={isSpeaking ? "default" : "secondary"}>
                  {isSpeaking ? '🔊 Activo' : '🔇 Inactivo'}
                </Badge>
              </div>
            )}

            {/* Texto a reproducir */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Texto a reproducir:</label>
              <textarea
                value={textToSpeak}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTextToSpeak(e.target.value)}
                placeholder="Escribe algo para reproducir..."
                className="w-full min-h-[100px] p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>

            {/* Botones de control */}
            <div className="flex gap-2">
              <Button
                onClick={() => speak(textToSpeak)}
                disabled={!isSynthesisSupported || !textToSpeak || isSpeaking}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                Reproducir
              </Button>

              <Button
                onClick={cancel}
                disabled={!isSpeaking}
                variant="outline"
              >
                <Square className="w-4 h-4 mr-2" />
                Detener
              </Button>
            </div>

            {/* Ejemplos rápidos */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ejemplos rápidos:</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => speak('Bienvenido a la aplicación de turismo')}
                  disabled={!isSynthesisSupported || isSpeaking}
                >
                  Saludo
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => speak('Gracias por usar nuestra aplicación')}
                  disabled={!isSynthesisSupported || isSpeaking}
                >
                  Despedida
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => speak('¿En qué puedo ayudarte hoy?')}
                  disabled={!isSynthesisSupported || isSpeaking}
                >
                  Pregunta
                </Button>
              </div>
            </div>

            {/* Información */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>💡 <strong>Consejo:</strong> Ajusta el volumen de tu dispositivo</p>
              <p>🌐 <strong>Compatible:</strong> Mayoría de navegadores modernos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información adicional */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>📚 Información Técnica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-2">Reconocimiento de Voz</h3>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• API: <code className="bg-gray-100 px-1 rounded">SpeechRecognition</code></li>
                <li>• Idioma: Español (es-ES)</li>
                <li>• Modo: Continuo desactivado</li>
                <li>• Resultados: Parciales y finales</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Síntesis de Voz</h3>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• API: <code className="bg-gray-100 px-1 rounded">SpeechSynthesis</code></li>
                <li>• Idioma: Español (es-ES)</li>
                <li>• Velocidad: 1.0 (normal)</li>
                <li>• Tono: 1.0 (normal)</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>ℹ️ Nota:</strong> Estas funcionalidades ya están integradas en el chatbot principal.
              Este componente es solo para pruebas y demostración.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
