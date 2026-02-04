"use client";

import { useState } from "react";
import { AlertCircle, ChevronDown, ChevronUp, MessageCircle, ArrowRight } from "lucide-react";
import TaskRowItem from "../TaskRowItem";
import { useRouter } from "next/navigation";

interface YesterdayRecapProps {
    missedTasks: any[];
    feedbackTasks: any[];
}

export default function YesterdayRecap({ missedTasks, feedbackTasks }: YesterdayRecapProps) {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);

    // Logic: If there are missed tasks, showing them is priority.
    // If only feedback, show feedback alert.
    // If all clear, return null (clean slate).

    if (missedTasks.length === 0 && feedbackTasks.length === 0) return null;

    return (
        <div className="mb-4 space-y-2 animate-in slide-in-from-top-2 duration-300">
            {/* Feedback Alert (Always visible if exists) */}
            {feedbackTasks.length > 0 && (
                <div
                    onClick={() => router.push(`/planner/${feedbackTasks[0].id}`)}
                    className="flex items-center gap-3 bg-purple-50 p-3 rounded-xl border border-purple-100 cursor-pointer hover:bg-purple-100 transition-colors"
                >
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                        <MessageCircle size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800">
                            어제 과제에 <span className="text-purple-600">{feedbackTasks.length}개의 피드백</span>이 도착했어요!
                        </p>
                    </div>
                    <ChevronDown size={16} className="-rotate-90 text-purple-300" />
                </div>
            )}

            {/* Missed Tasks Alert */}
            {missedTasks.length > 0 && (
                <div className="bg-red-50 rounded-2xl border border-red-100 overflow-hidden transition-all duration-300 ease-in-out">
                    <div
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-red-100/50 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0 animate-pulse">
                            <AlertCircle size={18} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-gray-800">
                                어제 놓친 과제가 <span className="text-red-500">{missedTasks.length}개</span> 있어요.
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium">오늘로 가져올까요?</p>
                        </div>
                        <div className={`text-red-300 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                            <ChevronDown size={20} />
                        </div>
                    </div>

                    {/* Expandable List */}
                    {isExpanded && (
                        <div className="px-3 pb-3 border-t border-red-100/50 bg-red-50/30">
                            <div className="mt-2 space-y-2">
                                {/* Action Header */}
                                <div className="flex justify-end mb-2">
                                     <button className="text-[10px] font-bold text-red-500 flex items-center gap-1 bg-white hover:bg-red-50 px-2 py-1 rounded-full shadow-sm border border-red-100 transition-all">
                                        모두 오늘로 미루기 <ArrowRight size={10} />
                                     </button>
                                </div>

                                {missedTasks.map(task => (
                                    <TaskRowItem
                                        key={task.id}
                                        {...task}
                                        isMentorTask={task.type === 'mentor'}
                                        onClick={() => router.push(`/planner/${task.id}`)}
                                        className="bg-white/80 border-transparent shadow-none"
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
