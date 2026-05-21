import api from "@/lib/axios";

export type UserRole = "customer" | "mechanic" | "super_admin";
export type MechanicAvailability = "available" | "busy" | "off_duty";

export interface ProfileUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  availability?: MechanicAvailability | null;
  profile_image?: string | null;
  profile_image_url?: string | null;
}

export interface ProfileResponse {
  success: boolean;
  message?: string;
  data: ProfileUser;
}

export interface UpdateAvailabilityResponse {
  success: boolean;
  message: string;
  data?: {
    availability: MechanicAvailability;
  };
  active_booking?: {
    id: number;
    booking_code: string;
    status: string;
  };
}

export const userService = {
  async getProfile(): Promise<ProfileResponse> {
    const response = await api.get("/user/me");

    return response.data;
  },

  async updateMechanicAvailability(
    availability: "available" | "off_duty",
  ): Promise<UpdateAvailabilityResponse> {
    const response = await api.patch("/user/me/availability", {
      availability,
    });

    return response.data;
  },
};
