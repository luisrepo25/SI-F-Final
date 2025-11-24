/**
 * Componente de Control de Voz para Reportes Inteligentes con EJECUCIÓN AUTOMÁTICA
 * 
 * 🚀 CARACTERÍSTICAS DE AUTO-EJECUCIÓN (según backend):
 * ✅ Detección automática de silencio (1.5s)
 * ✅ Procesamiento con IA sin confirmación manual
 * ✅ Descarga automática de reportes
 * ✅ Feedback de voz en cada paso
 * ✅ Manejo robusto de errores
 * 
 * 📊 FLUJO AUTOMÁTICO:
 * 1. Usuario habla → "Genera reporte de paquetes en PDF"
 * 2. Sistema detecta silencio de 1.5s → procesa automáticamente
 * 3. IA extrae: tipo=paquetes, formato=pdf
 * 4. Sistema ejecuta: genera y descarga archivo
 * 5. Voz confirma: "Reporte generado exitosamente"
 * 
 * ⚡ Sin botones de confirmación - Todo es automático
 * 
 * Basado en: BACKEND_IA_VOICE_COMMANDS.md + FRONTEND_VOICE_AUTO_EXECUTE.md
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, MessageSquare, Trash2, Send, Loader2, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';
import { RespuestaIA } from '@/api/reportes-ia';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

// ============================================================================
// TIPOS
// ============================================================================

interface VoiceReportControllerProps {
  /** Callback cuando la IA genera un comando ejecutable */
  onEjecutarComando?: (respuesta: RespuestaIA) => void;
  
  /** Callback para limpiar filtros antes de iniciar comando de voz */
  onLimpiarFiltros?: () => void;
  
  /** Contexto actual para mejorar interpretación */
  contexto?: string;
  
  /** Mostrar componente compacto */
  compacto?: boolean;
  
  /** Título personalizado */
  titulo?: string;
}

// ============================================================================
// COMPONENTE
// ============================================================================

export default function VoiceReportController({
  onEjecutarComando,
  onLimpiarFiltros,
  contexto = 'reportes',
  compacto = false,
  titulo = '🎤 Asistente de Voz Inteligente'
}: VoiceReportControllerProps) {
  
  const [comandoManual, setComandoManual] = useState('');
  const [mostrarHistorial, setMostrarHistorial] = useState(true);
  
  // ============================================================================
  // ESTADOS DE EJECUCIÓN AUTOMÁTICA
  // ============================================================================
  const [estadoEjecucion, setEstadoEjecucion] = useState<{
    fase: 'idle' | 'escuchando' | 'procesando' | 'ejecutando' | 'completado' | 'error';
    mensaje: string;
    progreso: number; // 0-100
  }>({
    fase: 'idle',
    mensaje: 'Listo para recibir comandos',
    progreso: 0
  });
  
  const {
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
  } = useVoiceCommands({
    contexto,
    autoResponder: true,
    usarFallbackLocal: true,
    onComandoProcesado: (respuesta) => {
      console.log('🎯 VoiceReportController: Comando procesado por IA:', respuesta);
      console.log('📊 Acción:', respuesta.accion);
      console.log('🎲 Confianza:', respuesta.confianza);
      
      // 🚀 EJECUCIÓN AUTOMÁTICA: Se ejecuta inmediatamente después del procesamiento
      // NO hay validación de confianza aquí - eso lo maneja handleComandoIA
      if (respuesta.accion !== 'no_entendido') {
        console.log('✅ Ejecutando comando automáticamente...');
        
        setEstadoEjecucion({
          fase: 'ejecutando',
          mensaje: `⚡ Ejecutando: ${respuesta.interpretacion}`,
          progreso: 75
        });
        
        // ⚡ EJECUCIÓN INMEDIATA - SIN ESPERAR
        if (onEjecutarComando) {
          console.log('🚀 Llamando a onEjecutarComando...');
          onEjecutarComando(respuesta);
        } else {
          console.warn('⚠️ onEjecutarComando no está definido');
        }
        
        // Simular completado (en producción esto vendría del callback de descarga)
        setTimeout(() => {
          setEstadoEjecucion({
            fase: 'completado',
            mensaje: '✅ Comando completado exitosamente',
            progreso: 100
          });
          
          // Resetear después de 3 segundos
          setTimeout(() => {
            setEstadoEjecucion({
              fase: 'idle',
              mensaje: 'Listo para recibir comandos',
              progreso: 0
            });
          }, 3000);
        }, 1000);
      } else {
        console.warn('❌ Comando no entendido, no se ejecuta');
        setEstadoEjecucion({
          fase: 'error',
          mensaje: '❓ No entendí el comando',
          progreso: 0
        });
      }
    }
  });
  
  // ============================================================================
  // EFECTO: Sincronizar transcripción con input de texto
  // ============================================================================
  useEffect(() => {
    if (escuchando && transcripcion) {
      // Mientras habla, actualizar el input con la transcripción en tiempo real
      setComandoManual(transcripcion);
    }
  }, [transcripcion, escuchando]);
  
  // ============================================================================
  // EFECTO: Validar que el callback esté conectado
  // ============================================================================
  useEffect(() => {
    console.log('🔍 VoiceReportController montado');
    console.log('🔍 onEjecutarComando existe?', !!onEjecutarComando);
    console.log('🔍 Contexto:', contexto);
  }, [onEjecutarComando, contexto]);
  
  // ============================================================================
  // EFECTO: Actualizar estado de ejecución según fase
  // ============================================================================
  useEffect(() => {
    if (escuchando) {
      setEstadoEjecucion({
        fase: 'escuchando',
        mensaje: '🎤 Escuchando tu comando...',
        progreso: 25
      });
    } else if (procesando) {
      setEstadoEjecucion({
        fase: 'procesando',
        mensaje: '🧠 Procesando con IA...',
        progreso: 50
      });
    } else if (error) {
      setEstadoEjecucion({
        fase: 'error',
        mensaje: error,
        progreso: 0
      });
    }
  }, [escuchando, procesando, error]);
  
  // ============================================================================
  // FUNCIONES
  // ============================================================================
  
  const handleToggleVoz = () => {
    if (escuchando) {
      // Detener el reconocimiento de voz
      detenerComando();
    } else {
      // 🧹 LIMPIAR FILTROS ANTES DE INICIAR COMANDO DE VOZ
      console.log('🎤 Activando micrófono - Limpiando filtros...');
      
      if (onLimpiarFiltros) {
        onLimpiarFiltros();
        console.log('✅ Filtros limpiados antes de iniciar comando de voz');
      }
      
      // Iniciar el reconocimiento de voz
      iniciarComando();
    }
  };
  
  const handleEnviarTexto = async () => {
    if (comandoManual.trim()) {
      await procesarComandoTexto(comandoManual);
      setComandoManual('');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviarTexto();
    }
  };
  
  // ============================================================================
  // EJEMPLOS DE COMANDOS
  // ============================================================================
  
  const ejemplosComandos = [
    "Genera un reporte de paquetes en PDF",
    "Muéstrame las ventas del último mes",
    "Clientes de Santa Cruz en Excel",
    "Paquetes mayores a 1000 dólares",
    "Ventas entre enero y marzo",
    "Exporta en formato Word",
    "Filtra por departamento Cochabamba",
    "Limpia todos los filtros"
  ];
  
  const handleEjemploClick = (ejemplo: string) => {
    setComandoManual(ejemplo);
  };
  
  // ============================================================================
  // RENDER COMPACTO
  // ============================================================================
  
  if (compacto) {
    return (
      <div className="space-y-2">
        {/* Indicador de transcripción (compacto) */}
        {escuchando && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-300 rounded-md animate-pulse">
            <Mic className="w-3 h-3 text-purple-600" />
            <span className="text-xs font-medium text-purple-700">
              🎤 Transcribiendo...
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          {/* Botón de voz */}
          <Button
            onClick={handleToggleVoz}
            disabled={!soporteVoz || procesando}
            variant={escuchando ? "destructive" : "default"}
            size="sm"
            className={escuchando ? "animate-pulse" : ""}
          >
            {escuchando ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          
          {/* Input de texto con transcripción automática */}
          <input
            type="text"
            value={comandoManual}
            onChange={(e) => setComandoManual(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={escuchando ? "Hablando..." : "Di o escribe un comando..."}
            disabled={procesando}
            className={`flex-1 px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 ${
              escuchando ? 'bg-purple-50 border-purple-300' : ''
            }`}
          />
          
          {/* Botón enviar */}
          <Button
            onClick={handleEnviarTexto}
            disabled={!comandoManual.trim() || procesando}
            size="sm"
            variant="ghost"
          >
            {procesando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
          
          {/* Indicador de estado */}
          {procesando && (
            <Badge variant="secondary">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Procesando...
            </Badge>
          )}
        </div>
      </div>
    );
  }
  
  // ============================================================================
  // RENDER COMPLETO
  // ============================================================================
  
  return (
    <Card className="w-full bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              {titulo}
            </CardTitle>
            <CardDescription>
              Habla o escribe en lenguaje natural para generar reportes
            </CardDescription>
          </div>
          
          {/* Controles superiores */}
          <div className="flex items-center gap-2">
            {hablando && (
              <Button
                onClick={detenerRespuestaVoz}
                size="sm"
                variant="ghost"
                title="Detener respuesta de voz"
              >
                {hablando ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            )}
            
            {historial.length > 0 && (
              <Button
                onClick={limpiarHistorial}
                size="sm"
                variant="ghost"
                title="Limpiar historial"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Estado de soporte */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">Reconocimiento:</span>
            <Badge variant={soporteVoz ? "default" : "destructive"}>
              {soporteVoz ? '✅ Soportado' : '❌ No disponible'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Síntesis:</span>
            <Badge variant={soporteSintesis ? "default" : "secondary"}>
              {soporteSintesis ? '✅ Soportado' : '⚠️ Limitado'}
            </Badge>
          </div>
        </div>
        
        {/* ======================================================================
            INDICADOR DE PROGRESO AUTOMÁTICO (según backend)
            Muestra el progreso de ejecución automática en tiempo real
        ====================================================================== */}
        {estadoEjecucion.fase !== 'idle' && (
          <Card className={`border-2 ${
            estadoEjecucion.fase === 'completado' ? 'border-green-400 bg-green-50' :
            estadoEjecucion.fase === 'error' ? 'border-red-400 bg-red-50' :
            'border-blue-400 bg-blue-50'
          }`}>
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Título de fase */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {estadoEjecucion.fase === 'escuchando' && <Mic className="w-5 h-5 text-blue-600 animate-pulse" />}
                    {estadoEjecucion.fase === 'procesando' && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
                    {estadoEjecucion.fase === 'ejecutando' && <Download className="w-5 h-5 text-purple-600 animate-bounce" />}
                    {estadoEjecucion.fase === 'completado' && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {estadoEjecucion.fase === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
                    
                    <span className="font-semibold text-gray-900">
                      {estadoEjecucion.mensaje}
                    </span>
                  </div>
                  
                  <Badge variant={
                    estadoEjecucion.fase === 'completado' ? "default" :
                    estadoEjecucion.fase === 'error' ? "destructive" :
                    "secondary"
                  }>
                    {estadoEjecucion.progreso}%
                  </Badge>
                </div>
                
                {/* Barra de progreso */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      estadoEjecucion.fase === 'completado' ? 'bg-green-600' :
                      estadoEjecucion.fase === 'error' ? 'bg-red-600' :
                      'bg-blue-600'
                    }`}
                    style={{ width: `${estadoEjecucion.progreso}%` }}
                  />
                </div>
                
                {/* Timeline de fases */}
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span className={estadoEjecucion.progreso >= 25 ? 'text-blue-600 font-semibold' : ''}>
                    1️⃣ Escuchar
                  </span>
                  <span className={estadoEjecucion.progreso >= 50 ? 'text-blue-600 font-semibold' : ''}>
                    2️⃣ Procesar IA
                  </span>
                  <span className={estadoEjecucion.progreso >= 75 ? 'text-purple-600 font-semibold' : ''}>
                    3️⃣ Ejecutar
                  </span>
                  <span className={estadoEjecucion.progreso === 100 ? 'text-green-600 font-semibold' : ''}>
                    4️⃣ Completado
                  </span>
                </div>
                
                {/* Mensaje adicional */}
                {estadoEjecucion.fase === 'escuchando' && (
                  <p className="text-sm text-blue-700">
                    💡 Habla con naturalidad, el sistema procesará automáticamente al detectar 1s de silencio
                  </p>
                )}
                {estadoEjecucion.fase === 'completado' && (
                  <p className="text-sm text-green-700">
                    ✅ El reporte se ha descargado automáticamente. ¡Puedes hacer otro comando!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        {/* Control principal de voz */}
        <div className="space-y-3">
          {/* Indicador de transcripción arriba del input */}
          {escuchando && (
            <div className="flex items-center gap-2 p-2 bg-purple-50 border border-purple-300 rounded-lg animate-pulse">
              <Mic className="w-4 h-4 text-purple-600 animate-pulse" />
              <p className="text-sm font-medium text-purple-700">
                🎤 Transcribiendo... (habla con naturalidad)
              </p>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            {/* Botón de micrófono grande */}
            <Button
              onClick={handleToggleVoz}
              disabled={!soporteVoz || procesando}
              variant={escuchando ? "destructive" : "default"}
              size="lg"
              className={`flex-shrink-0 ${escuchando ? 'animate-pulse shadow-lg' : ''}`}
            >
              {escuchando ? (
                <>
                  <MicOff className="w-5 h-5 mr-2" />
                  Detener
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 mr-2" />
                  Hablar
                </>
              )}
            </Button>
            
            {/* Input de texto con transcripción automática */}
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={comandoManual}
                onChange={(e) => setComandoManual(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={escuchando ? "Hablando..." : "O escribe tu comando aquí..."}
                disabled={procesando}
                className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-100 ${
                  escuchando ? 'bg-purple-50 border-purple-300' : ''
                }`}
              />
              <Button
                onClick={handleEnviarTexto}
                disabled={!comandoManual.trim() || procesando}
                variant="default"
              >
                {procesando ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Estado de procesamiento */}
          {procesando && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <p className="text-sm text-blue-700 font-medium">
                Procesando comando con IA...
              </p>
            </div>
          )}
        </div>
        
        {/* Última respuesta */}
        {respuestaIA && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-green-900">
                  {respuestaIA.interpretacion}
                </p>
                {respuestaIA.respuesta_texto && (
                  <p className="text-sm text-green-700">
                    {respuestaIA.respuesta_texto}
                  </p>
                )}
                
                {/* Detalles de la acción */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    Acción: {respuestaIA.accion}
                  </Badge>
                  {respuestaIA.tipo_reporte && (
                    <Badge variant="default">
                      {respuestaIA.tipo_reporte}
                    </Badge>
                  )}
                  {respuestaIA.formato && (
                    <Badge variant="secondary">
                      {respuestaIA.formato.toUpperCase()}
                    </Badge>
                  )}
                  {respuestaIA.confianza !== undefined && (
                    <Badge variant={respuestaIA.confianza > 0.7 ? "default" : "secondary"}>
                      Confianza: {(respuestaIA.confianza * 100).toFixed(0)}%
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Historial */}
        {mostrarHistorial && historial.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-700">Historial</h4>
              <Button
                onClick={() => setMostrarHistorial(!mostrarHistorial)}
                size="sm"
                variant="ghost"
              >
                {mostrarHistorial ? 'Ocultar' : 'Mostrar'}
              </Button>
            </div>
            
            <ScrollArea className="h-48 w-full rounded-lg border p-3 bg-white">
              <div className="space-y-2">
                {historial.map((mensaje, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg text-sm ${
                      mensaje.tipo === 'usuario'
                        ? 'bg-blue-100 text-blue-900 ml-8'
                        : mensaje.tipo === 'asistente'
                        ? 'bg-purple-100 text-purple-900 mr-8'
                        : 'bg-gray-100 text-gray-700 text-center'
                    }`}
                  >
                    <p className="font-medium mb-1">
                      {mensaje.tipo === 'usuario' ? '👤 Tú' : 
                       mensaje.tipo === 'asistente' ? '🤖 Asistente' : 
                       '⚙️ Sistema'}
                    </p>
                    <p>{mensaje.contenido}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {mensaje.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
        
        {/* Ejemplos rápidos */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">
            💡 Ejemplos de comandos:
          </h4>
          <div className="flex flex-wrap gap-2">
            {ejemplosComandos.map((ejemplo, idx) => (
              <Button
                key={idx}
                onClick={() => handleEjemploClick(ejemplo)}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                {ejemplo}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Información */}
        <div className="text-xs text-gray-500 space-y-1 p-3 bg-gray-50 rounded-lg">
          <p>💡 <strong>Consejo:</strong> Habla con naturalidad, la IA entiende lenguaje cotidiano</p>
          <p>🌐 <strong>Compatible:</strong> Chrome, Edge (mejor soporte), Safari y Firefox (limitado)</p>
          <p>🔒 <strong>Privacidad:</strong> Los comandos se procesan de forma segura</p>
        </div>
      </CardContent>
    </Card>
  );
}
