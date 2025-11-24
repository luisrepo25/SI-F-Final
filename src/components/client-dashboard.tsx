"use client"
import React, { useState, useEffect } from "react";
import { getUser, updateUserProfile, UpdateUserData } from "@/api/auth";
import { obtenerPerfilCompleto, PerfilCompleto } from "@/api/cliente-panel";
import { useToast } from "@/hooks/use-toast";

// Función auxiliar para formatear el total gastado
const formatearTotalGastado = (total: number): string => {
  return `Bs ${total.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const ClientDashboard = () => {
  const [user, setUser] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    telefono: "",
    fecha_nacimiento: "",
    genero: "",
    documento_identidad: "",
    pais: ""
  });
  const [perfilUsuario, setPerfilUsuario] = useState<PerfilCompleto | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Función auxiliar para formatear fecha para input de tipo date
  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return "";
    
    // Si la fecha contiene 'T' (formato ISO), tomar solo la parte de la fecha
    if (dateString.includes('T')) {
      return dateString.split('T')[0];
    }
    
    // Si ya está en formato YYYY-MM-DD, devolverla tal como está
    return dateString;
  };

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Cargar datos básicos del usuario (para edición)
        const response = await getUser();
        const userData = {
          nombres: response.data.nombres || "",
          apellidos: response.data.apellidos || "",
          email: response.data.email || "",
          telefono: response.data.telefono || "",
          fecha_nacimiento: response.data.fecha_nacimiento || "",
          genero: response.data.genero || "",
          documento_identidad: response.data.documento_identidad || "",
          pais: response.data.pais || ""
        };
        setUser(userData);

        // Cargar perfil completo del usuario (para estadísticas y visualización)
        try {
          const perfil = await obtenerPerfilCompleto();
          setPerfilUsuario(perfil);
          console.log('✅ Perfil de usuario cargado:', perfil);
        } catch (perfilError) {
          console.log('⚠️ No se pudo cargar el perfil completo, usando datos básicos');
          console.error('Error del perfil:', perfilError);
        }
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del usuario",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [toast]);

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  // Guardar cambios
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData: UpdateUserData = {
        nombres: user.nombres,
        apellidos: user.apellidos,
        telefono: user.telefono,
        fecha_nacimiento: user.fecha_nacimiento,
        genero: user.genero,
        documento_identidad: user.documento_identidad,
        pais: user.pais,
      };

      const response = await updateUserProfile(updateData);
      setUser(response.data);
      setEditMode(false);
      
      toast({
        title: "✅ Perfil actualizado",
        description: "Tus datos han sido actualizados correctamente",
      });
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      toast({
        title: "❌ Error",
        description: "No se pudo actualizar tu perfil. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto mt-10 bg-white rounded-xl shadow p-6">
        <div className="text-center">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas del Usuario */}
      {perfilUsuario && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Reservas</p>
                <p className="text-3xl font-bold">{perfilUsuario.total_reservas}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Reservas Activas</p>
                <p className="text-3xl font-bold">{perfilUsuario.reservas_activas}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Gastado</p>
                <p className="text-3xl font-bold">{formatearTotalGastado(perfilUsuario.total_gastado)}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información del Usuario */}
      {perfilUsuario && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl shadow-sm mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-500 text-white p-3 rounded-full">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">¡Hola, {perfilUsuario.nombre}!</h3>
              <p className="text-gray-600">Rol: {perfilUsuario.rol.nombre}</p>
              <p className="text-gray-600">Email: {perfilUsuario.email}</p>
              <p className="text-gray-600">Miembro desde: {new Date(perfilUsuario.fecha_registro).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de Edición */}
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Mi Perfil</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nombres</label>
          <input
            type="text"
            name="nombres"
            value={user.nombres}
            onChange={handleInputChange}
            disabled={!editMode}
            className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition bg-gray-100 disabled:opacity-70"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Apellidos</label>
          <input
            type="text"
            name="apellidos"
            value={user.apellidos}
            onChange={handleInputChange}
            disabled={!editMode}
            className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition bg-gray-100 disabled:opacity-70"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Correo electrónico</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full border border-blue-200 rounded-lg px-4 py-2 bg-gray-100 opacity-80"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
          <input
            type="text"
            name="telefono"
            value={user.telefono}
            onChange={handleInputChange}
            disabled={!editMode}
            className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition bg-gray-100 disabled:opacity-70"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de nacimiento</label>
          <input
            type="date"
            name="fecha_nacimiento"
            value={formatDateForInput(user.fecha_nacimiento)}
            onChange={handleInputChange}
            disabled={!editMode}
            className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition bg-gray-100 disabled:opacity-70"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Género</label>
          {editMode ? (
            <select
              name="genero"
              value={user.genero}
              onChange={handleInputChange}
              className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            >
              <option value="">Selecciona género</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
            </select>
          ) : (
            <input
              type="text"
              value={user.genero === "M" ? "Masculino" : user.genero === "F" ? "Femenino" : user.genero === "O" ? "Otro" : user.genero}
              disabled
              className="w-full border border-blue-200 rounded-lg px-4 py-2 bg-gray-100 disabled:opacity-70"
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Documento de identidad</label>
          <input
            type="text"
            name="documento_identidad"
            value={user.documento_identidad}
            onChange={handleInputChange}
            disabled={!editMode}
            className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition bg-gray-100 disabled:opacity-70"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">País</label>
          <input
            type="text"
            name="pais"
            value={user.pais}
            onChange={handleInputChange}
            disabled={!editMode}
            className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition bg-gray-100 disabled:opacity-70"
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          {!editMode && (
            <button
              type="button"
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-bold shadow hover:bg-blue-700 transition"
              onClick={() => setEditMode(true)}
            >
              Editar
            </button>
          )}
          {editMode && (
            <>
              <button
                type="button"
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                onClick={() => setEditMode(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-bold shadow hover:from-blue-600 hover:to-blue-800 transition"
              >
                Guardar
              </button>
            </>
          )}
        </div>
      </form>
      <div className="flex justify-end mt-4">
        <a
          href="/cliente/cambiar-password"
          className="text-blue-600 underline text-sm hover:text-blue-800"
        >
          Cambiar contraseña
        </a>
      </div>
    </div>
    </div>
  );
};

export default ClientDashboard;
