"use client"

import {
  IconCreditCard,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import useAuth from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSidebar } from "@/components/ui/sidebar";
import { LoadingLink } from "@/components/EfectoCarga/vista-cargando";

export function NavUser({ user }: { user: { name: string; email: string; avatar: string; roles?: number[]; } }) {
  const { logout } = useAuth();
  const { isMobile } = useSidebar();
  if (!user) return null;

  // Verificar si el usuario es admin (rol ID 1) o soporte (rol ID 4)
  const isAdmin = user.roles?.includes(1) || false;
  const isSupport = user.roles?.includes(4) || false;
  const isClient = user.roles?.includes(2) || false;

  // Solo el primer nombre y la inicial
  const getInitials = (name: string) => {
    if (!name) return "U";
    const first = name.trim().split(" ")[0];
    return first.charAt(0).toUpperCase();
  };
  const getFirstName = (name: string) => {
    if (!name) return "Usuario";
    return name.trim().split(" ")[0];
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-center focus:outline-none">
          <Avatar className="h-9 w-9 rounded-full grayscale">
            {user.avatar ? (
              <AvatarImage src={user.avatar} alt={user.name} />
            ) : null}
            <AvatarFallback className="rounded-full">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-56 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-full">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt={user.name} />
              ) : null}
              <AvatarFallback className="rounded-full">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{getFirstName(user.name)}</span>
              <span className="text-muted-foreground truncate text-xs">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {isClient && (
            <DropdownMenuItem asChild>
              <LoadingLink href="/cliente?tab=reservas" className="flex items-center gap-2 w-full">
                <IconUserCircle />
                Mi Panel
              </LoadingLink>
            </DropdownMenuItem>
          )}
          {isAdmin && (
            <DropdownMenuItem asChild>
              <LoadingLink href="/panel?tab=usuarios" className="flex items-center gap-2 w-full">
                <IconUserCircle />
                Panel Admin
              </LoadingLink>
            </DropdownMenuItem>
          )}
          {isSupport && (
            <DropdownMenuItem asChild>
              <LoadingLink href="/panel?tab=usuarios" className="flex items-center gap-2 w-full">
                <IconUserCircle />
                Panel Soporte
              </LoadingLink>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem>
            <IconCreditCard />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <IconNotification />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="cursor-pointer">
          <IconLogout />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
