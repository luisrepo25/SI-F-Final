/**
 * Página de detalle de campaña
 * Muestra información completa y métricas en tiempo real
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Edit, XCircle, Copy, RefreshCw } from 'lucide-react';

import type { Campana } from '@/api/campanas';
import { obtenerCampana, cancelarCampana } from '@/api/campanas';
import EstadoBadge from '@/components/campanas/EstadoBadge';
import NotificacionPreview from '@/components/campanas/NotificacionPreview';
import MetricasCampana from '@/components/campanas/MetricasCampana';

export default function CampanaDetallePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const campanaId = Number(params.id);

  const [campana, setCampana] = useState<Campana | null>(null);
  const [cargando, setCargando] = useState(true);
  const [cancelando, setCancelando] = useState(false);

  useEffect(() => {
    cargarCampana();
  }, [campanaId]);

  const cargarCampana = async () => {
    setCargando(true);
    try {
      const data = await obtenerCampana(campanaId);
      setCampana(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'No se pudo cargar la campaña',
        variant: 'destructive',
      });
      router.push('/dashboard/campanas');
    } finally {
      setCargando(false);
    }
  };

  const handleCancelar = async () => {
    if (!confirm('¿Estás seguro de cancelar esta campaña?\n\nEsta acción no se puede deshacer.')) {
      return;
    }

    setCancelando(true);
    try {
      await cancelarCampana(campanaId);
      toast({
        title: '✅ Campaña cancelada',
        description: 'La campaña ha sido cancelada correctamente',
      });
      cargarCampana();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'No se pudo cancelar la campaña',
        variant: 'destructive',
      });
    } finally {
      setCancelando(false);
    }
  };

  const handleDuplicar = () => {
    if (!campana) return;
    
    // Redirigir al formulario con los datos de la campaña actual como base
    router.push(`/dashboard/campanas/nuevo?duplicar=${campanaId}`);
  };

  if (cargando) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Cargando campaña...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!campana) return null;

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push('/dashboard/campanas')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Campañas
          </Button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{campana.nombre}</h1>
              <EstadoBadge estado={campana.estado} />
            </div>
            {campana.descripcion && (
              <p className="text-gray-500 dark:text-gray-400">{campana.descripcion}</p>
            )}
          </div>

          <div className="flex gap-2">
            {campana.puede_editarse && (
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/campanas/${campanaId}/editar`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}

            {campana.puede_cancelarse && (
              <Button
                variant="outline"
                onClick={handleCancelar}
                disabled={cancelando}
                className="text-red-600 hover:text-red-700"
              >
                {cancelando ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Cancelar
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleDuplicar}
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplicar
            </Button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Columna izquierda: Información y métricas */}
        <div className="md:col-span-2 space-y-6">
          {/* Métricas */}
          {(campana.estado === 'EN_CURSO' || campana.estado === 'COMPLETADA') && (
            <MetricasCampana
              campana={campana}
              onActualizarMetricas={cargarCampana}
            />
          )}

          {/* Información detallada */}
          <Card>
            <CardHeader>
              <CardTitle>📋 Información de la Campaña</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Tipo de Notificación</span>
                  <div className="font-medium capitalize mt-1">
                    {campana.tipo_notificacion.replace('_', ' ')}
                  </div>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Tipo de Audiencia</span>
                  <div className="font-medium mt-1">
                    {campana.tipo_audiencia === 'TODOS' && '👥 Todos los usuarios'}
                    {campana.tipo_audiencia === 'USUARIOS' && '👤 Usuarios específicos'}
                    {campana.tipo_audiencia === 'SEGMENTO' && '🎯 Segmento personalizado'}
                  </div>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Creada</span>
                  <div className="font-medium mt-1">
                    {new Date(campana.created_at).toLocaleString('es-ES')}
                  </div>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Última actualización</span>
                  <div className="font-medium mt-1">
                    {new Date(campana.updated_at).toLocaleString('es-ES')}
                  </div>
                </div>

                {campana.fecha_programada && (
                  <div>
                    <span className="text-sm text-gray-500">Fecha programada</span>
                    <div className="font-medium mt-1">
                      {new Date(campana.fecha_programada).toLocaleString('es-ES')}
                    </div>
                  </div>
                )}

                {campana.fecha_enviada && (
                  <div>
                    <span className="text-sm text-gray-500">Fecha de envío</span>
                    <div className="font-medium mt-1">
                      {new Date(campana.fecha_enviada).toLocaleString('es-ES')}
                    </div>
                  </div>
                )}
              </div>

              {/* Segmentación */}
              {campana.tipo_audiencia === 'SEGMENTO' && Object.keys(campana.segmento_filtros).length > 0 && (
                <div className="pt-4 border-t">
                  <span className="text-sm text-gray-500 font-semibold">Segmentación aplicada</span>
                  <div className="mt-2 space-y-2">
                    {Object.entries(campana.segmento_filtros).map(([filtro, valor]) => (
                      <div key={filtro} className="flex items-center gap-2 text-sm">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                          {filtro}
                        </span>
                        <span>=</span>
                        <span className="font-medium">{JSON.stringify(valor)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Usuarios objetivo */}
              {campana.tipo_audiencia === 'USUARIOS' && campana.usuarios_objetivo.length > 0 && (
                <div className="pt-4 border-t">
                  <span className="text-sm text-gray-500 font-semibold">Usuarios seleccionados</span>
                  <div className="mt-2">
                    <span className="font-medium">{campana.usuarios_objetivo.length} usuarios</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline de estados */}
          <Card>
            <CardHeader>
              <CardTitle>📅 Línea de Tiempo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-gray-400 mt-1.5" />
                  <div>
                    <div className="font-medium">Creada</div>
                    <div className="text-sm text-gray-500">
                      {new Date(campana.created_at).toLocaleString('es-ES')}
                    </div>
                  </div>
                </div>

                {campana.fecha_programada && (
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${
                      campana.estado === 'PROGRAMADA' ? 'bg-blue-500' : 'bg-gray-400'
                    }`} />
                    <div>
                      <div className="font-medium">Programada</div>
                      <div className="text-sm text-gray-500">
                        Para: {new Date(campana.fecha_programada).toLocaleString('es-ES')}
                      </div>
                    </div>
                  </div>
                )}

                {campana.fecha_enviada && (
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${
                      campana.estado === 'EN_CURSO' || campana.estado === 'COMPLETADA' 
                        ? 'bg-green-500' 
                        : 'bg-gray-400'
                    }`} />
                    <div>
                      <div className="font-medium">Enviada</div>
                      <div className="text-sm text-gray-500">
                        {new Date(campana.fecha_enviada).toLocaleString('es-ES')}
                      </div>
                    </div>
                  </div>
                )}

                {campana.estado === 'COMPLETADA' && (
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-600 mt-1.5" />
                    <div>
                      <div className="font-medium">Completada</div>
                      <div className="text-sm text-gray-500">
                        {campana.total_enviados} de {campana.total_destinatarios} enviados
                      </div>
                    </div>
                  </div>
                )}

                {campana.estado === 'CANCELADA' && (
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-600 mt-1.5" />
                    <div>
                      <div className="font-medium">Cancelada</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha: Preview de notificación */}
        <div className="md:col-span-1">
          <div className="sticky top-6">
            <Card>
              <CardHeader>
                <CardTitle>📱 Vista Previa</CardTitle>
              </CardHeader>
              <CardContent>
                <NotificacionPreview
                  titulo={campana.titulo}
                  cuerpo={campana.cuerpo}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
