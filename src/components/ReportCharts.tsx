/**
 * Componente de Gráficas Interactivas para Reportes
 * 
 * Características:
 * - 📊 Múltiples tipos de gráficas (barras, líneas, tortas, áreas)
 * - 🎯 KPIs y métricas destacadas
 * - 🔄 Interactividad con tooltips y zoom
 * - 📥 Exportación a imagen
 * - 🎨 Diseño profesional y responsive
 */

"use client";

import React, { useState, useRef } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';
import { Download, TrendingUp, TrendingDown, DollarSign, Package, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ============================================================================
// TIPOS
// ============================================================================

export interface DatosReporte {
  // Métricas principales
  total_ventas?: number;
  total_transacciones?: number;
  ticket_promedio?: number;
  total_productos?: number;
  total_clientes?: number;
  
  // Datos para gráficas
  ventas_por_mes?: Array<{ mes: string; ventas: number; transacciones: number }>;
  ventas_por_departamento?: Array<{ departamento: string; ventas: number; porcentaje: number }>;
  productos_mas_vendidos?: Array<{ nombre: string; cantidad: number; ventas: number }>;
  tipos_cliente?: Array<{ tipo: string; cantidad: number }>;
  tendencia_mensual?: Array<{ fecha: string; ventas: number; objetivo: number }>;
  
  // Metadatos
  periodo?: string;
  moneda?: string;
  filtros_aplicados?: any;
}

interface ReportChartsProps {
  datos: DatosReporte;
  tipo: 'ventas' | 'productos' | 'clientes';
  titulo?: string;
}

// ============================================================================
// COLORES GLASSMÓRFICOS MODERNOS
// ============================================================================

const COLORS = {
  // Gradientes vibrantes para gráficas
  primary: [
    '#00c6ff', // Cyan brillante
    '#0072ff', // Azul eléctrico
    '#ff7e5f', // Coral
    '#feb47b', // Naranja suave
    '#4facfe', // Azul cielo
    '#00f2fe', // Cyan neón
    '#fdbb2d', // Amarillo dorado
    '#b21f1f'  // Rojo profundo
  ],
  // Gradientes para fondos
  gradients: {
    purple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    sunset: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
    ocean: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
    fire: 'linear-gradient(135deg, #fdbb2d 0%, #b21f1f 100%)',
    ice: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    night: 'linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)'
  }
};

// ============================================================================
// COMPONENTE
// ============================================================================

export default function ReportCharts({ datos, tipo, titulo }: ReportChartsProps) {
  const [graficoSeleccionado, setGraficoSeleccionado] = useState<'barras' | 'lineas' | 'torta' | 'area'>('barras');
  const [exportando, setExportando] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // FUNCIONES
  // ============================================================================

  const exportarGrafica = async () => {
    if (!chartRef.current) {
      console.error('❌ No hay referencia al chart');
      alert('No se pudo encontrar la gráfica para exportar');
      return;
    }

    setExportando(true);
    console.log('📸 Iniciando exportación de gráfica...');
    
    try {
      // Buscar el elemento SVG dentro del contenedor
      const svgElement = chartRef.current.querySelector('svg');
      
      if (!svgElement) {
        throw new Error('No se encontró el elemento SVG de la gráfica');
      }

      console.log('🎨 SVG encontrado:', svgElement);

      // Obtener las dimensiones del SVG
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      // Crear una imagen desde el SVG
      const img = new Image();
      img.onload = () => {
        // Crear canvas con las dimensiones correctas
        const canvas = document.createElement('canvas');
        const rect = svgElement.getBoundingClientRect();
        canvas.width = rect.width * 2; // x2 para mayor calidad
        canvas.height = rect.height * 2;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('No se pudo obtener el contexto 2D del canvas');
        }

        // Fondo del gradiente
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#1a2a6c');
        gradient.addColorStop(0.5, '#b21f1f');
        gradient.addColorStop(1, '#fdbb2d');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Dibujar el SVG en el canvas con escala x2
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0);
        
        // Convertir canvas a blob y descargar
        canvas.toBlob((blob) => {
          if (!blob) {
            throw new Error('No se pudo generar el blob de la imagen');
          }
          
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          const timestamp = new Date().getTime();
          link.download = `grafica_${tipo}_${graficoSeleccionado}_${timestamp}.png`;
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Limpiar URLs
          URL.revokeObjectURL(url);
          URL.revokeObjectURL(svgUrl);
          
          console.log('✅ Gráfica exportada exitosamente');
          setExportando(false);
        }, 'image/png');
      };

      img.onerror = () => {
        throw new Error('Error al cargar la imagen SVG');
      };

      img.src = svgUrl;
      
    } catch (error) {
      console.error('❌ Error exportando gráfica:', error);
      alert(`Error al exportar la gráfica: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setExportando(false);
    }
  };

  const calcularCrecimiento = (actual: number, anterior: number): number => {
    if (!anterior) return 0;
    return ((actual - anterior) / anterior) * 100;
  };

  // ============================================================================
  // RENDER KPIs GLASSMÓRFICOS
  // ============================================================================

  const renderKPIs = () => {
    const kpis = [
      {
        titulo: 'Total Ventas',
        valor: datos.total_ventas || 0,
        formato: 'moneda',
        icono: DollarSign,
        gradient: COLORS.gradients.ocean,
        miniChart: 'dots'
      },
      {
        titulo: 'Transacciones',
        valor: datos.total_transacciones || 0,
        formato: 'numero',
        icono: Package,
        gradient: COLORS.gradients.purple,
        miniChart: 'line'
      },
      {
        titulo: 'Ticket Promedio',
        valor: datos.ticket_promedio || 0,
        formato: 'moneda',
        icono: TrendingUp,
        gradient: COLORS.gradients.sunset,
        miniChart: 'pulse'
      },
      {
        titulo: tipo === 'clientes' ? 'Total Clientes' : 'Total Productos',
        valor: datos.total_clientes || datos.total_productos || 0,
        formato: 'numero',
        icono: Users,
        gradient: COLORS.gradients.ice,
        miniChart: 'bars'
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icono;
          const valorFormateado = kpi.formato === 'moneda' 
            ? `${datos.moneda || 'USD'} ${kpi.valor.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : kpi.valor.toLocaleString('es-BO');

          return (
            <div 
              key={index} 
              className="group relative overflow-hidden rounded-3xl transition-all duration-300 hover:scale-105"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15)'
              }}
            >
              {/* Gradiente de fondo animado */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                style={{ background: kpi.gradient }}
              />
              
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-white/70">{kpi.titulo}</p>
                  <div 
                    className="p-3 rounded-2xl"
                    style={{
                      background: kpi.gradient,
                      boxShadow: '0 4px 15px 0 rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                <h3 
                  className="text-3xl font-bold text-white mb-4"
                  style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.3)' }}
                >
                  {valorFormateado}
                </h3>
                
                {/* Mini gráfico decorativo */}
                <div className="flex gap-1 items-end h-8">
                  {kpi.miniChart === 'dots' && (
                    <>
                      <div className="w-3 h-3 rounded-full" style={{ background: '#00c6ff', boxShadow: '0 0 10px #00c6ff' }} />
                      <div className="w-3 h-3 rounded-full" style={{ background: '#0072ff', boxShadow: '0 0 10px #0072ff' }} />
                      <div className="w-3 h-3 rounded-full" style={{ background: '#fdbb2d', boxShadow: '0 0 10px #fdbb2d' }} />
                    </>
                  )}
                  {kpi.miniChart === 'line' && (
                    <div className="w-full h-1 rounded-full" style={{ background: kpi.gradient }} />
                  )}
                  {kpi.miniChart === 'pulse' && (
                    <>
                      <div className="w-1 bg-white/30 rounded-full h-2" />
                      <div className="w-1 bg-white/50 rounded-full h-4" />
                      <div className="w-1 bg-white/70 rounded-full h-6" />
                      <div className="w-1 bg-white rounded-full h-8" style={{ boxShadow: '0 0 10px rgba(255,255,255,0.5)' }} />
                      <div className="w-1 bg-white/70 rounded-full h-5" />
                      <div className="w-1 bg-white/50 rounded-full h-3" />
                    </>
                  )}
                  {kpi.miniChart === 'bars' && (
                    <>
                      <div className="w-2 bg-white/40 rounded-t h-4" />
                      <div className="w-2 bg-white/60 rounded-t h-6" />
                      <div className="w-2 bg-white/80 rounded-t h-5" />
                      <div className="w-2 bg-white rounded-t h-8" style={{ boxShadow: '0 0 10px rgba(255,255,255,0.3)' }} />
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ============================================================================
  // RENDER GRÁFICA DE BARRAS GLASSMÓRFICA
  // ============================================================================

  const renderGraficaBarras = () => {
    const data = datos.ventas_por_departamento || datos.productos_mas_vendidos || [];
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <defs>
            {/* Gradientes para las barras */}
            <linearGradient id="barGradient1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00c6ff" stopOpacity={0.9}/>
              <stop offset="100%" stopColor="#0072ff" stopOpacity={0.6}/>
            </linearGradient>
            <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff7e5f" stopOpacity={0.9}/>
              <stop offset="100%" stopColor="#feb47b" stopOpacity={0.6}/>
            </linearGradient>
            <linearGradient id="barGradient3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4facfe" stopOpacity={0.9}/>
              <stop offset="100%" stopColor="#00f2fe" stopOpacity={0.6}/>
            </linearGradient>
            <linearGradient id="barGradient4" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fdbb2d" stopOpacity={0.9}/>
              <stop offset="100%" stopColor="#b21f1f" stopOpacity={0.6}/>
            </linearGradient>
            <linearGradient id="barGradient5" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#667eea" stopOpacity={0.9}/>
              <stop offset="100%" stopColor="#764ba2" stopOpacity={0.6}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey={datos.ventas_por_departamento ? "departamento" : "nombre"} 
            angle={-45}
            textAnchor="end"
            height={100}
            stroke="rgba(255,255,255,0.7)"
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke="rgba(255,255,255,0.7)" style={{ fontSize: '12px' }} />
          <Tooltip 
            formatter={(value: number) => `${datos.moneda || 'USD'} ${value.toLocaleString('es-BO')}`}
            contentStyle={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.8)', 
              border: '1px solid rgba(255, 255, 255, 0.2)', 
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              color: '#fff'
            }}
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
          />
          <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.9)' }} />
          <Bar 
            dataKey="ventas" 
            radius={[12, 12, 0, 0]}
            animationDuration={1000}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`url(#barGradient${(index % 5) + 1})`}
                style={{
                  filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.3))'
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // ============================================================================
  // RENDER GRÁFICA DE LÍNEAS GLASSMÓRFICA
  // ============================================================================

  const renderGraficaLineas = () => {
    const data = datos.ventas_por_mes || datos.tendencia_mensual || [];
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00c6ff" />
              <stop offset="50%" stopColor="#0072ff" />
              <stop offset="100%" stopColor="#00f2fe" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="mes" stroke="rgba(255,255,255,0.7)" style={{ fontSize: '12px' }} />
          <YAxis stroke="rgba(255,255,255,0.7)" style={{ fontSize: '12px' }} />
          <Tooltip 
            formatter={(value: number) => `${datos.moneda || 'USD'} ${value.toLocaleString('es-BO')}`}
            contentStyle={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.8)', 
              border: '1px solid rgba(255, 255, 255, 0.2)', 
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              color: '#fff'
            }}
          />
          <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.9)' }} />
          <Line 
            type="monotone" 
            dataKey="ventas" 
            stroke="url(#lineGradient)"
            strokeWidth={4}
            dot={{ 
              fill: '#00c6ff', 
              r: 6, 
              strokeWidth: 2, 
              stroke: '#fff',
              filter: 'url(#glow)'
            }}
            activeDot={{ 
              r: 8, 
              fill: '#00f2fe',
              stroke: '#fff',
              strokeWidth: 2,
              filter: 'drop-shadow(0 0 10px #00f2fe)'
            }}
            animationDuration={1500}
          />
          {datos.tendencia_mensual && (
            <Line 
              type="monotone" 
              dataKey="objetivo" 
              stroke="rgba(253, 187, 45, 0.6)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // ============================================================================
  // RENDER GRÁFICA DE TORTA GLASSMÓRFICA
  // ============================================================================

  const renderGraficaTorta = () => {
    const data = datos.ventas_por_departamento || datos.tipos_cliente || [];
    
    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      return (
        <text 
          x={x} 
          y={y} 
          fill="white" 
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central"
          fontWeight="bold"
          fontSize="14px"
          style={{ 
            textShadow: '0 0 10px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.5)',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))'
          }}
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      );
    };

    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <defs>
            <filter id="pieGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={150}
            fill="#8884d8"
            dataKey="ventas"
            animationDuration={1500}
            animationBegin={0}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS.primary[index % COLORS.primary.length]}
                style={{
                  filter: 'url(#pieGlow)',
                  opacity: 0.9
                }}
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `${datos.moneda || 'USD'} ${value.toLocaleString('es-BO')}`}
            contentStyle={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.8)', 
              border: '1px solid rgba(255, 255, 255, 0.2)', 
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              color: '#fff'
            }}
          />
          <Legend 
            wrapperStyle={{ color: 'rgba(255,255,255,0.9)' }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // ============================================================================
  // RENDER GRÁFICA DE ÁREA GLASSMÓRFICA
  // ============================================================================

  const renderGraficaArea = () => {
    const data = datos.ventas_por_mes || [];
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00c6ff" stopOpacity={0.9}/>
              <stop offset="50%" stopColor="#0072ff" stopOpacity={0.5}/>
              <stop offset="95%" stopColor="#0072ff" stopOpacity={0.1}/>
            </linearGradient>
            <filter id="areaGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="mes" stroke="rgba(255,255,255,0.7)" style={{ fontSize: '12px' }} />
          <YAxis stroke="rgba(255,255,255,0.7)" style={{ fontSize: '12px' }} />
          <Tooltip 
            formatter={(value: number) => `${datos.moneda || 'USD'} ${value.toLocaleString('es-BO')}`}
            contentStyle={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.8)', 
              border: '1px solid rgba(255, 255, 255, 0.2)', 
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              color: '#fff'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="ventas" 
            stroke="#00c6ff"
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorVentas)"
            animationDuration={1500}
            dot={{ 
              fill: '#00f2fe', 
              r: 5,
              strokeWidth: 2,
              stroke: '#fff'
            }}
            activeDot={{
              r: 7,
              fill: '#00f2fe',
              stroke: '#fff',
              strokeWidth: 2,
              filter: 'drop-shadow(0 0 10px #00f2fe)'
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================

  return (
    <div 
      className="space-y-8 p-8 rounded-3xl"
      style={{
        background: 'linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)',
        minHeight: '100vh'
      }}
    >
      {/* Encabezado Glassmórfico */}
      <div 
        className="flex items-center justify-between p-6 rounded-3xl"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
        }}
      >
        <div>
          <h2 
            className="text-3xl font-bold text-white"
            style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.5)' }}
          >
            {titulo || `Análisis de ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`}
          </h2>
          {datos.periodo && (
            <p className="text-white/70 mt-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Período: {datos.periodo}
            </p>
          )}
        </div>
        <button 
          onClick={exportarGrafica}
          disabled={exportando}
          className={`px-6 py-3 rounded-2xl font-semibold text-white transition-all duration-300 flex items-center gap-2 ${
            exportando ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
          }`}
          style={{
            background: exportando 
              ? 'linear-gradient(135deg, #666 0%, #999 100%)'
              : 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
            boxShadow: exportando 
              ? 'none'
              : '0 4px 15px 0 rgba(0, 198, 255, 0.4), 0 0 20px rgba(0, 198, 255, 0.2)'
          }}
        >
          <Download className={`w-5 h-5 ${exportando ? 'animate-bounce' : ''}`} />
          {exportando ? 'Exportando...' : 'Exportar Gráfica'}
        </button>
      </div>

      {/* KPIs */}
      {renderKPIs()}

      {/* Selector de tipo de gráfica Glassmórfico */}
      <div 
        className="p-6 rounded-3xl"
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Visualización de Datos</h3>
          <div className="flex gap-3">
            {[
              { id: 'barras', emoji: '📊', label: 'Barras' },
              { id: 'lineas', emoji: '📈', label: 'Líneas' },
              { id: 'torta', emoji: '🥧', label: 'Torta' },
              { id: 'area', emoji: '📉', label: 'Área' }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setGraficoSeleccionado(btn.id as any)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                  graficoSeleccionado === btn.id ? 'scale-105' : 'hover:scale-105'
                }`}
                style={{
                  background: graficoSeleccionado === btn.id
                    ? 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)'
                    : 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: graficoSeleccionado === btn.id
                    ? '1px solid rgba(0, 198, 255, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  boxShadow: graficoSeleccionado === btn.id
                    ? '0 0 20px rgba(0, 198, 255, 0.4)'
                    : 'none'
                }}
              >
                {btn.emoji} {btn.label}
              </button>
            ))}
          </div>
        </div>
        
        <div 
          ref={chartRef}
          className="p-6 rounded-2xl"
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {graficoSeleccionado === 'barras' && renderGraficaBarras()}
          {graficoSeleccionado === 'lineas' && renderGraficaLineas()}
          {graficoSeleccionado === 'torta' && renderGraficaTorta()}
          {graficoSeleccionado === 'area' && renderGraficaArea()}
        </div>
      </div>

      {/* Filtros aplicados Glassmórficos */}
      {datos.filtros_aplicados && (
        <div 
          className="p-6 rounded-3xl"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
          }}
        >
          <h3 className="text-lg font-bold text-white mb-4">Filtros Aplicados</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(datos.filtros_aplicados).map(([key, value]) => {
              if (!value) return null;
              return (
                <span
                  key={key}
                  className="px-4 py-2 rounded-xl text-white font-medium"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {key}: {String(value)}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
