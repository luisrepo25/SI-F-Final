/**
 * Badge de estado para campañas de notificaciones
 * Muestra el estado actual con color e ícono correspondiente
 */

import { Badge } from '@/components/ui/badge';
import type { EstadoCampana } from '@/api/campanas';

interface EstadoBadgeProps {
  estado: EstadoCampana;
  className?: string;
}

const ESTADOS_CONFIG = {
  BORRADOR: {
    label: 'Borrador',
    variant: 'secondary' as const,
    icon: '📝',
    descripcion: 'Campaña en edición',
  },
  PROGRAMADA: {
    label: 'Programada',
    variant: 'default' as const,
    icon: '📅',
    descripcion: 'Esperando fecha de envío',
  },
  EN_CURSO: {
    label: 'En Curso',
    variant: 'default' as const,
    icon: '⏳',
    descripcion: 'Enviando notificaciones',
  },
  COMPLETADA: {
    label: 'Completada',
    variant: 'default' as const,
    icon: '✅',
    descripcion: 'Campaña enviada exitosamente',
  },
  CANCELADA: {
    label: 'Cancelada',
    variant: 'destructive' as const,
    icon: '❌',
    descripcion: 'Campaña cancelada',
  },
} as const;

export default function EstadoBadge({ estado, className }: EstadoBadgeProps) {
  const config = ESTADOS_CONFIG[estado];

  if (!config) {
    return <Badge variant="secondary">{estado}</Badge>;
  }

  return (
    <Badge 
      variant={config.variant} 
      className={className}
      title={config.descripcion}
    >
      {config.icon} {config.label}
    </Badge>
  );
}

export { ESTADOS_CONFIG };
