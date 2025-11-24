import axios from './axios';

// ============================================
// SERVICIOS-DESCUENTOS (Políticas)
// ============================================

// Obtener todas las políticas de servicios-descuentos
export const listarServiciosDescuentos = () => axios.get('servicios-descuentos/');

// Crear una nueva política (asignar descuento a servicio)
export const crearServicioDescuento = async (data: any) => {
  try {
    console.log('🔄 API: Creando política servicio-descuento:', data);
    const response = await axios.post('servicios-descuentos/', data);
    console.log('✅ API: Política creada exitosamente:', response.data);
    return response;
  } catch (error: any) {
    console.error('❌ API: Error al crear política:', error);
    console.error('❌ API: Respuesta del servidor:', error.response?.data);
    throw error;
  }
};

// Editar una política existente
export const editarServicioDescuento = async (id: string, data: any) => {
  try {
    console.log('🔄 API: Editando política con ID:', id);
    console.log('🔄 API: Datos a enviar:', data);
    
    const response = await axios.put(`/servicios-descuentos/${id}/`, data);
    console.log('✅ API: Política editada exitosamente:', response.data);
    
    return response;
  } catch (error: any) {
    console.error('❌ API: Error al editar política:', error);
    console.error('❌ API: Respuesta del servidor:', error.response?.data);
    throw error;
  }
};

// Eliminar una política
export const eliminarServicioDescuento = async (id: string) => {
  try {
    console.log('🗑️ API: Eliminando política con ID:', id);
    const response = await axios.delete(`/servicios-descuentos/${id}/`);
    console.log('✅ API: Política eliminada exitosamente');
    return response;
  } catch (error: any) {
    console.error('❌ API: Error al eliminar política:', error);
    throw error;
  }
};

// ============================================
// SERVICIOS (para cargar lista de servicios)
// ============================================

// Obtener todos los servicios disponibles
export const listarServicios = async () => {
  try {
    console.log('🔄 API: Solicitando lista de servicios...');
    const response = await axios.get('servicios/');
    console.log('✅ API: Servicios obtenidos:', response.data);
    return response;
  } catch (error: any) {
    console.error('❌ API: Error al obtener servicios:', error);
    console.error('❌ API: Respuesta del servidor:', error.response?.data);
    throw error;
  }
};

// ============================================
// DESCUENTOS (para cargar lista de descuentos)
// ============================================

// Obtener todos los descuentos disponibles
export const listarDescuentos = async () => {
  try {
    console.log('🔄 API: Solicitando lista de descuentos...');
    const response = await axios.get('descuentos/');
    console.log('✅ API: Descuentos obtenidos:', response.data);
    return response;
  } catch (error: any) {
    console.error('❌ API: Error al obtener descuentos:', error);
    console.error('❌ API: Respuesta del servidor:', error.response?.data);
    throw error;
  }
};

// Crear un nuevo descuento/cupón
export const crearDescuento = async (data: any) => {
  try {
    console.log('🔄 API: Creando descuento:', data);
    const response = await axios.post('descuentos/', data);
    console.log('✅ API: Descuento creado exitosamente:', response.data);
    return response;
  } catch (error: any) {
    console.error('❌ API: Error al crear descuento:', error);
    console.error('❌ API: Respuesta del servidor:', error.response?.data);
    throw error;
  }
};