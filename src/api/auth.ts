import api, { setAuthToken } from "./axios";

// Reactivar usuario (eliminación lógica inversa)
// Reactivar usuario: try canonical PATCH /users/{id}/active/ with { is_active: true }
export const reactivateUser = async (id: string) => {
  try {
    return await api.patch(`/users/${id}/active/`, { is_active: true });
  } catch (err: any) {
    // fallback to legacy endpoint
    try {
      return await api.post(`/users/${id}/reactivar/`);
    } catch (fallbackErr) {
      throw fallbackErr;
    }
  }
};

// Deshabilitar usuario (actualiza is_active=false). Try canonical PATCH first, fallback to legacy.
export const disableUser = async (id: string) => {
  try {
    return await api.patch(`/users/${id}/active/`, { is_active: false });
  } catch (err: any) {
    // fallback to legacy endpoint
    try {
      return await api.post(`/users/${id}/inhabilitar/`);
    } catch (fallbackErr) {
      throw fallbackErr;
    }
  }
};
// Editar datos de usuario por ID (admin)
export interface EditUserData {
  nombres: string;
  apellidos: string;
  telefono?: string;
  fecha_nacimiento?: string | null;
  genero?: string;
  documento_identidad?: string | null;
  pais?: string;
  email: string;
}
export const editUser = async (id: string, data: Partial<EditUserData> | any) => {
  // Use PATCH /users/{id}/ for partial updates (admin editing another user)
  try {
    return await api.patch(`/users/${id}/`, data);
  } catch (err) {
    const e = err as any;
    // If server returns 405 Method Not Allowed for PATCH, try PUT on the same URL
    if (e?.response?.status === 405) {
      try {
        return await api.put(`/users/${id}/`, data);
      } catch (putErr) {
        // if PUT fails, continue to legacy fallback below
        e.response = e.response || {};
      }
    }
    // Fallback to legacy path if server exposes it (best-effort)
    try {
      return await api.put(`/usuarios/${id}/editar-datos/`, data);
    } catch (fallbackErr) {
      throw fallbackErr;
    }
  }
};
export const login = async (email: string, password: string) => {
  try {
  const response = await api.post("/login/", { email, password });
  const token = response.data?.token || null;
  // backend may return `user` or `usuario` (spanish key) depending on implementation
  const user = response.data?.user || response.data?.usuario || null;
    if (token) setAuthToken(token);
    if (typeof window !== "undefined" && user) localStorage.setItem("user", JSON.stringify(user));
    return response.data;
  } catch (error: any) {
    // Log detailed backend validation error for easier debugging and rethrow
    const status = error?.response?.status;
    const data = error?.response?.data;
    console.error("[auth.login] request failed:", { status, data });
    // Throw a clearer error object so UI can show message if desired
    const message = data?.detail || data?.message || JSON.stringify(data) || error.message || "Login failed";
    const err = new Error(`Login failed (status=${status}): ${message}`);
    // Attach original response for advanced handling
    (err as any).response = error?.response;
    throw err;
  }
};

export const register = async (data: {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  password_confirm: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
  documento_identidad?: string;
  pais?: string;
  rol: number | string; // backend expects an integer id; form may send string
  rubro?: string;
}) => {
  // Ensure required fields for this backend (nombre, rubro, rol) are present at call site
  const res = await api.post("/register/", data);
  const token = res.data?.token || null;
  // support both `user` and `usuario` keys from backend
  const user = res.data?.user || res.data?.usuario || null;
  if (token) setAuthToken(token);
  if (typeof window !== "undefined" && user) localStorage.setItem("user", JSON.stringify(user));
  return res.data;
};


export const refresh = async (refresh: string) => {
  return api.post("/auth/refresh/", { refresh });
};

// Try multiple possible endpoints for obtaining the current authenticated user.
export const getUser = async () => {
  // Allow overriding the user endpoint via env var to avoid guessing
  const override = process.env.NEXT_PUBLIC_USER_ENDPOINT;
  if (override) {
    return api.get(override);
  }

  const candidates = ["users/me/", "usuarios/me/", "auth/user/"];
  let lastError: any = null;

  // Try common 'me' endpoints first
  for (const ep of candidates) {
    try {
      const res = await api.get(ep);
      return res;
    } catch (err: any) {
      lastError = err;
    }
  }

  // If we have a cached user with an id, try the per-id endpoint as a fallback
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id) {
          try {
            return await api.get(`/users/${parsed.id}/`);
          } catch (err: any) {
            lastError = err;
          }
        }
      }
    } catch {
      // ignore parse errors
    }
  }

  // If the last error was a 403, return the cached user so the client can continue
  // using the stored session (some admin endpoints may restrict /usuarios/me/).
  try {
    if (lastError?.response?.status === 403 && typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        return { data: parsed } as any;
      }
    }
  } catch {
    // ignore parse errors
  }

  throw lastError || new Error("No user endpoint matched");
};

// Get any user's detail by id (admin). Prefer canonical endpoint `/users/{id}/`.
export const getUserById = async (id: string) => {
  try {
    return await api.get(`/users/${id}/`);
  } catch (err: any) {
    // fallback to legacy path if needed
    try {
      return await api.get(`/usuarios/${id}/`);
    } catch (fallbackErr) {
      throw fallbackErr;
    }
  }
};

// Editar datos del usuario autenticado
export interface UpdateUserData {
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
  documento_identidad?: string;
  pais?: string;
  email?: string;
}

export const updateUserProfile = async (data: UpdateUserData) => {
  // Use canonical /users/me/ endpoint per backend guide
  try {
    return await api.patch('/users/me/', data);
  } catch (err) {
    // fallback for older deployments
    return api.patch('/users/me/', data);
  }
};

// Solicitar código de seguridad para cambio de contraseña
export const requestPasswordResetCode = async (email: string) => {
  return api.post("/auth/solicitar-recuperacion-password/", { email });
};

// Backwards-compatible Spanish-named alias
export const solicitarRecuperacionPassword = async (email: string) => {
  return requestPasswordResetCode(email);
};

// Cambiar contraseña con código de seguridad
export interface ChangePasswordData {
  token: string;
  password_actual: string;
  password_nueva: string;	
  password_nueva_confirm: string;
}

export const changePassword = async (data: ChangePasswordData) => {
  return api.post("/auth/reset-password/", data);
};

// Backwards-compatible wrapper used by some pages/components
export const restablecerPassword = async (token: string, password: string, email: string) => {
  return api.post("/auth/reset-password/", { email, token, password });
};

export const listUsers = async () => {
  // Try the canonical English endpoint first (per backend guide), then
  // fallback to the existing Spanish endpoint. Normalize responses so
  // callers that expect `res.data` to be an array keep working.
  try {
    const res = await api.get("/users/");
    const data = res.data;
    if (Array.isArray(data)) return { data } as any;
    if (data && Array.isArray(data.results)) return { data: data.results, meta: { count: data.count, next: data.next, previous: data.previous } } as any;
    // Unexpected shape: wrap in array
    return { data: Array.isArray(data) ? data : [data] } as any;
  } catch (err) {
    // Log the original error for debugging before falling back
    try {
      const e = err as any;
      console.error('[api.listUsers] /users/ failed:', e?.response?.status, e?.response?.data);
    } catch {}

    // Fallback to Spanish endpoint used historically in this repo
    let res;
    try {
      res = await api.get("/users/");
    } catch (fallbackErr) {
      // Log fallback error too and rethrow so caller can see details
      try {
        const fe = fallbackErr as any;
        console.error('[api.listUsers] /usuarios/ also failed:', fe?.response?.status, fe?.response?.data);
      } catch {}
      throw fallbackErr;
    }
    const data = res.data;
    if (Array.isArray(data)) return { data } as any;
    if (data && Array.isArray(data.results)) return { data: data.results, meta: { count: data.count, next: data.next, previous: data.previous } } as any;
    return { data: Array.isArray(data) ? data : [data] } as any;
  }
};

// Assign a single role to a user. Try the backend-guide preferred endpoint
// (`/users/{id}/roles/` with body { role }) first, then fall back to the
// legacy Spanish endpoint `/usuarios/{id}/asignar-rol/` (body { rol }).
export const assignRole = async (id: string, rol: string) => {
  try {
    // preferred contract: POST /api/users/{id}/roles/ { role: 'editor' }
    return await api.post(`/users/${id}/roles/`, { role: rol });
    } catch (err: any) {
    // Log the error to help debugging why the preferred endpoint failed
    try {
      const e = err as any;
      console.error('[api.assignRole] POST /users/{id}/roles/ failed:', e?.response?.status, e?.response?.data);
    } catch {}
    // fallback to historical endpoint
    try {
      return await api.post(`/users/${id}/asignar-rol/`, { rol });
    } catch (fallbackErr: any) {
      try {
        const fe = fallbackErr as any;
        console.error('[api.assignRole] fallback /usuarios/{id}/asignar-rol/ failed:', fe?.response?.status, fe?.response?.data);
      } catch {}
      throw fallbackErr;
    }
  }
};

// Patch user roles using the recommended delta shape { add: [], remove: [] }
export const patchUserRoles = async (id: string, delta: { add?: string[]; remove?: string[] } ) => {
  try {
    return await api.patch(`/users/${id}/roles/`, delta);
  } catch (err: any) {
    // If backend only provides a Spanish-style endpoint, try that as a last resort
    // (no exact equivalent exists historically; implementers can add one server-side)
    throw err;
  }
};

// Delete a role from a user: DELETE /users/{id}/roles/{role_slug_or_id}/
export const deleteUserRole = async (id: string, roleSlugOrId: string | number) => {
  try {
    return await api.delete(`/users/${id}/roles/${roleSlugOrId}/`);
  } catch (err: any) {
    // fallback: if backend exposes a different delete path, update here
    throw err;
  }
};

// List available roles
export const listRoles = async () => {
  try {
    return await api.get(`/roles/`);
  } catch (err: any) {
    // no Spanish equivalent expected; bubble up error
    throw err;
  }
};

export const updateProfile = async (data: UpdateUserData) => {
  return api.put("/usuarios/me/", data);
};

export const requestPasswordRecovery = async (email: string) => {
  return api.post("/auth/solicitar-recuperacion/", { email });
};

export const resetPassword = async (token: string, password: string, password_confirm: string) => {
  return api.post("/auth/resetear-password/", { token, password, password_confirm });
};

export const logout = async () => {
  // Try to call the backend logout endpoint so the server can register the
  // "Salida" action in the bitácora. We keep a tolerant fallback strategy:
  //  - If /logout/ exists and responds (204 or 200), we clear client-side token.
  //  - If the endpoint returns 404 (not implemented) we still clear client token.
  //  - If the request fails for other reasons, attempt a fallback that sends
  //    the token in the body. In any case, we avoid leaving the token in
  //    client storage permanently.
  try {
    // axios interceptor will add Authorization header from localStorage if present
    await api.post("/logout/");
  } catch (err: any) {
    const status = err?.response?.status;
    // If endpoint not found (404) or unauthorized, proceed to clear token locally
    if (status === 404 || status === 401 || status === 400) {
      // nothing else to do; server doesn't support logout or token already invalid
    } else {
      // Try fallback: send token explicitly in the body (some backends accept this)
      try {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("authToken");
          if (token) {
            await api.post("/logout/", { token });
          }
        }
      } catch (e) {
        // swallow fallback errors; we'll still clear client state below
      }
    }
  } finally {
    // Always clear client-side token and cached user after attempting logout.
    setAuthToken(null);
    if (typeof window !== "undefined") localStorage.removeItem("user");
  }
};
