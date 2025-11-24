"use client";
import React, { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Badge } from "./badge";

export default function CartFloat() {
  const [items, setItems] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const carrito = localStorage.getItem("itinerario_multiservicio");
      try {
        const arr = carrito ? JSON.parse(carrito) : [];
        setItems(arr.length);
        setTotal(arr.reduce((acc: number, s: any) => acc + (s.precio || 0), 0));
      } catch {
        setItems(0);
        setTotal(0);
      }
      window.addEventListener("storage", () => {
        const carrito = localStorage.getItem("itinerario_multiservicio");
        try {
          const arr = carrito ? JSON.parse(carrito) : [];
          setItems(arr.length);
          setTotal(arr.reduce((acc: number, s: any) => acc + (s.precio || 0), 0));
        } catch {
          setItems(0);
          setTotal(0);
        }
      });
    }
  }, []);

  return (
    <Link href="/reserva-multiservicio" className="fixed top-8 right-8 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-5 flex flex-col items-center gap-2 border border-blue-200 hover:shadow-blue-300 transition-all min-w-[220px]">
        <div className="flex items-center gap-2 mb-2">
          <ShoppingCart className="w-7 h-7 text-blue-700" />
          <span className="font-bold text-blue-700 text-lg">Reserva</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <Badge className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">{items} servicios</Badge>
        </div>
        <div className="font-semibold text-green-700 text-md mb-2">Total: USD {total}</div>
        <Link href="/reserva-multiservicio" className="w-full">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl w-full transition-all">Ir a reservar</button>
        </Link>
      </div>
    </Link>
  );
}
