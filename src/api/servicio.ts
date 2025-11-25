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

export const listarServicios = async (params?: Record<string, any>) => {
  try {
    const qs = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    const paths = [`api/servicios/${qs}`, `servicios/${qs}`, `servicios${qs}`];
    for (const p of paths) {
      const url = buildUrl(p.replace(/\/+/g, '/'));
      try {
        const data = await fetchWithAuth(url, { method: 'GET' });
        return { data };
      } catch (err) {
        // continue
      }
    }
    throw new Error('No se pudo listar servicios');
  } catch (err: any) {
    console.error('Error listar servicios', err);
    throw err;
  }
};

// Listar servicios filtrando por proveedor y estado
// En tu archivo servicio.ts - CORREGIR
export const listarServiciosPorId = async (params: { id?: number; proveedor?: number; estado?: string }) => {
  const searchParams = new URLSearchParams();
  if (params.id) searchParams.append('id', String(params.id));
  if (params.proveedor) searchParams.append('proveedor', String(params.proveedor));
  if (params.estado) searchParams.append('estado', params.estado);
  const url = buildUrl(`api/servicios/?${searchParams.toString()}`);
  
  const response = await fetchWithAuth(url, { method: 'GET' });
  console.log('Respuesta de listarServiciosPorId:', response);
  
  // Asegúrate de que devuelva un objeto con propiedad data
  return { data: response };
};

export const crearServicio = async (servicio: Record<string, any>) => {
  const url = buildUrl('api/servicios/');
  return fetchWithAuth(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(servicio),
  });
};

export const actualizarServicio = async (id: number, servicio: Record<string, any>) => {
  const url = buildUrl(`api/servicios/${id}/`);
  return fetchWithAuth(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(servicio),
  });
};


export const cambiarEstadoServicio = async (id: number, nuevoEstado: string) => {
  const url = buildUrl(`api/servicios/${id}/`);
  return fetchWithAuth(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      estado: nuevoEstado
    })
  });
};