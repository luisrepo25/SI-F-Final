import api from "./axios";

export interface TicketCreate {
  asunto: string;
  descripcion: string;
}

export interface Ticket {
  id: number;
  creador: number;
  creador_nombre: string;
  asunto: string;
  descripcion: string;
  estado: string;
  agente: number | null;
  agente_nombre: string | null;
  prioridad: string | null;
  created_at: string;
  updated_at: string;
  messages?: any[];
}

export const createTicket = async (data: TicketCreate) => {
  return api.post("/tickets/", data);
};

export const listTickets = async () => {
  return api.get("/tickets/");
};

export const getTicket = async (id: number) => {
  return api.get(`/tickets/${id}/`);
};

export const addMessage = async (ticket: number, texto: string) => {
  return api.post("/ticket-messages/", { ticket, texto });
};

export const closeTicket = async (id: number) => {
  return api.post(`/tickets/${id}/close/`);
};

export default {
  createTicket,
  listTickets,
  getTicket,
  addMessage,
  closeTicket,
};
