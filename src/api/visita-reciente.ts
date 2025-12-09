

import api from './axios';

// Registrar una nueva visita a un servicio
export const registrarVisita = async (servicioId: number) => {
  try {
    const response = await api.post('historial-visitas/', {
      servicio_id: servicioId,
    });
    console.log('✅ Visita registrada:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al registrar la visita:', error);
    throw error;
  }
};

// Obtener el historial de visitas del usuario
export const obtenerHistorial = async () => {
  try {
    const response = await api.get('historial-visitas/');
    console.log('✅ Historial de visitas obtenido:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener el historial de visitas:', error);
    throw error;
  }
};

