"use client";

import { ChevronRight, MessageCircle } from "lucide-react";
import Link from "next/link";
import type { MentorTaskLike } from "@/lib/menteeAdapters";

interface HomeTasksProps {
    tasks?: MentorTaskLike[];
}

export default function HomeTasks({ tasks = [] }: HomeTasksProps) {
    // Filter tasks that have feedback
    const feedbackTasks = tasks.filter(t => t.status === 'feedback_completed' || t.hasMentorResponse);

    return (
        <section className="px-6 mb-10">
            <div className="flex justify-between items-end mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">도착한 피드백</h3>
                    {feedbackTasks.length > 0 && (
                        <span className="bg-purple-100 text-purple-600 text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                            {feedbackTasks.length} New
                        </span>
                    )}
                </div>
                {feedbackTasks.length > 0 && (
                    <button className="text-gray-400 text-xs flex items-center gap-0.5">
                        전체보기 <ChevronRight size={14} />
                    </button>
                )}
            </div>

            <div className="space-y-3">
                {feedbackTasks.length > 0 ? (
                    feedbackTasks.slice(0, 3).map((task) => (
                        <Link
                            key={task.id}
                            href={`/planner/${task.id}`}
                            className="p-4 rounded-2xl bg-white border border-purple-100 shadow-sm flex items-start gap-3 cursor-pointer hover:bg-purple-50 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                                <MessageCircle size={16} className="fill-purple-100" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span
                                        className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold"
                                        style={{ backgroundColor: task.badgeColor?.bg, color: task.badgeColor?.text }}
                                    >
                                        {task.subject}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                        {task.deadline ? `${task.deadline.getMonth() + 1}/${task.deadline.getDate()}` : '날짜 미정'}
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-gray-800 truncate mb-1">
                                    {task.title}
                                </h4>
                                <p className="text-xs text-gray-500 line-clamp-1">
                                    "{task.mentorFeedback || task.mentorComment || "피드백을 확인해보세요!"}"
                                </p>
                            </div>
                            <ChevronRight size={16} className="text-gray-300 mt-2" />
                        </Link>
                    ))
                ) : (
                     <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-xs text-gray-400">아직 도착한 피드백이 없어요.</p>
                     </div>
                )}
            </div>

            {/* Link to full planner */}
            <Link
                href="/planner"
                className="block w-full mt-6 py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-blue-200 text-center hover:bg-blue-600 transition-colors"
            >
                플래너에서 확인하기
            </Link>
        </section>
    );
}
