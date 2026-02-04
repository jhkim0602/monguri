"use client";

import { Plus, Clock } from "lucide-react";
import TaskRowItem from "../TaskRowItem";
import { useRouter } from "next/navigation";

interface TodayTimelineProps {
    tasks: any[];
}

export default function TodayTimeline({ tasks }: TodayTimelineProps) {
    const router = useRouter();

    const goToDetail = (id: string | number) => {
        router.push(`/planner/${id}`);
    };

    return (
        <div className="flex-1 space-y-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <h3 className="text-sm font-bold text-gray-800">
                    오늘의 할 일 <span className="text-gray-400 font-medium ml-1 text-xs">{tasks.length}</span>
                </h3>
            </div>

            {/* Tasks List */}
            <div className="space-y-3 relative pl-4 border-l border-dashed border-gray-200 ml-2">
                {tasks.length === 0 ? (
                    <div className="py-8 text-center text-gray-400">
                        <p className="text-xs font-bold">오늘 예정된 과제가 없어요.</p>
                        <p className="text-[10px] mt-1">자율 계획을 세워보세요!</p>
                    </div>
                ) : (
                    tasks.map((task, idx) => (
                        <div key={task.id} className="relative">
                            {/* Timeline Node */}
                            <div className={`absolute -left-[21px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm z-10
                                ${task.status === 'submitted' || task.status === 'feedback_completed' ? 'bg-gray-300' : 'bg-primary'}`}
                            />

                            <TaskRowItem
                                {...task}
                                isMentorTask={task.type === 'mentor'}
                                onClick={() => goToDetail(task.id)}
                                className="shadow-sm border-gray-100 hover:shadow-md hover:scale-[1.01] transition-all duration-200"
                            />
                        </div>
                    ))
                )}
            </div>

            {/* Add Action */}
            <button
                onClick={() => router.push('/planner')}
                className="w-full py-3 ml-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-xs font-bold flex items-center justify-center gap-1 hover:border-primary hover:text-primary transition-colors active:scale-95"
            >
                <Plus size={14} /> 자율 학습 추가하기
            </button>
        </div>
    );
}
