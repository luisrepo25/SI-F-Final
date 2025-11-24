"use client";
import React, { useEffect, useState } from "react";
// helper: formatea fecha ISO a 'YYYY-MM-DD HH:mm'
function formatDate(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}
import { listBitacora, BitacoraItem } from "@/api/bitacora";
import { useToast } from "@/hooks/use-toast";

export default function AdminBitacora() {
  const [items, setItems] = useState<BitacoraItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [count, setCount] = useState<number | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [filterUsuario, setFilterUsuario] = useState("");
  const [filterAccion, setFilterAccion] = useState("");
  const [filterDesde, setFilterDesde] = useState("");
  const [filterHasta, setFilterHasta] = useState("");
  const { toast } = useToast();

  const fetchPage = async (p = 1) => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page: p,
        page_size: pageSize,
        // ordenar por fecha descendente por defecto
        ordering: "-created_at",
      };

      if (filterUsuario) params.usuario = filterUsuario;
      if (filterAccion) params.accion = filterAccion;
      if (filterDesde) params.created_at_after = filterDesde;
      if (filterHasta) params.created_at_before = filterHasta;

      const res = await listBitacora(params);
      const data = res.data;

      // DRF style: { count, next, previous, results }
      const sortDescByDate = (arr: BitacoraItem[]) => {
        return arr.sort((a, b) => {
          const da = new Date(a.created_at_local || a.created_at || 0).getTime();
          const db = new Date(b.created_at_local || b.created_at || 0).getTime();
          return db - da;
        });
      };

      if (Array.isArray(data)) {
        const sorted = sortDescByDate(data as BitacoraItem[]);
        setItems(sorted);
        setCount(sorted.length);
        setHasNext(false);
        setHasPrevious(false);
      } else {
        const results = (data.results || []) as BitacoraItem[];
        const sorted = sortDescByDate(results);
        setItems(sorted);
        setCount(typeof data.count === "number" ? data.count : sorted.length);
        setHasNext(!!data.next);
        setHasPrevious(!!data.previous);
      }
    } catch (err) {
      console.error("[Bitacora] fetch failed", err);
      toast({ title: "No se pudo cargar la bitácora", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(page);
  }, [page]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Bitácora del sistema</h3>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Orden: Fecha (desc)</span>
      </div>
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 items-center">
              <input
                placeholder="Usuario (nombre o email)"
                value={filterUsuario}
                onChange={(e) => setFilterUsuario(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchPage(1)}
                className="border px-2 py-1 rounded"
              />
          <input
            placeholder="Acción"
            value={filterAccion}
            onChange={(e) => setFilterAccion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchPage(1)}
            className="border px-2 py-1 rounded"
          />
          <input
            type="date"
            placeholder="Desde"
            value={filterDesde}
            onChange={(e) => setFilterDesde(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchPage(1)}
            className="border px-2 py-1 rounded"
          />
          <input
            type="date"
            placeholder="Hasta"
            value={filterHasta}
            onChange={(e) => setFilterHasta(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchPage(1)}
            className="border px-2 py-1 rounded"
          />
          <button
            onClick={() => fetchPage(1)}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Aplicar filtros
          </button>
          <button
            onClick={() => fetchPage(page)}
            disabled={loading}
            className="px-3 py-1 bg-green-500 text-white rounded ml-2 disabled:opacity-50"
          >
            Refrescar
          </button>
          {loading && <div className="ml-4">Cargando...</div>}
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="min-w-full text-sm text-left whitespace-nowrap">
            <thead>
              <tr>
                <th className="px-3 py-2">Fecha</th>
                <th className="px-3 py-2">Usuario</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Acción</th>
                <th className="px-3 py-2">Descripción</th>
                <th className="px-3 py-2">IP</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={String(it.id)} className="border-t">
                  <td className="px-3 py-2">{formatDate(it.created_at_local || it.created_at)}</td>
                  <td className="px-3 py-2">{it.usuario_nombre || '-'}</td>
                  <td className="px-3 py-2">{it.actor_email || '-'}</td>
                  <td className="px-3 py-2">{it.accion || '-'}</td>
                  <td className="px-3 py-2 max-w-[36rem] truncate" title={it.descripcion || ''}>{it.descripcion || ''}</td>
                  <td className="px-3 py-2">{it.ip_address || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 bg-gray-100 rounded mr-2"
            disabled={!hasPrevious && page === 1}
          >
            Anterior
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 bg-gray-100 rounded"
            disabled={!hasNext}
          >
            Siguiente
          </button>
        </div>
        <div className="text-sm text-gray-500">
          Página {page} {count !== null ? `- ${count} registros` : ""}
        </div>
      </div>
    </div>
  );
}
