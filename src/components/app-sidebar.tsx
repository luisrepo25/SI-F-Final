"use client"

import {
  IconBell,
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"
import Link from "next/link"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import useAuth from "@/hooks/useAuth"

const data = {
  user: {
    name: "Usuario",
    email: "usuario@example.com",
    avatar: "/avatars/user.jpg",
  },
  navMain: [
    { title: "Dashboard", url: "/panel", icon: IconDashboard },
    { title: "Gestión de usuarios", url: "/panel/usuarios", icon: IconUsers },
    { title: "Lista Subs", url: "/panel/lista-subs", icon: IconReport },
    { title: "Gestión de reservas", url: "/panel/reservas", icon: IconListDetails },
    { title: "Políticas de cupones", url: "/panel/politicas", icon: IconListDetails },
    { title: "Campañas", url: "/panel/campanas", icon: IconReport },
    { title: "Notificaciones Push", url: "/panel/notificaciones", icon: IconBell },
    { title: "Reportes y Analíticas", url: "/panel/reportes", icon: IconChartBar },
    { title: "Gestión de informes", url: "#", icon: IconChartBar },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        { title: "Active Proposals", url: "#" },
        { title: "Archived", url: "#" },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        { title: "Active Proposals", url: "#" },
        { title: "Archived", url: "#" },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        { title: "Active Proposals", url: "#" },
        { title: "Archived", url: "#" },
      ],
    },
  ],
  navSecondary: [
    { title: "Configuración", url: "#", icon: IconSettings },
    { title: "Obtén ayuda", url: "#", icon: IconHelp },
    { title: "Buscar", url: "#", icon: IconSearch },
  ],
  documents: [
    { name: "Servicios", url: "/panel/servicios", icon: IconDatabase },
    { name: "Paquetes", url: "/panel/paquetes", icon: IconReport },
    { name: "Notificaciones", url: "/panel/notificaciones", icon: IconBell },
    { name: "Reportes", url: "/panel/reportes", icon: IconChartBar },
    { name: "Suscripción", url: "/panel/suscripcion", icon: IconFileAi },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth() // Obtener el usuario del contexto de autenticación

  // Determinar si el usuario es administrador
  const isAdmin = user?.role === "administrador"
  // Determinar si el usuario es proveedor
  const isProveedor = user?.role === "proveedor"

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Volver al inicio</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Mostrar NavMain solo si NO es proveedor */}
        {!isProveedor && <NavMain items={data.navMain} />}
        
        {/* Mostrar NavDocuments para todos los usuarios */}
        <NavDocuments items={data.documents} />
        
        {/* Mostrar NavSecondary para todos los usuarios */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        {/* Temporalmente oculto para encontrar el elemento S */}
        {/* {user && <NavUser user={user} />} */}
      </SidebarFooter>
    </Sidebar>
  )
}