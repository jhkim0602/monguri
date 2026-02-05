"use client";

import { MessageCircle, ChevronRight, Star, Sparkles } from "lucide-react";
import Link from "next/link";

interface FeedbackCardProps {
    id: string | number;
    title: string;
    subject: string;
    subjectColor: string;
    date: Date;
    content: string;
    isRead?: boolean;
    isOpen: boolean;
    onToggle: () => void;
    isStarred?: boolean;
    onToggleStar?: (e: React.MouseEvent) => void;
    onOpenTask?: () => void;
}

export default function FeedbackCard({
    title,
    subject,
    subjectColor,
    date,
    content,
    isRead = true,
    isOpen,
    onToggle,
    isStarred = false,
    onToggleStar,
    onOpenTask
}: FeedbackCardProps) {
    const formattedDate = date.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });

    return (
        <div
            className={`group/card bg-white rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer ${isOpen
                ? "border-primary/20 shadow-md ring-1 ring-primary/5"
                : "border-gray-100 shadow-sm hover:shadow active:scale-[0.99]"
                }`}
        >
            {/* Header / Summary View */}
            <div className="p-4 flex items-center justify-between" onClick={onToggle}>
                <div className="flex items-center gap-3 min-w-0">
                    {/* Subject Badge */}
                    <span className={`shrink-0 px-2 py-1 text-[10px] font-bold rounded-md ${subjectColor}`}>
                        {subject}
                    </span>

                    {/* Title (Truncated) */}
                    <p className={`text-sm font-bold truncate transition-colors ${isOpen ? 'text-primary' : 'text-gray-900'}`}>
                        {title}
                    </p>
                </div>

                <div className="flex items-center gap-3 pl-2">
                    {/* Star Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleStar?.(e);
                        }}
                        className={`p-1.5 rounded-lg transition-all active:scale-90 ${isStarred
                            ? "bg-amber-50 text-amber-500"
                            : "text-gray-300 hover:bg-gray-50 hover:text-gray-400"
                            }`}
                    >
                        <Star
                            size={16}
                            fill={isStarred ? "currentColor" : "none"}
                            strokeWidth={isStarred ? 0 : 2}
                        />
                    </button>

                    <span className="text-[11px] font-medium text-gray-400 shrink-0">
                        {formattedDate}
                    </span>
                    <ChevronRight
                        size={16}
                        className={`text-gray-300 transition-transform duration-300 ${isOpen ? "rotate-90 text-primary" : ""}`}
                    />
                </div>
            </div>

            {/* Expanded Content */}
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                    <div className="px-5 pb-5 pt-0">
                        <div className="h-px w-full bg-gray-50 mb-4" /> {/* Divider */}

                        <div className="flex items-start gap-3 bg-gray-50/50 rounded-xl p-3">
                            <MessageCircle size={16} className="text-gray-400 mt-0.5 shrink-0" />
                            <div className="space-y-3 w-full">
                                <p className="text-[13px] font-medium text-gray-700 leading-relaxed">
                                    {content}
                                </p>

                                {/* Link to Context (Only visible when expanded) */}
                                <div className="flex justify-end pt-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onOpenTask?.();
                                        }}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-100 text-[11px] font-bold text-gray-500 hover:text-primary hover:border-primary/30 hover:shadow-sm transition-all active:scale-95 group/btn"
                                    >
                                        <Sparkles size={12} className="text-amber-400 group-hover/btn:rotate-12 transition-transform" />
                                        해당 과제로 이동
                                        <ChevronRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
