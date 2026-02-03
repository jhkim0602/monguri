"use client";

import { CheckCircle2 } from "lucide-react";
import { MENTOR_TASKS } from "@/constants/common";

interface HomeProgressProps {
    animatedProgress: number;
}

export default function HomeProgress({ animatedProgress }: HomeProgressProps) {
    return (
        <section className="px-6 mb-8">
            <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-1">Weekly Goals</p>
                        <h3 className="text-xl font-bold text-gray-900">이번 주 학습 달성도</h3>
                    </div>
                    <div className="text-right">
                        <span className="text-3xl font-black text-primary transition-all duration-[400ms]">
                            {animatedProgress}%
                        </span>
                    </div>
                </div>

                <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div
                        className="h-full bg-gradient-to-r from-blue-400 to-primary rounded-full transition-all duration-[400ms] ease-out shadow-inner"
                        style={{ width: `${animatedProgress}%` }}
                    />
                </div>

                <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
                    <span>{MENTOR_TASKS.filter(t => t.status !== 'pending').length} / {MENTOR_TASKS.length} 과제 완료</span>
                    <span className="text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full italic">Keep Going! 🔥</span>
                </div>

                <div className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none">
                    <CheckCircle2 size={120} />
                </div>
            </div>
        </section>
    );
}
