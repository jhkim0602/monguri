"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2, MessageCircle, Plus } from "lucide-react";
import { DEFAULT_CATEGORIES } from "@/constants/common";
import TaskDetailModal from "@/components/mentee/planner/TaskDetailModal";
import { formatTime } from "@/utils/timeUtils";
import PlannerCollectionView from "@/components/mentee/calendar/PlannerCollectionView";
import PlannerDetailModal from "@/components/mentee/calendar/PlannerDetailModal";
import Header from "@/components/mentee/layout/Header";
import { supabase } from "@/lib/supabaseClient";
import {
    adaptDailyRecordsToUi,
    adaptMentorTasksToUi,
    adaptPlanEventsToUi,
    adaptPlannerTasksToUi,
    type DailyRecordLike,
    type MentorTaskLike,
    type PlannerTaskLike,
    type ScheduleEventLike
} from "@/lib/menteeAdapters";

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPlannerModalOpen, setIsPlannerModalOpen] = useState(false);

    const [mentorTasks, setMentorTasks] = useState<MentorTaskLike[]>([]);
    const [plannerTasks, setPlannerTasks] = useState<PlannerTaskLike[]>([]);
    const [planEvents, setPlanEvents] = useState<ScheduleEventLike[]>([]);
    const [dailyRecords, setDailyRecords] = useState<DailyRecordLike[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const hasLoadedRef = useRef(false);

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

    const toDateString = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getMonthRange = (date: Date) => {
        const fromDate = new Date(date.getFullYear(), date.getMonth(), 1);
        const toDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return {
            from: toDateString(fromDate),
            to: toDateString(toDate),
        };
    };

    const getDailyRecord = (day: number | Date) => {
        const targetDate = typeof day === 'number'
            ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            : day;
        return dailyRecords.find(r => r.date && isSameDay(r.date, targetDate));
    };

    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            if (!hasLoadedRef.current) {
                setIsLoading(true);
            }
            try {
                const { data } = await supabase.auth.getUser();
                const user = data?.user;
                if (!user) return;

                const { from, to } = getMonthRange(currentDate);

                const [mentorRes, plannerRes, overviewRes] = await Promise.all([
                    fetch(`/api/mentee/tasks?menteeId=${user.id}`),
                    fetch(`/api/mentee/planner/tasks?menteeId=${user.id}&from=${from}&to=${to}`),
                    fetch(`/api/mentee/planner/overview?menteeId=${user.id}&from=${from}&to=${to}`)
                ]);

                if (mentorRes.ok) {
                    const mentorJson = await mentorRes.json();
                    if (isMounted && Array.isArray(mentorJson.tasks)) {
                        setMentorTasks(adaptMentorTasksToUi(mentorJson.tasks));
                    }
                }

                if (plannerRes.ok) {
                    const plannerJson = await plannerRes.json();
                    if (isMounted && Array.isArray(plannerJson.tasks)) {
                        setPlannerTasks(adaptPlannerTasksToUi(plannerJson.tasks));
                    }
                }

                if (overviewRes.ok) {
                    const overviewJson = await overviewRes.json();
                    if (isMounted) {
                        setPlanEvents(adaptPlanEventsToUi(overviewJson.scheduleEvents ?? []));
                        setDailyRecords(adaptDailyRecordsToUi(overviewJson.dailyRecords ?? []));
                    }
                }
            } finally {
                if (isMounted && !hasLoadedRef.current) {
                    setIsLoading(false);
                    hasLoadedRef.current = true;
                }
            }
        };

        load();

        return () => {
            isMounted = false;
        };
    }, [currentDate]);

    const scheduleEvents = useMemo<ScheduleEventLike[]>(() => {
        const events: ScheduleEventLike[] = [];

        mentorTasks.forEach((task) => {
            if (!task.deadline) return;
            events.push({
                id: String(task.id),
                title: task.title,
                date: task.deadline,
                categoryId: task.categoryId,
                taskType: "mentor",
            });
        });

        plannerTasks.forEach((task) => {
            if (!task.deadline) return;
            events.push({
                id: String(task.id),
                title: task.title,
                date: task.deadline,
                categoryId: task.categoryId,
                taskType: "user",
            });
        });

        planEvents.forEach((event) => {
            if (!event.date) return;
            events.push(event);
        });

        return events;
    }, [mentorTasks, plannerTasks, planEvents]);


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

    // Derived State for Planner Detail Modal
    // We need to pass data for the SELECTED date to the modal
    const selectedDailyRecord = selectedDate ? getDailyRecord(selectedDate) : null;
    const selectedMentorDeadlines = selectedDate
        ? mentorTasks.filter(t => t.deadline && isSameDay(t.deadline, selectedDate))
        : [];
    const selectedDailyEvents = selectedDate
        ? scheduleEvents.filter(e => e.date && isSameDay(e.date, selectedDate))
        : [];

    // selectedPlannerTasks are passed as raw to Modal, Modal filters them.
    // Or we could pass filtered. The Modal expects raw `plannerTasks` per my previous file edit.

    const selectedDateEvents = selectedDate
        ? scheduleEvents.filter(e => e.date && isSameDay(e.date, selectedDate))
        : [];

    // Generate month calendar grid
    const calendarDays = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
    }

    if (isLoading) {
        return <div className="min-h-screen bg-gray-50" />;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            {/* Header */}
            <Header
                title="인사이트 캘린더"
                variant="clean"
                rightElement={
                    <button
                        onClick={() => alert("Coming soon!")}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full transition-all duration-300 shadow-md hover:shadow-primary/20 hover:scale-105 active:scale-95"
                    >
                        <Plus size={16} strokeWidth={3} />
                        <span className="text-sm font-bold">추가</span>
                    </button>
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
                    /* Monthly Grid (Keywords) */
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

                                const dayEvents = scheduleEvents.filter(
                                    (event) => event.date && isSameDay(event.date, targetDate)
                                );
                                let keywords: { text: string; colorHex: string; textColorHex: string }[] = [];

                                if (dayEvents.length > 0) {
                                    const mentorEvents = dayEvents.filter(e => e.taskType === 'mentor');
                                    mentorEvents.forEach(e => {
                                        const category = DEFAULT_CATEGORIES.find(c => c.id === e.categoryId) || DEFAULT_CATEGORIES[0];
                                        keywords.push({
                                            text: e.title.split(' ')[0] + ' ' + (e.title.split(' ')[1] || ''),
                                            colorHex: category.colorHex,
                                            textColorHex: category.textColorHex
                                        });
                                    });

                                    if (keywords.length < 3) {
                                        const userEvents = dayEvents.filter(e => e.taskType !== 'mentor');
                                        userEvents.forEach(e => {
                                            const category = DEFAULT_CATEGORIES.find(c => c.id === e.categoryId) || DEFAULT_CATEGORIES[0];
                                            keywords.push({
                                                text: e.title.split(' ')[0],
                                                colorHex: category.colorHex,
                                                textColorHex: category.textColorHex
                                            });
                                        });
                                    }
                                }

                                return (
                                    <button
                                        key={day}
                                        onClick={() => handleDateClick(day)}
                                        className={`rounded-xl flex flex-col items-center justify-start p-1 min-h-[90px] transition-all relative border overflow-hidden
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

                                        {/* Keywords List */}
                                        <div className="flex flex-col gap-1 w-full flex-1">
                                            {keywords.slice(0, 3).map((k, idx) => (
                                                <div
                                                    key={idx}
                                                    className="rounded px-1 py-0.5 text-[8px] font-bold w-full text-center truncate leading-tight tracking-tight"
                                                    style={{ backgroundColor: k.colorHex, color: k.textColorHex }}
                                                >
                                                    {k.text}
                                                </div>
                                            ))}
                                            {keywords.length > 3 && (
                                                <div className="text-[8px] text-gray-300 font-bold w-full text-center leading-none">...</div>
                                            )}
                                        </div>
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
                        scheduleEvents={scheduleEvents}
                        dailyRecords={dailyRecords}
                        mentorTasks={mentorTasks}
                        plannerTasks={plannerTasks}
                    />
                )}



                {/* Selected Date Details (Only visible in Month view for now) */}
                {viewMode === 'month' && selectedDate && (
                    <div className="mt-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between items-baseline mb-2">
                                <h3 className="text-lg font-bold text-gray-800">
                                    {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 자세히보기
                                </h3>
                                <div className="flex items-center gap-1.5 text-primary">
                                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Study Time</span>
                                    <span className="text-lg tabular-nums font-bold">
                                        {formatTime(getDailyRecord(selectedDate)?.studyTime || 0)}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
                                <h4 className="text-[17px] font-black text-gray-900 mb-6 flex items-center gap-2 tracking-tight">
                                    <div className="w-1.5 h-4 bg-primary rounded-full" />
                                    오늘의 학습 계획
                                </h4>
                                <div className="space-y-6">
                                    {DEFAULT_CATEGORIES.map(category => {
                                        const eventsInCategory = selectedDateEvents.filter(e => e.categoryId === category.id);
                                        if (eventsInCategory.length === 0) return null;

                                        return (
                                            <div key={category.id} className="space-y-4">
                                                <div className="flex items-center gap-2 px-1">
                                                    <div
                                                        className="w-1.5 h-3 rounded-full"
                                                        style={{ backgroundColor: category.colorHex }}
                                                    />
                                                    <span
                                                        className="text-[10px] font-bold"
                                                        style={{ color: category.textColorHex }}
                                                    >
                                                        {category.name}
                                                    </span>
                                                </div>
                                                <div className="space-y-3.5">
                                                    {eventsInCategory.map((event, idx) => {
                                                        // 🔍 Resolve full task details
                                                        let fullTask: any = null;
                                                        if (event.taskType === 'mentor') {
                                                            fullTask = mentorTasks.find(t => String(t.id) === String(event.id));
                                                        } else if (event.taskType === 'user') {
                                                            fullTask = plannerTasks.find(t => String(t.id) === String(event.id));
                                                        }

                                                        const isMentorTask = event.taskType === 'mentor';
                                                        const isSubmitted = fullTask?.status === 'submitted' || fullTask?.status === 'feedback_completed' || !!fullTask?.studyRecord;
                                                        const isCompleted = isMentorTask ? isSubmitted : (!!fullTask?.completed || isSubmitted);
                                                        const hasFeedback = fullTask?.hasMentorResponse || (fullTask?.mentorFeedback && fullTask?.mentorFeedback.length > 0);

                                                        return (
                                                            <div
                                                                key={idx}
                                                                onClick={() => fullTask && openTaskDetail(fullTask)}
                                                                className={`group relative p-5 rounded-[24px] transition-all duration-300 border cursor-pointer
                                                                    ${isCompleted
                                                                        ? 'bg-gray-50/50 border-gray-50'
                                                                        : 'bg-white border-gray-50 shadow-sm hover:border-gray-200 hover:shadow-md'
                                                                    }`}
                                                            >
                                                                <div className="flex items-start gap-3.5">
                                                                    <div
                                                                        className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors mt-0.5 ${isCompleted
                                                                            ? 'shadow-sm'
                                                                            : 'border-gray-200'
                                                                            }`}
                                                                        style={
                                                                            isCompleted
                                                                                ? { backgroundColor: category.colorHex, borderColor: category.colorHex }
                                                                                : undefined
                                                                        }
                                                                    >
                                                                        {isCompleted && <CheckCircle2 size={12} strokeWidth={4} className="text-white" />}
                                                                    </div>

                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                                                                            {isMentorTask && (
                                                                                <span className="bg-primary/10 text-primary text-[9px] font-black px-1.5 py-0.5 rounded leading-none uppercase tracking-tighter">
                                                                                    MENTOR
                                                                                </span>
                                                                            )}
                                                                            {hasFeedback && (
                                                                                <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-1.5 py-0.5 rounded leading-none flex items-center gap-0.5">
                                                                                    <MessageCircle size={8} className="fill-current" />
                                                                                    FEEDBACK
                                                                                </span>
                                                                            )}
                                                                            <p className={`text-[14.5px] font-bold truncate transition-colors leading-relaxed tracking-[0.01em] ${isCompleted ? 'text-gray-300 line-through' : 'text-gray-900'}`}>
                                                                                {event.title}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    {!isCompleted && fullTask && (
                                                                        <div className="text-gray-300 group-hover:text-primary transition-colors mt-0.5">
                                                                            <ChevronRight size={18} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* Modals */}
            <PlannerDetailModal
                isOpen={isPlannerModalOpen}
                onClose={() => setIsPlannerModalOpen(false)}
                date={selectedDate} // Pass selected date
                dailyRecord={selectedDailyRecord}
                mentorDeadlines={selectedMentorDeadlines}
                dailyEvents={selectedDailyEvents}
                plannerTasks={plannerTasks}
                onTaskClick={(task) => {
                    setIsPlannerModalOpen(false);
                    openTaskDetail(task);
                }}
            />

            {selectedTask && (
                <TaskDetailModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    task={selectedTask}
                />
            )}
        </div>
    );
}
