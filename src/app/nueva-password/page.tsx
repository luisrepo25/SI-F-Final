"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, ArrowLeft, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { restablecerPassword } from "@/api/auth";

export default function NuevaPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    const emailParam = searchParams.get("email");
    
    if (tokenParam && emailParam) {
      setToken(tokenParam);
      setEmail(emailParam);
      console.log("Token recibido:", tokenParam);
      console.log("Email recibido:", emailParam);
    } else {
      // Si no hay token o email, redirigir a recuperar-password
      console.error("Faltan parámetros de seguridad: token o email");
      router.push("/recuperar-password");
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token || !email || !password || !confirmPassword) {
      setError("Faltan datos requeridos para el cambio de contraseña");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await restablecerPassword(token, password, email);
      console.log("✅ Contraseña cambiada exitosamente:", response.data);
      setSuccess(true);
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      console.error("Error al restablecer contraseña:", err);
      if (err.response?.status === 401) {
        setError("Token inválido o expirado. Por favor, solicita un nuevo token de recuperación.");
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.detail || "Datos inválidos. Verifica tu contraseña.");
      } else {
        setError(err.response?.data?.detail || "Error al restablecer la contraseña");
      }
    } finally {
      setLoading(false);
    }
  };

  const isPasswordValid = password.length >= 8;
  const doPasswordsMatch = password === confirmPassword && password.length > 0;

  if (!token || !email) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-amber-100 rounded-full">
              {success ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <Lock className="h-8 w-8 text-amber-600" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            {success ? "¡Contraseña Actualizada!" : "Nueva Contraseña"}
          </CardTitle>
          <p className="text-gray-600">
            {success 
              ? "Tu contraseña ha sido restablecida exitosamente"
              : "Ingresa tu nueva contraseña"
            }
          </p>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Ya puedes iniciar sesión con tu nueva contraseña
              </p>
              <Link href="/login">
                <Button className="w-full bg-amber-600 hover:bg-amber-700">
                  Ir al Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password && (
                  <p className={`text-xs ${isPasswordValid ? 'text-green-600' : 'text-red-600'}`}>
                    {isPasswordValid ? '✓ Contraseña válida' : '✗ Mínimo 8 caracteres'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repite tu nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && (
                  <p className={`text-xs ${doPasswordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                    {doPasswordsMatch ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                  </p>
                )}
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !isPasswordValid || !doPasswordsMatch}
                className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300"
              >
                {loading ? "Actualizando..." : "Actualizar Contraseña"}
              </Button>

              <div className="text-center">
                <Link 
                  href="/verificar-codigo" 
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center space-x-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Volver</span>
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}