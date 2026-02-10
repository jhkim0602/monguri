"use client";

import { usePathname } from "next/navigation";
import BottomNav from "@/components/mentee/common/BottomNav";
import RoleGuard from "@/components/auth/RoleGuard";
import "./mentee.css";

const MENTEE_ALLOWED_ROLES = ["mentee", "admin"] as const;

export default function MenteeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isChatRoute = pathname === "/chat";

  return (
    <RoleGuard allowedRoles={MENTEE_ALLOWED_ROLES}>
      {/* App-like UI: Prevent global scrolling */}
      <div className="min-h-screen w-full bg-[#F2F2F7] flex justify-center shadow-2xl h-screen overflow-hidden">
        <div
          className={`mobile-container relative bg-white ${isChatRoute ? "h-full" : "min-h-screen"}`}
        >
          <main className={isChatRoute ? "h-full min-h-0" : "pb-24 min-h-screen"}>
            {children}
          </main>
          {!isChatRoute && <BottomNav />}
        </div>
      </div>
    </RoleGuard>
  );
}
