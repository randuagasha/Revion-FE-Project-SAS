import api from "@/lib/axios";

export interface RevBotMessage {
  role: "user" | "assistant";
  content: string;
}

export interface RevBotSuggestedAction {
  label: string;
  href: string;
  type: "booking" | "ticket" | "bookings" | string;
}

export interface RevBotChatPayload {
  message: string;
  history?: RevBotMessage[];
}

export interface RevBotChatResponse {
  success: boolean;
  message: string;
  data: {
    reply: string;
    suggested_actions?: RevBotSuggestedAction[];
  };
}

export const revbotService = {
  async sendMessage(payload: RevBotChatPayload): Promise<RevBotChatResponse> {
    const response = await api.post("/revbot/chat", payload, {
      timeout: 90000,
    });

    return response.data;
  },
};