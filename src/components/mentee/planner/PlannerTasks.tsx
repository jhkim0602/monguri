"use client";

import { CheckCircle2, Camera, Trash2, Plus, Clock, X } from "lucide-react";
import { DEFAULT_CATEGORIES } from "@/constants/common";
import { useRouter } from "next/navigation";
import { formatTime } from "@/utils/timeUtils";
import { useState } from "react";

const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return "시간 설정";
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    let diffMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    if (diffMinutes < 0) diffMinutes += 24 * 60; // Handle over midnight if needed, though simple subtraction usually suffices for same day

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    if (hours === 0 && minutes === 0) return "시간 설정";
    return `${hours}시간 ${minutes}분`;
};

const TimeRangeInput = ({ startTime, endTime, onSave }: { startTime?: string, endTime?: string, onSave: (s: string, e: string) => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [start, setStart] = useState(startTime || "");
    const [end, setEnd] = useState(endTime || "");

    if (isEditing) {
        return (
            <>
                <div className="fixed inset-0 z-40" onClick={() => setIsEditing(false)} />
                <div className="fixed bg-white p-3 rounded-xl shadow-2xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200 min-w-[220px]"
                     style={{ top: 'auto', left: 'auto', right: 'auto', bottom: 'auto' }}
                     onClick={e => e.stopPropagation()}>
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2 items-center">
                            <input
                                type="time"
                                step="600"
                                value={start}
                                onChange={(e) => setStart(e.target.value)}
                                className="bg-gray-50 flex-1 border border-gray-200 rounded-lg px-2 py-2 text-xs font-mono focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-bold text-gray-700"
                            />
                            <span className="text-gray-300 text-xs font-bold">→</span>
                            <input
                                type="time"
                                step="600"
                                value={end}
                                onChange={(e) => setEnd(e.target.value)}
                                className="bg-gray-50 flex-1 border border-gray-200 rounded-lg px-2 py-2 text-xs font-mono focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-bold text-gray-700"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="text-gray-400 hover:text-gray-600 px-4 py-2 rounded-lg text-xs font-bold transition-colors bg-gray-50 hover:bg-gray-100"
                            >
                                취소
                            </button>
                            <button
                                onClick={() => {
                                    onSave(start, end);
                                    setIsEditing(false);
                                }}
                                className="bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    const duration = calculateDuration(startTime || "", endTime || "");

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all border ${startTime && endTime
                ? 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                : 'bg-white text-gray-400 border-dashed border-gray-300 hover:border-primary hover:text-primary'
                }`}
        >
            <Clock size={14} className={startTime && endTime ? "text-gray-400" : "text-current"} />
            <span className="text-[11px] font-bold font-mono tracking-tight">
                {duration}
            </span>
        </button>
    );
};

interface PlannerTasksProps {
    tasks: any[];
    onToggleCompletion: (id: string | number) => void;
    onUpdateTaskTimeRange: (id: string | number, startTime: string, endTime: string) => void;
    onDelete: (id: string | number) => void;
    onOpenSubmission: (task: any) => void;
    newTaskTitle: string;
    setNewTaskTitle: (val: string) => void;
    selectedCategoryId: string;
    setSelectedCategoryId: (val: string) => void;
    onAddTask: () => void;
}

export default function PlannerTasks({
    tasks,
    onToggleCompletion,
    onUpdateTaskTimeRange,
    onDelete,
    onOpenSubmission,
    newTaskTitle,
    setNewTaskTitle,
    selectedCategoryId,
    setSelectedCategoryId,
    onAddTask
}: PlannerTasksProps) {
    const router = useRouter();
    const getCategoryById = (id: string) => DEFAULT_CATEGORIES.find(c => c.id === id) || DEFAULT_CATEGORIES[0];

    return (
        <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col">
                    <h3 className="text-[17px] font-black text-gray-900 tracking-tight">오늘의 할 일</h3>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">UNIFIED STUDY PLAN</p>
                </div>
                <div className="flex gap-2">
                    <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2.5 py-1 rounded-lg">
                        {tasks.filter(t => t.completed).length}/{tasks.length} 완료
                    </span>
                </div>
            </div>

            {/* Add Task Input Section - Left Aligned */}
            <div className="mb-10 bg-gray-50/50 p-5 rounded-[24px] border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 mb-3 px-1 uppercase tracking-widest text-left">나의 열공 과목 추가</p>
                <div className="flex flex-wrap justify-start gap-2 mb-4">
                    {DEFAULT_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategoryId(cat.id)}
                            className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all border ${selectedCategoryId === cat.id
                                ? `${cat.color} ${cat.textColor} border-transparent shadow-lg scale-105`
                                : `bg-white text-gray-400 border-gray-100 hover:border-gray-300`
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="어떤 공부를 시작할까요?"
                        className="flex-1 text-sm bg-white border border-gray-100 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-bold"
                        onKeyPress={(e) => e.key === 'Enter' && onAddTask()}
                    />
                    <button
                        onClick={onAddTask}
                        className="bg-gray-900 text-white rounded-2xl px-5 py-3.5 hover:bg-black transition-all active:scale-95 shadow-xl shadow-gray-200"
                    >
                        <Plus size={22} strokeWidth={3} />
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {DEFAULT_CATEGORIES.map(category => {
                    const tasksInCategory = tasks.filter(t => t.categoryId === category.id);
                    if (tasksInCategory.length === 0) return null;

                    return (
                        <div key={category.id} className="relative">
                            <div className="flex items-center gap-2 mb-4 pl-1">
                                <div className={`w-1.5 h-4 rounded-full ${category.color}`} />
                                <span className={`text-[12px] font-black ${category.textColor} tracking-tight`}>{category.name}</span>
                                <span className="text-[10px] text-gray-300 font-bold ml-1">{tasksInCategory.length}</span>
                            </div>
                            <div className="space-y-3">
                                {tasksInCategory.map(task => (
                                    <div
                                        key={task.id}
                                        className={`group relative p-4 rounded-[24px] transition-all duration-300 border ${task.isRunning
                                            ? 'bg-white border-blue-200 shadow-xl shadow-blue-100/50 ring-1 ring-blue-100'
                                            : 'bg-white border-gray-50 shadow-sm hover:border-gray-200'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onToggleCompletion(task.id);
                                                }}
                                                className="mt-0.5 relative z-10"
                                            >
                                                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${task.completed
                                                    ? `${category.color} ${category.color.replace('bg-', 'border-')} shadow-sm`
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}>
                                                    {task.completed && <CheckCircle2 size={12} strokeWidth={4} className="text-white" />}
                                                </div>
                                            </button>

                                            <button
                                                className="flex-1 min-w-0 cursor-pointer select-none py-1 text-left hover:opacity-75 transition-opacity active:scale-95 border-none bg-transparent p-0"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    const taskId = String(task.id);
                                                    router.push(`/planner/${taskId}`);
                                                }}
                                                type="button"
                                            >
                                                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                                    {task.isMentorTask && (
                                                        <span className="bg-primary/10 text-primary text-[9px] font-black px-1.5 py-0.5 rounded leading-none uppercase tracking-tighter">
                                                            Mentor
                                                        </span>
                                                    )}
                                                    <p className={`text-[14px] font-bold truncate ${task.completed ? 'text-gray-300 line-through' : 'text-gray-900 font-bold'}`}>
                                                        {task.title}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-[10px] font-mono font-bold ${task.isRunning ? 'text-red-500' : 'text-gray-400'}`}>
                                                        {formatTime(task.timeSpent)}
                                                    </span>
                                                    {task.studyRecord && (
                                                        <span className="text-[9px] text-emerald-500 font-black bg-emerald-50 px-1.5 py-0.5 rounded">기록 제출됨</span>
                                                    )}
                                                </div>
                                            </button>

                                            <div className="flex items-center gap-1 relative">
                                                <TimeRangeInput
                                                    startTime={task.startTime}
                                                    endTime={task.endTime}
                                                    onSave={(start, end) => onUpdateTaskTimeRange(task.id, start, end)}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                                            className="absolute -right-2 -top-2 w-6 h-6 bg-white rounded-full shadow-lg border border-gray-100 text-gray-300 opacity-0 group-hover:opacity-100 transition-all hover:text-red-500 flex items-center justify-center z-10"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {tasks.length === 0 && (
                    <div className="text-center py-16 bg-gray-50/50 rounded-[32px] border-2 border-dashed border-gray-100">
                        <p className="text-gray-400 text-sm font-bold">등록된 할 일이 없습니다.<br /><span className="text-[10px] mt-1 block">첫 계획을 세워보세요!</span></p>
                    </div>
                )}
            </div>
        </div>
    );
}
