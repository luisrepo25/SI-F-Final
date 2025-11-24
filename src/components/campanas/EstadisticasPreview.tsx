/**
 * Tarjeta de estadísticas de preview
 * Muestra destinatarios, FCM y distribución por roles
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EstadisticasPreviewProps {
  totalDestinatarios: number;
  conDispositivoFcm: number;
  sinDispositivoFcm: number;
  distribucionRoles: Record<string, number>;
}

export default function EstadisticasPreview({
  totalDestinatarios,
  conDispositivoFcm,
  sinDispositivoFcm,
  distribucionRoles,
}: EstadisticasPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 Estadísticas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {totalDestinatarios}
            </div>
            <div className="text-sm text-gray-500">Total Destinatarios</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {conDispositivoFcm}
            </div>
            <div className="text-sm text-gray-500">Con FCM</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {sinDispositivoFcm}
            </div>
            <div className="text-sm text-gray-500">Sin FCM</div>
          </div>
        </div>

        {/* Distribución por rol */}
        {distribucionRoles && Object.keys(distribucionRoles).length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-3">Distribución por Rol</h4>
            <div className="space-y-2">
              {Object.entries(distribucionRoles).map(([rol, cantidad]) => {
                const porcentaje = ((cantidad / totalDestinatarios) * 100).toFixed(1);
                return (
                  <div key={rol}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{rol}</span>
                      <span className="font-medium">{cantidad} ({porcentaje}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
