"use client"

import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ComponentType<any> 
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <IconCirclePlusFilled />
              <span>Dashboard Admin</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <IconMail />
              <span className="sr-only">Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            // Detectar si el ítem está activo por la ruta actual
            const isActive = typeof window !== 'undefined' && window.location && window.location.pathname + window.location.search === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <Link href={item.url} legacyBehavior passHref>
                  <a style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isActive}
                      className={
                        isActive
                          ? 'bg-orange-500 text-white hover:bg-orange-500 focus:bg-orange-500 active:bg-orange-500 focus-visible:ring-2 focus-visible:ring-orange-700 transition-colors duration-200'
                          : 'hover:bg-orange-100 hover:text-orange-700 focus:bg-orange-100 focus:text-orange-700 transition-colors duration-200'
                      }
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </a>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
