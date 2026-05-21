import api from "@/lib/axios";

export type UserRole = "customer" | "mechanic" | "super_admin";
export type MechanicAvailability = "available" | "busy" | "off_duty";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  availability?: MechanicAvailability | null;
  created_at?: string;
  updated_at?: string;
}

export interface AdminUserPayload {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  availability?: MechanicAvailability;
}

export interface AdminUserResponse {
  success: boolean;
  message?: string;
  total?: number;
  data: AdminUser[];
}

export interface SingleAdminUserResponse {
  success: boolean;
  message?: string;
  data: AdminUser;
}

export const adminUserService = {
  async getUsers(params?: {
    role?: UserRole;
    search?: string;
  }): Promise<AdminUserResponse> {
    const response = await api.get("/admin/users", {
      params,
    });

    return response.data;
  },

  async getUserById(id: string | number): Promise<SingleAdminUserResponse> {
    const response = await api.get(`/admin/users/${id}`);

    return response.data;
  },

  async createUser(payload: AdminUserPayload) {
    const response = await api.post("/admin/users", payload);

    return response.data;
  },

  async updateUser(id: string | number, payload: AdminUserPayload) {
    const response = await api.put(`/admin/users/${id}`, payload);

    return response.data;
  },

  async deleteUser(id: string | number) {
    const response = await api.delete(`/admin/users/${id}`);

    return response.data;
  },
};
