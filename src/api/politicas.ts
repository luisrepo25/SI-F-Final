
// src/api/politicas.ts
import { NextApiRequest, NextApiResponse } from 'next';

interface Politica {
  id: number;
  titulo: string;
  tipo: string;
  tipo_display: string;
  contenido: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

const politicasData: Politica[] = [
  {
    id: 1,
    titulo: 'Términos y Condiciones de Uso',
    tipo: 'terms',
    tipo_display: 'Términos y Condiciones',
    contenido: `TÉRMINOS Y CONDICIONES DE USO

1. ACEPTACIÓN
Al utilizar nuestro sitio web, usted acepta cumplir con estos términos y condiciones.

2. USO DEL SERVICIO
- Debe ser mayor de 18 años para realizar reservas
- La información proporcionada debe ser veraz y actualizada
- No está permitido usar el servicio para actividades ilegales

3. RESERVAS Y PAGOS
- Todas las reservas están sujetas a disponibilidad
- Los precios pueden cambiar sin previo aviso
- El pago completo confirma la reserva
- Se emitirá comprobante electrónico por cada transacción`,
    activo: true,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  },
  {
    id: 2,
    titulo: 'Política de Privacidad',
    tipo: 'privacy',
    tipo_display: 'Política de Privacidad',
    contenido: `POLÍTICA DE PRIVACIDAD Y PROTECCIÓN DE DATOS

1. INFORMACIÓN QUE RECOPILAMOS
- Datos personales: nombre, email, teléfono, documento de identidad
- Datos de reservas: fechas, destinos, preferencias
- Información de pago (procesada de forma segura)

2. USO DE LA INFORMACIÓN
- Procesar y confirmar sus reservas
- Mejorar nuestros servicios y experiencia de usuario
- Comunicaciones sobre sus viajes y promociones`,
    activo: true,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  }
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;

  if (method === 'GET') {
    const { tipo } = query;
    
    let politicas = politicasData.filter(p => p.activo);

    if (tipo && typeof tipo === 'string') {
      politicas = politicas.filter(p => p.tipo === tipo);
    }

    res.status(200).json(politicas);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}


