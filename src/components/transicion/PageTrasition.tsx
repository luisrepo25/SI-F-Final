"use client";

import { motion, AnimatePresence, type Variants } from "framer-motion";
import { usePathname } from "next/navigation";
import React from "react";

/**
 * Contenedor que pone cada página en posición absoluta (full-screen),
 * así la nueva se "superpone" y la anterior hace push-back (scale + slide).
 */
const variants: Variants = {
  initial: {
    x: 56,                 // entra desde la derecha
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
  },
  enter: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { type: "tween", duration: 0.45, ease: [0.16, 1, 0.3, 1] }, // easeOut
  },
  exit: {
    x: -24,                // la antigua se va levemente a la izquierda
    opacity: 0.95,
    scale: 0.96,           // y “se aleja”
    filter: "blur(1px)",   // ligera profundidad
    transition: { type: "tween", duration: 0.35, ease: [0.32, 0, 0.67, 0] }, // easeIn
  },
};

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    // perspective para reforzar el efecto de profundidad
    <div style={{ perspective: 1000 }} className="relative min-h-screen isolate">
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={pathname}
          variants={variants}
          initial="initial"
          animate="enter"
          exit="exit"
          // Absoluto y full-bleed para superponer páginas
          className="absolute inset-0 z-10"
          // Evita reflow caro: que la GPU haga el trabajo
          style={{ willChange: "transform, filter, opacity" }}
        >
          {/* Fondo sólido para que no se “vea” la capa de abajo a través de la nueva */}
          <div className="min-h-screen bg-white dark:bg-neutral-950">
            {children}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
