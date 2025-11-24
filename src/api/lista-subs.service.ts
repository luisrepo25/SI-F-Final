export interface Suscripcion {
  id: number;
  precio: number;
  fecha_inicio: string;
  fecha_fin: string;
  activa: boolean;
  stripe_session_id: string;
  proveedor: {
    id: number;
    nombre_empresa: string;
    telefono: string;
    sitio_web: string;
  };
}

class ServicioSuscripciones {
  private urlBase =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  async listarSuscripciones(): Promise<Suscripcion[]> {
    try {
      const res = await fetch(`${this.urlBase}/suscripciones/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Error obteniendo suscripciones");

      return await res.json();
    } catch (error) {
      console.error("❌ Error servicio suscripciones:", error);
      return [];
    }
  }
}

export const servicioSuscripciones = new ServicioSuscripciones();
