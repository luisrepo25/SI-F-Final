"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  customItems?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ customItems, className }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Función para generar breadcrumbs automáticamente basado en la ruta
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customItems) {
      return customItems;
    }

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
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav
      className={cn(
        "flex items-center space-x-1 text-sm text-muted-foreground bg-white/50 backdrop-blur-sm border-b border-border py-3 px-4 sm:px-6 lg:px-8",
        className
      )}
      aria-label="Breadcrumb"
    >
      <div className="w-full max-w-7xl mx-auto flex items-center space-x-1">
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={item.href}>
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
            )}
            <div className="flex items-center">
              {index === 0 && (
                <Home className="h-4 w-4 mr-1" />
              )}
              {item.current ? (
                <span className="font-medium text-foreground">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors hover:underline"
                >
                  {item.label}
                </Link>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
}

// Componente específico para páginas de detalle que pueden necesitar breadcrumbs personalizados
export function DetailBreadcrumbs({
  parentPage,
  parentHref,
  currentPageTitle,
  className,
}: {
  parentPage: string;
  parentHref: string;
  currentPageTitle: string;
  className?: string;
}) {
  const customItems: BreadcrumbItem[] = [
    { label: "Inicio", href: "/" },
    { label: parentPage, href: parentHref },
    { label: currentPageTitle, href: "#", current: true },
  ];

  return <Breadcrumbs customItems={customItems} className={className} />;
}