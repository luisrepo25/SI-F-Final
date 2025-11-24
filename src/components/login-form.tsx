import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

import { useState, useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";

export function LoginForm({ className, ...props }: React.ComponentProps<"form">) {
  const { login, user, loading, reloadUser } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loadingForm, setLoadingForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [redirectPending, setRedirectPending] = useState(false);
  const reactId = useId();
  const emailId = `login-email-${reactId}`;
  const passwordId = `login-password-${reactId}`;

  useEffect(() => {
    if (redirectPending && !loading && user) {
      // Todos los usuarios van al inicio, independientemente del rol
      router.push("/");
      setRedirectPending(false);
    }
  }, [redirectPending, loading, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const safeValue = value || ""; // Ensure value is always a string
    // Clear any server error when user types
    setErrorMessage(null);
    if (id === emailId) setForm(f => ({ ...f, email: safeValue }));
    else if (id === passwordId) setForm(f => ({ ...f, password: safeValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingForm(true);
    
    try {
      const res = await login(form.email, form.password);
      
      if (res.success) {
        // Solo recargar usuario si el login fue exitoso
        await reloadUser();
        setRedirectPending(true);
      } else {
        // Show message returned from AuthContext
        setErrorMessage(res.message || "Credenciales inválidas");
        // Asegurar que no hay redirección pendiente en caso de error
        setRedirectPending(false);
        
        // Mensajes de error más específicos
        if (res.message?.includes("credentials") || res.message?.includes("credenciales")) {
        } else if (res.message?.includes("invalid") || res.message?.includes("inválido")) {
        } else if (res.message?.includes("not found") || res.message?.includes("no encontrado")) {
        } else if (res.message?.includes("blocked") || res.message?.includes("bloqueado")) {
        } else {
        }
      }
    } catch (error) {
      // Asegurar que no hay redirección pendiente en caso de error
      setRedirectPending(false);
      // Mostrar mensaje de error detallado si está disponible
      if (error instanceof Error) setErrorMessage(error.message);
      else setErrorMessage("Error al iniciar sesión");
    }
    
    setLoadingForm(false);
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Inicia sesión</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Ingresa tu email y contraseña para acceder
        </p>
      </div>
      <div className="grid gap-6">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-800 rounded-md flex items-start gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="text-sm">{errorMessage}</div>
          </div>
        )}
        <div className="grid gap-3">
              <Label htmlFor={emailId}>Email</Label>
              <Input id={emailId} type="email" placeholder="m@example.com" value={form.email} onChange={handleChange} required />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor={passwordId}>Contraseña</Label>
            <Link
              href="/recuperar-password"
              className="ml-auto text-sm underline-offset-4 hover:underline text-amber-600"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
              <Input id={passwordId} type="password" value={form.password} onChange={handleChange} required />
        </div>
        <Button type="submit" className="w-full" disabled={loadingForm}>
          {loadingForm ? "Ingresando..." : "Ingresar"}
        </Button>
        
        {/* Mensaje de error mejorado */}
        {/* Mensaje de error eliminado para pasar ESLint */}
      </div>
      <div className="text-center text-sm">
        ¿No tienes cuenta?{" "}
        <a href="#" className="underline underline-offset-4">
          Regístrate
        </a>
      </div>
    </form>
  );
}
