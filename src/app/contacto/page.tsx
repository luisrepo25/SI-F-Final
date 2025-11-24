"use client"

import type React from "react"

import { Navegacion } from "@/components/comunes/navegacion"
import { Breadcrumbs } from "@/components/comunes/breadcrumbs"
import { PiePagina } from "@/components/comunes/pie-pagina"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"

export default function ContactoPage() {
  const [datosFormulario, setDatosFormulario] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    asunto: "",
    mensaje: "",
  })

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault()

    if (!datosFormulario.nombre.trim() || !datosFormulario.apellido.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa tu nombre y apellido",
        variant: "destructive",
      })
      return
    }

    if (!datosFormulario.email.trim() || !/\S+@\S+\.\S+/.test(datosFormulario.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor ingresa un email válido",
        variant: "destructive",
      })
      return
    }

    if (!datosFormulario.asunto || !datosFormulario.mensaje.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor selecciona un asunto y escribe tu mensaje",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "¡Mensaje enviado!",
      description: "Hemos recibido tu mensaje. Te contactaremos pronto.",
    })

    setDatosFormulario({
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      asunto: "",
      mensaje: "",
    })
  }

  const contactoDirecto = (tipo: string, valor: string) => {
    switch (tipo) {
      case "telefono":
        window.open(`tel:${valor}`, "_self")
        break
      case "whatsapp":
        window.open(`https://wa.me/${valor.replace(/\D/g, "")}`, "_blank")
        break
      case "email":
        window.open(`mailto:${valor}`, "_self")
        break
      case "mapa":
        window.open("https://maps.google.com/?q=Av.+16+de+Julio+1234+La+Paz+Bolivia", "_blank")
        break
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      <Navegacion />
      <Breadcrumbs />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-foreground">
            <span className="text-primary">Contáctanos</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Estamos aquí para ayudarte a planificar tu aventura perfecta en Bolivia. ¡Hablemos!
          </p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="space-y-8">
              <div>
                <h2 className="font-heading font-bold text-2xl text-foreground mb-4">Envíanos un mensaje</h2>
                <p className="text-muted-foreground">
                  Completa el formulario y nos pondremos en contacto contigo en menos de 24 horas.
                </p>
              </div>

              <Card>
                <CardContent className="p-6">
                  <form onSubmit={manejarEnvio} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="text-sm font-medium text-foreground">
                          Nombre *
                        </label>
                        <Input
                          id="firstName"
                          placeholder="Tu nombre"
                          value={datosFormulario.nombre}
                          onChange={(e) => setDatosFormulario({ ...datosFormulario, nombre: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="text-sm font-medium text-foreground">
                          Apellido *
                        </label>
                        <Input
                          id="lastName"
                          placeholder="Tu apellido"
                          value={datosFormulario.apellido}
                          onChange={(e) => setDatosFormulario({ ...datosFormulario, apellido: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-foreground">
                        Email *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={datosFormulario.email}
                        onChange={(e) => setDatosFormulario({ ...datosFormulario, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium text-foreground">
                        Teléfono
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+591 123 456 789"
                        value={datosFormulario.telefono}
                        onChange={(e) => setDatosFormulario({ ...datosFormulario, telefono: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium text-foreground">
                        Asunto *
                      </label>
                      <select
                        id="subject"
                        value={datosFormulario.asunto}
                        onChange={(e) => setDatosFormulario({ ...datosFormulario, asunto: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        required
                      >
                        <option value="">Selecciona un tema</option>
                        <option value="informacion">Información general</option>
                        <option value="reserva">Hacer una reserva</option>
                        <option value="paquete-personalizado">Paquete personalizado</option>
                        <option value="cancelacion">Cancelación o cambios</option>
                        <option value="reclamo">Reclamo o sugerencia</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-foreground">
                        Mensaje *
                      </label>
                      <Textarea
                        id="message"
                        placeholder="Cuéntanos cómo podemos ayudarte..."
                        rows={5}
                        value={datosFormulario.mensaje}
                        onChange={(e) => setDatosFormulario({ ...datosFormulario, mensaje: e.target.value })}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Enviar mensaje
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="font-heading font-bold text-2xl text-foreground mb-4">Información de contacto</h2>
                <p className="text-muted-foreground">
                  También puedes contactarnos directamente a través de estos medios.
                </p>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div
                      className="flex items-start space-x-4 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
                      onClick={() => contactoDirecto("mapa", "")}
                    >
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Oficina principal</h3>
                        <p className="text-muted-foreground text-sm">
                          Av. 16 de Julio 1234
                          <br />
                          La Paz, Bolivia
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Phone className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-foreground mb-1">Teléfonos</h3>
                        <p
                          className="text-muted-foreground text-sm cursor-pointer hover:text-primary transition-colors"
                          onClick={() => contactoDirecto("telefono", "+59121234567")}
                        >
                          +591 2 123 4567 (Oficina)
                        </p>
                        <p
                          className="text-muted-foreground text-sm cursor-pointer hover:text-primary transition-colors"
                          onClick={() => contactoDirecto("whatsapp", "+59178901234")}
                        >
                          +591 7 890 1234 (WhatsApp)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-foreground mb-1">Email</h3>
                        <p
                          className="text-muted-foreground text-sm cursor-pointer hover:text-primary transition-colors"
                          onClick={() => contactoDirecto("email", "info@descubrebolivia.com")}
                        >
                          info@descubrebolivia.com
                        </p>
                        <p
                          className="text-muted-foreground text-sm cursor-pointer hover:text-primary transition-colors"
                          onClick={() => contactoDirecto("email", "reservas@descubrebolivia.com")}
                        >
                          reservas@descubrebolivia.com
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Horarios de atención</h3>
                        <p className="text-muted-foreground text-sm">
                          Lunes a Viernes: 8:00 - 18:00
                          <br />
                          Sábados: 9:00 - 15:00
                          <br />
                          Domingos: Cerrado
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* FAQ Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading font-bold text-lg">Preguntas frecuentes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-1">¿Cuánto tiempo antes debo reservar?</h4>
                    <p className="text-muted-foreground text-sm">
                      Recomendamos reservar con al menos 2 semanas de anticipación, especialmente en temporada alta.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-1">¿Puedo cancelar mi reserva?</h4>
                    <p className="text-muted-foreground text-sm">
                      Sí, puedes cancelar hasta 48 horas antes sin costo adicional.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-1">¿Ofrecen tours privados?</h4>
                    <p className="text-muted-foreground text-sm">
                      Sí, ofrecemos tours privados y paquetes personalizados según tus necesidades.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <PiePagina />
    </div>
  )
}
