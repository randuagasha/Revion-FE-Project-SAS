import api from "@/lib/axios";

export type BookingPriority = "low" | "medium" | "high";

export type BookingStatus =
  | "pending"
  | "accepted"
  | "inspection"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Booking {
  id: number;
  booking_code: string;

  user_id: number;
  vehicle_id: number;
  service_id: number;
  mechanic_id?: number | null;

  preferred_date: string;
  preferred_time: string;

  complaint: string;
  priority: BookingPriority;
  status: BookingStatus;

  brand: string;
  model: string;
  license_plate?: string;

  service_name: string;
  mechanic_name?: string | null;

  created_at: string;
  updated_at?: string;
}

export interface BookingResponse {
  success: boolean;
  total?: number;
  message?: string;
  data: Booking[];
}

export interface SingleBookingResponse {
  success: boolean;
  message?: string;
  data: Booking;
}

export const bookingService = {
  async getMyBookings(): Promise<BookingResponse> {
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

  async getBookingById(id: string): Promise<SingleBookingResponse> {
    const response = await api.get(`/bookings/${id}`);

    return response.data;
  },

  async createBooking(payload: FormData) {
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
