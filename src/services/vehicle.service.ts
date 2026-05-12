import api from "@/lib/axios";

export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: string;
  license_plate: string;
  image?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface VehiclePayload {
  brand: string;
  model: string;
  year: string;
  license_plate: string;
}

export interface VehicleResponse {
  success: boolean;
  message?: string;
  data: Vehicle[];
}

export interface SingleVehicleResponse {
  success: boolean;
  message?: string;
  data: Vehicle;
}

export const vehicleService = {
  async getMyVehicles(): Promise<VehicleResponse> {
    const response = await api.get("/vehicles");

    return response.data;
  },

  async getVehicleById(id: string): Promise<SingleVehicleResponse> {
    const response = await api.get(`/vehicles/${id}`);

    return response.data;
  },

  // =========================
  // CREATE
  // =========================
  async createVehicle(payload: FormData) {
    const response = await api.post("/vehicles", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  // =========================
  // UPDATE
  // =========================
  async updateVehicle(id: string, payload: FormData) {
    const response = await api.put(`/vehicles/${id}`, payload);

    return response.data;
  },

  // =========================
  // DELETE
  // =========================
  async deleteVehicle(id: string) {
    const response = await api.delete(`/vehicles/${id}`);

    return response.data;
  },
};
