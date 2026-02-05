"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import { MENTOR_TASKS } from "@/constants/mentee";

interface DailyFocusSectionProps {
    userName: string;
}

export default function DailyFocusSection({ userName }: DailyFocusSectionProps) {
    // 3 Major Subjects
    const SUBJECTS = [
        { id: 'korean', name: '국어', color: 'text-emerald-500', bg: 'bg-emerald-500', ring: 'border-emerald-100' },
        { id: 'math', name: '수학', color: 'text-blue-500', bg: 'bg-blue-500', ring: 'border-blue-100' },
        { id: 'english', name: '영어', color: 'text-purple-500', bg: 'bg-purple-500', ring: 'border-purple-100' },
    ];

    // Calculate real progress from MENTOR_TASKS
    const [progressData, setProgressData] = useState<Record<string, number>>({
        korean: 0,
        math: 0,
        english: 0
    });

    useEffect(() => {
        // Simple logic: Count completed vs total per subject in MENTOR_TASKS
        // Group by subject (or categoryId)
        const stats: Record<string, { total: number; completed: number }> = {
            korean: { total: 0, completed: 0 },
            math: { total: 0, completed: 0 },
            english: { total: 0, completed: 0 }
        };

        MENTOR_TASKS.forEach(task => {
            // Map categoryId to our keys (korean, math, english)
            // Assuming MENTOR_TASKS has categoryId matching these or mapped
            const key = task.categoryId;
            if (stats[key]) {
                stats[key].total++;
                if (task.status !== 'pending') {
                    stats[key].completed++;
                }
            }
        });

        const newProgress = {
            korean: stats.korean.total ? Math.round((stats.korean.completed / stats.korean.total) * 100) : 0,
            math: stats.math.total ? Math.round((stats.math.completed / stats.math.total) * 100) : 0,
            english: stats.english.total ? Math.round((stats.english.completed / stats.english.total) * 100) : 0,
        };

        setProgressData(newProgress);
    }, []);

    // Recommendation State
    const [focusSubject, setFocusSubject] = useState<any>(null);
    const [recommendTask, setRecommendTask] = useState<any>(null);

    useEffect(() => {
        // Logic: Find subject with lowest progress
        const sortedSubjects = [...SUBJECTS].sort((a, b) => {
            const progressA = progressData[a.id] || 0;
            const progressB = progressData[b.id] || 0;
            return progressA - progressB;
        });

        const lowestSubject = sortedSubjects[0];
        setFocusSubject(lowestSubject);

        // Find a pending task for this subject
        // Note: Using MENTOR_TASKS mock. In real app, filter by date=today & subject
        const task = MENTOR_TASKS.find(t =>
            (t.subject === lowestSubject.name || t.categoryId === lowestSubject.id) &&
            t.status === 'pending'
        );

        // Fallback if no specific task found
        setRecommendTask(task || {
            id: 'mock-rec',
            title: `${lowestSubject.name} 기초 개념 복습`,
            description: '부족한 부분을 채워보세요!'
        });

    }, []);

    // Helper for Donut Chart (SVG)
    const renderDonut = (percentage: number, colorClass: string) => {
        const radius = 16;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;

        return (
            <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="transform -rotate-90 w-full h-full">
                    {/* Background Circle */}
                    <circle
                        cx="24"
                        cy="24"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        className="text-gray-100"
                    />
                    {/* Progress Circle */}
                    <circle
                        cx="24"
                        cy="24"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className={`${colorClass} transition-all duration-1000 ease-out`}
                    />
                </svg>
                <span className={`absolute text-[10px] font-black ${colorClass}`}>
                    {percentage}%
                </span>
            </div>
        );
    };

    return (
        <section className="px-6 mb-8 mt-2">
            <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-1.5 mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Learning Status</p>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 leading-snug">
                            <span className={focusSubject?.color}>{focusSubject?.name}</span>가 부족해요!<br />
                            지금 바로 시작할까요?
                        </h3>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="flex items-center justify-around bg-gray-50 rounded-2xl p-4 mb-5">
                    {SUBJECTS.map(subject => (
                        <div key={subject.id} className="flex flex-col items-center gap-2">
                            {renderDonut(progressData[subject.id], subject.color)}
                            <span className="text-[11px] font-bold text-gray-500">{subject.name}</span>
                        </div>
                    ))}
                </div>

                {/* Recommendation Card */}
                {recommendTask && (
                    <Link href={`/planner`} className="block group">
                        <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 flex items-center justify-between group-hover:bg-primary/10 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full ${focusSubject?.bg} flex items-center justify-center text-white shadow-sm`}>
                                    <CheckCircle2 size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-primary mb-0.5">추천 학습</p>
                                    <p className="text-sm font-bold text-gray-900 group-hover:underline decoration-primary/30 underline-offset-4">
                                        {recommendTask.title}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
                        </div>
                    </Link>
                )}
            </div>
        </section>
    );
}
