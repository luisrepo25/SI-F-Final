"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

export function useBreadcrumbs() {
  const pathname = usePathname();

  const breadcrumbs = useMemo((): BreadcrumbItem[] => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Siempre incluir Home
    breadcrumbs.push({
      label: "Inicio",
      href: "/",
      current: pathname === "/",
    });

    // Si estamos en la página de inicio, solo mostrar Home
    if (pathname === "/") {
      return breadcrumbs;
    }

    // Mapear segmentos de la URL a labels más amigables
    const segmentToLabel: Record<string, string> = {
      destinos: "Destinos",
      paquetes: "Paquetes",
      contacto: "Contacto",
      reserva: "Reservar",
      cliente: "Mi Panel",
      panel: "Panel Admin",
      login: "Iniciar Sesión",
      "cambiar-password": "Cambiar Contraseña",
      dashboard: "Dashboard",
    };

    // Construir breadcrumbs basado en los segmentos de la ruta
    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // Si es un ID (típicamente UUIDs o números), mostrar como "Detalle"
      const isId = /^[a-zA-Z0-9-]+$/.test(segment) && segment.length > 10;
      const label = isId ? "Detalle" : segmentToLabel[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

      breadcrumbs.push({
        label,
        href: currentPath,
        current: isLast,
      });
    });

    return breadcrumbs;
  }, [pathname]);

  return breadcrumbs;
}

// Hook para obtener la página actual
export function useCurrentPageInfo() {
  const pathname = usePathname();
  
  const pageInfo = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    
    if (pathname === "/") {
      return { title: "Inicio", section: "home" };
    }
    
    const firstSegment = segments[0];
    const isDetailPage = segments.length > 1;
    
    const sectionTitles: Record<string, string> = {
      destinos: "Destinos",
      paquetes: "Paquetes",
      contacto: "Contacto",
      reserva: "Reservar",
      cliente: "Mi Panel",
      panel: "Panel Admin",
      login: "Iniciar Sesión",
    };
    
    return {
      title: sectionTitles[firstSegment] || firstSegment?.charAt(0).toUpperCase() + firstSegment?.slice(1) || "Página",
      section: firstSegment || "home",
      isDetailPage,
    };
  }, [pathname]);
  
  return pageInfo;
}