"use client";

import { Search } from "lucide-react";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const header = (() => {
    if (pathname.startsWith("/mentor/students/")) {
      return {
        title: "학생 상세",
        subtitle: "학생의 과제/캘린더/플래너를 확인하세요.",
      };
    }
    if (pathname.startsWith("/mentor/students")) {
      return { title: "학생 관리", subtitle: "담당 학생 목록입니다." };
    }
    if (pathname.startsWith("/mentor/tasks")) {
      return { title: "과제 관리", subtitle: "멘토 과제를 관리합니다." };
    }
    if (pathname.startsWith("/mentor/planner")) {
      return { title: "플래너", subtitle: "멘티 플래너를 검토하고 피드백합니다." };
    }
    if (pathname.startsWith("/mentor/calendar")) {
      return { title: "캘린더", subtitle: "멘토 일정(미팅/상담/모의고사)을 관리합니다." };
    }
    if (pathname.startsWith("/mentor/columns")) {
      return { title: "칼럼 작성", subtitle: "멘토 칼럼을 작성합니다." };
    }
    return { title: "대시보드", subtitle: "오늘의 멘토링 현황입니다." };
  })();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-800">{header.title}</h1>
        <div className="h-4 w-px bg-gray-300 mx-2" />
        <span className="text-sm text-gray-500">{header.subtitle}</span>
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
