"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import TaskRowItem from "./TaskRowItem";

type PlannerCardTask = {
    id: string | number;
    status?: string;
    deadline?: Date | string | null;
    type?: "mentor" | "user";
    [key: string]: unknown;
};

interface DailyPlannerCardProps {
    tasks?: PlannerCardTask[];
    baseDate?: Date;
}

const normalizeDate = (value?: Date | string | null) => {
    if (!value) return null;
    return value instanceof Date ? value : new Date(value);
};

export default function DailyPlannerCard({
    tasks = [],
    baseDate = new Date(),
}: DailyPlannerCardProps) {
    const router = useRouter();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<'yesterday' | 'today' | 'tomorrow'>('today');

    const today = new Date(baseDate);

    // Calculate dates
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const isSameDay = (d1: Date, d2?: Date | null) => {
        if (!d2) return false;
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    };

    const allTasks = tasks.map((task) => ({
        ...task,
        deadline: normalizeDate(task.deadline),
        type: task.type ?? "user",
    }));

    const yesterdayTasks = allTasks.filter(t => isSameDay(yesterday, t.deadline));
    const todayTasks = allTasks.filter(t => isSameDay(today, t.deadline));
    const tomorrowTasks = allTasks.filter(t => isSameDay(tomorrow, t.deadline));

    // Sort: Pending first for today, Submitted last
    // For Yesterday: Failed/Pending first (to show what was missed)
    const sortTasks = (tasks: any[], isPast: boolean = false) => {
        return [...tasks].sort((a, b) => {
            const statusScore = (s: string) => {
                if (s === 'pending') return isPast ? 0 : 0;
                if (s === 'submitted') return 2;
                if (s === 'feedback_completed') return 3;
                return 1;
            };
            return statusScore(a.status) - statusScore(b.status);
        });
    };

    const sortedYesterday = sortTasks(yesterdayTasks, true);
    const sortedToday = sortTasks(todayTasks, false);
    const sortedTomorrow = sortTasks(tomorrowTasks, false);

    // Scroll Handler to update active tab
    const handleScroll = () => {
        if (!scrollRef.current) return;
        const scrollLeft = scrollRef.current.scrollLeft;
        const width = scrollRef.current.offsetWidth;
        const page = Math.round(scrollLeft / width);

        if (page === 0) setActiveTab('yesterday');
        else if (page === 1) setActiveTab('today');
        else if (page === 2) setActiveTab('tomorrow');
    };

    // Initial scroll to Today (center)
    useEffect(() => {
        if (scrollRef.current) {
            const width = scrollRef.current.offsetWidth;
            scrollRef.current.scrollTo({ left: width, behavior: 'auto' }); // Start at Today
        }
    }, []);

    const scrollTo = (view: 'yesterday' | 'today' | 'tomorrow') => {
        if (!scrollRef.current) return;
        const width = scrollRef.current.offsetWidth;
        let left = 0;
        if (view === 'today') left = width;
        if (view === 'tomorrow') left = width * 2;

        scrollRef.current.scrollTo({ left, behavior: 'smooth' });
    };

    const goToDetail = (id: string | number) => {
        router.push(`/planner/${id}`);
    };

    return (
        <div className="w-full">
            {/* Tab Navigation (Integrated with simple dots or text) */}
            <div className="flex justify-center items-center gap-6 mb-4 text-sm font-bold text-gray-400">
                <button
                    onClick={() => scrollTo('yesterday')}
                    className={`${activeTab === 'yesterday' ? 'text-gray-800 scale-110' : 'hover:text-gray-600'} transition-all`}
                >
                    어제
                </button>
                <button
                     onClick={() => scrollTo('today')}
                     className={`${activeTab === 'today' ? 'text-primary scale-110' : 'hover:text-gray-600'} transition-all`}
                >
                    오늘
                </button>
                <button
                     onClick={() => scrollTo('tomorrow')}
                     className={`${activeTab === 'tomorrow' ? 'text-gray-800 scale-110' : 'hover:text-gray-600'} transition-all`}
                >
                    내일
                </button>
            </div>

            {/* Swipeable Container */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex w-full overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4"
                style={{ scrollBehavior: 'smooth' }}
            >
                {/* Yesterday View */}
                <div className="min-w-full px-1 snap-center">
                    <div className="px-1 space-y-3">
                         {sortedYesterday.length === 0 ? (
                            <EmptyState message="어제는 기록된 과제가 없어요." />
                        ) : sortedYesterday.map((task) => (
                            <TaskRowItem
                                key={task.id}
                                {...task}
                                isMentorTask={task.type === 'mentor'}
                                onClick={() => goToDetail(task.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Today View */}
                <div className="min-w-full px-1 snap-center">
                    <div className="px-1 space-y-3">
                        {sortedToday.length === 0 ? (
                             <EmptyState message="오늘은 예정된 과제가 없어요!" />
                        ) : sortedToday.map((task) => (
                            <TaskRowItem
                                key={task.id}
                                {...task}
                                isMentorTask={task.type === 'mentor'}
                                onClick={() => goToDetail(task.id)}
                                className="shadow-sm border-gray-100" // Add bit more emphasis for Today
                            />
                        ))}

                        {/* Quick Action for Today */}
                         <button
                            onClick={() => router.push('/planner')}
                            className="w-full py-3 mt-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-xs font-bold flex items-center justify-center gap-1 hover:border-primary hover:text-primary transition-colors"
                        >
                            <Plus size={14} /> 자율 학습 추가하기
                        </button>
                    </div>
                </div>

                {/* Tomorrow View */}
                <div className="min-w-full px-1 snap-center">
                     <div className="px-1 space-y-3">
                        <div className="mb-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-50 text-center">
                            <p className="text-xs text-blue-600 font-bold mb-1">내일 할 일 미리보기</p>
                            <h3 className="text-lg font-bold text-gray-800">준비된 자에게 기회가 온다 ✨</h3>
                        </div>

                         {sortedTomorrow.length === 0 ? (
                             <EmptyState message="내일 예정된 과제가 아직 없어요." />
                        ) : sortedTomorrow.map((task) => (
                            <TaskRowItem
                                key={task.id}
                                {...task}
                                isMentorTask={task.type === 'mentor'}
                                onClick={() => goToDetail(task.id)}
                            />
                        ))}

                         <button
                            onClick={() => router.push('/planner')}
                            className="w-full py-3 mt-2 bg-gray-900 text-white rounded-xl text-xs font-bold shadow-lg shadow-gray-200 flex items-center justify-center gap-1 active:scale-95 transition-all"
                        >
                            <Plus size={14} /> 내일 계획 미리 세우기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="py-10 text-center text-gray-400">
            <p className="text-sm font-bold">{message}</p>
        </div>
    );
}
