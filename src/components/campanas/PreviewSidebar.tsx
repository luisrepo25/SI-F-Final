/**
 * Sidebar con preview de notificación y acciones
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import NotificacionPreview from '@/components/campanas/NotificacionPreview';

interface PreviewSidebarProps {
  titulo: string;
  cuerpo: string;
  nota?: string;
  campanaId: number;
  onEditar: () => void;
}

export default function PreviewSidebar({
  titulo,
  cuerpo,
  nota,
  onEditar,
}: PreviewSidebarProps) {
  return (
    <div className="sticky top-6">
      <Card>
        <CardHeader>
          <CardTitle>📱 Vista Previa</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificacionPreview
            titulo={titulo}
            cuerpo={cuerpo}
          />

          {/* Información adicional */}
          <div className="mt-6 space-y-3 text-sm">
            {nota && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ℹ️ {nota}
                </p>
              </div>
            )}

            <div className="pt-3 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={onEditar}
              >
                Editar Campaña
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
