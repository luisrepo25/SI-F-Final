
"use client";

import BotonStripeCheckout from "./BotonStripeCheckout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, CheckCircle, Phone, Mail, User, Users, Plane, X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import useAuth from "@/hooks/useAuth";
import { crearReserva } from "@/api/reservas";
import { crearVisitante, asociarVisitanteReserva, convertirFormularioAVisitante } from "@/api/visitantes";

interface Acompanante {
  id: string;
  nombre: string;
  apellido: string;
  documento: string;
  fecha_nacimiento: string;
  telefono: string;
  email: string;
  nacionalidad: string;
}

interface FormularioReserva {
  titular: {
    nombre: string;
    apellido: string;
    documento: string;
    email: string;
    telefono: string;
    fecha_nacimiento: string;
    nacionalidad: string;
  };
  acompanantes: Acompanante[];
  detalles: {
    fecha_inicio: string;
    codigo_cupon: string;
    notas_adicionales: string;
  };
  servicio: {
    id: number;
    nombre: string;
    precio: number;
  };
  terminos_aceptados: boolean;
  politica_privacidad_aceptada: boolean;
}

interface Props {
  servicioSeleccionado: { id: number; nombre: string; precio: number };
  onReservaCompleta?: (numeroReserva: string) => void;
  numeroPersonas?: number; // 🔹 se recibe desde /reserva
}

export default function FlujoReservaModerno({
  servicioSeleccionado,
  onReservaCompleta,
  numeroPersonas = 1, // valor por defecto
}: Props) {
  const { toast } = useToast();
  const { user } = useAuth();

  const [ultimaReservaId, setUltimaReservaId] = useState<number | null>(null);
  const [procesandoReserva, setProcesandoReserva] = useState(false);
  const [pasoActual, setPasoActual] = useState<"titular" | "acompanantes" | "detalles" | "confirmacion" | "pago">("titular");

  const [formulario, setFormulario] = useState<FormularioReserva>({
    titular: {
      nombre: "",
      apellido: "",
      documento: "",
      email: "",
      telefono: "",
      fecha_nacimiento: "",
      nacionalidad: "Boliviana",
    },
    acompanantes: [],
    detalles: {
      fecha_inicio: "",
      codigo_cupon: "",
      notas_adicionales: "",
    },
    servicio: servicioSeleccionado,
    terminos_aceptados: false,
    politica_privacidad_aceptada: false,
  });

  // 🔹 NUEVO: precargar acompañantes según número de personas
  useEffect(() => {
    if (numeroPersonas > 1) {
      const cantidadAcompanantes = numeroPersonas - 1;
      const acompanantesIniciales: Acompanante[] = Array.from({ length: cantidadAcompanantes }).map((_, i) => ({
        id: `acomp-${i + 1}`,
        nombre: "",
        apellido: "",
        documento: "",
        fecha_nacimiento: "",
        telefono: "",
        email: "",
        nacionalidad: "Boliviana",
      }));
      setFormulario((prev) => ({
        ...prev,
        acompanantes: acompanantesIniciales,
      }));
      console.log(`👥 Se precargaron ${cantidadAcompanantes} acompañantes automáticamente`);
    }
  }, [numeroPersonas]);

  // 🔹 Autocompletar titular con sesión
  useEffect(() => {
    if (user) {
      const nombre = user.nombres || user.name || "";
      const apellido = user.apellidos || "";
      setFormulario((prev) => ({
        ...prev,
        titular: {
          ...prev.titular,
          nombre,
          apellido,
          email: user.email || "",
          telefono: user.telefono || "",
          documento: user.documento_identidad || "",
          fecha_nacimiento: user.fecha_nacimiento || "",
          nacionalidad: user.pais || "Boliviana",
        },
      }));
    }
  }, [user]);

  // ✅ Crear acompañantes automáticos según el número de personas del formulario de búsqueda
useEffect(() => {
  if (numeroPersonas > 1) {
    // Evitar duplicados si ya hay acompañantes cargados
    setFormulario((prev) => {
      if (prev.acompanantes.length === numeroPersonas - 1) return prev;

      const nuevosAcompanantes = Array.from(
        { length: numeroPersonas - 1 },
        (_, i) => ({
          id: `acomp-auto-${i + 1}`,
          nombre: "",
          apellido: "",
          documento: "",
          fecha_nacimiento: "",
          telefono: "",
          email: "",
          nacionalidad: "Boliviana",
        })
      );

      return { ...prev, acompanantes: nuevosAcompanantes };
    });
  }
}, [numeroPersonas]);


  // ⚙️ Funciones auxiliares de acompañantes
  const agregarAcompanante = () => {
    const nuevoAcompanante: Acompanante = {
      id: `acomp-${Date.now()}`,
      nombre: "",
      apellido: "",
      documento: "",
      fecha_nacimiento: "",
      telefono: "",
      email: "",
      nacionalidad: "Boliviana",
    };
    setFormulario((prev) => ({
      ...prev,
      acompanantes: [...prev.acompanantes, nuevoAcompanante],
    }));
  };

  const eliminarAcompanante = (id: string) => {
    setFormulario((prev) => ({
      ...prev,
      acompanantes: prev.acompanantes.filter((a) => a.id !== id),
    }));
  };

  const actualizarAcompanante = (id: string, campo: keyof Acompanante, valor: string) => {
    setFormulario((prev) => ({
      ...prev,
      acompanantes: prev.acompanantes.map((a) =>
        a.id === id ? { ...a, [campo]: valor } : a
      ),
    }));
  };

  const actualizarTitular = (campo: keyof FormularioReserva["titular"], valor: string) => {
    setFormulario((prev) => ({
      ...prev,
      titular: { ...prev.titular, [campo]: valor },
    }));
  };

  const actualizarDetalles = (campo: keyof FormularioReserva["detalles"], valor: string) => {
    setFormulario((prev) => ({
      ...prev,
      detalles: { ...prev.detalles, [campo]: valor },
    }));
  };

 

  // Validaciones por paso
  const validarTitular = (): string[] => {
    const errores: string[] = [];
    const { titular } = formulario;

    console.log("🔍 Validando titular con datos:", titular);

    if (!titular.nombre.trim())
      errores.push("El nombre del titular es obligatorio");
    if (!titular.apellido.trim())
      errores.push("El apellido del titular es obligatorio");

    // Validación de documento con mensaje más específico
    if (!titular.documento.trim()) {
      errores.push("Por favor, ingrese su número de CI/documento de identidad");
    } else if (titular.documento.length < 5) {
      errores.push("El número de documento debe tener al menos 5 caracteres");
    }

    // Validación de email
    if (!titular.email.trim()) {
      errores.push("El email es obligatorio");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(titular.email)) {
        errores.push("El formato del email no es válido");
      }
    }

    // Validación de teléfono
    if (!titular.telefono.trim()) {
      errores.push("El teléfono es obligatorio");
    } else if (titular.telefono.length < 7) {
      errores.push("El teléfono debe tener al menos 7 dígitos");
    }

    // Validación de fecha de nacimiento
    if (!titular.fecha_nacimiento) {
      errores.push("La fecha de nacimiento es obligatoria");
    } else {
      const fechaNacimiento = new Date(titular.fecha_nacimiento);
      const hoy = new Date();
      const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();

      if (edad < 18) {
        errores.push("El titular debe ser mayor de 18 años");
      }
      if (edad > 120) {
        errores.push("La fecha de nacimiento no es válida");
      }
    }

    console.log("❌ Errores encontrados en titular:", errores);
    return errores;
  };

  const validarAcompanantes = (): string[] => {
    const errores: string[] = [];

    formulario.acompanantes.forEach((acomp, index) => {
      const numAcomp = index + 1;

      if (!acomp.nombre.trim()) {
        errores.push(`Acompañante ${numAcomp}: El nombre es obligatorio`);
      }

      if (!acomp.apellido.trim()) {
        errores.push(`Acompañante ${numAcomp}: El apellido es obligatorio`);
      }

      if (!acomp.documento.trim()) {
        errores.push(`Acompañante ${numAcomp}: El documento es obligatorio`);
      }

      if (!acomp.fecha_nacimiento) {
        errores.push(
          `Acompañante ${numAcomp}: La fecha de nacimiento es obligatoria`
        );
      } else {
        const fechaNacimiento = new Date(acomp.fecha_nacimiento);
        const hoy = new Date();
        const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();

        if (edad > 120) {
          errores.push(
            `Acompañante ${numAcomp}: La fecha de nacimiento no es válida`
          );
        }
      }

      // Validación opcional de email si se proporciona
      if (acomp.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(acomp.email)) {
          errores.push(
            `Acompañante ${numAcomp}: El formato del email no es válido`
          );
        }
      }

      // Validación opcional de teléfono si se proporciona
      if (acomp.telefono.trim() && acomp.telefono.length < 7) {
        errores.push(
          `Acompañante ${numAcomp}: El teléfono debe tener al menos 7 dígitos`
        );
      }
    });

    return errores;
  };

  const validarDetalles = (): string[] => {
    const errores: string[] = [];

    if (!formulario.detalles.fecha_inicio) {
      errores.push("La fecha de inicio del viaje es obligatoria");
    } else {
      const fechaInicio = new Date(formulario.detalles.fecha_inicio);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      // Debugging de fechas
      console.log("🗓️ Validando fecha:", {
        fechaSeleccionada: formulario.detalles.fecha_inicio,
        fechaInicio: fechaInicio,
        hoy: hoy,
        esValida: fechaInicio >= hoy,
      });

      // Permitir desde hoy en adelante (no restringir tanto)
      if (fechaInicio < hoy) {
        errores.push("La fecha de inicio debe ser desde hoy en adelante");
      }

      // No permitir fechas muy lejanas (más de 2 años)
      const dosAnosAdelante = new Date(hoy);
      dosAnosAdelante.setFullYear(dosAnosAdelante.getFullYear() + 2);

      if (fechaInicio > dosAnosAdelante) {
        errores.push(
          "La fecha de inicio no puede ser más de 2 años en el futuro"
        );
      }
    }

    return errores;
  };

  const validarTerminos = (): string[] => {
    const errores: string[] = [];

    if (!formulario.terminos_aceptados) {
      errores.push("Debe aceptar los términos y condiciones");
    }
    if (!formulario.politica_privacidad_aceptada) {
      errores.push("Debe aceptar la política de privacidad");
    }

    return errores;
  };

  // Avanzar al siguiente paso
  const siguientePaso = () => {
    console.log("🔄 Intentando avanzar desde paso:", pasoActual);
    let errores: string[] = [];

    switch (pasoActual) {
      case "titular":
        errores = validarTitular();
        console.log("🔍 Errores titular:", errores.length);
        if (errores.length === 0) {
          console.log("✅ Avanzando a acompañantes");
          setPasoActual("acompanantes");
        }
        break;
      case "acompanantes":
        errores = validarAcompanantes();
        console.log("🔍 Errores acompañantes:", errores.length);
        if (errores.length === 0) {
          console.log("✅ Avanzando a detalles");
          setPasoActual("detalles");
        }
        break;
      case "detalles":
        errores = validarDetalles();
        console.log("🔍 Errores detalles:", errores.length);
        if (errores.length === 0) {
          console.log("✅ Avanzando a confirmación");
          setPasoActual("confirmacion");
        }
        break;
      case "confirmacion":
        // Este caso se maneja en enviarReserva
        break;
    }

    if (errores.length > 0) {
      toast({
        title: `Error${errores.length > 1 ? "es" : ""} en el formulario`,
        description:
          errores.length > 3
            ? `${errores.slice(0, 3).join(", ")}... y ${
                errores.length - 3
              } más.`
            : errores.join(", "),
        variant: "destructive",
        duration: 5000,
      });

      // Log para debug
      console.log("❌ ERRORES DE VALIDACIÓN:", errores);
    }
  };

  // Volver al paso anterior
  const pasoAnterior = () => {
    console.log("🔙 Intentando volver atrás desde:", pasoActual);

    switch (pasoActual) {
      case "acompanantes":
        console.log("🔙 Volviendo a titular");
        setPasoActual("titular");
        break;
      case "detalles":
        console.log("🔙 Volviendo a acompañantes");
        setPasoActual("acompanantes");
        break;
      case "confirmacion":
        console.log("🔙 Volviendo a detalles");
        setPasoActual("detalles");
        break;
      default:
        console.log("🔙 No se puede volver atrás desde:", pasoActual);
    }
  };

  // Calcular total (usar precio del servicio seleccionado del frontend)
    const calcularTotal = () => {
    const cantidadPersonas = 1 + formulario.acompanantes.length; // Titular + acompañantes
    return formulario.servicio.precio * cantidadPersonas;
  };

  // Enviar reserva al backend
  const enviarReserva = async () => {
    // Validación final completa
    const erroresTitular = validarTitular();
    const erroresAcompanantes = validarAcompanantes();
    const erroresDetalles = validarDetalles();
    const erroresTerminos = validarTerminos();

    const todosLosErrores = [
      ...erroresTitular,
      ...erroresAcompanantes,
      ...erroresDetalles,
      ...erroresTerminos,
    ];

    if (todosLosErrores.length > 0) {
      toast({
        title: "No se puede completar la reserva",
        description:
          todosLosErrores.length > 2
            ? `Hay ${todosLosErrores.length} errores que corregir. Revise todos los campos.`
            : todosLosErrores.join(", "),
        variant: "destructive",
        duration: 7000,
      });
      console.log("❌ ERRORES DE VALIDACIÓN FINAL:", todosLosErrores);
      return;
    }

    setProcesandoReserva(true);

    toast({
      title: "Procesando reserva...",
      description: "Estamos creando su reserva. Por favor, espere un momento.",
      variant: "default",
      duration: 3000,
    });

    try {
      // Obtener el ID del cliente autenticado
      const clienteId = user?.id ? parseInt(user.id) : null;
      
      if (!clienteId) {
        throw new Error("Usuario no autenticado o ID de usuario no válido");
      }

      console.log("🔍 PREPARANDO RESERVA PARA BACKEND DJANGO...");

      // Preparar fechas en formato ISO
      const fechaInicio = new Date(formulario.detalles.fecha_inicio + "T09:00:00Z");
      const fechaFin = new Date(formulario.detalles.fecha_inicio + "T18:00:00Z");

      // 🎯 PAYLOAD COMPATIBLE CON DJANGO BACKEND
      const payloadReserva = {
        fecha: formulario.detalles.fecha_inicio, // Fecha simple YYYY-MM-DD
        fecha_inicio: fechaInicio.toISOString(), // Fecha y hora de inicio
        fecha_fin: fechaFin.toISOString(), // Fecha y hora de fin
        estado: "PENDIENTE",
        total: calcularTotal().toFixed(2), // Total como string con 2 decimales
        moneda: "BOB",
        cliente_id: clienteId, // ✅ Corregido: debe ser cliente_id según el error
        cupon: formulario.detalles.codigo_cupon.trim() 
          ? parseInt(formulario.detalles.codigo_cupon.trim()) 
          : null, // ✅ ID numérico del cupón, no código
      };

      console.log("📋 PAYLOAD DJANGO BACKEND:", JSON.stringify(payloadReserva, null, 2));

      // 🚀 CREAR RESERVA EN EL BACKEND
      const response = await crearReserva(payloadReserva);
      
      if (response.status === 201 && response.data) {
        const reservaId = response.data.id;
        setUltimaReservaId(reservaId);
        console.log("✅ RESERVA CREADA CON ID:", reservaId);
        // 👥 CREAR Y ASOCIAR VISITANTES (NUEVO FLUJO DJANGO)
        console.log("👥 CREANDO VISITANTES...");
        // 1. Crear visitante titular
        const datosVisitanteTitular = convertirFormularioAVisitante(formulario.titular, true);
        const visitanteTitular = await crearVisitante(datosVisitanteTitular);
        // Al completar la reserva, avanzar al paso de pago
        setPasoActual("pago");
        setProcesandoReserva(false);
        toast({
          title: "Reserva creada",
          description: "Ahora puede proceder al pago.",
          variant: "default",
          duration: 3000,
        });
        return;
        
        // 2. Asociar titular a reserva
        try {
          await asociarVisitanteReserva(reservaId, visitanteTitular.data.id);
          console.log("✅ VISITANTE TITULAR CREADO Y ASOCIADO");
        } catch (associationError) {
          console.warn("⚠️ ERROR EN ASOCIACIÓN - CONTINUANDO CON RESERVA:");
          console.warn("   Reserva ID:", reservaId);
          console.warn("   Visitante ID:", visitanteTitular.data.id);
          console.warn("   Error:", associationError);
          console.log("✅ VISITANTE TITULAR CREADO (sin asociación automática)");
        }

        // 3. Crear y asociar acompañantes
        for (let i = 0; i < formulario.acompanantes.length; i++) {
          const acomp = formulario.acompanantes[i];
          const datosVisitanteAcomp = convertirFormularioAVisitante({
            nombre: acomp.nombre,
            apellido: acomp.apellido,
            documento: acomp.documento,
            fecha_nacimiento: acomp.fecha_nacimiento,
            nacionalidad: acomp.nacionalidad,
            email: acomp.email || formulario.titular.email,
            telefono: acomp.telefono || formulario.titular.telefono,
          }, false);
          
          const visitanteAcomp = await crearVisitante(datosVisitanteAcomp);
          
          try {
            await asociarVisitanteReserva(reservaId, visitanteAcomp.data.id);
            console.log(`✅ ACOMPAÑANTE ${i + 1} CREADO Y ASOCIADO`);
          } catch (associationError) {
            console.warn(`⚠️ ERROR EN ASOCIACIÓN ACOMPAÑANTE ${i + 1} - CONTINUANDO:`);
            console.warn("   Reserva ID:", reservaId);
            console.warn("   Visitante ID:", visitanteAcomp.data.id);
            console.log(`✅ ACOMPAÑANTE ${i + 1} CREADO (sin asociación automática)`);
          }
        }

        console.log("🎉 RESERVA Y VISITANTES COMPLETAMENTE PROCESADOS");
        
        const numeroReserva = response.data.id;
        toast({
          title: "¡Reserva creada exitosamente!",
          description: `Su número de reserva es: #${numeroReserva}. Se han registrado ${1 + formulario.acompanantes.length} visitantes.`,
          variant: "default",
          duration: 6000,
        });
  // Abrir modal de pago ficticio en vez de redirigir directamente
  // Eliminado: setModalPagoAbierto(true);
  // Guardar el número de reserva para usarlo tras el pago
  // Eliminado: window.__numeroReservaFinta = numeroReserva.toString();
      } else {
        throw new Error("Respuesta inesperada del servidor");
      }

      if (response.status === 201 && response.data) {
        const numeroReserva = response.data.id || `BOL-${Date.now()}`;
        toast({
          title: "¡Reserva creada exitosamente!",
          description: `Su número de reserva es: #${numeroReserva}.`,
          variant: "default",
          duration: 6000,
        });
  // Abrir modal de pago ficticio en vez de redirigir directamente
  // Eliminado: setModalPagoAbierto(true);
  // Eliminado: window.__numeroReservaFinta = numeroReserva.toString();
  // Modal de pago eliminado: ahora el pago es un paso del wizard
      } else {
        throw new Error("Respuesta inesperada del servidor");
      }
    } catch (error: any) {
      console.error("❌ ERROR AL CREAR RESERVA:", error);
      const mensajeError =
        error.response?.data?.detail || error.message || "Error desconocido";
      toast({
        title: "Error al crear reserva",
        description: mensajeError,
        variant: "destructive",
        duration: 8000,
      });
    } finally {
      setProcesandoReserva(false);
    }
  };

  // Renderizar paso actual
  const renderizarPaso = () => {
    switch (pasoActual) {
      case "titular":
        return renderizarPasoTitular();
      case "acompanantes":
        return renderizarPasoAcompanantes();
      case "detalles":
        return renderizarPasoDetalles();
      case "confirmacion":
        return renderizarPasoConfirmacion();
      case "pago":
        return renderizarPasoPago();
      default:
        return null;
    }
  };


  // Paso de pago con Stripe Checkout
  const renderizarPasoPago = () => (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl text-orange-600">💳</span>
        </div>
        <CardTitle className="text-xl">Pago con Stripe</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <p className="mb-4">Serás redirigido a Stripe para completar el pago de tu reserva.</p>
          <p className="text-lg font-bold text-green-600 mb-4">Total a pagar: Bs. {calcularTotal().toFixed(2)}</p>
          {ultimaReservaId ? (
            <BotonStripeCheckout
              monto={calcularTotal()}
              descripcion={`Reserva #${ultimaReservaId} - ${servicioSeleccionado?.nombre || "Paquete"}`}
              reservaId={ultimaReservaId} // Pass the ultimaReservaId here
            />
          ) : (
            <p className="text-red-600">No se encontró la reserva a pagar.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderizarPasoTitular = () => (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <User className="w-6 h-6 text-orange-600" />
        </div>
        <CardTitle className="text-xl">Información del Titular</CardTitle>
        <div className="flex items-center justify-center text-sm text-green-600">
          <CheckCircle className="w-4 h-4 mr-1" />
          Autocompletado
        </div>
        <p className="text-sm text-gray-600">
          Hemos autocompletado tus datos. Puedes editarlos si es necesario.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={formulario.titular.nombre}
              onChange={(e) => actualizarTitular("nombre", e.target.value)}
              placeholder="Hebert Suarez"
            />
          </div>
          <div>
            <Label htmlFor="apellido">Apellido *</Label>
            <Input
              id="apellido"
              value={formulario.titular.apellido}
              onChange={(e) => actualizarTitular("apellido", e.target.value)}
              placeholder="Burgos"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formulario.titular.email}
              onChange={(e) => actualizarTitular("email", e.target.value)}
              placeholder="suarezburgoshebert@gmail.com"
            />
          </div>
          <div>
            <Label htmlFor="telefono">Teléfono *</Label>
            <Input
              id="telefono"
              value={formulario.titular.telefono}
              onChange={(e) => actualizarTitular("telefono", e.target.value)}
              placeholder="+591 70123456"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="documento">Tipo de Documento *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Cédula de Identidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ci">Cédula de Identidad</SelectItem>
                <SelectItem value="pasaporte">Pasaporte</SelectItem>
                <SelectItem value="extranjeria">
                  Carné de Extranjería
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="numero_documento">Número de Documento *</Label>
            <Input
              id="numero_documento"
              value={formulario.titular.documento}
              onChange={(e) => actualizarTitular("documento", e.target.value)}
              placeholder="12345678"
            />
          </div>
          <div>
            <Label htmlFor="nacionalidad">Nacionalidad *</Label>
            <Select
              value={formulario.titular.nacionalidad}
              onValueChange={(value) =>
                actualizarTitular("nacionalidad", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Boliviana">Boliviana</SelectItem>
                <SelectItem value="Argentina">Argentina</SelectItem>
                <SelectItem value="Brasileña">Brasileña</SelectItem>
                <SelectItem value="Chilena">Chilena</SelectItem>
                <SelectItem value="Peruana">Peruana</SelectItem>
                <SelectItem value="Otra">Otra</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
          <Input
            id="fecha_nacimiento"
            type="date"
            value={formulario.titular.fecha_nacimiento}
            onChange={(e) =>
              actualizarTitular("fecha_nacimiento", e.target.value)
            }
            max={new Date().toISOString().split("T")[0]} // No permitir fechas futuras
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderizarPasoAcompanantes = () => (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <Users className="w-6 h-6 text-orange-600" />
        </div>
        <CardTitle className="text-xl">
          Acompañantes ({formulario.acompanantes.length})
        </CardTitle>
        <p className="text-sm text-gray-600">
          {formulario.acompanantes.length === 0
            ? "¿Viajas solo? ¡Perfecto! Si necesitas agregar acompañantes, hazlo aquí."
            : "Información de las personas que te acompañarán en este viaje."}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {formulario.acompanantes.map((acompanante, index) => (
          <Card
            key={acompanante.id}
            className="border-2 border-dashed border-gray-200"
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Acompañante {index + 1}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => eliminarAcompanante(acompanante.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                  Eliminar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre *</Label>
                  <Input
                    value={acompanante.nombre}
                    onChange={(e) =>
                      actualizarAcompanante(
                        acompanante.id,
                        "nombre",
                        e.target.value
                      )
                    }
                    placeholder="Nombre del acompañante"
                  />
                </div>
                <div>
                  <Label>Apellido *</Label>
                  <Input
                    value={acompanante.apellido}
                    onChange={(e) =>
                      actualizarAcompanante(
                        acompanante.id,
                        "apellido",
                        e.target.value
                      )
                    }
                    placeholder="Apellido del acompañante"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Tipo Documento *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Cédula de Identidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ci">Cédula de Identidad</SelectItem>
                      <SelectItem value="pasaporte">Pasaporte</SelectItem>
                      <SelectItem value="extranjeria">
                        Carné de Extranjería
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Número Documento *</Label>
                  <Input
                    value={acompanante.documento}
                    onChange={(e) =>
                      actualizarAcompanante(
                        acompanante.id,
                        "documento",
                        e.target.value
                      )
                    }
                    placeholder="Número de documento"
                  />
                </div>
                <div>
                  <Label>Fecha Nacimiento *</Label>
                  <Input
                    type="date"
                    value={acompanante.fecha_nacimiento}
                    onChange={(e) =>
                      actualizarAcompanante(
                        acompanante.id,
                        "fecha_nacimiento",
                        e.target.value
                      )
                    }
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Teléfono</Label>
                  <Input
                    value={acompanante.telefono}
                    onChange={(e) =>
                      actualizarAcompanante(
                        acompanante.id,
                        "telefono",
                        e.target.value
                      )
                    }
                    placeholder="Teléfono (opcional)"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={acompanante.email}
                    onChange={(e) =>
                      actualizarAcompanante(
                        acompanante.id,
                        "email",
                        e.target.value
                      )
                    }
                    placeholder="Email (opcional)"
                  />
                </div>
                <div>
                  <Label>Nacionalidad *</Label>
                  <Select
                    value={acompanante.nacionalidad}
                    onValueChange={(value) =>
                      actualizarAcompanante(
                        acompanante.id,
                        "nacionalidad",
                        value
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Boliviana">Boliviana</SelectItem>
                      <SelectItem value="Argentina">Argentina</SelectItem>
                      <SelectItem value="Brasileña">Brasileña</SelectItem>
                      <SelectItem value="Chilena">Chilena</SelectItem>
                      <SelectItem value="Peruana">Peruana</SelectItem>
                      <SelectItem value="Otra">Otra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          variant="outline"
          onClick={agregarAcompanante}
          className="w-full border-dashed border-2 border-gray-300 py-8"
        >
          <Plus className="w-5 h-5 mr-2" />+ Agregar Acompañante
        </Button>
      </CardContent>
    </Card>
  );

  const renderizarPasoDetalles = () => (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <Plane className="w-6 h-6 text-orange-600" />
        </div>
        <CardTitle className="text-xl">Detalles del Viaje</CardTitle>
        <p className="text-sm text-gray-600">
          Información adicional sobre tu viaje
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fecha_inicio">Fecha de inicio *</Label>
            <Input
              id="fecha_inicio"
              type="date"
              value={formulario.detalles.fecha_inicio}
              onChange={(e) =>
                actualizarDetalles("fecha_inicio", e.target.value)
              }
              min={
                new Date(Date.now() + 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0]
              } // Mínimo mañana
            />
          </div>
          <div>
            <Label htmlFor="codigo_cupon">Código de cupón (opcional)</Label>
            <Input
              id="codigo_cupon"
              value={formulario.detalles.codigo_cupon}
              onChange={(e) =>
                actualizarDetalles("codigo_cupon", e.target.value)
              }
              placeholder="Ingresa tu código de descuento"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="notas_adicionales">Notas adicionales</Label>
          <Textarea
            id="notas_adicionales"
            value={formulario.detalles.notas_adicionales}
            onChange={(e) =>
              actualizarDetalles("notas_adicionales", e.target.value)
            }
            placeholder="Alergias alimentarias, necesidades especiales, celebraciones..."
            className="min-h-[100px]"
          />
        </div>

        {/* Resumen del servicio */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg">Resumen del Servicio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Servicio:</span>
                <span className="font-medium">
                  {formulario.servicio.nombre}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Precio por persona:</span>
                <span className="font-medium">
                  Bs. {formulario.servicio.precio.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cantidad de personas:</span>
                <span className="font-medium">
                  {1 + formulario.acompanantes.length}
                </span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>Bs. {calcularTotal().toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );

  const renderizarPasoConfirmacion = () => (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <CardTitle className="text-xl">Confirmación</CardTitle>
        <p className="text-sm text-gray-600">
          Revisa todos los datos antes de confirmar tu reserva
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumen completo */}
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Titular:</h4>
            <p className="text-sm">
              {formulario.titular.nombre} {formulario.titular.apellido}
            </p>
            <p className="text-sm text-gray-600">{formulario.titular.email}</p>
          </div>

          {formulario.acompanantes.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">
                Acompañantes ({formulario.acompanantes.length}):
              </h4>
              {formulario.acompanantes.map((acomp, index) => (
                <p key={acomp.id} className="text-sm">
                  {index + 1}. {acomp.nombre} {acomp.apellido}
                </p>
              ))}
            </div>
          )}

          <div>
            <h4 className="font-medium mb-2">Servicio:</h4>
            <p className="text-sm">{formulario.servicio.nombre}</p>
            <p className="text-sm text-gray-600">
              Fecha: {formulario.detalles.fecha_inicio}
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Total a pagar:</h4>
            <p className="text-xl font-bold text-green-600">
              Bs. {calcularTotal().toFixed(2)}
            </p>
          </div>
        </div>

        {/* Términos y condiciones */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              checked={formulario.terminos_aceptados}
              onCheckedChange={(checked) =>
                setFormulario((prev) => ({
                  ...prev,
                  terminos_aceptados: checked as boolean,
                }))
              }
            />
            <Label className="text-sm">
              Acepto los{" "}
              <span className="text-orange-600 hover:underline cursor-pointer">
                términos y condiciones
              </span>{" "}
              y la{" "}
              <span className="text-orange-600 hover:underline cursor-pointer">
                política de privacidad
              </span>
              . *
            </Label>
          </div>
          <div className="flex items-start space-x-2">
            <Checkbox
              checked={formulario.politica_privacidad_aceptada}
              onCheckedChange={(checked) =>
                setFormulario((prev) => ({
                  ...prev,
                  politica_privacidad_aceptada: checked as boolean,
                }))
              }
            />
            <Label className="text-sm">
              Confirmo que toda la información proporcionada es correcta y
              autorizo el procesamiento de mis datos personales. *
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Indicador de progreso */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`flex items-center ${
              pasoActual === "titular" ? "text-orange-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                pasoActual === "titular"
                  ? "border-orange-600 bg-orange-600 text-white"
                  : "border-gray-300"
              }`}
            >
              1
            </div>
            <span className="ml-2 text-sm">Titular</span>
          </div>
          <div
            className={`flex items-center ${
              pasoActual === "acompanantes"
                ? "text-orange-600"
                : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                pasoActual === "acompanantes"
                  ? "border-orange-600 bg-orange-600 text-white"
                  : "border-gray-300"
              }`}
            >
              2
            </div>
            <span className="ml-2 text-sm">Acompañantes</span>
          </div>
          <div
            className={`flex items-center ${
              pasoActual === "detalles" ? "text-orange-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                pasoActual === "detalles"
                  ? "border-orange-600 bg-orange-600 text-white"
                  : "border-gray-300"
              }`}
            >
              3
            </div>
            <span className="ml-2 text-sm">Detalles</span>
          </div>
          <div
            className={`flex items-center ${
              pasoActual === "confirmacion"
                ? "text-orange-600"
                : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                pasoActual === "confirmacion"
                  ? "border-orange-600 bg-orange-600 text-white"
                  : "border-gray-300"
              }`}
            >
              4
            </div>
            <span className="ml-2 text-sm">Confirmación</span>
          </div>
          <div
            className={`flex items-center ${
              pasoActual === "pago"
                ? "text-orange-600"
                : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                pasoActual === "pago"
                  ? "border-orange-600 bg-orange-600 text-white"
                  : "border-gray-300"
              }`}
            >
              5
            </div>
            <span className="ml-2 text-sm">Pago</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-orange-600 h-2 rounded-full transition-all duration-300"
            style={{
              width:
                pasoActual === "titular"
                  ? "20%"
                  : pasoActual === "acompanantes"
                  ? "40%"
                  : pasoActual === "detalles"
                  ? "60%"
                  : pasoActual === "confirmacion"
                  ? "80%"
                  : "100%",
            }}
          />
        </div>
      </div>

      {/* Contenido del paso actual */}
      {renderizarPaso()}

      {/* Botones de navegación */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={pasoAnterior}
          disabled={pasoActual === "titular"}
        >
          Volver a la vista previa
        </Button>

        {pasoActual === "confirmacion" ? (
          <Button
            onClick={enviarReserva}
            disabled={procesandoReserva}
            className="bg-green-600 hover:bg-green-700"
          >
            {procesandoReserva ? "Procesando..." : "Confirmar Reserva"}
          </Button>
        ) : pasoActual === "pago" ? null : (
          <Button
            onClick={siguientePaso}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Continuar
          </Button>
        )}
      </div>
    </div>
  );
}
