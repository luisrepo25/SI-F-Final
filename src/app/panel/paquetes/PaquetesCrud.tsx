// components/PaqueteCrud.tsx
import React, { useEffect, useState, useContext } from "react";
import {
  listarPaquetesPorId,
  crearPaquete,
  actualizarPaquete,
  cambiarEstadoPaquete,
  PaqueteCRUD
} from "@/api/paquetes-crud";
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
  MapPin,
  Clock,
  Users,
  DollarSign,
  Activity,
  Power,
  Calendar,
  Star,
} from "lucide-react";
import { AuthContext } from "@/context/AuthContext";

// Función para obtener proveedor por id
const fetchProveedor = async (
  id: number
): Promise<{ id: number; nombre: string } | null> => {
  try {
    return { id, nombre: `Proveedor ${id}` };
  } catch {
    return null;
  }
};

export default function PaqueteCrud() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const [paquetes, setPaquetes] = useState<PaqueteCRUD[]>([]);
  const [proveedoresCache, setProveedoresCache] = useState<
    Record<number, string>
  >({});
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<PaqueteCRUD>({
    nombre: "",
    descripcion: "",
    duracion: "",
    es_personalizado: false,
    proveedor:  Number(user?.id) || 1,
    precio_base: 0,
    precio_bob: 0,
    cupos_disponibles: 20,
    cupos_ocupados: 0,
    fecha_inicio: "",
    fecha_fin: "",
    estado: "Activo",
    destacado: false,
    punto_salida: "",
    incluye: [],
    no_incluye: [],
    departamento: "",
    ciudad: "",
    tipo_destino: "",
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const fetchPaquetes = async () => {
    setLoading(true);
    try {
      const res = await listarPaquetesPorId({ proveedor: Number(user?.id) || 1 });
      console.log("🔍 Respuesta completa paquetes:", res);

      const paquetesRaw = Array.isArray(res.data) ? res.data : [];
      console.log("🔍 Paquetes raw:", paquetesRaw);

      // Buscar proveedores si solo viene el id
      const proveedoresIds = paquetesRaw
        .map((p: PaqueteCRUD) => p.proveedor)
        .filter((id): id is number => id !== undefined && id !== null)
        .filter((id, idx, arr) => arr.indexOf(id) === idx);

      const proveedoresMap: Record<number, string> = { ...proveedoresCache };

      for (const id of proveedoresIds) {
        if (!proveedoresMap[id]) {
          const proveedor = await fetchProveedor(id);
          if (proveedor) {
            proveedoresMap[id] = proveedor.nombre;
          }
        }
      }

      setProveedoresCache(proveedoresMap);
      setPaquetes(paquetesRaw);
    } catch (error) {
      console.error("Error fetching paquetes:", error);
      setPaquetes([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPaquetes();
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

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setForm((f) => ({ ...f, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await actualizarPaquete(editId, form);
      } else {
        await crearPaquete(form);
      }
      setOpen(false);
      setEditId(null);
      resetForm();
      fetchPaquetes();
    } catch (error) {
      console.error("Error al guardar paquete:", error);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setForm({
      nombre: "",
      descripcion: "",
      duracion: "",
      es_personalizado: false,
      proveedor: Number(user?.id) || 1,
      precio_base: 0,
      precio_bob: 0,
      cupos_disponibles: 20,
      cupos_ocupados: 0,
      fecha_inicio: "",
      fecha_fin: "",
      estado: "Activo",
      destacado: false,
      punto_salida: "",
      incluye: [],
      no_incluye: [],
      departamento: "",
      ciudad: "",
      tipo_destino: "",
    });
  };

  const handleEdit = (paquete: PaqueteCRUD) => {
    setEditId(paquete.id!);
    setForm(paquete);
    setOpen(true);
  };

  const handleToggleEstado = async (paquete: PaqueteCRUD) => {
    const nuevoEstado = paquete.estado === 'Activo' ? 'Inactivo' : 'Activo';
    const accion = nuevoEstado === 'Inactivo' ? 'desactivar' : 'activar';
    
    if (!confirm(`¿Estás seguro de que quieres ${accion} este paquete?`))
      return;

    setLoading(true);
    try {
      await cambiarEstadoPaquete(paquete.id!, nuevoEstado);
      fetchPaquetes();
    } catch (error) {
      console.error("Error al cambiar estado del paquete:", error);
    }
    setLoading(false);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Activo":
        return <Badge variant="default" className="bg-green-100 text-green-800">Activo</Badge>;
      case "Inactivo":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactivo</Badge>;
      case "Agotado":
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Agotado</Badge>;
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  const getTipoDestinoBadge = (tipo: string) => {
    const colors: Record<string, string> = {
      'Cultural': 'bg-purple-100 text-purple-800',
      'Natural': 'bg-green-100 text-green-800',
      'Aventura': 'bg-orange-100 text-orange-800',
      'Rural': 'bg-amber-100 text-amber-800',
      'Urbano': 'bg-blue-100 text-blue-800',
    };
    
    return (
      <Badge variant="outline" className={colors[tipo] || 'bg-gray-100 text-gray-800'}>
        {tipo}
      </Badge>
    );
  };

  const calcularCuposRestantes = (paquete: PaqueteCRUD) => {
    return paquete.cupos_disponibles - paquete.cupos_ocupados;
  };

  return (
    <div className="min-h-screen bg-gray-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Paquetes Turísticos
            </h1>
            <p className="text-gray-600 mt-2">
              Gestiona todos los paquetes y experiencias combinadas
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
                Nuevo Paquete
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {editId ? "Editar Paquete" : "Crear Nuevo Paquete"}
                </DialogTitle>
              </DialogHeader>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre del Paquete</Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      placeholder="Ej: Aventura en la Selva"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select
                      value={form.estado}
                      onValueChange={(value) => handleSelectChange("estado", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Activo">Activo</SelectItem>
                        <SelectItem value="Inactivo">Inactivo</SelectItem>
                        <SelectItem value="Agotado">Agotado</SelectItem>
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
                      placeholder="Ej: 3 días, 1 semana"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="precio_base">Precio Base (USD)</Label>
                    <Input
                      id="precio_base"
                      name="precio_base"
                      type="number"
                      step="0.01"
                      value={form.precio_base}
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cupos_disponibles">Cupos Disponibles</Label>
                    <Input
                      id="cupos_disponibles"
                      name="cupos_disponibles"
                      type="number"
                      value={form.cupos_disponibles}
                      onChange={handleChange}
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo_destino">Tipo de Destino</Label>
                    <Select
                      value={form.tipo_destino}
                      onValueChange={(value) => handleSelectChange("tipo_destino", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cultural">Cultural</SelectItem>
                        <SelectItem value="Natural">Natural</SelectItem>
                        <SelectItem value="Aventura">Aventura</SelectItem>
                        <SelectItem value="Rural">Rural</SelectItem>
                        <SelectItem value="Urbano">Urbano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fecha_inicio">Fecha Inicio</Label>
                    <Input
                      id="fecha_inicio"
                      name="fecha_inicio"
                      type="date"
                      value={form.fecha_inicio}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fecha_fin">Fecha Fin</Label>
                    <Input
                      id="fecha_fin"
                      name="fecha_fin"
                      type="date"
                      value={form.fecha_fin}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="punto_salida">Punto de Salida</Label>
                  <Input
                    id="punto_salida"
                    name="punto_salida"
                    value={form.punto_salida}
                    onChange={handleChange}
                    placeholder="Lugar de partida del paquete"
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
                      placeholder="Departamento principal"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ciudad">Ciudad</Label>
                    <Input
                      id="ciudad"
                      name="ciudad"
                      value={form.ciudad}
                      onChange={handleChange}
                      placeholder="Ciudad principal"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción del Paquete</Label>
                  <Textarea
                    id="descripcion"
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    placeholder="Describe detalladamente el paquete turístico, incluyendo actividades, servicios incluidos y experiencias únicas..."
                    rows={4}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="destacado"
                    name="destacado"
                    checked={form.destacado}
                    onChange={(e) => handleCheckboxChange("destacado", e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="destacado" className="text-sm font-medium">
                    Marcar como paquete destacado
                  </Label>
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
                      : "Crear Paquete"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Paquetes Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {paquetes.map((paquete) => (
              <Card
                key={paquete.id}
                className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-sm"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {paquete.nombre}
                      {paquete.destacado && (
                        <Star className="w-4 h-4 text-yellow-500 inline ml-1 fill-current" />
                      )}
                    </CardTitle>
                    <div className="flex gap-2">
                      {getEstadoBadge(paquete.estado)}
                      {paquete.tipo_destino && getTipoDestinoBadge(paquete.tipo_destino)}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {paquete.descripcion}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>{paquete.duracion}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <DollarSign className="w-4 h-4 text-amber-600" />
                      <span>USD {paquete.precio_base}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Users className="w-4 h-4 text-green-600" />
                      <span>
                        Cupos: {calcularCuposRestantes(paquete)}/{paquete.cupos_disponibles}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span>
                        {new Date(paquete.fecha_inicio).toLocaleDateString()} - {new Date(paquete.fecha_fin).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-start gap-2 text-sm text-gray-700">
                      <MapPin className="w-4 h-4 text-red-600 mt-0.5" />
                      <span className="flex-1">{paquete.punto_salida}</span>
                    </div>

                    {(paquete.departamento || paquete.ciudad) && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Activity className="w-4 h-4 text-purple-600" />
                        <span>
                          {paquete.ciudad}
                          {paquete.ciudad && paquete.departamento && ", "}
                          {paquete.departamento}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="text-xs text-gray-500">
                      Proveedor:{" "}
                      {proveedoresCache[paquete.proveedor as number] || `ID: ${paquete.proveedor}`}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(paquete)}
                        className="h-8 px-3"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant={paquete.estado === 'Activo' ? "outline" : "default"}
                        onClick={() => handleToggleEstado(paquete)}
                        className={`h-8 px-3 ${
                          paquete.estado === 'Activo' 
                            ? 'border-orange-500 text-orange-600 hover:bg-orange-50' 
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        <Power className="w-3 h-3 mr-1" />
                        {paquete.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {paquetes.length === 0 && !loading && (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay paquetes
            </h3>
            <p className="text-gray-500 mb-4">
              Comienza creando tu primer paquete turístico
            </p>
            <Button
              onClick={() => setOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Paquete
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}