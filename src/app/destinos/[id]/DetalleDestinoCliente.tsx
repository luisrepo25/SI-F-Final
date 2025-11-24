"use client";

import { DetailBreadcrumbs } from "@/components/comunes/breadcrumbs";
import { PiePagina } from "@/components/comunes/pie-pagina";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Star,
  Heart,
  Share2,
  Clock,
  Users,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

import { Servicio } from "@/lib/servicios";
import CartIcon from "@/components/ui/cart-icon";

export default function DetalleDestinoCliente({ destino }: { destino: Servicio }) {
  const [esFavorito, setEsFavorito] = useState(false);
  const [titulo, setTitulo] = useState<string>("");

  // Estado para saber si el destino ya fue agregado al carrito
  const [agregado, setAgregado] = useState(false);

  // Función para agregar destino al carrito de servicios múltiples
  const manejarAgregarItinerario = () => {
    if (!destino) return;
    const carritoRaw = localStorage.getItem("itinerario_multiservicio");
    let carrito: any[] = [];
    try {
      carrito = carritoRaw ? JSON.parse(carritoRaw) : [];
    } catch {
      carrito = [];
    }
    if (carrito.some((d) => d.id === destino.id)) {
      setAgregado(true);
      return;
    }
    carrito.push({
      id: destino.id,
      nombre: destino.titulo,
      precio:
        typeof destino.precio_usd === "string"
          ? parseFloat(destino.precio_usd)
          : destino.precio_usd,
      imagen: Array.isArray(destino.imagen_url)
        ? destino.imagen_url[0]
        : destino.imagen_url,
    });
    localStorage.setItem("itinerario_multiservicio", JSON.stringify(carrito));
    setAgregado(true);
    toast({
      title: "Agregado al itinerario",
      description: `${destino.titulo} se añadió a tu itinerario personalizado.`,
    });
  };
  const router = useRouter();

  useEffect(() => {
    if (destino) {
      setTitulo(destino.titulo);
    }
  }, [destino]);

  const manejarFavorito = () => {
    setEsFavorito(!esFavorito);
    toast({
      title: esFavorito ? "Eliminado de favoritos" : "Agregado a favoritos",
      description: esFavorito
        ? `${destino?.titulo} ha sido eliminado de tus favoritos`
        : `${destino?.titulo} ha sido agregado a tus favoritos`,
    });
  };

  const manejarCompartir = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: destino?.titulo,
          text: destino?.descripcion || "",
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error al compartir:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "URL copiada",
        description: "El enlace ha sido copiado al portapapeles",
      });
    }
  };

  const manejarReserva = () => {
  if (!destino) {
    toast({
      title: "Error",
      description: "No se pudo cargar la información del destino",
      variant: "destructive",
    });
    return;
  }

  // 🔹 Recuperar los parámetros actuales de búsqueda
  const params = new URLSearchParams(window.location.search);

  const destinoParam = destino.titulo || "";
  const fechaInicio = params.get("fechaInicio") || "";
  const fechaFin = params.get("fechaFin") || "";
  const personas = params.get("personas") || "1";

  // 🔹 Armar los parámetros para la reserva
  const reservaParams = new URLSearchParams({
    servicio: destino.id?.toString() || "",
    nombre: destino.titulo || "",
    precio: destino.precio_usd?.toString() || "0",
    destino: destinoParam,
    fechaInicio,
    fechaFin,
    personas,
  });

  router.push(`/reserva?${reservaParams.toString()}`);
};


  if (!destino || typeof destino !== "object") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Destino no encontrado
          </h2>
          <p className="text-gray-600 mb-4">
            El destino que buscas no existe o ha sido eliminado.
          </p>
          <Button onClick={() => router.push("/destinos")}>
            Volver a Destinos
          </Button>
        </Card>
      </div>
    );
  }

  // Imagen por defecto si no hay imagen_url o si la URL no es absoluta
  const esUrlAbsoluta = (url: string | null | undefined) => {
    if (!url) return false;
    return url.startsWith("http://") || url.startsWith("https://");
  };

  const imagenPrincipal = esUrlAbsoluta(destino.imagen_url)
    ? destino.imagen_url
    : "/placeholder.svg";

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      <CartIcon />
      <DetailBreadcrumbs
        parentPage="Destinos"
        parentHref="/destinos"
        currentPageTitle={titulo || "Detalle del Destino"}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Imagen principal */}
          <div className="relative">
            <Image
              src={imagenPrincipal}
              alt={destino.titulo || "imagen-destino"}
              width={600}
              height={400}
              className="w-full h-[400px] object-cover rounded-2xl shadow-lg"
              priority
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={manejarFavorito}
                className="bg-white/80 hover:bg-white"
              >
                <Heart
                  className={`h-4 w-4 ${
                    esFavorito ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={manejarCompartir}
                className="bg-white/80 hover:bg-white"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Información del destino */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-700"
                >
                  {destino.categoria?.nombre || "Sin categoría"}
                </Badge>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{4.5}</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {destino.titulo || "No disponible"}
              </h1>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{destino.punto_encuentro || "No disponible"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 mt-2">
                <span className="font-semibold">Proveedor:</span>
                <span>{destino.proveedor?.nombre || "Sin proveedor"}</span>
              </div>
            </div>

            <p className="text-gray-700 text-lg leading-relaxed">
              {destino.descripcion || "No disponible"}
            </p>

            {/* Detalles rápidos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Duración</p>
                  <p className="font-medium">
                    {destino.duracion || "No disponible"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Tipo</p>
                  <p className="font-medium">{destino.categoria?.nombre || "No disponible"}</p>
                </div>
              </div>
            </div>

            {/* Precio y reserva */}
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">Precio por persona</p>
                  <p className="text-3xl font-bold text-blue-700">
                    {destino.precio_usd != null && destino.precio_usd !== "" ? `USD ${destino.precio_usd}` : "Consultar"}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <Button
                onClick={manejarReserva}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105"
                size="lg"
              >
                Reservar Ahora
              </Button>
              <Button
                onClick={manejarAgregarItinerario}
                className={`w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 ${
                  agregado ? "opacity-70 cursor-not-allowed" : ""
                }`}
                size="lg"
                disabled={agregado}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7a1 1 0 00.9 1.3h12.2a1 1 0 00.9-1.3L17 13M7 13V6h13" /></svg>
                {agregado ? "Agregado al carrito" : "Agregar al carrito de servicios múltiples"}
              </Button>
            </Card>
          </div>
        </div>

        {/* Información adicional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Qué incluye
            </h3>
            <ul className="space-y-2 text-gray-700">
              {destino.servicios_incluidos && destino.servicios_incluidos.length > 0 ? (
                destino.servicios_incluidos.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {item || "No disponible"}
                  </li>
                ))
              ) : (
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  No especificado
                </li>
              )}
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Descripción adicional
            </h3>
            <div className="text-gray-700">
              {destino.descripcion ? (
                <p>{destino.descripcion}</p>
              ) : (
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Alimentación no incluida
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Gastos personales
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Propinas opcionales
                  </li>
                </ul>
              )}
            </div>
          </Card>
        </div>
      </div>
      {/* <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto"> 
        {JSON.stringify(destino, null, 2)}
      </pre> */}
      <PiePagina />
      {/* DEBUG: Mostrar datos reales del destino */}
      <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-x-auto mt-4">
        {JSON.stringify(destino, null, 2)}
      </pre>
    </div>
  );
}
