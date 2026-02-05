"use client";

import { CheckCircle2, Camera, Trash2, Plus, Clock, X, ChevronUp, ChevronDown, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatTime } from "@/utils/timeUtils";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

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

// 10분 단위 시간 선택기 + 키보드 입력 지원
const TimeSpinner = ({ time, onTimeChange }: { time: string; onTimeChange: (t: string) => void }) => {
    const [hours, minutes] = time ? time.split(':').map(Number) : [0, 0];
    const [hInput, setHInput] = useState(String(hours).padStart(2, '0'));
    const [mInput, setMInput] = useState(String(minutes).padStart(2, '0'));

    useEffect(() => {
        const [h, m] = time ? time.split(':').map(Number) : [0, 0];
        setHInput(String(h).padStart(2, '0'));
        setMInput(String(m).padStart(2, '0'));
    }, [time]);

    const handleHourChange = (delta: number) => {
        let newHour = hours + delta;
        if (newHour < 0) newHour = 23;
        if (newHour > 23) newHour = 0;
        updateTime(newHour, minutes);
    };

    const handleMinuteChange = (delta: number) => {
        let newMinute = minutes + (delta * 10);
        let newHour = hours;

        if (newMinute < 0) {
            newMinute = 50;
            newHour = newHour - 1 < 0 ? 23 : newHour - 1;
        }
        if (newMinute > 50) {
            newMinute = 0;
            newHour = newHour + 1 > 23 ? 0 : newHour + 1;
        }

        updateTime(newHour, newMinute);
    };

    const updateTime = (h: number, m: number) => {
        const hStr = String(h).padStart(2, '0');
        const mStr = String(m).padStart(2, '0');
        onTimeChange(`${hStr}:${mStr}`);
    };

    const handleHourBlur = () => {
        let val = parseInt(hInput, 10);
        if (isNaN(val)) val = 0;
        if (val < 0) val = 0;
        if (val > 23) val = 23;
        updateTime(val, minutes);
        setHInput(String(val).padStart(2, '0'));
    };

    const handleMinuteBlur = () => {
        let val = parseInt(mInput, 10);
        if (isNaN(val)) val = 0;

        // Round to nearest 10
        let rounded = Math.round(val / 10) * 10;
        let nextHour = hours;

        if (rounded === 60) {
            rounded = 0;
            nextHour = nextHour + 1 > 23 ? 0 : nextHour + 1;
        }

        updateTime(nextHour, rounded);
        setHInput(String(nextHour).padStart(2, '0'));
        setMInput(String(rounded).padStart(2, '0'));
    };

    return (
        <div className="flex items-center justify-center gap-1.5 bg-gray-50/80 rounded-xl p-2 border border-gray-100 w-full shadow-inner">
            {/* 시간 스피너 */}
            <div className="flex flex-col items-center gap-0.5">
                <button
                    onClick={() => handleHourChange(1)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-all p-0.5"
                    type="button"
                    tabIndex={-1}
                >
                    <ChevronUp size={12} />
                </button>
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={hInput}
                    onChange={(e) => setHInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
                    onBlur={handleHourBlur}
                    className="text-sm font-black text-gray-900 w-8 text-center tabular-nums bg-white rounded-md border border-gray-100 py-1 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
                <button
                    onClick={() => handleHourChange(-1)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-all p-0.5"
                    type="button"
                    tabIndex={-1}
                >
                    <ChevronDown size={12} />
                </button>
            </div>

            <span className="text-xs text-gray-300 font-bold pb-1">:</span>

            {/* 분 스피너 */}
            <div className="flex flex-col items-center gap-0.5">
                <button
                    onClick={() => handleMinuteChange(1)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-all p-0.5"
                    type="button"
                    tabIndex={-1}
                >
                    <ChevronUp size={12} />
                </button>
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={mInput}
                    onChange={(e) => setMInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
                    onBlur={handleMinuteBlur}
                    className="text-sm font-black text-gray-900 w-8 text-center tabular-nums bg-white rounded-md border border-gray-100 py-1 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
                <button
                    onClick={() => handleMinuteChange(-1)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-all p-0.5"
                    type="button"
                    tabIndex={-1}
                >
                    <ChevronDown size={12} />
                </button>
            </div>
        </div>
    );
};

const TimeRangeInput = ({ startTime, endTime, onSave }: { startTime?: string, endTime?: string, onSave: (s: string, e: string) => void }) => {
    const [isEditing, setIsEditing] = useState(false);

    // Helper to get current time string
    const getCurrentTimeStr = () => {
        const now = new Date();
        const h = now.getHours();
        const m = Math.floor(now.getMinutes() / 10) * 10;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    // Helper to add 1 hour
    const addOneHour = (timeStr: string) => {
        const [h, m] = timeStr.split(':').map(Number);
        const newH = (h + 1) % 24;
        return `${String(newH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const [start, setStart] = useState(startTime || "06:00");
    const [end, setEnd] = useState(endTime || "07:00");

    // Initialize with smart defaults when opening
    useEffect(() => {
        if (isEditing && !startTime && !endTime) {
            const nowStr = getCurrentTimeStr();
            setStart(nowStr);
            setEnd(addOneHour(nowStr));
        } else if (isEditing) {
            // Reset to props if existing
            if (startTime) setStart(startTime);
            if (endTime) setEnd(endTime);
        }
    }, [isEditing, startTime, endTime]);

    const handleSetToNow = () => {
        const nowStr = getCurrentTimeStr();
        setStart(nowStr);
        setEnd(addOneHour(nowStr));
    };

    if (isEditing) {
        return createPortal(
            <>
                <div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm" onClick={() => setIsEditing(false)} />
                <div className="fixed z-[10000] bg-white rounded-[24px] shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 p-5 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-[320px]"
                    onClick={e => e.stopPropagation()}>
                    <div className="flex flex-col gap-4">
                        {/* 헤더 */}
                        <div className="text-center border-b border-gray-50 pb-3 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-black text-gray-900">시간 설정</h3>
                                <p className="text-[10px] text-gray-400 font-bold mt-0.5">10분 단위로 설정</p>
                            </div>
                            <button
                                onClick={handleSetToNow}
                                className="px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold rounded-lg transition-colors"
                            >
                                현재 시간
                            </button>
                        </div>

                        {/* 시간 선택 영역 */}
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 flex flex-col items-center gap-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Start</label>
                                <TimeSpinner time={start} onTimeChange={setStart} />
                            </div>
                            <div className="h-full pt-4 text-gray-300">
                                <ArrowRight size={14} />
                            </div>
                            <div className="flex-1 flex flex-col items-center gap-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tight">End</label>
                                <TimeSpinner time={end} onTimeChange={setEnd} />
                            </div>
                        </div>

                        {/* 예상 시간 */}
                        <div className="bg-blue-50/50 rounded-xl px-3 py-2.5 border border-blue-100 flex items-center justify-between">
                            <p className="text-[10px] text-blue-600 font-bold">총 학습량</p>
                            <p className="text-xs font-black text-blue-700">{calculateDuration(start, end)}</p>
                        </div>

                        {/* 버튼 */}
                        <div className="flex gap-2 pt-1">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="flex-1 text-gray-500 hover:text-gray-900 hover:bg-gray-50 px-3 py-2.5 rounded-xl text-xs font-bold transition-all"
                            >
                                취소
                            </button>
                            <button
                                onClick={() => {
                                    onSave(start, end);
                                    setIsEditing(false);
                                }}
                                className="flex-1 bg-gray-900 hover:bg-black text-white px-3 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-gray-200"
                            >
                                저장
                            </button>
                        </div>
                    </div>
                </div>

            </>,
            document.body
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
            <span className="text-[11px] font-bold tabular-nums tracking-tight">
                {duration}
            </span>
        </button>
    );
};

interface PlannerTasksProps {
    tasks: any[];
    categories: any[];
    onToggleCompletion: (id: string | number) => void;
    onUpdateTaskTimeRange: (id: string | number, startTime: string, endTime: string) => void;
    onDelete: (id: string | number) => void;
    onOpenSubmission: (task: any) => void;
    newTaskTitle: string;
    setNewTaskTitle: (val: string) => void;
    selectedCategoryId: string;
    setSelectedCategoryId: (val: string) => void;
    onAddTask: () => void;
    onAddCategory: (name: string) => any;
}

export default function PlannerTasks({
    tasks,
    categories,
    onToggleCompletion,
    onUpdateTaskTimeRange,
    onDelete,
    onOpenSubmission,
    newTaskTitle,
    setNewTaskTitle,
    selectedCategoryId,
    setSelectedCategoryId,
    onAddTask,
    onAddCategory
}: PlannerTasksProps) {
    const router = useRouter();
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    const handleAddCategorySubmit = () => {
        if (!newCategoryName.trim()) return;
        const newCat = onAddCategory(newCategoryName);
        setSelectedCategoryId(newCat.id);
        setNewCategoryName("");
        setIsAddingCategory(false);
    };

    const getCategoryById = (id: string) => categories.find(c => c.id === id) || categories[0];

    return (
        <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col">
                    <h3 className="text-[17px] font-black text-gray-900 tracking-tight">오늘의 할 일</h3>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">UNIFIED STUDY PLAN</p>
                </div>
                <div className="flex gap-2">
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                        {tasks.filter(t => t.completed).length}/{tasks.length} 완료
                    </span>
                </div>
            </div>

            {/* Add Task Input Section - Left Aligned */}
            <div className="mb-10 bg-gray-50/50 p-5 rounded-[24px] border border-gray-100 animate-slide-up">
                <div className="flex flex-wrap justify-start gap-2 mb-4">
                    {categories.map(cat => {
                        const isSelected = selectedCategoryId === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategoryId(cat.id)}
                                className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all border ${isSelected
                                    ? "border-transparent shadow-lg scale-105"
                                    : "bg-white text-gray-400 border-gray-100 hover:border-gray-300"
                                    }`}
                                style={
                                    isSelected
                                        ? { backgroundColor: cat.colorHex, color: cat.textColorHex }
                                        : undefined
                                }
                            >
                                {cat.name}
                            </button>
                        );
                    })}
                    {isAddingCategory ? (
                        <div className="flex items-center gap-1 animate-slide-in-right duration-200">
                            <input
                                autoFocus
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="과목명"
                                className="w-24 px-3 py-2 rounded-xl text-[11px] font-black border border-primary outline-none"
                                onKeyPress={(e) => e.key === 'Enter' && handleAddCategorySubmit()}
                            />
                            <button
                                onClick={handleAddCategorySubmit}
                                className="p-2 bg-primary text-white rounded-xl hover:bg-blue-600 transition-all"
                            >
                                <Plus size={14} strokeWidth={3} />
                            </button>
                            <button
                                onClick={() => setIsAddingCategory(false)}
                                className="p-2 bg-gray-100 text-gray-400 rounded-xl hover:bg-gray-200 transition-all"
                            >
                                <X size={14} strokeWidth={3} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAddingCategory(true)}
                            className="px-4 py-2 rounded-xl text-[11px] font-black transition-all border border-dashed border-gray-300 text-gray-400 hover:border-primary hover:text-primary flex items-center gap-1.5"
                        >
                            <Plus size={12} />
                            과목 추가
                        </button>
                    )}
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
                {categories.map(category => {
                    const tasksInCategory = tasks.filter(t => t.categoryId === category.id);
                    if (tasksInCategory.length === 0) return null;

                    return (
                        <div key={category.id} className="relative">
                            <div className="flex items-center gap-2 mb-4 pl-1">
                                <div
                                    className="w-1.5 h-4 rounded-full"
                                    style={{ backgroundColor: category.colorHex }}
                                />
                                <span
                                    className="text-[12px] font-black tracking-tight"
                                    style={{ color: category.textColorHex }}
                                >
                                    {category.name}
                                </span>
                                <span className="text-[10px] text-gray-300 font-bold ml-1">{tasksInCategory.length}</span>
                            </div>
                            <div className="space-y-3">
                                {tasksInCategory.map(task => (
                                    <div
                                        key={task.id}
                                        className={`group relative p-4 rounded-[24px] transition-all duration-300 border animate-slide-up ${task.isRunning
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
                                                <div
                                                    className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${task.completed
                                                        ? 'shadow-sm'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    style={
                                                        task.completed
                                                            ? {
                                                                backgroundColor: category.colorHex,
                                                                borderColor: category.colorHex,
                                                            }
                                                            : undefined
                                                    }
                                                >
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
                                                    <span className={`text-[10px] tabular-nums font-bold ${task.isRunning ? 'text-red-500' : 'text-gray-400'}`}>
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

                                        {!task.isMentorTask && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                                                className="absolute -right-2 -top-2 w-6 h-6 bg-white rounded-full shadow-lg border border-gray-100 text-gray-300 opacity-0 group-hover:opacity-100 transition-all hover:text-red-500 flex items-center justify-center z-10"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        )}
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
