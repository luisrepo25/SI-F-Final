"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { usePathname } from "next/navigation"

type LoadingContextType = {
  activeHref: string | null
  setActiveHref: (href: string | null) => void
}

const LoadingLinkContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingLinkProvider({ children }: { children: React.ReactNode }) {
  const [activeHref, setActiveHref] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    setActiveHref(null)
  }, [pathname])

  return (
    <LoadingLinkContext.Provider value={{ activeHref, setActiveHref }}>
      {children}
    </LoadingLinkContext.Provider>
  )
}

export function useLoadingLink() {
  const context = useContext(LoadingLinkContext)
  if (!context) throw new Error("useLoadingLink must be used inside LoadingLinkProvider")
  return context
}
