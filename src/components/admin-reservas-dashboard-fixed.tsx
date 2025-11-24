import React, { useState, useEffect, ChangeEvent } from "react";
import { Calendar, Edit, Trash2, Eye, EyeOff, MapPin, Users, Star, CheckCircle, X, User, Phone, Mail, Clock, DollarSign } from 'lucide-react';
import { listarReservas, crearReserva, editarReserva, eliminarReserva } from "@/api/reservas";
import axios from "@/api/axios";
import { obtenerHistorialReprogramacion } from "@/api/historial-reprogramacion";
import { obtenerVisitantesReserva } from "@/api/visitantes";
import { useToast } from "@/hooks/use-toast";
import useAuth from "@/hooks/useAuth";

// Estados de reserva - Solo los 4 estados que acepta el backend
const ESTADO_MAP: Record<string, string> = {
  "pendiente": "PENDIENTE",
  "cancelada": "CANCELADA",
  "pagada": "PAGADA",
  "reprogramada": "REPROGRAMADA"
};

interface Reserva {
  id: string;
  cliente?: string;
  clienteEmail?: string;
  destino?: string;
  paquete?: string;
  fecha: string;
  estado: string;
  precio?: number;
  precioUnitario?: number;
  telefono?: string;
  numeroPersonas?: number;
  tipoServicio?: string;
  // Campos originales del backend
  usuario?: any;
  fecha_inicio?: string;
  total?: string;
  detalles?: any[];
  acompanantes?: any[];
}

const estados = ["pendiente", "pagada", "cancelada", "reprogramada"];

const AdminReservasDashboard = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [filterEstado, setFilterEstado] = useState("todos");
  const [filterDestino, setFilterDestino] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("panel");
  // Estado para reglas de reprogramación
  const [reglas, setReglas] = useState<any[]>([]);
  const [loadingReglas, setLoadingReglas] = useState(false);
  const [showReglaModal, setShowReglaModal] = useState(false);
  const [editingRegla, setEditingRegla] = useState<any | null>(null);
  const [errorRegla, setErrorRegla] = useState<string | null>(null);
  // CRUD reglas de reprogramación
  const cargarReglas = async () => {
    setLoadingReglas(true);
    try {
      const res = await axios.get("/reglas-reprogramacion/");
      setReglas(res.data);
    } catch (e) {
      setErrorRegla("No se pudieron cargar las reglas");
    } finally {
      setLoadingReglas(false);
    }
  };

  const crearRegla = async (regla: any) => {
    try {
      const res = await axios.post("/reglas-reprogramacion/", regla);
      setShowReglaModal(false);
      cargarReglas();
      toast({ title: "Regla creada", description: res.data.nombre });
    } catch (e: any) {
      toast({ title: "Error al crear regla", description: e?.response?.data?.detail || "Error desconocido", variant: "destructive" });
    }
  };

  const editarRegla = async (id: number, regla: any) => {
    try {
      const res = await axios.put(`/reglas-reprogramacion/${id}/`, regla);
      setShowReglaModal(false);
      setEditingRegla(null);
      cargarReglas();
      toast({ title: "Regla actualizada", description: res.data.nombre });
    } catch (e: any) {
      toast({ title: "Error al editar regla", description: e?.response?.data?.detail || "Error desconocido", variant: "destructive" });
    }
  };

  const eliminarRegla = async (id: number) => {
    try {
      await axios.delete(`/reglas-reprogramacion/${id}/`);
      cargarReglas();
      toast({ title: "Regla eliminada" });
    } catch (e: any) {
      toast({ title: "Error al eliminar regla", description: e?.response?.data?.detail || "Error desconocido", variant: "destructive" });
    }
  };
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [historialReprogramacion, setHistorialReprogramacion] = useState<any[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null);
  
  // Estados para eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingReserva, setDeletingReserva] = useState<Reserva | null>(null);

  // 🔧 FUNCIÓN HELPER PARA COMPATIBILIDAD CON DJANGO BACKEND
  const procesarReservaDjango = async (reserva: any): Promise<Reserva> => {
    try {
      // Estructura Django: puede tener visitantes en endpoint separado
      let numeroPersonas = 1; // Por defecto, al menos el titular
      let cliente = "";
      let clienteEmail = "";
      let telefono = "";

      // 1. Si tiene cliente anidado (nuevo backend, preferido)
      if (reserva.cliente && typeof reserva.cliente === 'object') {
        cliente = `${reserva.cliente.nombre || reserva.cliente.nombres || ''} ${reserva.cliente.apellido || reserva.cliente.apellidos || ''}`.trim();
        clienteEmail = reserva.cliente.email || '';
        telefono = reserva.cliente.telefono || '';
      }
      // 2. Si tiene usuario directamente (estructura anterior)
      else if (reserva.usuario) {
        cliente = `${reserva.usuario.nombres || ''} ${reserva.usuario.apellidos || ''}`.trim();
        clienteEmail = reserva.usuario.email || '';
        telefono = reserva.usuario.telefono || '';
      }
      // 3. Si solo tiene el ID del cliente
      else if (reserva.cliente) {
        cliente = `Cliente ${reserva.cliente}`;
      }

      // Intentar obtener visitantes de la reserva
      try {
        const visitantesResponse = await obtenerVisitantesReserva(reserva.id);
        const visitantes = visitantesResponse.data?.results || visitantesResponse.data || [];

        if (visitantes.length > 0) {
          numeroPersonas = visitantes.length;

          // Buscar el titular para obtener info del cliente SOLO si no se obtuvo antes
          if (!cliente) {
            const titular = visitantes.find((v: any) => v.visitante?.es_titular || v.es_titular);
            if (titular && titular.visitante) {
              cliente = `${titular.visitante.nombre} ${titular.visitante.apellido}`;
              clienteEmail = titular.visitante.email || '';
              telefono = titular.visitante.telefono || '';
            }
          }
        }
      } catch (error) {
        console.log("ℹ️ No se pudieron obtener visitantes para reserva", reserva.id);
        // No es crítico, continuamos con los datos base
      }

      return {
        id: reserva.id?.toString() || '',
        cliente: cliente || 'Cliente no especificado',
        clienteEmail: clienteEmail,
        destino: `Reserva ${reserva.fecha || new Date(reserva.fecha_inicio || Date.now()).toLocaleDateString()}`,
        paquete: `Tour $${reserva.total || '0'}`,
        fecha: reserva.fecha || (reserva.fecha_inicio ? new Date(reserva.fecha_inicio).toLocaleDateString() : ''),
        estado: reserva.estado?.toLowerCase() || 'pendiente',
        precio: parseFloat(reserva.total || '0'),
        precioUnitario: parseFloat(reserva.total || '0') / numeroPersonas,
        telefono: telefono,
        numeroPersonas: numeroPersonas,
        tipoServicio: 'Servicio Turístico',
        usuario: reserva.usuario || null,
        fecha_inicio: reserva.fecha_inicio,
        total: reserva.total,
        detalles: reserva.detalles || [],
        acompanantes: reserva.acompanantes || [],
      };
    } catch (error) {
      console.error("Error procesando reserva Django:", error);
      // Fallback a estructura básica
      return {
        id: reserva.id?.toString() || '',
        cliente: 'Error al cargar cliente',
        clienteEmail: '',
        destino: 'Error al cargar',
        paquete: 'Error al cargar',
        fecha: '',
        estado: 'pendiente',
        precio: 0,
        precioUnitario: 0,
        telefono: '',
        numeroPersonas: 1,
        tipoServicio: '',
        usuario: null,
        fecha_inicio: reserva.fecha_inicio,
        total: reserva.total,
        detalles: [],
        acompanantes: [],
      };
    }
  };

  // Función para recargar reservas (reutilizable)
  const recargarReservas = async () => {
    try {
      setLoading(true);
      const res = await listarReservas();
      console.log("🔄 Recargando reservas DJANGO...", res.data);
      
      // 🚀 USAR NUEVA LÓGICA DJANGO COMPATIBLE
      const reservasMapeadas = await Promise.all(
        res.data.map(async (reserva: any) => {
          console.log("🔍 Procesando reserva Django para recarga:", reserva.id);
          return await procesarReservaDjango(reserva);
        })
      );
      
      console.log("🔄 Total de reservas mapeadas:", reservasMapeadas.length);
      console.log("🔄 Estados de reservas mapeadas:", reservasMapeadas.map((r: any) => ({ id: r.id, estado: r.estado })));
      
      setReservas(reservasMapeadas);
      console.log("✅ Estado actualizado con nuevas reservas");
      setLoading(false);
    } catch (error) {
      console.error("❌ Error al recargar reservas:", error);
      setLoading(false);
    }
  };

  const getPanelTitle = () => {
    if (currentUser?.roles?.includes(1) || currentUser?.role === "ADMIN") {
      return "Panel Administrativo - Gestión de Reservas";
    } else if (currentUser?.roles?.includes(4) || currentUser?.role === "SOPORTE") {
      return "Panel de Soporte - Gestión de Reservas";
    }
    return "Panel de Gestión - Reservas";
  };

  const getPanelDescription = () => {
    if (currentUser?.roles?.includes(1) || currentUser?.role === "ADMIN") {
      return "Gestiona todas las reservas, estados y confirmaciones de tu plataforma turística";
    } else if (currentUser?.roles?.includes(4) || currentUser?.role === "SOPORTE") {
      return "Proporciona soporte y gestiona reservas de clientes";
    }
    return "Gestiona las reservas de tu plataforma turística";
  };

  useEffect(() => {
    const cargarReservasYReglas = async () => {
      setLoading(true);
      try {
        console.log("📝 Cargando reservas con DJANGO BACKEND...");
        const res = await listarReservas();
        console.log("📝 Datos de reservas Django recibidos:", res.data);
        // 🚀 PROCESAR CON NUEVA LÓGICA DJANGO
        const reservasMapeadas = await Promise.all(
          res.data.map(async (reserva: any) => {
            console.log("🔍 Procesando reserva Django inicial:", reserva.id);
            return await procesarReservaDjango(reserva);
          })
        );
        console.log("✅ Reservas Django procesadas:", reservasMapeadas.length);
        setReservas(reservasMapeadas);
        setLoading(false);
      } catch (error) {
        console.error("❌ Error cargando reservas Django:", error);
        setError("No se pudieron cargar las reservas");
        setLoading(false);
      }
      // Cargar reglas de reprogramación
      cargarReglas();
    };
    cargarReservasYReglas();
  }, []);

  const filteredReservas = reservas.filter((reserva: Reserva) => {
    // Si no hay ningún filtro ni búsqueda, mostrar todas las reservas
    if (
      (!searchTerm || searchTerm.trim() === "") &&
      (filterEstado === "todos" || !filterEstado) &&
      (filterDestino === "todos" || !filterDestino)
    ) {
      return true;
    }

    // Filtro de búsqueda por cliente, destino o paquete
    const matchesSearch = (reserva.cliente || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (reserva.destino || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (reserva.paquete || "").toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro por estado
    const matchesEstado = filterEstado === "todos" || (reserva.estado?.toLowerCase() === filterEstado);

    // Filtro por destino
    const matchesDestino = filterDestino === "todos" || (reserva.destino || "").toLowerCase().includes(filterDestino.toLowerCase());

    return matchesSearch && matchesEstado && matchesDestino;
  });

  // Obtener destinos únicos para el filtro
  const destinosUnicos = Array.from(new Set(reservas.map((r: Reserva) => r.destino).filter((destino: string | undefined) => destino && destino.trim() !== "")));

  // Función para abrir el modal de detalles
  const verDetallesReserva = async (reserva: Reserva) => {
    setSelectedReserva(reserva);
    setShowModal(true);
    setLoadingHistorial(true);
    try {
      const historial = await obtenerHistorialReprogramacion(reserva.id);
      setHistorialReprogramacion(historial.results || historial || []);
    } catch (error) {
      setHistorialReprogramacion([]);
    }
    setLoadingHistorial(false);
  };

  // Función para cerrar el modal
  const cerrarModal = () => {
    setSelectedReserva(null);
    setShowModal(false);
  };

  // Función para abrir el modal de edición
  const abrirModalEdicion = (reserva: Reserva) => {
    setEditingReserva({...reserva}); // Crear una copia para editar
    setShowEditModal(true);
  };

  // Función para cerrar el modal de edición
  const cerrarModalEdicion = () => {
    setEditingReserva(null);
    setShowEditModal(false);
  };

  // Funciones para eliminación lógica
  const abrirModalEliminacion = (reserva: Reserva) => {
    console.log("🗑️ Abriendo modal de eliminación para reserva:", reserva.id);
    setDeletingReserva(reserva);
    setShowDeleteModal(true);
  };

  const cerrarModalEliminacion = () => {
    setDeletingReserva(null);
    setShowDeleteModal(false);
  };

  const confirmarEliminacion = async () => {
    if (!deletingReserva) return;
    
    try {
      console.log("🗑️ Iniciando eliminación lógica de reserva:", deletingReserva.id);
      
      // Para eliminación lógica, actualizamos el estado a "cancelada"
      const datosEliminacion: any = {
        estado: "CANCELADA", // Backend requiere mayúsculas
        detalles: deletingReserva.detalles || [],
        acompanantes: deletingReserva.acompanantes || [],
        total: deletingReserva.total || "0",
      };

      // Si hay fecha_inicio, incluirla
      if (deletingReserva.fecha_inicio) {
        datosEliminacion.fecha_inicio = deletingReserva.fecha_inicio;
      }

      console.log("🗑️ Datos para eliminación lógica:", datosEliminacion);
      
      // Actualizar la reserva con estado CANCELADA (eliminación lógica)
      await editarReserva(deletingReserva.id, datosEliminacion);
      
      // Recargar las reservas
      console.log("🔄 Recargando reservas después de eliminación lógica...");
      await recargarReservas();
      
      toast({
        title: "✅ Reserva eliminada",
        description: `La reserva #${deletingReserva.id} ha sido marcada como cancelada`,
      });
      
      cerrarModalEliminacion();
      
    } catch (error: any) {
      console.error('❌ Error al eliminar reserva:', error);
      
      let errorMessage = "No se pudo eliminar la reserva. Por favor, intenta nuevamente.";
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        }
      }
      
      toast({
        title: "❌ Error al eliminar",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Función para guardar los cambios
  const validarDatosReserva = (reserva: any): { valido: boolean; errores: string[] } => {
    const errores: string[] = [];
    
    // Validar estado
    const estadosValidos = ['pendiente', 'pagada', 'cancelada', 'reprogramada'];
    if (!reserva.estado || !estadosValidos.includes(reserva.estado)) {
      errores.push('El estado de la reserva es obligatorio y debe ser válido');
    }
    
    // Validar número de personas
    if (reserva.numeroPersonas && (isNaN(reserva.numeroPersonas) || reserva.numeroPersonas < 1)) {
      errores.push('El número de personas debe ser un número mayor a 0');
    }
    
    // Validar precios
    if (reserva.precio && (isNaN(reserva.precio) || reserva.precio < 0)) {
      errores.push('El precio total debe ser un número positivo');
    }
    
    if (reserva.precioUnitario && (isNaN(reserva.precioUnitario) || reserva.precioUnitario < 0)) {
      errores.push('El precio unitario debe ser un número positivo');
    }
    
    // Validar fecha
    if (reserva.fecha_inicio) {
      const fecha = new Date(reserva.fecha_inicio);
      if (isNaN(fecha.getTime())) {
        errores.push('La fecha de inicio no es válida');
      }
    }
    
    // Validar teléfono si se proporciona
    if (reserva.telefono && reserva.telefono.trim() !== '') {
      const telefonoRegex = /^[\d\s\-\+\(\)]+$/;
      if (!telefonoRegex.test(reserva.telefono)) {
        errores.push('El teléfono contiene caracteres no válidos');
      }
    }
    
    return {
      valido: errores.length === 0,
      errores
    };
  };

  const guardarCambios = async () => {
    if (!editingReserva) {
      console.error('❌ No hay reserva para editar');
      return;
    }
    
    if (!editingReserva.id) {
      console.error('❌ ID de reserva inválido:', editingReserva.id);
      toast({
        title: "Error",
        description: "No se puede editar: ID de reserva inválido",
        variant: "destructive"
      });
      return;
    }
    
    // Verificar token de autenticación
    const token = localStorage.getItem('access');
    if (!token) {
      console.error('❌ No hay token de acceso disponible');
      toast({
        title: "Error de autenticación",
        description: "Debes iniciar sesión para editar reservas",
        variant: "destructive"
      });
      return;
    }
    console.log('✅ Token de acceso encontrado');
    
    // Validar los datos antes de enviar
    const validacion = validarDatosReserva(editingReserva);
    if (!validacion.valido) {
      toast({
        title: "❌ Datos inválidos",
        description: `Por favor, corrige los siguientes errores:\n• ${validacion.errores.join('\n• ')}`,
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log('🔍 DEBUG: Estructura actual de editingReserva:', {
        id: editingReserva.id,
        estado: editingReserva.estado,
        detalles: editingReserva.detalles,
        acompanantes: editingReserva.acompanantes,
        total: editingReserva.total,
        precio: editingReserva.precio,
        fecha_inicio: editingReserva.fecha_inicio
      });
      
      console.log('🔍 DETALLE acompañantes:', editingReserva.acompanantes);
      console.log('🔍 Tipo de acompañantes:', typeof editingReserva.acompanantes);
      console.log('🔍 Es array?:', Array.isArray(editingReserva.acompanantes));
      if (editingReserva.acompanantes && editingReserva.acompanantes.length > 0) {
        console.log('🔍 Primer acompañante:', editingReserva.acompanantes[0]);
      }

      // Preparar los datos para la API - incluir campos requeridos por el backend
      const acompanantesLimpios = editingReserva.acompanantes?.map((acomp: any, index: number) => ({
        nombre: acomp.nombres || acomp.nombre || `Acompañante ${index + 1}`,
        apellido: acomp.apellidos || acomp.apellido || `Apellido${index + 1}`, // No enviar vacío
        fecha_nacimiento: acomp.fecha_nacimiento || "1990-01-01",
        // Mantener campos adicionales si existen
        ...(acomp.email && { email: acomp.email }),
        ...(acomp.telefono && { telefono: acomp.telefono })
      })) || [];
      
      // OPCIÓN: Intentar sin acompañantes si hay problemas
      const datosActualizacion = {
        estado: editingReserva.estado?.toUpperCase() || 'PENDIENTE',
        detalles: editingReserva.detalles || [],
        fecha_inicio: editingReserva.fecha_inicio,
        total: editingReserva.total || editingReserva.precio || 0,
        // Comentar acompañantes temporalmente para probar
        // acompanantes: acompanantesLimpios,
      };

      console.log('� Acompañantes originales:', editingReserva.acompanantes);
      console.log('🔧 Acompañantes limpios:', acompanantesLimpios);
      
      console.log('�📤 Enviando datos completos de actualización:', datosActualizacion);
      console.log('📤 ID de reserva a editar:', editingReserva.id);
      console.log('📤 Tipo del ID:', typeof editingReserva.id);
      console.log('📤 ID como string:', String(editingReserva.id));
      console.log('📤 URL que se va a llamar:', `/reservas/${editingReserva.id}/`);
      
      // Llamar a la API para actualizar la reserva
      console.log("💾 Guardando cambios en el backend...");
      console.log("🧪 PRUEBA: Enviando SIN acompañantes para aislar el problema con acompañantes");
      const resultadoEdicion = await editarReserva(String(editingReserva.id), datosActualizacion);
      console.log("✅ Cambios guardados en el backend exitosamente");
      console.log("📋 Resultado de la edición:", resultadoEdicion.data);
      
      // Pequeño delay para asegurar que el backend procese el cambio
      console.log("⏳ Esperando 500ms para asegurar procesamiento...");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Recargar las reservas usando la función reutilizable
      console.log("🔄 Iniciando recarga de datos después de guardar...");
      await recargarReservas();
      console.log("✅ Recarga de datos completada");
      
      toast({
        title: "✅ Reserva actualizada",
        description: `Los cambios en la reserva #${editingReserva.id} se han guardado correctamente`,
      });
      
      cerrarModalEdicion();
    } catch (error: any) {
      console.error('❌ Error al guardar cambios:', error);
      console.error('❌ Respuesta del servidor:', error.response?.data);
      console.error('❌ Status:', error.response?.status);
      
      let errorMessage = "No se pudieron guardar los cambios. Por favor, intenta nuevamente.";
      
      if (error.response?.data) {
        // Si el servidor envía detalles del error, mostrarlos
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          // Si es un objeto con errores de campos específicos
          const errors = Object.entries(error.response.data)
            .map(([field, messages]: [string, any]) => {
              const messageText = Array.isArray(messages) ? messages.join(', ') : messages;
              return `${field}: ${messageText}`;
            })
            .join('\n');
          errorMessage = `Errores de validación:\n${errors}`;
        }
      }
      
      toast({
        title: "❌ Error al guardar",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            {getPanelTitle()}
          </h1>
        </div>
        <p className="text-gray-600">
          {getPanelDescription()}
        </p>
      </div>

      {/* Tabs para alternar vistas */}
      <div className="mb-4 md:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-4">
        <button
          className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm sm:text-base ${activeTab === "panel" ? "bg-blue-600 text-white" : "bg-white text-blue-600 border border-blue-600"}`}
          onClick={() => setActiveTab("panel")}
        >
          Panel General
        </button>
        <button
          className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm sm:text-base ${activeTab === "reservas" ? "bg-blue-600 text-white" : "bg-white text-blue-600 border border-blue-600"}`}
          onClick={() => setActiveTab("reservas")}
        >
          Gestión de reservas
        </button>
        <button
          className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm sm:text-base ${activeTab === "reglas" ? "bg-blue-600 text-white" : "bg-white text-blue-600 border border-blue-600"}`}
          onClick={() => setActiveTab("reglas")}
        >
          Reglas de Reprogramación
        </button>
      </div>
      {/* Vista de reglas de reprogramación */}
      {activeTab === "reglas" && (
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
              <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Reglas de Reprogramación
            </h2>
            <button
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-2 rounded-lg shadow hover:from-blue-600 hover:to-blue-800 font-semibold transition"
              onClick={() => { setEditingRegla(null); setShowReglaModal(true); }}
            >
              + Nueva Regla
            </button>
          </div>
          {loadingReglas ? (
            <div className="text-gray-600 text-center py-8">Cargando reglas...</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-blue-700 uppercase tracking-wider">Nombre</th>
                    <th className="px-4 py-3 text-left font-semibold text-blue-700 uppercase tracking-wider">Descripción</th>
                    <th className="px-4 py-3 text-left font-semibold text-blue-700 uppercase tracking-wider">Aplica a</th>
                    <th className="px-4 py-3 text-left font-semibold text-blue-700 uppercase tracking-wider">Tipo</th>
                    <th className="px-4 py-3 text-left font-semibold text-blue-700 uppercase tracking-wider">Valor</th>
                    <th className="px-4 py-3 text-left font-semibold text-blue-700 uppercase tracking-wider">Activa</th>
                    <th className="px-4 py-3 text-left font-semibold text-blue-700 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {reglas.map((regla) => (
                    <tr key={regla.id} className="hover:bg-blue-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-900">{regla.nombre}</td>
                      <td className="px-4 py-3 text-gray-700">{regla.descripcion}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${regla.aplicable_a === 'CLIENTE' ? 'bg-green-100 text-green-700' : regla.aplicable_a === 'ADMIN' ? 'bg-yellow-100 text-yellow-700' : regla.aplicable_a === 'OPERADOR' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{regla.aplicable_a}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{regla.tipo_regla.replaceAll('_', ' ').replace('LIMITE', 'Límite').replace('TIEMPO', 'Tiempo')}</td>
                      <td className="px-4 py-3 text-center font-bold text-blue-700">{regla.valor_numerico}</td>
                      <td className="px-4 py-3 text-center">
                        {regla.activa ? <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">Sí</span> : <span className="inline-block px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold">No</span>}
                      </td>
                      <td className="px-4 py-3 flex gap-2 items-center">
                        <button className="text-blue-600 hover:text-blue-900 font-semibold px-2 py-1 rounded transition" onClick={() => { setEditingRegla(regla); setShowReglaModal(true); }}>Editar</button>
                        <button className="text-red-600 hover:text-red-900 font-semibold px-2 py-1 rounded transition" onClick={() => eliminarRegla(regla.id)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {errorRegla && <div className="text-red-600 mt-4 text-center">{errorRegla}</div>}
        </div>
      )}

      {/* Modal para crear/editar regla */}
      {showReglaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-gray-100 animate-fade-in">
            <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-blue-700">{editingRegla ? "Editar Regla" : "Nueva Regla"}</h2>
              <button onClick={() => { setShowReglaModal(false); setEditingRegla(null); }} className="text-gray-400 hover:text-gray-600 transition-colors text-2xl">✕</button>
            </div>
            <form className="px-8 py-6 space-y-5" onSubmit={e => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const data = Object.fromEntries(new FormData(form));
              if (!data.valor_numerico || isNaN(Number(data.valor_numerico)) || Number(data.valor_numerico) <= 0) {
                toast({ title: "Valor numérico inválido", description: "Debe ser un número positivo", variant: "destructive" });
                return;
              }
              const payload = {
                nombre: data.nombre,
                descripcion: data.descripcion,
                aplicable_a: data.aplicable_a,
                tipo_regla: data.tipo_regla,
                valor_numerico: Number(data.valor_numerico),
                activa: data.activa === "on"
              };
              if (editingRegla) editarRegla(editingRegla.id, payload); else crearRegla(payload);
            }}>
              <div>
                <label className="block text-sm font-semibold text-blue-700 mb-1">Nombre</label>
                <input name="nombre" defaultValue={editingRegla?.nombre || ""} required className="mt-1 block w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 bg-blue-50/30" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-blue-700 mb-1">Descripción</label>
                <textarea name="descripcion" defaultValue={editingRegla?.descripcion || ""} required className="mt-1 block w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 bg-blue-50/30" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-1">Aplica a</label>
                  <select name="aplicable_a" defaultValue={editingRegla?.aplicable_a || "CLIENTE"} required className="mt-1 block w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 bg-blue-50/30">
                    <option value="CLIENTE">CLIENTE</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="OPERADOR">OPERADOR</option>
                    <option value="ALL">TODOS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-1">Tipo de regla</label>
                  <select name="tipo_regla" defaultValue={editingRegla?.tipo_regla || "LIMITE_REPROGRAMACIONES"} required className="mt-1 block w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 bg-blue-50/30">
                    <option value="LIMITE_REPROGRAMACIONES">Límite de reprogramaciones</option>
                    <option value="DESCUENTO_PENALIZACION">Penalización/Descuento</option>
                    <option value="TIEMPO_MINIMO">Tiempo mínimo</option>
                    <option value="TIEMPO_ANTICIPACION">Anticipación</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-1">Valor numérico</label>
                  <input name="valor_numerico" type="number" min="1" defaultValue={editingRegla?.valor_numerico || 1} required className="mt-1 block w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 bg-blue-50/30" />
                </div>
                <div className="flex items-center h-full mt-6 md:mt-0">
                  <input name="activa" type="checkbox" defaultChecked={editingRegla?.activa ?? true} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-200" />
                  <label className="ml-2 text-sm text-blue-700">Activa</label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setShowReglaModal(false); setEditingRegla(null); }} className="px-5 py-2 border border-gray-200 text-blue-700 rounded-lg hover:bg-blue-50 font-semibold transition">Cancelar</button>
                <button type="submit" className="px-7 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg hover:from-blue-600 hover:to-blue-800 font-semibold transition">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vista Gestión de reservas */}
      {activeTab === "reservas" && (
        <>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full lg:w-auto">
                <input
                  type="text"
                  placeholder="Buscar por cliente, destino o paquete..."
                  className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base min-w-0"
                  value={searchTerm}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                />
                <select
                  className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  value={filterEstado}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterEstado(e.target.value)}
                >
                  <option value="todos">Todos los estados</option>
                  {estados.map(estado => (
                    <option key={estado} value={estado}>{estado.toUpperCase()}</option>
                  ))}
                </select>
                <select
                  className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  value={filterDestino}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterDestino(e.target.value)}
                >
                  <option value="todos">Todos los destinos</option>
                  {destinosUnicos.map(destino => (
                    <option key={destino} value={destino}>{destino}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-x-auto max-h-[60vh] md:max-h-[70vh]">
            <div className="overflow-x-auto overflow-y-auto max-h-[60vh] md:max-h-[70vh] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table className="min-w-[1000px] md:min-w-full divide-y divide-gray-200 text-xs md:text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]">Cliente</th>
                    <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[100px]">Destino</th>
                    <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[100px]">Paquete</th>
                    <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[90px]">Fecha</th>
                    <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[80px]">Estado</th>
                    <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[80px]">Precio Unit.</th>
                    <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[80px]">Total</th>
                    <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[100px]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReservas.map((reserva, index) => (
                    <tr key={reserva.id} className="hover:bg-gray-50">
                          <td className="px-1 md:px-4 py-1 md:py-2 whitespace-normal break-words text-[11px] md:text-sm">
                            <div className="font-medium text-gray-900 break-words whitespace-normal leading-tight">{reserva.cliente || "Sin nombre"}</div>
                            {reserva.clienteEmail && (
                              <div className="text-gray-500 break-all whitespace-normal leading-tight text-[10px] md:text-xs">{reserva.clienteEmail}</div>
                            )}
                          </td>
                      <td className="px-1 md:px-4 py-1 md:py-2 whitespace-normal break-words text-[11px] md:text-sm">
                        <div className="text-gray-900 break-words whitespace-normal leading-tight">{reserva.destino || "Sin destino"}</div>
                      </td>
                      <td className="px-1 md:px-4 py-1 md:py-2 whitespace-normal break-words text-[11px] md:text-sm">
                        <div className="text-gray-900 break-words whitespace-normal leading-tight">{reserva.paquete || "Sin paquete"}</div>
                      </td>
                      <td className="px-1 md:px-4 py-1 md:py-2 whitespace-normal text-[11px] md:text-sm">
                        <div className="text-gray-900 break-words whitespace-normal leading-tight">{reserva.fecha || "Sin fecha"}</div>
                      </td>
                      <td className="px-2 md:px-4 py-2 whitespace-normal">
                        {(() => {
                          const estado = (reserva.estado || "").toLowerCase();
                          let color = "bg-gray-100 text-gray-800";
                          if (estado === "pagada") color = "bg-green-100 text-green-800";
                          else if (estado === "pendiente") color = "bg-yellow-100 text-yellow-800";
                          else if (estado === "cancelada") color = "bg-red-100 text-red-800";
                          else if (estado === "pagada") color = "bg-blue-100 text-blue-800";
                          return (
                            <span className={`inline-flex px-2 py-1 text-[10px] md:text-xs font-semibold rounded-full ${color}`}>
                              {estado ? estado.charAt(0).toUpperCase() + estado.slice(1) : ""}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-1 md:px-4 py-1 md:py-2 whitespace-normal text-[11px] md:text-sm">
                        <div className="text-gray-900 font-medium">
                          ${reserva.precioUnitario ? reserva.precioUnitario.toFixed(2) : '0.00'}
                        </div>
                        {reserva.tipoServicio && (
                          <div className="text-gray-500 text-[10px] md:text-xs">{reserva.tipoServicio}</div>
                        )}
                      </td>
                      <td className="px-1 md:px-4 py-1 md:py-2 whitespace-normal text-[11px] md:text-sm">
                        <div className="text-gray-900 font-bold">
                          ${reserva.precio ? reserva.precio.toFixed(2) : '0.00'}
                        </div>
                        <div className="text-gray-500 text-[10px] md:text-xs">
                          {reserva.numeroPersonas} personas
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-2 whitespace-nowrap text-xs md:text-sm font-medium">
                        <div className="flex gap-2 items-center flex-wrap justify-start">
                          <button 
                            title="Ver detalles de la reserva" 
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            onClick={() => verDetallesReserva(reserva)}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            title="Editar reserva" 
                            className="text-green-600 hover:text-green-900 transition-colors"
                            onClick={() => abrirModalEdicion(reserva)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            title="Eliminar reserva" 
                            className="text-red-600 hover:text-red-900 transition-colors"
                            onClick={() => abrirModalEliminacion(reserva)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredReservas.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron reservas</h3>
                  <p className="mt-1 text-sm text-gray-500">Intenta cambiar los filtros de búsqueda</p>
                </div>
              )}
            </div>
          </div>
          {error && <div className="text-red-600 mt-4">{error}</div>}
          {loading && <div className="text-gray-600 mt-4">Cargando reservas...</div>}
        </>
      )}

      {/* Vista Panel General - Estadísticas */}
      {activeTab === "panel" && (
        <div className="space-y-6">
          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Reservas</p>
                  <p className="text-3xl font-bold">{reservas.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Pagadas</p>
                  <p className="text-3xl font-bold">{reservas.filter(r => r.estado === 'pagada').length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Pendientes</p>
                  <p className="text-3xl font-bold">{reservas.filter(r => r.estado === 'pendiente').length}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Canceladas</p>
                  <p className="text-3xl font-bold">{reservas.filter(r => r.estado === 'cancelada').length}</p>
                </div>
                <X className="w-8 h-8 text-red-200" />
              </div>
            </div>
          </div>

          {/* Estadísticas secundarias */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Reprogramadas</p>
                  <p className="text-2xl font-bold text-gray-900">{reservas.filter(r => r.estado === 'reprogramada').length}</p>
                </div>
                <Star className="w-6 h-6 text-indigo-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Pagadas</p>
                  <p className="text-2xl font-bold text-gray-900">{reservas.filter(r => r.estado === 'pagada').length}</p>
                </div>
                <DollarSign className="w-6 h-6 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Destinos Únicos</p>
                  <p className="text-2xl font-bold text-gray-900">{Array.from(new Set(reservas.map(r => r.destino).filter(d => d && d.trim() !== ""))).length}</p>
                </div>
                <MapPin className="w-6 h-6 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-teal-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Clientes Únicos</p>
                  <p className="text-2xl font-bold text-gray-900">{Array.from(new Set(reservas.map(r => r.clienteEmail).filter(e => e && e.trim() !== ""))).length}</p>
                </div>
                <Users className="w-6 h-6 text-teal-500" />
              </div>
            </div>
          </div>

          {/* Resumen de Reservas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Reservas</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Distribución por Estado</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">PENDIENTE</span>
                  </div>
                  <span className="font-medium">{reservas.filter(r => r.estado === 'pendiente').length} ({reservas.length > 0 ? ((reservas.filter(r => r.estado === 'pendiente').length/reservas.length)*100).toFixed(1) : 0}%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">PAGADA</span>
                  </div>
                  <span className="font-medium">{reservas.filter(r => r.estado === 'pagada').length} ({reservas.length > 0 ? ((reservas.filter(r => r.estado === 'pagada').length/reservas.length)*100).toFixed(1) : 0}%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">CANCELADA</span>
                  </div>
                  <span className="font-medium">{reservas.filter(r => r.estado === 'cancelada').length} ({reservas.length > 0 ? ((reservas.filter(r => r.estado === 'cancelada').length/reservas.length)*100).toFixed(1) : 0}%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">REPROGRAMADA</span>
                  </div>
                  <span className="font-medium">{reservas.filter(r => r.estado === 'reprogramada').length} ({reservas.length > 0 ? ((reservas.filter(r => r.estado === 'reprogramada').length/reservas.length)*100).toFixed(1) : 0}%)</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Destinos Populares</h3>
              <div className="space-y-3">
                {Array.from(new Set(reservas.map(r => r.destino).filter(d => d && d.trim() !== ""))).slice(0, 5).map(destino => {
                  const count = reservas.filter(r => r.destino === destino).length;
                  const percentage = reservas.length > 0 ? ((count/reservas.length)*100).toFixed(1) : 0;
                  return (
                    <div key={destino} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-700 font-medium">{destino}</span>
                      <div className="text-right">
                        <span className="font-bold text-gray-900">{count}</span>
                        <span className="text-sm text-gray-500 ml-2">({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles de reserva */}
      {showModal && selectedReserva && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Detalles de la Reserva</h2>
                <p className="text-gray-600">ID: {selectedReserva.id}</p>
              </div>
              <button
                onClick={cerrarModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 space-y-6">
              {/* Información del cliente */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información del Cliente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Nombre:</span>
                      <span className="font-medium">{selectedReserva.cliente}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="font-medium">{selectedReserva.clienteEmail}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {selectedReserva.telefono && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-600">Teléfono:</span>
                        <span className="font-medium">{selectedReserva.telefono}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Número de personas:</span>
                      <span className="font-medium">{selectedReserva.numeroPersonas}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de la reserva */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Información de la Reserva
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">Destino:</span>
                      <span className="font-medium">{selectedReserva.destino}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">Paquete:</span>
                      <span className="font-medium">{selectedReserva.paquete}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">Fecha:</span>
                      <span className="font-medium">{selectedReserva.fecha}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">Estado:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        selectedReserva.estado === 'pagada' ? 'bg-green-100 text-green-800' :
                        selectedReserva.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        selectedReserva.estado === 'cancelada' ? 'bg-red-100 text-red-800' :
                        selectedReserva.estado === 'pagada' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedReserva.estado ? selectedReserva.estado.charAt(0).toUpperCase() + selectedReserva.estado.slice(1) : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de precios */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Información de Precios
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-purple-600">
                      ${selectedReserva.precioUnitario ? selectedReserva.precioUnitario.toFixed(2) : '0.00'}
                    </div>
                    <div className="text-sm text-gray-600">Precio Unitario</div>
                    {selectedReserva.tipoServicio && (
                      <div className="text-xs text-purple-600 mt-1">{selectedReserva.tipoServicio}</div>
                    )}
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-green-600">
                      ${selectedReserva.precio ? selectedReserva.precio.toFixed(2) : '0.00'}
                    </div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-blue-600">
                      ${selectedReserva.precio && selectedReserva.numeroPersonas ? 
                        (selectedReserva.precio / selectedReserva.numeroPersonas).toFixed(2) : '0.00'}
                    </div>
                    <div className="text-sm text-gray-600">Por Persona</div>
                  </div>
                </div>
              </div>

              {/* Detalles de servicios */}
              {selectedReserva.detalles && selectedReserva.detalles.length > 0 && (
                <div className="bg-orange-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-orange-900 mb-3">Servicios Incluidos</h3>
                  <div className="space-y-3">
                    {selectedReserva.detalles.map((detalle: any, index: number) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-orange-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{detalle.titulo || 'Servicio sin título'}</h4>
                            <p className="text-sm text-gray-600">{detalle.tipo || 'Tipo no especificado'}</p>
                            {detalle.fecha_servicio && (
                              <p className="text-xs text-gray-500 mt-1">
                                Fecha: {new Date(detalle.fecha_servicio).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-orange-600">
                              ${parseFloat(detalle.precio_unitario || '0').toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-600">
                              Cantidad: {detalle.cantidad || 1}
                            </div>
                            <div className="text-sm font-semibold text-gray-900">
                              Subtotal: ${((parseFloat(detalle.precio_unitario || '0')) * (parseInt(detalle.cantidad || '1'))).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Acompañantes */}
              {selectedReserva.acompanantes && selectedReserva.acompanantes.length > 0 && (
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Acompañantes ({selectedReserva.acompanantes.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedReserva.acompanantes.map((acompanante: any, index: number) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-indigo-200">
                        <div className="font-medium text-gray-900">
                          {acompanante.nombres ? `${acompanante.nombres} ${acompanante.apellidos || ''}`.trim() : `Acompañante ${index + 1}`}
                        </div>
                        {acompanante.edad && (
                          <div className="text-sm text-gray-600">Edad: {acompanante.edad} años</div>
                        )}
                        {acompanante.documento && (
                          <div className="text-sm text-gray-600">Documento: {acompanante.documento}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={cerrarModal}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cerrar
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => {
                  cerrarModal();
                  abrirModalEdicion(selectedReserva!);
                }}
              >
                Editar Reserva
              </button>
              <button 
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                onClick={async () => {
                  if (!selectedReserva) return;
                  try {
                    await editarReserva(selectedReserva.id, { estado: 'PAGADA' });
                    toast({ title: 'Reserva confirmada', description: 'El estado ha sido actualizado a PAGADA', variant: 'default' });
                    setShowModal(false);
                    recargarReservas();
                  } catch (error) {
                    toast({ title: 'Error al confirmar', description: 'No se pudo actualizar el estado', variant: 'destructive' });
                  }
                }}
              >
                Confirmar Reserva
              </button>
            </div>

            {/* Historial de reprogramaciones */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Historial de Reprogramaciones
              </h3>
              {loadingHistorial ? (
                <div className="text-gray-500 text-sm">Cargando historial...</div>
              ) : historialReprogramacion.length === 0 ? (
                <div className="text-gray-500 text-sm">No hay reprogramaciones registradas para esta reserva.</div>
              ) : (
                <ul className="space-y-2">
                  {historialReprogramacion.map((item, idx) => (
                    <li key={idx} className="bg-white rounded-lg p-3 border border-indigo-200">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                        <div>
                          <span className="font-medium text-indigo-800">{item.fecha_anterior ? `De: ${new Date(item.fecha_anterior).toLocaleString()}` : ''}</span>
                          {item.fecha_nueva && <span className="ml-2 font-medium text-green-700">a: {new Date(item.fecha_nueva).toLocaleString()}</span>}
                        </div>
                        <div className="text-sm text-gray-600">Motivo: {item.motivo || 'Sin motivo'}</div>
                        <div className="text-xs text-gray-500">Reprogramado por: {item.reprogramado_por || 'N/A'}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición de reserva */}
      {showEditModal && editingReserva && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Editar Reserva</h2>
                <p className="text-gray-600">ID: {editingReserva.id}</p>
              </div>
              <button
                onClick={cerrarModalEdicion}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Formulario de edición */}
            <div className="p-6 space-y-6">
              {/* Información del cliente (solo lectura) */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información del Cliente (Solo lectura)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      value={editingReserva.cliente || ''}
                      disabled
                      className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={editingReserva.clienteEmail || ''}
                      disabled
                      className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Estado de la reserva */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Estado de la Reserva
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select
                    value={editingReserva.estado || 'pendiente'}
                    onChange={(e) => setEditingReserva({...editingReserva, estado: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="pagada">Pagada</option>
                    <option value="cancelada">Cancelada</option>
                    <option value="reprogramada">Reprogramada</option>
                  </select>
                </div>
              </div>

              {/* Información de la reserva */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Detalles de la Reserva
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Destino</label>
                    <input
                      type="text"
                      value={editingReserva.destino || ''}
                      onChange={(e) => setEditingReserva({...editingReserva, destino: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Paquete</label>
                    <input
                      type="text"
                      value={editingReserva.paquete || ''}
                      onChange={(e) => setEditingReserva({...editingReserva, paquete: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de inicio</label>
                    <input
                      type="datetime-local"
                      value={editingReserva.fecha_inicio ? new Date(editingReserva.fecha_inicio).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setEditingReserva({...editingReserva, fecha_inicio: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Número de personas</label>
                    <input
                      type="number"
                      min="1"
                      value={editingReserva.numeroPersonas || 1}
                      onChange={(e) => setEditingReserva({...editingReserva, numeroPersonas: parseInt(e.target.value)})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Información de precios */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Precios
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Precio Unitario</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingReserva.precioUnitario || 0}
                        onChange={(e) => setEditingReserva({...editingReserva, precioUnitario: parseFloat(e.target.value)})}
                        className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingReserva.precio || 0}
                        onChange={(e) => setEditingReserva({...editingReserva, precio: parseFloat(e.target.value)})}
                        className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Cálculo automático por persona */}
                <div className="mt-4 p-3 bg-white rounded-lg border">
                  <div className="text-sm text-gray-600">Precio por persona (calculado):</div>
                  <div className="text-lg font-bold text-purple-600">
                    ${editingReserva.precio && editingReserva.numeroPersonas ? 
                      (editingReserva.precio / editingReserva.numeroPersonas).toFixed(2) : '0.00'}
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-orange-900 mb-3 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Información Adicional
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono de contacto</label>
                    <input
                      type="tel"
                      value={editingReserva.telefono || ''}
                      onChange={(e) => setEditingReserva({...editingReserva, telefono: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de servicio</label>
                    <select
                      value={editingReserva.tipoServicio || ''}
                      onChange={(e) => setEditingReserva({...editingReserva, tipoServicio: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Seleccionar tipo</option>
                      <option value="Turismo">Turismo</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Aventura">Aventura</option>
                      <option value="Gastronómico">Gastronómico</option>
                      <option value="Ecoturismo">Ecoturismo</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer del modal */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={cerrarModalEdicion}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={guardarCambios}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && deletingReserva && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Header del modal */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Eliminar Reserva</h2>
                  <p className="text-gray-600">ID: {deletingReserva.id}</p>
                </div>
              </div>
              <button 
                onClick={cerrarModalEliminacion}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              <div className="mb-6">
                <div className="text-center mb-4">
                  <p className="text-gray-900 font-medium mb-2">
                    ¿Estás seguro de que deseas eliminar esta reserva?
                  </p>
                  <p className="text-gray-600 text-sm">
                    Esta acción marcará la reserva como <span className="font-semibold text-red-600">CANCELADA</span>.
                    Podrás reactivarla posteriormente cambiando su estado.
                  </p>
                </div>

                {/* Información de la reserva a eliminar */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cliente:</span>
                      <span className="font-medium">{deletingReserva.cliente}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Destino:</span>
                      <span className="font-medium">{deletingReserva.destino}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha:</span>
                      <span className="font-medium">{deletingReserva.fecha}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado actual:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        deletingReserva.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        deletingReserva.estado === 'pagada' ? 'bg-green-100 text-green-800' :
                        deletingReserva.estado === 'cancelada' ? 'bg-red-100 text-red-800' :
                        deletingReserva.estado === 'reprogramada' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {deletingReserva.estado ? deletingReserva.estado.charAt(0).toUpperCase() + deletingReserva.estado.slice(1) : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 text-red-600 mt-0.5">⚠️</div>
                    <div className="text-sm text-red-800">
                      <p className="font-medium">Eliminación Lógica</p>
                      <p>La reserva será marcada como cancelada pero no se eliminará permanentemente del sistema.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cerrarModalEliminacion}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarEliminacion}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Confirmar Eliminación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReservasDashboard;