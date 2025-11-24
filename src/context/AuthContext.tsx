"use client";
import React, { createContext, useState, useEffect, ReactNode } from "react";
import { login as apiLogin, refresh as apiRefresh, getUser, logout as apiLogout } from "../api/auth";
import { setAuthToken } from "@/api/axios";
import { useRouter } from "next/navigation";

// Interfaz completa del usuario alineada con backend
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string; // Nueva propiedad para la URL del avatar
  role: string; // Rol del usuario (ADMIN, OPERADOR, etc)
  roles?: number[]; // Array de IDs de roles
  // hint booleano si backend expone is_active
  isActiveMaybe?: boolean | null;
  // Campos adicionales del perfil del usuario
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
  documento_identidad?: string;
  pais?: string;
}

// Interfaces para suscripción
interface Proveedor {
  id: number;
  nombre_empresa: string;
  descripcion: string;
  telefono: string;
  sitio_web: string;
}

interface Suscripcion {
  id: number;
  proveedor: Proveedor;
  created_at: string;
  updated_at: string;
  precio: string;
  fecha_inicio: string;
  fecha_fin: string;
  activa: boolean;
  stripe_session_id: string;
}

// Mapeo de IDs de roles a nombres (según contrato del backend CORRECTO)
// Backend confirmado: 1: Admin, 2: Cliente, 3: Proveedor, 4: Soporte
const ROLE_MAP: Record<number, string> = {
  1: "administrador",
  2: "cliente",    
  3: "proveedor",
  4: "soporte"
};

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }> ;
  logout: () => Promise<void>;
  loading: boolean;
  reloadUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const  [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Normaliza el objeto raw que viene del backend a la forma que usa la app
  const normalizeUser = (rawUser: any): User => {
    if (!rawUser) return null as any;
    // Support shape where backend returns a profile object that contains a nested `user` object
    const nestedUser = rawUser.user || rawUser.usuario || rawUser.auth_user || null;
    const merged = { ...(rawUser || {}) } as any;
    if (nestedUser && typeof nestedUser === 'object') {
      // prefer nested user fields for auth-related values
      merged.email = nestedUser.email ?? merged.email;
      merged.first_name = nestedUser.first_name ?? merged.first_name;
      merged.last_name = nestedUser.last_name ?? merged.last_name;
      merged.is_active = nestedUser.is_active ?? merged.is_active;
    }
    // Obtener roles como array de números
    let roles: number[] = [];
    if (Array.isArray(rawUser.roles)) {
      // roles puede ser array de ids o array de objetos {id: number}
      roles = rawUser.roles.map((r: any) => (typeof r === "number" ? r : r?.id)).filter(Boolean);
    } else if (rawUser.rol && typeof rawUser.rol === "object" && typeof rawUser.rol.id === "number") {
      // Caso reportado por backend: rol como objeto { id, nombre }
      roles = [rawUser.rol.id];
    } else if (typeof rawUser.rol === "number") {
      roles = [rawUser.rol];
    } else if (typeof rawUser.perfil_id === "number") {
      roles = [rawUser.perfil_id];
    } else if (rawUser.profile_id && typeof rawUser.profile_id === "number") {
      roles = [rawUser.profile_id];
    }

  // Nombre del usuario y email/avatar
  const name = merged.nombre || merged.name || merged.full_name || merged.nombre_completo || merged.username || "Usuario";
  const email = merged.email || "";
  const avatar = merged.avatar || merged.avatar_url || merged.foto || "";

  // Determinar role string (en minúsculas)
  // Preferir rol.nombre cuando backend devuelve el objeto {id,nombre}
  let roleStr: string = "";
  if (rawUser.rol && typeof rawUser.rol === "object" && rawUser.rol.nombre) {
    roleStr = String(rawUser.rol.nombre).toLowerCase();
  } else if (rawUser.role) {
    roleStr = String(rawUser.role).toLowerCase();
  } else if (roles.length > 0) {
    // Intentar mapear id -> nombre usando ROLE_MAP, o usar el id como fallback
    roleStr = String(ROLE_MAP[roles[0]] || roles[0]).toLowerCase();
  }

  // profile fields available in /users/me/ (map them into the app shape)
  const nombres = merged.first_name || merged.nombres || (merged.nombre ? String(merged.nombre).split('\n')[0] : undefined) || undefined;
  const apellidos = merged.last_name || merged.apellidos || undefined;
  const telefono = merged.telefono || merged.phone || merged.mobile || merged.telefono_movil || undefined;
  const fecha_nacimiento = merged.fecha_nacimiento || merged.birth_date || merged.fecha || undefined;
  const genero = merged.genero || merged.gender || undefined;
  const documento_identidad = merged.documento_identidad || merged.document_number || merged.dni || undefined;
  const pais = merged.pais || merged.country || undefined;

  // explicit boolean hint when backend provides is_active
  let isActiveMaybe: boolean | null = null;
  if (merged.is_active === true || merged.is_active === 1) isActiveMaybe = true;
  else if (merged.is_active === false || merged.is_active === 0) isActiveMaybe = false;

  return {
    id: String(rawUser.id || rawUser.pk || rawUser.user_id || ""),
    name,
    email,
    avatar,
    role: roleStr,
    roles,
    nombres: nombres as any,
    apellidos: apellidos as any,
    telefono: telefono as any,
    fecha_nacimiento: fecha_nacimiento as any,
    genero: genero as any,
    documento_identidad: documento_identidad as any,
    pais: pais as any,
    isActiveMaybe,
  } as User;
  };

  const reloadUser = async () => {
    setLoading(true);
    try {
      const userRes = await getUser();
      const rawUser = userRes.data;
      const normalized = normalizeUser(rawUser);
      setUser(normalized);
    } catch (err: any) {
      // Only force logout on 401 (invalid/expired token). If backend
      // returns 403 (forbidden), keep the client token and stored user
      // but stop loading — don't automatically log out.
      const status = err?.response?.status;
      if (status === 401) {
        handleLogout();
        return;
      }
      // for 403 or other errors, just stop loading and keep existing user
    }
    setLoading(false);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("user");
      if (token && storedUser) {
        setAuthToken(token);
        try {
          const parsed = JSON.parse(storedUser);
          setUser(normalizeUser(parsed));
          setLoading(false);
        } catch {
          reloadUser();
        }
      } else if (token) {
        setAuthToken(token);
        reloadUser();
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await apiLogin(email, password);
      // apiLogin returns { token, user, suscripcion, suscripcion_activa }
      const token = res.token || null;
      const userFromRes = res.user || null;
      
      if (token && typeof window !== "undefined") {
        localStorage.setItem("authToken", token);
        setAuthToken(token);
      }
      
      if (userFromRes && typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(userFromRes));
        try {
          setUser(normalizeUser(userFromRes));
        } catch {
          // ignore
        }
      }

      // Guardar datos de suscripción en localStorage (siempre, aunque sean null)
      if ('suscripcion' in res) {
        if (res.suscripcion) {
          localStorage.setItem('suscripcion', JSON.stringify(res.suscripcion));
        } else {
          localStorage.removeItem('suscripcion');
        }
      }
      if ('suscripcion_activa' in res) {
        localStorage.setItem('suscripcionActiva', res.suscripcion_activa ? 'true' : 'false');
      }

      // Do not force reloadUser immediately; leave it for mount or manual refresh
      return { success: true };
    } catch (error: unknown) {
      // Limpiar tokens en caso de error de login
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      // ✅ NUEVO: Limpiar también datos de suscripción
      localStorage.removeItem("suscripcion");
      localStorage.removeItem("suscripcionActiva");
      
      setUser(null);
      
      // Capturar diferentes tipos de errores del backend
      let message = "Credenciales inválidas";
      
      if (typeof error === "object" && error !== null) {
        const err = error as { 
          response?: { status?: number; data?: { message?: string; detail?: string } }, 
          message?: string;
          code?: string;
        };
        
        // Error de conexión (backend no disponible)
        if (err.code === "ERR_NETWORK" || err.code === "ECONNREFUSED" || err.message?.includes("Network Error")) {
          message = "🔌 Backend no disponible. Asegúrate de que el servidor Django esté corriendo en http://localhost:8000";
        } else if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
          message = "⏰ Tiempo de espera agotado. El servidor no responde";
        } else if (err.response?.status === 401) {
          message = "Email o contraseña incorrectos";
        } else if (err.response?.status === 403) {
          message = "Tu cuenta está bloqueada o inactiva";
        } else if (err.response?.status === 404) {
          message = "Usuario no encontrado";
        } else if ((err.response?.status ?? 0) >= 500) {
          message = "Error del servidor. Intenta más tarde";
        } else if (err.response?.data?.message) {
          message = err.response.data.message;
        } else if (err.response?.data?.detail) {
          message = err.response.data.detail;
        } else if (err.message) {
          message = err.message;
        }
      }
      
      // Log de debug para desarrollador
      console.error("🚨 Login Error Details:", {
        errorType: (error as any)?.code || "unknown",
        status: (error as any)?.response?.status,
        message: (error as any)?.message,
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      });
      
      return { success: false, message };
    }
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      // If logout call fails, we still proceed to clear local state to avoid
      // leaving the app in a logged-in inconsistent state. Errors are logged
      // here for debugging but do not block the UX.
      console.error("[Auth] logout failed:", err);
    }

    // Limpiar token y usuario de localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    // ✅ NUEVO: Limpiar también datos de suscripción
    localStorage.removeItem("suscripcion");
    localStorage.removeItem("suscripcionActiva");
    
    setUser(null);
    router.push("/"); // Redirigir al inicio después del logout
  };

  // TokenAuth does not provide refresh by default. If refresh is implemented, keep logic here.

  return (
    <AuthContext.Provider value={{ user, login: handleLogin, logout: handleLogout, loading, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
};