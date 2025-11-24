/**
 * Header de la página de preview con acciones
 */

import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, PlayCircle, RefreshCw } from 'lucide-react';
import EstadoBadge from '@/components/campanas/EstadoBadge';
import type { EstadoCampana } from '@/api/campanas';

interface PreviewHeaderProps {
  nombre: string;
  estado: EstadoCampana;
  enviandoPrueba: boolean;
  activando: boolean;
  onVolver: () => void;
  onEnviarPrueba: () => void;
  onActivar: () => void;
}

export default function PreviewHeader({
  nombre,
  estado,
  enviandoPrueba,
  activando,
  onVolver,
  onEnviarPrueba,
  onActivar,
}: PreviewHeaderProps) {
  return (
    <div className="mb-6">
      <Button variant="ghost" onClick={onVolver} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{nombre}</h1>
            <EstadoBadge estado={estado} />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onEnviarPrueba}
            disabled={enviandoPrueba}
          >
            {enviandoPrueba ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Enviar Prueba
          </Button>

          <Button
            onClick={onActivar}
            disabled={activando}
            className="bg-green-600 hover:bg-green-700"
          >
            {activando ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <PlayCircle className="h-4 w-4 mr-2" />
            )}
            Activar Campaña
          </Button>
        </div>
      </div>
    </div>
  );
}
