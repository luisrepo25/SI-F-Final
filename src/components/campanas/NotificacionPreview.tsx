/**
 * Preview de cómo se verá la notificación en el dispositivo móvil
 */

import { Card, CardContent } from "@/components/ui/card";
import type { TipoNotificacion } from "@/api/campanas";

interface NotificacionPreviewProps {
  titulo: string;
  cuerpo: string;
  tipo?: TipoNotificacion;
}

const ICONOS_TIPO: Record<TipoNotificacion, string> = {
  campana_marketing: "📢",
  promocional: "🎁",
  urgente: "⏰",
  actualizacion_sistema: "⚙️",
  informativa: "ℹ️",
};

export default function NotificacionPreview({
  titulo,
  cuerpo,
  tipo = "campana_marketing",
}: NotificacionPreviewProps) {
  const icono = ICONOS_TIPO[tipo];

  return (
    <Card className="max-w-sm mx-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icono de la app */}
          <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl">
            {icono}
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
                {titulo || "Título de la notificación"}
              </h4>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                Ahora
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
              {cuerpo || "Cuerpo de la notificación aparecerá aquí"}
            </p>
          </div>
        </div>

        {/* Nombre de la app */}
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Sistema de Turismo
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
