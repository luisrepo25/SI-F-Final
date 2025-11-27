import axios from './axios';

// Crear un pago real (Stripe)
export const crearPago = async (data: any) => {
  try {
    console.log('🚀 API: Enviando pago real al backend');
    console.log('🚀 API: URL:', 'pagos/');
    console.log('🚀 API: Datos a enviar:', JSON.stringify(data, null, 2));
    console.log("Hola desde pagos")
    const response = await axios.post('/pagos/', data);
    
    console.log('✅ API: Respuesta exitosa');
    console.log('✅ API: Status:', response.status);
    console.log('✅ API: Data:', response.data);
    
    return response;
  } catch (error: any) {
    console.error('❌ API: Error al crear pago:', error);
    throw error;
  }
};
