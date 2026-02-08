"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { DAILY_RECORDS, MENTOR_TASKS, USER_TASKS, PLANNER_FEEDBACKS, WEEKLY_SCHEDULE } from "@/constants/mentee";
import PlannerDetailView from "@/components/mentee/calendar/PlannerDetailView";

const CALENDAR_EVENTS_KEY = "mentee-calendar-events";
const PLANNER_TASKS_KEY = "planner-day-tasks";

const pad2 = (value: number) => String(value).padStart(2, "0");
const formatDateInput = (date: Date) =>
    `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
const parseDateInput = (value: string) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
};
const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear();
};

export default function FeedbackCollectionPage() {
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 2));
    const [customEvents, setCustomEvents] = useState<
        { id: string; title: string; categoryId: string; taskType?: string; date: string; startTime?: string; endTime?: string; isMentorTask?: boolean }[]
    >([]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const raw = localStorage.getItem(CALENDAR_EVENTS_KEY);
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
        const params = new URLSearchParams(window.location.search);
        const dateParam = params.get("date");
        if (!dateParam) return;
        const parsed = parseDateInput(dateParam);
        if (!Number.isNaN(parsed.getTime())) {
            setCurrentDate(parsed);
        }
    }, []);

    const getCustomEventsForDate = (date: Date) => {
        return customEvents
            .filter((event) => isSameDay(parseDateInput(event.date), date))
            .map((event) => ({
                id: event.id,
                title: event.title,
                categoryId: event.categoryId,
                taskType: event.taskType || "plan",
                startTime: event.startTime,
                endTime: event.endTime,
                isMentorTask: event.isMentorTask ?? false,
                isCustom: true
            }));
    };

    const getPlannerTasksForDate = (date: Date) => {
        if (typeof window !== "undefined") {
            const raw = localStorage.getItem(PLANNER_TASKS_KEY);
            if (raw) {
                try {
                    const data = JSON.parse(raw) as Record<string, any[]>;
                    const key = formatDateInput(date);
                    const tasks = data[key];
                    return Array.isArray(tasks) ? tasks : null;
                } catch {
                    return null;
                }
            }
        }
        return null;
    };

    const getPlanTasksFromSchedule = (date: Date) => {
        const schedule = WEEKLY_SCHEDULE.find(s => isSameDay(s.date, date));
        const baseEvents = schedule ? schedule.events : [];
        return baseEvents
            .filter((event) => event.taskType === "plan")
            .map((event) => ({
                id: `plan-${event.id}`,
                title: event.title,
                categoryId: event.categoryId,
                taskType: "plan",
                startTime: "00:00",
                endTime: "00:00",
                isMentorTask: event.taskType === "mentor",
                isCustomEvent: true
            }));
    };

    const resolveTasksForDate = (date: Date) => {
        const plannerTasks = getPlannerTasksForDate(date);
        if (plannerTasks && plannerTasks.length > 0) {
            const mentorTasks = plannerTasks.filter((task) => task.isMentorTask && task.taskType !== "plan");
            const planTasks = plannerTasks.filter((task) => task.taskType === "plan");
            const userTasks = plannerTasks.filter((task) => !task.isMentorTask && task.taskType !== "plan");
            return { mentorTasks, userTasks, planTasks };
        }

        const mentorTasks = MENTOR_TASKS.filter(t => t.deadline && isSameDay(t.deadline, date));
        const userTasks = USER_TASKS.filter(t => t.deadline && isSameDay(t.deadline, date));
        const planTasks = [
            ...getPlanTasksFromSchedule(date),
            ...getCustomEventsForDate(date).map((event) => ({
                id: String(event.id),
                title: event.title,
                categoryId: event.categoryId,
                taskType: "plan",
                startTime: event.startTime,
                endTime: event.endTime,
                isMentorTask: event.isMentorTask ?? false,
                isCustomEvent: true
            }))
        ];
        return { mentorTasks, userTasks, planTasks };
    };

    const getDailyRecord = (date: Date) => DAILY_RECORDS.find(r => isSameDay(r.date, date));

    const plannerFeedback = useMemo(
        () => PLANNER_FEEDBACKS.find((entry) => isSameDay(entry.date, currentDate)),
        [currentDate]
    );

    const selectedTaskSet = useMemo(() => resolveTasksForDate(currentDate), [currentDate, customEvents]);
    const mentorDeadlinesForSelected = selectedTaskSet.mentorTasks;
    const userTasksForSelected = selectedTaskSet.userTasks;
    const dailyEventsForSelected = selectedTaskSet.planTasks;
    const dailyRecordForSelected = getDailyRecord(currentDate);

    const dateLabel = currentDate.toLocaleDateString("ko-KR", {
        month: "long",
        day: "numeric",
        weekday: "short"
    });

    const handlePrevDay = () => {
        const prev = new Date(currentDate);
        prev.setDate(prev.getDate() - 1);
        setCurrentDate(prev);
    };

    const handleNextDay = () => {
        const next = new Date(currentDate);
        next.setDate(next.getDate() + 1);
        setCurrentDate(next);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            <header className="bg-white px-6 safe-top-header-lg pb-5 flex items-center gap-4 border-b border-gray-100/60 sticky top-0 z-10">
                <button
                    type="button"
                    onClick={() => router.push("/mypage")}
                    className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                    aria-label="마이페이지로 돌아가기"
                >
                    <ChevronLeft size={22} />
                </button>
                <div className="flex-1">
                    <h1 className="text-[18px] font-black text-gray-900">피드백 모아보기</h1>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">Planner Feedback Review</p>
                </div>
            </header>

            {/* Date Navigator */}
            <section className="bg-white border-b border-gray-100 px-6 py-3">
                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={handlePrevDay}
                        className="p-2 rounded-full bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                        aria-label="이전 날짜"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <div className="text-[13px] font-black text-gray-900">{dateLabel}</div>
                    <button
                        type="button"
                        onClick={handleNextDay}
                        className="p-2 rounded-full bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                        aria-label="다음 날짜"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </section>

            <section className="px-6 py-6 space-y-6">
                {/* Planner Summary */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-[16px] font-black text-gray-900">완성된 플래너</h2>
                            <p className="text-[11px] text-gray-400 font-medium mt-1">
                                플래너 모아보기의 상세 플래너를 그대로 보여줍니다.
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <PlannerDetailView
                            date={currentDate}
                            dailyRecord={dailyRecordForSelected}
                            mentorDeadlines={mentorDeadlinesForSelected}
                            userTasks={userTasksForSelected}
                            dailyEvents={dailyEventsForSelected}
                            size="page"
                        />
                    </div>
                </div>

                {/* Planner Feedback */}
                <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center">
                                <MessageSquare size={16} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">오늘의 종합 피드백</h3>
                                <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                                    플래너 전체에 대한 멘토 리뷰
                                </p>
                            </div>
                        </div>
                        {plannerFeedback?.mentorName && (
                            <span className="text-[10px] text-gray-400 font-bold">멘토 · {plannerFeedback.mentorName}</span>
                        )}
                    </div>

                    {!plannerFeedback ? (
                        <div className="py-10 text-center text-[12px] text-gray-400 font-medium">
                            아직 종합 피드백이 등록되지 않았습니다.
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                <p className="text-[11px] font-black text-gray-500 mb-1">요약</p>
                                <p className="text-[13px] text-gray-700 font-medium leading-relaxed">
                                    {plannerFeedback.summary}
                                </p>
                            </div>

                            <div>
                                <p className="text-[11px] font-black text-gray-500 mb-2">멘토 코멘트</p>
                                <p className="text-[13px] text-gray-700 font-medium leading-relaxed">
                                    {plannerFeedback.comment}
                                </p>
                            </div>

                            {plannerFeedback.strengths?.length > 0 && (
                                <div>
                                    <p className="text-[11px] font-black text-gray-500 mb-2">잘한 점</p>
                                    <ul className="space-y-2">
                                        {plannerFeedback.strengths.map((item: string, idx: number) => (
                                            <li key={`strength-${idx}`} className="text-[13px] text-gray-700 font-medium flex items-start gap-2">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {plannerFeedback.nextSteps?.length > 0 && (
                                <div>
                                    <p className="text-[11px] font-black text-gray-500 mb-2">다음 액션</p>
                                    <ul className="space-y-2">
                                        {plannerFeedback.nextSteps.map((item: string, idx: number) => (
                                            <li key={`next-${idx}`} className="text-[13px] text-gray-700 font-medium flex items-start gap-2">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-400" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
