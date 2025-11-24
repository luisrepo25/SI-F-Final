import axios from "./axios";

// Obtener reglas activas de reprogramación
export const obtenerReglasReprogramacion = async () => {
  const res = await axios.get("/reglas-reprogramacion/?activa=true&aplicable_a=CLIENTE");
  return res.data;
};

// Obtener configuraciones globales de reprogramación
export const obtenerConfiguracionesReprogramacion = async () => {
  const res = await axios.get("/configuracion-global-reprogramacion/?activa=true");
  return res.data;
};
