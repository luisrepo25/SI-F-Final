import api from "./axios";

export interface BitacoraItem {
  id: number | string;
  usuario?: number | string;
  usuario_nombre?: string;
  actor_email?: string;
  accion?: string;
  descripcion?: string;
  ip_address?: string;
  created_at?: string; // UTC
  created_at_local?: string; // timezone-aware string if backend provides it
}

export const listBitacora = async (params?: Record<string, any>) => {
  // params can include page, page_size, filters
  return api.get("/bitacora/", { params });
};

export const getBitacoraEntry = async (id: string | number) => {
  return api.get(`/bitacora/${id}/`);
};
