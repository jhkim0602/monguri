"use client";

import { useState } from "react";
import { Search, User } from "lucide-react";

import MentorProfileModal from "@/components/mentor/profile/MentorProfileModal";
import { useMentorProfile } from "@/contexts/MentorProfileContext";
import { NotificationBadge } from "@/components/ui";

export default function TopNav() {
  const { profile } = useMentorProfile();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const avatarUrl = profile?.avatar_url;

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-lg font-black text-white">S</span>
          </div>
          <span className="text-xl font-black tracking-tight text-gray-900">
            SeolStudy
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="검색..."
              className="w-64 rounded-xl border border-gray-100 bg-gray-50 py-2 pl-10 pr-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>

          <div className="mx-2 h-8 w-[1px] bg-gray-200" />

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

      <MentorProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
}
