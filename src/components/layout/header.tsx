"use client";

import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage, Input } from "@/components/ui";

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-800">대시보드</h1>
        <div className="h-4 w-px bg-gray-300 mx-2" />
        <span className="text-sm text-gray-500">오늘의 수업 일정입니다.</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar - Optional, kept for local search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="학생, 노트, 통계 검색..."
            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
          />
        </div>
      </div>
    </header>
  );
}
