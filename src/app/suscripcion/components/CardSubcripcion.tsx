// src/app/suscripcion/components/CardSubcripcion.tsx
"use client";

import React, { useState, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DollarSign,
  Download,
  Users,
  Building,
  MapPin,
  MessageSquare,
  BarChart,
  TrendingUp,
  Gift,
  Headphones,
  Globe,
  BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const backendUrl = process.env.NEXT_PUBLIC_API_URL;

export interface Datos {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string;
  duracion: string;
  max_servicios?: number;
  max_clientes_potenciales?: number;
  chat_directo?: boolean;
  estadisticas_basicas?: boolean;
  posicionamiento_destacado?: boolean;
  panel_metricas_avanzado?: boolean;
  promociones_temporada?: boolean;
  soporte_prioritario?: boolean;
  difusion_internacional?: boolean;
  base_datos_viajeros_premium?: boolean;
  sello_verificado?: boolean;
  consultoria_marketing?: boolean;
  campanas_promocionales?: boolean;
  buttonText?: string;
}

function SubscriptionCard({ datos }: { datos: Datos }) {
  const { user, reloadUser } = useContext(AuthContext) || {};
  const [cargando, setCargando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [datosProveedor, setDatosProveedor] = useState({
    nombre_empresa: "",
    descripcion: "",
    telefono: "",
    sitio_web: ""
  });

  // Validar que datos existe y tiene las propiedades necesarias
  if (!datos) {
    return (
      <Card className="w-[310px] border rounded-2xl shadow-md">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            Error: Datos no disponibles
          </div>
        </CardContent>
      </Card>
    );
  }

  // Usar valores por defecto para evitar errores
  const duracion = datos.duracion || "mensual";
  const nombre = datos.nombre || "Plan Sin Nombre";
  const descripcion = datos.descripcion || "Descripción no disponible";
  const precio = datos.precio || "0.00";

  const isAnual = duracion.toLowerCase().includes("anual");
  const isSemestral = duracion.toLowerCase().includes("semestral");

  // Generar array de beneficios
  type Beneficio = { icon: string; text: string };
  const beneficios: Beneficio[] = [
    datos.max_servicios !== undefined
      ? {
          icon: "MapPin",
          text: `Publica hasta ${
            datos.max_servicios === 0
              ? "ilimitadas"
              : datos.max_servicios + " experiencias o tours"
          }`,
        }
      : null,
    datos.max_clientes_potenciales !== undefined
      ? {
          icon: "Users",
          text: `Acceso a ${
            datos.max_clientes_potenciales === 0
              ? "ilimitados"
              : datos.max_clientes_potenciales + " clientes potenciales por mes"
          }`,
        }
      : null,
    datos.chat_directo
      ? {
          icon: "MessageSquare",
          text: "Chat directo con viajeros interesados",
        }
      : null,
    datos.estadisticas_basicas
      ? {
          icon: "BarChart",
          text: "Estadísticas básicas de visitas",
        }
      : null,
    datos.posicionamiento_destacado
      ? {
          icon: "TrendingUp",
          text: "Posicionamiento destacado en resultados",
        }
      : null,
    datos.panel_metricas_avanzado
      ? {
          icon: "BarChart",
          text: "Panel avanzado de métricas",
        }
      : null,
    datos.promociones_temporada
      ? {
          icon: "Gift",
          text: "Promociones destacadas en temporadas altas",
        }
      : null,
    datos.soporte_prioritario
      ? {
          icon: "Headphones",
          text: "Soporte prioritario 24/7",
        }
      : null,
    datos.difusion_internacional
      ? {
          icon: "Globe",
          text: "Difusión internacional de tus experiencias",
        }
      : null,
    datos.base_datos_viajeros_premium
      ? {
          icon: "Users",
          text: "Acceso a base de datos de viajeros premium",
        }
      : null,
    datos.sello_verificado
      ? {
          icon: "BadgeCheck",
          text: "Sello de proveedor verificado",
        }
      : null,
    datos.consultoria_marketing
      ? {
          icon: "BarChart",
          text: "Consultoría personalizada de marketing turístico",
        }
      : null,
    datos.campanas_promocionales
      ? {
          icon: "Gift",
          text: "Campañas promocionales incluidas durante el año",
        }
      : null,
  ].filter((b): b is Beneficio => b !== null);

  const cardClasses = cn(
    "w-[310px] border rounded-2xl shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg",
    {
      "bg-gradient-to-b from-yellow-100 via-white to-yellow-50 border-yellow-400":
        isSemestral,
      "bg-gradient-to-b from-blue-100 via-white to-blue-50 border-blue-500":
        isAnual,
      "bg-gradient-to-b from-gray-50 via-white to-gray-100 border-gray-300":
        !isAnual && !isSemestral,
    }
  );

  const badgeClasses = cn("text-xs font-semibold", {
    "bg-blue-600 text-white": isAnual,
    "bg-yellow-500 text-white": isSemestral,
    "bg-gray-600 text-white": !isAnual && !isSemestral,
  });

  const buttonClasses = cn("w-full", {
    "bg-blue-600 hover:bg-blue-700 text-white": isAnual,
    "bg-yellow-500 hover:bg-yellow-600 text-white": isSemestral,
    "bg-gray-600 hover:bg-gray-700 text-white": !isAnual && !isSemestral,
  });

  const manejarClickSuscripcion = async () => {
    if (!user || !user.id) {
      alert("Debes iniciar sesión antes de continuar con la suscripción.");
      return;
    }
    
    // Mostrar modal directamente para registrar datos del proveedor
    setModalAbierto(true);
  };

  const procesarSuscripcion = async () => {
    if (!user?.id) return;

    setCargando(true);

    try {
      // ✅ CORREGIDO: Payload según lo que espera el backend actualizado
      const payload = {
        plan_id: datos.id,
        usuario_id: user.id, // ✅ Ahora el backend espera usuario_id
        nombre_empresa: datosProveedor.nombre_empresa || "Mi Empresa",
        descripcion: datosProveedor.descripcion || datos.descripcion,
        telefono: datosProveedor.telefono || user.telefono || "",
        sitio_web: datosProveedor.sitio_web || "",
      };

      console.log("📤 Enviando payload a suscripción:", payload);

      const res = await fetch(`${backendUrl}/crear-checkout-session-suscripcion/`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type");
      
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("❌ El servidor devolvió HTML:", text.substring(0, 200));
        throw new Error("Error en la respuesta del servidor.");
      }

      const json = await res.json();

      if (!res.ok) {
        console.error("❌ Error del backend:", json);
        alert(json.error || json.message || "Error al procesar la suscripción.");
        return;
      }

      // Actualizar el usuario global en el contexto
      if (reloadUser) {
        await reloadUser();
      }

      if (json.checkout_url) {
        console.log("✅ Redirigiendo a checkout:", json.checkout_url);
        window.location.href = json.checkout_url;
      } else if (json.url) {
        console.log("✅ Redirigiendo a checkout:", json.url);
        window.location.href = json.url;
      } else {
        console.error("❌ No se recibió URL de checkout:", json);
        alert("No se pudo obtener la URL de pago.");
      }
    } catch (error) {
      console.error("⚠️ Error enviando a Stripe:", error);
      alert(error instanceof Error ? error.message : "No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  const manejarContinuar = async () => {
    if (!datosProveedor.nombre_empresa.trim()) {
      alert("Por favor ingresa el nombre de tu empresa.");
      return;
    }

    setCargando(true);
    try {
      // Cerrar modal y procesar suscripción directamente
      setModalAbierto(false);
      await procesarSuscripcion();
    } catch (error) {
      console.error("Error procesando suscripción:", error);
      alert("Error al procesar la suscripción.");
    } finally {
      setCargando(false);
    }
  };

  // Función para renderizar el ícono correcto
  const renderIcon = (iconName: string) => {
    const iconProps = { className: "mr-2 h-4 w-4 text-muted-foreground" };

    switch (iconName) {
      case "DollarSign":
        return <DollarSign {...iconProps} />;
      case "Users":
        return <Users {...iconProps} />;
      case "Download":
        return <Download {...iconProps} />;
      case "Building":
        return <Building {...iconProps} />;
      case "MapPin":
        return <MapPin {...iconProps} />;
      case "MessageSquare":
        return <MessageSquare {...iconProps} />;
      case "BarChart":
        return <BarChart {...iconProps} />;
      case "TrendingUp":
        return <TrendingUp {...iconProps} />;
      case "Gift":
        return <Gift {...iconProps} />;
      case "Headphones":
        return <Headphones {...iconProps} />;
      case "Globe":
        return <Globe {...iconProps} />;
      case "BadgeCheck":
        return <BadgeCheck {...iconProps} />;
      default:
        return <MapPin {...iconProps} />;
    }
  };

  return (
    <>
      <Card className={cardClasses}>
        <CardHeader>
          <CardTitle
            className={cn("text-lg font-bold", {
              "text-blue-700": isAnual,
              "text-yellow-700": isSemestral,
              "text-gray-700": !isAnual && !isSemestral,
            })}
          >
            {nombre}
          </CardTitle>
          <CardDescription>{descripcion}</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">Bs. {precio}</span>
              <Badge className={badgeClasses}>{duracion}</Badge>
            </div>

            <ul className="space-y-2 text-sm">
              {beneficios.length > 0 ? (
                beneficios.map((item, index) => (
                  <li key={index} className="flex items-center">
                    {renderIcon(item.icon)}
                    {item.text}
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No hay beneficios disponibles</li>
              )}
            </ul>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            onClick={manejarClickSuscripcion}
            className={buttonClasses}
            disabled={cargando}
          >
            {cargando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Procesando...
              </>
            ) : (
              datos.buttonText || "Elegir plan"
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Modal para registrar datos del proveedor */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Información de tu Empresa</h3>
            <p className="mb-4 text-sm text-gray-600">
              Para continuar con la suscripción, necesitamos algunos datos básicos de tu empresa.
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre de la empresa *</label>
                <input
                  type="text"
                  placeholder="Ej: Mi Agencia de Viajes"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={datosProveedor.nombre_empresa}
                  onChange={(e) => setDatosProveedor(prev => ({
                    ...prev,
                    nombre_empresa: e.target.value
                  }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  placeholder="Describe los servicios que ofreces..."
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={datosProveedor.descripcion}
                  onChange={(e) => setDatosProveedor(prev => ({
                    ...prev,
                    descripcion: e.target.value
                  }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <input
                  type="tel"
                  placeholder="Ej: 71234567"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={datosProveedor.telefono}
                  onChange={(e) => setDatosProveedor(prev => ({
                    ...prev,
                    telefono: e.target.value
                  }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Sitio web (opcional)</label>
                <input
                  type="url"
                  placeholder="https://tusitio.com"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={datosProveedor.sitio_web}
                  onChange={(e) => setDatosProveedor(prev => ({
                    ...prev,
                    sitio_web: e.target.value
                  }))}
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button
                onClick={manejarContinuar}
                disabled={cargando || !datosProveedor.nombre_empresa.trim()}
                className="flex-1"
              >
                {cargando ? "Procesando..." : "Continuar con el Pago"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setModalAbierto(false)}
                disabled={cargando}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SubscriptionCard;