"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "./lib/utils";

type NotificationRow = {
  id: string;
  title: string;
  message: string;
  action_url: string | null;
  created_at: string;
  read_at: string | null;
  avatar_url: string | null;
  type: string;
};

type NotificationBadgeProps = {
  iconSize?: number;
};

const MAX_ITEMS = 30;

const formatRelativeTime = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  return date.toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
  });
};

export function NotificationBadge({ iconSize = 20 }: NotificationBadgeProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read_at).length,
    [notifications],
  );

  const loadNotifications = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("notifications")
      .select(
        "id, title, message, action_url, created_at, read_at, avatar_url, type",
      )
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false })
      .limit(MAX_ITEMS);

    if (error) {
      console.error("Failed to load notifications:", error);
      return;
    }

    setNotifications((data ?? []) as NotificationRow[]);
  }, [userId]);

  useEffect(() => {
    let isMounted = true;
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data?.user?.id ?? null;
      if (!isMounted) return;
      setUserId(uid);
    };
    loadUser();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          const next = payload.new as NotificationRow;
          setNotifications((prev) => {
            if (prev.some((item) => item.id === next.id)) return prev;
            return [next, ...prev].slice(0, MAX_ITEMS);
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          const next = payload.new as NotificationRow;
          setNotifications((prev) =>
            prev.map((item) => (item.id === next.id ? next : item)),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const markAllRead = async () => {
    if (!userId || unreadCount === 0) return;
    const timestamp = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((item) => (item.read_at ? item : { ...item, read_at: timestamp })),
    );
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: timestamp })
      .eq("recipient_id", userId)
      .is("read_at", null);

    if (error) {
      console.error("Failed to mark all notifications as read:", error);
      await loadNotifications();
    }
  };

  const markOneRead = async (notification: NotificationRow) => {
    if (!userId || notification.read_at) return;
    const timestamp = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === notification.id ? { ...item, read_at: timestamp } : item,
      ),
    );
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: timestamp })
      .eq("id", notification.id);

    if (error) {
      console.error("Failed to mark notification as read:", error);
      await loadNotifications();
    }
  };

  const handleItemClick = async (notification: NotificationRow) => {
    await markOneRead(notification);
    if (notification.action_url) {
      router.push(notification.action_url);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="relative p-2 text-gray-400 hover:text-gray-900 transition-colors"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Bell size={iconSize} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <span className="font-semibold text-sm">알림</span>
            <button
              type="button"
              className="text-xs text-blue-600 font-medium hover:underline"
              onClick={markAllRead}
            >
              모두 읽음
            </button>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.map((notif) => (
              <button
                key={notif.id}
                type="button"
                onClick={() => handleItemClick(notif)}
                className={cn(
                  "w-full text-left p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors relative",
                  !notif.read_at && "bg-blue-50/30",
                )}
              >
                {!notif.read_at && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                )}
                <p className="text-sm font-medium text-gray-900">
                  {notif.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                  {notif.message}
                </p>
                <p className="text-[10px] text-gray-400 mt-1.5">
                  {formatRelativeTime(notif.created_at)}
                </p>
              </button>
            ))}
            {notifications.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-sm">
                알림이 없습니다.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
