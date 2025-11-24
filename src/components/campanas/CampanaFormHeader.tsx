/**
 * Header del formulario de campaña
 */

'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface CampanaFormHeaderProps {
  esEdicion: boolean;
  onVolver: () => void;
}

export default function CampanaFormHeader({ esEdicion, onVolver }: CampanaFormHeaderProps) {
  return (
    <div className="mb-6">
      <Button variant="ghost" onClick={onVolver} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver
      </Button>
      <h1 className="text-3xl font-bold">
        {esEdicion ? 'Editar Campaña' : 'Nueva Campaña de Notificación'}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mt-2">
        {esEdicion
          ? 'Modifica los detalles de tu campaña'
          : 'Crea una nueva campaña para enviar notificaciones push'}
      </p>
    </div>
  );
}
