"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import React from "react"
import { useLoadingLink } from "./contexto"

type LoadingLinkProps = {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void   // 👈 aceptamos un onClick opcional
}

export const LoadingLink = React.forwardRef<HTMLAnchorElement, LoadingLinkProps>(
  ({ href, children, className, onClick }: LoadingLinkProps, ref: React.Ref<HTMLAnchorElement>) => {
  const router = useRouter()
  const { activeHref, setActiveHref } = useLoadingLink()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    try {
      if (e && e.preventDefault) {
        e.preventDefault()
      }
      setActiveHref(href)   // 🔥 activa el botón
      router.push(href)     // cambia de página

      if (onClick) onClick() // 👈 ejecutamos también el onClick externo
    } catch (error) {
      console.error('Error en handleClick:', error)
    }
  }

  const isActive = activeHref === href

    return (
      <Link
        ref={ref}
        href={href}
        onClick={handleClick}
        className={`relative flex items-center gap-2 ${className}`}
      >
        {children}
        {isActive && (
          <span className="w-4 h-4 border-2 border-t-transparent border-primary rounded-full animate-spin"></span>
        )}
      </Link>
    )
  }
)

LoadingLink.displayName = 'LoadingLink'
