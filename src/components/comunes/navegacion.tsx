"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { LoadingLink } from "../EfectoCarga/vista-cargando";
import { usePathname } from "next/navigation"; // 👈 importamos el hook
import useAuth from "@/hooks/useAuth";
import { NavUser } from "@/components/nav-user";

export function Navegacion() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const pathname = usePathname();
  const auth = useAuth(); // Mover el hook fuera del callback
  // 👇 cuando cambie la ruta, cerramos el menú
  useEffect(() => {
    setMenuAbierto(false);
  }, [pathname]);

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 w-full">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-heading font-black text-lg">
                B
              </span>
            </div>
            <span className="font-heading font-black text-xl text-foreground">
              Descubre Bolivia
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <LoadingLink href="/">Inicio</LoadingLink>
            <LoadingLink href="/destinos">Destinos</LoadingLink>
            <LoadingLink href="/paquetes">Paquetes</LoadingLink>
            <LoadingLink href="/reserva-multiservicio">Reserva Multiservicio</LoadingLink>
            <LoadingLink href="/contacto">Contacto</LoadingLink>
            <LoadingLink href="/politicas">Políticas</LoadingLink>
            {auth.user && <LoadingLink href="/visita-reciente">Vistos Recientemente</LoadingLink>}
            {/* Mostrar Panel Admin o Mi Panel según el rol */}
            {(() => {
              const { user } = auth;
              if (!user) return null;
              console.log(user)
              // Verificar si el usuario es admin (rol 1 o rol "admin")
              const roleStr = String(user?.role || "").toLowerCase();

              const isAdmin = user?.roles?.includes(1) || roleStr === "Administrador";
              // Verificar si el usuario es soporte (rol 4 o rol "soporte")  
              const isSupport = user?.roles?.includes(4) || roleStr === "proveedor";
              // Verificar si el usuario es cliente (rol 2 o rol "cliente")
              const isClient = user?.roles?.includes(2) || roleStr === "cliente";

              if (isAdmin) {
                return <LoadingLink href="/panel">Panel Admin</LoadingLink>;
              } else if (isSupport) {
                return <LoadingLink href="/panel">Panel Proveedor</LoadingLink>;
              } else if (isClient) {
                return <LoadingLink href="/cliente?tab=reservas">Mi Panel</LoadingLink>;
              }
              return null;
            })()}
            {/* Show avatar if logged in, else Login link */}
            {(() => {
              const { user } = auth;
              if (user) {
                return <NavUser user={user} />;
              } else {
                return <LoadingLink href="/login">Login</LoadingLink>;
              }
            })()}

            <LoadingLink href="/suscripcion"><Button>Suscribete</Button></LoadingLink>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="p-2"
            >
              {menuAbierto ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {menuAbierto && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <LoadingLink href="/" className="block px-3 py-2">
                Inicio
              </LoadingLink>
              <LoadingLink href="/destinos" className="block px-3 py-2">
                Destinos
              </LoadingLink>
              <LoadingLink href="/paquetes" className="block px-3 py-2">
                Paquetes
              </LoadingLink>
              <LoadingLink href="/contacto" className="block px-3 py-2">
                Contacto
              </LoadingLink>
              <LoadingLink href="/politicas" className="block px-3 py-2">
                Políticas
              </LoadingLink>
              {auth.user && (
                <LoadingLink href="/visita-reciente" className="block px-3 py-2">
                  Vistos Recientemente
                </LoadingLink>
              )}
              {/* Mostrar Panel Admin o Mi Panel según el rol */}
              {(() => {
                const { user } = auth;
                if (!user) return null;
                
                // Verificar si el usuario es admin (rol 1 o rol "admin")
                const roleStrMobile = String(user?.role || "").toLowerCase();
                const isAdmin = user?.roles?.includes(1) || roleStrMobile === "administrador";
                // Verificar si el usuario es soporte (rol 4 o rol "soporte")
                const isSupport = user?.roles?.includes(4) || roleStrMobile === "soporte";
                // Verificar si el usuario es cliente (rol 2 o rol "cliente")
                const isClient = user?.roles?.includes(2) || roleStrMobile === "cliente";
                
                if (isAdmin) {
                  return (
                    <LoadingLink href="/panel" className="block px-3 py-2">
                      Panel Admin
                    </LoadingLink>
                  );
                } else if (isSupport) {
                  return (
                    <LoadingLink href="/panel" className="block px-3 py-2">
                      Panel Soporte
                    </LoadingLink>
                  );
                } else if (isClient) {
                  return (
                    <LoadingLink href="/cliente?tab=reservas" className="block px-3 py-2">
                      Mi Panel
                    </LoadingLink>
                  );
                }
                return null;
              })()}
              {(() => {
                const { user } = auth;
                if (user) {
                  return <NavUser user={user} />;
                } else {
                  return (
                    <LoadingLink href="/login" className="block px-3 py-2">
                      Iniciar Sesión
                    </LoadingLink>
                  );
                }
              })()}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
