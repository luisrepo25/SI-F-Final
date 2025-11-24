"use client"

import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useSearchParams } from "next/navigation"
import ProtectedRoute from "@/components/ProtectedRoute"
import ClientDashboard from "@/components/client-dashboard"
import ClientReservations from "@/components/client-reservations"
import ClientPurchaseHistory from "@/components/client-purchase-history"
import ClientPackages from "@/components/client-packages"
import { AppSidebarClient } from "@/components/app-sidebar-client"

export default function ClientPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "perfil";

  const renderContent = () => {
    switch (tab) {
      case "reservas":
        return <ClientReservations />;
      case "paquetes":
        return <ClientPackages />;
      case "historial":
        return <ClientPurchaseHistory />;
      case "perfil":
      default:
        return <ClientDashboard />;
    }
  };

  return (
    <ProtectedRoute 
      allowedRoles={[2]} // Solo cliente (rol ID 2) - CORREGIDO
      requireAuth={true}
      redirectTo="/"
    >
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebarClient variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {renderContent()}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
