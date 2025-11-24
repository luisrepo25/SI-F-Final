/**
 * Formulario de contenido de la notificación
 */

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { TipoNotificacion } from '@/api/campanas';

// ✅ VALORES VÁLIDOS según documentación del backend (sección 5.3)
const TIPOS_NOTIFICACION = [
  { value: 'informativa', label: 'Informativa', icon: 'ℹ️' },
  { value: 'promocional', label: 'Promocional', icon: '🎁' },
  { value: 'urgente', label: 'Urgente', icon: '🚨' },
  { value: 'campana_marketing', label: 'Campaña Marketing', icon: '📢' },
  { value: 'actualizacion_sistema', label: 'Actualización Sistema', icon: '⚙️' },
] as const;

interface FormularioContenidoProps {
  titulo: string;
  cuerpo: string;
  tipoNotificacion: TipoNotificacion;
  onTituloChange: (value: string) => void;
  onCuerpoChange: (value: string) => void;
  onTipoNotificacionChange: (value: TipoNotificacion) => void;
  errores: Record<string, string>;
}

export default function FormularioContenido({
  titulo,
  cuerpo,
  tipoNotificacion,
  onTituloChange,
  onCuerpoChange,
  onTipoNotificacionChange,
  errores,
}: FormularioContenidoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>📱 Contenido de la Notificación</CardTitle>
        <CardDescription>Mensaje que verán los usuarios</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="titulo">Título *</Label>
          <Input
            id="titulo"
            value={titulo}
            onChange={(e) => onTituloChange(e.target.value)}
            placeholder="Ej: ¡Bienvenido! 🎉"
            maxLength={100}
          />
          {errores.titulo && (
            <p className="text-sm text-red-600 mt-1">{errores.titulo}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {titulo.length}/100 caracteres
          </p>
        </div>

        <div>
          <Label htmlFor="cuerpo">Cuerpo del mensaje *</Label>
          <Textarea
            id="cuerpo"
            value={cuerpo}
            onChange={(e) => onCuerpoChange(e.target.value)}
            placeholder="Ej: Explora nuestros servicios y encuentra las mejores ofertas..."
            rows={4}
            maxLength={500}
          />
          {errores.cuerpo && (
            <p className="text-sm text-red-600 mt-1">{errores.cuerpo}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {cuerpo.length}/500 caracteres
          </p>
        </div>

        <div>
          <Label>Tipo de notificación *</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {TIPOS_NOTIFICACION.map((tipo) => (
              <div
                key={tipo.value}
                className={`flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition ${
                  tipoNotificacion === tipo.value ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => onTipoNotificacionChange(tipo.value as TipoNotificacion)}
              >
                <div className={`size-4 rounded-full border-2 flex items-center justify-center ${
                  tipoNotificacion === tipo.value ? 'border-primary' : 'border-gray-300'
                }`}>
                  {tipoNotificacion === tipo.value && (
                    <div className="size-2 rounded-full bg-primary" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span>{tipo.icon}</span>
                  <span>{tipo.label}</span>
                </div>
              </div>
            ))}
          </div>
          {errores.tipo_notificacion && (
            <p className="text-sm text-red-600 mt-1">{errores.tipo_notificacion}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
