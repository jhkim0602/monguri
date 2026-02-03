"use client";

import { useRouter } from "next/navigation";
import { DEFAULT_CATEGORIES, MENTOR_TASKS } from "@/constants/common";
import { WEEKLY_SCHEDULE } from "@/constants/mentee";

interface WeeklyCalendarProps {
    currentDate?: Date;
}

export default function WeeklyCalendar({ currentDate = new Date() }: WeeklyCalendarProps) {
    const router = useRouter();

    // Get current week dates
    const getWeekDates = () => {
        const today = new Date(currentDate);
        const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
        const diff = today.getDate() - dayOfWeek; // Get Sunday

        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(diff + i);
            weekDates.push(date);
        }
        return weekDates;
    };

    const weekDates = getWeekDates();
    const today = new Date();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

    const isToday = (date: Date) => {
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const isSameDay = (date1: Date, date2: Date) => {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    };

    const getDailySubjects = (date: Date) => {
        const schedule = WEEKLY_SCHEDULE.find(s => isSameDay(s.date, date));
        const scheduleCategories = schedule?.events.map(e => e.categoryId) || [];

        const mentorDeadlines = MENTOR_TASKS.filter(t => t.deadline && isSameDay(t.deadline, date));
        const mentorCategories = mentorDeadlines.map(t => t.categoryId);

        // Combine and get unique category IDs
        return Array.from(new Set([...scheduleCategories, ...mentorCategories]));
    };

    const getCategoryById = (id: string) => DEFAULT_CATEGORIES.find(c => c.id === id) || DEFAULT_CATEGORIES[0];

    // Find max number of subjects in any day to determine grid height
    const maxSubjects = Math.max(...weekDates.map(date => getDailySubjects(date).length), 2);

    return (
        <div
            onClick={() => router.push('/calendar')}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-ios cursor-pointer hover:shadow-ios-lg transition-shadow"
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-800">이번 주 학습 계획</h3>
                <span className="text-xs text-gray-400">
                    {currentDate.getMonth() + 1}월
                </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
                {weekDates.map((date, index) => {
                    const isTodayDate = isToday(date);
                    const isSunday = index === 0;
                    const isSaturday = index === 6;
                    const subjectIds = getDailySubjects(date);

                    return (
                        <div key={index} className="flex flex-col items-center">
                            <span className={`text-[10px] font-medium mb-1 ${isSunday ? 'text-red-400' : isSaturday ? 'text-blue-400' : 'text-gray-400'
                                }`}>
                                {dayNames[index]}
                            </span>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all mb-2 ${isTodayDate
                                ? 'bg-primary text-white shadow-lg shadow-blue-200'
                                : 'text-gray-700 hover:bg-gray-50'
                                }`}>
                                {date.getDate()}
                            </div>

                            {/* Subject chips summary - matching monthly calendar style */}
                            <div className="flex flex-col gap-1 items-start w-full" style={{ minHeight: `${maxSubjects * 18}px` }}>
                                {subjectIds.slice(0, 3).map((catId, idx) => {
                                    const category = getCategoryById(catId || 'korean');
                                    return (
                                        <div
                                            key={idx}
                                            className={`${category.color} ${category.textColor} rounded px-1 py-0.5 text-[7px] font-extrabold w-full text-center truncate leading-tight`}
                                        >
                                            {category.name}
                                        </div>
                                    );
                                })}
                                {subjectIds.length > 3 && (
                                    <div className="text-[8px] text-gray-400 font-bold w-full text-center">+{subjectIds.length - 3}</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
