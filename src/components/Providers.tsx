// src/components/Providers.tsx (CLIENT)
"use client";
import { LoadingLinkProvider } from "@/components/EfectoCarga/contexto";
import PageTransition from "@/components/transicion/PageTrasition";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LoadingLinkProvider>
      <PageTransition>{children}</PageTransition>
    </LoadingLinkProvider>
  );
}
