import axios from "./axios";

export const obtenerHistorialReprogramacion = async (reservaId: number|string) => {
  const res = await axios.get(`/historial-reprogramacion/?reserva=${reservaId}`);
  return res.data;
};
