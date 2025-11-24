import React, { useEffect, useState } from 'react';
import { listarCampanias, crearCampania, eliminarCampania, actualizarCampania } from '@/api/campania';
import { listarServicios } from '@/api/servicio';
import { listarServiciosCampania, agregarServicioCampania, eliminarServicioCampania } from '@/api/campania';
import { useToast } from '@/hooks/use-toast';

interface Campania {
  id: number;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  tipo_descuento: '%' | '$';
  monto: number | string;
}

export default function AdminCampanasDashboard() {
  const [campanias, setCampanias] = useState<Campania[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ descripcion: '', fecha_inicio: '', fecha_fin: '', tipo_descuento: '%', monto: '' });
  // Edit
  const [editing, setEditing] = useState<Campania | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ descripcion: '', fecha_inicio: '', fecha_fin: '', tipo_descuento: '%', monto: '' });
  const [editMethod, setEditMethod] = useState<'patch' | 'put'>('patch');
  const { toast } = useToast();

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await listarCampanias();
      const list = Array.isArray(res.data) ? res.data : (res.data?.results || res.data?.campanias || []);
      setCampanias(list);
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: 'No se pudieron listar campañas', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async () => {
    // validaciones simples
    if (!form.descripcion) return toast({ title: 'Error', description: 'Descripcion requerida', variant: 'destructive' });
    try {
      await crearCampania({ ...form, monto: form.monto || 0 });
      toast({ title: 'Creada', description: 'Campaña creada correctamente' });
      setShowCreate(false);
      setForm({ descripcion: '', fecha_inicio: '', fecha_fin: '', tipo_descuento: '%', monto: '' });
      await fetch();
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: 'No se pudo crear campaña', variant: 'destructive' });
    }
  };

  const openEdit = (c: Campania) => {
    setEditing(c);
    setEditForm({
      descripcion: c.descripcion || '',
      fecha_inicio: c.fecha_inicio || '',
      fecha_fin: c.fecha_fin || '',
      tipo_descuento: c.tipo_descuento || '%',
      monto: String(c.monto || ''),
    });
    setEditMethod('patch');
    setShowEdit(true);
  };

  const validateFormData = (data: { fecha_inicio?: string; fecha_fin?: string; monto?: any }) => {
    const { fecha_inicio, fecha_fin, monto } = data;
    if (fecha_inicio && fecha_fin) {
      if (fecha_fin < fecha_inicio) return 'La fecha de fin no puede ser anterior a la fecha de inicio.';
    }
    if (monto !== undefined && monto !== null && monto !== '') {
      const m = Number(monto);
      if (Number.isNaN(m) || m <= 0) return 'El monto debe ser un número mayor que cero.';
    }
    return null;
  };

  const handleEditSave = async () => {
    if (!editing) return;
    // Preparar payload según método
    const payload: any = {};
    if (editMethod === 'put') {
      // PUT debe enviar todos los campos (tomamos los del editForm)
      payload.descripcion = editForm.descripcion;
      payload.fecha_inicio = editForm.fecha_inicio || null;
      payload.fecha_fin = editForm.fecha_fin || null;
      payload.tipo_descuento = editForm.tipo_descuento;
      payload.monto = editForm.monto || 0;
    } else {
      // PATCH: enviar solo los campos que hayan cambiado o que no estén vacíos
      if (editForm.descripcion !== editing.descripcion) payload.descripcion = editForm.descripcion;
      if (editForm.fecha_inicio && editForm.fecha_inicio !== editing.fecha_inicio) payload.fecha_inicio = editForm.fecha_inicio;
      if (editForm.fecha_fin && editForm.fecha_fin !== editing.fecha_fin) payload.fecha_fin = editForm.fecha_fin;
      if (editForm.tipo_descuento !== editing.tipo_descuento) payload.tipo_descuento = editForm.tipo_descuento;
      if (editForm.monto !== String(editing.monto)) payload.monto = editForm.monto;
    }

    // Validación cliente
    const validationError = validateFormData({ fecha_inicio: payload.fecha_inicio ?? editForm.fecha_inicio, fecha_fin: payload.fecha_fin ?? editForm.fecha_fin, monto: payload.monto ?? editForm.monto });
    if (validationError) return toast({ title: 'Error', description: validationError, variant: 'destructive' });

    try {
      if (editMethod === 'put') {
        // usar reemplazarCampania (PUT)
        const { reemplazarCampania } = await import('@/api/campania');
        await reemplazarCampania(editing.id, payload);
      } else {
        const { actualizarCampania } = await import('@/api/campania');
        await actualizarCampania(editing.id, payload);
      }
      toast({ title: 'Guardado', description: 'Cambios guardados correctamente.' });
      setShowEdit(false);
      setEditing(null);
      await fetch();
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: 'No se pudieron guardar los cambios', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar campaña?')) return;
    try {
      await eliminarCampania(id);
      toast({ title: 'Eliminada', description: 'Campaña eliminada' });
      await fetch();
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
    }
  };

  // Servicios modal
  const [showServicios, setShowServicios] = useState(false);
  const [serviciosList, setServiciosList] = useState<any[]>([]);
  const [serviciosRelacion, setServiciosRelacion] = useState<any[]>([]);
  const [selectedServicio, setSelectedServicio] = useState<number | string | null>(null);

  const openServicios = async (c: Campania) => {
    setEditing(c);
    setShowServicios(true);
    try {
      const sAll = await listarServicios();
      const sRel = await listarServiciosCampania(c.id);
      const list = Array.isArray(sAll.data) ? sAll.data : (sAll.data?.results || sAll.data?.servicios || []);
      const listRel = Array.isArray(sRel.data) ? sRel.data : (sRel.data?.results || sRel.data || []);
      setServiciosList(list);
      setServiciosRelacion(listRel);
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: 'No se pudieron cargar servicios', variant: 'destructive' });
    }
  };

  const handleAgregarServicio = async () => {
    if (!editing || !selectedServicio) return;
    try {
      await agregarServicioCampania(editing.id, selectedServicio);
      toast({ title: 'Relacionado', description: 'Servicio agregado a la campaña' });
      const sRel = await listarServiciosCampania(editing.id);
      const listRel = Array.isArray(sRel.data) ? sRel.data : (sRel.data?.results || sRel.data || []);
      setServiciosRelacion(listRel);
      setSelectedServicio(null);
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: 'No se pudo agregar servicio', variant: 'destructive' });
    }
  };

  const handleEliminarRelacion = async (relId: number) => {
    if (!confirm('¿Eliminar relación servicio-campaña?')) return;
    try {
      await eliminarServicioCampania(relId);
      toast({ title: 'Eliminado', description: 'Relación eliminada' });
      if (editing) {
        const sRel = await listarServiciosCampania(editing.id);
        const listRel = Array.isArray(sRel.data) ? sRel.data : (sRel.data?.results || sRel.data || []);
        setServiciosRelacion(listRel);
      }
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: 'No se pudo eliminar relación', variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Campañas</h2>
        <div>
          <button className="px-3 py-2 bg-green-600 text-white rounded" onClick={() => setShowCreate(true)}>Crear campaña</button>
        </div>
      </div>

      {loading && <div className="text-sm text-gray-500">Cargando campañas...</div>}

      {!loading && campanias.length === 0 && <div className="text-sm text-gray-500">No hay campañas aún.</div>}

      {!loading && campanias.length > 0 && (
        <div className="space-y-2">
          {campanias.map(c => (
            <div key={c.id} className="p-3 bg-white rounded shadow flex items-center justify-between">
              <div>
                <div className="font-medium">{c.descripcion}</div>
                <div className="text-xs text-gray-500">{c.fecha_inicio} → {c.fecha_fin} · {c.tipo_descuento}{c.monto}</div>
              </div>
              <div className="flex gap-2">
                <button className="px-2 py-1 bg-blue-50 text-blue-700 rounded" onClick={() => openEdit(c)}>Editar</button>
                <button className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded" onClick={() => openServicios(c)}>Servicios</button>
                <button className="px-2 py-1 bg-red-50 text-red-700 rounded" onClick={() => handleDelete(c.id)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal crear */}
      {showCreate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Crear Campaña</h3>
            <div className="space-y-3">
              <input placeholder="Descripción" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} className="w-full px-3 py-2 border rounded" />
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={form.fecha_inicio} onChange={e => setForm({ ...form, fecha_inicio: e.target.value })} className="px-3 py-2 border rounded" />
                <input type="date" value={form.fecha_fin} onChange={e => setForm({ ...form, fecha_fin: e.target.value })} className="px-3 py-2 border rounded" />
              </div>
              <select value={form.tipo_descuento} onChange={e => setForm({ ...form, tipo_descuento: e.target.value as any })} className="w-full px-3 py-2 border rounded">
                <option value="%">Porcentaje (%)</option>
                <option value="$">Monto fijo ($)</option>
              </select>
              <input placeholder="Monto" value={form.monto} onChange={e => setForm({ ...form, monto: e.target.value })} className="w-full px-3 py-2 border rounded" />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-3 py-2 bg-gray-200 rounded" onClick={() => setShowCreate(false)}>Cancelar</button>
              <button className="px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded" onClick={handleCreate}>Crear</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar */}
      {showEdit && editing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Editar Campaña</h3>
            <div className="space-y-3">
              <input placeholder="Descripción" value={editForm.descripcion} onChange={e => setEditForm({ ...editForm, descripcion: e.target.value })} className="w-full px-3 py-2 border rounded" />
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={editForm.fecha_inicio} onChange={e => setEditForm({ ...editForm, fecha_inicio: e.target.value })} className="px-3 py-2 border rounded" />
                <input type="date" value={editForm.fecha_fin} onChange={e => setEditForm({ ...editForm, fecha_fin: e.target.value })} className="px-3 py-2 border rounded" />
              </div>
              <select value={editForm.tipo_descuento} onChange={e => setEditForm({ ...editForm, tipo_descuento: e.target.value as any })} className="w-full px-3 py-2 border rounded">
                <option value="%">Porcentaje (%)</option>
                <option value="$">Monto fijo ($)</option>
              </select>
              <input placeholder="Monto" value={editForm.monto} onChange={e => setEditForm({ ...editForm, monto: e.target.value })} className="w-full px-3 py-2 border rounded" />
              <div className="flex items-center gap-3">
                <label className="text-sm">Método:</label>
                <label className="inline-flex items-center"><input type="radio" name="editMethod" checked={editMethod === 'patch'} onChange={() => setEditMethod('patch')} /> PATCH</label>
                <label className="inline-flex items-center"><input type="radio" name="editMethod" checked={editMethod === 'put'} onChange={() => setEditMethod('put')} /> PUT</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-3 py-2 bg-gray-200 rounded" onClick={() => { setShowEdit(false); setEditing(null); }}>Cancelar</button>
              <button className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded" onClick={handleEditSave}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal servicios */}
      {showServicios && editing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Servicios para: {editing.descripcion}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="space-y-2">
                  {serviciosRelacion.map((r: any) => (
                    <div key={r.id} className="p-2 bg-gray-50 rounded flex items-center justify-between">
                      <div>
                        <div className="font-medium">{r.servicio?.titulo || r.servicio?.name || `Servicio ${r.servicio?.id}`}</div>
                        <div className="text-xs text-gray-500">ID: {r.servicio?.id}</div>
                      </div>
                      <div>
                        <button className="px-2 py-1 bg-red-50 text-red-700 rounded" onClick={() => handleEliminarRelacion(r.id)}>Quitar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm">Agregar servicio</label>
                <select className="w-full mt-2 px-3 py-2 border rounded" value={selectedServicio ?? ''} onChange={e => setSelectedServicio(e.target.value)}>
                  <option value="">-- seleccionar --</option>
                  {serviciosList.map(s => (
                    <option key={s.id} value={s.id}>{s.titulo || s.name || `Servicio ${s.id}`}</option>
                  ))}
                </select>
                <div className="flex gap-2 mt-3">
                  <button className="px-3 py-2 bg-gray-200 rounded" onClick={() => setShowServicios(false)}>Cerrar</button>
                  <button className="px-3 py-2 bg-green-600 text-white rounded" onClick={handleAgregarServicio}>Agregar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
