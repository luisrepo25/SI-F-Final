import React, { useEffect, useState, useContext } from "react";
import {
  listarServiciosPorId,
  crearServicio,
  actualizarServicio,
} from "@/api/servicio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Activity,
  Power,
} from "lucide-react";
import { AuthContext } from "@/context/AuthContext";

interface Servicio {
  id?: number;
  titulo: string;
  descripcion: string;
  duracion: string;
  capacidad_max: number;
  punto_encuentro: string;
  estado: string;
  categoria?: number;
  proveedor?: number | { id: number; nombre: string };
  imagen_url?: string;
  precio_usd?: number;
  servicios_incluidos?: string[];
  departamento?: string;
  ciudad?: string;
}

// Función para obtener proveedor por id
const fetchProveedor = async (
  id: number
): Promise<{ id: number; nombre: string } | null> => {
  try {
    // Solución temporal - ajusta según tu API real
    return { id, nombre: `Proveedor ${id}` };

    // Si tienes un endpoint real de proveedores, descomenta esto:
    // const res = await fetch(`/api/proveedores/${id}/`);
    // if (!res.ok) return null;
    // const data = await res.json();
    // return { id: data.id, nombre: data.nombre || data.nombre_empresa || "Proveedor" };
  } catch {
    return null;
  }
};

// Función para cambiar estado del servicio
const cambiarEstadoServicio = async (id: number, nuevoEstado: string) => {
  const url = `api/servicios/${id}/`;
  return fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      estado: nuevoEstado
    })
  });
};

export default function ServicioCrud() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [proveedoresCache, setProveedoresCache] = useState<
    Record<number, string>
  >({});
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Servicio>({
    titulo: "",
    descripcion: "",
    duracion: "",
    capacidad_max: 1,
    punto_encuentro: "",
    estado: "Activo",
    proveedor: user?.id || 1,
    precio_usd: 0,
    servicios_incluidos: [],
    departamento: "",
    ciudad: "",
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const fetchServicios = async () => {
    setLoading(true);
    try {
      const res = await listarServiciosPorId({ proveedor: user?.id || 1 });
      console.log("🔍 Respuesta completa:", res);

      // CORRECCIÓN: La API devuelve el array directamente, no en res.data
      const serviciosRaw = Array.isArray(res) ? res : res.data || [];
      console.log("🔍 Servicios raw:", serviciosRaw);

      // Buscar proveedores si solo viene el id
      const proveedoresIds = serviciosRaw
        .map((s: Servicio) =>
          typeof s.proveedor === "number" ? s.proveedor : null
        )
        .filter((id): id is number => id !== null)
        .filter((id, idx, arr) => arr.indexOf(id) === idx);

      console.log("🔍 IDs de proveedores encontrados:", proveedoresIds);

      const proveedoresMap: Record<number, string> = { ...proveedoresCache };

      // Obtener nombres de proveedores
      for (const id of proveedoresIds) {
        if (!proveedoresMap[id]) {
          const proveedor = await fetchProveedor(id);
          if (proveedor) {
            proveedoresMap[id] = proveedor.nombre;
          }
        }
      }

      setProveedoresCache(proveedoresMap);
      setServicios(serviciosRaw);
      console.log("🔍 Servicios finales para mostrar:", serviciosRaw);
    } catch (error) {
      console.error("Error fetching servicios:", error);
      setServicios([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServicios();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await actualizarServicio(editId, form);
      } else {
        await crearServicio(form);
      }
      setOpen(false);
      setEditId(null);
      resetForm();
      fetchServicios();
    } catch (error) {
      console.error("Error al guardar servicio:", error);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setForm({
      titulo: "",
      descripcion: "",
      duracion: "",
      capacidad_max: 1,
      punto_encuentro: "",
      estado: "Activo",
      proveedor: user?.id || 1,
      precio_usd: 0,
      servicios_incluidos: [],
      departamento: "",
      ciudad: "",
    });
  };

  const handleEdit = (servicio: Servicio) => {
    setEditId(servicio.id!);
    setForm(servicio);
    setOpen(true);
  };

  // Función para cambiar estado entre Activo/Inactivo
  const handleToggleEstado = async (servicio: Servicio) => {
    const nuevoEstado = servicio.estado === 'Activo' ? 'Inactivo' : 'Activo';
    const accion = nuevoEstado === 'Inactivo' ? 'desactivar' : 'activar';
    
    if (!confirm(`¿Estás seguro de que quieres ${accion} este servicio?`))
      return;

    setLoading(true);
    try {
      await cambiarEstadoServicio(servicio.id!, nuevoEstado);
      fetchServicios();
    } catch (error) {
      console.error("Error al cambiar estado del servicio:", error);
    }
    setLoading(false);
  };

  const getEstadoBadge = (estado: string) => {
    return estado === "Activo" ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Activo
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
        Inactivo
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Servicios Turísticos
            </h1>
            <p className="text-gray-600 mt-2">
              Gestiona todos los servicios y experiencias disponibles
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditId(null);
                  resetForm();
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Servicio
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {editId ? "Editar Servicio" : "Crear Nuevo Servicio"}
                </DialogTitle>
              </DialogHeader>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título del Servicio</Label>
                    <Input
                      id="titulo"
                      name="titulo"
                      value={form.titulo}
                      onChange={handleChange}
                      placeholder="Ej: Tour por la Montaña Mágica"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select
                      value={form.estado}
                      onValueChange={(value) =>
                        handleSelectChange("estado", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Activo">Activo</SelectItem>
                        <SelectItem value="Inactivo">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duracion">Duración</Label>
                    <Input
                      id="duracion"
                      name="duracion"
                      value={form.duracion}
                      onChange={handleChange}
                      placeholder="Ej: 3 horas, 2 días"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capacidad_max">Capacidad Máxima</Label>
                    <Input
                      id="capacidad_max"
                      name="capacidad_max"
                      type="number"
                      value={form.capacidad_max}
                      onChange={handleChange}
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="precio_usd">Precio (USD)</Label>
                    <Input
                      id="precio_usd"
                      name="precio_usd"
                      type="number"
                      step="0.01"
                      value={form.precio_usd}
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="punto_encuentro">Punto de Encuentro</Label>
                  <Input
                    id="punto_encuentro"
                    name="punto_encuentro"
                    value={form.punto_encuentro}
                    onChange={handleChange}
                    placeholder="Dirección o punto específico"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="departamento">Departamento</Label>
                    <Input
                      id="departamento"
                      name="departamento"
                      value={form.departamento}
                      onChange={handleChange}
                      placeholder="Departamento"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ciudad">Ciudad</Label>
                    <Input
                      id="ciudad"
                      name="ciudad"
                      value={form.ciudad}
                      onChange={handleChange}
                      placeholder="Ciudad"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    placeholder="Describe detalladamente el servicio, incluyendo actividades, experiencias y características únicas..."
                    rows={4}
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading
                      ? "Guardando..."
                      : editId
                      ? "Actualizar"
                      : "Crear Servicio"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {servicios.map((servicio) => (
              <Card
                key={servicio.id}
                className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-sm"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {servicio.titulo}
                    </CardTitle>
                    {getEstadoBadge(servicio.estado)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {servicio.descripcion}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>{servicio.duracion}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Users className="w-4 h-4 text-green-600" />
                      <span>Capacidad: {servicio.capacidad_max} personas</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <DollarSign className="w-4 h-4 text-amber-600" />
                      <span>USD {servicio.precio_usd}</span>
                    </div>

                    <div className="flex items-start gap-2 text-sm text-gray-700">
                      <MapPin className="w-4 h-4 text-red-600 mt-0.5" />
                      <span className="flex-1">{servicio.punto_encuentro}</span>
                    </div>

                    {(servicio.departamento || servicio.ciudad) && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Activity className="w-4 h-4 text-purple-600" />
                        <span>
                          {servicio.ciudad}
                          {servicio.ciudad && servicio.departamento && ", "}
                          {servicio.departamento}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="text-xs text-gray-500">
                      Proveedor:{" "}
                      {typeof servicio.proveedor === "object"
                        ? servicio.proveedor.nombre
                        : proveedoresCache[servicio.proveedor as number] ||
                          `ID: ${servicio.proveedor}`}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(servicio)}
                        className="h-8 px-3"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {servicios.length === 0 && !loading && (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay servicios
            </h3>
            <p className="text-gray-500 mb-4">
              Comienza creando tu primer servicio turístico
            </p>
            <Button
              onClick={() => setOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Servicio
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}