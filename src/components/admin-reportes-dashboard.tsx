"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Download, Filter, X, ChevronDown, ChevronUp, BarChart3, TrendingUp, Target, Activity, Zap } from 'lucide-react';
import { 
  generarReporteProductos, 
  generarReporteVentas, 
  generarReporteClientes,
  descargarArchivo,
  FiltrosReporte 
} from '@/api/reportes';
import { RespuestaIA, normalizarFiltros } from '@/api/reportes-ia';
import VoiceReportController from '@/components/VoiceReportController';
import ReportCharts, { DatosReporte } from '@/components/ReportCharts';
import ComparacionPeriodos, { DatosComparacion } from '@/components/ComparacionPeriodos';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const AdminReportesDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'estatico' | 'dinamico' | 'inteligente' | 'graficas' | 'comparacion'>('estatico');
  const [loading, setLoading] = useState(false);
  const [showFiltrosAvanzados, setShowFiltrosAvanzados] = useState(false);
  
  // Estado para datos de gráficas
  const [datosGraficas, setDatosGraficas] = useState<DatosReporte | null>(null);
  const [tipoReporteActual, setTipoReporteActual] = useState<'ventas' | 'productos' | 'clientes'>('productos');
  const [mostrarGraficas, setMostrarGraficas] = useState(false);
  
  // Estado para comparación de períodos
  const [datosComparacion, setDatosComparacion] = useState<DatosComparacion | null>(null);
  const [mostrarComparacion, setMostrarComparacion] = useState(false);
  
  // Estado para filtros
  const [filtros, setFiltros] = useState<FiltrosReporte>({
    formato: 'docx',  // DOCX es el nuevo por defecto (v2.2.0)
    moneda: 'USD',
    fecha_inicio: '',
    fecha_fin: ''
  });

  // Contador de filtros activos
  const contarFiltrosActivos = (): number => {
    let count = 0;
    if (filtros.departamento) count++;
    if (filtros.tipo_destino) count++;
    if (filtros.tipo_cliente) count++;
    if (filtros.solo_fines_semana) count++;
    if (filtros.solo_dias_semana) count++;
    if (filtros.mes) count++;
    if (filtros.trimestre) count++;
    if (filtros.solo_destacados) count++;
    if (filtros.solo_personalizados) count++;
    if (filtros.duracion_dias) count++;
    if (filtros.monto_minimo) count++;
    if (filtros.monto_maximo) count++;
    if (filtros.con_campana) count++;
    return count;
  };

  const limpiarFiltros = () => {
    // 🧹 LIMPIEZA COMPLETA - Resetear TODOS los filtros incluyendo fechas
    console.log('🧹 ANTES de limpiar - Filtros actuales:', filtros);
    
    setFiltros({
      formato: 'pdf',        // Resetear a PDF por defecto
      moneda: 'BOB',         // Resetear a BOB por defecto
      fecha_inicio: '',      // 🆕 Limpiar fecha de inicio
      fecha_fin: ''          // 🆕 Limpiar fecha de fin
    });
    
    console.log('✅ DESPUÉS de limpiar - Nuevos filtros:', {
      formato: 'pdf',
      moneda: 'BOB',
      fecha_inicio: '',
      fecha_fin: ''
    });
    console.log('🧹 Filtros limpiados completamente (incluyendo fechas)');
    
    toast({ 
      title: '✅ Filtros limpiados', 
      description: 'Se han eliminado todos los filtros y fechas' 
    });
  };

  // ============================================================================
  // NORMALIZAR FILTROS DE IA AL FORMATO DEL ESTADO
  // Según especificaciones del backend
  // ============================================================================
  
  const normalizarFiltrosIA = (filtrosIA: any): Partial<FiltrosReporte> => {
    const filtrosNormalizados: Partial<FiltrosReporte> = {};

    console.log('🔍 Normalizando filtros de IA:', filtrosIA);

    // Fechas
    if (filtrosIA.fecha_inicio) {
      filtrosNormalizados.fecha_inicio = filtrosIA.fecha_inicio;
    }
    if (filtrosIA.fecha_fin) {
      filtrosNormalizados.fecha_fin = filtrosIA.fecha_fin;
    }

    // Moneda (convertir a mayúsculas)
    if (filtrosIA.moneda) {
      filtrosNormalizados.moneda = filtrosIA.moneda.toUpperCase();
    }

    // Departamento
    if (filtrosIA.departamento) {
      filtrosNormalizados.departamento = filtrosIA.departamento;
    }

    // Tipo de cliente (convertir a minúsculas)
    if (filtrosIA.tipo_cliente) {
      filtrosNormalizados.tipo_cliente = filtrosIA.tipo_cliente.toLowerCase();
    }

    // Tipo de destino
    if (filtrosIA.tipo_destino) {
      filtrosNormalizados.tipo_destino = filtrosIA.tipo_destino;
    }

    // Estado (convertir a mayúsculas)
    if (filtrosIA.estado) {
      filtrosNormalizados.estado = filtrosIA.estado.toUpperCase();
    }

    // Montos (convertir a números)
    if (filtrosIA.monto_minimo) {
      filtrosNormalizados.monto_minimo = parseFloat(filtrosIA.monto_minimo);
    }
    if (filtrosIA.monto_maximo) {
      filtrosNormalizados.monto_maximo = parseFloat(filtrosIA.monto_maximo);
    }

    // Mes y año (convertir a enteros)
    if (filtrosIA.mes) {
      filtrosNormalizados.mes = parseInt(filtrosIA.mes);
    }
    if (filtrosIA.año || filtrosIA.anio) {
      filtrosNormalizados.año = parseInt(filtrosIA.año || filtrosIA.anio);
    }

    // Booleanos
    if (filtrosIA.solo_personalizados !== undefined) {
      filtrosNormalizados.solo_personalizados = Boolean(filtrosIA.solo_personalizados);
    }
    if (filtrosIA.solo_destacados !== undefined) {
      filtrosNormalizados.solo_destacados = Boolean(filtrosIA.solo_destacados);
    }
    if (filtrosIA.con_campana !== undefined) {
      filtrosNormalizados.con_campana = Boolean(filtrosIA.con_campana);
    }

    console.log('🔄 Mapeo de filtros IA:', {
      entrada: filtrosIA,
      salida: filtrosNormalizados
    });

    return filtrosNormalizados;
  };

  // ============================================================================
  // DEBUGGING: Monitorear cambios en filtros
  // ============================================================================
  
  useEffect(() => {
    console.log('🔄 Estado de filtros actualizado:', filtros);
  }, [filtros]);

  // ============================================================================
  // MANEJADOR DE COMANDOS DE IA - CON EJECUCIÓN AUTOMÁTICA
  // Basado en: FRONTEND_VOICE_AUTO_EXECUTE.md
  // ============================================================================
  
  const handleComandoIA = async (respuesta: RespuestaIA) => {
    console.log('🤖 Dashboard: Ejecutando comando de IA:', respuesta);
    console.log('📊 Confianza:', respuesta.confianza);
    console.log('📋 Filtros recibidos:', respuesta.filtros);
    
    try {
      // ✅ VALIDACIÓN DE CONFIANZA (REDUCIDA para ser más permisiva)
      // <0.3: Pedir clarificación
      // ≥0.3: Ejecutar automáticamente (era 0.5, ahora 0.3 para ser más rápido)
      if (respuesta.confianza !== undefined && respuesta.confianza < 0.3) {
        console.log('⚠️ Confianza muy baja (<0.3), pidiendo confirmación');
        toast({
          title: '❓ Necesito más claridad',
          description: 'No entendí bien tu comando. ¿Puedes ser más específico?',
          variant: 'default',
          duration: 4000
        });
        return;
      }
      
      console.log('✅ Confianza aceptable (≥0.3), ejecutando automáticamente');
      
      // 🚀 ACCIÓN: Generar reporte - EJECUCIÓN AUTOMÁTICA
      if (respuesta.accion === 'generar_reporte' && respuesta.tipo_reporte) {
        console.log('⚡ AUTO-EJECUTANDO reporte:', respuesta.tipo_reporte);
        console.log('📋 Filtros de IA:', respuesta.filtros);
        console.log('🎯 Formato:', respuesta.formato);
        
        // Normalizar tipo de reporte (backend unifica paquetes y servicios en "productos")
        let tipoNormalizado = respuesta.tipo_reporte.toLowerCase();
        if (tipoNormalizado === 'paquetes' || tipoNormalizado === 'servicios') {
          console.log('🔄 Normalizando tipo:', tipoNormalizado, '→ productos');
          tipoNormalizado = 'productos';
        }
        
        // Normalizar filtros extraídos por la IA usando la función específica
        const filtrosIA = normalizarFiltrosIA(respuesta.filtros || {});
        
        // Aplicar formato si la IA lo especificó
        if (respuesta.formato) {
          filtrosIA.formato = respuesta.formato;
        } else {
          filtrosIA.formato = 'pdf'; // PDF por defecto
        }
        
        console.log('✅ Filtros normalizados:', filtrosIA);
        
        // 🔄 Combinar filtros actuales con los nuevos de la IA
        const filtrosFinales: FiltrosReporte = { 
          ...filtros, 
          ...filtrosIA,
          moneda: filtrosIA.moneda || filtros.moneda || 'USD' // Asegurar moneda
        };
        console.log('🎯 Filtros finales combinados:', filtrosFinales);
        
        // Actualizar estado de filtros (para mostrar en UI)
        setFiltros(filtrosFinales);
        
        toast({
          title: '🤖 Comando procesado',
          description: `⚡ Generando reporte de ${tipoNormalizado} automáticamente...`,
          duration: 2000
        });
        
        // ⚡ GENERAR Y DESCARGAR AUTOMÁTICAMENTE - PASAR FILTROS DIRECTAMENTE
        // Usar setTimeout para asegurar que React actualice el estado
        setTimeout(async () => {
          console.log('🚀🚀🚀 A punto de llamar handleGenerarReporte...');
          console.log('📦 Con tipo:', tipoNormalizado);
          console.log('🎛️ Con filtros:', filtrosFinales);
          
          try {
            await handleGenerarReporte(tipoNormalizado as 'paquetes' | 'ventas' | 'clientes', filtrosFinales);
            console.log('✅✅✅ handleGenerarReporte completado exitosamente');
          } catch (error) {
            console.error('❌❌❌ Error en handleGenerarReporte:', error);
            throw error;
          }
        }, 100); // 100ms para actualización de estado
      }
      
      // 🆕 Acción: Exportar proyección
      else if (respuesta.accion === 'exportar_proyeccion') {
        if (!datosComparacion) {
          toast({
            title: '⚠️ Sin datos',
            description: 'Primero debes generar un reporte para tener proyecciones disponibles',
            variant: 'destructive'
          });
          return;
        }

        const formato = respuesta.formato || 'pdf';
        
        toast({
          title: '📊 Exportando proyecciones',
          description: `Generando archivo ${formato.toUpperCase()}...`,
          duration: 2000
        });

        setTimeout(async () => {
          try {
            const { exportarProyecciones } = await import('@/lib/exportar-proyecciones');
            await exportarProyecciones(datosComparacion, formato as 'pdf' | 'excel', filtros.moneda || 'BOB', {
              incluirComparacion: true,
              incluirProyeccion: true
            });
            
            toast({
              title: '✅ Proyecciones exportadas',
              description: `Archivo ${formato.toUpperCase()} descargado exitosamente`
            });
            
            // Cambiar a la pestaña de comparación para mostrar los datos
            setActiveTab('comparacion');
            setMostrarComparacion(true);
          } catch (error: any) {
            console.error('Error al exportar proyecciones:', error);
            toast({
              title: '❌ Error al exportar',
              description: error.message || 'No se pudo exportar las proyecciones',
              variant: 'destructive'
            });
          }
        }, 100);
      }
      
      // 🆕 Acción: Mostrar proyecciones
      else if (respuesta.accion === 'mostrar_proyeccion' || respuesta.accion === 'ver_proyeccion') {
        if (!datosComparacion) {
          toast({
            title: '⚠️ Sin proyecciones',
            description: 'Genera un reporte primero para ver las proyecciones futuras',
            variant: 'destructive'
          });
          return;
        }

        toast({
          title: '📊 Mostrando proyecciones',
          description: 'Cambiando a vista de comparación y proyección...'
        });

        setActiveTab('comparacion');
        setMostrarComparacion(true);
      }
      
      // Acción: Aplicar filtros sin generar reporte
      else if (respuesta.accion === 'aplicar_filtros' && respuesta.filtros) {
        const filtrosIA = normalizarFiltros(respuesta.filtros);
        setFiltros(prev => ({ ...prev, ...filtrosIA }));
        
        toast({
          title: '✅ Filtros aplicados',
          description: respuesta.respuesta_texto || 'Filtros actualizados correctamente'
        });
      }
      
      // Acción: Consulta (solo información, no genera reporte)
      else if (respuesta.accion === 'consulta') {
        toast({
          title: '💬 Respuesta',
          description: respuesta.respuesta_texto || respuesta.interpretacion,
          duration: 5000
        });
      }
      
      // Acción: Ayuda
      else if (respuesta.accion === 'ayuda') {
        toast({
          title: '💡 Ayuda',
          description: respuesta.respuesta_texto || 'Consulta los ejemplos de comandos en el panel de voz',
          duration: 5000
        });
      }
      
      // No entendido
      else if (respuesta.accion === 'no_entendido') {
        toast({
          title: '❓ No entendido',
          description: respuesta.respuesta_texto || 'No pude entender tu comando. Intenta reformularlo.',
          variant: 'destructive',
          duration: 4000
        });
      }
      
    } catch (error: any) {
      console.error('❌ Error ejecutando comando de IA:', error);
      toast({
        title: '❌ Error',
        description: error.message || 'Error al ejecutar el comando',
        variant: 'destructive'
      });
    }
  };

  // ============================================================================
  // CARGAR DATOS PARA GRÁFICAS
  // Esta función genera datos dinámicos basados en los filtros aplicados
  // ============================================================================
  
  const cargarDatosGraficas = async (
    tipo: 'paquetes' | 'ventas' | 'clientes',
    filtrosAplicados: FiltrosReporte
  ) => {
    try {
      console.log('📊 Generando datos de gráficas para:', tipo);
      console.log('🎯 Filtros aplicados:', filtrosAplicados);
      
      // TODO: Reemplazar con llamada real al API cuando esté listo
      // Por ahora, generamos datos dinámicos basados en los filtros aplicados
      
      const periodo = filtrosAplicados.fecha_inicio && filtrosAplicados.fecha_fin
        ? `${filtrosAplicados.fecha_inicio} - ${filtrosAplicados.fecha_fin}`
        : 'Últimos 30 días';

      // ===============================================
      // GENERACIÓN DINÁMICA DE DATOS BASADA EN FILTROS
      // ===============================================

      // 1️⃣ Calcular multiplicador base según rango de fechas
      let multiplicadorFechas = 1.0;
      if (filtrosAplicados.fecha_inicio && filtrosAplicados.fecha_fin) {
        const inicio = new Date(filtrosAplicados.fecha_inicio);
        const fin = new Date(filtrosAplicados.fecha_fin);
        const diasDiferencia = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
        multiplicadorFechas = Math.max(0.3, Math.min(2.0, diasDiferencia / 30)); // Entre 30% y 200%
      }

      // 2️⃣ Multiplicador por departamento (cada depto tiene diferentes niveles de venta)
      let multiplicadorDepartamento = 1.0;
      const ventasPorDepto: { [key: string]: number } = {
        'La Paz': 1.5,
        'Santa Cruz': 1.3,
        'Cochabamba': 1.0,
        'Potosí': 0.6,
        'Tarija': 0.5,
        'Oruro': 0.7,
        'Beni': 0.4,
        'Pando': 0.3,
        'Chuquisaca': 0.8,
        'Sucre': 0.9
      };
      if (filtrosAplicados.departamento && ventasPorDepto[filtrosAplicados.departamento]) {
        multiplicadorDepartamento = ventasPorDepto[filtrosAplicados.departamento];
      }

      // 3️⃣ Multiplicador por tipo de cliente
      let multiplicadorCliente = 1.0;
      const gastosPorTipoCliente: { [key: string]: number } = {
        'VIP': 2.5,
        'Recurrente': 1.3,
        'Nuevo': 0.8
      };
      if (filtrosAplicados.tipo_cliente && gastosPorTipoCliente[filtrosAplicados.tipo_cliente]) {
        multiplicadorCliente = gastosPorTipoCliente[filtrosAplicados.tipo_cliente];
      }

      // 4️⃣ Ajuste por rango de montos
      let ajustePorMonto = 1.0;
      if (filtrosAplicados.monto_minimo || filtrosAplicados.monto_maximo) {
        const min = filtrosAplicados.monto_minimo || 0;
        const max = filtrosAplicados.monto_maximo || 10000;
        ajustePorMonto = (max - min) / 5000; // Normalizar al rango promedio
      }

      // 🎲 MULTIPLICADOR TOTAL
      const multiplicadorTotal = multiplicadorFechas * multiplicadorDepartamento * multiplicadorCliente * ajustePorMonto;
      console.log('🎲 Multiplicador calculado:', {
        fechas: multiplicadorFechas,
        departamento: multiplicadorDepartamento,
        cliente: multiplicadorCliente,
        monto: ajustePorMonto,
        total: multiplicadorTotal
      });

      // 📊 GENERAR MÉTRICAS PRINCIPALES
      const baseVentas = 85000 + Math.random() * 40000; // Entre 85k - 125k
      const totalVentas = baseVentas * multiplicadorTotal;
      const baseTransacciones = 150 + Math.floor(Math.random() * 100); // Entre 150 - 250
      const totalTransacciones = Math.floor(baseTransacciones * multiplicadorTotal);
      const ticketPromedio = totalVentas / totalTransacciones;

      // 📅 GENERAR VENTAS POR MES (dinámico según rango de fechas)
      let ventasPorMes = [];
      if (filtrosAplicados.fecha_inicio && filtrosAplicados.fecha_fin) {
        const inicio = new Date(filtrosAplicados.fecha_inicio);
        const fin = new Date(filtrosAplicados.fecha_fin);
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        let mesActual = new Date(inicio);
        while (mesActual <= fin) {
          const nombreMes = meses[mesActual.getMonth()];
          const ventasMes = (12000 + Math.random() * 15000) * multiplicadorTotal;
          const transaccionesMes = Math.floor((20 + Math.random() * 40) * multiplicadorTotal);
          
          ventasPorMes.push({
            mes: nombreMes,
            ventas: Math.round(ventasMes),
            transacciones: transaccionesMes
          });
          
          mesActual.setMonth(mesActual.getMonth() + 1);
        }
      } else {
        // Últimos 6 meses por defecto
        const mesesDefault = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'];
        ventasPorMes = mesesDefault.map(mes => ({
          mes,
          ventas: Math.round((12000 + Math.random() * 15000) * multiplicadorTotal),
          transacciones: Math.floor((20 + Math.random() * 40) * multiplicadorTotal)
        }));
      }

      // 🗺️ GENERAR VENTAS POR DEPARTAMENTO (dinámico)
      let ventasPorDepartamento = [];
      if (filtrosAplicados.departamento) {
        // Solo mostrar el departamento filtrado
        ventasPorDepartamento = [{
          departamento: filtrosAplicados.departamento,
          ventas: Math.round(totalVentas),
          porcentaje: 100
        }];
      } else {
        // Mostrar todos los departamentos con distribución realista
        const departamentos = [
          { nombre: 'La Paz', factor: 0.36 },
          { nombre: 'Santa Cruz', factor: 0.30 },
          { nombre: 'Cochabamba', factor: 0.20 },
          { nombre: 'Potosí', factor: 0.08 },
          { nombre: 'Tarija', factor: 0.06 }
        ];
        
        ventasPorDepartamento = departamentos.map(d => ({
          departamento: d.nombre,
          ventas: Math.round(totalVentas * d.factor * (0.8 + Math.random() * 0.4)), // ±20% variación
          porcentaje: d.factor * 100
        }));
      }

      // 🎁 GENERAR PRODUCTOS MÁS VENDIDOS (dinámico)
      const productosBase = [
        { nombre: 'Paquete Salar de Uyuni', factorVentas: 1.5 },
        { nombre: 'Tour Ciudad de La Paz', factorVentas: 1.0 },
        { nombre: 'Aventura Amazónica', factorVentas: 1.3 },
        { nombre: 'Ruta del Che', factorVentas: 0.9 },
        { nombre: 'Carnaval de Oruro', factorVentas: 1.1 }
      ];

      const productosMasVendidos = productosBase.map(p => ({
        nombre: p.nombre,
        cantidad: Math.floor((20 + Math.random() * 30) * multiplicadorTotal * p.factorVentas),
        ventas: Math.round((8000 + Math.random() * 15000) * multiplicadorTotal * p.factorVentas)
      })).sort((a, b) => b.ventas - a.ventas);

      // 👥 GENERAR TIPOS DE CLIENTE (dinámico)
      let tiposCliente = [];
      if (filtrosAplicados.tipo_cliente) {
        // Solo mostrar el tipo filtrado
        tiposCliente = [{
          tipo: filtrosAplicados.tipo_cliente,
          cantidad: totalTransacciones
        }];
      } else {
        // Distribución realista
        const totalClientes = Math.floor(totalTransacciones * 0.8); // Algunos clientes compran múltiples veces
        tiposCliente = [
          { tipo: 'VIP', cantidad: Math.floor(totalClientes * 0.20) },
          { tipo: 'Recurrente', cantidad: Math.floor(totalClientes * 0.45) },
          { tipo: 'Nuevo', cantidad: Math.floor(totalClientes * 0.35) }
        ];
      }

      // 📈 TENDENCIA MENSUAL CON OBJETIVO
      const tendenciaMensual = ventasPorMes.slice(0, 6).map((item, index) => {
        const objetivoBase = 18000 + (index * 1500);
        return {
          fecha: item.mes.substring(0, 3), // Abreviatura
          ventas: item.ventas,
          objetivo: Math.round(objetivoBase * multiplicadorTotal)
        };
      });

      // ✅ CONSTRUIR OBJETO DE DATOS FINAL
      const datosEjemplo: DatosReporte = {
        // Métricas principales (DINÁMICAS)
        total_ventas: Math.round(totalVentas * 100) / 100,
        total_transacciones: totalTransacciones,
        ticket_promedio: Math.round(ticketPromedio * 100) / 100,
        total_productos: Math.floor(35 + Math.random() * 20),
        total_clientes: tiposCliente.reduce((sum, t) => sum + t.cantidad, 0),
        
        // Datos de gráficas (DINÁMICOS)
        ventas_por_mes: ventasPorMes,
        ventas_por_departamento: ventasPorDepartamento,
        productos_mas_vendidos: productosMasVendidos,
        tipos_cliente: tiposCliente,
        tendencia_mensual: tendenciaMensual,
        
        // Metadatos
        periodo,
        moneda: filtrosAplicados.moneda || 'BOB',
        filtros_aplicados: filtrosAplicados
      };

      console.log('✅ Datos generados dinámicamente:', datosEjemplo);

      setDatosGraficas(datosEjemplo);
      setTipoReporteActual(tipo === 'paquetes' ? 'productos' : tipo);
      setMostrarGraficas(true);
      
      toast({
        title: '📊 Gráficas actualizadas',
        description: `Datos generados para ${filtrosAplicados.departamento || 'todos los departamentos'} - ${periodo}`,
      });
      
    } catch (error) {
      console.error('❌ Error cargando datos de gráficas:', error);
      toast({
        title: '⚠️ Gráficas no disponibles',
        description: 'No se pudieron cargar los datos para las gráficas',
        variant: 'destructive'
      });
    }
  };

  // ============================================================================
  // GENERAR COMPARACIÓN DE PERÍODOS
  // ============================================================================
  
  const generarComparacionPeriodos = async (
    tipo: 'paquetes' | 'ventas' | 'clientes',
    filtrosAplicados: FiltrosReporte
  ) => {
    try {
      console.log('📊 Generando comparación de períodos para:', tipo);
      console.log('🎯 Filtros aplicados:', filtrosAplicados);

      // ===============================================
      // CALCULAR PERÍODO ANTERIOR
      // ===============================================

      let fechaInicioActual: Date;
      let fechaFinActual: Date;
      let fechaInicioAnterior: Date;
      let fechaFinAnterior: Date;
      let nombrePeriodoActual: string;
      let nombrePeriodoAnterior: string;

      if (filtrosAplicados.fecha_inicio && filtrosAplicados.fecha_fin) {
        // Usar fechas especificadas
        fechaInicioActual = new Date(filtrosAplicados.fecha_inicio);
        fechaFinActual = new Date(filtrosAplicados.fecha_fin);
        
        // Calcular duración del período
        const duracionDias = Math.ceil((fechaFinActual.getTime() - fechaInicioActual.getTime()) / (1000 * 60 * 60 * 24));
        
        // Período anterior = mismo número de días antes
        fechaFinAnterior = new Date(fechaInicioActual);
        fechaFinAnterior.setDate(fechaFinAnterior.getDate() - 1);
        fechaInicioAnterior = new Date(fechaFinAnterior);
        fechaInicioAnterior.setDate(fechaInicioAnterior.getDate() - duracionDias + 1);

        nombrePeriodoActual = `${fechaInicioActual.toLocaleDateString()} - ${fechaFinActual.toLocaleDateString()}`;
        nombrePeriodoAnterior = `${fechaInicioAnterior.toLocaleDateString()} - ${fechaFinAnterior.toLocaleDateString()}`;
      } else {
        // Últimos 30 días por defecto
        fechaFinActual = new Date();
        fechaInicioActual = new Date();
        fechaInicioActual.setDate(fechaInicioActual.getDate() - 30);

        fechaFinAnterior = new Date(fechaInicioActual);
        fechaFinAnterior.setDate(fechaFinAnterior.getDate() - 1);
        fechaInicioAnterior = new Date(fechaFinAnterior);
        fechaInicioAnterior.setDate(fechaInicioAnterior.getDate() - 30);

        nombrePeriodoActual = 'Últimos 30 días';
        nombrePeriodoAnterior = '30 días anteriores';
      }

      // ===============================================
      // GENERAR DATOS DEL PERÍODO ACTUAL
      // ===============================================

      // Reutilizar la misma lógica de multiplicadores
      let multiplicadorTotal = 1.0;
      
      // Multiplicador por departamento
      const ventasPorDepto: { [key: string]: number } = {
        'La Paz': 1.5,
        'Santa Cruz': 1.3,
        'Cochabamba': 1.0,
        'Potosí': 0.6,
        'Tarija': 0.5,
        'Oruro': 0.7,
        'Beni': 0.4,
        'Pando': 0.3,
        'Chuquisaca': 0.8,
        'Sucre': 0.9
      };
      if (filtrosAplicados.departamento && ventasPorDepto[filtrosAplicados.departamento]) {
        multiplicadorTotal *= ventasPorDepto[filtrosAplicados.departamento];
      }

      // Multiplicador por tipo de cliente
      const gastosPorTipoCliente: { [key: string]: number } = {
        'VIP': 2.5,
        'Recurrente': 1.3,
        'Nuevo': 0.8
      };
      if (filtrosAplicados.tipo_cliente && gastosPorTipoCliente[filtrosAplicados.tipo_cliente]) {
        multiplicadorTotal *= gastosPorTipoCliente[filtrosAplicados.tipo_cliente];
      }

      // PERÍODO ACTUAL
      const baseVentasActual = 85000 + Math.random() * 40000;
      const totalVentasActual = baseVentasActual * multiplicadorTotal;
      const totalTransaccionesActual = Math.floor((150 + Math.random() * 100) * multiplicadorTotal);
      const ticketPromedioActual = totalVentasActual / totalTransaccionesActual;
      const totalClientesActual = Math.floor(totalTransaccionesActual * 0.75);

      // PERÍODO ANTERIOR (85-95% de variación respecto al actual)
      const factorVariacion = 0.85 + Math.random() * 0.10; // Entre 85% y 95%
      const totalVentasAnterior = totalVentasActual * factorVariacion;
      const totalTransaccionesAnterior = Math.floor(totalTransaccionesActual * factorVariacion);
      const ticketPromedioAnterior = totalVentasAnterior / totalTransaccionesAnterior;
      const totalClientesAnterior = Math.floor(totalClientesActual * factorVariacion);

      // CALCULAR VARIACIONES
      const variaciones = {
        ventas_porcentaje: ((totalVentasActual - totalVentasAnterior) / totalVentasAnterior) * 100,
        transacciones_porcentaje: ((totalTransaccionesActual - totalTransaccionesAnterior) / totalTransaccionesAnterior) * 100,
        ticket_porcentaje: ((ticketPromedioActual - ticketPromedioAnterior) / ticketPromedioAnterior) * 100,
        clientes_porcentaje: ((totalClientesActual - totalClientesAnterior) / totalClientesAnterior) * 100
      };

      // DETERMINAR TENDENCIA
      let tendencia: 'crecimiento' | 'decrecimiento' | 'estable';
      const promedioVariaciones = (variaciones.ventas_porcentaje + variaciones.transacciones_porcentaje) / 2;
      if (promedioVariaciones > 5) {
        tendencia = 'crecimiento';
      } else if (promedioVariaciones < -5) {
        tendencia = 'decrecimiento';
      } else {
        tendencia = 'estable';
      }

      // TASA DE CRECIMIENTO MENSUAL
      const duracionMeses = Math.ceil((fechaFinActual.getTime() - fechaInicioActual.getTime()) / (1000 * 60 * 60 * 24 * 30));
      const tasaCrecimientoMensual = promedioVariaciones / (duracionMeses || 1);

      // ===============================================
      // COMPARACIÓN MENSUAL
      // ===============================================

      const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const comparacionMensual = [];

      for (let i = 0; i < 6; i++) {
        const mesActual = new Date();
        mesActual.setMonth(mesActual.getMonth() - (5 - i));
        
        const ventasActual = (12000 + Math.random() * 15000) * multiplicadorTotal * (1 + (i * 0.05));
        const ventasAnterior = ventasActual * (0.85 + Math.random() * 0.10);

        comparacionMensual.push({
          mes: mesesNombres[mesActual.getMonth()],
          periodo_actual: Math.round(ventasActual),
          periodo_anterior: Math.round(ventasAnterior)
        });
      }

      // ===============================================
      // PROYECCIÓN FUTURA (3 MESES)
      // ===============================================

      const proyeccionFutura = [];
      const ventasMesActual = totalVentasActual / (duracionMeses || 1);

      for (let i = 1; i <= 3; i++) {
        const mesFuturo = new Date();
        mesFuturo.setMonth(mesFuturo.getMonth() + i);
        
        // Proyección base con tasa de crecimiento
        const proyectadoBase = ventasMesActual * (1 + (tasaCrecimientoMensual / 100) * i);
        
        // Escenarios optimista (+20%) y pesimista (-20%)
        const optimista = proyectadoBase * 1.20;
        const pesimista = proyectadoBase * 0.80;

        proyeccionFutura.push({
          mes: mesesNombres[mesFuturo.getMonth()],
          proyectado: Math.round(proyectadoBase),
          optimista: Math.round(optimista),
          pesimista: Math.round(pesimista)
        });
      }

      // ===============================================
      // CONSTRUIR OBJETO FINAL
      // ===============================================

      const datosComparacion: DatosComparacion = {
        periodo_actual: {
          nombre: nombrePeriodoActual,
          fecha_inicio: fechaInicioActual.toISOString().split('T')[0],
          fecha_fin: fechaFinActual.toISOString().split('T')[0],
          total_ventas: Math.round(totalVentasActual * 100) / 100,
          total_transacciones: totalTransaccionesActual,
          ticket_promedio: Math.round(ticketPromedioActual * 100) / 100,
          total_clientes: totalClientesActual
        },
        periodo_anterior: {
          nombre: nombrePeriodoAnterior,
          fecha_inicio: fechaInicioAnterior.toISOString().split('T')[0],
          fecha_fin: fechaFinAnterior.toISOString().split('T')[0],
          total_ventas: Math.round(totalVentasAnterior * 100) / 100,
          total_transacciones: totalTransaccionesAnterior,
          ticket_promedio: Math.round(ticketPromedioAnterior * 100) / 100,
          total_clientes: totalClientesAnterior
        },
        variaciones,
        comparacion_mensual: comparacionMensual,
        proyeccion_futura: proyeccionFutura,
        tendencia,
        tasa_crecimiento_mensual: Math.round(tasaCrecimientoMensual * 100) / 100
      };

      console.log('✅ Datos de comparación generados:', datosComparacion);

      setDatosComparacion(datosComparacion);
      setMostrarComparacion(true);
      
      toast({
        title: '📊 Comparación generada',
        description: `Análisis comparativo: ${nombrePeriodoAnterior} vs ${nombrePeriodoActual}`,
      });

    } catch (error) {
      console.error('❌ Error generando comparación:', error);
      toast({
        title: '⚠️ Comparación no disponible',
        description: 'No se pudo generar la comparación de períodos',
        variant: 'destructive'
      });
    }
  };

  const handleGenerarReporte = async (
    tipoReporte: 'paquetes' | 'ventas' | 'clientes' | 'productos',  // 🆕 Agregar 'productos'
    filtrosCustom?: FiltrosReporte  // 🆕 Filtros opcionales para comando de voz
  ) => {
    console.log('🚀🚀🚀 handleGenerarReporte INICIADO');
    console.log('📦 Tipo de reporte:', tipoReporte);
    console.log('🎛️ Filtros custom recibidos:', filtrosCustom);
    console.log('🎛️ Filtros de estado:', filtros);
    
    // Usar filtros custom si se proporcionan, sino usar los del estado
    const filtrosFinales = filtrosCustom || filtros;
    console.log('✅ Filtros finales a usar:', filtrosFinales);
    
    setLoading(true);
    
    try {
      let resultado;
      
      // Normalizar el tipo de reporte para el switch
      // Si viene "productos" del comando de voz, usar "paquetes" para el API
      const tipoParaSwitch: 'paquetes' | 'ventas' | 'clientes' = 
        tipoReporte === 'productos' ? 'paquetes' : tipoReporte as 'paquetes' | 'ventas' | 'clientes';
      
      console.log('🔄 Tipo original:', tipoReporte, '→ Tipo para switch:', tipoParaSwitch);
      
      switch (tipoParaSwitch) {
        case 'paquetes':
          resultado = await generarReporteProductos(filtrosFinales);
          break;
        case 'ventas':
          resultado = await generarReporteVentas(filtrosFinales);
          break;
        case 'clientes':
          resultado = await generarReporteClientes(filtrosFinales);
          break;
        default:
          console.error('❌ Tipo de reporte no reconocido:', tipoReporte);
          throw new Error(`Tipo de reporte no válido: ${tipoReporte}`);
      }
      
      console.log('📊 Resultado del reporte:', resultado);

      if (resultado && resultado.success) {
        // Todos los formatos son archivos descargables (DOCX, PDF, Excel)
        if (resultado.archivo) {
          try {
            await descargarArchivo(resultado.archivo, filtrosFinales, tipoReporte, resultado.contentDisposition);
            
            // Mensaje personalizado según el formato
            let formatoTexto = filtrosFinales.formato.toUpperCase();
            if (filtrosFinales.formato === 'docx') formatoTexto = 'Word (DOCX)';
            if (filtrosFinales.formato === 'excel') formatoTexto = 'Excel (XLSX)';
            
            toast({ 
              title: '✅ Descarga iniciada', 
              description: `Reporte de ${tipoReporte} en ${formatoTexto}` 
            });

            // 🆕 CARGAR DATOS PARA GRÁFICAS
            console.log('📊 Cargando datos para gráficas...');
            await cargarDatosGraficas(tipoParaSwitch, filtrosFinales);
            
            // 🆕 GENERAR COMPARACIÓN DE PERÍODOS
            console.log('📊 Generando comparación de períodos...');
            await generarComparacionPeriodos(tipoParaSwitch, filtrosFinales);
            
          } catch (downloadError: any) {
            toast({ 
              title: '❌ Error al descargar', 
              description: downloadError.message || 'Error al procesar el archivo',
              variant: 'destructive'
            });
          }
        }
      } else {
        console.error('Error del backend:', resultado);
        const errorMsg = resultado.error || 'Error al generar reporte';
        console.error('Mensaje de error:', errorMsg);
        toast({ 
          title: '❌ Error generando reporte', 
          description: errorMsg,
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Error capturado en catch:', error);
      console.error('Tipo de error:', typeof error);
      console.error('Error completo:', JSON.stringify(error, null, 2));
      
      const errorMsg = error?.message || error?.toString() || 'Error inesperado al generar reporte';
      toast({ 
        title: '❌ Error inesperado', 
        description: errorMsg,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reportes y Analíticas</h1>
        <p className="text-gray-600 mt-2">Sistema de generación de reportes con filtros dinámicos</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('estatico')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'estatico'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Reportes Estáticos
        </button>
        <button
          onClick={() => setActiveTab('dinamico')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'dinamico'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Reportes Dinámicos
          {contarFiltrosActivos() > 0 && (
            <Badge className="ml-2 bg-orange-500">{contarFiltrosActivos()}</Badge>
          )}
        </button>
        <button
          onClick={() => setActiveTab('inteligente')}
          className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'inteligente'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <span>🤖 Reportes Inteligentes</span>
          <Badge variant="secondary" className="text-xs">
            IA + Voz
          </Badge>
        </button>
        <button
          onClick={() => setActiveTab('graficas')}
          className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'graficas'
              ? 'border-b-2 border-green-600 text-green-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Gráficas
          {mostrarGraficas && <Badge className="ml-1 bg-green-500">●</Badge>}
        </button>
        <button
          onClick={() => setActiveTab('comparacion')}
          className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'comparacion'
              ? 'border-b-2 border-cyan-600 text-cyan-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Comparación
          {mostrarComparacion && <Badge className="ml-1 bg-cyan-500">●</Badge>}
        </button>
      </div>

      {/* Contenido según tab activo */}
      {activeTab === 'estatico' ? (
        /* ==================== REPORTES ESTÁTICOS ==================== */
        <div className="space-y-6">
          {/* Configuración Básica */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>Selecciona formato, moneda y rango de fechas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Formato y Moneda */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Formato de Salida</label>
                  <select
                    value={filtros.formato}
                    onChange={(e) => setFiltros({ ...filtros, formato: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="docx">📝 Word (DOCX)</option>
                    <option value="pdf">📄 PDF</option>
                    <option value="excel">📊 Excel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Moneda</label>
                  <select
                    value={filtros.moneda}
                    onChange={(e) => setFiltros({ ...filtros, moneda: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">💵 Dólares (USD)</option>
                    <option value="BOB">💰 Bolivianos (BOB)</option>
                    <option value="AMBAS">🌐 Ambas</option>
                  </select>
                </div>
              </div>

              {/* Rango de Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Fecha Inicio</label>
                  <input
                    type="date"
                    value={filtros.fecha_inicio}
                    onChange={(e) => setFiltros({ ...filtros, fecha_inicio: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Fecha Fin</label>
                  <input
                    type="date"
                    value={filtros.fecha_fin}
                    onChange={(e) => setFiltros({ ...filtros, fecha_fin: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones de Generación */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => !loading && handleGenerarReporte('paquetes')}>
              <CardContent className="p-6 text-center">
                <FileText className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                <h3 className="font-semibold text-lg mb-2">Reporte de Paquetes</h3>
                <p className="text-sm text-gray-600 mb-4">Paquetes y servicios disponibles</p>
                <button
                  disabled={loading}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generando...' : 'Generar'}
                </button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => !loading && handleGenerarReporte('ventas')}>
              <CardContent className="p-6 text-center">
                <Download className="w-12 h-12 mx-auto mb-3 text-green-600" />
                <h3 className="font-semibold text-lg mb-2">Reporte de Ventas</h3>
                <p className="text-sm text-gray-600 mb-4">Transacciones y reservas</p>
                <button
                  disabled={loading}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generando...' : 'Generar'}
                </button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => !loading && handleGenerarReporte('clientes')}>
              <CardContent className="p-6 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-purple-600" />
                <h3 className="font-semibold text-lg mb-2">Reporte de Clientes</h3>
                <p className="text-sm text-gray-600 mb-4">Base de datos de clientes</p>
                <button
                  disabled={loading}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generando...' : 'Generar'}
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* ==================== REPORTES DINÁMICOS ==================== */
        <div className="space-y-6">
          {/* Configuración Básica (igual que estáticos) */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>Formato, moneda y fechas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Formato</label>
                  <select
                    value={filtros.formato}
                    onChange={(e) => setFiltros({ ...filtros, formato: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="docx">📝 Word (DOCX)</option>
                    <option value="pdf">📄 PDF</option>
                    <option value="excel">📊 Excel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Moneda</label>
                  <select
                    value={filtros.moneda}
                    onChange={(e) => setFiltros({ ...filtros, moneda: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">💵 USD</option>
                    <option value="BOB">💰 BOB</option>
                    <option value="AMBAS">🌐 Ambas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Fecha Inicio</label>
                  <input
                    type="date"
                    value={filtros.fecha_inicio}
                    onChange={(e) => setFiltros({ ...filtros, fecha_inicio: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Fecha Fin</label>
                  <input
                    type="date"
                    value={filtros.fecha_fin}
                    onChange={(e) => setFiltros({ ...filtros, fecha_fin: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filtros Principales (3 filtros clave) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros Principales
              </CardTitle>
              <CardDescription>Departamento, tipo de destino y tipo de cliente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Departamento */}
                <div>
                  <label className="block text-sm font-medium mb-2">Departamento</label>
                  <select
                    value={filtros.departamento || ''}
                    onChange={(e) => setFiltros({ ...filtros, departamento: e.target.value || undefined })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Todos</option>
                    <option value="La Paz">La Paz</option>
                    <option value="Santa Cruz">Santa Cruz</option>
                    <option value="Cochabamba">Cochabamba</option>
                    <option value="Potosí">Potosí</option>
                    <option value="Oruro">Oruro</option>
                    <option value="Chuquisaca">Chuquisaca</option>
                    <option value="Tarija">Tarija</option>
                    <option value="Beni">Beni</option>
                    <option value="Pando">Pando</option>
                  </select>
                </div>

                {/* Tipo de Destino */}
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de Destino</label>
                  <select
                    value={filtros.tipo_destino || ''}
                    onChange={(e) => setFiltros({ ...filtros, tipo_destino: e.target.value as any || undefined })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Todos</option>
                    <option value="Natural">🌳 Natural</option>
                    <option value="Histórico">🏛️ Histórico</option>
                    <option value="Urbano">🏙️ Urbano</option>
                    <option value="Rural">🌾 Rural</option>
                    <option value="Mixto">🌐 Mixto</option>
                  </select>
                </div>

                {/* Tipo de Cliente */}
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de Cliente</label>
                  <select
                    value={filtros.tipo_cliente || ''}
                    onChange={(e) => setFiltros({ ...filtros, tipo_cliente: e.target.value as any || undefined })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Todos</option>
                    <option value="nuevo">🆕 Nuevo (1-2 reservas)</option>
                    <option value="recurrente">🔄 Recurrente (3-5)</option>
                    <option value="vip">⭐ VIP (6+)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filtros Avanzados (Colapsables) */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Filtros Avanzados</CardTitle>
                  <CardDescription>Temporales, paquetes, monto y campaña</CardDescription>
                </div>
                <button
                  onClick={() => setShowFiltrosAvanzados(!showFiltrosAvanzados)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showFiltrosAvanzados ? (
                    <>
                      <ChevronUp className="w-5 h-5" />
                      Ocultar
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-5 h-5" />
                      Mostrar {contarFiltrosActivos() > 0 && `(${contarFiltrosActivos()} activos)`}
                    </>
                  )}
                </button>
              </div>
            </CardHeader>
            {showFiltrosAvanzados && (
              <CardContent className="space-y-6">
                {/* Filtros Temporales */}
                <div>
                  <h4 className="font-semibold mb-3 text-gray-700">Filtros Temporales</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filtros.solo_fines_semana || false}
                          onChange={(e) => setFiltros({ ...filtros, solo_fines_semana: e.target.checked || undefined })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Solo fines de semana</span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filtros.solo_dias_semana || false}
                          onChange={(e) => setFiltros({ ...filtros, solo_dias_semana: e.target.checked || undefined })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Solo días de semana</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Mes</label>
                      <select
                        value={filtros.mes || ''}
                        onChange={(e) => setFiltros({ ...filtros, mes: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="">Todos</option>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {new Date(2000, i).toLocaleString('es-ES', { month: 'long' })}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Trimestre</label>
                      <select
                        value={filtros.trimestre || ''}
                        onChange={(e) => setFiltros({ ...filtros, trimestre: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="">Todos</option>
                        <option value="1">Q1 (Ene-Mar)</option>
                        <option value="2">Q2 (Abr-Jun)</option>
                        <option value="3">Q3 (Jul-Sep)</option>
                        <option value="4">Q4 (Oct-Dic)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Filtros de Paquetes */}
                <div>
                  <h4 className="font-semibold mb-3 text-gray-700">Filtros de Paquetes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filtros.solo_destacados || false}
                          onChange={(e) => setFiltros({ ...filtros, solo_destacados: e.target.checked || undefined })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Solo destacados</span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filtros.solo_personalizados || false}
                          onChange={(e) => setFiltros({ ...filtros, solo_personalizados: e.target.checked || undefined })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Solo personalizados</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Duración (días)</label>
                      <input
                        type="number"
                        min="1"
                        value={filtros.duracion_dias || ''}
                        onChange={(e) => setFiltros({ ...filtros, duracion_dias: e.target.value ? Number(e.target.value) : undefined })}
                        placeholder="Ej: 3"
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Filtros de Monto */}
                <div>
                  <h4 className="font-semibold mb-3 text-gray-700">Filtros de Monto</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Monto Mínimo</label>
                      <input
                        type="number"
                        min="0"
                        value={filtros.monto_minimo || ''}
                        onChange={(e) => setFiltros({ ...filtros, monto_minimo: e.target.value ? Number(e.target.value) : undefined })}
                        placeholder="Ej: 1000"
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Monto Máximo</label>
                      <input
                        type="number"
                        min="0"
                        value={filtros.monto_maximo || ''}
                        onChange={(e) => setFiltros({ ...filtros, monto_maximo: e.target.value ? Number(e.target.value) : undefined })}
                        placeholder="Ej: 5000"
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Filtros de Campaña */}
                <div>
                  <h4 className="font-semibold mb-3 text-gray-700">Filtros de Campaña</h4>
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filtros.con_campana || false}
                        onChange={(e) => setFiltros({ ...filtros, con_campana: e.target.checked || undefined })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Solo con campaña/promoción activa</span>
                    </label>
                  </div>
                </div>

                {/* Botón Limpiar Filtros */}
                {contarFiltrosActivos() > 0 && (
                  <div className="pt-4 border-t">
                    <button
                      onClick={limpiarFiltros}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
                    >
                      <X className="w-4 h-4" />
                      Limpiar filtros avanzados ({contarFiltrosActivos()})
                    </button>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Botones de Generación (igual que estáticos) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => !loading && handleGenerarReporte('paquetes')}>
              <CardContent className="p-6 text-center">
                <FileText className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                <h3 className="font-semibold text-lg mb-2">Reporte de Paquetes</h3>
                <p className="text-sm text-gray-600 mb-4">Con filtros aplicados</p>
                <button
                  disabled={loading}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Generando...' : 'Generar'}
                </button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => !loading && handleGenerarReporte('ventas')}>
              <CardContent className="p-6 text-center">
                <Download className="w-12 h-12 mx-auto mb-3 text-green-600" />
                <h3 className="font-semibold text-lg mb-2">Reporte de Ventas</h3>
                <p className="text-sm text-gray-600 mb-4">Con filtros aplicados</p>
                <button
                  disabled={loading}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Generando...' : 'Generar'}
                </button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => !loading && handleGenerarReporte('clientes')}>
              <CardContent className="p-6 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-purple-600" />
                <h3 className="font-semibold text-lg mb-2">Reporte de Clientes</h3>
                <p className="text-sm text-gray-600 mb-4">Con filtros aplicados</p>
                <button
                  disabled={loading}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'Generando...' : 'Generar'}
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ======================================================================
          TAB 3: REPORTES INTELIGENTES (IA + VOZ)
      ====================================================================== */}
      {activeTab === 'inteligente' && (
        <div className="space-y-6">
          {/* Descripción */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🤖</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-purple-900 mb-2">
                    Sistema de Reportes con Inteligencia Artificial
                  </h3>
                  <p className="text-purple-700 mb-3">
                    Genera reportes usando <strong>comandos de voz</strong> o <strong>texto en lenguaje natural</strong>. 
                    La IA entiende tus solicitudes y extrae automáticamente los filtros y parámetros necesarios.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">🎤 Reconocimiento de Voz</Badge>
                    <Badge variant="default">🧠 Procesamiento NLP</Badge>
                    <Badge variant="default">🔊 Respuestas por Voz</Badge>
                    <Badge variant="secondary">Cualquier formato</Badge>
                    <Badge variant="secondary">Cualquier filtro</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Componente de Control de Voz */}
          <VoiceReportController
            onEjecutarComando={handleComandoIA}
            onLimpiarFiltros={limpiarFiltros}
            contexto="reportes-dashboard"
            titulo="🎤 Asistente Inteligente de Reportes"
          />

          {/* Información Adicional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ejemplos Avanzados */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💡 Ejemplos Avanzados</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>"Genera un reporte de <strong>paquetes de La Paz</strong> mayores a <strong>1500 dólares</strong> en <strong>PDF</strong>"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>"Muéstrame las <strong>ventas de Santa Cruz</strong> entre <strong>enero y marzo</strong> en <strong>Excel</strong>"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>"Exporta los <strong>clientes</strong> que compraron en <strong>diciembre</strong> en <strong>Word</strong>"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>"Dame los <strong>paquetes personalizados</strong> de <strong>Cochabamba</strong> del <strong>último trimestre</strong>"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>"¿Cuántas <strong>ventas tuvimos</strong> en <strong>noviembre</strong> mayores a <strong>800 bolivianos</strong>?"</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Capacidades */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🚀 Capacidades del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Tipos de Reporte</h4>
                    <p className="text-gray-600">Paquetes, Ventas y Clientes</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Formatos Soportados</h4>
                    <p className="text-gray-600">PDF, Excel (XLSX), Word (DOCX)</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Filtros Inteligentes</h4>
                    <p className="text-gray-600">Fechas, departamentos, montos, tipos, duraciones, campañas y más (40+ filtros)</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Idiomas</h4>
                    <p className="text-gray-600">Español (próximamente: Inglés, Portugués)</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Consultas</h4>
                    <p className="text-gray-600">Preguntas sin generar reporte (ej: "¿cuántas ventas tuvimos?")</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tips de Uso */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                💡 Tips para Mejores Resultados
              </h4>
              <ul className="space-y-1 text-sm text-yellow-800">
                <li>• Habla con <strong>naturalidad</strong>, no necesitas usar comandos exactos</li>
                <li>• Sé <strong>específico</strong> con fechas, departamentos y montos</li>
                <li>• Menciona el <strong>formato</strong> deseado (PDF, Excel o Word)</li>
                <li>• Puedes hacer <strong>preguntas</strong> antes de generar el reporte</li>
                <li>• Usa <strong>Chrome o Edge</strong> para mejor reconocimiento de voz</li>
                <li>• Si la IA no entiende, reformula tu comando con más detalles</li>
              </ul>
            </CardContent>
          </Card>

          {/* Estado de Filtros Actuales (si hay) */}
          {contarFiltrosActivos() > 0 && (
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-600" />
                  Filtros Aplicados por IA
                  <Badge variant="default">{contarFiltrosActivos()}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {filtros.departamento && (
                    <Badge variant="secondary">
                      Departamento: {filtros.departamento}
                    </Badge>
                  )}
                  {filtros.fecha_inicio && (
                    <Badge variant="secondary">
                      Desde: {filtros.fecha_inicio}
                    </Badge>
                  )}
                  {filtros.fecha_fin && (
                    <Badge variant="secondary">
                      Hasta: {filtros.fecha_fin}
                    </Badge>
                  )}
                  {filtros.monto_minimo && (
                    <Badge variant="secondary">
                      Monto mín: {filtros.monto_minimo} {filtros.moneda}
                    </Badge>
                  )}
                  {filtros.monto_maximo && (
                    <Badge variant="secondary">
                      Monto máx: {filtros.monto_maximo} {filtros.moneda}
                    </Badge>
                  )}
                  {filtros.solo_personalizados && (
                    <Badge variant="secondary">
                      Solo Personalizados
                    </Badge>
                  )}
                  {filtros.solo_destacados && (
                    <Badge variant="secondary">
                      Solo Destacados
                    </Badge>
                  )}
                  {filtros.mes && (
                    <Badge variant="secondary">
                      Mes: {filtros.mes}
                    </Badge>
                  )}
                  <Button
                    onClick={limpiarFiltros}
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Limpiar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ======================================================================
          TAB 4: GRÁFICAS INTERACTIVAS
      ====================================================================== */}
      {activeTab === 'graficas' && (
        <div className="space-y-6">
          {mostrarGraficas && datosGraficas ? (
            <ReportCharts 
              datos={datosGraficas} 
              tipo={tipoReporteActual}
              titulo={`Análisis Visual de ${tipoReporteActual.charAt(0).toUpperCase() + tipoReporteActual.slice(1)}`}
            />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <BarChart3 className="w-16 h-16 text-gray-400" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No hay datos para visualizar
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Genera un reporte primero para ver las gráficas interactivas
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={() => setActiveTab('estatico')}
                        variant="outline"
                      >
                        Ir a Reportes Estáticos
                      </Button>
                      <Button
                        onClick={() => setActiveTab('dinamico')}
                        variant="outline"
                      >
                        Ir a Reportes Dinámicos
                      </Button>
                      <Button
                        onClick={() => setActiveTab('inteligente')}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        🤖 Usar Reportes Inteligentes
                      </Button>
                    </div>
                  </div>
                  
                  {/* Instrucciones */}
                  <div className="mt-8 p-4 bg-blue-50 rounded-lg max-w-2xl">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      💡 ¿Cómo funcionan las gráficas?
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1 text-left">
                      <li>• Las gráficas se generan automáticamente después de crear un reporte</li>
                      <li>• Visualiza tus datos en barras, líneas, tortas, áreas y radar</li>
                      <li>• Interactúa con tooltips al pasar el mouse</li>
                      <li>• Exporta las gráficas como imágenes PNG</li>
                      <li>• Los filtros aplicados se reflejan en los datos visualizados</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ======================================================================
          TAB 5: COMPARACIÓN DE PERÍODOS Y PROYECCIÓN
      ====================================================================== */}
      {activeTab === 'comparacion' && (
        <div 
          className="min-h-[600px] rounded-3xl p-8"
          style={{
            background: 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
        >
          {mostrarComparacion && datosComparacion ? (
            <ComparacionPeriodos 
              datosComparacion={datosComparacion}
              moneda={filtros.moneda || 'BOB'}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white">
              <div className="relative group">
                {/* Fondo glassmorphic */}
                <div className="absolute inset-0 bg-white/10 rounded-3xl backdrop-blur-xl" />
                <div className="relative p-12 rounded-3xl border border-white/20">
                  <div className="flex flex-col items-center gap-6">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                      <TrendingUp className="w-20 h-20 text-cyan-400" />
                    </div>
                    <div className="text-center max-w-2xl">
                      <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Análisis Comparativo de Períodos
                      </h3>
                      <p className="text-white/70 mb-8 text-lg">
                        Genera un reporte para ver la comparación entre períodos y proyecciones de crecimiento futuro
                      </p>
                      
                      {/* Botones de acción */}
                      <div className="flex gap-4 justify-center mb-8">
                        <button
                          onClick={() => setActiveTab('estatico')}
                          className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-xl transition-all duration-300"
                        >
                          Reportes Estáticos
                        </button>
                        <button
                          onClick={() => setActiveTab('dinamico')}
                          className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-xl transition-all duration-300"
                        >
                          Reportes Dinámicos
                        </button>
                        <button
                          onClick={() => setActiveTab('inteligente')}
                          className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg shadow-purple-500/30"
                        >
                          🤖 Reportes Inteligentes
                        </button>
                      </div>

                      {/* Características */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/20">
                              <TrendingUp className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white mb-1">Comparación de Períodos</h4>
                              <p className="text-sm text-white/60">
                                Compara el período actual vs el anterior para identificar tendencias
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/20">
                              <Target className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white mb-1">Proyección Futura</h4>
                              <p className="text-sm text-white/60">
                                Visualiza proyecciones optimistas, base y pesimistas a 3 meses
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-cyan-500/20">
                              <Activity className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white mb-1">Métricas Clave</h4>
                              <p className="text-sm text-white/60">
                                Ventas, transacciones, ticket promedio y clientes comparados
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-amber-500/20">
                              <Zap className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white mb-1">Análisis de Tendencia</h4>
                              <p className="text-sm text-white/60">
                                Detecta automáticamente si estás en crecimiento o decrecimiento
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminReportesDashboard;
