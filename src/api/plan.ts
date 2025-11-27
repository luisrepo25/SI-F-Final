// Tipos para Plan y Suscripcion
export type Plan = {
  id: number;
  nombre: string;
  slug: string;
  descripcion?: string;
  precio: number;
  duracion: 'mensual' | 'trimestral' | 'semestral' | 'anual';
  max_servicios: number;
  max_clientes_potenciales: number;
  chat_directo: boolean;
  estadisticas_basicas: boolean;
  posicionamiento_destacado: boolean;
  panel_metricas_avanzado: boolean;
  promociones_temporada: boolean;
  soporte_prioritario: boolean;
  difusion_internacional: boolean;
  base_datos_viajeros_premium: boolean;
  sello_verificado: boolean;
  consultoria_marketing: boolean;
  campanas_promocionales: boolean;
  destacado: boolean;
  orden: number;
  activo: boolean;
};

export type Suscripcion = {
  id: number;
  proveedor: { id: number; nombre_empresa: string };
  plan: Plan | null;
  precio: string;
  fecha_inicio: string;
  fecha_fin: string;
  activa: boolean;
  stripe_session_id?: string;
  stripe_subscription_id?: string;
  ciclo_facturacion: 'mensual' | 'anual';
};

// CRUD para Planes
import axios from './axios';

function buildUrl(path: string) {
  const baseRaw = (axios.defaults?.baseURL as string) || '';
  const base = baseRaw.replace(/\/+$/, '');
  const baseNoApi = base.replace(/\/api(\/?$)/i, '');
  const cleanPath = path.replace(/^\/+/, '');
  if (/^https?:\/\//i.test(path)) return path;
  return `${baseNoApi}/${cleanPath}`;
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers: Record<string, string> = (options.headers as Record<string, string>) || {};
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) headers['Authorization'] = `Token ${token}`;
  }
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err: any = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    err.body = text;
    throw err;
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}

// GET: Listar planes
export const listarPlanes = async (params?: Record<string, any>) => {
  try {
    const filtros = { ...params };
    Object.keys(filtros).forEach((k) => {
      if (filtros[k] === undefined || filtros[k] === null || filtros[k] === '') delete filtros[k];
    });
    const qs = Object.keys(filtros).length > 0 ? `?${new URLSearchParams(filtros).toString()}` : '';
    const url = buildUrl(`api/planes/${qs}`);
    const data = await fetchWithAuth(url, { method: 'GET' });
    return { data };
  } catch (err) {
    console.error('Error listar planes', err);
    throw err;
  }
};

// POST: Crear plan
export const crearPlan = async (data: Record<string, any>) => {
  const url = buildUrl('api/planes/');
  console.log('[crearPlan] URL:', url);
  console.log('[crearPlan] Data:', data);
  return fetchWithAuth(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

// PATCH: Editar plan
export const editarPlan = async (id: number, data: Record<string, any>) => {
  const url = buildUrl(`api/planes/${id}/`);
  console.log('[editarPlan] URL:', url);
  console.log('[editarPlan] Data:', data);
  return fetchWithAuth(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

// PATCH: Cambiar estado activo/inactivo (delete lógico)
export const toggleEstadoPlan = async (id: number, activo: boolean) => {
  const url = buildUrl(`api/planes/${id}/`);
  console.log('[toggleEstadoPlan] URL:', url);
  console.log('[toggleEstadoPlan] Activo:', activo);
  return fetchWithAuth(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activo }),
  });
};

// CRUD para Suscripciones
export const listarSuscripciones = async (params?: Record<string, any>) => {
  try {
    const filtros = { ...params };
    Object.keys(filtros).forEach((k) => {
      if (filtros[k] === undefined || filtros[k] === null || filtros[k] === '') delete filtros[k];
    });
    const qs = Object.keys(filtros).length > 0 ? `?${new URLSearchParams(filtros).toString()}` : '';
    const url = buildUrl(`api/suscripciones/${qs}`);
    const data = await fetchWithAuth(url, { method: 'GET' });
    return { data };
  } catch (err) {
    console.error('Error listar suscripciones', err);
    throw err;
  }
};

export const crearSuscripcion = async (data: Record<string, any>) => {
  const url = buildUrl('api/suscripciones/');
  console.log('[crearSuscripcion] URL:', url);
  console.log('[crearSuscripcion] Data:', data);
  return fetchWithAuth(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

export const editarSuscripcion = async (id: number, data: Record<string, any>) => {
  const url = buildUrl(`api/suscripciones/${id}/`);
  console.log('[editarSuscripcion] URL:', url);
  console.log('[editarSuscripcion] Data:', data);
  return fetchWithAuth(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

export const toggleEstadoSuscripcion = async (id: number, activa: boolean) => {
  const url = buildUrl(`api/suscripciones/${id}/`);
  console.log('[toggleEstadoSuscripcion] URL:', url);
  console.log('[toggleEstadoSuscripcion] Activa:', activa);
  return fetchWithAuth(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activa }),
  });
};
