// src/lib/paquetes.ts

export interface Paquete {
  id: string;
  nombre: string;
  ubicacion: string;
  descripcionCorta: string;
  descripcionCompleta: string;
  calificacion: number;
  numeroReseñas: number;
  precio: string;
  precioOriginal: string | null;
  duracion: string;
  maxPersonas: number;
  dificultad: string;
  categoria: string;
  imagenes: string[];
  destinos: {
    nombre: string;
    dias: number;
    descripcion: string;
  }[];
  itinerario: {
    dia: number;
    titulo: string;
    actividades: string[];
  }[];
  incluido: string[];
  noIncluido: string[];
  fechasDisponibles: string[];
  descuento?: number;
}

// Mínimo 2 mocks completos para que compile tu página de detalle sin nulls.
// Añade más paquetes siguiendo el mismo formato.
export const PAQUETES: Paquete[] = [
  {
    id: "bolivia-completa",
    nombre: "Bolivia Completa",
    ubicacion: "Multi-destino",
    descripcionCorta:
      "Recorre los destinos más impresionantes de Bolivia: Salar de Uyuni, Lago Titicaca, La Paz y más.",
    descripcionCompleta:
      "Vive un recorrido inolvidable por los principales atractivos de Bolivia.\n\nIncluye visitas guiadas, transporte interno y experiencias locales auténticas.",
    calificacion: 4.9,
    numeroReseñas: 158,
    precio: "Desde $850",
    precioOriginal: "Desde $980",
    duracion: "10 días",
    maxPersonas: 12,
    dificultad: "Moderado",
    categoria: "Aventura",
    imagenes: [
      "/bolivia-tour-uyuni-titicaca.png",
      "/tiwanaku-community.png",
      "/madidi-amazon-rainforest.png",
      "/bolivia-andes-trekking.png",
      "/bolivian-food-market-cochabamba.png",
    ],
    destinos: [
      { nombre: "Salar de Uyuni", dias: 2, descripcion: "Tour de salares y lagunas." },
      { nombre: "Lago Titicaca", dias: 2, descripcion: "Copacabana e Isla del Sol." },
      { nombre: "La Paz", dias: 2, descripcion: "Teleférico y casco histórico." },
      { nombre: "Potosí", dias: 1, descripcion: "Centro histórico y miradores." },
    ],
    itinerario: [
      { dia: 1, titulo: "Llegada a La Paz", actividades: ["Traslado", "City tour ligero"] },
      { dia: 2, titulo: "Teleférico + Miradores", actividades: ["City tour", "Gastronomía local"] },
      { dia: 3, titulo: "Viaje a Uyuni", actividades: ["Traslado", "Noche en Uyuni"] },
    ],
    incluido: [
      "Alojamiento",
      "Transporte interno",
      "Guías certificados",
      "Entradas a atracciones",
    ],
    noIncluido: ["Vuelos internacionales", "Gastos personales", "Seguro de viaje"],
    fechasDisponibles: ["2025-10-10", "2025-11-05", "2025-12-01"],
    descuento: 15,
  },
  {
    id: "aventura-extrema",
    nombre: "Aventura Extrema",
    ubicacion: "La Paz - Potosí",
    descripcionCorta:
      "Trekking, ciclismo de montaña y experiencias intensas en los Andes.",
    descripcionCompleta:
      "Un itinerario pensado para aventureros: alta montaña, descensos y rutas exigentes.\n\nIncluye equipo básico y guías especializados.",
    calificacion: 4.8,
    numeroReseñas: 92,
    precio: "Desde $650",
    precioOriginal: "Desde $720",
    duracion: "7 días",
    maxPersonas: 8,
    dificultad: "Alta",
    categoria: "Aventura",
    imagenes: [
      "/bolivia-andes-trekking.png",
      "/madidi-amazon-rainforest.png",
      "/bolivia-tour-uyuni-titicaca.png",
      "/tiwanaku-community.png",
      "/bolivian-food-market-cochabamba.png",
    ],
    destinos: [
      { nombre: "Cordillera Real", dias: 3, descripcion: "Trekking y montañismo." },
      { nombre: "Camino de la Muerte", dias: 1, descripcion: "Ciclismo de descenso." },
      { nombre: "Minas de Potosí", dias: 1, descripcion: "Visita técnica guiada." },
    ],
    itinerario: [
      { dia: 1, titulo: "Acreditación y briefing", actividades: ["Chequeo de equipo", "Charla de seguridad"] },
      { dia: 2, titulo: "Trekking Cordillera", actividades: ["Ascenso", "Campamento"] },
    ],
    incluido: ["Guías expertos", "Equipo básico", "Transporte interno"],
    noIncluido: ["Comidas no indicadas", "Seguro de accidentes"],
    fechasDisponibles: ["2025-09-25", "2025-10-20", "2025-11-15"],
  },
];

export function obtenerDatosPaquete(id: string): Paquete | undefined {
  return PAQUETES.find((p) => p.id === id);
}
