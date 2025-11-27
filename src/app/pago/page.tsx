"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/api/axios";
import { Loader2, XCircle } from "lucide-react";

export default function PagoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reservaId = searchParams.get("reserva_id");

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reservaId) {
      setError("No se proporcionó un ID de reserva válido.");
      return;
    }

    const crearSesionYRedirigir = async () => {
      try {
        console.log(
          `Solicitando sesión de Stripe para reserva_id: ${reservaId}`
        );
        const { data } = await api.post("/crear-checkout-reserva/", {
          reserva_id: parseInt(reservaId, 10),
        });

        if (data && data.checkout_url) {
          console.log("URL de Stripe recibida. Redirigiendo...");
          window.location.href = data.checkout_url;
        } else {
          setError("No se recibió una URL de pago válida del servidor.");
        }
      } catch (err: any) {
        console.error("Error al crear la sesión de checkout de Stripe:", err);
        const errorMsg =
          err.response?.data?.detail ||
          "No se pudo iniciar el proceso de pago. Por favor, intenta de nuevo.";
        setError(errorMsg);
      }
    };

    crearSesionYRedirigir();
  }, [reservaId]);

  return (
    <div className="flex flex-col justify-center items-center min-h-[60vh] text-center p-4">
      {error ? (
        <>
          <XCircle className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Error en el Pago
          </h1>
          <p className="text-gray-600 max-w-md">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            Volver.
          </button>
        </>
      ) : (
        <>
          <Loader2 className="animate-spin w-16 h-16 text-blue-600 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">
            Procesando tu pago...
          </h1>
          <p className="text-gray-600">
            Serás redirigido a nuestra pasarela de pagos segura en unos
            momentos.
          </p>
        </>
      )}
    </div>
  );
}
