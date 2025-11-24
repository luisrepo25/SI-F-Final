/**
 * Selector de usuarios con FCM activo para campañas
 * Permite buscar y seleccionar usuarios que tienen tokens FCM registrados
 * Endpoint: /api/usuarios/con_fcm/
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import api from '@/api/axios';

interface Usuario {
  id: number;
  nombre: string;
  email: string;  // Backend devuelve email PLANO
  rol: string;    // Backend devuelve rol PLANO (string)
  telefono?: string;
  num_viajes?: number;
  total_dispositivos_fcm?: number;  // Backend devuelve este campo
  rubro?: string;
  fecha_nacimiento?: string;
  genero?: string;
  documento_identidad?: string;
  pais?: string;
}

interface UsuarioSelectorProps {
  seleccionados: number[];
  onChange: (ids: number[]) => void;
}

export default function UsuarioSelector({ seleccionados, onChange }: UsuarioSelectorProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      // ✅ Endpoint ACTUALIZADO: Solo usuarios con FCM activo
      const response = await api.get('/usuarios/con_fcm/');
      
      console.log('📊 UsuarioSelector: Datos recibidos del backend:', response.data);
      
      // ✅ Compatible con ambas estructuras: "count" o "total"
      const totalUsuarios = response.data.count || response.data.total || 0;
      console.log('📊 UsuarioSelector: Total usuarios con FCM:', totalUsuarios);
      
      // ✅ Estructura nueva: {count|total, usuarios}
      const listaUsuarios = response.data.usuarios || [];
      
      console.log('📊 UsuarioSelector: Cantidad de usuarios:', listaUsuarios.length);
      
      // Ver estructura del primer usuario
      if (listaUsuarios.length > 0) {
        console.log('🔍 Estructura del primer usuario:', listaUsuarios[0]);
        console.log('🔍 Campos disponibles:', Object.keys(listaUsuarios[0]));
      }
      
      // Filtrar usuarios válidos (con los campos necesarios)
      const usuariosValidos = listaUsuarios.filter(
        (u: any) => {
          const esValido = u && u.id && u.nombre && u.email && u.rol;
          if (!esValido) {
            console.warn('⚠️ Usuario inválido filtrado:', {
              tiene_id: !!u?.id,
              tiene_nombre: !!u?.nombre,
              tiene_email: !!u?.email,
              tiene_rol: !!u?.rol,
              campos: u ? Object.keys(u) : 'null'
            });
          }
          return esValido;
        }
      );
      
      console.log('✅ UsuarioSelector: Usuarios válidos:', usuariosValidos.length);
      console.log('✅ UsuarioSelector: Primer usuario:', usuariosValidos[0]);
      
      // ⚠️ Alerta si no hay usuarios con FCM
      if (usuariosValidos.length === 0 && !cargando) {
        console.warn('⚠️ No hay usuarios con notificaciones habilitadas. Usuarios deben instalar y abrir la app móvil.');
      }
      
      setUsuarios(usuariosValidos);
    } catch (error: any) {
      console.error('❌ Error cargando usuarios con FCM:', error);
      // Mostrar error más descriptivo según la guía
      if (error.response?.status === 401) {
        console.error('❌ Token de autenticación inválido o expirado');
        console.error('🔄 Serás redirigido al login en un momento...');
        // El interceptor de axios ya maneja la redirección
      } else if (error.response?.status === 404) {
        console.error('❌ Endpoint no encontrado. Verificar URL del backend');
      } else {
        console.error('❌ Error de conexión. Verificar internet o estado del backend');
      }
    } finally {
      setCargando(false);
    }
  };

  const usuariosFiltrados = usuarios.filter((usuario) => {
    // Validar que el usuario no sea null y tenga las propiedades requeridas
    if (!usuario || !usuario.nombre || !usuario.email || !usuario.rol) {
      return false;
    }

    const terminoBusqueda = busqueda.toLowerCase();
    
    return (
      usuario.nombre.toLowerCase().includes(terminoBusqueda) ||
      usuario.email.toLowerCase().includes(terminoBusqueda) ||
      usuario.rol.toLowerCase().includes(terminoBusqueda)
    );
  });

  const toggleUsuario = (id: number) => {
    if (seleccionados.includes(id)) {
      onChange(seleccionados.filter((uid) => uid !== id));
    } else {
      onChange([...seleccionados, id]);
    }
  };

  const seleccionarTodos = () => {
    onChange(usuariosFiltrados.map((u) => u.id));
  };

  const limpiarSeleccion = () => {
    onChange([]);
  };

  const usuariosSeleccionadosInfo = usuarios.filter((u) => 
    u && u.id && seleccionados.includes(u.id)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">👤 Seleccionar Usuarios con Notificaciones Activas</CardTitle>
        <CardDescription>
          Selecciona usuarios que tienen la app instalada y pueden recibir notificaciones push
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumen de selección */}
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
          <span className="text-sm font-medium">
            {seleccionados.length} usuario{seleccionados.length !== 1 ? 's' : ''} seleccionado{seleccionados.length !== 1 ? 's' : ''}
          </span>
          {seleccionados.length > 0 && (
            <button
              type="button"
              onClick={limpiarSeleccion}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Barra de búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre, email o rol..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Acciones rápidas */}
        {usuariosFiltrados.length > 0 && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={seleccionarTodos}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Seleccionar todos ({usuariosFiltrados.length})
            </button>
          </div>
        )}

        {/* Lista de usuarios */}
        {cargando ? (
          <div className="text-center py-8 text-gray-500">
            Cargando usuarios con notificaciones activas...
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {busqueda 
              ? 'No se encontraron usuarios con notificaciones activas que coincidan con la búsqueda' 
              : 'No hay usuarios con notificaciones activas disponibles. Los usuarios deben tener la app instalada y haber iniciado sesión.'}
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-2">
            {usuariosFiltrados.map((usuario) => {
              const estaSeleccionado = seleccionados.includes(usuario.id);

              return (
                <div
                  key={usuario.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition ${
                    estaSeleccionado
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Checkbox
                    checked={estaSeleccionado}
                    onCheckedChange={() => toggleUsuario(usuario.id)}
                  />
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => toggleUsuario(usuario.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {usuario.nombre}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {usuario.rol}
                      </Badge>
                      {/* Mostrar cantidad de dispositivos FCM */}
                      {(() => {
                        const cantidadDispositivos = usuario.total_dispositivos_fcm || 0;
                        return cantidadDispositivos > 0 && (
                          <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-900/20">
                            📱 {cantidadDispositivos} dispositivo{cantidadDispositivos > 1 ? 's' : ''}
                          </Badge>
                        );
                      })()}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {usuario.email}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Usuarios seleccionados (tags) */}
        {usuariosSeleccionadosInfo.length > 0 && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium mb-2">Usuarios seleccionados:</p>
            <div className="flex flex-wrap gap-2">
              {usuariosSeleccionadosInfo
                .filter(usuario => usuario && usuario.nombre) // Validar usuario no null
                .map((usuario) => (
                <Badge
                  key={usuario.id}
                  variant="secondary"
                  className="pl-2 pr-1 py-1"
                >
                  <span className="text-xs">{usuario.nombre}</span>
                  <button
                    type="button"
                    onClick={() => toggleUsuario(usuario.id)}
                    className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
