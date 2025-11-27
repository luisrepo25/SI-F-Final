import axios from './axios';

// ===============================
// 🔧 Helpers - CORREGIDOS
// ===============================

// Construye URLs absolutas limpias - VERSIÓN CORREGIDA
function buildUrl(path: string) {
  // Usar directamente la baseURL de axios que ya incluye /api
  const baseRaw = (axios.defaults?.baseURL as string) || '';
  const base = baseRaw.replace(/\/+$/, ''); // Solo quitar slash final
  const cleanPath = path.replace(/^\/+/, '');
  if (/^https?:\/\//i.test(path)) return path;
  
  // ✅ NO eliminar /api de la base URL
  return `${base}/${cleanPath}`;
}

// Realiza fetch autenticado (usa Token si existe)
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers: Record<string, string> = (options.headers as Record<string, string>) || {};
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) headers['Authorization'] = `Token ${token}`;
  }
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    const err: any = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    err.body = text;
    throw err;
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}

// Probar varias rutas candidatas - VERSIÓN SIMPLIFICADA
async function tryPaths(paths: string[], method = 'GET', body?: any, extraHeaders: Record<string, string> = {}) {
  const errors: any[] = [];

  for (const p of paths) {
    const url = buildUrl(p); // ✅ Ya usa la baseURL correcta con /api
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

  const aggregate: any = new Error('No se encontró una ruta válida entre las candidatas');
  aggregate.details = errors;
  throw aggregate;
}

// ===============================
// 📦 BACKUPS & RESTORE API - CORREGIDOS
// ===============================

// 🧾 Listar backups - VERSIÓN DROPBOX
export const listarBackups = async () => {
  try {
    console.log('🔁 API: Solicitando lista de backups desde DROPBOX...');
    
    // ✅ Cambiar a endpoint de DROPBOX
    const result = await tryPaths(['backups/dropbox/listar/']);
    console.log('✅ API: Backups de Dropbox obtenidos desde:', result.url);
    return { data: result.data };
  } catch (error: any) {
    console.error('❌ API: Error al obtener backups de Dropbox:', error);
    
    // Debug adicional
    console.log('🔍 Debug - baseURL:', axios.defaults?.baseURL);
    console.log('🔍 Debug - token exists:', !!localStorage.getItem('authToken'));
    
    throw error;
  }
};

// 🧩 Crear backup
export const crearBackup = async (data?: any) => {
  try {
    console.log('🛠️ API: Creando backup...', data || '(sin payload)');
    const result = await tryPaths(['backups/crear/'], 'POST', data || {});
    console.log('✅ API: Backup creado desde:', result.url);
    return { data: result.data };
  } catch (error: any) {
    console.error('❌ API: Error al crear backup:', error);
    throw error;
  }
};

// 🔁 Restaurar backup (total o parcial) - VERSIÓN DROPBOX
export const restaurarBackup = async (
  backup_file: string,
  options: { restore_code?: boolean; restore_db?: boolean } = {}
) => {
  try {
    console.log('♻️ API: Restaurando backup file:', backup_file, options);
    const body = {
      filename: backup_file,  // ✅ Cambiar a "filename" que espera el backend
      type: options.restore_db && options.restore_code ? 'total' : 
            options.restore_code ? 'backend' : 'base'
    };
    
    // ✅ Usar endpoint de Dropbox para restaurar
    const result = await tryPaths(['backups/dropbox/restaurar/'], 'POST', body);
    console.log('✅ API: Restauración desde Dropbox ejecutada desde:', result.url);
    return { data: result.data };
  } catch (error: any) {
    console.error('❌ API: Error al restaurar backup:', error);
    throw error;
  }
};

// 📥 Descargar backup - VERSIÓN DROPBOX
export const descargarBackup = async (filename: string) => {
  try {
    console.log('📥 API: Descargando backup desde Dropbox:', filename);
    
    // ✅ Usar endpoint de descarga de Dropbox
    const url = buildUrl(`/backups/dropbox/descargar/${filename}`);
    
    console.log('🔗 URL de descarga Dropbox:', url);
    
    // Redirigir directamente a Dropbox en nueva pestaña
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
    
    return { 
      message: 'Redirigiendo a Dropbox para descarga...',
      download_url: url 
    };
    
  } catch (error: any) {
    console.error('❌ API: Error al descargar backup de Dropbox:', error);
    throw error;
  }
};

// 🗑️ Eliminar backup
export const eliminarBackup = async (filename: string) => {
  try {
    console.log('🗑️ API: Eliminando backup:', filename);
    
    // ⚠️ Nota: Esto elimina del backend LOCAL
    // Para eliminar de Dropbox necesitarías un endpoint adicional
    const result = await tryPaths([`/backups/delete/${filename}/`], 'DELETE');
    console.log('✅ API: Backup eliminado desde:', result.url);
    return { data: result.data };
  } catch (error: any) {
    console.error('❌ API: Error al eliminar backup:', error);
    throw error;
  }
};