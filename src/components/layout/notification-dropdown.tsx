"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Bell,
  CalendarDays,
  CheckCheck,
  Info,
  Loader2,
  MessageCircle,
  Ticket,
  Trash2,
  Wrench,
  X,
} from "lucide-react";

import {
  notificationService,
  type Notification,
  type NotificationType,
} from "@/services/notification.service";

const getTypeIcon = (type: NotificationType) => {
  if (type === "booking") return CalendarDays;
  if (type === "booking_status") return Wrench;
  if (type === "ticket") return Ticket;
  if (type === "ticket_message") return MessageCircle;

  return Info;
};

const getTypeLabel = (type: NotificationType) => {
  if (type === "booking") return "Booking";
  if (type === "booking_status") return "Booking Status";
  if (type === "ticket") return "Ticket";
  if (type === "ticket_message") return "Ticket Message";

  return "System";
};

const formatDateTime = (date?: string) => {
  if (!date) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

const isUnread = (notification: Notification) => {
  return notification.is_read === false || notification.is_read === 0;
};

export default function NotificationDropdown() {
  const router = useRouter();

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [countLoading, setCountLoading] = useState(false);

  const [unreadCount, setUnreadCount] = useState(0);

  const unreadNotifications = useMemo(() => {
    return notifications.filter((notification) => isUnread(notification));
  }, [notifications]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      setCountLoading(true);

      const response = await notificationService.getUnreadCount();

      setUnreadCount(response.data?.unread_count || 0);
    } catch (error) {
      console.error("Failed to fetch unread notification count:", error);
    } finally {
      setCountLoading(false);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);

      const response = await notificationService.getNotifications();

      setNotifications(response.data || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchUnreadCount();
    }, 0);

    const interval = window.setInterval(() => {
      void fetchUnreadCount();
    }, 15000);

    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => {
      void fetchNotifications();
      void fetchUnreadCount();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [open, fetchNotifications, fetchUnreadCount]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current) return;

      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleOpenNotification = async (notification: Notification) => {
    try {
      if (isUnread(notification)) {
        await notificationService.markAsRead(notification.id);

        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  is_read: true,
                }
              : item,
          ),
        );

        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }

      setOpen(false);

      if (notification.reference_url) {
        router.push(notification.reference_url);
      }
    } catch (error) {
      console.error("Failed to open notification:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          is_read: true,
        })),
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const handleDeleteNotification = async (
    e: React.MouseEvent<HTMLButtonElement>,
    id: number,
  ) => {
    e.stopPropagation();

    try {
      const deletedNotification = notifications.find((item) => item.id === id);

      await notificationService.deleteNotification(id);

      setNotifications((prev) => prev.filter((item) => item.id !== id));

      if (deletedNotification && isUnread(deletedNotification)) {
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      {/* BELL WRAPPER */}
      <div className="relative h-11 w-11">
        <button
          type="button"
          onClick={handleToggle}
          aria-label="Open notifications"
          className={[
            "flex h-11 w-11 items-center justify-center rounded-2xl",
            "border border-border bg-background/40",
            "text-foreground transition-all duration-200",
            "hover:border-[#522C14]/60 hover:bg-[#522C14]/10 hover:text-white",
            open ? "border-[#522C14]/70 bg-[#522C14]/15" : "",
          ].join(" ")}
        >
          {countLoading ? (
            <Loader2 size={17} className="animate-spin text-muted-foreground" />
          ) : (
            <Bell size={18} strokeWidth={2} />
          )}
        </button>

        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-7px",
              right: "-7px",
              zIndex: 50,
              minWidth: "20px",
              height: "20px",
              paddingLeft: "6px",
              paddingRight: "6px",
              borderRadius: "9999px",
              backgroundColor: "#EF4444",
              border: "2px solid #0A0A0A",
              color: "#FFFFFF",
              fontSize: "10px",
              fontWeight: 800,
              lineHeight: "1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 18px rgba(239, 68, 68, 0.35)",
              fontVariantNumeric: "tabular-nums",
              pointerEvents: "none",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 top-14 z-50 w-97.5 overflow-hidden rounded-3xl border border-border bg-[#0D0D0D] shadow-2xl shadow-black/40">
          {/* TOP GRADIENT */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-[#522C14]/20 to-transparent" />

          {/* HEADER */}
          <div className="relative flex items-center justify-between border-b border-border/80 p-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white">Notifications</h3>

                {unreadCount > 0 && (
                  <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400">
                    {unreadCount > 99 ? "99+" : unreadCount} new
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Latest updates from Revion
              </p>
            </div>

            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background/40 text-muted-foreground transition hover:bg-accent hover:text-white"
                  title="Mark all as read"
                >
                  <CheckCheck size={16} />
                </button>
              )}

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background/40 text-muted-foreground transition hover:bg-accent hover:text-white"
                aria-label="Close notifications"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* CONTENT */}
          <div className="relative max-h-110 overflow-y-auto p-3">
            {loading ? (
              <div className="flex h-56 items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <Loader2 size={22} className="animate-spin text-[#C2692A]" />
                  <p className="text-xs">Loading notifications...</p>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex h-56 flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#522C1430] bg-[#522C1415]">
                  <Bell size={24} className="text-[#C2692A]" />
                </div>

                <h4 className="text-sm font-semibold text-white">
                  No notifications
                </h4>

                <p className="mt-1 max-w-56 text-xs leading-5 text-muted-foreground">
                  Booking, ticket, and system updates will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => {
                  const Icon = getTypeIcon(notification.type);
                  const unread = isUnread(notification);

                  return (
                    <div
                      key={notification.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleOpenNotification(notification)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          void handleOpenNotification(notification);
                        }
                      }}
                      className={[
                        "group relative w-full cursor-pointer overflow-hidden rounded-2xl border p-3 text-left transition-all duration-200",
                        unread
                          ? "border-[#522C14]/40 bg-[#522C14]/10 hover:bg-[#522C14]/15"
                          : "border-border bg-background/40 hover:bg-accent/60",
                      ].join(" ")}
                    >
                      {unread && (
                        <div className="absolute left-0 top-0 h-full w-1 bg-[#C2692A]" />
                      )}

                      <div className="flex items-start gap-3">
                        <div
                          className={[
                            "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
                            unread
                              ? "border-[#522C14]/40 bg-[#522C14]/20"
                              : "border-border bg-card/60",
                          ].join(" ")}
                        >
                          <Icon
                            size={18}
                            className={
                              unread
                                ? "text-[#C2692A]"
                                : "text-muted-foreground"
                            }
                          />

                          {unread && (
                            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-[#0D0D0D] bg-red-500" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p
                                className={[
                                  "line-clamp-1 text-sm",
                                  unread
                                    ? "font-bold text-white"
                                    : "font-semibold text-zinc-300",
                                ].join(" ")}
                              >
                                {notification.title}
                              </p>

                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-border bg-card/70 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                  {getTypeLabel(notification.type)}
                                </span>

                                {unread && (
                                  <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400">
                                    New
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) =>
                                handleDeleteNotification(e, notification.id)
                              }
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                              aria-label="Delete notification"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                            {notification.message}
                          </p>

                          <p className="mt-2 text-[11px] text-muted-foreground">
                            {formatDateTime(notification.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* FOOTER */}
          {notifications.length > 0 && (
            <div className="border-t border-border/80 p-3">
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background/40 text-sm font-semibold text-muted-foreground transition hover:bg-[#522C14] hover:text-white"
              >
                <CheckCheck size={16} />
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
