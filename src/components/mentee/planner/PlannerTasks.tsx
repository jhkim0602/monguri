"use client";

import { CheckCircle2, Camera, Pause, Play, Trash2, Plus } from "lucide-react";
import { DEFAULT_CATEGORIES } from "@/constants/common";
import { useRouter } from "next/navigation";
import { formatTime } from "@/utils/timeUtils";

interface PlannerTasksProps {
    tasks: any[];
    onToggleCompletion: (id: string | number) => void;
    onToggleTimer: (id: string | number) => void;
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
    onToggleTimer,
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
                                            <button onClick={() => onToggleCompletion(task.id)} className="mt-0.5">
                                                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${task.completed
                                                    ? `${category.color} ${category.color.replace('bg-', 'border-')} shadow-sm`
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}>
                                                    {task.completed && <CheckCircle2 size={12} strokeWidth={4} className="text-white" />}
                                                </div>
                                            </button>

                                            <div className="flex-1 min-w-0" onClick={() => router.push(`/planner/${task.id}`)}>
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
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onOpenSubmission(task); }}
                                                    className={`p-2 rounded-xl transition-all ${task.studyRecord ? 'text-emerald-500 bg-emerald-50' : 'text-gray-400 hover:text-primary hover:bg-blue-50'}`}
                                                    title="기록 제출"
                                                >
                                                    <Camera size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onToggleTimer(task.id); }}
                                                    className={`p-2 rounded-xl transition-all ${task.isRunning ? 'text-red-500 bg-red-50 animate-pulse' : 'text-gray-400 hover:text-primary hover:bg-blue-50'}`}
                                                >
                                                    {task.isRunning ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                                                </button>
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
