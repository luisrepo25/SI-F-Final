// components/SubscriptionFAQ.tsx
'use client';

import React, { useState } from 'react';

const SubscriptionFAQ: React.FC = () => {
  const [preguntaAbierta, setPreguntaAbierta] = useState<number | null>(null);

  const preguntasFrecuentes = [
    {
      pregunta: "¿Puedo cambiar de plan en cualquier momento?",
      respuesta: "Sí, puedes actualizar tu plan en cualquier momento. El cambio se reflejará inmediatamente y se ajustará el prorrateo del costo."
    },
    {
      pregunta: "¿Ofrecen periodo de prueba gratuito?",
      respuesta: "Sí, ofrecemos 14 días de prueba gratuita en todos nuestros planes para que puedas explorar todas las funcionalidades."
    },
    {
      pregunta: "¿Qué métodos de pago aceptan?",
      respuesta: "Aceptamos tarjetas de crédito/débito (Visa, MasterCard, American Express), transferencias bancarias y PayPal."
    },
    {
      pregunta: "¿Puedo cancelar mi suscripción cuando quiera?",
      respuesta: "Sí, puedes cancelar tu suscripción en cualquier momento sin cargos adicionales. Conservarás el acceso hasta el final del periodo pagado."
    },
    {
      pregunta: "¿Ofrecen descuentos para empresas?",
      respuesta: "Sí, ofrecemos descuentos especiales para agencias con múltiples proveedores. Contáctanos para más información."
    }
  ];

  const togglePregunta = (índice: number) => {
    setPreguntaAbierta(preguntaAbierta === índice ? null : índice);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
        Preguntas Frecuentes
      </h2>
      <div className="max-w-3xl mx-auto space-y-4">
        {preguntasFrecuentes.map((faq, índice) => (
          <div key={índice} className="border border-gray-200 rounded-lg">
            <button
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 rounded-lg"
              onClick={() => togglePregunta(índice)}
            >
              <span className="font-semibold text-gray-900">{faq.pregunta}</span>
              <svg
                className={`w-5 h-5 transform transition-transform ${
                  preguntaAbierta === índice ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {preguntaAbierta === índice && (
              <div className="px-6 pb-4">
                <p className="text-gray-600">{faq.respuesta}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionFAQ;