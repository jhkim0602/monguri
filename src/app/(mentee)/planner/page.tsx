"use client";

import { useState, useEffect } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Flag,
    Plus,
    X
} from "lucide-react";
import { DEFAULT_CATEGORIES, USER_PROFILE } from "@/constants/common";
import { SCHEDULE_HOURS, MENTOR_TASKS, USER_TASKS } from "@/constants/mentee";
import TaskDetailModal from "@/components/mentee/planner/TaskDetailModal";
import { formatTime, generateTimeBlocksFromTasks } from "@/utils/timeUtils";
import Header from "@/components/mentee/layout/Header";
import PlannerTasks from "@/components/mentee/planner/PlannerTasks";
import StudyTimeline from "@/components/mentee/planner/StudyTimeline";

export default function PlannerPage() {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 2)); // Feb 2, 2026
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [selectedCategoryId, setSelectedCategoryId] = useState(DEFAULT_CATEGORIES[0].id);

    const handleAddCategory = (name: string) => {
        const newId = name.toLowerCase().replace(/\s+/g, '-');
        // Simple color rotation or random color
        const colors = [
            { color: "bg-purple-200", textColor: "text-purple-700" },
            { color: "bg-orange-200", textColor: "text-orange-700" },
            { color: "bg-yellow-200", textColor: "text-yellow-700" },
            { color: "bg-indigo-200", textColor: "text-indigo-700" }
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const newCategory = {
            id: newId,
            name,
            ...randomColor
        };

        setCategories([...categories, newCategory]);
        return newCategory;
    };


    // Submission Modal State
    // Grid state
    // Grid state
    const [studyTimeBlocks, setStudyTimeBlocks] = useState<{ [key: string]: string }>({});

    // Unified Tasks State
    const [tasks, setTasks] = useState<any[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState("");

    // Task Detail Modal State
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isSameDay = (date1: Date, date2: Date) => {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    };

    const CALENDAR_EVENTS_KEY = "mentee-calendar-events";
    const PLANNER_TASKS_KEY = "planner-day-tasks";
    const pad2 = (value: number) => String(value).padStart(2, "0");
    const formatDateInput = (date: Date) =>
        `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
    const parseDateInput = (value: string) => {
        const [year, month, day] = value.split("-").map(Number);
        return new Date(year, month - 1, day);
    };
    const getCustomEventsForDate = (date: Date) => {
        if (typeof window === 'undefined') return [];
        const raw = localStorage.getItem(CALENDAR_EVENTS_KEY);
        if (!raw) return [];
        try {
            const events = JSON.parse(raw) as { id: string; title: string; categoryId: string; date: string }[];
            return events.filter((event) => isSameDay(parseDateInput(event.date), date));
        } catch {
            return [];
        }
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            const raw = localStorage.getItem(PLANNER_TASKS_KEY);
            if (raw) {
                try {
                    const data = JSON.parse(raw) as Record<string, any[]>;
                    const saved = data[formatDateInput(currentDate)];
                    if (Array.isArray(saved) && saved.length > 0) {
                        setTasks(saved);
                        return;
                    }
                } catch {
                    // ignore parse errors
                }
            }
        }

        const initialMentorTasks = MENTOR_TASKS
            .filter(t => t.deadline && isSameDay(t.deadline, currentDate))
            .map(t => ({
                ...t,
                id: String(t.id), // 🔧 ID를 string으로 표준화
                isMentorTask: true,
                completed: t.status === 'feedback_completed',
                timeSpent: 0,
                isRunning: false,
                studyRecord: null
            }));

        // ✏️ USER_TASKS를 constants에서 가져와서 사용
        const initialUserTasks = USER_TASKS.map(t => ({
            ...t,
            timeSpent: 0,
            isRunning: false
        }));

        const customEvents = getCustomEventsForDate(currentDate).map((event) => {
            const category = DEFAULT_CATEGORIES.find(c => c.id === event.categoryId) || DEFAULT_CATEGORIES[0];
            return {
                id: String(event.id),
                title: event.title,
                categoryId: event.categoryId,
                description: "캘린더에서 추가한 반복 일정",
                status: "pending",
                badgeColor: `${category.color} ${category.textColor}`,
                completed: false,
                timeSpent: 0,
                isRunning: false,
                isMentorTask: false,
                studyRecord: null,
                isCustomEvent: true,
            };
        });

        setTasks([...initialMentorTasks, ...initialUserTasks, ...customEvents]);
    }, [currentDate]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const raw = localStorage.getItem(PLANNER_TASKS_KEY);
        let data: Record<string, any[]> = {};
        if (raw) {
            try {
                data = JSON.parse(raw);
            } catch {
                data = {};
            }
        }
        data[formatDateInput(currentDate)] = tasks;
        localStorage.setItem(PLANNER_TASKS_KEY, JSON.stringify(data));
    }, [tasks, currentDate]);

    // Sync studyTimeBlocks with tasks
    useEffect(() => {
        setStudyTimeBlocks(generateTimeBlocksFromTasks(tasks));
    }, [tasks]);

    const handlePrevDay = () => {
        const prev = new Date(currentDate);
        prev.setDate(prev.getDate() - 1);
        setCurrentDate(prev);
    };

    const handleNextDay = () => {
        const next = new Date(currentDate);
        next.setDate(next.getDate() + 1);
        setCurrentDate(next);
    };



    const addTask = () => {
        if (!newTaskTitle.trim()) return;
        const newTask = {
            id: String(Date.now()), // 🔧 ID를 string으로 생성
            title: newTaskTitle,
            categoryId: selectedCategoryId,
            completed: false,
            timeSpent: 0,
            isRunning: false,
            isMentorTask: false,
            studyRecord: null,
            status: "pending",
            deadline: new Date(currentDate),
            isDynamic: true
        };
        setTasks([...tasks, newTask]);
        setNewTaskTitle("");
    };

    const toggleTaskCompletion = (taskId: number | string) => {
        const taskIdStr = String(taskId);
        setTasks(prev => prev.map(task => {
            if (String(task.id) === taskIdStr) {
                if (task.isMentorTask) {
                    return task;
                }
                const nextCompleted = !task.completed;
                return { ...task, completed: nextCompleted, status: nextCompleted ? 'submitted' : 'pending' };
            }
            return task;
        }));
    };

    const updateTaskTimeRange = (taskId: number | string, startTime: string, endTime: string) => {
        const taskIdStr = String(taskId);
        let targetTask: any = null;

        setTasks(prev => prev.map(task => {
            if (String(task.id) === taskIdStr) {
                targetTask = { ...task, startTime, endTime };
                return targetTask;
            }
            return task;
        }));

        // Auto-fill time blocks is now handled by useEffect on tasks change
    };

    const deleteTask = (taskId: number | string) => {
        const taskIdStr = String(taskId);
        setTasks(prev => prev.filter(task => String(task.id) !== taskIdStr));
    };


    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            <Header
                title="학습 플래너"
                variant="clean"
            />

            {/* Date Navigator */}
            <section className="bg-white border-b border-gray-100 px-4 py-3 mb-4">
                <div className="flex items-center justify-between">
                    <button onClick={handlePrevDay} className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-gray-800">
                            {currentDate.getMonth() + 1}월 {currentDate.getDate()}일 ({['일', '월', '화', '수', '목', '금', '토'][currentDate.getDay()]})
                        </h2>
                        <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            D-{USER_PROFILE.dDay}
                        </span>
                    </div>
                    <button onClick={handleNextDay} className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </section>

            <div className="px-4 space-y-4 pb-8">
                {/* Mentee Comment Card */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <Flag size={18} className="text-orange-500 fill-orange-500" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-bold text-gray-400 mb-1">멘티 코멘트</p>
                        <input
                            type="text"
                            placeholder="오늘 하루 요약이나 코멘트를 남겨주세요"
                            className="w-full text-sm placeholder-gray-300 border-none p-0 focus:ring-0 font-medium"
                        />
                    </div>
                </div>

                <PlannerTasks
                    tasks={tasks}
                    categories={categories}
                    onToggleCompletion={toggleTaskCompletion}
                    onUpdateTaskTimeRange={updateTaskTimeRange}
                    onDelete={deleteTask}
                    newTaskTitle={newTaskTitle}
                    setNewTaskTitle={setNewTaskTitle}
                    selectedCategoryId={selectedCategoryId}
                    setSelectedCategoryId={setSelectedCategoryId}
                    onAddTask={addTask}
                    onAddCategory={handleAddCategory}
                />

                <StudyTimeline
                    studyTimeBlocks={studyTimeBlocks}
                    categories={categories}
                />
            </div>

            <TaskDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                task={selectedTask}
            />

        </div>
    );
}
