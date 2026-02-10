"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  User,
  Menu,
  X,
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  MessageCircle,
  FolderOpen,
  FileText,
} from "lucide-react";

import MentorProfileModal from "@/components/mentor/profile/MentorProfileModal";
import { useMentorProfile } from "@/contexts/MentorProfileContext";
import { NotificationBadge } from "@/components/ui";

export default function TopNav() {
  const pathname = usePathname();
  const { profile } = useMentorProfile();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const avatarUrl = profile?.avatar_url;
  const mentorName = profile?.name || "멘토";
  const mentorIntro = profile?.intro || "프로필을 설정해보세요.";
  const mentorAvatar =
    profile?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(mentorName)}&background=EFF6FF&color=1D4ED8`;

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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 lg:hidden"
            aria-label={isMobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <img
            src="/seoul_logo.svg"
            alt="SeolStudy 로고"
            className="h-8 w-8 object-contain"
          />
          <span className="text-lg font-black tracking-tight text-[#1E3A8A] sm:text-xl">
            SeolStudy
          </span>
        </div>

        <div className="flex items-center gap-4">
          <NotificationBadge iconSize={20} />

          <button
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center justify-center rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
            aria-label="멘토 프로필 설정"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="멘토 프로필"
                className="h-9 w-9 rounded-full border border-gray-200 object-cover"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-gray-50">
                <User size={18} />
              </span>
            )}
          </button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 top-16 z-40 bg-black/30 lg:hidden"
            aria-label="메뉴 닫기"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="fixed left-0 top-16 bottom-0 z-50 flex w-72 max-w-[84vw] flex-col border-r border-gray-200 bg-white p-4 shadow-2xl lg:hidden">
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={`mobile-drawer-${item.href}`}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
                      active
                        ? "bg-gray-900 text-white"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={active ? "text-white" : "text-gray-400"}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-gray-100 pt-4">
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-blue-100">
                  <img
                    src={mentorAvatar}
                    alt="Mentor Avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-900">
                    {mentorName}
                  </p>
                  <p className="truncate text-[11px] font-medium text-gray-400">
                    {mentorIntro}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}

      <MentorProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
}
