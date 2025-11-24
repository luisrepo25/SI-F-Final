"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import axios from "@/api/axios";
import type { AxiosResponse } from "axios";

export default function ConfirmacionPago() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reservaId = searchParams.get("reserva") || searchParams.get("id");
  const [estado, setEstado] = useState<"cargando"|"exito"|"pendiente"|"fallido"|"error">("cargando");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (!reservaId) {
      setEstado("error");
      setMensaje("No se encontró el identificador de la reserva.");
      return;
    }
    // Consultar el estado de la reserva
    axios.get(`reservas/${reservaId}/`)
      .then((res: AxiosResponse<any>) => {
        const estadoReserva = res.data.estado;
        if (["PAGADA", "CONFIRMADA"].includes(estadoReserva)) {
          setEstado("exito");
          setMensaje("¡Pago realizado con éxito! Su reserva está confirmada.");
        } else if (estadoReserva === "PENDIENTE") {
          setEstado("pendiente");
          setMensaje("El pago no se completó. Puede reintentar el pago desde su panel de usuario.");
        } else {
          setEstado("fallido");
          setMensaje("El pago fue rechazado o cancelado. Intente nuevamente.");
        }
      })
      .catch(() => {
        setEstado("error");
        setMensaje("No se pudo consultar el estado de la reserva. Intente más tarde.");
      });
  }, [reservaId]);

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle>Confirmación de Pago</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {estado === "cargando" && <Loader2 className="animate-spin w-10 h-10 text-orange-500" />}
          {estado === "exito" && <CheckCircle className="w-10 h-10 text-green-600" />}
          {estado === "pendiente" && <AlertTriangle className="w-10 h-10 text-yellow-500" />}
          {estado === "fallido" && <XCircle className="w-10 h-10 text-red-600" />}
          {estado === "error" && <XCircle className="w-10 h-10 text-red-600" />}
          <p className="text-lg text-center">{mensaje}</p>
          <Button onClick={() => router.push("/panel")}>Ir a mi panel</Button>
        </CardContent>
      </Card>
    </div>
  );
}
