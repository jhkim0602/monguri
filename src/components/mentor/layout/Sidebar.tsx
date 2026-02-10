"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  MessageCircle,
  FolderOpen,
  FileText,
} from "lucide-react";
import { useMentorProfile } from "@/contexts/MentorProfileContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { profile } = useMentorProfile();

  const menuItems = [
    { name: "대시보드", href: "/dashboard", icon: LayoutDashboard },
    { name: "학생 관리", href: "/students", icon: Users },
    { name: "일정 관리", href: "/schedule", icon: Calendar },
    { name: "채팅", href: "/chat-mentor", icon: MessageCircle },
    { name: "칼럼 관리", href: "/mentor/columns", icon: FileText },
    { name: "피드백", href: "/mentor-feedback", icon: MessageSquare },
    { name: "자료실", href: "/materials", icon: FolderOpen },
  ];

  const isActive = (path: string) => pathname.startsWith(path);
  const mentorName = profile?.name || "멘토";
  const mentorIntro = profile?.intro || "프로필을 설정해보세요.";
  const mentorAvatar =
    profile?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(mentorName)}&background=EFF6FF&color=1D4ED8`;

  return (
    <aside className="fixed top-16 left-0 bottom-0 z-40 hidden w-64 flex-col justify-between border-r border-gray-200 bg-white lg:flex">
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
              src={mentorAvatar}
              alt="Mentor Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-gray-900 truncate">
              {mentorName}
            </h4>
            <p className="text-[11px] text-gray-400 font-medium">
              {mentorIntro}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
