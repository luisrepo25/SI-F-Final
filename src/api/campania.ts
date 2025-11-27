import axios from './axios';

// Helpers (mismo estilo que backups_restore)
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

async function tryPaths(paths: string[], method = 'GET', body?: any, extraHeaders: Record<string, string> = {}) {
  const prefixes = ['', '/api/', '/campanias/', '/api/campanias/', '/condominio/campanias/', '/condominio/api/campanias/'];
  const errors: any[] = [];

  for (const prefix of prefixes) {
    for (const p of paths) {
      const candidate = `${prefix}${p}`.replace(/\/+/g, '/');
      const url = buildUrl(candidate);
      try {
        console.log('🔍 Probando candidate URL:', url);
        const opts: RequestInit = { method };
        if (body !== undefined) {
          if (body instanceof FormData) opts.body = body;
          else {
            opts.body = JSON.stringify(body);
            opts.headers = { 'Content-Type': 'application/json', ...extraHeaders };
          }
        } else {
          opts.headers = { ...extraHeaders };
        }
        const data = await fetchWithAuth(url, opts);
        return { data, url };
      } catch (err: any) {
        console.warn(`Fallback: ${url} -> ${err?.status || 'err'}`);
        errors.push({ url, err });
      }
    }
  }

  const aggregate: any = new Error('No se encontró una ruta válida entre las candidatas');
  aggregate.details = errors;
  throw aggregate;
}

// ===============================
// 📣 CAMPANIAS API
// ===============================

export const listarCampanias = async (params?: Record<string, any>) => {
  try {
    console.log('🔁 API: Solicitando lista de campañas...');
  const qs = params ? `?${new URLSearchParams(params as any).toString()}` : '';
  // Preferir la ruta explícita /api/campanias/ si existe en el backend
  const paths = [`api/campanias/${qs}`, `campanias/${qs}`, `campanias${qs}`, `campanias/listar/${qs}`];
    const result = await tryPaths(paths);
    console.log('✅ API: Campañas obtenidas desde:', result.url);
    return { data: result.data };
  } catch (error: any) {
    console.error('❌ API: Error al obtener campañas:', error);
    throw error;
  }
};

export const crearCampania = async (payload: any) => {
  try {
    console.log('🛠️ API: Creando campaña...', payload || '(sin payload)');
  const result = await tryPaths(['api/campanias/', 'campanias/', 'campanias'], 'POST', payload || {});
    console.log('✅ API: Campaña creada desde:', result.url);
    return { data: result.data };
  } catch (error: any) {
    console.error('❌ API: Error al crear campaña:', error);
    throw error;
  }
};

export const obtenerCampania = async (id: number | string) => {
  try {
  const result = await tryPaths([`api/campanias/${id}/`, `campanias/${id}/`, `campanias/${id}`]);
    return { data: result.data };
  } catch (error: any) {
    console.error('❌ API: Error al obtener campaña:', error);
    throw error;
  }
};

export const actualizarCampania = async (id: number | string, payload: any) => {
  try {
  const result = await tryPaths([`api/campanias/${id}/`, `campanias/${id}/`, `campanias/${id}`], 'PATCH', payload || {});
    return { data: result.data };
  } catch (error: any) {
    console.error('❌ API: Error al actualizar campaña:', error);
    throw error;
  }
};

// Reemplazar campaña (PUT) - actualiza todos los campos
export const reemplazarCampania = async (id: number | string, payload: any) => {
  try {
    const result = await tryPaths([`api/campanias/${id}/`, `campanias/${id}/`, `campanias/${id}`], 'PUT', payload || {});
    return { data: result.data };
  } catch (error: any) {
    console.error('❌ API: Error al reemplazar campaña:', error);
    throw error;
  }
};

export const eliminarCampania = async (id: number | string) => {
  try {
  const result = await tryPaths([`api/campanias/${id}/`, `campanias/${id}/`, `campanias/${id}`], 'DELETE');
    return { data: result.data };
  } catch (error: any) {
    console.error('❌ API: Error al eliminar campaña:', error);
    throw error;
  }
};

// Servicios asociados
export const listarServiciosCampania = async (campaniaId: number | string) => {
  try {
  const paths = [`api/campanias/${campaniaId}/servicios/`, `campanias/${campaniaId}/servicios/`, `campanias/${campaniaId}/servicios`, `campanias/${campaniaId}/servicios/listar/`];
    const result = await tryPaths(paths);
    return { data: result.data };
  } catch (error: any) {
    console.error('❌ API: Error al listar servicios de campaña:', error);
    throw error;
  }
};

export const agregarServicioCampania = async (campaniaId: number | string, servicioId: number | string) => {
  try {
  const body = { campania_id: campaniaId, servicio_id: servicioId };
  // Rutas candidatas para la relación; preferir la ruta exacta que usas en Postman
  const paths = ['api/campania-servicios/', 'campania-servicios/', 'campaniaservicio/', 'campaniaservicios/', 'campania_servicio/'];
    const result = await tryPaths(paths, 'POST', body);
    return { data: result.data };
  } catch (error: any) {
    console.error('❌ API: Error al agregar servicio a campaña:', error);
    throw error;
  }
};

export const eliminarServicioCampania = async (id: number | string) => {
  try {
  const paths = [`api/campania-servicios/${id}/`, `campania-servicios/${id}/`, `campaniaservicio/${id}/`, `campaniaservicio/${id}`, `campaniaservicios/${id}/`];
    const result = await tryPaths(paths, 'DELETE');
    return { data: result.data };
  } catch (error: any) {
    console.error('❌ API: Error al eliminar relación servicio-campaña:', error);
    throw error;
  }
};
