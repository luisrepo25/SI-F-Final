"use client";

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  ArrowRight,
  Target,
  Activity,
  Zap,
  AlertCircle,
  Download,
  FileText,
  FileSpreadsheet,
  Settings,
  Eye,
  CheckCircle,
  Info,
  Filter,
  ChevronDown,
  BarChart3
} from 'lucide-react';
import { exportarProyecciones } from '@/lib/exportar-proyecciones';
import { useToast } from '@/hooks/use-toast';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

// ============================================================================
// TIPOS
// ============================================================================

interface DatosComparacion {
  periodo_actual: {
    nombre: string;
    fecha_inicio: string;
    fecha_fin: string;
    total_ventas: number;
    total_transacciones: number;
    ticket_promedio: number;
    total_clientes: number;
  };
  periodo_anterior: {
    nombre: string;
    fecha_inicio: string;
    fecha_fin: string;
    total_ventas: number;
    total_transacciones: number;
    ticket_promedio: number;
    total_clientes: number;
  };
  variaciones: {
    ventas_porcentaje: number;
    transacciones_porcentaje: number;
    ticket_porcentaje: number;
    clientes_porcentaje: number;
  };
  comparacion_mensual: Array<{
    mes: string;
    periodo_actual: number;
    periodo_anterior: number;
  }>;
  proyeccion_futura: Array<{
    mes: string;
    proyectado: number;
    optimista: number;
    pesimista: number;
  }>;
  tendencia: 'crecimiento' | 'decrecimiento' | 'estable';
  tasa_crecimiento_mensual: number;
}

interface ComparacionPeriodosProps {
  datosComparacion: DatosComparacion | null;
  moneda?: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function ComparacionPeriodos({ 
  datosComparacion, 
  moneda = 'BOB' 
}: ComparacionPeriodosProps) {
  
  const { toast } = useToast();
  const [vistaActual, setVistaActual] = useState<'comparacion' | 'proyeccion'>('comparacion');
  const [exportando, setExportando] = useState(false);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [mesesProyeccion, setMesesProyeccion] = useState<3 | 6 | 12>(3);
  const [escenarioSeleccionado, setEscenarioSeleccionado] = useState<'todos' | 'optimista' | 'base' | 'pesimista'>('todos');
  const [vistaPrevia, setVistaPrevia] = useState(false);

  if (!datosComparacion) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-white/60">
        <AlertCircle className="w-16 h-16 mb-4" />
        <p className="text-lg">No hay datos de comparación disponibles</p>
        <p className="text-sm mt-2">Genera un reporte para ver la comparación de períodos</p>
      </div>
    );
  }

  const { periodo_actual, periodo_anterior, variaciones, comparacion_mensual, proyeccion_futura, tendencia, tasa_crecimiento_mensual } = datosComparacion;

  // ============================================================================
  // FUNCIONES DE EXPORTACIÓN
  // ============================================================================

  const handleExportar = async (formato: 'pdf' | 'excel') => {
    setExportando(true);
    try {
      // Limitar el número de meses de proyección
      const proyeccionesLimitadas = datosComparacion.proyeccion_futura.slice(0, mesesProyeccion);

      // Crear objeto de datos modificado con las proyecciones filtradas
      const datosParaExportar = {
        ...datosComparacion,
        proyeccion_futura: proyeccionesLimitadas,
        configuracion: {
          mesesProyeccion,
          escenarioSeleccionado,
          fechaGeneracion: new Date().toLocaleDateString('es-ES')
        }
      };

      await exportarProyecciones(datosParaExportar, formato, moneda, {
        incluirComparacion: true,
        incluirProyeccion: true
      });
      
      toast({
        title: '✅ Exportación exitosa',
        description: `Reporte con proyección de ${mesesProyeccion} meses (${
          escenarioSeleccionado === 'todos' ? 'todos los escenarios' : `escenario ${escenarioSeleccionado}`
        }) exportado a ${formato.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Error al exportar:', error);
      toast({
        title: '❌ Error al exportar',
        description: `No se pudo exportar a ${formato.toUpperCase()}`,
        variant: 'destructive'
      });
    } finally {
      setExportando(false);
    }
  };

  // ============================================================================
  // FUNCIONES AUXILIARES
  // ============================================================================

  const formatearMoneda = (valor: number): string => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: moneda,
      minimumFractionDigits: 2
    }).format(valor);
  };

  const formatearNumero = (valor: number): string => {
    return new Intl.NumberFormat('es-BO').format(valor);
  };

  const obtenerColorVariacion = (porcentaje: number): string => {
    if (porcentaje > 0) return 'text-emerald-400';
    if (porcentaje < 0) return 'text-red-400';
    return 'text-yellow-400';
  };

  const obtenerIconoVariacion = (porcentaje: number) => {
    if (porcentaje > 0) return <TrendingUp className="w-5 h-5" />;
    if (porcentaje < 0) return <TrendingDown className="w-5 h-5" />;
    return <Activity className="w-5 h-5" />;
  };

  const obtenerColorTendencia = (): string => {
    switch (tendencia) {
      case 'crecimiento': return 'from-emerald-500/20 to-green-500/20';
      case 'decrecimiento': return 'from-red-500/20 to-orange-500/20';
      default: return 'from-yellow-500/20 to-amber-500/20';
    }
  };

  const obtenerMensajeTendencia = (): string => {
    if (tendencia === 'crecimiento') {
      return `Excelente! El negocio está creciendo a una tasa de ${tasa_crecimiento_mensual.toFixed(1)}% mensual`;
    } else if (tendencia === 'decrecimiento') {
      return `Atención: Se detecta una tendencia de decrecimiento de ${Math.abs(tasa_crecimiento_mensual).toFixed(1)}% mensual`;
    } else {
      return 'El negocio se mantiene estable con pequeñas fluctuaciones';
    }
  };

  // ============================================================================
  // RENDERIZADO DE TARJETA DE MÉTRICA
  // ============================================================================

  const MetricaComparativa = ({ 
    titulo, 
    actual, 
    anterior, 
    variacion, 
    formatear = true 
  }: { 
    titulo: string; 
    actual: number; 
    anterior: number; 
    variacion: number;
    formatear?: boolean;
  }) => (
    <div className="relative group">
      {/* Fondo glassmorphic */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl backdrop-blur-xl" />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative p-6 rounded-2xl border border-white/20">
        {/* Título */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white/70">{titulo}</h3>
          <div className={`flex items-center gap-1 ${obtenerColorVariacion(variacion)}`}>
            {obtenerIconoVariacion(variacion)}
            <span className="text-sm font-bold">
              {variacion > 0 ? '+' : ''}{variacion.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Valores */}
        <div className="space-y-3">
          {/* Período actual */}
          <div>
            <div className="text-xs text-white/50 mb-1">Actual</div>
            <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {formatear ? formatearMoneda(actual) : formatearNumero(actual)}
            </div>
          </div>

          {/* Comparación visual */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  variacion > 0 
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
                    : variacion < 0
                    ? 'bg-gradient-to-r from-red-500 to-orange-500'
                    : 'bg-gradient-to-r from-yellow-500 to-amber-500'
                }`}
                style={{ width: `${Math.min(100, Math.abs(variacion) * 2)}%` }}
              />
            </div>
          </div>

          {/* Período anterior */}
          <div>
            <div className="text-xs text-white/50 mb-1">Anterior</div>
            <div className="text-lg font-semibold text-white/70">
              {formatear ? formatearMoneda(anterior) : formatearNumero(anterior)}
            </div>
          </div>
        </div>

        {/* Glow effect */}
        <div className={`absolute -inset-0.5 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 ${
          variacion > 0 
            ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
            : variacion < 0
            ? 'bg-gradient-to-r from-red-500 to-orange-500'
            : 'bg-gradient-to-r from-yellow-500 to-amber-500'
        }`} style={{ zIndex: -1 }} />
      </div>
    </div>
  );

  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* ============================================================================ */}
      {/* PANEL DE CONFIGURACIÓN AVANZADA */}
      {/* ============================================================================ */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10 rounded-2xl backdrop-blur-xl" />
        <div className="relative p-6 rounded-2xl border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                <Settings className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Configuración del Reporte</h3>
                <p className="text-sm text-white/60">Personaliza tu análisis de proyección</p>
              </div>
            </div>
            <button
              onClick={() => setMostrarOpciones(!mostrarOpciones)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-300 flex items-center gap-2"
            >
              {mostrarOpciones ? 'Ocultar' : 'Mostrar'} Opciones
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mostrarOpciones ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Opciones expandibles */}
          <div className={`grid gap-6 transition-all duration-500 overflow-hidden ${
            mostrarOpciones ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}>
            <div className="overflow-hidden">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Selector de meses de proyección */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                    <Calendar className="w-4 h-4" />
                    Período de Proyección
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[3, 6, 12].map((meses) => (
                      <button
                        key={meses}
                        onClick={() => setMesesProyeccion(meses as 3 | 6 | 12)}
                        className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                          mesesProyeccion === meses
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/30 scale-105'
                            : 'bg-white/10 text-white/60 hover:bg-white/20 hover:scale-102'
                        }`}
                      >
                        <div className="text-2xl font-bold">{meses}</div>
                        <div className="text-xs">meses</div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-white/50">
                    Define el horizonte temporal para las proyecciones
                  </p>
                </div>

                {/* Selector de escenarios */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                    <BarChart3 className="w-4 h-4" />
                    Escenarios a Mostrar
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'todos', label: 'Todos', icon: '📊', color: 'from-cyan-500 to-blue-500' },
                      { value: 'optimista', label: 'Optimista', icon: '🚀', color: 'from-green-500 to-emerald-500' },
                      { value: 'base', label: 'Base', icon: '📈', color: 'from-blue-500 to-purple-500' },
                      { value: 'pesimista', label: 'Pesimista', icon: '⚠️', color: 'from-orange-500 to-red-500' }
                    ].map((escenario) => (
                      <button
                        key={escenario.value}
                        onClick={() => setEscenarioSeleccionado(escenario.value as any)}
                        className={`px-3 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                          escenarioSeleccionado === escenario.value
                            ? `bg-gradient-to-r ${escenario.color} text-white shadow-lg scale-105`
                            : 'bg-white/10 text-white/60 hover:bg-white/20 hover:scale-102'
                        }`}
                      >
                        <span className="text-lg">{escenario.icon}</span>
                        <span className="text-sm">{escenario.label}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-white/50">
                    Selecciona qué escenarios incluir en el reporte
                  </p>
                </div>
              </div>

              {/* Información adicional */}
              <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm text-white/70">
                    <p>
                      <span className="font-semibold text-white">Proyección Base:</span> Calculada con la tasa de crecimiento actual
                    </p>
                    <p>
                      <span className="font-semibold text-white">Escenario Optimista:</span> +20% sobre la proyección base
                    </p>
                    <p>
                      <span className="font-semibold text-white">Escenario Pesimista:</span> -20% sobre la proyección base
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header con selector de vista y botones de exportación */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Análisis Comparativo de Períodos
            </h2>
            {/* Badges de configuración actual */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                {mesesProyeccion} meses
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${
                escenarioSeleccionado === 'todos' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' :
                escenarioSeleccionado === 'optimista' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                escenarioSeleccionado === 'base' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                'bg-orange-500/20 text-orange-300 border-orange-500/30'
              }`}>
                <Target className="w-3 h-3" />
                {escenarioSeleccionado === 'todos' ? 'Todos' :
                 escenarioSeleccionado === 'optimista' ? 'Optimista' :
                 escenarioSeleccionado === 'base' ? 'Base' : 'Pesimista'}
              </span>
            </div>
          </div>
          <p className="text-white/60 mt-1">
            {periodo_anterior.nombre} vs {periodo_actual.nombre}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* Vista previa */}
          <button
            onClick={() => setVistaPrevia(!vistaPrevia)}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
              vistaPrevia
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
            title="Vista previa del reporte"
          >
            <Eye className="w-4 h-4" />
            Vista Previa
          </button>

          {/* Separador */}
          <div className="w-px bg-white/20" />
          
          {/* Botones de exportación mejorados */}
          <div className="flex gap-2">
            <button
              onClick={() => handleExportar('pdf')}
              disabled={exportando}
              className="group relative px-5 py-2.5 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
              title="Descargar reporte en PDF"
            >
              <FileText className="w-4 h-4" />
              <span>{exportando ? 'Generando...' : 'Exportar PDF'}</span>
              {!exportando && (
                <Download className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}
            </button>
            
            <button
              onClick={() => handleExportar('excel')}
              disabled={exportando}
              className="group relative px-5 py-2.5 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
              title="Descargar reporte en Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{exportando ? 'Generando...' : 'Exportar Excel'}</span>
              {!exportando && (
                <Download className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}
            </button>
          </div>

          {/* Separador */}
          <div className="w-px bg-white/20" />

          {/* Botones de vista */}
          <button
            onClick={() => setVistaActual('comparacion')}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
              vistaActual === 'comparacion'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            <Activity className="w-4 h-4 inline mr-2" />
            Comparación
          </button>
          <button
            onClick={() => setVistaActual('proyeccion')}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
              vistaActual === 'proyeccion'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            <Target className="w-4 h-4 inline mr-2" />
            Proyección
          </button>
        </div>
      </div>

      {/* Banner de tendencia */}
      <div className={`relative overflow-hidden rounded-2xl`}>
        <div className={`absolute inset-0 bg-gradient-to-r ${obtenerColorTendencia()} backdrop-blur-xl`} />
        <div className="relative p-6 border border-white/20 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${
              tendencia === 'crecimiento' 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : tendencia === 'decrecimiento'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {tendencia === 'crecimiento' ? <TrendingUp className="w-6 h-6" /> :
               tendencia === 'decrecimiento' ? <TrendingDown className="w-6 h-6" /> :
               <Activity className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">
                Tendencia: {tendencia.charAt(0).toUpperCase() + tendencia.slice(1)}
              </h3>
              <p className="text-white/70">{obtenerMensajeTendencia()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* PANEL DE VISTA PREVIA DEL REPORTE */}
      {/* ============================================================================ */}
      {vistaPrevia && (
        <div className="relative animate-in slide-in-from-top duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-2xl backdrop-blur-xl" />
          <div className="relative p-6 rounded-2xl border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                  <Eye className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Vista Previa del Reporte</h3>
                  <p className="text-sm text-white/60">Resumen de lo que se incluirá en la exportación</p>
                </div>
              </div>
              <button
                onClick={() => setVistaPrevia(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all duration-300"
              >
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Información del reporte */}
              <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-white/80 font-medium">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Contenido Incluido
                </div>
                <ul className="space-y-2 text-sm text-white/60">
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">✓</span> Resumen ejecutivo
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">✓</span> Comparación de períodos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">✓</span> 4 métricas clave
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">✓</span> Proyección {mesesProyeccion} meses
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">✓</span> Gráficas visuales
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">✓</span> Histórico mensual
                  </li>
                </ul>
              </div>

              {/* Escenarios */}
              <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-white/80 font-medium">
                  <Target className="w-4 h-4 text-purple-400" />
                  Escenarios de Proyección
                </div>
                <ul className="space-y-2 text-sm text-white/60">
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className={escenarioSeleccionado === 'todos' || escenarioSeleccionado === 'optimista' ? 'text-green-400' : 'text-white/30'}>
                        {escenarioSeleccionado === 'todos' || escenarioSeleccionado === 'optimista' ? '✓' : '○'}
                      </span>
                      Optimista
                    </span>
                    <span className="text-green-400">+20%</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className={escenarioSeleccionado === 'todos' || escenarioSeleccionado === 'base' ? 'text-blue-400' : 'text-white/30'}>
                        {escenarioSeleccionado === 'todos' || escenarioSeleccionado === 'base' ? '✓' : '○'}
                      </span>
                      Base
                    </span>
                    <span className="text-blue-400">Actual</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className={escenarioSeleccionado === 'todos' || escenarioSeleccionado === 'pesimista' ? 'text-orange-400' : 'text-white/30'}>
                        {escenarioSeleccionado === 'todos' || escenarioSeleccionado === 'pesimista' ? '✓' : '○'}
                      </span>
                      Pesimista
                    </span>
                    <span className="text-orange-400">-20%</span>
                  </li>
                </ul>
              </div>

              {/* Métricas clave */}
              <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-white/80 font-medium">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  Datos del Período
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-white/50 mb-1">Período Actual</div>
                    <div className="font-semibold text-white">{periodo_actual.nombre}</div>
                    <div className="text-xs text-white/40">
                      {new Date(periodo_actual.fecha_inicio).toLocaleDateString('es-ES')} - {new Date(periodo_actual.fecha_fin).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div>
                    <div className="text-white/50 mb-1">Ventas Totales</div>
                    <div className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      {formatearMoneda(periodo_actual.total_ventas)}
                    </div>
                  </div>
                  <div>
                    <div className="text-white/50 mb-1">Tasa de Crecimiento</div>
                    <div className={`font-bold ${obtenerColorVariacion(tasa_crecimiento_mensual)}`}>
                      {tasa_crecimiento_mensual > 0 ? '+' : ''}{tasa_crecimiento_mensual.toFixed(2)}% mensual
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón de acción rápida */}
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setVistaPrevia(false);
                  handleExportar('pdf');
                }}
                disabled={exportando}
                className="px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Generar PDF Ahora
              </button>
              <button
                onClick={() => {
                  setVistaPrevia(false);
                  handleExportar('excel');
                }}
                disabled={exportando}
                className="px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FileSpreadsheet className="w-5 h-5" />
                Generar Excel Ahora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vista de Comparación */}
      {vistaActual === 'comparacion' && (
        <>
          {/* Grid de métricas comparativas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricaComparativa
              titulo="Ventas Totales"
              actual={periodo_actual.total_ventas}
              anterior={periodo_anterior.total_ventas}
              variacion={variaciones.ventas_porcentaje}
              formatear={true}
            />
            <MetricaComparativa
              titulo="Transacciones"
              actual={periodo_actual.total_transacciones}
              anterior={periodo_anterior.total_transacciones}
              variacion={variaciones.transacciones_porcentaje}
              formatear={false}
            />
            <MetricaComparativa
              titulo="Ticket Promedio"
              actual={periodo_actual.ticket_promedio}
              anterior={periodo_anterior.ticket_promedio}
              variacion={variaciones.ticket_porcentaje}
              formatear={true}
            />
            <MetricaComparativa
              titulo="Clientes"
              actual={periodo_actual.total_clientes}
              anterior={periodo_anterior.total_clientes}
              variacion={variaciones.clientes_porcentaje}
              formatear={false}
            />
          </div>

          {/* Gráfica comparativa mensual */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl backdrop-blur-xl" />
            <div className="relative p-6 rounded-2xl border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <BarChart className="w-5 h-5 text-cyan-400" />
                Comparación Mensual de Ventas
              </h3>
              
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={comparacion_mensual}>
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00f2fe" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#4facfe" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="colorAnterior" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a8edea" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#fed6e3" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="mes" 
                    stroke="rgba(255,255,255,0.5)"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.5)"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)'
                    }}
                    formatter={(value: number) => [formatearMoneda(value), '']}
                  />
                  <Legend 
                    wrapperStyle={{ color: 'white' }}
                    formatter={(value) => (
                      <span style={{ color: 'rgba(255,255,255,0.8)' }}>
                        {value === 'periodo_actual' ? 'Período Actual' : 'Período Anterior'}
                      </span>
                    )}
                  />
                  <Bar 
                    dataKey="periodo_anterior" 
                    fill="url(#colorAnterior)"
                    radius={[8, 8, 0, 0]}
                    name="periodo_anterior"
                  />
                  <Bar 
                    dataKey="periodo_actual" 
                    fill="url(#colorActual)"
                    radius={[8, 8, 0, 0]}
                    name="periodo_actual"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Vista de Proyección */}
      {vistaActual === 'proyeccion' && (
        <>
          {/* Información de proyección */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl backdrop-blur-xl" />
            <div className="relative p-6 rounded-2xl border border-white/20">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-purple-500/20">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">
                    Proyección de Crecimiento Futuro
                  </h3>
                  <p className="text-white/70 mb-4">
                    Basado en la tendencia actual, estas son las proyecciones para los próximos meses:
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 rounded-xl bg-white/5">
                      <div className="text-xs text-white/50 mb-1">Escenario Pesimista</div>
                      <div className="text-lg font-bold text-red-400">
                        {formatearMoneda(proyeccion_futura[proyeccion_futura.length - 1]?.pesimista || 0)}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5">
                      <div className="text-xs text-white/50 mb-1">Proyección Base</div>
                      <div className="text-lg font-bold text-cyan-400">
                        {formatearMoneda(proyeccion_futura[proyeccion_futura.length - 1]?.proyectado || 0)}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5">
                      <div className="text-xs text-white/50 mb-1">Escenario Optimista</div>
                      <div className="text-lg font-bold text-emerald-400">
                        {formatearMoneda(proyeccion_futura[proyeccion_futura.length - 1]?.optimista || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gráfica de proyección */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl backdrop-blur-xl" />
            <div className="relative p-6 rounded-2xl border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Proyección de Ventas (3 meses)
              </h3>
              
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={proyeccion_futura}>
                  <defs>
                    <linearGradient id="colorProyectado" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00f2fe" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#4facfe" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorOptimista" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorPesimista" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="mes" 
                    stroke="rgba(255,255,255,0.5)"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.5)"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)'
                    }}
                    formatter={(value: number) => [formatearMoneda(value), '']}
                  />
                  <Legend 
                    wrapperStyle={{ color: 'white' }}
                    formatter={(value) => {
                      const nombres: { [key: string]: string } = {
                        pesimista: 'Escenario Pesimista',
                        proyectado: 'Proyección Base',
                        optimista: 'Escenario Optimista'
                      };
                      return <span style={{ color: 'rgba(255,255,255,0.8)' }}>{nombres[value]}</span>;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pesimista" 
                    stroke="#ef4444" 
                    fill="url(#colorPesimista)"
                    strokeWidth={2}
                    name="pesimista"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="proyectado" 
                    stroke="#00f2fe" 
                    fill="url(#colorProyectado)"
                    strokeWidth={3}
                    name="proyectado"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="optimista" 
                    stroke="#10b981" 
                    fill="url(#colorOptimista)"
                    strokeWidth={2}
                    name="optimista"
                  />
                </AreaChart>
              </ResponsiveContainer>

              <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm text-white/60">
                  <strong className="text-white">Nota:</strong> Las proyecciones se basan en la tasa de crecimiento actual 
                  ({tasa_crecimiento_mensual > 0 ? '+' : ''}{tasa_crecimiento_mensual.toFixed(1)}% mensual). 
                  Los escenarios optimista y pesimista consideran variaciones de ±20% sobre la proyección base.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Exportar tipo para uso externo
export type { DatosComparacion };
