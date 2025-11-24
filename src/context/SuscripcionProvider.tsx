"use client";
import React, { createContext, useContext, ReactNode } from 'react';
import { useSuscripcion, Suscripcion } from '@/hooks/useSuscripcion';

interface SuscripcionContextType {
  suscripcion: Suscripcion | null;
  suscripcionActiva: boolean;
  loading: boolean;
  error: string | null;
  setSuscripcion: (suscripcion: Suscripcion | null, activa: boolean) => void;
  clearSuscripcion: () => void;
  verificarEstadoSuscripcion: (suscripcion: Suscripcion) => boolean;
}

const SuscripcionContext = createContext<SuscripcionContextType | undefined>(undefined);

export const SuscripcionProvider = ({ children }: { children: ReactNode }) => {
  const suscripcion = useSuscripcion();

  return (
    <SuscripcionContext.Provider value={suscripcion}>
      {children}
    </SuscripcionContext.Provider>
  );
};

export const useSuscripcionContext = () => {
  const context = useContext(SuscripcionContext);
  if (context === undefined) {
    throw new Error('useSuscripcionContext must be used within a SuscripcionProvider');
  }
  return context;
};