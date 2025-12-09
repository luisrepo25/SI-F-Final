
'use client';

import { useEffect, useState } from 'react';
import { obtenerHistorial } from '@/api/visita-reciente';
import useAuth from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, DollarSign } from 'lucide-react';// Tipado para el detalle del servicio
interface ServicioDetalle {
  id: number;
  titulo: string;
  precio_usd: string;
  imagen_url: string;
}

// Tipado para el historial de visitas
interface Visita {
  id: number;
  servicio_detalle: ServicioDetalle;
}

const HistorialRecientePage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const handleVisitaClick = (servicioId: number) => {
    router.push(`/destinos/${servicioId}`);
  };

  useEffect(() => {
    const fetchHistorial = async () => {
      if (!authLoading && user) {
        try {
          setLoading(true);
          console.log(`📋 Obteniendo historial de visitas para usuario: ${user.id}`);
          const data = await obtenerHistorial();
          console.log(`✅ Historial obtenido:`, data);
          setVisitas(data || []);
          setError(null);
        } catch (err: any) {
          console.error('❌ Error al obtener historial:', err);
          if (err?.response?.status === 404) {
            setError('La funcionalidad de historial de visitas aún no está disponible. Por favor, intenta más tarde.');
          } else {
            setError('No se pudo cargar el historial. Inténtalo de nuevo más tarde.');
          }
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else if (!authLoading) {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, [user, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando tu historial...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-gray-700 mb-6">{error}</p>
          <button 
            onClick={() => router.push('/')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <p className="text-gray-700 mb-6">Debes iniciar sesión para ver tu historial de visitas.</p>
          <Link href="/login" className="inline-block w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  if (visitas.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
        <div className="flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">📍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Sin Historial</h2>
            <p className="text-gray-600 mb-6">Aún no has visitado ningún servicio. ¡Comienza a explorar!</p>
            <button 
              onClick={() => router.push('/destinos')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors mb-3"
            >
              Explorar Destinos
            </button>
            <button 
              onClick={() => router.push('/')}
              className="w-full flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <ArrowLeft size={18} />
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 py-8 md:py-12">
      {/* Botón de volver */}
      <div className="container mx-auto px-4 mb-6">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
        >
          <ArrowLeft size={20} />
          Volver al Inicio
        </button>
      </div>

      {/* Header */}
      <div className="container mx-auto px-4 mb-8 md:mb-12">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">Vistos Recientemente</h1>
          <p className="text-gray-600 text-lg">
            {visitas.length} {visitas.length === 1 ? 'servicio visitado' : 'servicios visitados'}
          </p>
        </div>
      </div>

      {/* Grid de servicios */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {visitas.map((visita) => (
            <div
              key={visita.id}
              onClick={() => handleVisitaClick(visita.servicio_detalle.id)}
              className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105 transform"
            >
              {/* Imagen */}
              <div className="relative w-full h-48 md:h-56 overflow-hidden bg-gray-100">
                <Image
                  src={Array.isArray(visita.servicio_detalle.imagen_url) ? visita.servicio_detalle.imagen_url[0] : visita.servicio_detalle.imagen_url || '/placeholder.svg'}
                  alt={visita.servicio_detalle.titulo}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* Contenido */}
              <div className="p-4 md:p-5">
                <h3 className="text-lg md:text-base font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {visita.servicio_detalle.titulo}
                </h3>

                {/* Precio */}
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign size={18} className="text-green-500" />
                  <p className="text-xl md:text-lg font-bold text-green-600">
                    {visita.servicio_detalle.precio_usd}
                  </p>
                  <span className="text-sm text-gray-500">USD</span>
                </div>

                {/* Botón */}
                <button 
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
                >
                  Ver Detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer con botón de volver */}
      <div className="container mx-auto px-4 mt-12 md:mt-16">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => router.push('/destinos')}
            className="px-6 md:px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            Explorar Más Destinos
          </button>
          <button 
            onClick={() => router.push('/')}
            className="px-6 md:px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistorialRecientePage;
