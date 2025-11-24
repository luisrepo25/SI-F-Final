"use client"

import {
  User,
  Calendar,
  Package,
  Receipt,
  LayoutDashboard,
  Settings,
  HelpCircle,
} from "lucide-react"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import useAuth from "@/hooks/useAuth"

const data = {
  navMain: [
    {
      title: "Mi Perfil",
      url: "/cliente?tab=perfil",
      icon: User,
      isActive: true,
    },
    {
      title: "Mis Reservas",
      url: "/cliente?tab=reservas",
      icon: Calendar,
    },
    {
      title: "Mis Paquetes",
      url: "/cliente?tab=paquetes",
      icon: Package,
    },
    {
      title: "Historial de Compras",
      url: "/cliente?tab=historial",
      icon: Receipt,
    },
  ],
  navSecondary: [
    {
      title: "Soporte",
      url: "/contacto",
      icon: HelpCircle,
    },
    {
      title: "Configuración",
      url: "/cliente?tab=perfil",
      icon: Settings,
    },
  ],
}

export function AppSidebarClient({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/cliente?tab=reservas">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-sidebar-primary-foreground">
                  <LayoutDashboard className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Panel Cliente</span>
                  <span className="truncate text-xs">Turismo Bolivia</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className="flex items-center gap-2">
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <div className="mt-auto">
          <div className="px-3 py-2">
            <h4 className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
              Configuración
            </h4>
          </div>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {data.navSecondary.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url} className="flex items-center gap-2">
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
      <SidebarFooter>
        {user && (
          <div className="p-3 border-t border-sidebar-border">
            <div className="flex items-center gap-2">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <User className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name || "Cliente"}</span>
                <span className="truncate text-xs text-sidebar-foreground/70">
                  {user.email}
                </span>
              </div>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}