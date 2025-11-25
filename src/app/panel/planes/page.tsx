"use client";
import React, { useEffect, useState } from "react";
import {
  listarPlanes,
  crearPlan,
  editarPlan,
  toggleEstadoPlan,
} from "@/api/plan";
import { Plan } from "@/api/plan";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus, CheckCircle, XCircle } from "lucide-react";

const defaultForm: Partial<Plan> = {
  nombre: "",
  descripcion: "",
  precio: "",
  duracion: "mensual",
  max_servicios: 0,
  max_clientes_potenciales: 0,
  chat_directo: false,
  estadisticas_basicas: false,
  posicionamiento_destacado: false,
  panel_metricas_avanzado: false,
  promociones_temporada: false,
  soporte_prioritario: false,
  difusion_internacional: false,
  base_datos_viajeros_premium: false,
  sello_verificado: false,
  consultoria_marketing: false,
  campanas_promocionales: false,
  destacado: false,
  orden: 1,
  activo: true,
};

export default function PlanesPage() {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Plan>>(defaultForm);

  useEffect(() => {
    fetchPlanes();
  }, []);

  async function fetchPlanes() {
    setLoading(true);
    try {
      const res = await listarPlanes();
      setPlanes(res.data.results || res.data || []);
    } catch (err) {
      toast({ title: "Error al cargar planes", variant: "destructive" });
    }
    setLoading(false);
  }

  function openForm(plan?: Plan) {
    if (plan) {
      setEditId(plan.id);
      setForm({ ...plan });
    } else {
      setEditId(null);
      setForm(defaultForm);
    }
    setView('form');
  }

  function closeForm() {
    setView('list');
    setEditId(null);
    setForm(defaultForm);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSwitch(name: keyof Plan, value: boolean) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editId) {
        await editarPlan(editId, form);
        toast({ title: "Plan actualizado" });
      } else {
        await crearPlan(form);
        toast({ title: "Plan creado" });
      }
      closeForm();
      fetchPlanes();
    } catch (err) {
      toast({ title: "Error al guardar", variant: "destructive" });
    }
  }

  async function handleToggleActivo(plan: Plan) {
    try {
      await toggleEstadoPlan(plan.id, !plan.activo);
      toast({ title: `Plan ${!plan.activo ? "activado" : "desactivado"}` });
      fetchPlanes();
    } catch {
      toast({ title: "Error al cambiar estado", variant: "destructive" });
    }
  }

  return (
    <div className="container mx-auto py-8 m-2">
      {view === 'list' && (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-blue-700">Gestión de Planes</h1>
            <Button onClick={() => openForm()} className="flex gap-2">
              <Plus size={18} /> Nuevo plan
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {loading ? (
              <div className="col-span-3 text-center py-12">Cargando...</div>
            ) : planes.length === 0 ? (
              <div className="col-span-3 text-center py-12">
                No hay planes disponibles
              </div>
            ) : (
              planes.map((plan) => (
                <Card
                  key={plan.id}
                  className="shadow-lg border-2 border-blue-100 hover:border-blue-400 transition-all"
                >
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl font-bold text-blue-700">
                        {plan.nombre}
                      </CardTitle>
                      {plan.activo ? (
                        <Badge className="bg-green-600">Activo</Badge>
                      ) : (
                        <Badge className="bg-gray-400">Inactivo</Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mt-2">{plan.descripcion}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl font-bold text-blue-700">
                        Bs. {plan.precio}
                      </span>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-400">
                        {plan.duracion}
                      </Badge>
                    </div>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>
                        <b>Servicios:</b>{" "}
                        {plan.max_servicios === 0
                          ? "Ilimitados"
                          : plan.max_servicios}
                      </li>
                      <li>
                        <b>Clientes potenciales:</b>{" "}
                        {plan.max_clientes_potenciales === 0
                          ? "Ilimitados"
                          : plan.max_clientes_potenciales}
                      </li>
                      <li>
                        <b>Chat directo:</b>{" "}
                        {plan.chat_directo ? (
                          <CheckCircle
                            className="inline text-green-600"
                            size={16}
                          />
                        ) : (
                          <XCircle className="inline text-gray-400" size={16} />
                        )}
                      </li>
                      <li>
                        <b>Estadísticas básicas:</b>{" "}
                        {plan.estadisticas_basicas ? (
                          <CheckCircle
                            className="inline text-green-600"
                            size={16}
                          />
                        ) : (
                          <XCircle className="inline text-gray-400" size={16} />
                        )}
                      </li>
                      <li>
                        <b>Posicionamiento destacado:</b>{" "}
                        {plan.posicionamiento_destacado ? (
                          <CheckCircle
                            className="inline text-green-600"
                            size={16}
                          />
                        ) : (
                          <XCircle className="inline text-gray-400" size={16} />
                        )}
                      </li>
                      <li>
                        <b>Panel métricas avanzado:</b>{" "}
                        {plan.panel_metricas_avanzado ? (
                          <CheckCircle
                            className="inline text-green-600"
                            size={16}
                          />
                        ) : (
                          <XCircle className="inline text-gray-400" size={16} />
                        )}
                      </li>
                      <li>
                        <b>Promociones temporada:</b>{" "}
                        {plan.promociones_temporada ? (
                          <CheckCircle
                            className="inline text-green-600"
                            size={16}
                          />
                        ) : (
                          <XCircle className="inline text-gray-400" size={16} />
                        )}
                      </li>
                      <li>
                        <b>Soporte prioritario:</b>{" "}
                        {plan.soporte_prioritario ? (
                          <CheckCircle
                            className="inline text-green-600"
                            size={16}
                          />
                        ) : (
                          <XCircle className="inline text-gray-400" size={16} />
                        )}
                      </li>
                      <li>
                        <b>Difusión internacional:</b>{" "}
                        {plan.difusion_internacional ? (
                          <CheckCircle
                            className="inline text-green-600"
                            size={16}
                          />
                        ) : (
                          <XCircle className="inline text-gray-400" size={16} />
                        )}
                      </li>
                      <li>
                        <b>Base datos viajeros premium:</b>{" "}
                        {plan.base_datos_viajeros_premium ? (
                          <CheckCircle
                            className="inline text-green-600"
                            size={16}
                          />
                        ) : (
                          <XCircle className="inline text-gray-400" size={16} />
                        )}
                      </li>
                      <li>
                        <b>Sello verificado:</b>{" "}
                        {plan.sello_verificado ? (
                          <CheckCircle
                            className="inline text-green-600"
                            size={16}
                          />
                        ) : (
                          <XCircle className="inline text-gray-400" size={16} />
                        )}
                      </li>
                      <li>
                        <b>Consultoría marketing:</b>{" "}
                        {plan.consultoria_marketing ? (
                          <CheckCircle
                            className="inline text-green-600"
                            size={16}
                          />
                        ) : (
                          <XCircle className="inline text-gray-400" size={16} />
                        )}
                      </li>
                      <li>
                        <b>Campañas promocionales:</b>{" "}
                        {plan.campanas_promocionales ? (
                          <CheckCircle
                            className="inline text-green-600"
                            size={16}
                          />
                        ) : (
                          <XCircle className="inline text-gray-400" size={16} />
                        )}
                      </li>
                      <li>
                        <b>Destacado:</b>{" "}
                        {plan.destacado ? (
                          <CheckCircle
                            className="inline text-green-600"
                            size={16}
                          />
                        ) : (
                          <XCircle className="inline text-gray-400" size={16} />
                        )}
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openForm(plan)}
                      className="flex gap-1"
                    >
                      <Pencil size={16} /> Editar
                    </Button>
                    <Switch
                      checked={plan.activo}
                      onCheckedChange={() => handleToggleActivo(plan)}
                    />
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </>
      )}
      {view === 'form' && (
        <div className="w-full max-w-[100vw] h-[95vh] overflow-y-auto p-8 rounded-2xl bg-white shadow-xl border border-gray-100">
          <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`p-2 rounded-lg ${
                  editId
                    ? "bg-blue-500/10 text-blue-600"
                    : "bg-green-500/10 text-green-600"
                }`}
              >
                {editId ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                )}
              </div>
              <span className="text-2xl font-light text-gray-900">
                {editId ? "Editar plan" : "Crear nuevo plan"}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={closeForm}
              className="rounded-xl px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Volver
            </Button>
          </div>
          <div className="text-gray-500 mb-4 mt-2">
            {editId
              ? "Actualiza la información del plan existente"
              : "Configura un nuevo plan de suscripción para proveedores"}
          </div>
          <form onSubmit={handleSubmit} className="space-y-8 py-4">
            {/* Información Básica */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-gray-50/50 rounded-2xl">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Información básica
                </h3>
                <p className="text-sm text-gray-500">
                  Detalles principales del plan
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Nombre del plan *
                    </Label>
                    <Input
                      name="nombre"
                      value={form.nombre || ""}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Ej: Plan Premium Empresarial"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Descripción
                    </Label>
                    <textarea
                      name="descripcion"
                      value={form.descripcion || ""}
                      onChange={handleChange}
                      rows={3}
                      className="w-full rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-blue-500 px-3 py-2 text-sm"
                      placeholder="Describe los beneficios principales del plan..."
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Precio y Configuración */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-gray-50/50 rounded-2xl">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                  Precio y configuración
                </h3>
                <p className="text-sm text-gray-500">
                  Establece el costo y duración
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Precio (Bs.) *
                    </Label>
                    <Input
                      name="precio"
                      type="number"
                      step="0.01"
                      value={form.precio || ""}
                      onChange={handleChange}
                      required
                      className="rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Duración *
                    </Label>
                    <select
                      name="duracion"
                      value={form.duracion || ""}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-gray-200 focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="mensual">Mensual</option>
                      <option value="trimestral">Trimestral</option>
                      <option value="semestral">Semestral</option>
                      <option value="anual">Anual</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Orden
                    </Label>
                    <Input
                      type="number"
                      name="orden"
                      value={form.orden ?? 1}
                      onChange={handleChange}
                      className="rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500"
                      min="1"
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Límites y Capacidades */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-gray-50/50 rounded-2xl">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-purple-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Límites y capacidades
                </h3>
                <p className="text-sm text-gray-500">
                  Configura los límites del plan
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Servicios máx.
                    </Label>
                    <Input
                      type="number"
                      name="max_servicios"
                      value={form.max_servicios ?? 0}
                      onChange={handleChange}
                      className="rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                      min="0"
                    />
                    <p className="text-xs text-gray-400 mt-1">0 = ilimitados</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Clientes potenciales
                    </Label>
                    <Input
                      type="number"
                      name="max_clientes_potenciales"
                      value={form.max_clientes_potenciales ?? 0}
                      onChange={handleChange}
                      className="rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                      min="0"
                    />
                    <p className="text-xs text-gray-400 mt-1">0 = ilimitados</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Características y Beneficios */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-gray-50/50 rounded-2xl">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-amber-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Características incluidas
                </h3>
                <p className="text-sm text-gray-500">
                  Activa las funcionalidades del plan
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: "chat_directo", label: "Chat directo", icon: "💬" },
                    {
                      key: "estadisticas_basicas",
                      label: "Estadísticas básicas",
                      icon: "📊",
                    },
                    {
                      key: "posicionamiento_destacado",
                      label: "Posicionamiento destacado",
                      icon: "⭐",
                    },
                    {
                      key: "panel_metricas_avanzado",
                      label: "Métricas avanzadas",
                      icon: "📈",
                    },
                    {
                      key: "promociones_temporada",
                      label: "Promociones temporada",
                      icon: "🎁",
                    },
                    {
                      key: "soporte_prioritario",
                      label: "Soporte prioritario",
                      icon: "🛟",
                    },
                    {
                      key: "difusion_internacional",
                      label: "Difusión internacional",
                      icon: "🌎",
                    },
                    {
                      key: "base_datos_viajeros_premium",
                      label: "Base datos premium",
                      icon: "💎",
                    },
                    {
                      key: "sello_verificado",
                      label: "Sello verificado",
                      icon: "✅",
                    },
                    {
                      key: "consultoria_marketing",
                      label: "Consultoría marketing",
                      icon: "🎯",
                    },
                    {
                      key: "campanas_promocionales",
                      label: "Campañas promocionales",
                      icon: "🚀",
                    },
                    { key: "destacado", label: "Plan destacado", icon: "👑" },
                    { key: "activo", label: "Plan activo", icon: "🔛" },
                  ].map((feature) => (
                    <div
                      key={feature.key}
                      className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{feature.icon}</span>
                        <span className="text-sm font-medium text-gray-700">
                          {feature.label}
                        </span>
                      </div>
                      <Switch
                        checked={!!form[feature.key]}
                        onCheckedChange={(v) => handleSwitch(feature.key, v)}
                        className="data-[state=checked]:bg-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={closeForm}
                className="rounded-xl px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="rounded-xl px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {editId ? "Guardar cambios" : "Crear plan"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
