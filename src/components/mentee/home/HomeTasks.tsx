"use client";

import { ChevronRight, CheckCircle2 } from "lucide-react";
import { MENTOR_TASKS } from "@/constants/common";

interface HomeTasksProps {
    onOpenTask: (task: any) => void;
}

export default function HomeTasks({ onOpenTask }: HomeTasksProps) {
    const pendingCount = MENTOR_TASKS.filter(t => t.status === 'pending').length;

    const sortedTasks = [...MENTOR_TASKS].sort((a, b) => {
        const statusOrder = { pending: 0, submitted: 1, feedback_completed: 2 };
        return (statusOrder[a.status as keyof typeof statusOrder] || 0) - (statusOrder[b.status as keyof typeof statusOrder] || 0);
    });

    return (
        <section className="px-6 mb-10">
            <div className="flex justify-between items-end mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">멘토 숙제</h3>
                    <span className="bg-blue-100 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {pendingCount} Remaining
                    </span>
                </div>
                <button className="text-gray-400 text-xs flex items-center gap-0.5">
                    전체보기 <ChevronRight size={14} />
                </button>
            </div>

            <div className="space-y-3">
                {sortedTasks.slice(0, 3).map((task) => {
                    const isFeedbackCompleted = task.status === 'feedback_completed';
                    const isSubmitted = task.status === 'submitted';

                    return (
                        <div
                            key={task.id}
                            className="p-4 rounded-2xl bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => onOpenTask(task)}
                        >
                            <div className="flex items-center gap-4">
                                {isFeedbackCompleted ? (
                                    <div className="bg-purple-100 rounded-full p-0.5">
                                        <CheckCircle2 size={24} className="text-purple-600 fill-purple-100" />
                                    </div>
                                ) : isSubmitted ? (
                                    <div className="bg-blue-100 rounded-full p-0.5">
                                        <CheckCircle2 size={24} className="text-blue-500 fill-blue-50" />
                                    </div>
                                ) : (
                                    <div className="w-6 h-6 rounded-full border-2 border-gray-200 bg-white" />
                                )}

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${task.badgeColor}`}>
                                            {task.subject}
                                        </span>
                                        {isFeedbackCompleted && (
                                            <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-bold">
                                                피드백 완료
                                            </span>
                                        )}
                                        {isSubmitted && (
                                            <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold">
                                                과제 제출 완료
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-sm font-bold truncate ${(isSubmitted || isFeedbackCompleted) ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                        {task.title}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-gray-300" />
                        </div>
                    );
                })}
            </div>

            <button className="w-full mt-6 py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-blue-200">
                플래너에서 확인하기
            </button>
        </section>
    );
}
