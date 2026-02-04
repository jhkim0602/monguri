"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "./components/button";
import { Badge } from "./components/badge";
import { Card } from "./components/card";
import { cn } from "./lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning";
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Study Reviewed",
    message: "Mr. Park reviewed your Math session.",
    time: "2m ago",
    read: false,
    type: "success",
  },
  {
    id: "2",
    title: "New Assignment",
    message: "Complete Calculus Ch.3 by Friday.",
    time: "1h ago",
    read: false,
    type: "info",
  },
  {
    id: "3",
    title: "Live Session",
    message: "Live review starts in 15 mins.",
    time: "5h ago",
    read: true,
    type: "warning",
  },
];

export function NotificationBadge() {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <span className="font-semibold text-sm">Notifications</span>
            <button className="text-xs text-blue-600 font-medium hover:underline">
              Mark all read
            </button>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {MOCK_NOTIFICATIONS.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  "p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors relative",
                  !notif.read && "bg-blue-50/30",
                )}
              >
                {!notif.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                )}
                <p className="text-sm font-medium text-gray-900">
                  {notif.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                  {notif.message}
                </p>
                <p className="text-[10px] text-gray-400 mt-1.5">{notif.time}</p>
              </div>
            ))}
            {MOCK_NOTIFICATIONS.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-sm">
                No notifications
              </div>
            )}
          </div>
          <div className="p-2 border-t border-gray-100 text-center">
            <button className="text-xs text-gray-500 hover:text-gray-900">
              View All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
