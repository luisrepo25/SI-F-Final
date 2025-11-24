/**
 * Formulario de información básica de la campaña
 */

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FormularioBasicoProps {
  nombre: string;
  descripcion: string;
  onNombreChange: (value: string) => void;
  onDescripcionChange: (value: string) => void;
  errores: Record<string, string>;
}

export default function FormularioBasico({
  nombre,
  descripcion,
  onNombreChange,
  onDescripcionChange,
  errores,
}: FormularioBasicoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>📋 Información Básica</CardTitle>
        <CardDescription>Datos generales de la campaña</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="nombre">Nombre de la campaña *</Label>
          <Input
            id="nombre"
            value={nombre}
            onChange={(e) => onNombreChange(e.target.value)}
            placeholder="Ej: Bienvenida Nuevos Usuarios"
            maxLength={200}
          />
          {errores.nombre && (
            <p className="text-sm text-red-600 mt-1">{errores.nombre}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {nombre.length}/200 caracteres
          </p>
        </div>

        <div>
          <Label htmlFor="descripcion">Descripción (opcional)</Label>
          <Textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => onDescripcionChange(e.target.value)}
            placeholder="Describe el objetivo de esta campaña..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}
