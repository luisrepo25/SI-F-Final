
import { DatosComparacion } from '@/components/ComparacionPeriodos';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// ============================================================================
// TIPOS
// ============================================================================

export interface OpcionesExportacion {
  incluirComparacion?: boolean;
  incluirProyeccion?: boolean;
  incluirGraficas?: boolean;
  formato: 'pdf' | 'excel';
  nombreArchivo?: string;
}

// ============================================================================
// EXPORTAR A PDF
// ============================================================================

export const exportarProyeccionPDF = async (
  datos: DatosComparacion,
  moneda: string = 'BOB',
  opciones: Partial<OpcionesExportacion> = {}
): Promise<void> => {
  const {
    incluirComparacion = true,
    incluirProyeccion = true,
    nombreArchivo = `proyeccion_${new Date().toISOString().split('T')[0]}.pdf`
  } = opciones;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  let yPos = 20;

  // ============================================================================
  // ENCABEZADO PROFESIONAL
  // ============================================================================
  
  // Logo y título (puedes agregar tu logo aquí)
  doc.setFillColor(59, 130, 246); // Azul
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORTE DE PROYECCIONES', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado: ${new Date().toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, pageWidth / 2, 23, { align: 'center' });

  yPos = 40;

  // ============================================================================
  // RESUMEN EJECUTIVO
  // ============================================================================
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMEN EJECUTIVO', 14, yPos);
  
  yPos += 10;
  
  const tendenciaColor = datos.tendencia === 'crecimiento' ? [34, 197, 94] : 
                         datos.tendencia === 'decrecimiento' ? [239, 68, 68] : [234, 179, 8];
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(tendenciaColor[0], tendenciaColor[1], tendenciaColor[2]);
  doc.text(`Tendencia: ${datos.tendencia.toUpperCase()}`, 14, yPos);
  doc.setTextColor(0, 0, 0);
  doc.text(`Tasa de crecimiento mensual: ${datos.tasa_crecimiento_mensual.toFixed(2)}%`, 14, yPos + 6);
  
  yPos += 20;

  // ============================================================================
  // COMPARACIÓN DE PERÍODOS (si está incluida)
  // ============================================================================
  
  if (incluirComparacion) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('COMPARACION DE PERIODOS', 14, yPos);
    
    yPos += 5;
    
    // Tabla de comparación
    autoTable(doc, {
      startY: yPos,
      head: [['Metrica', 'Periodo Anterior', 'Periodo Actual', 'Variacion']],
      body: [
        [
          'Ventas Totales',
          `${moneda} ${datos.periodo_anterior.total_ventas.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          `${moneda} ${datos.periodo_actual.total_ventas.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          `${datos.variaciones.ventas_porcentaje >= 0 ? '+' : ''}${datos.variaciones.ventas_porcentaje.toFixed(2)}%`
        ],
        [
          'Transacciones',
          datos.periodo_anterior.total_transacciones.toString(),
          datos.periodo_actual.total_transacciones.toString(),
          `${datos.variaciones.transacciones_porcentaje >= 0 ? '+' : ''}${datos.variaciones.transacciones_porcentaje.toFixed(2)}%`
        ],
        [
          'Ticket Promedio',
          `${moneda} ${datos.periodo_anterior.ticket_promedio.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          `${moneda} ${datos.periodo_actual.ticket_promedio.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          `${datos.variaciones.ticket_porcentaje >= 0 ? '+' : ''}${datos.variaciones.ticket_porcentaje.toFixed(2)}%`
        ],
        [
          'Total Clientes',
          datos.periodo_anterior.total_clientes.toString(),
          datos.periodo_actual.total_clientes.toString(),
          `${datos.variaciones.clientes_porcentaje >= 0 ? '+' : ''}${datos.variaciones.clientes_porcentaje.toFixed(2)}%`
        ]
      ],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        3: { 
          cellWidth: 30,
          halign: 'right',
          fontStyle: 'bold'
        }
      },
      didParseCell: function(data: any) {
        if (data.section === 'body' && data.column.index === 3) {
          const value = parseFloat(data.cell.text[0]);
          if (!isNaN(value)) {
            if (value > 0) {
              data.cell.styles.textColor = [34, 197, 94]; // Verde
            } else if (value < 0) {
              data.cell.styles.textColor = [239, 68, 68]; // Rojo
            } else {
              data.cell.styles.textColor = [234, 179, 8]; // Amarillo
            }
          }
        }
      }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // ============================================================================
  // PROYECCIÓN FUTURA (si está incluida)
  // ============================================================================
  
  if (incluirProyeccion && yPos + 50 < pageHeight) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PROYECCION DE VENTAS FUTURAS (3 Meses)', 14, yPos);
    
    yPos += 5;
    
    // Tabla de proyección
    autoTable(doc, {
      startY: yPos,
      head: [['Mes', 'Escenario Pesimista', 'Escenario Base', 'Escenario Optimista']],
      body: datos.proyeccion_futura.map(item => [
        item.mes,
        `${moneda} ${item.pesimista.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        `${moneda} ${item.proyectado.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        `${moneda} ${item.optimista.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [147, 51, 234], textColor: [255, 255, 255], fontStyle: 'bold' },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        1: { fillColor: [254, 226, 226], fontStyle: 'bold' }, // Pesimista en rojo suave
        2: { fillColor: [219, 234, 254], fontStyle: 'bold' }, // Base en azul suave
        3: { fillColor: [220, 252, 231], fontStyle: 'bold' }  // Optimista en verde suave
      }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Nueva página para comparación mensual si es necesario
  if (yPos + 60 > pageHeight) {
    doc.addPage();
    yPos = 20;
  }

  // ============================================================================
  // COMPARACIÓN MENSUAL (HISTÓRICO)
  // ============================================================================
  
  if (datos.comparacion_mensual && datos.comparacion_mensual.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('COMPARACION MENSUAL HISTORICA', 14, yPos);
    
    yPos += 5;
    
    autoTable(doc, {
      startY: yPos,
      head: [['Mes', 'Periodo Anterior', 'Periodo Actual', 'Variacion']],
      body: datos.comparacion_mensual.map((item, index) => {
        const variacion = ((item.periodo_actual - item.periodo_anterior) / item.periodo_anterior * 100).toFixed(2);
        return [
          item.mes,
          `${moneda} ${item.periodo_anterior.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          `${moneda} ${item.periodo_actual.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          `${parseFloat(variacion) >= 0 ? '+' : ''}${variacion}%`
        ];
      }),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        3: { 
          cellWidth: 30,
          halign: 'right',
          fontStyle: 'bold'
        }
      }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // ============================================================================
  // PIE DE PÁGINA
  // ============================================================================
  
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Pagina ${i} de ${totalPages} | Documento confidencial`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Guardar PDF
  doc.save(nombreArchivo);
};

// ============================================================================
// EXPORTAR A EXCEL
// ============================================================================

export const exportarProyeccionExcel = async (
  datos: DatosComparacion,
  moneda: string = 'BOB',
  opciones: Partial<OpcionesExportacion> = {}
): Promise<void> => {
  const {
    incluirComparacion = true,
    incluirProyeccion = true,
    nombreArchivo = `proyeccion_${new Date().toISOString().split('T')[0]}.xlsx`
  } = opciones;

  const workbook = XLSX.utils.book_new();

  // ============================================================================
  // HOJA 1: RESUMEN EJECUTIVO
  // ============================================================================
  
  const resumenData = [
    ['REPORTE DE PROYECCIONES'],
    [`Generado: ${new Date().toLocaleDateString('es-ES')}`],
    [],
    ['RESUMEN EJECUTIVO'],
    ['Tendencia:', datos.tendencia.toUpperCase()],
    ['Tasa de Crecimiento Mensual:', `${datos.tasa_crecimiento_mensual.toFixed(2)}%`],
    [],
    ['PERIODO ACTUAL'],
    ['Nombre:', datos.periodo_actual.nombre],
    ['Fecha Inicio:', datos.periodo_actual.fecha_inicio],
    ['Fecha Fin:', datos.periodo_actual.fecha_fin],
    ['Ventas Totales:', datos.periodo_actual.total_ventas, moneda],
    ['Transacciones:', datos.periodo_actual.total_transacciones],
    ['Ticket Promedio:', datos.periodo_actual.ticket_promedio, moneda],
    ['Total Clientes:', datos.periodo_actual.total_clientes],
    [],
    ['PERIODO ANTERIOR'],
    ['Nombre:', datos.periodo_anterior.nombre],
    ['Fecha Inicio:', datos.periodo_anterior.fecha_inicio],
    ['Fecha Fin:', datos.periodo_anterior.fecha_fin],
    ['Ventas Totales:', datos.periodo_anterior.total_ventas, moneda],
    ['Transacciones:', datos.periodo_anterior.total_transacciones],
    ['Ticket Promedio:', datos.periodo_anterior.ticket_promedio, moneda],
    ['Total Clientes:', datos.periodo_anterior.total_clientes]
  ];

  const resumenSheet = XLSX.utils.aoa_to_sheet(resumenData);
  XLSX.utils.book_append_sheet(workbook, resumenSheet, 'Resumen');

  // ============================================================================
  // HOJA 2: COMPARACIÓN DE PERÍODOS
  // ============================================================================
  
  if (incluirComparacion) {
    const comparacionData = [
      ['COMPARACION DE PERIODOS'],
      [],
      ['Metrica', 'Periodo Anterior', 'Periodo Actual', 'Variacion (%)'],
      [
        'Ventas Totales',
        datos.periodo_anterior.total_ventas,
        datos.periodo_actual.total_ventas,
        datos.variaciones.ventas_porcentaje
      ],
      [
        'Transacciones',
        datos.periodo_anterior.total_transacciones,
        datos.periodo_actual.total_transacciones,
        datos.variaciones.transacciones_porcentaje
      ],
      [
        'Ticket Promedio',
        datos.periodo_anterior.ticket_promedio,
        datos.periodo_actual.ticket_promedio,
        datos.variaciones.ticket_porcentaje
      ],
      [
        'Total Clientes',
        datos.periodo_anterior.total_clientes,
        datos.periodo_actual.total_clientes,
        datos.variaciones.clientes_porcentaje
      ]
    ];

    const comparacionSheet = XLSX.utils.aoa_to_sheet(comparacionData);
    XLSX.utils.book_append_sheet(workbook, comparacionSheet, 'Comparacion');
  }

  // ============================================================================
  // HOJA 3: PROYECCIÓN FUTURA
  // ============================================================================
  
  if (incluirProyeccion) {
    const proyeccionData = [
      ['PROYECCION DE VENTAS FUTURAS (3 MESES)'],
      [],
      ['Mes', 'Escenario Pesimista', 'Escenario Base', 'Escenario Optimista'],
      ...datos.proyeccion_futura.map(item => [
        item.mes,
        item.pesimista,
        item.proyectado,
        item.optimista
      ])
    ];

    const proyeccionSheet = XLSX.utils.aoa_to_sheet(proyeccionData);
    XLSX.utils.book_append_sheet(workbook, proyeccionSheet, 'Proyeccion Futura');
  }

  // ============================================================================
  // HOJA 4: COMPARACIÓN MENSUAL HISTÓRICA
  // ============================================================================
  
  if (datos.comparacion_mensual && datos.comparacion_mensual.length > 0) {
    const mensualData = [
      ['COMPARACION MENSUAL HISTORICA'],
      [],
      ['Mes', 'Periodo Anterior', 'Periodo Actual', 'Variacion (%)'],
      ...datos.comparacion_mensual.map(item => [
        item.mes,
        item.periodo_anterior,
        item.periodo_actual,
        ((item.periodo_actual - item.periodo_anterior) / item.periodo_anterior * 100).toFixed(2)
      ])
    ];

    const mensualSheet = XLSX.utils.aoa_to_sheet(mensualData);
    XLSX.utils.book_append_sheet(workbook, mensualSheet, 'Comparacion Mensual');
  }

  // Guardar Excel
  XLSX.writeFile(workbook, nombreArchivo);
};

// ============================================================================
// FUNCIÓN PRINCIPAL DE EXPORTACIÓN
// ============================================================================

export const exportarProyecciones = async (
  datos: DatosComparacion,
  formato: 'pdf' | 'excel',
  moneda: string = 'BOB',
  opciones: Partial<OpcionesExportacion> = {}
): Promise<void> => {
  try {
    if (formato === 'pdf') {
      await exportarProyeccionPDF(datos, moneda, opciones);
    } else if (formato === 'excel') {
      await exportarProyeccionExcel(datos, moneda, opciones);
    } else {
      throw new Error(`Formato no soportado: ${formato}`);
    }
  } catch (error) {
    console.error('Error al exportar proyecciones:', error);
    throw error;
  }
};

export type { DatosComparacion };
