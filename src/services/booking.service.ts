import api from "@/lib/axios";

export interface CreateBookingPayload {
  vehicle_id: string;
  service_id: string;
  preferred_date: string;
  preferred_time: string;
  complaint: string;
  priority?: "low" | "medium" | "high";
}

export const bookingService = {
  async getMyBookings() {
    const response = await api.get("/bookings/my");
    return response.data;
  },

  async getAllBookings() {
    const response = await api.get("/bookings");
    return response.data;
  },

  async getMechanicBookings() {
    const response = await api.get("/bookings/mechanic");
    return response.data;
  },

  async getBookingById(id: string) {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  async createBooking(payload: CreateBookingPayload) {
    const response = await api.post("/bookings", payload);
    return response.data;
  },

  async updateBookingStatus(id: string, status: string) {
    const response = await api.put(`/bookings/${id}/status`, {
      status,
    });

    return response.data;
  },

  async deleteBooking(id: string) {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  },
};
