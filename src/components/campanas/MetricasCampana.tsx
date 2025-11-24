/**
 * Gráfico de métricas de campaña
 * Muestra estadísticas de envíos, aperturas y errores
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Campana } from '@/api/campanas';
import { calcularMetricasCampana } from '@/api/campanas';

interface MetricasCampanaProps {
  campana: Campana;
  onActualizarMetricas?: () => void;
}

export default function MetricasCampana({ campana, onActualizarMetricas }: MetricasCampanaProps) {
  const { tasaExito, tasaApertura, tasaError } = calcularMetricasCampana(campana);

  const metricas = [
    {
      label: 'Total Destinatarios',
      valor: campana.total_destinatarios,
      color: 'text-gray-700 dark:text-gray-300',
      icon: '👥',
    },
    {
      label: 'Enviados',
      valor: campana.total_enviados,
      porcentaje: tasaExito,
      color: 'text-green-600 dark:text-green-400',
      icon: '✅',
      progress: parseFloat(tasaExito),
    },
    {
      label: 'Leídos',
      valor: campana.total_leidos,
      porcentaje: tasaApertura,
      color: 'text-blue-600 dark:text-blue-400',
      icon: '👁️',
      progress: parseFloat(tasaApertura),
    },
    {
      label: 'Errores',
      valor: campana.total_errores,
      porcentaje: tasaError,
      color: 'text-red-600 dark:text-red-400',
      icon: '❌',
      progress: parseFloat(tasaError),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">📊 Métricas de Campaña</CardTitle>
            <CardDescription>
              Estadísticas de envío y lectura
            </CardDescription>
          </div>
          {onActualizarMetricas && campana.estado === 'COMPLETADA' && (
            <button
              onClick={onActualizarMetricas}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
            >
              🔄 Actualizar
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {metricas.map((metrica, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <span>{metrica.icon}</span>
                <span>{metrica.label}</span>
              </span>
              <div className="text-right">
                <span className={`text-lg font-bold ${metrica.color}`}>
                  {metrica.valor}
                </span>
                {metrica.porcentaje && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({metrica.porcentaje}%)
                  </span>
                )}
              </div>
            </div>
            {metrica.progress !== undefined && (
              <Progress value={metrica.progress} className="h-2" />
            )}
          </div>
        ))}

        {/* Resumen visual */}
        {campana.total_destinatarios > 0 && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                <div className="font-semibold text-green-700 dark:text-green-300">
                  {tasaExito}%
                </div>
                <div className="text-gray-600 dark:text-gray-400">Éxito</div>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                <div className="font-semibold text-blue-700 dark:text-blue-300">
                  {tasaApertura}%
                </div>
                <div className="text-gray-600 dark:text-gray-400">Apertura</div>
              </div>
              <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded">
                <div className="font-semibold text-red-700 dark:text-red-300">
                  {tasaError}%
                </div>
                <div className="text-gray-600 dark:text-gray-400">Error</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
