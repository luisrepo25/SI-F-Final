// app/suscripciones/page.tsx
import React from "react";
import HeaderSubs from "./components/HeaderSubs";
import SubscriptionCard from "./components/CardSubcripcion";
import SubscriptionTestimonials from "./components/Testimonios";
import SubscriptionFAQ from "./components/Preguntas";
import { Navegacion } from "@/components/comunes/navegacion";
import { PiePagina } from "@/components/comunes/pie-pagina";

const datos = [
  {
    titulo: "Plan Inicial",
    descripcion:
      "Ideal para nuevos proveedores que desean comenzar a promocionar sus servicios turísticos.",
    precio: 19.99,
    tiempo: "Mensual",
    incluye: [
      { icon: "MapPin", text: "Publica hasta 5 experiencias o tours" },
      { icon: "Users", text: "Acceso a 100 clientes potenciales por mes" },
      { icon: "MessageSquare", text: "Chat directo con viajeros interesados" },
      { icon: "BarChart", text: "Estadísticas básicas de visitas" },
    ],
    buttonText: "Elegir plan",
  },
  {
    titulo: "Plan Profesional",
    descripcion:
      "Perfecto para proveedores con más demanda que desean mayor visibilidad.",
    precio: 49.99,
    tiempo: "Trimestral",
    incluye: [
      { icon: "MapPin", text: "Publica hasta 20 experiencias o tours" },
      { icon: "Users", text: "Acceso a 1,000 clientes potenciales por mes" },
      { icon: "TrendingUp", text: "Posicionamiento destacado en resultados" },
      { icon: "BarChart", text: "Panel avanzado de métricas" },
      { icon: "Gift", text: "Promociones destacadas en temporadas altas" },
    ],
    buttonText: "Elegir plan",
  },
  {
    titulo: "Plan Premium",
    descripcion:
      "Diseñado para agencias consolidadas que buscan maximizar sus reservas.",
    precio: 89.99,
    tiempo: "Semestral",
    incluye: [
      { icon: "MapPin", text: "Publicaciones ilimitadas" },
      { icon: "Users", text: "Acceso ilimitado a clientes potenciales" },
      { icon: "Star", text: "Prioridad en la portada y recomendaciones" },
      { icon: "BarChart", text: "Reportes personalizados de rendimiento" },
      { icon: "Headphones", text: "Soporte prioritario 24/7" },
    ],
    buttonText: "Elegir plan",
  },
  {
    titulo: "Plan Anual Élite",
    descripcion:
      "Para empresas turísticas líderes que buscan una presencia total y beneficios exclusivos.",
    precio: 149.99,
    tiempo: "Anual",
    incluye: [
      { icon: "Globe", text: "Difusión internacional de tus experiencias" },
      { icon: "Users", text: "Acceso a base de datos de viajeros premium" },
      { icon: "BadgeCheck", text: "Sello de proveedor verificado" },
      {
        icon: "BarChart",
        text: "Consultoría personalizada de marketing turístico",
      },
      { icon: "Gift", text: "Campañas promocionales incluidas durante el año" },
    ],
    buttonText: "Elegir plan",
  },
];

export default function Page() {
  return (
    <>
      <Navegacion />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12">
        <div className="container mx-auto px-4">
          <HeaderSubs />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {datos.map((plan, índice) => (
              <SubscriptionCard key={índice} datos={plan} />
            ))}
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
