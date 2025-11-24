import CartFloat from "@/components/ui/cart-float";
import type React from "react";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LoadingLinkProvider } from "@/components/EfectoCarga/contexto";
import { SidebarProvider } from "@/components/ui/sidebar";
import HydrationFix from "@/components/HydrationFix";
import ChatTurismo from "@/components/chatbot";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["400", "600", "700", "900"],
});

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Descubre Bolivia - Turismo y Aventuras",
  description:
    "Explora los destinos más impresionantes de Bolivia: Salar de Uyuni, Lago Titicaca, La Paz y más.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${montserrat.variable} ${openSans.variable} h-full`}
    >
      <body className="font-sans antialiased min-h-screen w-full overflow-x-hidden overflow-y-auto">
        <HydrationFix />
        <LoadingLinkProvider>
          <AuthProvider>
            <SidebarProvider>
              <div className="min-h-screen w-full overflow-y-auto">
                {/* <BackendStatus className="fixed top-4 right-4 z-50" /> */}
                <Toaster />
                   {/* <CartFloat /> */}
                {children}
              </div>

              <ChatTurismo />
            </SidebarProvider>
          </AuthProvider>
        </LoadingLinkProvider>
      </body>
    </html>
  );
}
