"use client";

import { DEFAULT_CATEGORIES } from "@/constants/common";
import { SCHEDULE_HOURS } from "@/constants/mentee";

interface StudyTimelineProps {
    studyTimeBlocks: { [key: string]: string };
}

export default function StudyTimeline({
    studyTimeBlocks,
}: StudyTimelineProps) {
    const getCategoryById = (id: string) => DEFAULT_CATEGORIES.find(c => c.id === id) || DEFAULT_CATEGORIES[0];

    return (
        <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">학습 타임라인</h3>

            </div>

            <div className="flex items-center gap-3 mb-5 overflow-x-auto no-scrollbar pb-1">
                <span className="flex-shrink-0 text-[10px] font-bold text-gray-400 border-r pr-3 border-gray-100">과목 색상</span>
                <div className="flex gap-2">
                    {DEFAULT_CATEGORIES.map(cat => (
                        <div
                            key={cat.id}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black ${cat.color} ${cat.textColor} ring-1 ring-inset ring-black/5`}
                        >
                            {cat.name}
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                {SCHEDULE_HOURS.map((hour) => (
                    <div key={hour} className="flex h-12 border-b border-gray-50 last:border-none group">
                        <div className="w-12 flex items-center justify-center bg-gray-50/50 border-r border-gray-100 transition-colors group-hover:bg-gray-100">
                            <span className="text-[11px] font-bold text-gray-400 font-mono">{hour}</span>
                        </div>

                        <div className="flex-1 grid grid-cols-6 relative">
                            {[0, 1, 2, 3, 4, 5].map((slot) => {
                                const minute = slot * 10;
                                const timeKey = `${hour}:${minute < 10 ? '0' + minute : minute}`;
                                const blockCategoryId = studyTimeBlocks[timeKey];
                                const category = blockCategoryId ? getCategoryById(blockCategoryId) : null;

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
                ))}
            </div>
        </div>
    );
}
