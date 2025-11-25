// api/config.ts
import axios from './axios';

/**
 * Construye URLs absolutas basadas en la configuración de axios
 */
export function buildUrl(path: string): string {
  const baseRaw = (axios.defaults?.baseURL as string) || '';
  const base = baseRaw.replace(/\/+$/, '');
  const baseNoApi = base.replace(/\/api(\/?$)/i, '');
  const cleanPath = path.replace(/^\/+/, '');
  
  if (/^https?:\/\//i.test(path)) return path;
  return `${baseNoApi}/${cleanPath}`;
}

/**
 * Función para hacer fetch con autenticación automática
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers: Record<string, string> = (options.headers as Record<string, string>) || {};
  
  // Agregar token de autenticación si está disponible
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }
  }
  
  // Asegurar Content-Type para requests con body
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  
  const config = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };
  
  try {
    const res = await fetch(url, config);
    
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      const err: any = new Error(`HTTP ${res.status}`);
      err.status = res.status;
      err.body = text;
      throw err;
    }
    
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return res.json();
    }
    
    return res.text();
  } catch (error) {
    console.error('❌ Error en fetchWithAuth:', error);
    throw error;
  }
}

/**
 * Función auxiliar para construir query strings
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
}

/**
 * Función para manejar errores de API de forma consistente
 */
export function handleApiError(error: any): never {
  console.error('❌ Error de API:', error);
  
  if (error.status === 401) {
    // Token expirado o inválido
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
  }
  
  throw error;
}