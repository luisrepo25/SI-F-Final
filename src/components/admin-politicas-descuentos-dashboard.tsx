import React from "react";
import { Settings, Edit, Trash2, Eye, Plus, Tag, Percent, Calendar, CheckCircle, X, AlertCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { 
  listarServiciosDescuentos, 
  crearServicioDescuento, 
  editarServicioDescuento, 
  eliminarServicioDescuento,
  listarServicios,
  listarDescuentos,
  crearDescuento
} from "@/api/servicios-descuentos";
import { useToast } from "@/hooks/use-toast";
import useAuth from "@/hooks/useAuth";

// ============================================
// INTERFACES Y TIPOS
// ============================================

interface ServicioDescuento {
  id: string;
  servicio: number;
  descuento: number;
  prioridad: number;
  exclusivo: boolean;
  estado: boolean;
  // Políticas de uso del cupón
  un_cupon_por_transaccion?: boolean;
  combinable_con_otras_ofertas?: boolean;
  requiere_gasto_minimo?: boolean;
  gasto_minimo?: number;
  uso_unico_por_cliente?: boolean;
  canjeable_por_efectivo?: boolean;
  // Datos expandidos para visualización
  servicioNombre?: string;
  descuentoCodigo?: string;
  descuentoTipo?: string;
  descuentoValor?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

interface Servicio {
  id: number;
  nombre: string;
  descripcion?: string;
  precio?: number;
  estado?: boolean;
}

interface Descuento {
  id: number;
  codigo: string;
  tipo: string; // FIJO, PORCENTAJE
  valor: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: boolean;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const AdminPoliticasDescuentosDashboard = () => {
  // ============================================
  // ESTADOS PRINCIPALES
  // ============================================
  const [politicas, setPoliticas] = useState<ServicioDescuento[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [descuentos, setDescuentos] = useState<Descuento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  // Estados de filtros y búsqueda
  const [filterEstado, setFilterEstado] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados de navegación
  const [activeTab, setActiveTab] = useState("panel");
  
  // Estados de modales
  const [selectedPolitica, setSelectedPolitica] = useState<ServicioDescuento | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPolitica, setEditingPolitica] = useState<ServicioDescuento | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPolitica, setDeletingPolitica] = useState<ServicioDescuento | null>(null);

  // Estados para formulario de nueva política
  const [nuevaPolitica, setNuevaPolitica] = useState({
    servicio: '',
    descuento: '',
    prioridad: 1,
    exclusivo: false,
    estado: true,
    // Políticas de uso
    un_cupon_por_transaccion: true,
    combinable_con_otras_ofertas: false,
    requiere_gasto_minimo: false,
    gasto_minimo: 0,
    uso_unico_por_cliente: false,
    canjeable_por_efectivo: false
  });

  // Estados para formulario de nuevo cupón
  const [nuevoCupon, setNuevoCupon] = useState({
    codigo: '',
    tipo: 'PORCENTAJE',
    valor: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: false
  });

  const [creandoCupon, setCreandoCupon] = useState(false);

  // ============================================
  // FUNCIONES UTILITARIAS
  // ============================================

  // Función para recargar políticas (reutilizable)
  const recargarPoliticas = async () => {
    try {
      setLoading(true);
      const res = await listarServiciosDescuentos();
      console.log("🔄 Recargando políticas...", res.data);
      
      // Mapear datos del backend al formato del frontend
      const politicasMapeadas = res.data.map((item: any) => mapearPolitica(item));
      setPoliticas(politicasMapeadas);
      
    } catch (error: any) {
      console.error("❌ Error al cargar políticas:", error);
      setError("Error al cargar las políticas");
      toast({
        title: "Error",
        description: "No se pudieron cargar las políticas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar servicios disponibles
  const cargarServicios = async () => {
    try {
      console.log("🔄 Iniciando carga de servicios...");
      const res = await listarServicios();
      console.log("📋 Respuesta completa de servicios:", res);
      console.log("📋 Datos de servicios:", res.data);
      console.log("📋 Cantidad de servicios:", res.data?.length);
      
      if (res.data && Array.isArray(res.data)) {
        setServicios(res.data);
        console.log("✅ Servicios configurados en estado:", res.data);
      } else {
        console.warn("⚠️ La respuesta de servicios no es un array:", res.data);
        setServicios([]);
      }
    } catch (error: any) {
      console.error("❌ Error completo al cargar servicios:", error);
      console.error("❌ Error respuesta:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      toast({
        title: "Error",
        description: `No se pudieron cargar los servicios: ${error.message}`,
        variant: "destructive",
      });
      setServicios([]);
    }
  };

  // Función para cargar descuentos disponibles
  const cargarDescuentos = async () => {
    try {
      console.log("🔄 Iniciando carga de descuentos...");
      const res = await listarDescuentos();
      console.log("🎫 Respuesta completa de descuentos:", res);
      console.log("🎫 Datos de descuentos:", res.data);
      console.log("🎫 Cantidad de descuentos:", res.data?.length);
      
      if (res.data && Array.isArray(res.data)) {
        setDescuentos(res.data);
        console.log("✅ Descuentos configurados en estado:", res.data);
      } else {
        console.warn("⚠️ La respuesta de descuentos no es un array:", res.data);
        setDescuentos([]);
      }
    } catch (error: any) {
      console.error("❌ Error completo al cargar descuentos:", error);
      console.error("❌ Error respuesta:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      toast({
        title: "Error",
        description: `No se pudieron cargar los descuentos: ${error.message}`,
        variant: "destructive",
      });
      setDescuentos([]);
    }
  };

  // Función para mapear datos del backend
  const mapearPolitica = (item: any): ServicioDescuento => {
    // Buscar información expandida del servicio y descuento
    const servicio = servicios.find(s => s.id === item.servicio);
    const descuento = descuentos.find(d => d.id === item.descuento);

    return {
      id: item.id?.toString() || '',
      servicio: item.servicio,
      descuento: item.descuento,
      prioridad: item.prioridad || 1,
      exclusivo: item.exclusivo || false,
      estado: item.estado !== undefined ? item.estado : true,
      // Políticas de uso
      un_cupon_por_transaccion: item.un_cupon_por_transaccion !== undefined ? item.un_cupon_por_transaccion : true,
      combinable_con_otras_ofertas: item.combinable_con_otras_ofertas || false,
      requiere_gasto_minimo: item.requiere_gasto_minimo || false,
      gasto_minimo: item.gasto_minimo || 0,
      uso_unico_por_cliente: item.uso_unico_por_cliente || false,
      canjeable_por_efectivo: item.canjeable_por_efectivo || false,
      // Datos expandidos
      servicioNombre: servicio?.nombre || `Servicio #${item.servicio}`,
      descuentoCodigo: descuento?.codigo || `Descuento #${item.descuento}`,
      descuentoTipo: descuento?.tipo || 'N/A',
      descuentoValor: descuento?.valor || '0',
      fechaInicio: descuento?.fecha_inicio ? new Date(descuento.fecha_inicio).toLocaleDateString() : '',
      fechaFin: descuento?.fecha_fin ? new Date(descuento.fecha_fin).toLocaleDateString() : '',
    };
  };

  // ============================================
  // OPERACIONES CRUD
  // ============================================

  // CREATE - Crear nueva política
  const handleCrearPolitica = async () => {
    try {
      setLoading(true);
      
      // Validaciones
      if (!nuevaPolitica.servicio || !nuevaPolitica.descuento) {
        toast({
          title: "Error",
          description: "Debe seleccionar un servicio y un descuento",
          variant: "destructive",
        });
        return;
      }

      // Preparar datos para el backend
      const datosParaBackend = {
        servicio: parseInt(nuevaPolitica.servicio),
        descuento: parseInt(nuevaPolitica.descuento),
        prioridad: nuevaPolitica.prioridad,
        exclusivo: nuevaPolitica.exclusivo,
        estado: nuevaPolitica.estado,
        // Políticas de uso
        un_cupon_por_transaccion: nuevaPolitica.un_cupon_por_transaccion,
        combinable_con_otras_ofertas: nuevaPolitica.combinable_con_otras_ofertas,
        requiere_gasto_minimo: nuevaPolitica.requiere_gasto_minimo,
        gasto_minimo: nuevaPolitica.requiere_gasto_minimo ? nuevaPolitica.gasto_minimo : null,
        uso_unico_por_cliente: nuevaPolitica.uso_unico_por_cliente,
        canjeable_por_efectivo: nuevaPolitica.canjeable_por_efectivo
      };

      console.log("📝 Creando política:", datosParaBackend);
      
      const response = await crearServicioDescuento(datosParaBackend);
      console.log("✅ Política creada:", response.data);
      
      await recargarPoliticas(); // Recargar lista
      setShowModal(false);
      
      // Resetear formulario
      setNuevaPolitica({
        servicio: '',
        descuento: '',
        prioridad: 1,
        exclusivo: false,
        estado: true,
        // Políticas de uso
        un_cupon_por_transaccion: true,
        combinable_con_otras_ofertas: false,
        requiere_gasto_minimo: false,
        gasto_minimo: 0,
        uso_unico_por_cliente: false,
        canjeable_por_efectivo: false
      });
      
      toast({
        title: "Éxito",
        description: "Política creada correctamente",
      });
      
    } catch (error: any) {
      console.error("❌ Error al crear política:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al crear la política",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // UPDATE - Editar política existente
  const guardarCambios = async () => {
    if (!editingPolitica) return;

    try {
      setLoading(true);
      
      // Preparar datos para el backend
      const datosParaBackend = {
        servicio: editingPolitica.servicio,
        descuento: editingPolitica.descuento,
        prioridad: editingPolitica.prioridad,
        exclusivo: editingPolitica.exclusivo,
        estado: editingPolitica.estado,
        // Políticas de uso
        un_cupon_por_transaccion: editingPolitica.un_cupon_por_transaccion,
        combinable_con_otras_ofertas: editingPolitica.combinable_con_otras_ofertas,
        requiere_gasto_minimo: editingPolitica.requiere_gasto_minimo,
        gasto_minimo: editingPolitica.requiere_gasto_minimo ? editingPolitica.gasto_minimo : null,
        uso_unico_por_cliente: editingPolitica.uso_unico_por_cliente,
        canjeable_por_efectivo: editingPolitica.canjeable_por_efectivo
      };

      console.log("📝 Editando política:", editingPolitica.id, datosParaBackend);
      
      const response = await editarServicioDescuento(editingPolitica.id, datosParaBackend);
      console.log("✅ Política editada:", response.data);
      
      await recargarPoliticas(); // Recargar lista
      setShowEditModal(false);
      setEditingPolitica(null);
      
      toast({
        title: "Éxito",
        description: "Política actualizada correctamente",
      });
      
    } catch (error: any) {
      console.error("❌ Error al editar política:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al actualizar la política",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // DELETE - Eliminar política
  const confirmarEliminacion = async () => {
    if (!deletingPolitica) return;

    try {
      setLoading(true);
      
      console.log("🗑️ Eliminando política:", deletingPolitica.id);
      
      await eliminarServicioDescuento(deletingPolitica.id);
      console.log("✅ Política eliminada");
      
      await recargarPoliticas(); // Recargar lista
      setShowDeleteModal(false);
      setDeletingPolitica(null);
      
      toast({
        title: "Éxito",
        description: "Política eliminada correctamente",
      });
      
    } catch (error: any) {
      console.error("❌ Error al eliminar política:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al eliminar la política",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // CREATE CUPÓN - Crear nuevo cupón/descuento
  const handleCrearCupon = async () => {
    try {
      setCreandoCupon(true);
      
      // Validaciones
      if (!nuevoCupon.codigo || !nuevoCupon.valor || !nuevoCupon.fecha_inicio || !nuevoCupon.fecha_fin) {
        toast({
          title: "Error",
          description: "Todos los campos son obligatorios",
          variant: "destructive",
        });
        return;
      }

      // Validar que la fecha de inicio sea antes que la de fin
      if (new Date(nuevoCupon.fecha_inicio) >= new Date(nuevoCupon.fecha_fin)) {
        toast({
          title: "Error",
          description: "La fecha de inicio debe ser anterior a la fecha de fin",
          variant: "destructive",
        });
        return;
      }

      // Preparar datos para el backend
      const datosParaBackend = {
        codigo: nuevoCupon.codigo.trim().toUpperCase(),
        tipo: nuevoCupon.tipo,
        valor: nuevoCupon.valor,
        fecha_inicio: nuevoCupon.fecha_inicio,
        fecha_fin: nuevoCupon.fecha_fin,
        estado: nuevoCupon.estado
      };

      console.log("🎫 Creando cupón:", datosParaBackend);
      
      const response = await crearDescuento(datosParaBackend);
      console.log("✅ Cupón creado:", response.data);
      
      // Recargar datos
      await cargarDescuentos(); 
      
      // Resetear formulario
      setNuevoCupon({
        codigo: '',
        tipo: 'PORCENTAJE',
        valor: '',
        fecha_inicio: '',
        fecha_fin: '',
        estado: false
      });
      
      toast({
        title: "Éxito",
        description: "Cupón creado correctamente",
      });
      
    } catch (error: any) {
      console.error("❌ Error al crear cupón:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al crear el cupón",
        variant: "destructive",
      });
    } finally {
      setCreandoCupon(false);
    }
  };

  // ============================================
  // EFECTOS Y CARGA INICIAL
  // ============================================

  useEffect(() => {
    const cargarDatos = async () => {
      await Promise.all([
        cargarServicios(),
        cargarDescuentos()
      ]);
    };
    cargarDatos();
  }, []);

  // Cargar políticas después de que se carguen servicios y descuentos
  useEffect(() => {
    if (servicios.length > 0 && descuentos.length > 0) {
      recargarPoliticas();
    }
  }, [servicios, descuentos]);

  // ============================================
  // FUNCIONES DE FILTRADO
  // ============================================

  const politicasFiltradas = politicas.filter(item => {
    const matchesEstado = filterEstado === "todos" || 
                         (filterEstado === "activo" && item.estado) ||
                         (filterEstado === "inactivo" && !item.estado);
    const matchesSearch = item.servicioNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.descuentoCodigo?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesEstado && matchesSearch;
  });

  // ============================================
  // CÁLCULO DE ESTADÍSTICAS
  // ============================================

  const estadisticas = {
    total: politicas.length,
    activas: politicas.filter(item => item.estado).length,
    inactivas: politicas.filter(item => !item.estado).length,
    exclusivas: politicas.filter(item => item.exclusivo).length,
    // Nuevas estadísticas de políticas
    noCombinable: politicas.filter(item => !item.combinable_con_otras_ofertas).length,
    conGastoMinimo: politicas.filter(item => item.requiere_gasto_minimo).length,
    usoUnico: politicas.filter(item => item.uso_unico_por_cliente).length,
  };

  // ============================================
  // RENDER DEL COMPONENTE
  // ============================================

  if (loading && politicas.length === 0) {
    return (
      <div className="container mx-auto p-3 sm:p-4 md:p-6">
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando políticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6">
      {/* ============================================ */}
      {/* HEADER CON TÍTULO E ICONO */}
      {/* ============================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Settings className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              Políticas de Cupones y Descuentos
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Gestiona la asignación de descuentos a servicios específicos
            </p>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* NAVEGACIÓN POR TABS */}
      {/* ============================================ */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-1 mb-6">
        <button
          onClick={() => setActiveTab("panel")}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
            activeTab === "panel"
              ? "bg-purple-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          📊 Panel General
        </button>
        <button
          onClick={() => setActiveTab("gestion")}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
            activeTab === "gestion"
              ? "bg-purple-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          📋 Gestión de políticas
        </button>
        <button
          onClick={() => setActiveTab("crear")}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
            activeTab === "crear"
              ? "bg-purple-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          ➕ Crear Cupón
        </button>
        <button
          onClick={() => setActiveTab("info")}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
            activeTab === "info"
              ? "bg-purple-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          ℹ️ Información
        </button>
      </div>

      {/* ============================================ */}
      {/* PANEL DE ESTADÍSTICAS */}
      {/* ============================================ */}
      {activeTab === "panel" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Políticas</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{estadisticas.total}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Settings className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Activas */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Activas</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">{estadisticas.activas}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* No Combinables */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">No Combinables</p>
                  <p className="text-2xl sm:text-3xl font-bold text-orange-600">{estadisticas.noCombinable}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Uso Único */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Uso Único</p>
                  <p className="text-2xl sm:text-3xl font-bold text-red-600">{estadisticas.usoUnico}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <X className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Segunda fila de estadísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Con Gasto Mínimo */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Con Gasto Mínimo</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">{estadisticas.conGastoMinimo}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Servicios Disponibles */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Servicios Disponibles</p>
                  <p className="text-2xl sm:text-3xl font-bold text-indigo-600">{servicios.length}</p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-full">
                  <Tag className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>
            
            {/* Descuentos Disponibles */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Descuentos Disponibles</p>
                  <p className="text-2xl sm:text-3xl font-bold text-cyan-600">{descuentos.length}</p>
                </div>
                <div className="bg-cyan-100 p-3 rounded-full">
                  <Percent className="h-6 w-6 text-cyan-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* TABLA DE GESTIÓN */}
      {/* ============================================ */}
      {activeTab === "gestion" && (
        <div className="space-y-4 sm:space-y-6">
          {/* Controles de filtros y búsqueda */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar por servicio o código de descuento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base min-w-0"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <select
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activas</option>
                  <option value="inactivo">Inactivas</option>
                </select>
                <button
                  onClick={() => {
                    setSelectedPolitica(null); // Asegurar que esté en modo creación
                    setShowModal(true);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm sm:text-base whitespace-nowrap"
                >
                  + Nueva Política
                </button>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Servicio
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descuento
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prioridad
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Políticas de Uso
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {politicasFiltradas.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.servicioNombre}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.descuentoCodigo}</div>
                        <div className="text-xs text-gray-500">
                          {item.descuentoTipo} - {item.descuentoValor}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.prioridad}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="space-y-1">
                          {/* Un cupón por transacción */}
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item.un_cupon_por_transaccion ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {item.un_cupon_por_transaccion ? '1 cupón/transacción' : 'Múltiples cupones'}
                            </span>
                          </div>
                          
                          {/* Combinable con otras ofertas */}
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item.combinable_con_otras_ofertas ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.combinable_con_otras_ofertas ? 'Combinable' : 'No combinable'}
                            </span>
                          </div>
                          
                          {/* Gasto mínimo */}
                          {item.requiere_gasto_minimo && (
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Gasto mín: ${item.gasto_minimo}
                              </span>
                            </div>
                          )}
                          
                          {/* Uso único por cliente */}
                          {item.uso_unico_por_cliente && (
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                Uso único
                              </span>
                            </div>
                          )}
                          
                          {/* Exclusivo */}
                          {item.exclusivo && (
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                                Exclusivo
                              </span>
                            </div>
                          )}
                          
                          {/* No canjeable por efectivo */}
                          {!item.canjeable_por_efectivo && (
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                No canjeable
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.estado ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedPolitica(item);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingPolitica(item);
                              setShowEditModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingPolitica(item);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {politicasFiltradas.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-500">No se encontraron políticas</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* TAB DE CREAR CUPÓN */}
      {/* ============================================ */}
      {activeTab === "crear" && (
        <div className="space-y-6">
          {/* Formulario de creación de cupón */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6">
              <h2 className="text-xl font-bold">➕ Crear Nuevo Cupón</h2>
              <p className="text-purple-100 mt-2">Complete la información del cupón de descuento</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Código del cupón */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código del Cupón *
                  </label>
                  <input
                    type="text"
                    value={nuevoCupon.codigo}
                    onChange={(e) => setNuevoCupon({...nuevoCupon, codigo: e.target.value})}
                    placeholder="Ej: DESCUENTO20"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Será convertido a mayúsculas automáticamente</p>
                </div>

                {/* Tipo de descuento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Descuento *
                  </label>
                  <select
                    value={nuevoCupon.tipo}
                    onChange={(e) => setNuevoCupon({...nuevoCupon, tipo: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="PORCENTAJE">Porcentaje (%)</option>
                    <option value="FIJO">Monto Fijo (Bs.)</option>
                  </select>
                </div>

                {/* Valor del descuento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor del Descuento *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={nuevoCupon.valor}
                      onChange={(e) => setNuevoCupon({...nuevoCupon, valor: e.target.value})}
                      placeholder={nuevoCupon.tipo === 'PORCENTAJE' ? '20' : '100'}
                      min="0"
                      max={nuevoCupon.tipo === 'PORCENTAJE' ? '100' : undefined}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">
                      {nuevoCupon.tipo === 'PORCENTAJE' ? '%' : 'Bs.'}
                    </span>
                  </div>
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado Inicial
                  </label>
                  <select
                    value={nuevoCupon.estado.toString()}
                    onChange={(e) => setNuevoCupon({...nuevoCupon, estado: e.target.value === 'true'})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="false">Inactivo</option>
                    <option value="true">Activo</option>
                  </select>
                </div>

                {/* Fecha de inicio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    value={nuevoCupon.fecha_inicio}
                    onChange={(e) => setNuevoCupon({...nuevoCupon, fecha_inicio: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Fecha de fin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Fin *
                  </label>
                  <input
                    type="date"
                    value={nuevoCupon.fecha_fin}
                    onChange={(e) => setNuevoCupon({...nuevoCupon, fecha_fin: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Vista previa del cupón */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Vista Previa del Cupón:</h3>
                <div className="bg-white p-4 border-2 border-dashed border-purple-300 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">
                      {nuevoCupon.codigo || 'CÓDIGO_CUPÓN'}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mt-2">
                      {nuevoCupon.tipo === 'PORCENTAJE' ? `${nuevoCupon.valor || '0'}%` : `${nuevoCupon.valor || '0'} Bs.`} OFF
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Válido del {nuevoCupon.fecha_inicio || 'DD/MM/YYYY'} al {nuevoCupon.fecha_fin || 'DD/MM/YYYY'}
                    </div>
                    <div className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${
                      nuevoCupon.estado ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {nuevoCupon.estado ? 'Activo' : 'Inactivo'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setNuevoCupon({
                      codigo: '',
                      tipo: 'PORCENTAJE',
                      valor: '',
                      fecha_inicio: '',
                      fecha_fin: '',
                      estado: false
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Limpiar
                </button>
                <button
                  type="button"
                  onClick={handleCrearCupon}
                  disabled={creandoCupon || !nuevoCupon.codigo || !nuevoCupon.valor || !nuevoCupon.fecha_inicio || !nuevoCupon.fecha_fin}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {creandoCupon ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Crear Cupón
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Consejos para Crear Cupones</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h4 className="font-medium mb-2">📝 Código del Cupón:</h4>
                <ul className="space-y-1 ml-4 list-disc">
                  <li>Use códigos descriptivos y fáciles de recordar</li>
                  <li>Evite caracteres especiales</li>
                  <li>Ejemplo: VERANO2024, DESCUENTO20</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">💰 Tipo de Descuento:</h4>
                <ul className="space-y-1 ml-4 list-disc">
                  <li><strong>Porcentaje:</strong> 20% de descuento</li>
                  <li><strong>Fijo:</strong> 50 Bs. de descuento</li>
                  <li>Los porcentajes no pueden exceder 100%</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">📅 Fechas:</h4>
                <ul className="space-y-1 ml-4 list-disc">
                  <li>La fecha de inicio debe ser anterior a la de fin</li>
                  <li>Los cupones vencidos se desactivan automáticamente</li>
                  <li>Planifique las fechas según sus campañas</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">⚙️ Estado:</h4>
                <ul className="space-y-1 ml-4 list-disc">
                  <li><strong>Activo:</strong> Listo para usar</li>
                  <li><strong>Inactivo:</strong> No se puede aplicar</li>
                  <li>Puede cambiar el estado después de crear</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* TAB DE INFORMACIÓN */}
      {/* ============================================ */}
      {activeTab === "info" && (
        <div className="space-y-6">
          {/* Panel informativo sobre políticas */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">📋 ¿Qué son las Políticas de Cupones?</h3>
            <p className="text-blue-800 mb-4">
              Las políticas de cupones y descuentos definen las reglas de negocio sobre cómo se pueden usar las promociones en el sistema.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
              <div>
                <h4 className="font-medium mb-3 text-blue-900">🚫 Restricciones de Uso:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="font-medium mr-2">• Un cupón por transacción:</span>
                    <span>Solo se permite aplicar un descuento por compra para evitar abuso del sistema</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">• No combinable:</span>
                    <span>No se puede usar con otras ofertas promocionales activas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">• Uso único:</span>
                    <span>Cada cliente solo puede usar el descuento una vez en toda su historia</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3 text-blue-900">⭐ Condiciones Especiales:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="font-medium mr-2">• Gasto mínimo:</span>
                    <span>Se requiere un monto mínimo de compra para activar el descuento</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">• Exclusivo:</span>
                    <span>El descuento solo aplica para un servicio específico, no para otros</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">• No canjeable:</span>
                    <span>No se puede cambiar por dinero en efectivo, solo por servicios</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Ejemplo práctico */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4">💡 Ejemplo Práctico</h3>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">Política: "Descuento 20% en Tours a Uyuni</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-green-800"><strong>✅ Condiciones:</strong></p>
                  <ul className="list-disc list-inside text-green-700 mt-1 space-y-1">
                    <li>Solo un cupón por transacción</li>
                    <li>Gasto mínimo: $100</li>
                    <li>Uso único por cliente</li>
                    <li>Exclusivo para Tours a Uyuni</li>
                  </ul>
                </div>
                <div>
                  <p className="text-green-800"><strong>❌ Restricciones:</strong></p>
                  <ul className="list-disc list-inside text-green-700 mt-1 space-y-1">
                    <li>No combinable con otras ofertas</li>
                    <li>No canjeable por efectivo</li>
                    <li>Válido solo dentro de la vigencia</li>
                    <li>No transferible a otros servicios</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Flujo de aplicación */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-4">🔄 Flujo de Aplicación de Políticas</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-purple-600 font-bold text-lg mb-2">1️⃣</div>
                <h4 className="font-medium text-purple-900 mb-1">Cliente selecciona</h4>
                <p className="text-sm text-purple-700">El cliente elige un servicio y aplica un cupón</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-purple-600 font-bold text-lg mb-2">2️⃣</div>
                <h4 className="font-medium text-purple-900 mb-1">Sistema valida</h4>
                <p className="text-sm text-purple-700">Se verifican todas las políticas configuradas</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-purple-600 font-bold text-lg mb-2">3️⃣</div>
                <h4 className="font-medium text-purple-900 mb-1">Aplica restricciones</h4>
                <p className="text-sm text-purple-700">Se evalúan gasto mínimo, exclusividad, etc.</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-purple-600 font-bold text-lg mb-2">4️⃣</div>
                <h4 className="font-medium text-purple-900 mb-1">Confirma descuento</h4>
                <p className="text-sm text-purple-700">Si todo es válido, se aplica el descuento</p>
              </div>
            </div>
          </div>

          {/* Mejores prácticas */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-orange-900 mb-4">🎯 Mejores Prácticas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-orange-900 mb-2">Para Administradores:</h4>
                <ul className="space-y-1 text-orange-800">
                  <li>• Configurar siempre un gasto mínimo razonable</li>
                  <li>• Usar prioridades para controlar qué descuento se aplica primero</li>
                  <li>• Limitar la combinación de ofertas para proteger márgenes</li>
                  <li>• Revisar regularmente el uso de los cupones</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-orange-900 mb-2">Para el Negocio:</h4>
                <ul className="space-y-1 text-orange-800">
                  <li>• Los descuentos exclusivos aumentan la percepción de valor</li>
                  <li>• El uso único por cliente fomenta la adquisición rápida</li>
                  <li>• Las políticas claras reducen disputas con clientes</li>
                  <li>• La vigencia limitada crea urgencia de compra</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* MODALES */}
      {/* ============================================ */}

      {/* Modal de Creación/Vista */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {selectedPolitica ? 'Detalles de Política' : 'Nueva Política'}
              </h3>
              
              {selectedPolitica ? (
                /* Vista de detalles */
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Servicio
                    </label>
                    <p className="text-gray-900">{selectedPolitica.servicioNombre}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descuento
                    </label>
                    <p className="text-gray-900">{selectedPolitica.descuentoCodigo}</p>
                    <p className="text-sm text-gray-500">
                      {selectedPolitica.descuentoTipo} - {selectedPolitica.descuentoValor}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prioridad
                      </label>
                      <p className="text-gray-900">{selectedPolitica.prioridad}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo
                      </label>
                      <p className="text-gray-900">
                        {selectedPolitica.exclusivo ? 'Exclusivo' : 'Compartido'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <p className={selectedPolitica.estado ? 'text-green-600' : 'text-red-600'}>
                      {selectedPolitica.estado ? 'Activa' : 'Inactiva'}
                    </p>
                  </div>
                </div>
              ) : (
                /* Formulario de creación */
                <div className="space-y-4">
                  {/* Debug info temporal */}
                  <div className="text-xs text-gray-500 mb-4 p-2 bg-gray-100 rounded">
                    <div>Servicios totales: {servicios.length}</div>
                    <div>Servicios IDs: {servicios.map(s => s.id).join(', ')}</div>
                    <div>Descuentos totales: {descuentos.length}</div>
                    <div>Descuentos IDs: {descuentos.map(d => d.id).join(', ')}</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Servicio *
                    </label>
                    <select
                      value={nuevaPolitica.servicio?.toString() || ""}
                      onChange={(e) => setNuevaPolitica({...nuevaPolitica, servicio: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Seleccione un servicio</option>
                      {servicios.map(servicio => (
                        <option key={servicio.id} value={servicio.id}>
                          {servicio.nombre} (ID: {servicio.id})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descuento *
                    </label>
                    <select
                      value={nuevaPolitica.descuento?.toString() || ""}
                      onChange={(e) => setNuevaPolitica({...nuevaPolitica, descuento: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Seleccione un descuento</option>
                      {descuentos.filter(d => d.estado).map(descuento => (
                        <option key={descuento.id} value={descuento.id}>
                          {descuento.codigo} - {descuento.tipo} ({descuento.valor}) (ID: {descuento.id})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prioridad
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={nuevaPolitica.prioridad}
                        onChange={(e) => setNuevaPolitica({...nuevaPolitica, prioridad: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado
                      </label>
                      <select 
                        value={nuevaPolitica.estado ? 'true' : 'false'}
                        onChange={(e) => setNuevaPolitica({...nuevaPolitica, estado: e.target.value === 'true'})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="true">Activa</option>
                        <option value="false">Inactiva</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Políticas de Uso */}
                  <div className="border-t pt-4">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Políticas de Uso del Cupón</h4>
                    
                    <div className="space-y-3">
                      {/* Un cupón por transacción */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="un-cupon"
                          checked={nuevaPolitica.un_cupon_por_transaccion}
                          onChange={(e) => setNuevaPolitica({...nuevaPolitica, un_cupon_por_transaccion: e.target.checked})}
                          className="mr-2"
                        />
                        <label htmlFor="un-cupon" className="text-sm text-gray-700">
                          Solo un cupón por transacción
                        </label>
                      </div>
                      
                      {/* Combinable con otras ofertas */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="combinable"
                          checked={nuevaPolitica.combinable_con_otras_ofertas}
                          onChange={(e) => setNuevaPolitica({...nuevaPolitica, combinable_con_otras_ofertas: e.target.checked})}
                          className="mr-2"
                        />
                        <label htmlFor="combinable" className="text-sm text-gray-700">
                          Combinable con otras ofertas
                        </label>
                      </div>
                      
                      {/* Requiere gasto mínimo */}
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="gasto-minimo"
                            checked={nuevaPolitica.requiere_gasto_minimo}
                            onChange={(e) => setNuevaPolitica({...nuevaPolitica, requiere_gasto_minimo: e.target.checked})}
                            className="mr-2"
                          />
                          <label htmlFor="gasto-minimo" className="text-sm text-gray-700">
                            Requiere gasto mínimo
                          </label>
                        </div>
                        
                        {nuevaPolitica.requiere_gasto_minimo && (
                          <div className="ml-6">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Monto mínimo"
                              value={nuevaPolitica.gasto_minimo}
                              onChange={(e) => setNuevaPolitica({...nuevaPolitica, gasto_minimo: parseFloat(e.target.value) || 0})}
                              className="w-32 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Uso único por cliente */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="uso-unico"
                          checked={nuevaPolitica.uso_unico_por_cliente}
                          onChange={(e) => setNuevaPolitica({...nuevaPolitica, uso_unico_por_cliente: e.target.checked})}
                          className="mr-2"
                        />
                        <label htmlFor="uso-unico" className="text-sm text-gray-700">
                          Una sola aplicación por cliente
                        </label>
                      </div>
                      
                      {/* Canjeable por efectivo */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="canjeable"
                          checked={nuevaPolitica.canjeable_por_efectivo}
                          onChange={(e) => setNuevaPolitica({...nuevaPolitica, canjeable_por_efectivo: e.target.checked})}
                          className="mr-2"
                        />
                        <label htmlFor="canjeable" className="text-sm text-gray-700">
                          Canjeable por efectivo
                        </label>
                      </div>
                      
                      {/* Exclusivo */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="exclusivo"
                          checked={nuevaPolitica.exclusivo}
                          onChange={(e) => setNuevaPolitica({...nuevaPolitica, exclusivo: e.target.checked})}
                          className="mr-2"
                        />
                        <label htmlFor="exclusivo" className="text-sm text-gray-700">
                          Descuento exclusivo para este servicio
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedPolitica(null);
                    setNuevaPolitica({
                      servicio: '',
                      descuento: '',
                      prioridad: 1,
                      exclusivo: false,
                      estado: true,
                      // Políticas de uso
                      un_cupon_por_transaccion: true,
                      combinable_con_otras_ofertas: false,
                      requiere_gasto_minimo: false,
                      gasto_minimo: 0,
                      uso_unico_por_cliente: false,
                      canjeable_por_efectivo: false
                    });
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  {selectedPolitica ? 'Cerrar' : 'Cancelar'}
                </button>
                {!selectedPolitica && (
                  <button
                    onClick={handleCrearPolitica}
                    disabled={!nuevaPolitica.servicio || !nuevaPolitica.descuento}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Crear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición */}
      {showEditModal && editingPolitica && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Editar Política</h3>
              
              {/* Debug info temporal */}
              <div className="text-xs text-gray-500 mb-4 p-2 bg-gray-100 rounded">
                <div>Política ID servicio: {editingPolitica.servicio}</div>
                <div>Servicios totales: {servicios.length}</div>
                <div>Servicios IDs: {servicios.map(s => s.id).join(', ')}</div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Servicio
                  </label>
                  <select
                    value={editingPolitica.servicio?.toString() || ""}
                    onChange={(e) => setEditingPolitica({...editingPolitica, servicio: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Seleccione un servicio</option>
                    {servicios.map(servicio => (
                      <option key={servicio.id} value={servicio.id}>
                        {servicio.nombre} (ID: {servicio.id})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descuento
                  </label>
                  <select
                    value={editingPolitica.descuento?.toString() || ""}
                    onChange={(e) => setEditingPolitica({...editingPolitica, descuento: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Seleccione un descuento</option>
                    {descuentos.map(descuento => (
                      <option key={descuento.id} value={descuento.id}>
                        {descuento.codigo} - {descuento.tipo} ({descuento.valor}) (ID: {descuento.id})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prioridad
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={editingPolitica.prioridad}
                      onChange={(e) => setEditingPolitica({...editingPolitica, prioridad: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select 
                      value={editingPolitica.estado ? 'true' : 'false'}
                      onChange={(e) => setEditingPolitica({...editingPolitica, estado: e.target.value === 'true'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="true">Activa</option>
                      <option value="false">Inactiva</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="exclusivo-edit"
                    checked={editingPolitica.exclusivo}
                    onChange={(e) => setEditingPolitica({...editingPolitica, exclusivo: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="exclusivo-edit" className="text-sm text-gray-700">
                    Descuento exclusivo para este servicio
                  </label>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPolitica(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarCambios}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Eliminación */}
      {showDeleteModal && deletingPolitica && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Confirmar Eliminación</h3>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que deseas eliminar la política que asigna el descuento 
                "{deletingPolitica.descuentoCodigo}" al servicio "{deletingPolitica.servicioNombre}"? 
                Esta acción no se puede deshacer.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingPolitica(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarEliminacion}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPoliticasDescuentosDashboard;