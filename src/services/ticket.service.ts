import api from "@/lib/axios";

export type TicketStatus = "open" | "in_review" | "resolved" | "closed";

export interface Ticket {
  id: number;
  ticket_code: string;
  user_id: number;
  vehicle_id?: number | null;
  subject: string;
  status: TicketStatus;
  customer_name?: string;
  brand?: string | null;
  model?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface TicketMessage {
  id: number;
  ticket_id: number;
  sender_id: number;
  sender_name: string;
  sender_role: "customer" | "mechanic" | "super_admin";
  message: string;
  attachment?: string | null;
  attachment_url?: string | null;
  created_at: string;
}

export interface TicketResponse {
  success: boolean;
  message?: string;
  data: Ticket[];
}

export interface SingleTicketResponse {
  success: boolean;
  message?: string;
  data: Ticket;
}

export interface TicketMessageResponse {
  success: boolean;
  message?: string;
  data: TicketMessage[];
}

export const ticketService = {
  async getTickets(): Promise<TicketResponse> {
    const response = await api.get("/tickets");

    return response.data;
  },

  async getTicketById(id: string): Promise<SingleTicketResponse> {
    const response = await api.get(`/tickets/${id}`);

    return response.data;
  },

  async createTicket(payload: { vehicle_id?: string | null; subject: string }) {
    const response = await api.post("/tickets", payload);

    return response.data;
  },

  async updateTicketStatus(id: string, status: TicketStatus) {
    const response = await api.put(`/tickets/${id}/status`, {
      status,
    });

    return response.data;
  },

  async getTicketMessages(ticketId: string): Promise<TicketMessageResponse> {
    const response = await api.get(`/ticket-messages/${ticketId}`);

    return response.data;
  },

  async sendTicketMessage(payload: FormData) {
    const response = await api.post("/ticket-messages", payload);

    return response.data;
  },
};
