/**
 * Botones de acción del formulario de campaña
 */

'use client';

import { Button } from '@/components/ui/button';
import { Save, Eye } from 'lucide-react';

interface CampanaFormAccionesProps {
  esEdicion: boolean;
  guardando: boolean;
  campanaId: number | null;
  onCancelar: () => void;
  onVerPreview: () => void;
}

export default function CampanaFormAcciones({
  esEdicion,
  guardando,
  campanaId,
  onCancelar,
  onVerPreview,
}: CampanaFormAccionesProps) {
  return (
    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
      <Button type="button" variant="outline" onClick={onCancelar} disabled={guardando}>
        Cancelar
      </Button>

      {esEdicion && campanaId && (
        <Button type="button" variant="outline" onClick={onVerPreview} disabled={guardando}>
          <Eye className="h-4 w-4 mr-2" />
          Ver Preview
        </Button>
      )}

      <Button type="submit" disabled={guardando}>
        <Save className="h-4 w-4 mr-2" />
        {guardando ? 'Guardando...' : esEdicion ? 'Guardar Cambios' : 'Guardar Borrador'}
      </Button>
    </div>
  );
}
