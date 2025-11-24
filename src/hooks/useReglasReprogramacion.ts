import { useEffect, useState } from "react";
import { obtenerReglasReprogramacion, obtenerConfiguracionesReprogramacion } from "@/api/reprogramacion";

export function useReglasReprogramacion() {
  const [reglas, setReglas] = useState<any[]>([]);
  const [configuraciones, setConfiguraciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [r, c] = await Promise.all([
          obtenerReglasReprogramacion(),
          obtenerConfiguracionesReprogramacion(),
        ]);
        setReglas(r);
        setConfiguraciones(c);
      } catch (err) {
        setError("Error al cargar reglas/configuraciones de reprogramación");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { reglas, configuraciones, loading, error };
}
