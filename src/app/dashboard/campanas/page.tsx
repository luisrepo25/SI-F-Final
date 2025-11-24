/**
 * Página principal de gestión de campañas de notificaciones
 * Dashboard con lista, filtros y acciones
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Eye, Edit, Trash2, Send, RefreshCw } from 'lucide-react';

import type { Campana, EstadoCampana, TipoAudiencia } from '@/api/campanas';
import { obtenerCampanas, eliminarCampana } from '@/api/campanas';
import EstadoBadge from '@/components/campanas/EstadoBadge';

export default function CampanasPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoCampana | 'TODOS'>('TODOS');
  const [filtroAudiencia, setFiltroAudiencia] = useState<TipoAudiencia | 'TODOS'>('TODOS');

  useEffect(() => {
    cargarCampanas();
  }, [filtroEstado, filtroAudiencia]);

  const cargarCampanas = async () => {
    setCargando(true);
    try {
      const params: any = {};
      
      if (filtroEstado !== 'TODOS') {
        params.estado = filtroEstado;
      }
      
      if (filtroAudiencia !== 'TODOS') {
        params.tipo_audiencia = filtroAudiencia;
      }
      
      if (busqueda) {
        params.search = busqueda;
      }

      const data = await obtenerCampanas(params);
      setCampanas(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las campañas',
        variant: 'destructive',
      });
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id: number, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar la campaña "${nombre}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await eliminarCampana(id);
      toast({
        title: '✅ Campaña eliminada',
        description: 'La campaña se eliminó correctamente',
      });
      cargarCampanas();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'No se pudo eliminar la campaña',
        variant: 'destructive',
      });
    }
  };

  const campanasFiltradas = campanas.filter((campana) => {
    if (!busqueda) return true;
    const termino = busqueda.toLowerCase();
    return (
      campana.nombre.toLowerCase().includes(termino) ||
      campana.titulo.toLowerCase().includes(termino) ||
      campana.descripcion?.toLowerCase().includes(termino)
    );
  });

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">📢 Campañas de Notificaciones</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Gestiona tus campañas de notificaciones push
              </p>
            </div>
            <Button onClick={() => router.push('/dashboard/campanas/nuevo')}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Campaña
            </Button>
          </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, título o descripción..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filtroEstado} onValueChange={(v) => setFiltroEstado(v as any)}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos los estados</SelectItem>
                  <SelectItem value="BORRADOR">Borrador</SelectItem>
                  <SelectItem value="PROGRAMADA">Programada</SelectItem>
                  <SelectItem value="EN_CURSO">En Curso</SelectItem>
                  <SelectItem value="COMPLETADA">Completada</SelectItem>
                  <SelectItem value="CANCELADA">Cancelada</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filtroAudiencia} onValueChange={(v) => setFiltroAudiencia(v as any)}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Audiencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todas las audiencias</SelectItem>
                  <SelectItem value="TODOS">Todos los usuarios</SelectItem>
                  <SelectItem value="USUARIOS">Usuarios específicos</SelectItem>
                  <SelectItem value="SEGMENTO">Segmento</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" onClick={cargarCampanas}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de campañas */}
      {cargando ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Cargando campañas...</p>
        </div>
      ) : campanasFiltradas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">📢</div>
            <h3 className="text-lg font-semibold mb-2">
              {busqueda || filtroEstado !== 'TODOS' || filtroAudiencia !== 'TODOS'
                ? 'No se encontraron campañas'
                : 'No hay campañas creadas'
              }
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {busqueda || filtroEstado !== 'TODOS' || filtroAudiencia !== 'TODOS'
                ? 'Intenta con otros filtros de búsqueda'
                : 'Crea tu primera campaña para enviar notificaciones'
              }
            </p>
            {!busqueda && filtroEstado === 'TODOS' && filtroAudiencia === 'TODOS' && (
              <Button onClick={() => router.push('/dashboard/campanas/nuevo')}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Campaña
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {campanasFiltradas.map((campana) => (
            <Card key={campana.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  {/* Información principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold truncate">
                        {campana.nombre}
                      </h3>
                      <EstadoBadge estado={campana.estado} />
                    </div>

                    {campana.descripcion && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {campana.descripcion}
                      </p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Audiencia:</span>
                        <div className="font-medium mt-1">
                          {campana.tipo_audiencia === 'TODOS' && '👥 Todos'}
                          {campana.tipo_audiencia === 'USUARIOS' && '👤 Específicos'}
                          {campana.tipo_audiencia === 'SEGMENTO' && '🎯 Segmento'}
                        </div>
                      </div>

                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Destinatarios:</span>
                        <div className="font-medium mt-1">
                          {campana.total_destinatarios}
                        </div>
                      </div>

                      {campana.estado === 'COMPLETADA' && (
                        <>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Enviados:</span>
                            <div className="font-medium text-green-600 mt-1">
                              {campana.total_enviados}
                            </div>
                          </div>

                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Leídos:</span>
                            <div className="font-medium text-blue-600 mt-1">
                              {campana.total_leidos}
                            </div>
                          </div>
                        </>
                      )}

                      {campana.fecha_programada && campana.estado === 'PROGRAMADA' && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Programada para:</span>
                          <div className="font-medium mt-1">
                            {new Date(campana.fecha_programada).toLocaleString('es-ES')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/campanas/${campana.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>

                    {campana.puede_editarse && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/campanas/${campana.id}/editar`)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    )}

                    {campana.puede_activarse && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/campanas/${campana.id}/preview`)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Activar
                      </Button>
                    )}

                    {campana.estado === 'BORRADOR' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEliminar(campana.id, campana.nombre)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Estadísticas rápidas */}
      {!cargando && campanas.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold">{campanas.length}</div>
              <div className="text-sm text-gray-500">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-gray-600">
                {campanas.filter((c) => c.estado === 'BORRADOR').length}
              </div>
              <div className="text-sm text-gray-500">Borradores</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-600">
                {campanas.filter((c) => c.estado === 'COMPLETADA').length}
              </div>
              <div className="text-sm text-gray-500">Completadas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {campanas.filter((c) => c.estado === 'PROGRAMADA').length}
              </div>
              <div className="text-sm text-gray-500">Programadas</div>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </div>
  );
}
