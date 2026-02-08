"use client";

import { usePathname } from "next/navigation";
import BottomNav from "@/components/mentee/common/BottomNav";
import "./mentee.css";

export default function MenteeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isChatRoute = pathname === "/chat";

  return (
    /* App-like UI: Prevent global scrolling */
    <div className="min-h-screen h-[100dvh] w-full bg-[#F2F2F7] flex justify-center shadow-2xl overflow-hidden">
      <div
        className={`mobile-container relative bg-white ${isChatRoute ? "h-full min-h-[100dvh]" : "min-h-screen min-h-[100dvh]"}`}
      >
        <main className={isChatRoute ? "h-full min-h-0" : "pb-24 min-h-[100dvh]"}>
          {children}
        </main>
        {!isChatRoute && <BottomNav />}
      </div>
    </div>
  );
}
