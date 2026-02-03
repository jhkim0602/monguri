"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  BookOpen,
  Settings,
  LogOut,
  Video,
  Library,
  Inbox,
  Calendar,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/components/ui/lib/utils";

const NAV_ITEMS = [
  { label: "대시보드", href: "/mentor", icon: Home },
  { label: "상담 신청", href: "/mentor/applications", icon: Inbox },
  { label: "피드백", href: "/mentor/feedback", icon: MessageCircle },
  { label: "채팅", href: "/mentor/chat", icon: Inbox },
  { label: "학생 관리", href: "/mentor/students", icon: Users },
  { label: "일정", href: "/mentor/schedule", icon: Calendar },
  { label: "라이브 강의", href: "/mentor/live", icon: Video },
  { label: "자료실", href: "/mentor/library", icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col pt-4">
      {/* Logo Removed - Handled by Global Header */}

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <item.icon
                className={cn(
                  "w-4 h-4",
                  isActive ? "text-blue-600" : "text-gray-400",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-50 space-y-1">
        <Link
          href="/mentor/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
        >
          <Settings className="w-4 h-4 text-gray-400" />
          설정
        </Link>
        <button
          onClick={() => (window.location.href = "/login")} // Mock logout
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 text-left"
        >
          <LogOut className="w-4 h-4" />
          로그아웃
        </button>
      </div>
    </aside>
  );
}
