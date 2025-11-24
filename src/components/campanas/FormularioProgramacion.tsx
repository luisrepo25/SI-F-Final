/**
 * Formulario de programación de la campaña
 */

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FormularioProgramacionProps {
  enviarInmediatamente: boolean;
  fechaProgramada: string | null;
  onEnviarInmediatamenteChange: (value: boolean) => void;
  onFechaProgramadaChange: (value: string) => void;
  errores: Record<string, string>;
}

export default function FormularioProgramacion({
  enviarInmediatamente,
  fechaProgramada,
  onEnviarInmediatamenteChange,
  onFechaProgramadaChange,
  errores,
}: FormularioProgramacionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>⏰ Programación</CardTitle>
        <CardDescription>Cuándo enviar la campaña</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="enviar_inmediatamente"
            checked={!enviarInmediatamente}
            onCheckedChange={(checked) => onEnviarInmediatamenteChange(!checked)}
          />
          <Label htmlFor="enviar_inmediatamente" className="cursor-pointer">
            Programar para más tarde (no enviar ahora)
          </Label>
        </div>

        {!enviarInmediatamente && (
          <div>
            <Label htmlFor="fecha_programada">Fecha y hora de envío</Label>
            <Input
              id="fecha_programada"
              type="datetime-local"
              value={fechaProgramada || ''}
              onChange={(e) => onFechaProgramadaChange(e.target.value)}
              className="mt-1"
            />
            {errores.fecha_programada && (
              <p className="text-sm text-red-600 mt-1">{errores.fecha_programada}</p>
            )}
          </div>
        )}

        {enviarInmediatamente && (
          <div className="text-sm text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
            ⚠️ La campaña se guardará como borrador. Podrás activarla después de revisar.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
