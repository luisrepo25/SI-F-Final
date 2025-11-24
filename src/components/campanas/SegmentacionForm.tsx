/**
 * Formulario de segmentación avanzada
 * Permite filtrar destinatarios por rol, ubicación, viajes, etc.
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface SegmentacionFormProps {
  filtros: Record<string, any>;
  onChange: (filtros: Record<string, any>) => void;
}

interface FiltroConfig {
  key: string;
  label: string;
  type: 'select' | 'number' | 'text';
  options?: { value: string; label: string }[];
  min?: number;
  placeholder?: string;
}

const FILTROS_DISPONIBLES: FiltroConfig[] = [
  {
    key: 'rol__nombre',
    label: 'Rol de usuario',
    type: 'select',
    options: [
      { value: 'Cliente', label: 'Cliente' },
      { value: 'Proveedor', label: 'Proveedor' },
      { value: 'Administrador', label: 'Administrador' },
    ],
  },
  {
    key: 'pais',
    label: 'País',
    type: 'select',
    options: [
      { value: 'Bolivia', label: 'Bolivia' },
      { value: 'Perú', label: 'Perú' },
      { value: 'Argentina', label: 'Argentina' },
      { value: 'Chile', label: 'Chile' },
      { value: 'Brasil', label: 'Brasil' },
    ],
  },
  {
    key: 'genero',
    label: 'Género',
    type: 'select',
    options: [
      { value: 'M', label: 'Masculino' },
      { value: 'F', label: 'Femenino' },
    ],
  },
  {
    key: 'num_viajes__gte',
    label: 'Número de viajes mayor o igual a',
    type: 'number',
    min: 0,
    placeholder: 'Ej: 3',
  },
  {
    key: 'num_viajes__lte',
    label: 'Número de viajes menor o igual a',
    type: 'number',
    min: 0,
    placeholder: 'Ej: 10',
  },
];

export default function SegmentacionForm({ filtros, onChange }: SegmentacionFormProps) {
  const [filtroSeleccionado, setFiltroSeleccionado] = useState<string>('');

  const filtrosActivos = Object.entries(filtros);
  const filtrosDisponiblesParaAgregar = FILTROS_DISPONIBLES.filter(
    (f) => !(f.key in filtros)
  );

  const agregarFiltro = () => {
    if (!filtroSeleccionado) return;
    
    const filtro = FILTROS_DISPONIBLES.find((f) => f.key === filtroSeleccionado);
    if (!filtro) return;

    onChange({
      ...filtros,
      [filtroSeleccionado]: filtro.type === 'number' ? 0 : '',
    });
    setFiltroSeleccionado('');
  };

  const removerFiltro = (key: string) => {
    const nuevosFiltros = { ...filtros };
    delete nuevosFiltros[key];
    onChange(nuevosFiltros);
  };

  const actualizarFiltro = (key: string, value: any) => {
    onChange({
      ...filtros,
      [key]: value,
    });
  };

  const obtenerConfigFiltro = (key: string): FiltroConfig | undefined => {
    return FILTROS_DISPONIBLES.find((f) => f.key === key);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">🎯 Filtros de Segmentación</CardTitle>
        <CardDescription>
          Define criterios para segmentar la audiencia
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros activos */}
        {filtrosActivos.length > 0 ? (
          <div className="space-y-3">
            {filtrosActivos.map(([key, value]) => {
              const config = obtenerConfigFiltro(key);
              if (!config) return null;

              return (
                <div key={key} className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label className="text-sm">{config.label}</Label>
                    {config.type === 'select' ? (
                      <Select value={value} onValueChange={(v) => actualizarFiltro(key, v)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {config.options?.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : config.type === 'number' ? (
                      <Input
                        type="number"
                        value={value}
                        onChange={(e) => actualizarFiltro(key, parseInt(e.target.value) || 0)}
                        min={config.min}
                        placeholder={config.placeholder}
                        className="mt-1"
                      />
                    ) : (
                      <Input
                        type="text"
                        value={value}
                        onChange={(e) => actualizarFiltro(key, e.target.value)}
                        placeholder={config.placeholder}
                        className="mt-1"
                      />
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removerFiltro(key)}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
            No hay filtros configurados. Agrega uno para empezar.
          </div>
        )}

        {/* Agregar nuevo filtro */}
        {filtrosDisponiblesParaAgregar.length > 0 && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <Select value={filtroSeleccionado} onValueChange={setFiltroSeleccionado}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Seleccionar filtro..." />
                </SelectTrigger>
                <SelectContent>
                  {filtrosDisponiblesParaAgregar.map((filtro) => (
                    <SelectItem key={filtro.key} value={filtro.key}>
                      {filtro.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={agregarFiltro}
                disabled={!filtroSeleccionado}
                size="sm"
              >
                Agregar
              </Button>
            </div>
          </div>
        )}

        {/* Información */}
        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded">
          💡 <strong>Tip:</strong> Puedes combinar múltiples filtros. Los usuarios que cumplan
          <strong> todos</strong> los criterios recibirán la notificación.
        </div>
      </CardContent>
    </Card>
  );
}
