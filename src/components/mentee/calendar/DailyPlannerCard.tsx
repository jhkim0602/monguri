import { DEFAULT_CATEGORIES } from "@/constants/common";
import { formatTime } from "@/utils/timeUtils";
import { Check } from "lucide-react";

interface DailyPlannerCardProps {
    date: Date;
    isToday: boolean;
    studyTime?: number;
    memo?: string;
    mentorDeadlines: any[];
    userTasks: any[];
    dailyEvents: any[];
    studyTimeBlocks: { [key: string]: string };
    onClick?: () => void;
}

export default function DailyPlannerCard({
    date,
    isToday,
    studyTime = 0,
    memo = "",
    mentorDeadlines = [],
    userTasks = [],
    dailyEvents = [],
    studyTimeBlocks = {},
    onClick
}: DailyPlannerCardProps) {
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const allTasks = [...mentorDeadlines, ...userTasks];
    const hasActivity = dailyEvents.length > 0 || allTasks.length > 0;
    const tasksWithFeedback = mentorDeadlines.filter(t => t.mentorFeedback && t.mentorComment);
    const isTaskCompleted = (task: any) => {
        const isMentorTask = task.isMentorTask ?? task.taskType === 'mentor';
        const isSubmitted = task.status === 'submitted' || task.status === 'feedback_completed' || !!task.studyRecord;
        if (isMentorTask) return isSubmitted;
        return !!task.completed || !!task.studyRecord;
    };

    return (
        <div
            onClick={onClick}
            className="aspect-[3/4] relative group bg-white border border-gray-100 overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors shadow-sm rounded-sm flex flex-col"
        >
            {/* Header (Scaled down Modal Header) */}
            <div className="w-full h-5 border-b border-gray-100 bg-gray-50 px-2 flex items-center justify-between shrink-0">
                <span className={`text-[9px] font-bold ${isToday ? 'text-primary' : 'text-gray-900'}`}>
                    {date.getDate()} ({dayNames[date.getDay()]})
                </span>
                {studyTime > 0 && (
                    <span className="text-[7px] tabular-nums text-gray-500 font-bold">{formatTime(studyTime)}</span>
                )}
            </div>

            {/* Body Content - High Density Miniature */}
            <div className="flex-1 p-1.5 flex flex-col gap-1.5 overflow-hidden">

                {/* 1. Memo (Blue Box) */}
                <div className="w-full bg-sky-50/50 rounded-[3px] p-1 border border-sky-100/50 shrink-0">
                    <span className="text-[5px] font-bold text-sky-600 block leading-tight mb-0.5">Daily Memo</span>
                    <div className="w-full h-[1px] bg-sky-100/50 mb-0.5" />
                    <p className="text-[5px] text-gray-400 italic leading-tight truncate">
                        {memo || "기록된 메모가 없습니다."}
                    </p>
                </div>

                {/* 2. Main Split View */}
                <div className="flex-1 flex gap-1.5 w-full min-h-0">
                    {/* Left: To-Do List (Detailed Miniature) */}
                    <div className="w-[65%] flex flex-col gap-1 overflow-hidden">
                        {/* Mentor Tasks */}
                        {mentorDeadlines.map(task => {
                            const cat = DEFAULT_CATEGORIES.find(c => c.id === task.categoryId);
                            const colorClass = cat?.color || 'bg-purple-500';
                            const borderClass = colorClass.replace('bg-', 'border-');
                            const isCompleted = isTaskCompleted(task);

                            return (
                                <div
                                    key={task.id}
                                    className="flex items-start gap-1"
                                >
                                    <div className={`w-2 h-2 rounded-[1px] flex items-center justify-center border-[0.5px] ${isCompleted ? `${colorClass} ${borderClass}` : 'border-gray-300 bg-white'} shrink-0 mt-[1px]`}>
                                        {isCompleted && <Check size={4} className="text-white" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-[2px] mb-[1px]">
                                            <span className="bg-primary/10 text-primary text-[4px] font-black px-[2px] py-[1px] rounded-[1px] leading-none uppercase tracking-tighter">
                                                Mentor
                                            </span>
                                            {task.studyRecord && (
                                                <span className="text-[4px] text-emerald-500 font-black bg-emerald-50 px-[2px] py-[1px] rounded-[1px] leading-none">제출</span>
                                            )}
                                        </div>
                                        <p className={`text-[5px] font-bold leading-tight truncate ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.title}</p>
                                    </div>
                                </div>
                            );
                        })}

                        {/* User Tasks */}
                        {userTasks.map(task => {
                            const cat = DEFAULT_CATEGORIES.find(c => c.id === task.categoryId);
                            const colorClass = cat?.color || 'bg-blue-500';
                            const borderClass = colorClass.replace('bg-', 'border-');
                            const isCompleted = isTaskCompleted(task);

                            return (
                                <div
                                    key={task.id}
                                    className="flex items-start gap-1"
                                >
                                    <div className={`w-2 h-2 rounded-[1px] flex items-center justify-center border-[0.5px] ${isCompleted ? `${colorClass} ${borderClass}` : 'border-gray-300 bg-white'} shrink-0 mt-[1px]`}>
                                        {isCompleted && <Check size={4} className="text-white" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-[2px] mb-[1px]">
                                            {task.studyRecord && (
                                                <span className="text-[4px] text-emerald-500 font-black bg-emerald-50 px-[2px] py-[1px] rounded-[1px] leading-none">제출</span>
                                            )}
                                        </div>
                                        <p className={`text-[5px] font-bold leading-tight truncate ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.title}</p>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Self Studies from WEEKLY_SCHEDULE */}
                        {dailyEvents.filter(e => e.taskType === 'plan').map((event, idx) => {
                            const cat = DEFAULT_CATEGORIES.find(c => c.id === event.categoryId);
                            const colorClass = cat?.color?.replace('bg-', 'border-') || 'border-gray-200';
                            return (
                                <div key={`evt-${idx}`} className="flex items-start gap-1">
                                    <div className={`w-2 h-2 rounded-full border-[0.5px] ${colorClass} bg-white shrink-0 mt-[1px]`} />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[5px] font-bold text-gray-800 leading-tight truncate">{event.title}</p>
                                        <p className="text-[4px] text-gray-400 leading-none mt-[1px]">{cat?.name}</p>
                                    </div>
                                </div>
                            );
                        })}

                        {!hasActivity && (
                            <div className="flex-1 flex items-center justify-center border border-dashed border-gray-100 rounded">
                                <span className="text-gray-200 text-[6px]">Empty</span>
                            </div>
                        )}
                    </div>

                    {/* Right: Time Table (Visual Miniature) */}
                    <div className="w-[35%] border-l border-gray-100 pl-0.5 flex flex-col">
                        <div className="bg-white rounded-[2px] border border-gray-100 overflow-hidden flex-1">
                            {Array.from({ length: 19 }).map((_, idx) => {
                                const hour = 6 + idx;
                                const hourStr = String(hour).padStart(2, '0');

                                return (
                                    <div key={hour} className="flex h-1 border-b border-gray-50 last:border-none group">
                                        <div className="w-2 flex items-center justify-center bg-gray-50/50 border-r border-gray-100">
                                            <span className="text-[4px] font-bold text-gray-400 tabular-nums leading-none">{hourStr}</span>
                                        </div>

                                        <div className="flex-1 grid grid-cols-6">
                                            {[0, 1, 2, 3, 4, 5].map((slot) => {
                                                const minute = slot * 10;
                                                const timeKey = `${hourStr}:${minute < 10 ? '0' + minute : minute}`;
                                                const blockCategoryId = studyTimeBlocks[timeKey];
                                                const category = blockCategoryId ? DEFAULT_CATEGORIES.find(c => c.id === blockCategoryId) : null;

                                                return (
                                                    <div
                                                        key={slot}
                                                        className={`border-r border-gray-50 last:border-none
                                                            ${category?.color || 'bg-white'}
                                                        `}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 3. Mentor Feedback (Bottom Box) - Neutral Style */}
                {tasksWithFeedback.length > 0 && (
                    <div className="bg-gray-50 border border-gray-100 rounded-[3px] p-1 shrink-0 mt-auto">
                        <div className="flex items-center gap-0.5 mb-0.5">
                            <div className="w-1 h-1 rounded-full bg-gray-400" />
                            <span className="text-[5px] font-bold text-gray-500">멘토 쌤의 피드백</span>
                        </div>
                        {tasksWithFeedback.slice(0, 1).map(task => (
                            <div key={task.id} className="text-[4px] text-gray-400 leading-tight truncate">
                                <span className="font-bold text-gray-500 mr-0.5">To. {task.title.slice(0, 5)}...:</span>
                                "{task.mentorFeedback?.slice(0, 15)}..."
                            </div>
                        ))}
                        {tasksWithFeedback.length > 1 && (
                            <div className="text-[4px] text-gray-300 mt-[1px] text-right">
                                +{tasksWithFeedback.length - 1} more
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
