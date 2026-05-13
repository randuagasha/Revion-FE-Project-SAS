import api from "@/lib/axios";

export type BookingPriority = "low" | "medium" | "high";

export type BookingStatus =
  | "pending"
  | "accepted"
  | "inspection"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface BookingImage {
  id: number;
  booking_id?: number;
  progress_id?: number | null;
  image: string;
  image_url?: string;
  created_at?: string;
}

export interface BookingProgress {
  id: number;
  booking_id: number;
  status: BookingStatus;
  notes?: string | null;
  updated_by?: number | null;
  updated_by_name?: string | null;
  images?: BookingImage[];
  created_at?: string;
  updated_at?: string;
}

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

  customer_name?: string;
  customer_email?: string;

  brand: string;
  model: string;
  year?: string | number | null;
  license_plate?: string;

  service_name: string;
  price?: number | string | null;

  mechanic_name?: string | null;
  mechanic_email?: string | null;

  images?: BookingImage[];
  progress?: BookingProgress[];

  created_at: string;
  updated_at?: string;
}

export interface BookingResponse {
  success: boolean;
  message?: string;
  total?: number;
  data: Booking[];
}

export interface SingleBookingResponse {
  success: boolean;
  message?: string;
  data: Booking;
}

export interface CreateBookingResponse {
  success: boolean;
  message?: string;
  data: {
    booking_id: number;
    booking_code: string;
    assigned_mechanic?: {
      id: number;
      name: string;
    };
    status: BookingStatus;
  };
}

export interface UpdateBookingStatusResponse {
  success: boolean;
  message?: string;
}

export interface DeleteBookingResponse {
  success: boolean;
  message?: string;
}

export interface GetAllBookingsParams {
  search?: string;
  status?: BookingStatus;
  priority?: BookingPriority;
  page?: number;
  limit?: number;
}

export const bookingService = {
  // CUSTOMER BOOKINGS
  async getMyBookings(): Promise<BookingResponse> {
    const response = await api.get("/bookings/my");

    return response.data;
  },

  async createBooking(payload: FormData): Promise<CreateBookingResponse> {
    const response = await api.post("/bookings", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  // SHARED DETAIL
  // customer / mechanic / super admin
  async getBookingById(id: string | number): Promise<SingleBookingResponse> {
    const response = await api.get(`/bookings/${id}`);

    return response.data;
  },

  // MECHANIC BOOKINGS
  async getMechanicBookings(): Promise<BookingResponse> {
    const response = await api.get("/bookings/mechanic");

    return response.data;
  },

  async getMechanicIncomingBookings(): Promise<BookingResponse> {
    const response = await api.get("/bookings/mechanic/incoming");

    return response.data;
  },

  async getMechanicCompletedBookings(): Promise<BookingResponse> {
    const response = await api.get("/bookings/mechanic/completed");

    return response.data;
  },

  // SUPER ADMIN BOOKINGS
  async getAllBookings(
    params?: GetAllBookingsParams,
  ): Promise<BookingResponse> {
    const response = await api.get("/bookings", {
      params,
    });

    return response.data;
  },

  // STATUS ACTION
  // mechanic / super admin
  async updateBookingStatus(
    id: string | number,
    status: BookingStatus,
  ): Promise<UpdateBookingStatusResponse> {
    const response = await api.put(`/bookings/${id}/status`, {
      status,
    });

    return response.data;
  },

  // DELETE
  // super admin only
  async deleteBooking(id: string | number): Promise<DeleteBookingResponse> {
    const response = await api.delete(`/bookings/${id}`);

    return response.data;
  },
};
