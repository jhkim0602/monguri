"use client";

import { useState, useEffect } from "react";

import { USER_PROFILE } from "@/constants/common";
import { MENTOR_TASKS } from "@/constants/mentee";
import WeeklyCalendar from "@/components/mentee/planner/WeeklyCalendar";
import Header from "@/components/mentee/layout/Header";
import HomeProgress from "@/components/mentee/home/HomeProgress";
import HomeTasks from "@/components/mentee/home/HomeTasks";

export default function Home() {
    // Default to Feb 2 2026 for demo context
    const [selectedDate, setSelectedDate] = useState(new Date(2026, 1, 2));
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

            <HomeProgress
                animatedProgress={animatedProgress}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
            />

            <section className="px-6 mb-6">
                <WeeklyCalendar
                    currentDate={selectedDate}
                    onDateSelect={setSelectedDate}
                />
            </section>



            <HomeTasks />


        </div>
    );
}
