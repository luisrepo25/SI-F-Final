import axios from '../api/axios';
import React from 'react';

interface BotonStripeCheckoutProps {
  monto: number;
  descripcion: string;
  reservaId: number;
}

const BotonStripeCheckout: React.FC<BotonStripeCheckoutProps> = ({ monto, descripcion, reservaId }: BotonStripeCheckoutProps) => {
  const handleCheckout = async () => {
    try {
      console.log('🔧 Iniciando pago con backend de Django...');
      
      const token = localStorage.getItem("authToken"); // Get token from localStorage
      if (!token) {
        alert("Debes iniciar sesión para realizar un pago.");
        return;
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''; // Ensure API_BASE_URL is defined

      const requestBody = { reserva_id: reservaId };
      console.log('📋 PAYLOAD ENVIADO A BACKEND:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${API_BASE_URL}/crear-checkout-reserva/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`, // Add Authorization header
        },
        body: JSON.stringify({
          reserva_id: reservaId, // Use the actual reservaId from props
        }),
      });

      const data = await response.json();
      console.log('✅ Respuesta del proxy:', data);
      
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        alert('Error: No se pudo obtener la URL de pago');
      }
    } catch (error) {
      alert('Error al iniciar el pago con Stripe.');
      console.error(error);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
    >
      Ir a pagar con Stripe (Checkout)
    </button>
  );
};

export default BotonStripeCheckout;