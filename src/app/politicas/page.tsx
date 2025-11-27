// src/app/politicas/page.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface Politica {
  id: number;
  titulo: string;
  tipo: string;
  tipo_display: string;
  contenido: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// Datos estáticos como fallback
const politicasEstaticas: Politica[] = [
  {
    id: 1,
    titulo: 'Términos y Condiciones de Uso',
    tipo: 'terms',
    tipo_display: 'Términos y Condiciones',
    contenido: `TÉRMINOS Y CONDICIONES DE USO

1. ACEPTACIÓN
Al utilizar nuestro sitio web, usted acepta cumplir con estos términos y condiciones.

2. USO DEL SERVICIO
- Debe ser mayor de 18 años para realizar reservas
- La información proporcionada debe ser veraz y actualizada
- No está permitido usar el servicio para actividades ilegales

3. RESERVAS Y PAGOS
- Todas las reservas están sujetas a disponibilidad
- Los precios pueden cambiar sin previo aviso
- El pago completo confirma la reserva
- Se emitirá comprobante electrónico por cada transacción

4. MODIFICACIONES Y CANCELACIONES
- Las modificaciones están sujetas a disponibilidad
- Políticas de cancelación específicas por paquete
- Consulte las condiciones antes de reservar`,
    activo: true,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  },
  {
    id: 2,
    titulo: 'Política de Privacidad',
    tipo: 'privacy',
    tipo_display: 'Política de Privacidad',
    contenido: `POLÍTICA DE PRIVACIDAD Y PROTECCIÓN DE DATOS

1. INFORMACIÓN QUE RECOPILAMOS
- Datos personales: nombre, email, teléfono, documento de identidad
- Datos de reservas: fechas, destinos, preferencias
- Información de pago (procesada de forma segura)

2. USO DE LA INFORMACIÓN
- Procesar y confirmar sus reservas
- Mejorar nuestros servicios y experiencia de usuario
- Comunicaciones sobre sus viajes y promociones
- Cumplir con obligaciones legales

3. PROTECCIÓN DE DATOS
- Implementamos medidas de seguridad avanzadas
- Sus datos no se comparten con terceros sin su consentimiento
- Puede solicitar la eliminación de sus datos en cualquier momento`,
    activo: true,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  },
  {
    id: 3,
    titulo: 'Políticas de Reserva y Cancelación',
    tipo: 'reserva',
    tipo_display: 'Políticas de Reserva',
    contenido: `POLÍTICAS DE RESERVA Y CANCELACIÓN

1. PROCESO DE RESERVA
- Seleccione su paquete y fechas deseadas
- Complete el formulario con datos veraces
- Realice el pago para confirmar la reserva
- Recibirá confirmación por email

2. MODIFICACIONES
- Modificaciones sujetas a disponibilidad
- Pueden aplicar cargos por cambios
- Contacte con 48h de anticipación

3. CANCELACIONES
- 15+ días antes: Reembolso del 90%
- 8-14 días antes: Reembolso del 70%
- 3-7 días antes: Reembolso del 50%
- Menos de 3 días: No hay reembolso

4. FUERZA MAYOR
- En casos de fuerza mayor, ofrecemos reprogramación
- Consulte nuestras políticas completas`,
    activo: true,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  },
  {
    id: 4,
    titulo: 'Políticas para Proveedores',
    tipo: 'proveedor',
    tipo_display: 'Políticas para Proveedores',
    contenido: `POLÍTICAS PARA PROVEEDORES DE SERVICIOS TURÍSTICOS

1. REGISTRO Y VERIFICACIÓN
- Complete el formulario de registro con datos reales
- Proporcione documentación válida
- Su cuenta será verificada antes de la activación

2. PUBLICACIÓN DE PAQUETES
- Los paquetes deben ser veraces y actualizados
- Incluya descripciones detalladas y fotografías reales
- Los precios deben ser transparentes

3. COMISIONES Y PAGOS
- Comisión del 15% sobre cada reserva confirmada
- Pagos mensuales por reservas realizadas
- Facturación electrónica requerida

4. CALIDAD DEL SERVICIO
- Mantenga altos estándares de calidad
- Responda consultas en máximo 24 horas
- Cumpla con los servicios prometidos`,
    activo: true,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  }
];

interface TipoPolitica {
  value: string;
  label: string;
}

const tiposPolitica: TipoPolitica[] = [
  { value: '', label: 'Todas las Políticas' },
  { value: 'terms', label: 'Términos y Condiciones' },
  { value: 'privacy', label: 'Política de Privacidad' },
  { value: 'reserva', label: 'Políticas de Reserva' },
  { value: 'cancelacion', label: 'Políticas de Cancelación' },
  { value: 'proveedor', label: 'Para Proveedores' }
];

// Función para consumir la API con fallback
async function getPoliticas(tipo?: string): Promise<Politica[]> {
  try {
    let url = '/api/politicas';
    if (tipo) {
      url += `?tipo=${tipo}`;
    }
    
    console.log('Intentando cargar desde API:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Datos cargados desde API:', data);
    return data;
  } catch (error) {
    console.warn('Error con API, usando datos estáticos:', error);
    // Fallback a datos estáticos
    if (tipo) {
      return politicasEstaticas.filter(p => p.tipo === tipo && p.activo);
    }
    return politicasEstaticas.filter(p => p.activo);
  }
}

export default function PoliticasPage() {
  const [politicas, setPoliticas] = useState<Politica[]>([]);
  const [tipoFiltro, setTipoFiltro] = useState<string>('');
  const [politicaSeleccionada, setPoliticaSeleccionada] = useState<Politica | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarPoliticas();
  }, [tipoFiltro]);

  const cargarPoliticas = async (): Promise<void> => {
    setCargando(true);
    setError(null);
    try {
      const data = await getPoliticas(tipoFiltro);
      setPoliticas(data);
    } catch (error) {
      console.error('Error cargando políticas:', error);
      setError('No se pudieron cargar las políticas. Por favor, intenta más tarde.');
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (politicaSeleccionada) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => setPoliticaSeleccionada(null)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a políticas
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{politicaSeleccionada.titulo}</h1>
          
          <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              {politicaSeleccionada.tipo_display}
            </span>
            <span>Actualizado: {formatearFecha(politicaSeleccionada.fecha_actualizacion)}</span>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="prose max-w-none">
              {politicaSeleccionada.contenido.split('\n').map((parrafo: string, index: number) => (
                <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                  {parrafo.trim() || <br />}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Políticas y Términos
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Conoce nuestras políticas de reserva, cancelación, privacidad y términos de uso
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {tiposPolitica.map((tipo: TipoPolitica) => (
            <button
              key={tipo.value}
              onClick={() => setTipoFiltro(tipo.value)}
              className={`px-6 py-3 rounded-full border-2 transition-all duration-200 ${
                tipoFiltro === tipo.value
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {tipo.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {cargando ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {politicas.map((politica: Politica) => (
              <div
                key={politica.id}
                onClick={() => setPoliticaSeleccionada(politica)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-blue-300 hover:-translate-y-1"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 line-clamp-2">
                  {politica.titulo}
                </h3>
                
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full mb-4">
                  {politica.tipo_display}
                </span>
                
                <div className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {politica.contenido.split('\n')[0]}
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatearFecha(politica.fecha_actualizacion)}</span>
                  <span className="text-blue-600 font-medium">Leer más →</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!cargando && !error && politicas.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay políticas disponibles
            </h3>
            <p className="text-gray-600">
              No se encontraron políticas para el filtro seleccionado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
