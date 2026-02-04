import { DEFAULT_CATEGORIES } from "@/constants/common";
import { formatTime } from "@/utils/timeUtils";
import { Check } from "lucide-react";
import Link from "next/link";

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

    return (
        <div
            onClick={onClick}
            className="aspect-[9/16] relative group bg-white border border-gray-100 overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors shadow-sm rounded-sm flex flex-col"
        >
            {/* Header (Scaled down Modal Header) */}
            <div className="w-full h-5 border-b border-gray-100 bg-gray-50 px-2 flex items-center justify-between shrink-0">
                <span className={`text-[9px] font-bold ${isToday ? 'text-primary' : 'text-gray-900'}`}>
                    {date.getDate()} ({dayNames[date.getDay()]})
                </span>
                {studyTime > 0 && (
                    <span className="text-[7px] font-mono text-gray-500 font-bold">{formatTime(studyTime)}</span>
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
                    <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                        {/* Mentor Tasks */}
                        {mentorDeadlines.map(task => (
                            <Link
                                key={task.id}
                                href={`/planner/${task.id}`}
                                className="flex items-start gap-1 hover:bg-purple-50/50 rounded-[2px] p-0.5 -m-0.5 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className={`w-2 h-2 rounded-[1px] flex items-center justify-center border-[0.5px] ${task.completed ? 'bg-purple-500 border-purple-500' : 'border-purple-300 bg-purple-50'} shrink-0 mt-[1px]`}>
                                    {task.completed && <Check size={4} className="text-white" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className={`text-[5px] font-bold leading-tight truncate ${task.completed ? 'text-gray-800' : 'text-gray-600'}`}>{task.title}</p>
                                    <p className="text-[4px] text-purple-400 font-bold leading-none mt-[1px]">📚 멘토 과제</p>
                                </div>
                            </Link>
                        ))}

                        {/* User Tasks */}
                        {userTasks.map(task => (
                            <Link
                                key={task.id}
                                href={`/planner/${task.id}`}
                                className="flex items-start gap-1 hover:bg-blue-50/50 rounded-[2px] p-0.5 -m-0.5 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className={`w-2 h-2 rounded-[1px] flex items-center justify-center border-[0.5px] ${task.completed ? 'bg-blue-500 border-blue-500' : 'border-blue-300 bg-blue-50'} shrink-0 mt-[1px]`}>
                                    {task.completed && <Check size={4} className="text-white" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className={`text-[5px] font-bold leading-tight truncate ${task.completed ? 'text-gray-800' : 'text-gray-600'}`}>{task.title}</p>
                                    <p className="text-[4px] text-blue-400 font-bold leading-none mt-[1px]">✏️ 나의 과제</p>
                                </div>
                            </Link>
                        ))}

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
                    <div className="w-[30%] border-l border-gray-100 pl-1 flex flex-col pt-0.5">
                       <span className="text-[4px] font-bold text-gray-300 mb-0.5 block text-right">Time</span>
                        <div className="flex-1 flex flex-col justify-between">
                            {Array.from({ length: 15 }).map((_, idx) => {
                                const hour = 6 + idx; // 6am to 8pm
                                const timeKey = `${String(hour).padStart(2, '0')}:00`;
                                const hasBlock = studyTimeBlocks[timeKey] ||
                                                studyTimeBlocks[`${String(hour).padStart(2, '0')}:10`] ||
                                                studyTimeBlocks[`${String(hour).padStart(2, '0')}:20`] ||
                                                studyTimeBlocks[`${String(hour).padStart(2, '0')}:30`] ||
                                                studyTimeBlocks[`${String(hour).padStart(2, '0')}:40`] ||
                                                studyTimeBlocks[`${String(hour).padStart(2, '0')}:50`];

                                const categoryId = hasBlock;
                                const category = categoryId ? DEFAULT_CATEGORIES.find(c => c.id === categoryId) : null;
                                const bgColor = category?.color?.replace('bg-', 'bg-') + '/60' || 'bg-gray-100';

                                return (
                                    <div key={idx} className="flex gap-0.5 items-center h-1">
                                        <div className="text-[4px] text-gray-300 w-1.5 text-right leading-none">{hour}</div>
                                        <div className="flex-1 h-full relative">
                                            <div className="absolute top-1/2 w-full h-[0.5px] bg-gray-100" />
                                            {hasBlock && (
                                                <div className={`absolute top-0 bottom-0 left-0 right-0 ${bgColor} rounded-[0.5px]`} />
                                            )}
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
