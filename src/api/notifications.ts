import api from "./axios";

export interface Notificacion {
  id: number;
  usuario: number;
  tipo: string;
  datos: any;
  leida: boolean;
  created_at: string;
}

export const listNotifications = async () => {
  return api.get("/notificaciones/");
};

export const markNotificationRead = async (id: number) => {
  return api.post(`/notificaciones/${id}/mark_read/`);
};

export default { listNotifications, markNotificationRead };
