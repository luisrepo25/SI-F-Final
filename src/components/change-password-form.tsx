"use client"

import React, { useState, useEffect } from "react";
import { requestPasswordResetCode, changePassword, ChangePasswordData, getUser } from "@/api/auth";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Shield, Lock } from "lucide-react";
import useAuth from "@/hooks/useAuth";

const ChangePasswordForm = () => {
  const [userEmail, setUserEmail] = useState("");
  const [formData, setFormData] = useState({
    password_actual: "",
    password_nueva: "",
    password_nueva_confirm: "",
    token: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const { toast } = useToast();
  const { logout } = useAuth();

  // Obtener email del usuario al cargar el componente
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        // Prefer local storage to avoid additional GET requests that may 403
        const stored = localStorage.getItem("user");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed?.email) {
              setUserEmail(parsed.email);
              return;
            }
          } catch {
            // fall through to getUser
          }
        }
        const response = await getUser();
        setUserEmail(response.data.email);
      } catch (error) {
        console.error("Error al obtener email del usuario:", error);
      }
    };
    fetchUserEmail();
  }, []);

  // Enviar código de seguridad
  const handleSendCode = async () => {
    if (!userEmail) {
      toast({
        title: "❌ Error",
        description: "No se pudo obtener tu correo electrónico",
        variant: "destructive",
      });
      return;
    }
    setSendingCode(true);
    try {
      await requestPasswordResetCode(userEmail);
      setCodeSent(true);
      toast({
        title: "✅ Código enviado",
        description: "Revisa tu correo electrónico y ingresa el código de seguridad",
      });
    } catch (error) {
      console.error("Error al enviar código:", error);
      toast({
        title: "❌ Error",
        description: "No se pudo enviar el código. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setSendingCode(false);
    }
  };

  // Manejar cambios en los campos
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Cambiar contraseña
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password_nueva !== formData.password_nueva_confirm) {
      toast({
        title: "❌ Error",
        description: "Las contraseñas nuevas no coinciden",
        variant: "destructive",
      });
      return;
    }

    if (!formData.token) {
      toast({
        title: "❌ Error",
        description: "Debes ingresar el código de seguridad",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const changeData: ChangePasswordData = {
        token: formData.token,
        password_actual: formData.password_actual,
        password_nueva: formData.password_nueva,
        password_nueva_confirm: formData.password_nueva_confirm
      };

      await changePassword(changeData);
      
      toast({
        title: "✅ Contraseña cambiada",
        description: "Cerrando sesión para que inicies con tu nueva contraseña...",
      });

      // Cerrar sesión después de 2 segundos para que el usuario vea el mensaje
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (error: unknown) {
      console.error("Error al cambiar contraseña:", error);
      let errorMsg = "No se pudo cambiar la contraseña";
      if (typeof error === "object" && error !== null && "response" in error && typeof (error as { response?: { data?: { detail?: string } } }).response?.data?.detail === "string") {
        errorMsg = (error as { response?: { data?: { detail?: string } } }).response!.data!.detail!;
      }
      toast({
        title: "❌ Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center flex items-center justify-center gap-2">
        <Shield className="w-6 h-6" />
        Cambiar Contraseña
      </h2>

      {/* Botón para enviar código */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800 mb-3 flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Primero, solicita un código de seguridad
        </p>
        <button
          type="button"
          onClick={handleSendCode}
          disabled={sendingCode}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {sendingCode ? "Enviando..." : "Enviar código al correo"}
        </button>
        {codeSent && (
          <p className="text-xs text-green-600 mt-2">✅ Código enviado. Revisa tu correo electrónico.</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Código de seguridad */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Código de seguridad *
          </label>
          <input
            type="text"
            name="token"
            value={formData.token}
            onChange={handleInputChange}
            placeholder="Ingresa el código recibido por correo"
            className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            required
          />
        </div>

        {/* Contraseña actual */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Contraseña actual *
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? "text" : "password"}
              name="password_actual"
              value={formData.password_actual}
              onChange={handleInputChange}
              className="w-full border border-blue-200 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              required
            />
            <button
              type="button"
              onClick={() => toggleShowPassword('current')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Nueva contraseña */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Nueva contraseña *
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? "text" : "password"}
              name="password_nueva"
              value={formData.password_nueva}
              onChange={handleInputChange}
              className="w-full border border-blue-200 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              required
            />
            <button
              type="button"
              onClick={() => toggleShowPassword('new')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirmar nueva contraseña */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Repetir nueva contraseña *
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? "text" : "password"}
              name="password_nueva_confirm"
              value={formData.password_nueva_confirm}
              onChange={handleInputChange}
              className="w-full border border-blue-200 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              required
            />
            <button
              type="button"
              onClick={() => toggleShowPassword('confirm')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Botón de envío */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-bold shadow hover:from-blue-600 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {loading ? "Cambiando..." : (
              <>
                <Lock className="w-4 h-4" />
                Cambiar contraseña
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-xs text-yellow-800">
          ⚠️ El código de seguridad es válido por 1 hora. Si no lo recibes, revisa tu carpeta de spam.
        </p>
      </div>
    </div>
  );
};

export default ChangePasswordForm;
