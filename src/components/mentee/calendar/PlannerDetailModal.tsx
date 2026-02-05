import { useState } from "react";
import { X, Check } from "lucide-react";
import Link from "next/link";
import { formatTime, generateTimeBlocksFromTasks } from "@/utils/timeUtils";
import { DEFAULT_CATEGORIES } from "@/constants/common";
import { USER_TASKS } from "@/constants/mentee";

interface PlannerDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date | null;
    dailyRecord: any;
    mentorDeadlines: any[];
    dailyEvents: any[];
    userTasks?: any[];
    onTaskClick?: (task: any) => void;
}

export default function PlannerDetailModal({
    isOpen,
    onClose,
    date,
    dailyRecord,
    mentorDeadlines,
    dailyEvents,
    userTasks: userTasksProp,
    onTaskClick
}: PlannerDetailModalProps) {
    if (!isOpen || !date) return null;

    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const isToday = false;
    const studyTime = dailyRecord?.studyTime || 0;
    const memo = dailyRecord?.memo || "";

    const isSameDay = (date1: Date, date2: Date) => {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    };

    const userTasks = userTasksProp ?? USER_TASKS.filter(t => t.deadline && isSameDay(t.deadline, date));
    const allTasks = [...mentorDeadlines, ...userTasks];
    const hasActivity = dailyEvents.length > 0 || allTasks.length > 0;
    const tasksWithFeedback = mentorDeadlines.filter(t => t.mentorFeedback && t.mentorComment);
    const [showMentorRule, setShowMentorRule] = useState(false);
    const [ruleTargetTitle, setRuleTargetTitle] = useState<string | null>(null);

    const isTaskCompleted = (task: any) => {
        const isMentorTask = task.isMentorTask ?? task.taskType === "mentor";
        const isSubmitted = task.status === "submitted" || task.status === "feedback_completed" || !!task.studyRecord;
        if (isMentorTask) return isSubmitted;
        return !!task.completed || !!task.studyRecord;
    };

    // Generate timeline blocks from tasks directly
    const studyTimeBlocks = generateTimeBlocksFromTasks(allTasks);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Modal Content - Big Planner Page */}
            <div
                className="bg-white w-full max-w-[430px] aspect-[3/5] max-h-[95vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden rounded-md"
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
                        <span className="text-sm tabular-nums text-gray-500 font-bold">{formatTime(studyTime)}</span>
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

                    {showMentorRule && (
                        <div className="w-full bg-orange-50/60 rounded-lg p-3 border border-orange-100 flex items-start justify-between gap-3">
                            <div>
                                <span className="text-xs font-bold text-orange-600 mb-1 block">멘토 과제 완료 규칙</span>
                                <p className="text-xs text-orange-700/90 font-medium">
                                    {ruleTargetTitle ? `"${ruleTargetTitle}"` : "멘토 과제"}는 제출을 완료해야 체크됩니다. 상세 페이지에서 제출해 주세요.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowMentorRule(false)}
                                className="text-[10px] font-bold text-orange-500 hover:text-orange-700"
                            >
                                닫기
                            </button>
                        </div>
                    )}

                    {/* 2. Main Content: To-Do (Left) vs TimeTable (Right) */}
                    <div className="flex-1 flex gap-3 w-full overflow-hidden min-h-0">
                        {/* Left: To-Do List (Detailed) */}
                        <div className="w-[65%] flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1 min-h-0">
                            {/* Mentor Tasks */}
                            {mentorDeadlines.map(task => {
                                const cat = DEFAULT_CATEGORIES.find(c => c.id === task.categoryId);
                                const colorClass = cat?.color || 'bg-purple-500';
                                const borderClass = colorClass.replace('bg-', 'border-');
                                const completed = isTaskCompleted(task);

                                return (
                                    <div
                                        key={task.id}
                                        className="flex items-start gap-2 hover:bg-purple-50/50 rounded-lg p-2 -m-2 transition-colors cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onTaskClick?.(task);
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.preventDefault();
                                                event.stopPropagation();
                                                if (!completed) {
                                                    setRuleTargetTitle(task.title);
                                                    setShowMentorRule(true);
                                                }
                                            }}
                                            className={`w-5 h-5 rounded flex items-center justify-center border ${completed ? `${colorClass} ${borderClass}` : 'border-gray-300 bg-white'} shrink-0 mt-0.5`}
                                            aria-label="멘토 과제 완료 규칙"
                                        >
                                            {completed && <Check size={12} className="text-white" />}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <span className="bg-primary/10 text-primary text-[9px] font-black px-1.5 py-0.5 rounded leading-none uppercase tracking-tighter">
                                                    Mentor
                                                </span>
                                                {!completed && (
                                                    <span className="text-[9px] text-orange-600 font-black bg-orange-50 px-1.5 py-0.5 rounded">제출 필요</span>
                                                )}
                                                {task.studyRecord && (
                                                    <span className="text-[9px] text-emerald-500 font-black bg-emerald-50 px-1.5 py-0.5 rounded">제출</span>
                                                )}
                                            </div>
                                            <p className={`text-base font-bold truncate ${completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.title}</p>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* User Tasks */}
                            {userTasks.map(task => {
                                const cat = DEFAULT_CATEGORIES.find(c => c.id === task.categoryId);
                                const colorClass = cat?.color || 'bg-blue-500';
                                const borderClass = colorClass.replace('bg-', 'border-');
                                const completed = isTaskCompleted(task);

                                return (
                                    <div
                                        key={task.id}
                                        className="flex items-start gap-2 hover:bg-blue-50/50 rounded-lg p-2 -m-2 transition-colors cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onTaskClick?.(task);
                                        }}
                                    >
                                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${completed ? `${colorClass} ${borderClass}` : 'border-gray-300 bg-white'} shrink-0 mt-0.5`}>
                                            {completed && <Check size={12} className="text-white" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                {task.studyRecord && (
                                                    <span className="text-[9px] text-emerald-500 font-black bg-emerald-50 px-1.5 py-0.5 rounded">제출</span>
                                                )}
                                            </div>
                                            <p className={`text-base font-bold truncate ${completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.title}</p>
                                        </div>
                                    </div>
                                );
                            })}

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
                        <div className="w-[35%] border-l border-gray-100 pl-1.5 flex flex-col overflow-y-auto custom-scrollbar min-h-0">
                            <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                                {Array.from({ length: 19 }).map((_, idx) => {
                                    const hour = 6 + idx;
                                    const hourStr = String(hour).padStart(2, '0');

                                    return (
                                        <div key={hour} className="flex h-6 border-b border-gray-50 last:border-none group">
                                            <div className="w-8 flex items-center justify-center bg-gray-50/50 border-r border-gray-100 transition-colors group-hover:bg-gray-100">
                                                <span className="text-[8px] font-bold text-gray-400 tabular-nums">{hourStr}</span>
                                            </div>

                                            <div className="flex-1 grid grid-cols-6 relative">
                                                {[0, 1, 2, 3, 4, 5].map((slot) => {
                                                    const minute = slot * 10;
                                                    const timeKey = `${hourStr}:${minute < 10 ? '0' + minute : minute}`;
                                                    const blockCategoryId = studyTimeBlocks[timeKey];
                                                    const category = blockCategoryId ? DEFAULT_CATEGORIES.find(c => c.id === blockCategoryId) : null;

                                                    return (
                                                        <div
                                                            key={slot}
                                                            className={`border-r border-gray-50 last:border-none relative
                                                                ${category?.color || 'bg-white'}
                                                                ${category ? 'shadow-inner' : ''}
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
