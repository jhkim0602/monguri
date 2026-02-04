"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2, MessageCircle, Plus, X, Repeat } from "lucide-react";
import { DEFAULT_CATEGORIES } from "@/constants/common";
import { DAILY_RECORDS, WEEKLY_SCHEDULE, MENTOR_TASKS, USER_TASKS } from "@/constants/mentee";
import TaskDetailModal from "@/components/mentee/planner/TaskDetailModal";
import { formatTime } from "@/utils/timeUtils";
import PlannerCollectionView from "@/components/mentee/calendar/PlannerCollectionView";
import PlannerDetailModal from "@/components/mentee/calendar/PlannerDetailModal";
import Header from "@/components/mentee/layout/Header";

type MeetingStatus = "requested" | "scheduled" | "completed";

type MeetingRecord = {
    id: string;
    topic: string;
    requestedAt: Date;
    scheduledAt?: Date;
    status: MeetingStatus;
    zoomLink?: string;
    taskId?: string | number;
    taskTitle?: string;
    preferredTime?: string;
    note?: string;
};

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPlannerModalOpen, setIsPlannerModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [meetingRecords, setMeetingRecords] = useState<MeetingRecord[]>([]);

    const [customEvents, setCustomEvents] = useState<
        { id: string; title: string; categoryId: string; taskType: string; date: string }[]
    >([]);
    const [eventTitle, setEventTitle] = useState("");
    const [eventCategoryId, setEventCategoryId] = useState(DEFAULT_CATEGORIES[0].id);
    const [eventDate, setEventDate] = useState("");
    const [recurrenceType, setRecurrenceType] = useState<'none' | 'weekly' | 'biweekly' | 'monthly'>('none');
    const [repeatDays, setRepeatDays] = useState<number[]>([1]);
    const [repeatStart, setRepeatStart] = useState("");
    const [repeatEnd, setRepeatEnd] = useState("");
    const [monthlyDay, setMonthlyDay] = useState(1);

    const EVENTS_STORAGE_KEY = "mentee-calendar-events";
    const MEETING_STORAGE_KEY = "mentor-meeting-records";

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

    const pad2 = (value: number) => String(value).padStart(2, "0");
    const formatDateInput = (date: Date) =>
        `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
    const parseDateInput = (value: string) => {
        const [year, month, day] = value.split("-").map(Number);
        return new Date(year, month - 1, day);
    };
    const addDays = (date: Date, days: number) =>
        new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
    const parseMeetingRecord = (record: any): MeetingRecord => ({
        ...record,
        requestedAt: record.requestedAt ? new Date(record.requestedAt) : new Date(),
        scheduledAt: record.scheduledAt ? new Date(record.scheduledAt) : undefined,
    });

    useEffect(() => {
        const todayDate = new Date();
        const baseDate = selectedDate || todayDate;
        const baseValue = formatDateInput(baseDate);
        setEventDate(baseValue);
        setRepeatStart(baseValue);
        setRepeatEnd(formatDateInput(addDays(baseDate, 28)));
        setMonthlyDay(baseDate.getDate());
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const raw = localStorage.getItem(MEETING_STORAGE_KEY);
        if (!raw) return;
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                setMeetingRecords(parsed.map(parseMeetingRecord));
            }
        } catch {
            setMeetingRecords([]);
        }
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
        if (raw) {
            try {
                setCustomEvents(JSON.parse(raw));
            } catch {
                setCustomEvents([]);
            }
        }
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(customEvents));
    }, [customEvents]);

    const getCustomEventsForDate = (date: Date) => {
        return customEvents
            .filter((event) => isSameDay(parseDateInput(event.date), date))
            .map((event) => ({
                id: event.id,
                title: event.title,
                categoryId: event.categoryId,
                taskType: event.taskType || "plan",
                isCustom: true,
            }));
    };

    const getPlannerTasksForDate = (date: Date) => {
        if (typeof window === "undefined") return null;
        const raw = localStorage.getItem("planner-day-tasks");
        if (!raw) return null;
        try {
            const data = JSON.parse(raw) as Record<string, any[]>;
            const key = formatDateInput(date);
            const tasks = data[key];
            return Array.isArray(tasks) ? tasks : null;
        } catch {
            return null;
        }
    };

    const getDailyEvents = (date: Date) => {
        const plannerTasks = getPlannerTasksForDate(date);
        if (plannerTasks && plannerTasks.length > 0) {
            return plannerTasks.map((task) => ({
                id: task.id,
                title: task.title,
                categoryId: task.categoryId,
                taskType: task.isMentorTask ? "mentor" : "user",
            }));
        }
        const schedule = WEEKLY_SCHEDULE.find(s => isSameDay(s.date, date));
        const baseEvents = schedule ? schedule.events : [];
        return [...baseEvents, ...getCustomEventsForDate(date)];
    };

    const getDailyRecord = (day: number | Date) => {
        const targetDate = typeof day === 'number'
            ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            : day;
        return DAILY_RECORDS.find(r => isSameDay(r.date, targetDate));
    };

    const meetingDateSet = new Set(
        meetingRecords
            .filter((record) => record.scheduledAt && (record.status === "scheduled" || record.status === "completed"))
            .map((record) => formatDateInput(record.scheduledAt as Date))
    );
    const isMeetingDay = (date: Date) => meetingDateSet.has(formatDateInput(date));

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

    const openAddModal = (date?: Date) => {
        const baseDate = date || selectedDate || new Date();
        const baseValue = formatDateInput(baseDate);
        setEventTitle("");
        setEventCategoryId(DEFAULT_CATEGORIES[0].id);
        setEventDate(baseValue);
        setRepeatStart(baseValue);
        setRepeatEnd(formatDateInput(addDays(baseDate, 28)));
        setRepeatDays([baseDate.getDay()]);
        setRecurrenceType('none');
        setMonthlyDay(baseDate.getDate());
        setIsAddModalOpen(true);
    };

    const getRepeatDates = () => {
        if (!eventDate) return [];
        if (recurrenceType === 'none') return [parseDateInput(eventDate)];
        if (!repeatStart || !repeatEnd) return [];
        const start = parseDateInput(repeatStart);
        const end = parseDateInput(repeatEnd);
        const dates: Date[] = [];
        if (recurrenceType === 'monthly') {
            const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
            const last = new Date(end.getFullYear(), end.getMonth(), 1);
            while (cursor <= last) {
                const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
                if (monthlyDay <= daysInMonth) {
                    const target = new Date(cursor.getFullYear(), cursor.getMonth(), monthlyDay);
                    if (target >= start && target <= end) {
                        dates.push(target);
                    }
                }
                cursor.setMonth(cursor.getMonth() + 1);
            }
            return dates;
        }
        if (repeatDays.length === 0) return [];
        const cursor = new Date(start);
        while (cursor <= end) {
            const diffDays = Math.floor((cursor.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            const weekIndex = Math.floor(diffDays / 7);
            const isActiveWeek = recurrenceType === 'biweekly' ? weekIndex % 2 === 0 : true;
            if (isActiveWeek && repeatDays.includes(cursor.getDay())) {
                dates.push(new Date(cursor));
            }
            cursor.setDate(cursor.getDate() + 1);
        }
        return dates;
    };

    const handleSaveEvent = () => {
        const title = eventTitle.trim();
        const dates = getRepeatDates();
        if (!title || dates.length === 0) return;

        const timestamp = Date.now();
        const newEvents = dates.map((date, idx) => ({
            id: `c-${timestamp}-${idx}`,
            title,
            categoryId: eventCategoryId,
            taskType: "plan",
            date: formatDateInput(date),
        }));

        setCustomEvents((prev) => [...prev, ...newEvents]);
        setIsAddModalOpen(false);
    };

    const currentStreak = 12;

    const selectedPlannerTasks = selectedDate ? getPlannerTasksForDate(selectedDate) : null;
    const mentorDeadlinesForSelected = selectedPlannerTasks && selectedPlannerTasks.length > 0
        ? selectedPlannerTasks.filter((task) => task.isMentorTask)
        : selectedDate
            ? MENTOR_TASKS.filter(t => t.deadline && isSameDay(t.deadline, selectedDate))
            : [];
    const userTasksForSelected = selectedPlannerTasks && selectedPlannerTasks.length > 0
        ? selectedPlannerTasks.filter((task) => !task.isMentorTask)
        : selectedDate
            ? USER_TASKS.filter(t => t.deadline && isSameDay(t.deadline, selectedDate))
            : [];

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
                                const meetingDay = isMeetingDay(targetDate);

                                // Get keywords for the day
                                const dailyEvents = getDailyEvents(targetDate);
                                let keywords: { text: string; color: string }[] = [];

                                const mentorEvents = dailyEvents.filter(e => e.taskType === 'mentor');
                                mentorEvents.forEach(e => {
                                    const category = DEFAULT_CATEGORIES.find(c => c.id === e.categoryId) || DEFAULT_CATEGORIES[0];
                                    keywords.push({
                                        text: e.title.split(' ')[0] + ' ' + (e.title.split(' ')[1] || ''),
                                        color: `${category.color} ${category.textColor}`
                                    });
                                });

                                // User/Plan tasks
                                if (keywords.length < 3) {
                                    const userEvents = dailyEvents.filter(e => e.taskType !== 'mentor');
                                    userEvents.forEach(e => {
                                        const category = DEFAULT_CATEGORIES.find(c => c.id === e.categoryId) || DEFAULT_CATEGORIES[0];
                                        keywords.push({
                                            text: e.title.split(' ')[0],
                                            color: `${category.color} ${category.textColor}` // Unified colors
                                        });
                                    });
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
                                        {meetingDay && (
                                            <div className="absolute top-2 left-2 right-2 h-1 rounded-full bg-amber-300/80" />
                                        )}
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
                                                    className={`${k.color} rounded px-1 py-0.5 text-[8px] font-bold w-full text-center truncate leading-tight tracking-tight`}
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
                        customEvents={customEvents}
                        getPlannerTasksForDate={getPlannerTasksForDate}
                    />
                )}

                {/* Add Task Entry */}
                <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">할 일 추가</h3>
                            <p className="text-[11px] text-gray-400 mt-1">반복 일정까지 캘린더에서 한 번에 생성할 수 있어요.</p>
                        </div>
                        <button
                            onClick={() => openAddModal(selectedDate || new Date())}
                            className="px-3 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold shadow-lg shadow-gray-200 flex items-center gap-1.5"
                        >
                            <Plus size={14} />
                            추가하기
                        </button>
                    </div>
                    <div className="mt-3 bg-blue-50/60 border border-blue-100 rounded-xl px-3 py-2 text-[10px] font-bold text-blue-700">
                        도움말: 반복 일정은 시작~종료 범위 안에서 선택한 요일/날짜에 자동 생성됩니다.
                    </div>
                </div>

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
                            {isMeetingDay(selectedDate) && (
                                <div className="bg-amber-50/70 border border-amber-100 rounded-xl px-4 py-2 text-[11px] font-bold text-amber-700">
                                    도움말: 미팅 있는 날
                                </div>
                            )}

                            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                                <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-primary rounded-full" />
                                    오늘의 학습 계획
                                </h4>
                                <div className="space-y-4">
                                    {DEFAULT_CATEGORIES.map(category => {
                                        const eventsInCategory = selectedDate
                                            ? getDailyEvents(selectedDate).filter(e => e.categoryId === category.id)
                                            : [];
                                        if (eventsInCategory.length === 0) return null;

                                        return (
                                            <div key={category.id} className="space-y-2">
                                                <div className="flex items-center gap-2 px-1">
                                                    <div className={`w-1.5 h-3 rounded-full ${category.color}`} />
                                                    <span className={`text-[10px] font-bold ${category.textColor}`}>{category.name}</span>
                                                </div>
                                                <div className="space-y-2">
                                                    {eventsInCategory.map((event, idx) => {
                                                        // 🔍 Resolve full task details
                                                        let fullTask: any = null;
                                                        if (event.taskType === 'mentor') {
                                                            fullTask = MENTOR_TASKS.find(t => t.id === event.id);
                                                        } else if (event.taskType === 'user') {
                                                            fullTask = USER_TASKS.find(t => t.id === event.id);
                                                        }

                                                        // Default checks if fullTask is found, otherwise fallback to basic event data
                                                        const isMentorTask = event.taskType === 'mentor';
                                                        const isSubmitted = fullTask?.status === 'submitted' || fullTask?.status === 'feedback_completed' || !!fullTask?.studyRecord;
                                                        const isCompleted = isMentorTask ? isSubmitted : (!!fullTask?.completed || isSubmitted);
                                                        const hasFeedback = fullTask?.hasMentorResponse || (fullTask?.mentorFeedback && fullTask?.mentorFeedback.length > 0);

                                                        return (
                                                            <div
                                                                key={idx}
                                                                onClick={() => fullTask && openTaskDetail(fullTask)}
                                                                className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group
                                                                    ${isCompleted
                                                                        ? 'bg-gray-50/50 border-gray-50 text-gray-400'
                                                                        : 'bg-white border-gray-100 hover:border-primary/30 hover:shadow-sm text-gray-900'
                                                                    }`}
                                                            >
                                                                {/* Status Icon */}
                                                                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors
                                                                    ${isCompleted
                                                                        ? `${category.color.replace('bg-', 'border-')} ${category.color}`
                                                                        : 'border-gray-200'
                                                                    }`}>
                                                                    {isCompleted && <CheckCircle2 size={12} strokeWidth={4} className="text-white" />}
                                                                </div>

                                                                <div className="flex-1 min-w-0">
                                                                    {/* Badges Row */}
                                                                    <div className="flex items-center gap-1.5 mb-1">
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
                                                                    </div>

                                                                    <p className={`text-sm font-bold truncate transition-colors ${isCompleted ? 'line-through opacity-80' : ''}`}>
                                                                        {event.title}
                                                                    </p>
                                                                </div>

                                                                {/* Right Arrow (Visual Cue) */}
                                                                {!isCompleted && fullTask && (
                                                                    <div className="text-gray-300 group-hover:text-primary transition-colors">
                                                                        <ChevronRight size={16} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {selectedDate && getDailyEvents(selectedDate).length === 0 && (
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

            {/* Add Task Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center px-6">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsAddModalOpen(false)}
                    />
                    <div className="relative w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="px-6 pt-8 pb-4 flex justify-between items-center border-b border-gray-50">
                            <div>
                                <h3 className="text-lg font-black text-gray-900">캘린더 할 일 추가</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-widest">Planner Style</p>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-6 py-6 space-y-5">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">할 일 제목</label>
                                <input
                                    value={eventTitle}
                                    onChange={(e) => setEventTitle(e.target.value)}
                                    placeholder="예: 모의고사 1회분 풀기"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">과목 선택</label>
                                <div className="flex gap-2 flex-wrap">
                                    {DEFAULT_CATEGORIES.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => setEventCategoryId(category.id)}
                                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all ${
                                                eventCategoryId === category.id
                                                    ? `bg-white border-gray-300 ${category.textColor} shadow-sm`
                                                    : `bg-gray-50 border-gray-100 ${category.textColor}`
                                            }`}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">날짜</label>
                                <input
                                    type="date"
                                    value={eventDate}
                                    onChange={(e) => {
                                        const nextValue = e.target.value;
                                        setEventDate(nextValue);
                                        const nextDate = parseDateInput(nextValue);
                                        setMonthlyDay(nextDate.getDate());
                                        if (recurrenceType === 'none' || !repeatStart || !repeatEnd) {
                                            setRepeatStart(nextValue);
                                            setRepeatEnd(formatDateInput(addDays(nextDate, 28)));
                                        }
                                    }}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <Repeat size={14} /> 반복 설정
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {([
                                        { key: 'none', label: '없음' },
                                        { key: 'weekly', label: '매주' },
                                        { key: 'biweekly', label: '격주' },
                                        { key: 'monthly', label: '매월' },
                                    ] as const).map((option) => {
                                        const isSelected = recurrenceType === option.key;
                                        return (
                                            <button
                                                key={option.key}
                                                onClick={() => setRecurrenceType(option.key)}
                                                className={`h-9 rounded-xl text-[11px] font-black transition-all ${
                                                    isSelected ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {recurrenceType !== 'none' && (
                                <div className="space-y-4">
                                    {(recurrenceType === 'weekly' || recurrenceType === 'biweekly') && (
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">요일 선택</label>
                                            <div className="grid grid-cols-7 gap-2">
                                                {dayNames.map((label, idx) => {
                                                    const isSelected = repeatDays.includes(idx);
                                                    return (
                                                        <button
                                                            key={label}
                                                            onClick={() => {
                                                                setRepeatDays((prev) =>
                                                                    prev.includes(idx)
                                                                        ? prev.filter((d) => d !== idx)
                                                                        : [...prev, idx]
                                                                );
                                                            }}
                                                            className={`h-9 rounded-xl text-[11px] font-black transition-all ${
                                                                isSelected ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"
                                                            }`}
                                                        >
                                                            {label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {recurrenceType === 'monthly' && (
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">매월 날짜</label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={31}
                                                    value={monthlyDay}
                                                    onChange={(e) => setMonthlyDay(Math.min(31, Math.max(1, Number(e.target.value) || 1)))}
                                                    className="w-24 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 text-sm font-black focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                                />
                                                <span className="text-xs font-bold text-gray-500">일</span>
                                                <span className="text-[11px] text-gray-400 font-medium">예: 1, 15, 28</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">시작</label>
                                            <input
                                                type="date"
                                                value={repeatStart}
                                                onChange={(e) => setRepeatStart(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">종료</label>
                                            <input
                                                type="date"
                                                value={repeatEnd}
                                                onChange={(e) => setRepeatEnd(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-blue-50/50 border border-blue-100 rounded-2xl px-4 py-3 text-xs font-bold text-blue-700">
                                        총 {getRepeatDates().length}회 일정이 생성됩니다.
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-bold">
                                        미리보기: {getRepeatDates().slice(0, 5).map(date => `${date.getMonth() + 1}/${date.getDate()}`).join(', ')}
                                        {getRepeatDates().length > 5 ? " ..." : ""}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-6 pb-8 pt-2 flex gap-2">
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="flex-1 h-12 rounded-2xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSaveEvent}
                                className="flex-1 h-12 rounded-2xl bg-gray-900 text-white text-sm font-black hover:bg-black"
                            >
                                일정 생성
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                mentorDeadlines={mentorDeadlinesForSelected}
                userTasks={userTasksForSelected}
                dailyEvents={selectedDate ? getDailyEvents(selectedDate) : []}
            />

        </div>
    );
}
