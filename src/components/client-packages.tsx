'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Package, Calendar, Users, Tag, Info, ExternalLink } from 'lucide-react';
import { obtenerMisPaquetes } from '@/api/cliente-panel';

// Interfaz flexible para ambos tipos de paquetes
interface PaqueteAdquirido {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  precio?: number;
  participantes?: number;
  imagen?: string;
  tipo?: string;
  precio_base?: string;
  created_at?: string;
  duracion?: string;
}

export default function ClientPackages() {
  const [paquetes, setPaquetes] = useState<PaqueteAdquirido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPaquetes = async () => {
      try {
        setLoading(true);
        const data = await obtenerMisPaquetes();
        console.log('✅ Paquetes activos obtenidos:', data);
        setPaquetes(data);
      } catch (err) {
        setError('No se pudieron cargar tus paquetes. Intenta de nuevo más tarde.');
        console.error("❌ Error al obtener mis paquetes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaquetes();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Fecha no especificada';
    try {
      const date = new Date(dateString);
      // Comprobar si la fecha es válida
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC', // Usar UTC para evitar problemas de zona horaria
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  if (loading) {
    return <div className="text-center py-12">Cargando tus paquetes...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <Info className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      {paquetes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tienes paquetes</h3>
          <p className="mt-1 text-sm text-gray-500">Cuando compres un paquete, aparecerá aquí.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paquetes.map((paquete) => {
            // Lógica para normalizar datos de paquetes normales y personalizados
            const esPersonalizado = paquete.nombre.startsWith('Paquete Personalizado');
            const precioFinal = paquete.precio ?? (paquete.precio_base ? parseFloat(paquete.precio_base) : 0);
            const fechaCompra = paquete.created_at;
            const participantes = paquete.participantes || 1; // Asumir 1 si no viene
            const tipo = paquete.tipo || (esPersonalizado ? 'Personalizado' : 'Paquete');
            const duracion = paquete.duracion || 'No especificada';

            // Extraer el ID de la reserva del nombre del paquete para la navegación
            let idParaDetalle = paquete.id;
            if (esPersonalizado) {
              const match = paquete.nombre.match(/#(\d+)/);
              if (match && match[1]) {
                idParaDetalle = parseInt(match[1], 10);
              }
            }

            return (
              <Card key={paquete.id} className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold leading-tight">{paquete.nombre}</CardTitle>
                    <Badge variant={paquete.estado === 'Activo' ? 'default' : 'secondary'}>
                      {paquete.estado}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 pt-1">{tipo}</p>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{paquete.descripcion}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                      <span>{formatDate(paquete.fecha_inicio)} - {formatDate(paquete.fecha_fin)}</span>
                    </div>
                     <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                      <span>{participantes} participante(s)</span>
                    </div>
                    <div className="flex items-center">
                       <Info className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                       <span>Duración: {duracion}</span>
                    </div>
                    <div className="flex items-center font-bold text-lg pt-2">
                      <Tag className="w-4 h-4 mr-2 text-gray-500" />
                      <span>Bs. {precioFinal.toFixed(2)}</span>
                    </div>
                    {fechaCompra && (
                      <p className="text-xs text-gray-500 pt-2">Comprado el {formatDate(fechaCompra)}</p>
                    )}
                  </div>
                </CardContent>
                <div className="p-4 pt-2">
                  <Button onClick={() => router.push(`/reservas/${idParaDetalle}`)} className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver Detalle de la Reserva
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}