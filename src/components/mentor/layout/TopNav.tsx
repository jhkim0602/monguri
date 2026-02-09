"use client";

import { useState } from "react";
import { User } from "lucide-react";

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
          <img
            src="/seoul_logo.svg"
            alt="SeolStudy 로고"
            className="h-8 w-8 object-contain"
          />
          <span className="text-xl font-black tracking-tight text-[#1E3A8A]">
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

      <MentorProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
}
