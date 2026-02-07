"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  MessageCircle,
  Settings,
  LogOut,
  Bell,
  FolderOpen,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "대시보드", href: "/dashboard", icon: LayoutDashboard },
    { name: "학생 관리", href: "/students", icon: Users },
    { name: "일정 관리", href: "/schedule", icon: Calendar },
    { name: "채팅", href: "/chat-mentor", icon: MessageCircle },
    { name: "피드백", href: "/mentor-feedback", icon: MessageSquare },
    { name: "자료실", href: "/materials", icon: FolderOpen },
  ];

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <aside className="fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-40 flex flex-col justify-between">
      {/* Navigation */}
      <div className="p-6">
        {/* Navigation */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  active
                    ? "bg-gray-900 text-white shadow-lg shadow-gray-200"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon
                  size={20}
                  className={active ? "text-white" : "text-gray-400"}
                />
                <span className="text-sm font-bold">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Profile Section */}
      <div className="p-6 border-t border-gray-100">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-blue-100 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80"
              alt="Mentor Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-gray-900 truncate">
              김서울 멘토
            </h4>
            <p className="text-[11px] text-gray-400 font-medium">
              서울대학교 국어교육과
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
