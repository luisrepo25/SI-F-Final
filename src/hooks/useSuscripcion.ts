import { useState, useEffect, useCallback } from 'react';

interface Proveedor {
  id: number;
  nombre_empresa: string;
  descripcion: string;
  telefono: string;
  sitio_web: string;
}

export interface Suscripcion {
  id: number;
  proveedor: Proveedor;
  created_at: string;
  updated_at: string;
  precio: string;
  fecha_inicio: string;
  fecha_fin: string;
  activa: boolean;
  stripe_session_id: string;
}

interface SuscripcionState {
  suscripcion: Suscripcion | null;
  suscripcionActiva: boolean;
  loading: boolean;
  error: string | null;
}

export const useSuscripcion = () => {
  const [state, setState] = useState<SuscripcionState>({
    suscripcion: null,
    suscripcionActiva: false,
    loading: true,
    error: null
  });

  // Cargar suscripción desde localStorage al inicializar
  useEffect(() => {
    const loadSuscripcionFromStorage = () => {
      try {
        const stored = localStorage.getItem('suscripcion');
        const storedActiva = localStorage.getItem('suscripcionActiva');
        
        if (stored) {
          const suscripcionData: Suscripcion = JSON.parse(stored);
          const activa = storedActiva === 'true';
          
          setState({
            suscripcion: suscripcionData,
            suscripcionActiva: activa,
            loading: false,
            error: null
          });
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Error loading subscription from storage:', error);
        setState(prev => ({ ...prev, loading: false, error: 'Error loading subscription' }));
      }
    };

    loadSuscripcionFromStorage();
  }, []);

  // Guardar suscripción en el estado y localStorage
  const setSuscripcion = useCallback((suscripcionData: Suscripcion | null, activa: boolean) => {
    setState({
      suscripcion: suscripcionData,
      suscripcionActiva: activa,
      loading: false,
      error: null
    });

    // Guardar en localStorage para persistencia
    if (suscripcionData) {
      localStorage.setItem('suscripcion', JSON.stringify(suscripcionData));
      localStorage.setItem('suscripcionActiva', activa.toString());
    } else {
      localStorage.removeItem('suscripcion');
      localStorage.removeItem('suscripcionActiva');
    }
  }, []);

  // Limpiar suscripción (logout)
  const clearSuscripcion = useCallback(() => {
    setState({
      suscripcion: null,
      suscripcionActiva: false,
      loading: false,
      error: null
    });
    
    localStorage.removeItem('suscripcion');
    localStorage.removeItem('suscripcionActiva');
  }, []);

  // Verificar si la suscripción está activa basándose en fecha
  const verificarEstadoSuscripcion = useCallback((suscripcion: Suscripcion): boolean => {
    if (!suscripcion.activa) return false;
    
    const hoy = new Date();
    const fechaFin = new Date(suscripcion.fecha_fin);
    
    return fechaFin >= hoy;
  }, []);

  return {
    ...state,
    setSuscripcion,
    clearSuscripcion,
    verificarEstadoSuscripcion
  };
};