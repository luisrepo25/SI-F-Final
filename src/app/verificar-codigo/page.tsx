"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowLeft, AlertCircle, Mail, Copy, Check } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerificarCodigo() {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // Si no hay email, redirigir a recuperar-password
      router.push("/recuperar-password");
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    // Redirigir directamente a nueva-password con el token y email
    router.push(`/nueva-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setToken(e.target.value.trim());
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setToken(text.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error al pegar:", err);
    }
  };

  const resendCode = async () => {
    router.push(`/recuperar-password`);
  };

  if (!email) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-amber-100 rounded-full">
              <Shield className="h-8 w-8 text-amber-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Ingresa el Token de Recuperación
          </CardTitle>
          <p className="text-gray-600">
            Hemos enviado un token de recuperación a
          </p>
          <div className="flex items-center justify-center space-x-1 text-amber-600">
            <Mail className="h-4 w-4" />
            <span className="font-medium">{email}</span>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="token" className="text-sm font-medium text-gray-700">
                Token de Recuperación
              </label>
              <div className="relative">
                <textarea
                  id="token"
                  placeholder="Pega aquí tu token de recuperación..."
                  value={token}
                  onChange={handleTokenChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={handlePaste}
                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Pegar desde portapapeles"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              {copied && (
                <p className="text-xs text-green-600 text-center">
                  ✓ Token pegado exitosamente
                </p>
              )}
              <p className="text-xs text-gray-500 text-center">
                Revisa tu correo electrónico y pega el token completo
              </p>
            </div>

            <Button
              type="submit"
              disabled={!token.trim()}
              className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300"
            >
              Continuar con Nueva Contraseña
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                ¿No recibiste el correo?
              </p>
              <button
                type="button"
                onClick={resendCode}
                className="text-sm text-amber-600 hover:text-amber-700 underline"
              >
                Solicitar nuevo token
              </button>
            </div>

            <div className="text-center">
              <Link 
                href="/recuperar-password" 
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center space-x-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver</span>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}