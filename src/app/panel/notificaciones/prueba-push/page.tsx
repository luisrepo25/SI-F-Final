'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import api from '@/api/axios';
import { 
  Send, 
  CheckCircle2, 
  XCircle, 
  User, 
  Smartphone,
  Bell,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface UsuarioInfo {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  tiene_fcm_token: boolean;
  fcm_token_preview: string;
  dispositivos_activos: number;
  ultima_actualizacion_token: string | null;
}

interface ResultadoPrueba {
  exito: boolean;
  mensaje: string;
  detalles?: any;
}

export default function PruebaPushPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('luis@prueba.com');
  const [usuarioInfo, setUsuarioInfo] = useState<UsuarioInfo | null>(null);
  const [resultadoPrueba, setResultadoPrueba] = useState<ResultadoPrueba | null>(null);
  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Verificar estado del usuario
  const verificarUsuario = async () => {
    setCargando(true);
    setUsuarioInfo(null);
    setResultadoPrueba(null);

    try {
      const response = await api.get(`/notificaciones/verificar-usuario/`, {
        params: { email }
      });

      setUsuarioInfo(response.data);
      
      toast({
        title: '✅ Usuario encontrado',
        description: `${response.data.nombre} - Token FCM: ${response.data.tiene_fcm_token ? 'Activo' : 'No configurado'}`,
      });
    } catch (error: any) {
      toast({
        title: '❌ Error',
        description: error.response?.data?.detail || 'Usuario no encontrado',
        variant: 'destructive',
      });
    } finally {
      setCargando(false);
    }
  };

  // Enviar notificación de prueba directa
  const enviarNotificacionPrueba = async () => {
    if (!usuarioInfo) {
      toast({
        title: 'Error',
        description: 'Primero verifica el usuario',
        variant: 'destructive',
      });
      return;
    }

    setEnviando(true);
    setResultadoPrueba(null);

    try {
      const response = await api.post(`/notificaciones/prueba-directa/`, {
        usuario_id: usuarioInfo.id,
        titulo: '🔔 Prueba Controlada',
        mensaje: `Hola ${usuarioInfo.nombre}, esta es una notificación de prueba enviada a las ${new Date().toLocaleTimeString()}`,
        tipo: 'sistema',
      });

      setResultadoPrueba({
        exito: true,
        mensaje: response.data.mensaje,
        detalles: response.data,
      });

      toast({
        title: '✅ Notificación enviada',
        description: 'Revisa tu dispositivo Flutter',
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 
                      error.response?.data?.error ||
                      'Error al enviar notificación';
      
      setResultadoPrueba({
        exito: false,
        mensaje: errorMsg,
        detalles: error.response?.data,
      });

      toast({
        title: '❌ Error al enviar',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">🧪 Prueba de Notificaciones Push</h1>
        <p className="text-muted-foreground mt-2">
          Verificación controlada del sistema de notificaciones push para Flutter
        </p>
      </div>

      {/* Paso 1: Verificar Usuario */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            Paso 1: Verificar Usuario
          </CardTitle>
          <CardDescription>
            Introduce el email del usuario y verifica si tiene token FCM activo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="email">Email del usuario</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                disabled={cargando}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={verificarUsuario}
                disabled={cargando || !email}
                size="lg"
              >
                {cargando ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 size-4" />
                    Verificar
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Información del Usuario */}
          {usuarioInfo && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium">{usuarioInfo.nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{usuarioInfo.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rol</p>
                  <Badge variant="outline">{usuarioInfo.rol}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado Token FCM</p>
                  {usuarioInfo.tiene_fcm_token ? (
                    <Badge className="bg-green-500">
                      <CheckCircle2 className="mr-1 size-3" />
                      Activo
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="mr-1 size-3" />
                      No configurado
                    </Badge>
                  )}
                </div>
                {usuarioInfo.tiene_fcm_token && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Dispositivos</p>
                      <p className="flex items-center gap-1">
                        <Smartphone className="size-4" />
                        <span className="font-medium">{usuarioInfo.dispositivos_activos}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Última actualización</p>
                      <p className="text-sm">
                        {usuarioInfo.ultima_actualizacion_token 
                          ? new Date(usuarioInfo.ultima_actualizacion_token).toLocaleString()
                          : 'N/A'
                        }
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Token FCM (preview)</p>
                      <code className="text-xs bg-black/5 dark:bg-white/5 p-2 rounded block overflow-x-auto">
                        {usuarioInfo.fcm_token_preview}
                      </code>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paso 2: Enviar Notificación de Prueba */}
      {usuarioInfo && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="size-5" />
              Paso 2: Enviar Notificación de Prueba
            </CardTitle>
            <CardDescription>
              Envía una notificación push directa al usuario para verificar conectividad
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!usuarioInfo.tiene_fcm_token && (
              <div className="flex items-start gap-3 p-4 border border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950 rounded-lg">
                <AlertCircle className="size-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-900 dark:text-orange-100">
                    Usuario sin token FCM
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                    Este usuario no tiene configurado un token FCM. Asegúrate de que:
                  </p>
                  <ul className="text-sm text-orange-700 dark:text-orange-300 mt-2 ml-4 list-disc space-y-1">
                    <li>La app Flutter está instalada y abierta</li>
                    <li>El usuario ha iniciado sesión en Flutter</li>
                    <li>Los permisos de notificaciones están activados</li>
                    <li>Firebase está correctamente configurado en Flutter</li>
                  </ul>
                </div>
              </div>
            )}

            <Button 
              onClick={enviarNotificacionPrueba}
              disabled={enviando || !usuarioInfo.tiene_fcm_token}
              size="lg"
              className="w-full"
            >
              {enviando ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Enviando notificación...
                </>
              ) : (
                <>
                  <Bell className="mr-2 size-4" />
                  Enviar Notificación de Prueba
                </>
              )}
            </Button>

            {/* Resultado del Envío */}
            {resultadoPrueba && (
              <div className={`mt-4 p-4 border rounded-lg ${
                resultadoPrueba.exito 
                  ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900'
                  : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900'
              }`}>
                <div className="flex items-start gap-3">
                  {resultadoPrueba.exito ? (
                    <CheckCircle2 className="size-5 text-green-600 dark:text-green-400 mt-0.5" />
                  ) : (
                    <XCircle className="size-5 text-red-600 dark:text-red-400 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${
                      resultadoPrueba.exito 
                        ? 'text-green-900 dark:text-green-100'
                        : 'text-red-900 dark:text-red-100'
                    }`}>
                      {resultadoPrueba.exito ? '✅ Notificación enviada' : '❌ Error al enviar'}
                    </p>
                    <p className={`text-sm mt-1 ${
                      resultadoPrueba.exito 
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-red-700 dark:text-red-300'
                    }`}>
                      {resultadoPrueba.mensaje}
                    </p>
                    {resultadoPrueba.detalles && (
                      <details className="mt-3">
                        <summary className="text-sm cursor-pointer hover:underline">
                          Ver detalles técnicos
                        </summary>
                        <pre className="mt-2 text-xs bg-black/10 dark:bg-white/10 p-3 rounded overflow-x-auto">
                          {JSON.stringify(resultadoPrueba.detalles, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Guía de Diagnóstico */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Guía de Diagnóstico</CardTitle>
          <CardDescription>
            Posibles causas si las notificaciones no llegan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">1. Usuario sin Token FCM</h4>
              <ul className="text-sm text-muted-foreground ml-4 list-disc space-y-1">
                <li>Verificar que Flutter app esté abierta y usuario logueado</li>
                <li>Revisar configuración de Firebase en Flutter</li>
                <li>Verificar permisos de notificaciones en el dispositivo</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">2. Backend no envía notificación</h4>
              <ul className="text-sm text-muted-foreground ml-4 list-disc space-y-1">
                <li>Revisar logs del backend Django</li>
                <li>Verificar credenciales de Firebase Admin SDK</li>
                <li>Comprobar que el endpoint /notificaciones/prueba-directa/ existe</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">3. Firebase rechaza el envío</h4>
              <ul className="text-sm text-muted-foreground ml-4 list-disc space-y-1">
                <li>Token FCM expirado o inválido</li>
                <li>Proyecto Firebase mal configurado</li>
                <li>Cuota de mensajes excedida</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">4. Flutter no muestra la notificación</h4>
              <ul className="text-sm text-muted-foreground ml-4 list-disc space-y-1">
                <li>Servicio de notificaciones no inicializado en Flutter</li>
                <li>Handler de mensajes en primer/segundo plano no configurado</li>
                <li>Canal de notificaciones no creado en Android</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
