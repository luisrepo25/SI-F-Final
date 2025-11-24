/**
 * Página de preview de campaña
 * Muestra destinatarios y permite enviar prueba o activar
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';

import type { CampanaPreview } from '@/api/campanas';
import { obtenerPreview, enviarPrueba, activarCampana } from '@/api/campanas';

// Componentes modulares
import PreviewHeader from '@/components/campanas/PreviewHeader';
import EstadisticasPreview from '@/components/campanas/EstadisticasPreview';
import ListaDestinatarios from '@/components/campanas/ListaDestinatarios';
import PreviewSidebar from '@/components/campanas/PreviewSidebar';

export default function CampanaPreviewPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const campanaId = Number(params.id);

  const [preview, setPreview] = useState<CampanaPreview | null>(null);
  const [cargando, setCargando] = useState(true);
  const [enviandoPrueba, setEnviandoPrueba] = useState(false);
  const [activando, setActivando] = useState(false);

  useEffect(() => {
    cargarPreview();
  }, [campanaId]);

  const cargarPreview = async () => {
    setCargando(true);
    try {
      const data = await obtenerPreview(campanaId);
      setPreview(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'No se pudo cargar la vista previa',
        variant: 'destructive',
      });
      router.push('/dashboard/campanas');
    } finally {
      setCargando(false);
    }
  };

  const handleEnviarPrueba = async () => {
    setEnviandoPrueba(true);
    try {
      await enviarPrueba(campanaId);
      toast({
        title: '✅ Notificación de prueba enviada',
        description: 'Revisa tu dispositivo en unos segundos',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'No se pudo enviar la prueba',
        variant: 'destructive',
      });
    } finally {
      setEnviandoPrueba(false);
    }
  };

  const handleActivar = async () => {
    if (!confirm('¿Estás seguro de activar esta campaña?\n\nSe enviarán las notificaciones a todos los destinatarios.')) {
      return;
    }

    setActivando(true);
    try {
      await activarCampana(campanaId);
      toast({
        title: '✅ Campaña activada',
        description: 'Las notificaciones se están enviando',
      });
      router.push(`/dashboard/campanas/${campanaId}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'No se pudo activar la campaña',
        variant: 'destructive',
      });
    } finally {
      setActivando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Cargando vista previa...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!preview) return null;

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        {/* Header con acciones */}
        <PreviewHeader
          nombre={preview.campana.nombre}
          estado={preview.campana.estado}
          enviandoPrueba={enviandoPrueba}
          activando={activando}
          onVolver={() => router.back()}
          onEnviarPrueba={handleEnviarPrueba}
          onActivar={handleActivar}
        />

        {/* Grid principal */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Columna izquierda: Información y destinatarios */}
          <div className="md:col-span-2 space-y-6">
            {/* Estadísticas */}
            <EstadisticasPreview
              totalDestinatarios={preview.total_destinatarios}
              conDispositivoFcm={preview.total_destinatarios}
              sinDispositivoFcm={0}
              distribucionRoles={{}}
            />

            {/* Lista de destinatarios con búsqueda */}
            <ListaDestinatarios
              destinatarios={preview.destinatarios_preview}
              totalDestinatarios={preview.total_destinatarios}
            />
          </div>

          {/* Columna derecha: Preview y acciones */}
          <div className="md:col-span-1">
            <PreviewSidebar
              titulo={preview.contenido.titulo}
              cuerpo={preview.contenido.cuerpo}
              nota={preview.nota}
              campanaId={campanaId}
              onEditar={() => router.push(`/dashboard/campanas/${campanaId}/editar`)}
            />
          </div>
        </div>
        </div>
    </div>
  );
}