/**
 * Página para crear o editar una campaña de notificaciones
 * Formulario completo con validaciones y vista previa
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

import type { CampanaFormData, TipoAudiencia, TipoNotificacion } from '@/api/campanas';
import {
  crearCampana,
  obtenerCampana,
  actualizarCampana,
  validarFormularioCampana,
} from '@/api/campanas';

import CampanaFormHeader from '@/components/campanas/CampanaFormHeader';
import FormularioBasico from '@/components/campanas/FormularioBasico';
import FormularioContenido from '@/components/campanas/FormularioContenido';
import FormularioProgramacion from '@/components/campanas/FormularioProgramacion';
import AudienciaSelector from '@/components/campanas/AudienciaSelector';
import UsuarioSelector from '@/components/campanas/UsuarioSelector';
import SegmentacionForm from '@/components/campanas/SegmentacionForm';
import NotificacionPreview from '@/components/campanas/NotificacionPreview';
import CampanaFormAcciones from '@/components/campanas/CampanaFormAcciones';

export default function CampanaFormPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const campanaId = params?.id ? parseInt(params.id as string) : null;
  const esEdicion = campanaId !== null;

  // Estado del formulario
  const [formData, setFormData] = useState<CampanaFormData>({
    nombre: '',
    descripcion: '',
    titulo: '',
    cuerpo: '',
    tipo_notificacion: 'campana_marketing',
    tipo_audiencia: 'TODOS',
    enviar_inmediatamente: false,
    fecha_programada: null,
    usuarios_objetivo: [],
    segmento_filtros: {},
  });

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Función auxiliar para convertir fecha ISO a formato datetime-local
  const convertirFechaParaInput = (fechaISO: string | null | undefined): string => {
    if (!fechaISO) return '';
    // Convertir "2025-11-02T10:00:00Z" a "2025-11-02T10:00"
    return fechaISO.slice(0, 16);
  };

  // Cargar campaña si es edición
  useEffect(() => {
    if (esEdicion && campanaId) {
      cargarCampana();
    }
  }, [campanaId]);

  const cargarCampana = async () => {
    setCargando(true);
    try {
      const campana = await obtenerCampana(campanaId!);
      
      // Permitir editar BORRADOR y PROGRAMADA (que aún no se han enviado)
      const estadosEditables = ['BORRADOR', 'PROGRAMADA'];
      if (!estadosEditables.includes(campana.estado)) {
        toast({
          title: 'No se puede editar',
          description: 'Solo las campañas en borrador o programadas pueden ser editadas',
          variant: 'destructive',
        });
        router.push('/dashboard/campanas');
        return;
      }

      setFormData({
        nombre: campana.nombre,
        descripcion: campana.descripcion || '',
        titulo: campana.titulo,
        cuerpo: campana.cuerpo,
        tipo_notificacion: campana.tipo_notificacion,
        tipo_audiencia: campana.tipo_audiencia,
        enviar_inmediatamente: campana.enviar_inmediatamente,
        fecha_programada: convertirFechaParaInput(campana.fecha_programada),
        usuarios_objetivo: campana.usuarios_objetivo,
        segmento_filtros: campana.segmento_filtros,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'No se pudo cargar la campaña',
        variant: 'destructive',
      });
      router.push('/dashboard/campanas');
    } finally {
      setCargando(false);
    }
  };

  const actualizarCampo = (campo: keyof CampanaFormData, valor: any) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
    // Limpiar error del campo cuando se modifica
    if (errores[campo]) {
      setErrores((prev) => {
        const nuevos = { ...prev };
        delete nuevos[campo];
        return nuevos;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar formulario
    const { esValido, errores: erroresValidacion } = validarFormularioCampana(formData);

    if (!esValido) {
      setErrores(erroresValidacion);
      toast({
        title: 'Errores en el formulario',
        description: 'Por favor corrige los errores antes de continuar',
        variant: 'destructive',
      });
      return;
    }

    setGuardando(true);
    try {
      if (esEdicion && campanaId) {
        await actualizarCampana(campanaId, formData);
        toast({
          title: '✅ Campaña actualizada',
          description: 'Los cambios se guardaron correctamente',
        });
      } else {
        const campanaCreada = await crearCampana(formData);
        toast({
          title: '✅ Campaña creada',
          description: 'La campaña se creó como borrador',
        });
        // Redirigir al preview
        router.push(`/dashboard/campanas/${campanaCreada.id}/preview`);
        return;
      }

      // Si es edición, regresar a la lista
      router.push('/dashboard/campanas');
    } catch (error: any) {
      const mensajeError = error.response?.data?.detail || 
        error.response?.data?.non_field_errors?.[0] ||
        'Error al guardar la campaña';

      toast({
        title: 'Error',
        description: mensajeError,
        variant: 'destructive',
      });

      // Mostrar errores de validación del backend
      if (error.response?.data && typeof error.response.data === 'object') {
        setErrores(error.response.data);
      }
    } finally {
      setGuardando(false);
    }
  };

  const irAPreview = () => {
    if (campanaId) {
      router.push(`/dashboard/campanas/${campanaId}/preview`);
    }
  };

  if (cargando) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="text-center py-12">
            Cargando campaña...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <CampanaFormHeader
          esEdicion={esEdicion}
          onVolver={() => router.push('/dashboard/campanas')}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna izquierda: Formulario */}
            <div className="lg:col-span-2 space-y-6">
              {/* Información Básica */}
              <FormularioBasico
                nombre={formData.nombre}
                descripcion={formData.descripcion || ''}
                onNombreChange={(value) => actualizarCampo('nombre', value)}
                onDescripcionChange={(value) => actualizarCampo('descripcion', value)}
                errores={errores}
              />

              {/* Contenido de la Notificación */}
              <FormularioContenido
                titulo={formData.titulo}
                cuerpo={formData.cuerpo}
                tipoNotificacion={formData.tipo_notificacion}
                onTituloChange={(value) => actualizarCampo('titulo', value)}
                onCuerpoChange={(value) => actualizarCampo('cuerpo', value)}
                onTipoNotificacionChange={(value) => actualizarCampo('tipo_notificacion', value)}
                errores={errores}
              />

              {/* Audiencia */}
              <div>
                <AudienciaSelector
                  value={formData.tipo_audiencia}
                  onChange={(value) => actualizarCampo('tipo_audiencia', value)}
                />
                {errores.tipo_audiencia && (
                  <p className="text-sm text-red-600 mt-1">{errores.tipo_audiencia}</p>
                )}
              </div>

              {/* Configuración según tipo de audiencia */}
              {formData.tipo_audiencia === 'USUARIOS' && (
                <UsuarioSelector
                  seleccionados={formData.usuarios_objetivo || []}
                  onChange={(ids) => actualizarCampo('usuarios_objetivo', ids)}
                />
              )}

              {formData.tipo_audiencia === 'SEGMENTO' && (
                <SegmentacionForm
                  filtros={formData.segmento_filtros || {}}
                  onChange={(filtros) => actualizarCampo('segmento_filtros', filtros)}
                />
              )}

              {/* Programación */}
              <FormularioProgramacion
                enviarInmediatamente={formData.enviar_inmediatamente}
                fechaProgramada={formData.fecha_programada || null}
                onEnviarInmediatamenteChange={(value) =>
                  actualizarCampo('enviar_inmediatamente', value)
                }
                onFechaProgramadaChange={(value) => actualizarCampo('fecha_programada', value)}
                errores={errores}
              />
            </div>

            {/* Columna derecha: Vista Previa */}
            <div className="space-y-6">
              <div className="sticky top-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">📱 Vista Previa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <NotificacionPreview
                      titulo={formData.titulo}
                      cuerpo={formData.cuerpo}
                      tipo={formData.tipo_notificacion}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <CampanaFormAcciones
            esEdicion={esEdicion}
            guardando={guardando}
            campanaId={campanaId}
            onCancelar={() => router.push('/dashboard/campanas')}
            onVerPreview={irAPreview}
          />
        </form>
      </div>
    </div>
  );
}
