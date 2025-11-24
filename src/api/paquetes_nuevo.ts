// Archivo eliminado por reinicio de funcionalidad de paquetes
import axios from './axios';

// Listar todos los servicios disponibles
export const listarServicios = async () => {
  console.log('🔄 API: Solicitando lista de servicios...');
  const response = await axios.get('servicios/');
  console.log('✅ API: Servicios obtenidos:', response.data);
  return response;
};

// Listar todos los paquetes disponibles
export const listarPaquetes = async () => {
  console.log('🔄 API: Solicitando lista de paquetes...');
  const response = await axios.get('paquetes/');
  console.log('✅ API: Paquetes obtenidos:', response.data);
  return response;
};

// Obtener un servicio específico por ID
export const obtenerServicio = async (id: string | number) => {
  console.log('🎯 API: Obteniendo servicio ID:', id);
  const response = await axios.get(`servicios/${id}/`);
  console.log('✅ API: Servicio obtenido:', response.data);
  return response;
};

// Obtener un paquete específico por ID
export const obtenerPaquete = async (id: string | number) => {
  console.log('📦 API: Obteniendo paquete ID:', id);
  const response = await axios.get(`paquetes/${id}/`);
  console.log('✅ API: Paquete obtenido:', response.data);
  return response;
};

// Detectar si un ID corresponde a un paquete o servicio
export const detectarTipoServicio = async (id: string | number) => {
  try {
    // Intentar obtener como paquete primero
    try {
      const paqueteResponse = await obtenerPaquete(id);
      if (paqueteResponse.data) {
        return {
          tipo: 'paquete',
          data: paqueteResponse.data
        };
      }
    } catch (error) {
      // Si falla, intentar como servicio
      console.log('📦 No es un paquete, intentando como servicio...');
    }

    // Intentar obtener como servicio
    const servicioResponse = await obtenerServicio(id);
    if (servicioResponse.data) {
      return {
        tipo: 'servicio',
        data: servicioResponse.data
      };
    }
  } catch (error) {
    console.error('❌ Error al detectar tipo de servicio:', error);
    throw error;
  }
};

// Preparar payload para reservar un SERVICIO INDIVIDUAL
export const prepararReservaServicio = (servicio: any, cantidadPersonas: number = 1) => {
  console.log('🎯 Preparando reserva para SERVICIO:', {
    id: servicio.id,
    titulo: servicio.titulo,
    costo: servicio.costo
  });

  const costoTotal = parseFloat(servicio.costo) * cantidadPersonas;

  return {
    total: costoTotal.toFixed(2),
    moneda: "BOB",
    detalles: [{
      servicio: servicio.id,
      cantidad: cantidadPersonas,
      precio_unitario: servicio.costo.toString(),
      fecha_servicio: new Date().toISOString()
    }]
  };
};

// Preparar payload para reservar un PAQUETE con precio total del paquete
export const prepararReservaPaquete = async (paquete: any, cantidadPersonas: number = 1) => {
  console.log('📦 Preparando reserva para PAQUETE:', {
    id: paquete.id,
    nombre: paquete.nombre,
    precio_por_persona: paquete.precio,
    cantidad_personas: cantidadPersonas,
    servicios_incluidos: paquete.servicios
  });

  // CRUCIAL: Usar el precio total del paquete (precio por persona * cantidad)
  const precioPorPersona = parseFloat(paquete.precio);
  const totalPaquete = precioPorPersona * cantidadPersonas;

  // ESTRATEGIA DEFINITIVA: Obtener servicios y usar el primero como "contenedor"
  const serviciosResponse = await listarServicios();
  const todosLosServicios = serviciosResponse.data;
  const detalles: any[] = [];

  if (paquete.servicios && paquete.servicios.length > 0) {
    // Usamos el primer servicio como "contenedor" pero con precio del paquete
    const servicioContenedor = todosLosServicios.find((s: any) => s.id === paquete.servicios[0]);
    
    if (servicioContenedor) {
      detalles.push({
        servicio: servicioContenedor.id, // Usar servicio existente como contenedor
        cantidad: cantidadPersonas,
        precio_unitario: precioPorPersona.toFixed(2), // PRECIO DEL PAQUETE, NO DEL SERVICIO
        fecha_servicio: new Date().toISOString()
      });
      
      console.log('🚀 PAQUETE CONFIGURADO - PRECIO FORZADO:', {
        servicio_contenedor: servicioContenedor.id,
        titulo_servicio: servicioContenedor.titulo,
        precio_servicio_original: servicioContenedor.costo,
        precio_paquete_FORZADO: precioPorPersona.toFixed(2),
        mensaje: `Backend DEBE usar precio ${precioPorPersona.toFixed(2)}, NO ${servicioContenedor.costo}`
      });
    } else {
      console.error('❌ No se encontró el servicio contenedor');
    }
  } else {
    console.error('❌ Paquete sin servicios asociados');
  }

  console.log('📦 Paquete procesado CORRECTAMENTE:', {
    precio_por_persona_mostrado: paquete.precio,
    cantidad_personas: cantidadPersonas,
    total_paquete_calculado: totalPaquete.toFixed(2),
    metodo: 'PRECIO_TOTAL_PAQUETE_FORZADO'
  });

  return {
    total: totalPaquete.toFixed(2),
    moneda: "BOB",
    detalles
  };
};