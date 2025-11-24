import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function CartIcon() {
  const [items, setItems] = useState(0);
  const [total, setTotal] = useState(0);

  // Actualiza el contador y total en tiempo real
  useEffect(() => {
    function updateCart() {
      const raw = typeof window !== "undefined" ? localStorage.getItem("itinerario_multiservicio") : "[]";
      let arr: any[] = [];
      try {
        arr = raw ? JSON.parse(raw) : [];
      } catch {
        arr = [];
      }
      setItems(arr.length);
      setTotal(arr.reduce((acc: number, s: any) => acc + (s.precio || 0), 0));
    }
    updateCart();
    window.addEventListener("storage", updateCart);
    return () => window.removeEventListener("storage", updateCart);
  }, []);

  // Actualiza el contador cuando se agrega o elimina desde la misma página
  useEffect(() => {
    const interval = setInterval(() => {
      const raw = typeof window !== "undefined" ? localStorage.getItem("itinerario_multiservicio") : "[]";
      let arr: any[] = [];
      try {
        arr = raw ? JSON.parse(raw) : [];
      } catch {
        arr = [];
      }
      setItems(arr.length);
      setTotal(arr.reduce((acc: number, s: any) => acc + (s.precio || 0), 0));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link href="/reserva-multiservicio" className="fixed top-6 right-6 z-50">
      <div className="relative bg-white rounded-full shadow-lg p-3 flex items-center gap-2 hover:bg-blue-50 transition-all border border-blue-200">
        <ShoppingCart className="w-6 h-6 text-blue-700" />
        <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs absolute -top-2 -right-2">{items}</span>
        <span className="ml-2 font-semibold text-blue-700">Carrito</span>
        <span className="ml-2 text-green-700 font-bold">USD {total}</span>
      </div>
    </Link>
  );
}
