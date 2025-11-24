"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/api/auth";
import { User, Mail, Lock, Phone, Calendar, FileText, Globe, Users } from "lucide-react";

interface FormData {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  password_confirm: string;
  telefono: string;
  fecha_nacimiento: string;
  genero: string;
  documento_identidad: string;
  pais: string;
  rol: string; 
  rubro: string;
}
interface FormErrors {
  [key: string]: string;
}

export function RegisterForm({ className, ...props }: React.ComponentProps<"form">) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    password_confirm: "",
    telefono: "",
    fecha_nacimiento: "",
    genero: "",
    documento_identidad: "",
    pais: "",
    rol: "2", // default to Cliente (id 2)
    rubro: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Evita fechas futuras en móviles
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!form.nombres.trim()) newErrors.nombres = "Los nombres son requeridos";
    if (!form.apellidos.trim()) newErrors.apellidos = "Los apellidos son requeridos";
    if (!form.email.trim()) newErrors.email = "El email es requerido";
    if (!form.password) newErrors.password = "La contraseña es requerida";
    if (!form.password_confirm) newErrors.password_confirm = "Confirme la contraseña";

    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Formato de email inválido";
    }
    if (form.password && form.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    }
    if (form.password !== form.password_confirm) {
      newErrors.password_confirm = "Las contraseñas no coinciden";
    }
    if (form.nombres && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.nombres)) {
      newErrors.nombres = "Los nombres solo pueden contener letras y espacios";
    }
    if (form.apellidos && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.apellidos)) {
      newErrors.apellidos = "Los apellidos solo pueden contener letras y espacios";
    }
    if (form.fecha_nacimiento) {
      const today = new Date();
      const birthDate = new Date(form.fecha_nacimiento);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
      if (age < 18) newErrors.fecha_nacimiento = "Debes ser mayor de 18 años";
    }
    if (form.telefono && !/^[\+]?[\d\s\-()]+$/.test(form.telefono)) {
      newErrors.telefono = "Formato de teléfono inválido";
    }
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    try {
      // Construir payload con tipos correctos; backend espera rol como entero
      const payload = {
        nombres: form.nombres,
        apellidos: form.apellidos,
        email: form.email,
        password: form.password,
        password_confirm: form.password_confirm,
        telefono: form.telefono || undefined,
        fecha_nacimiento: form.fecha_nacimiento || undefined,
        genero: form.genero || undefined,
        documento_identidad: form.documento_identidad || undefined,
        pais: form.pais || undefined,
        rol: Number(form.rol),
  rubro: form.rubro,
      };

      await register(payload as any);
      setSuccess("Usuario registrado correctamente. Ahora serás redirigido al login...");
      setForm({
        nombres: "",
        apellidos: "",
        email: "",
        password: "",
        password_confirm: "",
        telefono: "",
        fecha_nacimiento: "",
        genero: "",
        documento_identidad: "",
        pais: "",
        rol: "2",
        rubro: "",
      });
      // Small delay so user sees the success message, then redirect to login
      console.log('[RegisterForm] registro exitoso, redirigiendo a /login');
      setTimeout(() => {
        console.log('[RegisterForm] ejecutando router.push(/login)');
        router.push('/login');
      }, 800);
    } catch (err: unknown) {
      const e = err as {
        code?: string;
        message?: string;
        response?: { data?: Record<string, unknown> };
      };

      if (e?.code === "ERR_NETWORK" || (typeof e?.message === "string" && e.message.includes("Network Error"))) {
        setErrors({
          general:
            "❌ No se puede conectar al servidor. Asegúrate de que el backend esté ejecutándose en http://127.0.0.1:8000",
        });
      } else if (e?.response?.data) {
        const backendErrors = e.response.data as Record<string, unknown>;
        const newErrors: FormErrors = {};
        Object.entries(backendErrors).forEach(([key, val]) => {
          if (Array.isArray(val) && val.length > 0) {
            newErrors[key] = String(val[0]);
          } else if (key === "non_field_errors") {
            newErrors.general = Array.isArray(val) ? String(val[0]) : String(val);
          } else if (val !== undefined && val !== null) {
            newErrors[key] = String(val);
          }
        });
        setErrors(newErrors);
      } else {
        setErrors({ general: "Error al registrar usuario. Intenta nuevamente." });
      }
    }
    setLoading(false);
  };

  return (
    <form
      className={cn("mx-auto w-full max-w-md px-2", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <div className="rounded-xl border bg-background/95 backdrop-blur-sm p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col items-center gap-2 text-center mb-4">
          <h1 className="text-lg sm:text-xl font-bold">Regístrate</h1>
          <p className="text-muted-foreground text-xs sm:text-sm text-balance leading-relaxed">
            Crea tu cuenta para descubrir Bolivia
          </p>
        </div>

        <div className="grid gap-4 sm:gap-5">
          {/* Información Personal */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <User className="h-3 w-3" />
              <span>Información Personal</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid min-w-0 gap-1.5">
                <Label htmlFor="register-nombres" className="text-xs">Nombres <span className="text-red-500">*</span></Label>
                <Input
                  id="register-nombres"
                  name="nombres"
                  type="text"
                  placeholder="Juan Carlos"
                  value={form.nombres}
                  onChange={handleChange}
                  autoComplete="given-name"
                  aria-invalid={!!errors.nombres}
                  aria-describedby="error-nombres"
                  className={cn("w-full text-sm h-8", errors.nombres && "border-red-500")}
                  required
                />
                {errors.nombres && <p id="error-nombres" className="text-xs text-red-500">{errors.nombres}</p>}
              </div>

              <div className="grid min-w-0 gap-1.5">
                <Label htmlFor="register-apellidos" className="text-xs">Apellidos <span className="text-red-500">*</span></Label>
                <Input
                  id="register-apellidos"
                  name="apellidos"
                  type="text"
                  placeholder="Pérez García"
                  value={form.apellidos}
                  onChange={handleChange}
                  autoComplete="family-name"
                  aria-invalid={!!errors.apellidos}
                  aria-describedby="error-apellidos"
                  className={cn("w-full text-sm h-8", errors.apellidos && "border-red-500")}
                  required
                />
                {errors.apellidos && <p id="error-apellidos" className="text-xs text-red-500">{errors.apellidos}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid min-w-0 gap-1.5">
                <Label htmlFor="register-fecha_nacimiento" className="text-xs">
                  <Calendar className="h-3 w-3 inline mr-1" />
                  Fecha Nac.
                </Label>
                <Input
                  id="register-fecha_nacimiento"
                  name="fecha_nacimiento"
                  type="date"
                  value={form.fecha_nacimiento}
                  onChange={handleChange}
                  max={todayStr}
                  aria-invalid={!!errors.fecha_nacimiento}
                  aria-describedby="error-fecha"
                  className={cn("w-full text-sm h-8", errors.fecha_nacimiento && "border-red-500")}
                />
                {errors.fecha_nacimiento && <p id="error-fecha" className="text-xs text-red-500">{errors.fecha_nacimiento}</p>}
              </div>

              <div className="grid min-w-0 gap-1.5">
                <Label htmlFor="register-genero" className="text-xs">
                  <Users className="h-3 w-3 inline mr-1" />
                  Género
                </Label>
                <Select value={form.genero} onValueChange={(v) => handleSelectChange("genero", v)}>
                  <SelectTrigger id="register-genero" className={cn("h-8 text-sm", errors.genero && "border-red-500")}>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Femenino</SelectItem>
                    <SelectItem value="O">Otro</SelectItem>
                    <SelectItem value="N">Prefiero no decir</SelectItem>
                  </SelectContent>
                </Select>
                {errors.genero && <p className="text-xs text-red-500">{errors.genero}</p>}
              </div>
            </div>
          </section>

          {/* Datos de Contacto */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>Datos de Contacto</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid min-w-0 gap-2 md:col-span-2">
                <Label htmlFor="register-email">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder="juan.perez@email.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  inputMode="email"
                  aria-invalid={!!errors.email}
                  aria-describedby="error-email"
                  className={cn("w-full", errors.email && "border-red-500")}
                  required
                />
                {errors.email && <p id="error-email" className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="grid min-w-0 gap-2">
                <Label htmlFor="register-telefono">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Teléfono
                </Label>
                <Input
                  id="register-telefono"
                  name="telefono"
                  type="tel"
                  placeholder="+591 70123456"
                  value={form.telefono}
                  onChange={handleChange}
                  autoComplete="tel"
                  inputMode="tel"
                  aria-invalid={!!errors.telefono}
                  aria-describedby="error-telefono"
                  className={cn("w-full", errors.telefono && "border-red-500")}
                />
                {errors.telefono && <p id="error-telefono" className="text-sm text-red-500">{errors.telefono}</p>}
              </div>

              {/* Rubro enviado por defecto como cadena vacía; campo oculto en UI */}

              <div className="grid min-w-0 gap-2">
                <Label htmlFor="register-pais">
                  <Globe className="h-4 w-4 inline mr-1" />
                  País
                </Label>
                <Input
                  id="register-pais"
                  name="pais"
                  type="text"
                  placeholder="Bolivia"
                  value={form.pais}
                  onChange={handleChange}
                  autoComplete="country-name"
                  className={cn("w-full", errors.pais && "border-red-500")}
                />
                {errors.pais && <p className="text-sm text-red-500">{errors.pais}</p>}
              </div>
            </div>
          </section>

          {/* Identificación */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Identificación</span>
            </div>

            <div className="grid min-w-0 gap-2">
              <Label htmlFor="register-documento_identidad">Documento de Identidad</Label>
              <Input
                id="register-documento_identidad"
                name="documento_identidad"
                type="text"
                placeholder="12345678 (CI o Pasaporte)"
                value={form.documento_identidad}
                onChange={handleChange}
                autoComplete="off"
                className={cn("w-full", errors.documento_identidad && "border-red-500")}
              />
              {errors.documento_identidad && (
                <p className="text-sm text-red-500">{errors.documento_identidad}</p>
              )}
            </div>
          </section>

          {/* Seguridad */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>Seguridad</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid min-w-0 gap-2">
                <Label htmlFor="register-password">Contraseña <span className="text-red-500">*</span></Label>
                <Input
                  id="register-password"
                  name="password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  aria-describedby="error-password"
                  className={cn("w-full", errors.password && "border-red-500")}
                  required
                />
                {errors.password && <p id="error-password" className="text-sm text-red-500">{errors.password}</p>}
              </div>

              <div className="grid min-w-0 gap-2">
                <Label htmlFor="register-password_confirm">Confirmar Contraseña <span className="text-red-500">*</span></Label>
                <Input
                  id="register-password_confirm"
                  name="password_confirm"
                  type="password"
                  placeholder="Repetir contraseña"
                  value={form.password_confirm}
                  onChange={handleChange}
                  autoComplete="new-password"
                  aria-invalid={!!errors.password_confirm}
                  aria-describedby="error-password-confirm"
                  className={cn("w-full", errors.password_confirm && "border-red-500")}
                  required
                />
                {errors.password_confirm && (
                  <p id="error-password-confirm" className="text-sm text-red-500">{errors.password_confirm}</p>
                )}
              </div>
            </div>
          </section>

          <Button type="submit" className="w-full h-10 md:h-11 text-sm md:text-base" disabled={loading}>
            {loading ? "Registrando..." : "Crear Cuenta"}
          </Button>

          {errors.general && <div className="text-red-500 text-center text-sm">{errors.general}</div>}
          {success && <div className="text-green-600 text-center text-sm">{success}</div>}

          <p className="text-xs text-muted-foreground text-center">
            Los campos marcados con <span className="text-red-500">*</span> son obligatorios
          </p>
        </div>
      </div>
    </form>
  );
}
