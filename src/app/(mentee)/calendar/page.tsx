"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { DEFAULT_CATEGORIES } from "@/constants/common";
import { DAILY_RECORDS, WEEKLY_SCHEDULE, MENTOR_TASKS } from "@/constants/mentee";
import TaskDetailModal from "@/components/mentee/planner/TaskDetailModal";
import { formatTime } from "@/utils/timeUtils";
import MonguriSticker from "@/components/common/MonguriSticker";
import PlannerCollectionView from "@/components/mentee/calendar/PlannerCollectionView";
import PlannerDetailModal from "@/components/mentee/calendar/PlannerDetailModal";
import Header from "@/components/mentee/layout/Header";

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPlannerModalOpen, setIsPlannerModalOpen] = useState(false);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek };
    };

    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
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

    const getDailyRecord = (day: number | Date) => {
        const targetDate = typeof day === 'number'
            ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            : day;
        return DAILY_RECORDS.find(r => isSameDay(r.date, targetDate));
    };

    const previousPeriod = () => {
        if (viewMode === 'month') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        } else {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        }
        setSelectedDate(null);
    };

    const nextPeriod = () => {
        if (viewMode === 'month') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        } else {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        }
        setSelectedDate(null);
    };

    const handleDateClick = (day: number | Date) => {
        const date = typeof day === 'number'
            ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            : day;

        setSelectedDate(date);

        // If in Planner Collection View, open the detail modal
        if (viewMode === 'week') {
            setIsPlannerModalOpen(true);
        }
    };

    const openTaskDetail = (task: any) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const currentStreak = 12;

    // Generate month calendar grid
    const calendarDays = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            {/* Header */}
            <Header
                title="인사이트 캘린더"
                variant="clean"
                rightElement={
                    <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
                        <Flame size={16} className="text-orange-500 fill-orange-500" />
                        <span className="text-xs font-bold text-orange-600">{currentStreak}일 연속 학습 중!</span>
                    </div>
                }
            />

            <div className="px-6 py-4">
                {/* View Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-xl w-full">
                    <button
                        onClick={() => setViewMode('month')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                    >
                        월간
                    </button>
                    <button
                        onClick={() => setViewMode('week')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                    >
                        플래너 모아보기
                    </button>
                </div>
            </div>

            {/* Content */}
            <section className="px-6 py-2">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={previousPeriod} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                        <ChevronLeft size={24} className="text-gray-600" />
                    </button>
                    <div className="flex flex-col items-center">
                        <h2 className="text-2xl font-bold">
                            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                            {viewMode === 'week' && <span className="text-sm font-normal text-gray-400 ml-2">플래너 모아보기</span>}
                        </h2>
                    </div>
                    <button onClick={nextPeriod} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                        <ChevronRight size={24} className="text-gray-600" />
                    </button>
                </div>

                {viewMode === 'month' ? (
                    /* Monthly Grid (Sticker Book) */
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                        <div className="grid grid-cols-7 gap-2 mb-4">
                            {dayNames.map((day, index) => (
                                <div key={day} className="text-center">
                                    <span className={`text-xs font-bold ${index === 0 ? 'text-red-400' : index === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
                                        {day}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((day, index) => {
                                if (day === null) return <div key={`empty-${index}`} className="min-h-[90px]" />;

                                const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                                const isTodayDate = isToday(targetDate);
                                const isSelected = selectedDate && isSameDay(selectedDate, targetDate);

                                const dailyEvents = WEEKLY_SCHEDULE.find(s => isSameDay(s.date, targetDate))?.events || [];
                                const mentorDeadlines = MENTOR_TASKS.filter(t => t.deadline && isSameDay(t.deadline, targetDate));
                                const hasActivity = dailyEvents.length > 0 || mentorDeadlines.length > 0;
                                const randomOpacity = hasActivity ? Math.random() * 0.7 + 0.3 : 0;
                                const randomRotate = (index % 3 - 1) * 10;

                                return (
                                    <button
                                        key={day}
                                        onClick={() => handleDateClick(day)}
                                        className={`rounded-xl flex flex-col items-center justify-start p-1.5 min-h-[90px] transition-all relative border overflow-hidden
                                            ${isSelected ? 'border-primary bg-blue-50/10 ring-1 ring-primary' : 'border-transparent hover:bg-gray-50'}
                                            ${isTodayDate ? 'bg-gray-50' : ''}
                                        `}
                                    >
                                        <div className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1 z-10 ${isTodayDate ? 'bg-primary text-white' :
                                            index % 7 === 0 ? 'text-red-400' :
                                                index % 7 === 6 ? 'text-blue-400' : 'text-gray-700'
                                            }`}>
                                            {day}
                                        </div>

                                        {hasActivity && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80 mt-2">
                                                <MonguriSticker
                                                    opacity={randomOpacity}
                                                    className="w-12 h-12"
                                                    rotate={randomRotate}
                                                />
                                            </div>
                                        )}

                                        {!hasActivity && (
                                            <div className="w-full h-full flex items-center justify-center opacity-10">
                                                <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    /* Planner Collection View (Vertical Scroll 3-Column Grid) */
                    <PlannerCollectionView
                        currentDate={currentDate}
                        daysInMonth={daysInMonth}
                        isToday={isToday}
                        isSameDay={isSameDay}
                        onDateClick={handleDateClick}
                    />
                )}

                {/* Selected Date Details (Only visible in Month view for now) */}
                {viewMode === 'month' && selectedDate && (
                    <div className="mt-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between items-baseline mb-2">
                                <h3 className="text-lg font-bold text-gray-800">
                                    {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 기록
                                </h3>
                                <div className="flex items-center gap-1.5 text-primary">
                                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Study Time</span>
                                    <span className="text-lg tabular-nums font-bold">
                                        {formatTime(getDailyRecord(selectedDate)?.studyTime || 0)}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                                <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-primary rounded-full" />
                                    오늘의 학습 계획
                                </h4>
                                <div className="space-y-4">
                                    {DEFAULT_CATEGORIES.map(category => {
                                        const eventsInCategory = WEEKLY_SCHEDULE.find(s => selectedDate && isSameDay(s.date, selectedDate))?.events.filter(e => e.categoryId === category.id) || [];
                                        if (eventsInCategory.length === 0) return null;

                                        return (
                                            <div key={category.id} className="space-y-2">
                                                <div className="flex items-center gap-2 px-1">
                                                    <div className={`w-1.5 h-3 rounded-full ${category.color}`} />
                                                    <span className={`text-[10px] font-bold ${category.textColor}`}>{category.name}</span>
                                                </div>
                                                <div className="space-y-2">
                                                    {eventsInCategory.map((event, idx) => (
                                                        <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-gray-50 bg-gray-50/50">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-bold text-gray-800 truncate">{event.title}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {!WEEKLY_SCHEDULE.find(s => selectedDate && isSameDay(s.date, selectedDate))?.events.length && (
                                        <p className="text-center text-xs text-gray-400 py-4">등록된 학습 계획이 없습니다.</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                                <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-purple-500 rounded-full" />
                                    멘토 피드백
                                </h4>
                                <div className="space-y-6">
                                    {DEFAULT_CATEGORIES.map(category => {
                                        const feedbackInCategory = MENTOR_TASKS.filter(t => t.deadline && selectedDate && isSameDay(t.deadline, selectedDate) && t.categoryId === category.id);
                                        if (feedbackInCategory.length === 0) return null;

                                        return (
                                            <div key={category.id} className="space-y-3">
                                                <div className="flex items-center gap-2 px-1">
                                                    <div className={`w-1.5 h-3 rounded-full ${category.color}`} />
                                                    <span className={`text-[10px] font-bold ${category.textColor}`}>{category.name}</span>
                                                </div>
                                                <div className="space-y-3">
                                                    {feedbackInCategory.map(task => (
                                                        <div
                                                            key={task.id}
                                                            onClick={() => openTaskDetail(task)}
                                                            className="bg-purple-50/30 rounded-2xl p-4 border border-purple-50 cursor-pointer hover:bg-purple-50/50 transition-colors shadow-sm"
                                                        >
                                                            <div className="flex items-center justify-between mb-2">
                                                                <p className="text-xs font-bold text-purple-600">{task.title}</p>
                                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${task.badgeColor}`}>
                                                                    {task.status === 'feedback_completed' ? '피드백 완료' : task.status === 'submitted' ? '제출 완료' : '진행 중'}
                                                                </span>
                                                            </div>
                                                            <div className="p-3 bg-white rounded-xl border border-purple-100 text-[13px] text-gray-700 leading-relaxed italic">
                                                                "{task.mentorFeedback || "아직 피드백이 등록되지 않았습니다."}"
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {MENTOR_TASKS.filter(t => t.deadline && selectedDate && isSameDay(t.deadline, selectedDate)).length === 0 && (
                                        <p className="text-center text-xs text-gray-400 py-4">해당 날짜에 등록된 멘토 태스크가 없습니다.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            <TaskDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                task={selectedTask}
            />

            {/* Daily Planner Detail Modal */}
            <PlannerDetailModal
                isOpen={isPlannerModalOpen}
                onClose={() => setIsPlannerModalOpen(false)}
                date={selectedDate}
                dailyRecord={selectedDate ? getDailyRecord(selectedDate) : null}
                mentorDeadlines={selectedDate ? MENTOR_TASKS.filter(t => t.deadline && isSameDay(t.deadline, selectedDate)) : []}
                dailyEvents={(selectedDate) ? (WEEKLY_SCHEDULE.find(s => selectedDate && isSameDay(s.date, selectedDate))?.events || []) : []}
            />

        </div>
    );
}
