import { useState, useEffect } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import type { MentorTaskLike, ScheduleEventLike } from "@/lib/menteeAdapters";

interface HomeProgressProps {
    animatedProgress: number;
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    mentorTasks?: MentorTaskLike[];
    scheduleEvents?: ScheduleEventLike[];
}

export default function HomeProgress({
    animatedProgress,
    selectedDate,
    onDateChange,
    mentorTasks = [],
    scheduleEvents
}: HomeProgressProps) {
    const [dailyTasks, setDailyTasks] = useState<any[]>([]);
    const isSameDay = (date1: Date, date2: Date) => {
        return (
            date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear()
        );
    };

    useEffect(() => {
        const eventsForDate = (scheduleEvents ?? []).filter(
            (event) =>
                event.date &&
                event.date.getDate() === selectedDate.getDate() &&
                event.date.getMonth() === selectedDate.getMonth() &&
                event.date.getFullYear() === selectedDate.getFullYear()
        );

        if (eventsForDate.length > 0) {
            const mentorEvents = eventsForDate.filter(
                (event) => event.taskType === "mentor"
            );

            const tasks = mentorEvents.map((event) => {
                const fullTask =
                    mentorTasks.find((task) => String(task.id) === String(event.id)) ||
                    mentorTasks.find(
                        (task) =>
                            task.title === event.title &&
                            task.deadline &&
                            isSameDay(task.deadline, event.date ?? selectedDate)
                    );
                return (
                    fullTask || {
                        id: event.id,
                        title: event.title,
                        subject: "과목",
                        badgeColor: { bg: "#F3F4F6", text: "#4B5563" },
                        status: "pending",
                    }
                );
            });
            setDailyTasks(tasks);
        } else {
            setDailyTasks([]);
        }
    }, [selectedDate, mentorTasks, scheduleEvents]);

    const handlePrevDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() - 1);
        onDateChange(newDate);
    };

    const handleNextDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + 1);
        onDateChange(newDate);
    };

    const handleToday = () => {
        onDateChange(new Date(2026, 1, 2)); // Reset to demo today
    };

    const formatDate = (date: Date) => {
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        return `${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`;
    };

    const isToday = (date: Date) => {
        const today = new Date(2026, 1, 2); // Demo context today
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    };

    return (
        <section className="px-6 mb-8">
            <div className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm relative overflow-hidden">
                {/* Header & Date Navigation */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-1">Daily Focus</p>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                             {formatDate(selectedDate)}
                        </h3>
                    </div>
                   <div className="flex items-center gap-1 bg-gray-50 rounded-full p-1">
                        <button onClick={handlePrevDay} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-400 shadow-sm hover:text-gray-800 active:scale-95 transition-all">
                            <ChevronLeft size={18} />
                        </button>
                        <button onClick={handleNextDay} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-400 shadow-sm hover:text-gray-800 active:scale-95 transition-all">
                            <ChevronRight size={18} />
                        </button>
                   </div>
                </div>

                {/* Daily Tasks List */}
                <div>
                    {dailyTasks.length > 0 ? (
                        <div className="space-y-3">
                            {dailyTasks.map((task) => (
                                <Link
                                    href={`/planner/${task.id}`}
                                    key={task.id}
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100/50 hover:bg-gray-100 transition-colors cursor-pointer"
                                >
                                    <span
                                        className="shrink-0 px-2 py-1 rounded text-[10px] font-bold"
                                        style={{ backgroundColor: task.badgeColor?.bg, color: task.badgeColor?.text }}
                                    >
                                        {task.subject}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-800 truncate">
                                            {task.title}
                                        </p>
                                        <p className="text-[10px] text-gray-400 truncate">
                                            {task.description || "할 일 상세 내용"}
                                        </p>
                                    </div>
                                    <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${task.status !== 'pending' ? 'bg-blue-100 border-blue-200 text-blue-500' : 'border-gray-200 bg-white'}`}>
                                        {task.status !== 'pending' && <CheckCircle2 size={14} />}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-400">
                                <CalendarIcon size={20} />
                            </div>
                            <p className="text-xs text-gray-400 font-medium">이 날은 예정된 멘토 과제가 없어요.</p>
                        </div>
                    )}
                </div>

                {/* Progress Summary for the Day */}
                 {dailyTasks.length > 0 && (
                     <div className="mt-4 flex justify-between items-center px-2">
                        <span className="text-[10px] font-bold text-gray-400">
                            총 {dailyTasks.length}개 중 {dailyTasks.filter(t => t.status !== 'pending').length}개 완료
                        </span>
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                             <div
                                className="h-full bg-primary rounded-full transition-all duration-300"
                                style={{ width: `${(dailyTasks.filter(t => t.status !== 'pending').length / dailyTasks.length) * 100}%` }}
                             />
                        </div>
                     </div>
                 )}
            </div>
        </section>
    );
}
