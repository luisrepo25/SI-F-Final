// src/api/recomendaciones.ts
const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export interface ItemRecomendacion {
  categoria: string;
  items: string[];
  prioridad: "alta" | "media" | "baja" | string;
}

export interface RecomendacionEquipaje {
  texto: string;
  items: ItemRecomendacion[];
}

export interface RecomendacionResponseBySession {
  recommendation?: RecomendacionEquipaje;   // <- clave que devuelve tu backend por session_id
  session_id: string;
  error?: string;
}

export async function obtenerRecomendacionPorSession(sessionId: string): Promise<RecomendacionResponseBySession> {
  const res = await fetch(`${API}/recomendacion/?session_id=${encodeURIComponent(sessionId)}`);
  if (!res.ok) {
    throw new Error(`No disponible: HTTP ${res.status}`);
  }
  return res.json();
}
