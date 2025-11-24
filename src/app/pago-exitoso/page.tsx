"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const FORCE_MOCK =
  String(process.env.NEXT_PUBLIC_FORCE_MOCK_RECO || "").toLowerCase() === "1";

type VerificarPagoResp = {
  pago_exitoso: boolean;
  cliente_email?: string | null;
  monto_total?: number;
  moneda?: string;
  payment_type?: string;
};

type ItemRecomendacion = {
  categoria: string;
  items: string[];
  prioridad: "alta" | "media" | "baja" | string;
};

type RecomendacionEquipaje = {
  texto: string;
  items: ItemRecomendacion[];
};

type RecomCacheResp = {
  recommendation?: RecomendacionEquipaje;
  session_id?: string;
  error?: string;
};

function PagoExitosoContent() {
  const search = useSearchParams();
  const sessionId = useMemo(() => search.get("session_id") || "", [search]);
  const mockFlag = useMemo(
    () => search.get("mock") === "1" || FORCE_MOCK,
    [search]
  );

  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<
    "checking" | "paid" | "unpaid" | "error"
  >("checking");
  const [msg, setMsg] = useState<string>("");
  const [reco, setReco] = useState<RecomendacionEquipaje | null>(null);

  useEffect(() => {
    (async () => {
      if (!sessionId) {
        setStatus("error");
        setMsg("No se encontró la sesión de pago.");
        setLoading(false);
        return;
      }

      try {
        // DEMO/MOCK
        if (mockFlag) {
          setStatus("paid");
          setReco({
            texto:
              "¡Listo! Estas son sugerencias generales para tu viaje. Ajusta según clima y tipo de actividad.",
            items: [
              {
                categoria: "Ropa",
                items: [
                  "Campera ligera",
                  "2 polos",
                  "1 pantalón cómodo",
                  "Gorra",
                ],
                prioridad: "media",
              },
              {
                categoria: "Documentos",
                items: ["CI/Pasaporte", "Voucher de reserva"],
                prioridad: "alta",
              },
              {
                categoria: "Equipo",
                items: ["Lentes de sol", "Bloqueador", "Botella reutilizable"],
                prioridad: "media",
              },
              {
                categoria: "Otros",
                items: ["Snacks", "Power bank"],
                prioridad: "baja",
              },
            ],
          });
          setLoading(false);
          return;
        }

        // 1) Verificar pago (backend real)
        const res = await fetch(
          `${API}/verificar-pago/?session_id=${encodeURIComponent(sessionId)}`
        );
        if (!res.ok)
          throw new Error(`Error verificando pago: HTTP ${res.status}`);
        const data: VerificarPagoResp = (await res.json()) as VerificarPagoResp;

        if (!data.pago_exitoso) {
          setStatus("unpaid");
          setMsg("El pago aún no figura como confirmado.");
          setLoading(false);
          return;
        }
        setStatus("paid");

        // 2) Polling para traer la recomendación que genera el webhook
        let encontrada = false;
        for (let i = 0; i < 12; i++) {
          const r = await fetch(
            `${API}/recomendacion/?session_id=${encodeURIComponent(sessionId)}`
          );
          if (r.ok) {
            const json = (await r.json()) as RecomCacheResp;
            if (json?.recommendation) {
              setReco(json.recommendation);
              encontrada = true;
              setMsg("");
              break;
            }
          }
          await new Promise((ok) => setTimeout(ok, 1500));
        }

        if (!encontrada) {
          setMsg(
            "Aún no llegó la recomendación. Recarga esta página en unos segundos."
          );
        }
      } catch (e: unknown) {
        setStatus("error");
        const m =
          e instanceof Error ? e.message : "Error procesando el resultado.";
        setMsg(m);
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId, mockFlag]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 max-w-2xl w-full">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl sm:text-2xl font-bold text-green-700">
            Pago exitoso
          </h1>
          <span
            className={`text-xs px-2 py-1 rounded ${
              status === "paid"
                ? "bg-green-100 text-green-700"
                : status === "checking"
                ? "bg-amber-100 text-amber-700"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {status === "paid"
              ? "OK"
              : status === "checking"
              ? "Verificando"
              : "Error"}
          </span>
        </div>

        <p className="text-xs text-gray-500 mb-4 select-all">
          Session ID: <code>{sessionId || "(sin id)"}</code>
        </p>

        {/* Resumen */}
        <div className="rounded-lg border bg-white">
          <div className="border-b p-4 font-medium">Resumen</div>
          <div className="p-4 space-y-4">
            {loading && (
              <div className="rounded-md bg-amber-50 border border-amber-200 text-amber-800 p-3">
                Verificando tu pago…
              </div>
            )}

            {!loading && status === "error" && (
              <div className="rounded-md bg-rose-50 border border-rose-200 text-rose-800 p-3">
                Ocurrió un error
                <div className="text-xs opacity-80 mt-1">{msg}</div>
              </div>
            )}

            {!loading && status === "unpaid" && (
              <div className="rounded-md bg-amber-50 border border-amber-200 text-amber-800 p-3">
                El pago no está confirmado todavía.
              </div>
            )}

            {/* Recomendación */}
            {status === "paid" && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">
                  Recomendación de equipaje
                </h2>

                {!reco && (
                  <div className="text-gray-600 text-sm">
                    Generando recomendación… {msg && <span>({msg})</span>}
                  </div>
                )}

                {reco && (
                  <div className="space-y-3">
                    <p className="text-gray-700">{reco.texto}</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {reco.items.map((cat, i) => (
                        <div key={i} className="border rounded-md p-3">
                          <div className="font-medium mb-1">
                            {cat.categoria}{" "}
                            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 ml-1">
                              {cat.prioridad}
                            </span>
                          </div>
                          <ul className="text-sm list-disc pl-5 text-gray-700">
                            {cat.items.map((it, j) => (
                              <li key={j}>{it}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Link
                href="/panel"
                className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-white font-medium hover:bg-green-700 transition"
              >
                Ir a mi panel
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-md bg-gray-200 px-4 py-2 text-gray-900 font-medium hover:bg-gray-300 transition"
              >
                Ir al inicio
              </Link>
            </div>
          </div>
        </div>

        {/* Nota mock */}
        {(mockFlag || FORCE_MOCK) && (
          <p className="text-[11px] text-gray-500 mt-3">
            *Modo demo activo. Para datos reales, desactiva{" "}
            <code>NEXT_PUBLIC_FORCE_MOCK_RECO</code> y usa un{" "}
            <code>session_id</code> real.
          </p>
        )}
      </div>
    </div>
  );
}

export default function PagoExitosoPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <PagoExitosoContent />
    </Suspense>
  );
}
