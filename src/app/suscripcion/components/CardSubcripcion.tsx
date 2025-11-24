// components/SubscriptionCard.tsx
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
  CardTitle
} from "@/components/ui/card";
import { DollarSign, Download, Users, Building } from "lucide-react";
import { cn } from "@/lib/utils";


const backendUrl = process.env.NEXT_PUBLIC_API_URL;

interface Datos {
  titulo: string;
  descripcion: string;
  precio: number;
  tiempo: string;
  incluye: { icon: string; text: string }[];
  buttonText: string;
}

function SubscriptionCard({ datos }: { datos: Datos }) {
  const { user } = useContext(AuthContext) || {};
  const [cargando, setCargando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  
  const isAnual = datos.tiempo.toLowerCase().includes("anual");
  const isSemestral = datos.tiempo.toLowerCase().includes("semestral");

  const verificarProveedor = async (): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      // ✅ CORREGIDO: Buscar proveedor por usuario_id
      const response = await fetch(`${backendUrl}/proveedores/?usuario=${user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        // Si hay resultados, el usuario ya es proveedor
        return data.length > 0;
      }
      return false;
    } catch (error) {
      console.error("Error verificando proveedor:", error);
      return false;
    }
  };

  const manejarClickSuscripcion = async () => {
    if (!user || !user.id) {
      alert("Debes iniciar sesión antes de continuar con la suscripción.");
      return;
    }

    setCargando(true);

    try {
      // Verificar si el usuario ya es proveedor
      const esProveedor = await verificarProveedor();
      
      if (!esProveedor) {
        // Mostrar modal para registrar datos del proveedor
        setModalAbierto(true);
      } else {
        // Proceder directamente con la suscripción
        await procesarSuscripcion();
      }
    } catch (error) {
      console.error("Error verificando proveedor:", error);
      alert("Error al verificar tu información de proveedor.");
    } finally {
      setCargando(false);
    }
  };

  const manejarGuardarProveedor = async (datosProveedor: any) => {
    if (!user?.id) return;

    setCargando(true);

    try {
      // ✅ CORREGIDO: Usar 'usuario' en lugar de 'usuario_id'
      const response = await fetch(`${backendUrl}/proveedores/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario: user.id,  // ✅ Cambiado a 'usuario'
          ...datosProveedor
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // ✅ Manejar error de proveedor ya existente
        if (response.status === 400 && responseData.detail?.includes("ya tiene un proveedor")) {
          alert("Ya tienes un proveedor registrado. Procediendo con la suscripción...");
          setModalAbierto(false);
          await procesarSuscripcion(datosProveedor);
          return;
        }
        throw new Error(responseData.error || responseData.detail || "Error al registrar proveedor");
      }

      // Cerrar modal y procesar suscripción
      setModalAbierto(false);
      await procesarSuscripcion(datosProveedor);

    } catch (error) {
      console.error("Error registrando proveedor:", error);
      
      // ✅ Manejo específico para error de unique constraint
      if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
        alert("Ya tienes un proveedor registrado. Procediendo con la suscripción...");
        setModalAbierto(false);
        await procesarSuscripcion(datosProveedor);
      } else {
        alert(error instanceof Error ? error.message : "Error al registrar la información del proveedor.");
      }
    } finally {
      setCargando(false);
    }
  };

  const procesarSuscripcion = async (datosProveedor?: any) => {
    // Obtener los datos actuales del proveedor si existen
    let datosProveedorActual = datosProveedor;
    if (!datosProveedorActual) {
      try {
        const proveedorResponse = await fetch(`${backendUrl}/proveedores/?usuario=${user!.id}`);
        if (proveedorResponse.ok) {
          const proveedores = await proveedorResponse.json();
          if (proveedores.length > 0) {
            datosProveedorActual = {
              nombre_empresa: proveedores[0].nombre_empresa,
              descripcion: proveedores[0].descripcion,
              telefono: proveedores[0].telefono,
              sitio_web: proveedores[0].sitio_web
            };
          }
        }
      } catch (error) {
        console.error("Error obteniendo datos del proveedor:", error);
      }
    }

    const payload = {
      usuario_id: user!.id,
      nombre: datos.titulo,
      precio: datos.precio * 100,
      cantidad: 1,
      nombre_empresa: datosProveedorActual?.nombre_empresa || "Mi Empresa",
      descripcion: datosProveedorActual?.descripcion || datos.descripcion,
      telefono: datosProveedorActual?.telefono || user!.telefono || "",
      sitio_web: datosProveedorActual?.sitio_web || "https://tusitio.com",
    };

    console.log("📤 Enviando payload a suscripción:", payload);

    try {
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
    }
  };

  const cardClasses = cn(
    "w-[310px] border rounded-2xl shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg",
    {
      "bg-gradient-to-b from-yellow-100 via-white to-yellow-50 border-yellow-400": isSemestral,
      "bg-gradient-to-b from-blue-100 via-white to-blue-50 border-blue-500": isAnual,
      "bg-gradient-to-b from-gray-50 via-white to-gray-100 border-gray-300": !isAnual && !isSemestral,
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
            {datos.titulo}
          </CardTitle>
          <CardDescription>{datos.descripcion}</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">Bs. {datos.precio}</span>
              <Badge className={badgeClasses}>{datos.tiempo}</Badge>
            </div>

            <ul className="space-y-2 text-sm">
              {datos.incluye.map((item, index) => (
                <li key={index} className="flex items-center">
                  {item.icon === "DollarSign" && <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />}
                  {item.icon === "Users" && <Users className="mr-2 h-4 w-4 text-muted-foreground" />}
                  {item.icon === "Download" && <Download className="mr-2 h-4 w-4 text-muted-foreground" />}
                  {item.icon === "Building" && <Building className="mr-2 h-4 w-4 text-muted-foreground" />}
                  {item.text}
                </li>
              ))}
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
              datos.buttonText
            )}
          </Button>
        </CardFooter>
      </Card>

    </>
  );
}

export default SubscriptionCard;