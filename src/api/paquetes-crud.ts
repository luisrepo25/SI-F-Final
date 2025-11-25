// api/paquetes-crud.ts
import { buildUrl, fetchWithAuth } from './config';

export interface PaqueteCRUD {
  id?: number;
  nombre: string;
  descripcion: string;
  duracion: string;
  es_personalizado: boolean;
  proveedor?: number;
  precio_base: number;
  precio_bob?: number;
  cupos_disponibles: number;
  cupos_ocupados: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  destacado: boolean;
  imagen_principal?: string;
  punto_salida: string;
  incluye: string[];
  no_incluye: string[];
  campania?: number;
  departamento?: string;
  ciudad?: string;
  tipo_destino?: string;
}

// Función para listar paquetes con filtros
export const listarPaquetesPorId = async (params: { 
  id?: number; 
  proveedor?: number; 
  estado?: string 
}) => {
  try {
    const searchParams = new URLSearchParams();
    if (params.id) searchParams.append('id', String(params.id));
    if (params.proveedor) searchParams.append('proveedor', String(params.proveedor));
    if (params.estado) searchParams.append('estado', params.estado);
    
    const url = buildUrl(`api/paquetes/?${searchParams.toString()}`);
    const response = await fetchWithAuth(url, { method: 'GET' });
    
    console.log('📦 CRUD: Paquetes obtenidos:', response);
    return { data: response };
  } catch (err: any) {
    console.error('❌ CRUD: Error listar paquetes', err);
    throw err;
  }
};

// Crear nuevo paquete
export const crearPaquete = async (paquete: PaqueteCRUD) => {
  try {
    const url = buildUrl('api/paquetes/');
    const response = await fetchWithAuth(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paquete),
    });
    
    console.log('✅ CRUD: Paquete creado:', response);
    return response;
  } catch (err: any) {
    console.error('❌ CRUD: Error crear paquete', err);
    throw err;
  }
};

// Actualizar paquete existente
export const actualizarPaquete = async (id: number, paquete: Partial<PaqueteCRUD>) => {
  try {
    const url = buildUrl(`api/paquetes/${id}/`);
    const response = await fetchWithAuth(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paquete),
    });
    
    console.log('✅ CRUD: Paquete actualizado:', response);
    return response;
  } catch (err: any) {
    console.error('❌ CRUD: Error actualizar paquete', err);
    throw err;
  }
};

// Cambiar estado del paquete (Activo/Inactivo)
export const cambiarEstadoPaquete = async (id: number, nuevoEstado: string) => {
  try {
    const url = buildUrl(`api/paquetes/${id}/`);
    const response = await fetchWithAuth(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    
    console.log('✅ CRUD: Estado cambiado a:', nuevoEstado);
    return response;
  } catch (err: any) {
    console.error('❌ CRUD: Error cambiar estado', err);
    throw err;
  }
};