"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, Calendar, User } from "lucide-react";

const navItems = [
    { name: "홈", icon: Home, href: "/home" },
    { name: "플래너", icon: ClipboardList, href: "/planner" },
    { name: "캘린더", icon: Calendar, href: "/calendar" },
    { name: "마이페이지", icon: User, href: "/mypage" },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/80 backdrop-blur-xl border-t border-gray-100/50 px-4 py-2 flex justify-between items-center z-50">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.name}
                        href={item.href || "#"}
                        className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ios-button-press ${isActive ? "text-primary" : "text-gray-400"
                            }`}
                    >
                        <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                        <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>{item.name}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
