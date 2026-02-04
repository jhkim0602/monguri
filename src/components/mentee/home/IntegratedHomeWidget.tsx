"use client";

import Link from "next/link";
import { ChevronRight, CalendarDays, Bell } from "lucide-react";
import { USER_PROFILE } from "@/constants/common";
import DailyFocusStream from "./DailyFocusStream";

export default function IntegratedHomeWidget() {
    return (
        <section className="px-6 mb-8">
            <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-gray-100/50 border border-gray-100 relative overflow-hidden">
                {/* Header: Profile & Calendar Link */}
                <div className="relative flex justify-between items-start mb-6">
                    {/* User Profile Info */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-full bg-gray-100 border-2 border-white shadow-sm overflow-hidden">
                                <img src={USER_PROFILE.avatar} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-gray-900 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-white">
                                D-{USER_PROFILE.dDay}
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-gray-500 text-[11px] font-bold">{USER_PROFILE.role}</span>
                                <div className="w-1 h-1 rounded-full bg-gray-300" />
                                <span className="text-primary text-[11px] font-black">Lv.3</span>
                            </div>
                            <h2 className="text-[19px] font-black text-gray-900 leading-tight">
                                {USER_PROFILE.name}님,<br />
                                <span className="text-gray-400">오늘 공부도 파이팅! 🔥</span>
                            </h2>
                        </div>
                    </div>

                    {/* Calendar Link -> Planner Link */}
                    <Link href="/calendar" className="p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
                        <CalendarDays size={20} />
                    </Link>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-gray-100 mb-6" />

                {/* Unified Daily Focus Stream (Vertical Stack) */}
                <div className="relative z-10">
                    <DailyFocusStream />
                </div>

                {/* Bottom Link to Full Planner */}
                <div className="mt-6 flex justify-center border-t border-gray-50 pt-4">
                    <Link href="/planner" className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-primary transition-colors">
                        전체 플래너 펼쳐보기 <ChevronRight size={14} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
