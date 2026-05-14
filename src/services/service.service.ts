import api from "@/lib/axios";

export interface Service {
  id: number;
  name: string;
  description?: string | null;
  estimated_duration?: string | null;
  price?: number | string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ServicePayload {
  name: string;
  description: string;
  estimated_duration: string;
  price: string;
}

export interface ServiceResponse {
  success: boolean;
  message?: string;
  data: Service[];
}

export interface SingleServiceResponse {
  success: boolean;
  message?: string;
  data: Service;
}

export const serviceService = {
  async getServices(): Promise<ServiceResponse> {
    const response = await api.get("/services");

    return response.data;
  },

  async getServiceById(id: string | number): Promise<SingleServiceResponse> {
    const response = await api.get(`/services/${id}`, {
      timeout: 10000,
    });

    return response.data;
  },

  async createService(payload: ServicePayload) {
    const response = await api.post("/services", payload);

    return response.data;
  },

  async updateService(id: string | number, payload: ServicePayload) {
    const response = await api.put(`/services/${id}`, payload);

    return response.data;
  },

  async deleteService(id: string | number) {
    const response = await api.delete(`/services/${id}`);

    return response.data;
  },
};
