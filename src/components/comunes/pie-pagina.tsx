"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from "lucide-react"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"

export function PiePagina() {
  const [emailNewsletter, setEmailNewsletter] = useState("")

  const manejarSuscripcion = (e: React.FormEvent) => {
    e.preventDefault()

    if (!emailNewsletter.trim()) {
      toast({
        title: "Email requerido",
        description: "Por favor ingresa tu email para suscribirte",
        variant: "destructive",
      })
      return
    }

    if (!/\S+@\S+\.\S+/.test(emailNewsletter)) {
      toast({
        title: "Email inválido",
        description: "Por favor ingresa un email válido",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "¡Suscripción exitosa!",
      description: "Te has suscrito correctamente a nuestro newsletter",
    })

    setEmailNewsletter("")
  }

  const abrirRedSocial = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <footer className="text-white bg-gradient-to-br from-amber-900 to-amber-800">
      <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg">
                <span className="text-lg font-black text-primary font-heading">B</span>
              </div>
              <span className="text-xl font-black font-heading">Descubre Bolivia</span>
            </div>
            <p className="text-sm leading-relaxed text-amber-100">
              Tu guía definitiva para explorar los destinos más impresionantes de Bolivia. Descubre paisajes únicos,
              cultura vibrante y aventuras inolvidables.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className="p-2 text-white hover:bg-white/10"
                onClick={() => abrirRedSocial("https://facebook.com/descubrebolivia")}
              >
                <Facebook className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 text-white hover:bg-white/10"
                onClick={() => abrirRedSocial("https://instagram.com/descubrebolivia")}
              >
                <Instagram className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 text-white hover:bg-white/10"
                onClick={() => abrirRedSocial("https://twitter.com/descubrebolivia")}
              >
                <Twitter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-heading">Enlaces rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm transition-colors text-amber-100 hover:text-white">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/destinos" className="text-sm transition-colors text-amber-100 hover:text-white">
                  Destinos
                </Link>
              </li>
              <li>
                <Link href="/paquetes" className="text-sm transition-colors text-amber-100 hover:text-white">
                  Paquetes
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-sm transition-colors text-amber-100 hover:text-white">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Destinos populares */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-heading">Destinos populares</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/destinos/salar-de-uyuni"
                  className="text-sm transition-colors text-amber-100 hover:text-white"
                >
                  Salar de Uyuni
                </Link>
              </li>
              <li>
                <Link
                  href="/destinos/lago-titicaca"
                  className="text-sm transition-colors text-amber-100 hover:text-white"
                >
                  Lago Titicaca
                </Link>
              </li>
              <li>
                <Link href="/destinos/la-paz" className="text-sm transition-colors text-amber-100 hover:text-white">
                  La Paz
                </Link>
              </li>
              <li>
                <Link href="/destinos/potosi" className="text-sm transition-colors text-amber-100 hover:text-white">
                  Potosí
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-heading">Contacto</h3>
            <div className="space-y-3">
              <div
                className="flex items-center space-x-2 text-sm transition-colors cursor-pointer text-amber-100 hover:text-white"
                onClick={() => window.open("https://maps.google.com/?q=La+Paz+Bolivia", "_blank")}
              >
                <MapPin className="w-4 h-4" />
                <span>La Paz, Bolivia</span>
              </div>
              <div
                className="flex items-center space-x-2 text-sm transition-colors cursor-pointer text-amber-100 hover:text-white"
                onClick={() => window.open("tel:+59121234567", "_self")}
              >
                <Phone className="w-4 h-4" />
                <span>+591 2 123 4567</span>
              </div>
              <div
                className="flex items-center space-x-2 text-sm transition-colors cursor-pointer text-amber-100 hover:text-white"
                onClick={() => window.open("mailto:info@descubrebolivia.com", "_self")}
              >
                <Mail className="w-4 h-4" />
                <span>info@descubrebolivia.com</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Suscríbete a nuestro newsletter</h4>
              <form onSubmit={manejarSuscripcion} className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Tu email"
                  value={emailNewsletter}
                  onChange={(e) => setEmailNewsletter(e.target.value)}
                  className="text-white bg-white/10 border-white/20 placeholder:text-amber-200 focus:bg-white/20"
                />
                <Button type="submit" className="font-semibold bg-white text-amber-800 hover:bg-amber-50">
                  Suscribir
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between pt-8 mt-12 border-t border-amber-700 md:flex-row">
          <div className="text-sm text-amber-200">© {new Date().getFullYear()} Descubre Bolivia. Todos los derechos reservados.</div>
          <div className="flex mt-4 space-x-6 md:mt-0">
            <Link href="/privacidad" className="text-sm transition-colors text-amber-200 hover:text-white">
              Política de Privacidad
            </Link>
            <Link href="/terminos" className="text-sm transition-colors text-amber-200 hover:text-white">
              Términos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
