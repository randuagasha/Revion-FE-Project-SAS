import api from "@/lib/axios";

export type NotificationType =
  | "booking"
  | "booking_status"
  | "ticket"
  | "ticket_message"
  | "system";

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: NotificationType;
  reference_id?: number | null;
  reference_url?: string | null;
  is_read: boolean | 0 | 1;
  created_at: string;
  updated_at?: string;
}

export interface NotificationResponse {
  success: boolean;
  message?: string;
  data: Notification[];
}

export interface UnreadCountResponse {
  success: boolean;
  message?: string;
  data: {
    unread_count: number;
  };
}

export const notificationService = {
  async getNotifications(): Promise<NotificationResponse> {
    const response = await api.get("/notifications");

    return response.data;
  },

  async getUnreadCount(): Promise<UnreadCountResponse> {
    const response = await api.get("/notifications/unread-count");

    return response.data;
  },

  async markAsRead(id: string | number) {
    const response = await api.put(`/notifications/${id}/read`);

    return response.data;
  },

  async markAllAsRead() {
    const response = await api.put("/notifications/read-all");

    return response.data;
  },

  async deleteNotification(id: string | number) {
    const response = await api.delete(`/notifications/${id}`);

    return response.data;
  },
};
