/**
 * Tarjeta con lista de destinatarios
 * Incluye búsqueda y scroll
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { Destinatario } from '@/api/campanas';

interface ListaDestinatariosProps {
  destinatarios: Destinatario[];
  totalDestinatarios: number;
}

export default function ListaDestinatarios({
  destinatarios,
  totalDestinatarios,
}: ListaDestinatariosProps) {
  const [busqueda, setBusqueda] = useState('');

  const destinatariosFiltrados = destinatarios.filter((dest) => {
    if (!busqueda) return true;
    const termino = busqueda.toLowerCase();
    return (
      dest.nombre.toLowerCase().includes(termino) ||
      dest.email.toLowerCase().includes(termino)
    );
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>👥 Destinatarios ({destinatarios.length})</CardTitle>
          {destinatarios.length < totalDestinatarios && (
            <span className="text-sm text-gray-500">
              Mostrando primeros {destinatarios.length}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Buscador */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Lista */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {destinatariosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron destinatarios
            </div>
          ) : (
            destinatariosFiltrados.map((destinatario) => (
              <div
                key={destinatario.id}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {destinatario.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {destinatario.nombre}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {destinatario.email}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="text-sm text-gray-500 capitalize">
                    {destinatario.rol}
                  </div>
                  {destinatario.tiene_dispositivo_fcm ? (
                    <span className="text-xs text-green-600">✓ FCM</span>
                  ) : (
                    <span className="text-xs text-orange-600">⚠ Sin FCM</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
