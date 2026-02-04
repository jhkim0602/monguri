"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Calendar } from "lucide-react";
import { USER_PROFILE } from "@/constants/common";
import { SUBJECT_TIPS, MENTOR_TASKS } from "@/constants/mentee";
import WeeklyCalendar from "@/components/mentee/planner/WeeklyCalendar";
import Header from "@/components/mentee/layout/Header";
import HomeProgress from "@/components/mentee/home/HomeProgress";
import HomeTasks from "@/components/mentee/home/HomeTasks";

export default function Home() {
    const [animatedProgress, setAnimatedProgress] = useState(0);

    const targetProgress = Math.round((MENTOR_TASKS.filter(t => t.status !== 'pending').length / MENTOR_TASKS.length) * 100);

    useEffect(() => {
        let startTime: number | null = null;
        const duration = 400;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            setAnimatedProgress(Math.floor(percentage * targetProgress));
            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        };
        const animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [targetProgress]);

    return (
        <div className="bg-white">
            <Header title="설스터디" />

            {/* Welcome Section */}
            <section className="px-6 flex justify-between items-start mb-6">
                <div>
                    <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-semibold mb-2">
                        {USER_PROFILE.role} <span className="ml-1 text-primary">D-{USER_PROFILE.dDay}</span>
                    </span>
                    <h2 className="text-xl font-bold leading-tight">
                        {USER_PROFILE.name}님, <br />
                        오늘도 화이팅! 🔥
                    </h2>
                </div>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                    <img src={USER_PROFILE.avatar} alt="avatar" className="w-full h-full object-cover" />
                </div>
            </section>

            <HomeProgress animatedProgress={animatedProgress} />

            <section className="px-6 mb-6">
                <WeeklyCalendar />
            </section>

            {/* Today Schedule Snippet */}
            <section className="px-6 mb-8">
                <div className="bg-blue-50/50 rounded-2xl p-4 flex items-center justify-between border border-blue-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] text-blue-500 font-bold mb-0.5">오늘의 일정</p>
                            <p className="text-sm font-semibold text-gray-800">
                                멘토링 상담 | <span className="text-primary font-bold">19:00</span>
                            </p>
                        </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-300" />
                </div>
            </section>

            <HomeTasks />

            {/* Subject Tips */}
            <section className="px-6 pb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold italic underline decoration-yellow-300 decoration-4 underline-offset-4">
                        과목별 꿀팁 🍯
                    </h3>
                    <button className="text-gray-400 text-xs">더보기</button>
                </div>

                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                    {SUBJECT_TIPS.map((tip) => (
                        <div key={tip.id} className="min-w-[140px] flex-shrink-0">
                            <div className={`aspect-square rounded-2xl ${tip.color.split(' ')[0]} mb-3 flex items-center justify-center font-bold text-lg`}>
                                {tip.subject}
                            </div>
                            <p className="text-[10px] text-primary font-bold mb-1">{tip.subject}</p>
                            <h4 className="text-xs font-bold leading-snug line-clamp-2">
                                {tip.title}
                            </h4>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
