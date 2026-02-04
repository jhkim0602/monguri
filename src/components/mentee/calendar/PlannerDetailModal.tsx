import { X, Check } from "lucide-react";
import Link from "next/link";
import { formatTime } from "@/utils/timeUtils";
import { DEFAULT_CATEGORIES } from "@/constants/common";
import { USER_TASKS } from "@/constants/mentee";

interface PlannerDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date | null;
    dailyRecord: any;
    mentorDeadlines: any[];
    dailyEvents: any[];
}

export default function PlannerDetailModal({
    isOpen,
    onClose,
    date,
    dailyRecord,
    mentorDeadlines,
    dailyEvents
}: PlannerDetailModalProps) {
    if (!isOpen || !date) return null;

    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const isToday = false;
    const studyTime = dailyRecord?.studyTime || 0;
    const memo = dailyRecord?.memo || "";
    const studyTimeBlocks = dailyRecord?.studyTimeBlocks || {};

    const isSameDay = (date1: Date, date2: Date) => {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    };

    const userTasks = USER_TASKS.filter(t => t.deadline && isSameDay(t.deadline, date));
    const allTasks = [...mentorDeadlines, ...userTasks];
    const hasActivity = dailyEvents.length > 0 || allTasks.length > 0;
    const tasksWithFeedback = mentorDeadlines.filter(t => t.mentorFeedback && t.mentorComment);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Modal Content - Big Planner Page */}
            <div
                className="bg-white w-full max-w-lg aspect-[9/16] max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden rounded-md"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button (Absolute Top Right) */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 z-50"
                >
                    <X size={24} />
                </button>

                {/* Paper Texture / Header */}
                <div className="w-full h-14 border-b border-gray-100 bg-gray-50 px-6 flex items-center justify-between shrink-0">
                    <span className={`text-lg font-bold ${isToday ? 'text-primary' : 'text-gray-900'}`}>
                        {date.getDate()} ({dayNames[date.getDay()]})
                    </span>
                    {studyTime > 0 && (
                        <span className="text-sm font-mono text-gray-500 font-bold">{formatTime(studyTime)}</span>
                    )}
                </div>

                {/* Body Content - Scaled Up Planner Layout */}
                <div className="flex-1 p-4 flex flex-col gap-4 overflow-hidden">

                    {/* 1. Memo / Diary Area (Top) - Detailed View */}
                    <div className="w-full bg-sky-50/50 rounded-lg p-3 border border-sky-100/50">
                        <span className="text-xs font-bold text-sky-600 mb-1 block">Daily Memo</span>
                        <p className="text-sm text-gray-700 font-medium leading-relaxed italic">
                            {memo ? `"${memo}"` : '오늘의 메모가 없습니다.'}
                        </p>
                    </div>

                    {/* 2. Main Content: To-Do (Left) vs TimeTable (Right) */}
                    <div className="flex-1 flex gap-3 w-full overflow-hidden">
                        {/* Left: To-Do List (Detailed) */}
                        <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1">
                            {/* Mentor Tasks */}
                            {mentorDeadlines.map(task => (
                                <Link
                                    key={task.id}
                                    href={`/planner/${task.id}`}
                                    className="flex items-start gap-2 hover:bg-purple-50/50 rounded-lg p-2 -m-2 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${task.completed ? 'bg-purple-500 border-purple-500' : 'border-purple-300 bg-purple-50'} shrink-0 mt-0.5`}>
                                        {task.completed && <Check size={12} className="text-white" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-base font-bold truncate ${task.completed ? 'text-gray-800' : 'text-gray-600'}`}>{task.title}</p>
                                        <p className="text-xs text-purple-500 font-medium">📚 멘토 과제</p>
                                    </div>
                                </Link>
                            ))}

                            {/* User Tasks */}
                            {userTasks.map(task => (
                                <Link
                                    key={task.id}
                                    href={`/planner/${task.id}`}
                                    className="flex items-start gap-2 hover:bg-blue-50/50 rounded-lg p-2 -m-2 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${task.completed ? 'bg-blue-500 border-blue-500' : 'border-blue-300 bg-blue-50'} shrink-0 mt-0.5`}>
                                        {task.completed && <Check size={12} className="text-white" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-base font-bold truncate ${task.completed ? 'text-gray-800' : 'text-gray-600'}`}>{task.title}</p>
                                        <p className="text-xs text-blue-500 font-medium">✏️ 나의 과제</p>
                                    </div>
                                </Link>
                            ))}

                            {/* Self Studies from WEEKLY_SCHEDULE */}
                            {dailyEvents.filter(e => e.taskType === 'plan').map((event, idx) => {
                                 const cat = DEFAULT_CATEGORIES.find(c => c.id === event.categoryId);
                                 const colorClass = cat?.color?.replace('bg-', 'border-') || 'border-gray-200';
                                 return (
                                    <div key={`evt-${idx}`} className="flex items-start gap-2">
                                         <div className={`w-5 h-5 rounded-full border-2 ${colorClass} bg-white shrink-0 mt-0.5`} />
                                         <div className="flex-1 min-w-0">
                                             <p className="text-base font-bold text-gray-800 truncate">{event.title}</p>
                                             <p className="text-xs text-gray-400">{cat?.name}</p>
                                         </div>
                                    </div>
                                 );
                            })}

                            {!hasActivity && (
                                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl">
                                    <span className="text-gray-300 text-sm">등록된 계획 없음</span>
                                </div>
                            )}
                        </div>

                        {/* Right: Time Table (Visual) - Detailed */}
                        <div className="w-[30%] border-l border-gray-100 pl-3 flex flex-col gap-1 pt-2 overflow-y-auto custom-scrollbar">
                           <span className="text-xs font-bold text-gray-400 mb-2 block text-right">Time</span>
                            {/* Real Time Blocks */}
                            {Array.from({ length: 15 }).map((_, idx) => { // 6am to 8pm
                                const hour = 6 + idx;
                                const timeKey = `${String(hour).padStart(2, '0')}:00`;
                                const hasBlock = studyTimeBlocks[timeKey] ||
                                                studyTimeBlocks[`${String(hour).padStart(2, '0')}:10`] ||
                                                studyTimeBlocks[`${String(hour).padStart(2, '0')}:20`] ||
                                                studyTimeBlocks[`${String(hour).padStart(2, '0')}:30`] ||
                                                studyTimeBlocks[`${String(hour).padStart(2, '0')}:40`] ||
                                                studyTimeBlocks[`${String(hour).padStart(2, '0')}:50`];

                                const categoryId = hasBlock;
                                const category = categoryId ? DEFAULT_CATEGORIES.find(c => c.id === categoryId) : null;
                                const bgColor = category?.color?.replace('bg-', 'bg-') || 'bg-gray-100';

                                return (
                                    <div key={idx} className="flex gap-1 items-center h-8">
                                        <div className="text-[10px] text-gray-400 w-3 text-right shrink-0">{hour}</div>
                                        <div className="flex-1 h-full relative min-w-0">
                                            <div className="absolute top-1/2 w-full h-[1px] bg-gray-100" />
                                            {hasBlock && (
                                                <div className={`absolute top-1 bottom-1 left-0 right-0 rounded-sm ${bgColor}/80`} />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 3. Feedback Section (Bottom Overlay or Section) */}
                    {tasksWithFeedback.length > 0 && (
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 shrink-0">
                             <div className="flex items-center gap-2 mb-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                <span className="text-sm font-bold text-gray-600">멘토 쌤의 피드백</span>
                             </div>
                             {tasksWithFeedback.map(task => (
                                 <div key={task.id} className="text-sm text-gray-500 leading-relaxed truncate">
                                     <span className="font-bold text-gray-600 mr-1">To. {task.title.slice(0, 8)}...:</span>
                                     "{task.mentorFeedback}"
                                 </div>
                             ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
