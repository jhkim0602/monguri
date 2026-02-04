"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, CalendarDays } from "lucide-react";
import TaskRowItem from "../TaskRowItem";
import { useRouter } from "next/navigation";

interface TomorrowPreviewProps {
    tasks: any[];
}

export default function TomorrowPreview({ tasks }: TomorrowPreviewProps) {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);

    if (tasks.length === 0) {
        return (
            <div className="mt-auto pt-4 border-t border-gray-100">
                <button
                    onClick={() => router.push('/planner')}
                    className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors w-full justify-center py-2"
                >
                    <CalendarDays size={14} />
                    내일 계획 미리 세우기
                </button>
            </div>
        );
    }

    // Get unique subjects for summary
    const subjects = Array.from(new Set(tasks.map(t => t.subject))).join(", ");

    return (
        <div className={`mt-auto border-t border-gray-100 transition-all duration-300 ${isExpanded ? 'bg-blue-50/30 rounded-t-2xl -mx-6 px-6 pt-4 pb-2' : 'pt-4'}`}>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between group"
            >
                <div className="flex items-center gap-2 text-left">
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">내일 예고</span>
                    <p className="text-xs font-bold text-gray-600 truncate max-w-[200px]">
                        {subjects} 등 <span className="text-primary">{tasks.length}개</span>의 과제가 있어요
                    </p>
                </div>
                <div className={`text-gray-300 group-hover:text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown size={18} />
                </div>
            </button>

            {/* List */}
             <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                <div className="space-y-2 pb-2">
                    {tasks.map(task => (
                        <TaskRowItem
                            key={task.id}
                            {...task}
                            isMentorTask={task.type === 'mentor'}
                            onClick={() => router.push(`/planner/${task.id}`)}
                            className="bg-white"
                        />
                    ))}
                </div>
             </div>
        </div>
    );
}
