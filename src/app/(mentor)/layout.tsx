"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Global Web Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="w-full px-6 h-16 flex items-center justify-between">
          {/* Logo & Context */}
          <div className="flex items-center gap-6">
            <a href="#" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                S
              </div>
              <span className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                SeolStudy
              </span>
            </a>

            <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

            {/* Workspace Selector (Design Only) */}
            <button className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition-colors">
              <span>2024 수능 대비반 (A반)</span>
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>

          {/* Right Side Tools */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full font-medium border border-indigo-100">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              멘토 모드 (Active)
            </div>

            <div className="w-px h-8 bg-gray-200 mx-2 hidden md:block"></div>

            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <a
              href="#"
              className="flex items-center gap-2 pl-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka`}
                  alt="Profile"
                />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-gray-900">
                  박서울 (Mentor)
                </div>
                <div className="text-[10px] text-gray-500">로그아웃</div>
              </div>
            </a>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-8 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
