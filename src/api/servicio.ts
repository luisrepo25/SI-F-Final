import api from './axios';

export const listarServicios = async (params?: Record<string, any>) => {
  try {
    const response = await api.get('/servicios/', { params });
    // The axios response object has the data in the `data` property
    return response.data;
  } catch (err: any) {
    console.error('Error listar servicios', err);
    throw err;
  }
};

export const listarServiciosPorId = async (params: { id?: number; proveedor?: number; estado?: string }) => {
  try {
    const response = await api.get('/servicios/', { params });
    // The axios response object has the data in the `data` property
    return response.data;
  } catch (err: any) {
    console.error('Error listar servicios por id', err);
    throw err;
  }
};

export const crearServicio = async (servicio: Record<string, any>) => {
  const response = await api.post('/servicios/', servicio);
  return response.data;
};

export const actualizarServicio = async (id: number, servicio: Record<string, any>) => {
  const response = await api.patch(`/servicios/${id}/`, servicio);
  return response.data;
};

export const cambiarEstadoServicio = async (id: number, nuevoEstado: string) => {
  const response = await api.patch(`/servicios/${id}/`, { estado: nuevoEstado });
  return response.data;
};