"use client";

import { Search, Settings, LogOut } from "lucide-react";
import { NotificationBadge } from "@/components/ui";

export default function TopNav() {
  return (
    <header className="fixed top-0 right-0 left-0 h-16 bg-white border-b border-gray-200 z-50 px-8 flex items-center justify-between">
      {/* Branding (Left aligned within content area, or could be part of global header if sidebar was different. 
          User requested Header has "SeolStudy". Since Sidebar is fixed left, this header sits to the right of it. 
          Wait, user said "Header has SeolStudy, Sidebar no Monguri". 
          If Sidebar is 256px, Header should probably span the full width OR just the content width.
          Standard desktop app: Sidebar Left (full height), Header Top (right of sidebar). 
          Let's stick to content-area header for now, or full width if Sidebar is below it.
          "Header has SeolStudy" -> usually implies Top Left branding.
          Let's make Header span full width and Sidebar sit below it? 
          Or keeps Sidebar full height and Header is just the top bar of the content area?
          User said: "Sidebar no Monguri, Header has SeolStudy".
          This implies the "Brand" moved from Sidebar Top to Header Top-Left.
          If I move Brand to Header, and Header is to the right of Sidebar, it looks weird.
          Likely the Header should be Full Width at the top, and Sidebar is below it?
          OR, Sidebar is Left, Header is Right, but the "Brand" is in the Header (which visually might look like it's in the top-left if sidebar top is empty).
          Let's go with: Header spans Full Width (z-index higher than sidebar? or Sidebar is below header).
          Actually proper dashboard layout: Sidebar (Left, Full Height), Header (Right of Sidebar).
          If Brand is in Header, it usually sits in the top-left of the HEADER area.
          Let's place "SeolStudy" in the TopNav component.
      */}

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-black text-lg">S</span>
        </div>
        <span className="text-xl font-black text-gray-900 tracking-tight">
          SeolStudy
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="검색..."
            className="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
          />
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>

        <div className="h-8 w-[1px] bg-gray-200 mx-2" />

        <NotificationBadge iconSize={20} />

        <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
          <Settings size={20} />
        </button>

        <button className="flex items-center gap-2 pl-2 text-gray-400 hover:text-red-500 transition-colors">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
