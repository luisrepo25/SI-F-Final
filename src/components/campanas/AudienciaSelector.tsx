/**
 * Selector de tipo de audiencia para campañas
 * Permite elegir entre: Todos, Usuarios específicos, o Segmento
 */

import { Label } from '@/components/ui/label';
import type { TipoAudiencia } from '@/api/campanas';

interface AudienciaSelectorProps {
  value: TipoAudiencia;
  onChange: (value: TipoAudiencia) => void;
}

const OPCIONES_AUDIENCIA = [
  {
    value: 'TODOS' as TipoAudiencia,
    label: 'Todos los usuarios',
    descripcion: 'Enviar a todos los usuarios activos del sistema',
    icon: '👥',
    recomendado: true,
  },
  {
    value: 'USUARIOS' as TipoAudiencia,
    label: 'Usuarios específicos',
    descripcion: 'Seleccionar usuarios manualmente',
    icon: '👤',
  },
  {
    value: 'SEGMENTO' as TipoAudiencia,
    label: 'Segmento personalizado',
    descripcion: 'Filtrar por rol, país, viajes, etc.',
    icon: '🎯',
  },
];

export default function AudienciaSelector({ value, onChange }: AudienciaSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">¿A quién enviar? *</Label>
      
      <div className="space-y-2">
        {OPCIONES_AUDIENCIA.map((opcion) => (
          <div
            key={opcion.value}
            className={`flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer ${
              value === opcion.value ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => onChange(opcion.value)}
          >
            <div className={`mt-0.5 size-4 rounded-full border-2 flex items-center justify-center ${
              value === opcion.value ? 'border-primary' : 'border-gray-300'
            }`}>
              {value === opcion.value && (
                <div className="size-2 rounded-full bg-primary" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">{opcion.icon}</span>
                <span className="font-medium">{opcion.label}</span>
                {opcion.recomendado && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                    Recomendado
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-7">
                {opcion.descripcion}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
