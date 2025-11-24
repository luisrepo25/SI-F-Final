"use client";

import { useEffect } from 'react';

/**
 * Componente para suprimir warnings de hidratación causados por extensiones del navegador
 * que inyectan atributos como bis_skin_checked
 */
export default function HydrationFix() {
  useEffect(() => {
    // Suprimir warnings específicos de atributos extra del servidor
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      // Filtrar warnings de bis_skin_checked y otros atributos de extensiones
      const message = args[0];
      if (
        typeof message === 'string' && 
        (message.includes('bis_skin_checked') || 
         message.includes('Extra attributes from the server') ||
         message.includes('Warning: Extra attributes from the server'))
      ) {
        return; // Suprimir este warning específico
      }
      
      // Permitir otros errores normales
      originalError.apply(console, args);
    };
    
    console.warn = (...args) => {
      // Filtrar warnings de bis_skin_checked 
      const message = args[0];
      if (
        typeof message === 'string' && 
        (message.includes('bis_skin_checked') ||
         message.includes('Extra attributes from the server'))
      ) {
        return; // Suprimir este warning específico
      }
      
      // Permitir otros warnings normales
      originalWarn.apply(console, args);
    };

    // Cleanup al desmontar el componente
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return null; // Este componente no renderiza nada
}