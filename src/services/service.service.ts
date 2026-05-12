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

export interface ServiceResponse {
  success: boolean;
  message?: string;
  data: Service[];
}

export const serviceService = {
  async getServices(): Promise<ServiceResponse> {
    const response = await api.get("/services");

    return response.data;
  },

  async getServiceById(id: string) {
    const response = await api.get(`/services/${id}`);

    return response.data;
  },
};
