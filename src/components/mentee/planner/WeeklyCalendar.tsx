"use client";

import { useRouter } from "next/navigation";
import { DEFAULT_CATEGORIES } from "@/constants/common";
import { MENTOR_TASKS } from "@/constants/mentee";
import { WEEKLY_SCHEDULE } from "@/constants/mentee";

interface WeeklyCalendarProps {
    currentDate: Date;
    onDateSelect: (date: Date) => void;
}

export default function WeeklyCalendar({ currentDate, onDateSelect }: WeeklyCalendarProps) {
    // Get current week dates
    const getWeekDates = () => {
        const today = new Date(currentDate); // Base week on the selected date to allow navigation?
        // Actually, for "Weekly Schedule", we usually want the CURRENT calendar week, not shifting with every click.
        // But for simplicity/demo coherence, let's keep it anchored on the provided date or fixed to a specific week.
        // Let's anchor it to the fixed mock data week (Jan 26 - Feb 5 range) closest to currentDate.

        // For this specific demo, let's just stick to the week containing the selected date.
        const base = new Date(currentDate);
        const dayOfWeek = base.getDay(); // 0 (Sunday) to 6 (Saturday)
        const diff = base.getDate() - dayOfWeek; // Get Sunday

        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(base);
            date.setDate(diff + i);
            weekDates.push(date);
        }
        return weekDates;
    };

    const weekDates = getWeekDates();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

    // Helper to check if two dates are the same day
    const isSameDay = (date1: Date, date2: Date) => {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    };

    // Helper to get meaningful keywords for a day
    const getDailyKeywords = (date: Date) => {
        // 1. Find schedule for this day
        const schedule = WEEKLY_SCHEDULE.find(s => isSameDay(s.date, date));

        // 2. Extract keywords from mentor tasks first, then plan tasks
        // We'll prioritize Mentor Tasks titles
        let keywords: { text: string; color: string }[] = [];

        if (schedule) {
            // Mentor tasks
            const mentorEvents = schedule.events.filter(e => e.taskType === 'mentor');
            mentorEvents.forEach(e => {
                // Find full task to get category color if needed, or use default
                const category = DEFAULT_CATEGORIES.find(c => c.id === e.categoryId) || DEFAULT_CATEGORIES[0];
                keywords.push({
                    text: e.title.split(' ')[0] + ' ' + (e.title.split(' ')[1] || ''), // Grab first 2 words
                    color: `${category.color} ${category.textColor}`
                });
            });

            // If we have space, add user tasks
            if (keywords.length < 3) {
                const userEvents = schedule.events.filter(e => e.taskType !== 'mentor');
                 userEvents.forEach(e => {
                    const category = DEFAULT_CATEGORIES.find(c => c.id === e.categoryId) || DEFAULT_CATEGORIES[0];
                    keywords.push({
                        text: e.title.split(' ')[0], // Grab first word only for user tasks
                        color: `${category.color} ${category.textColor}` // Use unified category colors
                    });
                });
            }
        }
        return keywords;
    };

    return (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-ios">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-800">이번 주 학습 요약</h3>
                <span className="text-xs text-gray-400">
                    {weekDates[0].getMonth() + 1}월 {weekDates[0].getDate()}일 - {weekDates[6].getDate()}일
                </span>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {weekDates.map((date, index) => {
                    const isSelected = isSameDay(date, currentDate);
                    const isSunday = index === 0;
                    const isSaturday = index === 6;
                    const keywords = getDailyKeywords(date);

                    return (
                        <div
                            key={index}
                            onClick={() => onDateSelect(date)}
                            className={`flex flex-col items-center p-1 rounded-lg transition-all cursor-pointer ${isSelected ? 'bg-blue-50 ring-1 ring-blue-100' : 'hover:bg-gray-50'}`}
                        >
                            <span className={`text-[10px] font-medium mb-1 ${isSunday ? 'text-red-400' : isSaturday ? 'text-blue-400' : 'text-gray-400'}`}>
                                {dayNames[index]}
                            </span>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all mb-2 ${isSelected
                                ? 'bg-primary text-white shadow-md'
                                : 'text-gray-700'
                                }`}>
                                {date.getDate()}
                            </div>

                            {/* Keywords List */}
                            <div className="flex flex-col gap-1 w-full min-h-[58px]">
                                {keywords.slice(0, 3).map((k, idx) => (
                                    <div
                                        key={idx}
                                        className={`${k.color} rounded px-1 py-0.5 text-[8px] font-bold w-full text-center truncate leading-tight tracking-tight`}
                                    >
                                        {k.text}
                                    </div>
                                ))}
                                {keywords.length > 3 && (
                                    <div className="text-[8px] text-gray-300 font-bold w-full text-center leading-none">...</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
