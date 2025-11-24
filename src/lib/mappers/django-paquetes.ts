// src/lib/mappers/django-paquetes.ts
// Mappers para convertir entre estructuras Django y Frontend

export interface CampaniaDjango {
  id: number;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  tipo_descuento: '%' | '$';
  monto: string;
  created_at: string;
  updated_at: string;
}

export interface ServicioDjango {
  id: number;
  titulo: string;
  descripcion: string;
  precio_bob: string;
  precio_usd: string;
  categoria: {
    id: number;
    nombre: string;
    descripcion: string;
  };
  imagen_url: string;
  activo: boolean;
  created_at: string;
}

export interface CampaniaServicioDjango {
  id: number;
  servicio: ServicioDjango;
  campania: CampaniaDjango;
  created_at: string;
}

export interface CuponDjango {
  id: number;
  nro_usos: number;
  cantidad_max: number;
  campania: CampaniaDjango;
  codigo_generado: string;
  activo: boolean;
  created_at: string;
}

// ==============================
// 🔄 MAPPERS DJANGO → FRONTEND
// ==============================

/**
 * Convierte una campaña Django a la estructura de paquete del frontend
 */
export const mapCampaniaToFrontend = (campania: CampaniaDjango, servicios?: ServicioDjango[]) => {
  // Calcular precio base desde servicios si están disponibles
  let precioCalculado = parseFloat(campania.monto || '0');
  if (servicios && servicios.length > 0) {
    const precioServicios = servicios.reduce((sum, s) => sum + parseFloat(s.precio_bob || '0'), 0);
    
    // Aplicar descuento
    if (campania.tipo_descuento === '%') {
      precioCalculado = precioServicios * (1 - parseFloat(campania.monto) / 100);
    } else {
      precioCalculado = precioServicios - parseFloat(campania.monto);
    }
  }

  const precioOriginal = campania.tipo_descuento === '%' ? 
    (precioCalculado / (1 - parseFloat(campania.monto) / 100)) : 
    (precioCalculado + parseFloat(campania.monto));

  return {
    id: campania.id.toString(),
    nombre: campania.descripcion || 'Paquete Turístico',
    ubicacion: 'Bolivia', // Por defecto
    descripcionCorta: campania.descripcion || '',
    precio: `Bs. ${Math.round(precioCalculado)}`,
    precioOriginal: campania.tipo_descuento ? `Bs. ${Math.round(precioOriginal)}` : '',
    duracion: calcularDuracion(campania.fecha_inicio, campania.fecha_fin),
    maxPersonas: 10, // Por defecto
    calificacion: 4.5, // Por defecto
    numeroReseñas: 0,
    categoria: servicios?.[0]?.categoria?.nombre || 'Aventura',
    dificultad: 'Moderada', // Por defecto
    descuento: campania.tipo_descuento === '%' ? parseFloat(campania.monto || '0') : 0,
    imagenes: servicios?.map(s => s.imagen_url).filter(Boolean) || ['/salar-de-uyuni-espejo.png'],
    fechaCreacion: campania.created_at,
    // Datos adicionales para frontend extendido
    fechaInicio: campania.fecha_inicio,
    fechaFin: campania.fecha_fin,
    tipoDescuento: campania.tipo_descuento,
    montoDescuento: campania.monto,
    // Mantener referencia Django original
    _djangoOriginal: campania,
    _servicios: servicios || []
  };
};

/**
 * Convierte un servicio Django a estructura frontend
 */
export const mapServicioToFrontend = (servicio: ServicioDjango) => ({
  id: servicio.id,
  titulo: servicio.titulo,
  descripcion: servicio.descripcion,
  precio_usd: servicio.precio_usd,
  precio_bob: servicio.precio_bob,
  categoria: servicio.categoria?.nombre || 'General',
  imagen: servicio.imagen_url || '/default-service.png',
  activo: servicio.activo,
  duracion: "1 día", // Por defecto
  calificacion: 4.5,
  ubicacion: "Bolivia",
  _djangoOriginal: servicio
});

/**
 * Mapea cupones Django a estructura frontend
 */
export const mapCuponesToFrontend = (cupones: CuponDjango[]) => {
  return cupones.map(cupon => ({
    id: cupon.id,
    codigo: cupon.codigo_generado,
    descripcion: `Descuento: ${cupon.campania.monto}${cupon.campania.tipo_descuento}`,
    usos: cupon.nro_usos,
    limite: cupon.cantidad_max,
    disponible: cupon.nro_usos < cupon.cantidad_max && cupon.activo,
    campania: cupon.campania.descripcion,
    _djangoOriginal: cupon
  }));
};

// ==============================
// 🔧 FUNCIONES AUXILIARES
// ==============================

/**
 * Calcula duración entre fechas
 */
const calcularDuracion = (fechaInicio: string, fechaFin: string): string => {
  try {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const dias = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dias <= 1) return "1 día";
    if (dias <= 7) return `${dias} días`;
    
    const semanas = Math.floor(dias / 7);
    const diasRestantes = dias % 7;
    
    if (semanas === 1 && diasRestantes === 0) return "1 semana";
    if (semanas > 1 && diasRestantes === 0) return `${semanas} semanas`;
    
    return `${dias} días`;
  } catch {
    return "1 día";
  }
};

/**
 * Obtiene imagen por defecto según categoría
 */
export const obtenerImagenPorCategoria = (categoria: string): string => {
  const imagenes: Record<string, string> = {
    'Aventura': '/bolivia-andes-trekking.png',
    'Cultural': '/tiwanaku-community.png',
    'Naturaleza': '/madidi-amazon-rainforest.png',
    'Hospedaje': '/hotel-default.png',
    'Transporte': '/transport-default.png',
    'Gastronomía': '/bolivian-food-market-cochabamba.png',
  };
  
  return imagenes[categoria] || '/salar-de-uyuni-espejo.png';
};

/**
 * Valida si una campaña está vigente
 */
export const esCampaniaVigente = (campania: CampaniaDjango): boolean => {
  const hoy = new Date().toISOString().split('T')[0];
  return campania.fecha_inicio <= hoy && campania.fecha_fin >= hoy;
};

// ==============================
// 🎯 FILTROS DJANGO
// ==============================

/**
 * Construye query string para filtros Django
 */
export const construirFiltrosDjango = (filtros: {
  vigentes?: boolean;
  busqueda?: string;
  tipoDescuento?: '%' | '$';
  descuentoMinimo?: number;
  ordenar?: string;
}) => {
  const params = new URLSearchParams();
  
  if (filtros.vigentes) {
    const hoy = new Date().toISOString().split('T')[0];
    params.append('fecha_inicio__lte', hoy);
    params.append('fecha_fin__gte', hoy);
  }
  
  if (filtros.busqueda) {
    params.append('search', filtros.busqueda);
  }
  
  if (filtros.tipoDescuento) {
    params.append('tipo_descuento', filtros.tipoDescuento);
  }
  
  if (filtros.descuentoMinimo) {
    params.append('monto__gte', filtros.descuentoMinimo.toString());
  }
  
  if (filtros.ordenar) {
    params.append('ordering', filtros.ordenar);
  }
  
  return params.toString();
};

// ==============================
// 🔄 MAPPERS FRONTEND → DJANGO
// ==============================

/**
 * Convierte datos de reserva frontend a formato Django
 */
export const mapReservaToSjango = (reservaFrontend: any, campaniaId: number) => {
  return {
    campania: campaniaId,
    cliente: reservaFrontend.cliente_id,
    fecha_inicio: reservaFrontend.fecha_inicio || new Date().toISOString().split('T')[0],
    total: parseFloat(reservaFrontend.total || '0'),
    moneda: reservaFrontend.moneda || 'BOB',
    estado: reservaFrontend.estado || 'pendiente',
    detalles: reservaFrontend.detalles || [],
    acompanantes: reservaFrontend.acompanantes || []
  };
};