// src/app/suscripcion/page.tsx
"use client"
import React, { useEffect, useState } from "react";
import HeaderSubs from "./components/HeaderSubs";
import SubscriptionCard, { Datos } from "./components/CardSubcripcion";
import SubscriptionTestimonials from "./components/Testimonios";
import SubscriptionFAQ from "./components/Preguntas";
import { Navegacion } from "@/components/comunes/navegacion";
import { PiePagina } from "@/components/comunes/pie-pagina";
import { listarPlanes } from "@/api/plan";

export default function Page() {
  const [planes, setPlanes] = useState<Datos[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlanes();
  }, []);

  async function fetchPlanes() {
    setLoading(true);
    setError(null);
    try {
      const res = await listarPlanes();
      const allPlanes = res.data.results || res.data || [];
      const activos = allPlanes.filter((p: any) => p.activo === true);
      setPlanes(activos);
      // console.log("planes activos", activos);
    } catch (err: any) {
      setError("Error al cargar planes");
      console.error("Error fetching planes:", err);
    }
    setLoading(false);
  }

  return (
    <>
      <Navegacion />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12">
        <div className="container mx-auto px-4">
          <HeaderSubs />
          {error && (
            <div className="text-center text-red-500 mb-4">{error}</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {loading ? (
              <div className="col-span-4 text-center py-12">Cargando planes...</div>
            ) : planes.length === 0 ? (
              <div className="col-span-4 text-center py-12">No hay planes disponibles</div>
            ) : (
              planes.map((plan, idx) => (
                <SubscriptionCard 
                  key={plan.id || idx} 
                  datos={{
                    id: plan.id,
                    nombre: plan.nombre,
                    descripcion: plan.descripcion,
                    precio: plan.precio,
                    duracion: plan.duracion,
                    max_servicios: plan.max_servicios,
                    max_clientes_potenciales: plan.max_clientes_potenciales,
                    chat_directo: plan.chat_directo,
                    estadisticas_basicas: plan.estadisticas_basicas,
                    posicionamiento_destacado: plan.posicionamiento_destacado,
                    panel_metricas_avanzado: plan.panel_metricas_avanzado,
                    promociones_temporada: plan.promociones_temporada,
                    soporte_prioritario: plan.soporte_prioritario,
                    difusion_internacional: plan.difusion_internacional,
                    base_datos_viajeros_premium: plan.base_datos_viajeros_premium,
                    sello_verificado: plan.sello_verificado,
                    consultoria_marketing: plan.consultoria_marketing,
                    campanas_promocionales: plan.campanas_promocionales,
                    buttonText: "Elegir plan",
                  }} 
                />
              ))
            )}
          </div>
          <SubscriptionTestimonials />
          <SubscriptionFAQ />
          <div className="text-center bg-blue-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              ¿Listo para Impulsar tu Negocio Turístico?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Únete a más de 1,000 proveedores que ya están creciendo con
              nosotros
            </p>
          </div>
        </div>
      </div>
      <PiePagina />
    </>
  );
}