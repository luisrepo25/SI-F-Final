"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import AdminDashboard from "../../components/admin-dashboard";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Mostrar el rol real en consola para depuración
      console.log('ROL DEL USUARIO:', user.role);
      // Permitir acceso si el rol es admin (string)
      const isAdmin = user.role && user.role.toLowerCase() === "administrador";
      if (!isAdmin) {
        router.replace("/");
      }
    }
  }, [user, loading, router]);

  if (loading) return <div>Cargando...</div>;
  const isAdmin = user && user.role && user.role.toLowerCase() === "admin";
  if (!user || !isAdmin) return null;

  return <AdminDashboard />;
}
