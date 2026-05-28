"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Loader2, Send, Sparkles } from "lucide-react";

import {
  type RevBotMessage,
  type RevBotSuggestedAction,
  revbotService,
} from "@/services/revbot.service";

interface ChatItem extends RevBotMessage {
  id: string;
  actions?: RevBotSuggestedAction[];
}

const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(" ");
};

const quickPrompts = [
  "Rem bunyi saat diinjak, kira-kira kenapa?",
  "Service apa yang cocok kalau mobil terasa berat saat akselerasi?",
  "Jelaskan status booking di Revion.",
  "Kapan saya harus membuat ticket support?",
];

export default function RevBotPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const messageIdRef = useRef(0);

  const createMessageId = useCallback((prefix: string) => {
    messageIdRef.current += 1;

    return `${prefix}-${messageIdRef.current}`;
  }, []);

  const [messages, setMessages] = useState<ChatItem[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Halo, Aku RevBot. Aku bisa membantu soal otomotif dan fitur Revion. Mau tanya apa?",
    },
  ]);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const history: RevBotMessage[] = messages
    .filter((item) => item.id !== "welcome")
    .map((item) => ({
      role: item.role,
      content: item.content,
    }));

  const sendMessage = async (messageText: string) => {
    const cleanMessage = messageText.trim();

    if (!cleanMessage || loading) return;

    const userMessage: ChatItem = {
      id: createMessageId("user"),
      role: "user",
      content: cleanMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const result = await revbotService.sendMessage({
        message: cleanMessage,
        history,
      });

      const botMessage: ChatItem = {
        id: createMessageId("assistant"),
        role: "assistant",
        content: result.data.reply,
        actions: result.data.suggested_actions || [],
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: unknown) {
      console.error("REVBOT_SEND_MESSAGE_ERROR:", error);

      const errorMessage: ChatItem = {
        id: createMessageId("assistant-error"),
        role: "assistant",
        content:
          "Maaf, RevBot lagi bermasalah atau server AI belum bisa dihubungi. Coba lagi sebentar ya.",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);

      window.setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    void sendMessage(message);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);

  return (
    <main className="min-h-[calc(100vh-8rem)] overflow-x-hidden">
      <div className="mx-auto w-full max-w-6xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card/40 backdrop-blur-xl min-h-[calc(100vh-10rem)] flex flex-col">
          <div className="pointer-events-none absolute -right-40 -top-40 h-80 w-80 rounded-full bg-[#C96F32]/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-40 bottom-20 h-80 w-80 rounded-full bg-[#522C14]/10 blur-3xl" />

          <div className="relative z-10 h-20 border-b border-border px-6 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">
                  Chat with RevBot
                </h2>

                <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-[#C96F32]/20 bg-[#C96F32]/10 px-2.5 py-1 text-[11px] font-bold text-[#F97316]">
                  <Sparkles size={12} />
                  AI
                </span>
              </div>

              <p className="text-sm text-muted-foreground mt-1">
                Automotive and Revion assistant
              </p>
            </div>

            <div className="shrink-0 hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
              Online
            </div>
          </div>

          <div className="relative z-10 flex-1 overflow-y-auto px-5 sm:px-6 py-6 space-y-5">
            {messages.map((item) => (
              <ChatBubble key={item.id} item={item} />
            ))}

            {loading ? (
              <div className="flex justify-start">
                <div className="rounded-3xl rounded-tl-md border border-white/10 bg-white/4 px-5 py-4 text-sm text-muted-foreground flex items-center gap-3">
                  <Loader2 size={17} className="animate-spin text-[#F97316]" />
                  RevBot sedang mengetik...
                </div>
              </div>
            ) : null}

            <div ref={chatEndRef} />
          </div>

          <div className="relative z-10 border-t border-border bg-background/55 backdrop-blur-xl">
            <div className="px-5 pt-4">
              <div className="flex flex-wrap items-center gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void sendMessage(prompt)}
                    disabled={loading}
                    className="rounded-full border border-white/10 bg-white/4 px-4 py-2 text-xs font-semibold text-muted-foreground hover:border-[#C96F32]/30 hover:bg-[#C96F32]/10 hover:text-[#F97316] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 pt-3">
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-white/4 px-4 py-3 focus-within:border-[#C96F32]/40 focus-within:bg-white/6 transition-all">
                <input
                  ref={inputRef}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Tanya RevBot soal mobil, service, booking, atau ticket..."
                  disabled={loading}
                  className="min-w-0 flex-1 bg-transparent outline-none text-sm text-white placeholder:text-muted-foreground disabled:opacity-60"
                />

                <button
                  type="submit"
                  disabled={loading || !message.trim()}
                  className="shrink-0 h-11 px-4 rounded-xl bg-[#C96F32] text-white text-sm font-bold hover:bg-[#B8622C] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Send size={17} />
                  )}

                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

function ChatBubble({ item }: { item: ChatItem }) {
  const isUser = item.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[92%] sm:max-w-[78%] rounded-3xl px-5 py-4 text-sm leading-7 shadow-xl warp-break-words",
          isUser
            ? "rounded-tr-md bg-[#C96F32] text-white shadow-[#C96F32]/10"
            : "rounded-tl-md border border-white/10 bg-white/4 text-zinc-200",
        )}
      >
        <p className="whitespace-pre-line">{item.content}</p>

        {!isUser && item.actions && item.actions.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {item.actions.map((action) => (
              <Link
                key={`${action.type}-${action.href}`}
                href={action.href}
                className="inline-flex items-center gap-2 rounded-xl border border-[#C96F32]/25 bg-[#C96F32]/10 px-3 py-2 text-xs font-bold text-[#F97316] hover:bg-[#C96F32]/15 transition-all"
              >
                {action.label}
                <ArrowRight size={13} />
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
