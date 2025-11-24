"use client"

import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import useAuth from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: number[]; // Array de IDs de roles permitidos
  requireAuth?: boolean; // Si requiere autenticación
  redirectTo?: string; // Dónde redirigir si no tiene permisos
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  requireAuth = true,
  redirectTo = "/" 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Si requiere autenticación y no está logueado
      if (requireAuth && !user) {
        router.push("/login");
        return;
      }

      // Si especifica roles y no tiene el rol necesario
      if (allowedRoles.length > 0 && user) {
        const hasPermission = allowedRoles.some(roleId => {
          const userRoleStr = String(user.role || "").toLowerCase();
          const roleName = getRoleName(roleId);
          return user.roles?.includes(roleId) || userRoleStr === roleName;
        });
        
        if (!hasPermission) {
          router.push(redirectTo);
          return;
        }
      }
    }
  }, [user, loading, allowedRoles, requireAuth, redirectTo, router]);

  // Función auxiliar para convertir ID de rol a nombre (alineado con backend)
  const getRoleName = (roleId: number): string => {
    const roleMap: Record<number, string> = {
      1: "administrador",
      2: "cliente",    // CORRECTO: cliente es rol ID 2
      3: "proveedor",
      4: "soporte"
    };
    return (roleMap[roleId] || "").toLowerCase();
  };

  // Mostrar loading mientras verifica permisos
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Si no tiene permisos, no mostrar nada (se está redirigiendo)
  if (requireAuth && !user) {
    return null;
  }

  if (allowedRoles.length > 0 && user) {
    const hasPermission = allowedRoles.some(roleId => {
      const userRoleStr = String(user.role || "").toLowerCase();
      return user.roles?.includes(roleId) || userRoleStr === getRoleName(roleId);
    });
    
    if (!hasPermission) {
      return null;
    }
  }

  return <>{children}</>;
}