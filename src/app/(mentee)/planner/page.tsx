"use client";

import { useState, useEffect, useRef } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Flag,
    Plus,
    X
} from "lucide-react";
import { DEFAULT_CATEGORIES, USER_PROFILE } from "@/constants/common";
import { SCHEDULE_HOURS, MENTOR_TASKS, USER_TASKS, WEEKLY_SCHEDULE } from "@/constants/mentee";
import TaskDetailModal from "@/components/mentee/planner/TaskDetailModal";
import { generateTimeBlocksFromTasks } from "@/utils/timeUtils";
import Header from "@/components/mentee/layout/Header";
import PlannerTasks from "@/components/mentee/planner/PlannerTasks";
import StudyTimeline from "@/components/mentee/planner/StudyTimeline";
import TaskDetailView from "@/components/mentee/planner/TaskDetailView"; // From HEAD maybe?
import { supabase } from "@/lib/supabaseClient";
import {
    adaptMentorTasksToUi,
    adaptPlannerTasksToUi,
    type MentorTaskLike,
    type PlannerTaskLike
} from "@/lib/menteeAdapters";

export default function PlannerPage() {
    // 1. State from Sunbal + Head
    const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 2)); // Feb 2, 2026
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [selectedCategoryId, setSelectedCategoryId] = useState(DEFAULT_CATEGORIES[0].id);

    // Grid & Tasks State
    const [studyTimeBlocks, setStudyTimeBlocks] = useState<{ [key: string]: string }>({});
    const [tasks, setTasks] = useState<Array<MentorTaskLike | PlannerTaskLike>>([]);
    const [newTaskTitle, setNewTaskTitle] = useState("");

    // Auth & Loading State (from HEAD)
    const [menteeId, setMenteeId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const hasLoadedRef = useRef(false);

    // Modal State
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Helpers
    const isSameDay = (date1: Date, date2: Date) => {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    };

    const toDateString = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const handleAddCategory = (name: string) => {
        const newId = name.toLowerCase().replace(/\s+/g, '-');
        // Simple color rotation or random color
        const colors = [
            { colorHex: "#E9D5FF", textColorHex: "#7E22CE" },
            { colorHex: "#FED7AA", textColorHex: "#C2410C" },
            { colorHex: "#FEF08A", textColorHex: "#A16207" },
            { colorHex: "#C7D2FE", textColorHex: "#4338CA" }
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

    // 2. Data Fetching (HEAD Logic)
    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            if (!hasLoadedRef.current) {
                setIsLoading(true);
            }
            try {
                const { data } = await supabase.auth.getUser();
                const user = data?.user;
                if (!user) {
                    console.log("No user found");
                    return;
                }

                if (isMounted) {
                    setMenteeId(user.id);
                }

                const dateStr = toDateString(currentDate);
                const [mentorRes, plannerRes, subjectsRes] = await Promise.all([
                    fetch(`/api/mentee/tasks?menteeId=${user.id}`),
                    fetch(`/api/mentee/planner/tasks?menteeId=${user.id}&date=${dateStr}`),
                    fetch(`/api/subjects`)
                ]);

                if (subjectsRes.ok) {
                    const subjectsJson = await subjectsRes.json();
                    if (isMounted && Array.isArray(subjectsJson.subjects) && subjectsJson.subjects.length > 0) {
                        const nextCategories = subjectsJson.subjects.map((subject: any) => {
                            const fallback =
                                DEFAULT_CATEGORIES.find((cat) => cat.id === subject.slug) ??
                                DEFAULT_CATEGORIES[0];
                            return {
                                id: subject.slug ?? subject.id,
                                name: subject.name,
                                colorHex: subject.colorHex ?? fallback.colorHex,
                                textColorHex: subject.textColorHex ?? fallback.textColorHex,
                            };
                        });
                        setCategories(nextCategories);
                        if (!nextCategories.find((cat: any) => cat.id === selectedCategoryId)) {
                            setSelectedCategoryId(nextCategories[0]?.id ?? DEFAULT_CATEGORIES[0].id);
                        }
                    }
                }

                let mentorTasksForDate: MentorTaskLike[] = [];
                if (mentorRes.ok) {
                    const mentorJson = await mentorRes.json();
                    if (Array.isArray(mentorJson.tasks)) {
                        mentorTasksForDate = adaptMentorTasksToUi(mentorJson.tasks)
                            .filter((task) => task.deadline && isSameDay(task.deadline, currentDate))
                            .map((task) => ({
                                ...task,
                                id: String(task.id),
                                timeSpent: 0,
                                isRunning: false,
                                studyRecord: task.studyRecord ?? null,
                                isMentorTask: true,
                            }));
                    }
                }

                let plannerTasksForDate: PlannerTaskLike[] = [];
                if (plannerRes.ok) {
                    const plannerJson = await plannerRes.json();
                    if (Array.isArray(plannerJson.tasks)) {
                        plannerTasksForDate = adaptPlannerTasksToUi(plannerJson.tasks).map((task) => ({
                            ...task,
                            timeSpent: task.timeSpent ?? 0,
                            isRunning: false,
                            isMentorTask: false,
                        }));
                    }
                }

                if (isMounted) {
                    setTasks([...mentorTasksForDate, ...plannerTasksForDate]);
                }
            } catch (e) {
                console.error("Failed to load planner data", e);
            } finally {
                if (isMounted && !hasLoadedRef.current) {
                    setIsLoading(false);
                    hasLoadedRef.current = true;
                }
            }
        };

        load();

        return () => {
            isMounted = false;
        };
    }, [currentDate]);

    // Sync studyTimeBlocks with tasks (UI Logic)
    useEffect(() => {
        setStudyTimeBlocks(generateTimeBlocksFromTasks(tasks));
    }, [tasks]);

    // Handlers
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

    const addTask = async () => {
        if (!newTaskTitle.trim()) return;

        // Optimistic update if needed, but here we just rely on API response
        // Wait, for better UX locally, let's wait for API.

        if (!menteeId) {
            // Fallback for no auth? Or just ignore.
            return;
        }

        const payload = {
            menteeId,
            title: newTaskTitle.trim(),
            date: toDateString(currentDate),
            subjectSlug: selectedCategoryId || null,
        };

        try {
            const response = await fetch("/api/mentee/planner/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const json = await response.json();
                const createdTask = json?.task ? adaptPlannerTasksToUi([json.task])[0] : null;
                if (createdTask) { // Explicitly mapping only essential fields
                    setTasks(prev => [...prev, {
                        ...createdTask,
                        isRunning: false,
                        isMentorTask: false,
                        timeSpent: 0
                    }]);
                }
                setNewTaskTitle("");
            }
        } catch (e) {
            console.error("Failed to add task", e);
        }
    };

    const toggleTaskCompletion = async (taskId: number | string) => {
        const taskIdStr = String(taskId);
        const targetTask = tasks.find(task => String(task.id) === taskIdStr);
        if (!targetTask || targetTask.isMentorTask) return;

        const nextCompleted = !targetTask.completed;
        // Optimistic update
        setTasks(prev => prev.map(task => {
            if (String(task.id) === taskIdStr) {
                return { ...task, completed: nextCompleted, status: nextCompleted ? 'submitted' : 'pending' };
            }
            return task;
        }));

        if (!menteeId) return;

        await fetch(`/api/mentee/planner/tasks/${taskIdStr}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                menteeId,
                completed: nextCompleted
            })
        });
    };

    const updateTaskTimeRange = (taskId: number | string, startTime: string, endTime: string) => {
        const taskIdStr = String(taskId);
        setTasks(prev => prev.map(task => {
            if (String(task.id) === taskIdStr) {
                if (task.isMentorTask) return task;
                return { ...task, startTime, endTime };
            }
            return task;
        }));
        // Note: API update for time range is not implemented here yet, assuming local only for drag? 
        // Or if it was implemented, it should be here.
        // Based on HEAD, it wasn't explicitly in the snippet I saw, but I should probably leave it as local state update for now 
        // unless I see an API call in the conflict block. 
        // HEAD didn't have updateTaskTimeRange in the snippet shown! Sunbal had it.
        // So this is purely UI state update.
    };

    const deleteTask = async (taskId: number | string) => {
        const taskIdStr = String(taskId);
        const targetTask = tasks.find(task => String(task.id) === taskIdStr);
        if (!targetTask || targetTask.isMentorTask) return;

        setTasks(prev => prev.filter(task => String(task.id) !== taskIdStr));

        if (!menteeId) return;

        await fetch(`/api/mentee/planner/tasks/${taskIdStr}?menteeId=${menteeId}`, {
            method: "DELETE"
        });
    };

    if (isLoading) {
        return <div className="min-h-screen bg-gray-50" />;
    }

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
