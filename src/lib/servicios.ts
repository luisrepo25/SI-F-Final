// =========================
// Interfaces actualizadas
// =========================

export interface Servicio {
  id: number;
  categoria: Categoria;
  proveedor: Proveedor;
  created_at: string | null;
  updated_at: string | null;
  titulo: string;
  descripcion: string;
  duracion: string; 
  capacidad_max: number;
  punto_encuentro: string;
  estado: string;
  // puede ser una URL directa o un arreglo de URLs (algunas partes del código usan [0])
  imagen_url: string ;
  precio_usd: string ; // puede venir como "90.00" o 90
  servicios_incluidos: string[]; // array de strings ["Guía", "Hotel", ...]
}

export interface Categoria {
  id?: number;
  created_at?: string | null;
  updated_at?: string | null;
  nombre: string;
}

export interface Rol {
  id: number;
  created_at: string | null;
  updated_at: string | null;
  nombre: string;
}

export interface Proveedor {
  id: number;
  rol: Rol;
  created_at: string | null;
  updated_at: string | null;
  nombre: string;
  rubro: string | null;
  num_viajes: number;
  telefono: string | null;
  fecha_nacimiento: string | null;
  genero: string | null;
  documento_identidad: string | null;
  pais: string | null;
  user: number;
}
