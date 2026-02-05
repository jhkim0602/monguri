import { useState, useEffect } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import { MENTOR_TASKS, WEEKLY_SCHEDULE } from "@/constants/mentee";

interface HomeProgressProps {
    animatedProgress: number;
    selectedDate: Date;
    onDateChange: (date: Date) => void;
}

export default function HomeProgress({ animatedProgress, selectedDate, onDateChange }: HomeProgressProps) {
    const [dailyTasks, setDailyTasks] = useState<any[]>([]);
    const [progressData, setProgressData] = useState<Record<string, number>>({
        korean: 0,
        math: 0,
        english: 0
    });

    const SUBJECTS = [
        { id: 'korean', name: '국어', color: 'text-emerald-500', bg: 'bg-emerald-500', ring: 'border-emerald-100' },
        { id: 'math', name: '수학', color: 'text-blue-500', bg: 'bg-blue-500', ring: 'border-blue-100' },
        { id: 'english', name: '영어', color: 'text-purple-500', bg: 'bg-purple-500', ring: 'border-purple-100' },
    ];

    useEffect(() => {
        // Find schedule for selected date
        const schedule = WEEKLY_SCHEDULE.find(s =>
            s.date.getDate() === selectedDate.getDate() &&
            s.date.getMonth() === selectedDate.getMonth() &&
            s.date.getFullYear() === selectedDate.getFullYear()
        );

        if (schedule) {
            // Filter only mentor tasks
            const mentorEvents = schedule.events.filter(e => e.taskType === 'mentor');

            // Enrich with full task details from MENTOR_TASKS
            const tasks = mentorEvents.map(event => {
                const fullTask = MENTOR_TASKS.find(t => t.id === event.id);
                return fullTask || {
                    id: event.id,
                    title: event.title,
                    subject: '과목', // Fallback
                    badgeColor: 'bg-gray-100 text-gray-600',
                    status: 'pending'
                };
            });
            setDailyTasks(tasks);
        } else {
            setDailyTasks([]);
        }
    }, [selectedDate]);

    useEffect(() => {
        // Calculate real progress from MENTOR_TASKS for the charts
        const stats: Record<string, { total: number; completed: number }> = {
            korean: { total: 0, completed: 0 },
            math: { total: 0, completed: 0 },
            english: { total: 0, completed: 0 }
        };

        MENTOR_TASKS.forEach(task => {
            const key = task.categoryId;
            if (stats[key]) {
                stats[key].total++;
                if (task.status !== 'pending') {
                    stats[key].completed++;
                }
            }
        });

        const newProgress = {
            korean: stats.korean.total ? Math.round((stats.korean.completed / stats.korean.total) * 100) : 0,
            math: stats.math.total ? Math.round((stats.math.completed / stats.math.total) * 100) : 0,
            english: stats.english.total ? Math.round((stats.english.completed / stats.english.total) * 100) : 0,
        };

        setProgressData(newProgress);
    }, []);

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

    const formatDate = (date: Date) => {
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        return `${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`;
    };

    // Helper for Donut Chart (SVG)
    const renderDonut = (percentage: number, colorClass: string) => {
        const radius = 14;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;

        return (
            <div className="relative w-10 h-10 flex items-center justify-center">
                <svg className="transform -rotate-90 w-full h-full">
                    {/* Background Circle */}
                    <circle
                        cx="20"
                        cy="20"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="transparent"
                        className="text-gray-100"
                    />
                    {/* Progress Circle */}
                    <circle
                        cx="20"
                        cy="20"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className={`${colorClass} transition-all duration-1000 ease-out`}
                    />
                </svg>
                <span className={`absolute text-[9px] font-black ${colorClass}`}>
                    {percentage}%
                </span>
            </div>
        );
    };

    return (
        <section className="px-6 mb-8">
            <div className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm relative overflow-hidden">
                {/* Header & Date Navigation */}
                <div className="flex items-center justify-between mb-4">
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

                {/* Donut Charts Section (Integrated) */}
                <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-3 mb-5 border border-gray-100/50">
                    {SUBJECTS.map(subject => (
                        <div key={subject.id} className="flex items-center gap-2 px-1">
                            {renderDonut(progressData[subject.id], subject.color)}
                            <div className="flex flex-col">
                                <span className={`text-[10px] font-bold ${subject.color}`}>{subject.name}</span>
                                <span className="text-[9px] font-medium text-gray-400">달성도</span>
                            </div>
                        </div>
                    ))}
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
                                    <span className={`shrink-0 px-2 py-1 rounded text-[10px] font-bold ${task.badgeColor}`}>
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
            </div>
        </section>
    );
}
