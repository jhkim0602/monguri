"use client";

import { useState, useEffect, useRef } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Flag,
    Plus,
    X
} from "lucide-react";
import { DEFAULT_CATEGORIES } from "@/constants/common";
import { SCHEDULE_HOURS, MENTOR_TASKS, USER_TASKS, WEEKLY_SCHEDULE } from "@/constants/mentee";
import TaskDetailModal from "@/components/mentee/planner/TaskDetailModal";
import { generateTimeBlocksFromTasks } from "@/utils/timeUtils";
import Header from "@/components/mentee/layout/Header";
import PlannerTasks from "@/components/mentee/planner/PlannerTasks";
import StudyTimeline from "@/components/mentee/planner/StudyTimeline";
import RecurringDeleteModal from "@/components/mentee/planner/RecurringDeleteModal";
import { supabase } from "@/lib/supabaseClient";
import {
    adaptMentorTasksToUi,
    adaptPlannerTasksToUi,
    adaptProfileToUi,
    type MentorTaskLike,
    type PlannerTaskLike
} from "@/lib/menteeAdapters";

export default function PlannerPage() {
    // 1. State from Sunbal + Head
    const [currentDate, setCurrentDate] = useState(new Date());
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
    const DDAY_STORAGE_PREFIX = "mentee-d-day";
    const DDAY_LABEL_STORAGE_PREFIX = "mentee-d-day-label";
    const [dailyMemo, setDailyMemo] = useState("");
    const [lastSavedDailyMemo, setLastSavedDailyMemo] = useState("");
    const [isSavingDailyMemo, setIsSavingDailyMemo] = useState(false);
    const [memoSaveState, setMemoSaveState] = useState<"idle" | "saved" | "error">("idle");
    const [memoSaveErrorMessage, setMemoSaveErrorMessage] = useState("");
    const [dDayValue, setDDayValue] = useState<number | null>(null);
    const [dDayLabel, setDDayLabel] = useState("D-day");

    // Modal State
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string | number, recurringGroupId: string | null } | null>(null);

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

    const getDailyMemoStorageKey = (userId: string, date: string) =>
        `mentee-daily-memo:${userId}:${date}`;

    const calculateDDay = (targetDateString?: string | null): number | null => {
        if (!targetDateString) return null;
        const targetDate = new Date(`${targetDateString}T00:00:00`);
        if (Number.isNaN(targetDate.getTime())) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return Math.ceil(
            (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );
    };

    const isMissingColumnError = (message: string, columnName: string) =>
        message.toLowerCase().includes("column") &&
        message.toLowerCase().includes(columnName.toLowerCase());

    const saveDailyMemoWithClientSupabase = async (memoText: string) => {
        if (!menteeId) {
            throw new Error("로그인이 필요합니다.");
        }

        const date = toDateString(currentDate);
        const { data: existing, error: existingError } = await supabase
            .from("daily_records")
            .select("*")
            .eq("mentee_id", menteeId)
            .eq("date", date)
            .maybeSingle();

        if (existingError && existingError.code !== "PGRST116") {
            throw new Error(existingError.message);
        }

        const saveByColumn = async (
            columnName: "memo" | "comment" | "daily_goal" | "daily_note" | "note"
        ) => {
            const payload = {
                mentee_id: menteeId,
                date,
                study_time_min: existing?.study_time_min ?? 0,
                mood: existing?.mood ?? "normal",
                [columnName]: memoText,
            };

            const query = existing?.id
                ? supabase.from("daily_records").update(payload).eq("id", existing.id)
                : supabase.from("daily_records").insert({
                    id: crypto.randomUUID(),
                    ...payload,
                });

            const { data, error } = await query.select("*").maybeSingle();

            if (error) {
                throw new Error(error.message);
            }

            const row = (data ?? {}) as Record<string, unknown>;
            const savedMemo = row.memo ?? row.comment ?? memoText;
            return typeof savedMemo === "string" ? savedMemo : memoText;
        };

        const columns = ["memo", "comment", "daily_goal", "daily_note", "note"] as const;
        let lastError: Error | null = null;

        for (const column of columns) {
            try {
                return await saveByColumn(column);
            } catch (error) {
                const message = error instanceof Error ? error.message : "Failed to save memo.";
                if (isMissingColumnError(message, column)) {
                    lastError = error instanceof Error ? error : new Error(message);
                    continue;
                }
                throw new Error(message);
            }
        }

        throw (lastError ?? new Error("일기를 저장할 수 있는 컬럼을 찾지 못했습니다."));
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
                const [mentorRes, plannerRes, subjectsRes, dailyRecordRes, profileRes] = await Promise.all([
                    fetch(`/api/mentee/tasks?menteeId=${user.id}`),
                    fetch(`/api/mentee/planner/tasks?menteeId=${user.id}&date=${dateStr}`),
                    fetch(`/api/subjects`),
                    fetch(`/api/mentee/planner/daily-record?menteeId=${user.id}&date=${dateStr}`),
                    fetch(`/api/mentee/profile?profileId=${user.id}`)
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

                const localDDayDate =
                    localStorage.getItem(`${DDAY_STORAGE_PREFIX}:${user.id}`) ?? null;
                const localDDayLabel =
                    localStorage.getItem(`${DDAY_LABEL_STORAGE_PREFIX}:${user.id}`) ?? null;
                let nextDDayValue = calculateDDay(localDDayDate);
                let nextDDayLabel =
                    localDDayLabel && localDDayLabel.trim().length > 0
                        ? localDDayLabel.trim()
                        : "D-day";

                if (profileRes.ok) {
                    const profileJson = await profileRes.json();
                    const adaptedProfile = adaptProfileToUi(profileJson.profile ?? null);
                    if (nextDDayValue === null) {
                        nextDDayValue = adaptedProfile?.dDay ?? null;
                    }
                    if (
                        (!localDDayLabel || localDDayLabel.trim().length === 0) &&
                        adaptedProfile?.dDayLabel
                    ) {
                        nextDDayLabel = adaptedProfile.dDayLabel;
                    }
                }

                if (isMounted) {
                    setTasks([...mentorTasksForDate, ...plannerTasksForDate]);
                    const localMemo = localStorage.getItem(getDailyMemoStorageKey(user.id, dateStr)) ?? "";
                    if (dailyRecordRes.ok) {
                        const dailyRecordJson = await dailyRecordRes.json();
                        const serverMemo = dailyRecordJson?.dailyRecord?.memo ?? "";
                        const memo = (typeof serverMemo === "string" && serverMemo.length > 0)
                            ? serverMemo
                            : localMemo;
                        setDailyMemo(memo);
                        setLastSavedDailyMemo(memo);
                    } else {
                        setDailyMemo(localMemo);
                        setLastSavedDailyMemo(localMemo);
                    }
                    setMemoSaveState("idle");
                    setMemoSaveErrorMessage("");
                    setDDayValue(nextDDayValue);
                    setDDayLabel(nextDDayLabel);
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

    const handleSaveDailyMemo = async () => {
        if (!menteeId || isSavingDailyMemo) return;

        if (dailyMemo === lastSavedDailyMemo) {
            setMemoSaveState("saved");
            return;
        }

        setIsSavingDailyMemo(true);
        setMemoSaveState("idle");
        setMemoSaveErrorMessage("");

        try {
            const response = await fetch("/api/mentee/planner/daily-record", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    menteeId,
                    date: toDateString(currentDate),
                    memo: dailyMemo,
                }),
            });

            if (!response.ok) {
                const errorJson = await response.json().catch(() => null);
                const errorMessage = errorJson?.error ?? "Failed to save daily memo.";
                throw new Error(errorMessage);
            }

            const json = await response.json();
            const savedMemo = json?.dailyRecord?.memo ?? dailyMemo.trim();
            setDailyMemo(savedMemo);
            setLastSavedDailyMemo(savedMemo);
            localStorage.setItem(getDailyMemoStorageKey(menteeId, toDateString(currentDate)), savedMemo);
            setMemoSaveState("saved");
        } catch (error) {
            try {
                const fallbackSavedMemo = await saveDailyMemoWithClientSupabase(dailyMemo.trim());
                setDailyMemo(fallbackSavedMemo);
                setLastSavedDailyMemo(fallbackSavedMemo);
                localStorage.setItem(getDailyMemoStorageKey(menteeId, toDateString(currentDate)), fallbackSavedMemo);
                setMemoSaveState("saved");
            } catch (fallbackError) {
                console.error("Failed to save daily memo", error, fallbackError);
                const fallbackMemoText = dailyMemo.trim();
                localStorage.setItem(getDailyMemoStorageKey(menteeId, toDateString(currentDate)), fallbackMemoText);
                setLastSavedDailyMemo(fallbackMemoText);
                setMemoSaveState("error");
                setMemoSaveErrorMessage("서버 저장 실패. 현재 기기에 임시 저장되었습니다.");
            }
        } finally {
            setIsSavingDailyMemo(false);
        }
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

    const updateTaskTimeRange = async (taskId: number | string, startTime: string, endTime: string) => {
        const taskIdStr = String(taskId);
        setTasks(prev => prev.map(task => {
            if (String(task.id) === taskIdStr) {
                if (task.isMentorTask) return task;
                return { ...task, startTime, endTime };
            }
            return task;
        }));

        if (!menteeId) return;

        try {
            await fetch(`/api/mentee/planner/tasks/${taskIdStr}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    menteeId,
                    startTime,
                    endTime
                })
            });
        } catch (e) {
            console.error("Failed to update task time range", e);
        }
    };

    const executeDelete = async (taskIdStr: string) => {
        setTasks(prev => prev.filter(task => String(task.id) !== taskIdStr));

        if (!menteeId) return;

        await fetch(`/api/mentee/planner/tasks/${taskIdStr}?menteeId=${menteeId}`, {
            method: "DELETE"
        });
    };

    const handleDeleteRequest = async (taskId: number | string) => {
        const taskIdStr = String(taskId);
        const targetTask = tasks.find(task => String(task.id) === taskIdStr);
        if (!targetTask || targetTask.isMentorTask) return;

        if (targetTask.recurringGroupId) {
            setDeleteTarget({ id: taskId, recurringGroupId: targetTask.recurringGroupId });
        } else {
            await executeDelete(taskIdStr);
        }
    };

    const handleDeleteAll = async () => {
        if (!deleteTarget || !deleteTarget.recurringGroupId) return;

        const groupId = deleteTarget.recurringGroupId;
        setDeleteTarget(null);

        // Optimistic update: remove all tasks with this group ID from current view
        setTasks(prev => prev.filter(task => task.recurringGroupId !== groupId));

        if (!menteeId) return;

        try {
            await fetch(`/api/mentee/planner/groups/${groupId}`, {
                method: "DELETE"
            });
        } catch (e) {
            console.error("Failed to delete group", e);
        }
    };

    const handleDeleteSingle = async () => {
        if (!deleteTarget) return;
        await executeDelete(String(deleteTarget.id));
        setDeleteTarget(null);
    };

    const dailyMentorComment = tasks.reduce<string>((acc, task) => {
        if (acc) return acc;
        const comment = (task as any)?.mentorComment;
        return typeof comment === "string" && comment.trim().length > 0
            ? comment.trim()
            : "";
    }, "");

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
                            {typeof dDayValue === "number"
                                ? `${dDayLabel} ${dDayValue > 0
                                    ? `D-${dDayValue}`
                                    : dDayValue === 0
                                        ? "D-Day"
                                        : `D+${Math.abs(dDayValue)}`}`
                                : `${dDayLabel} 미설정`}
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
                        <textarea
                            placeholder="오늘 하루 요약이나 코멘트를 남겨주세요"
                            value={dailyMemo}
                            onChange={(event) => {
                                setDailyMemo(event.target.value);
                                if (memoSaveState !== "idle") {
                                    setMemoSaveState("idle");
                                }
                            }}
                            className="w-full text-sm placeholder-gray-300 border-none p-0 focus:ring-0 font-medium resize-none min-h-[64px] bg-transparent"
                            maxLength={2000}
                        />
                        <div className="mt-2 flex items-center justify-between">
                            <p className="text-[10px] font-semibold text-gray-400">
                                {memoSaveState === "saved"
                                    ? "저장됨"
                                    : memoSaveState === "error"
                                        ? memoSaveErrorMessage || "저장 실패. 다시 시도해주세요."
                                        : dailyMemo === lastSavedDailyMemo
                                            ? "저장된 코멘트"
                                            : "저장 필요"}
                            </p>
                            <button
                                type="button"
                                onClick={handleSaveDailyMemo}
                                disabled={isSavingDailyMemo || !menteeId}
                                className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors border ${isSavingDailyMemo || !menteeId
                                    ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed"
                                    : "bg-primary text-white border-primary hover:bg-primary/90"
                                    }`}
                            >
                                {isSavingDailyMemo ? "저장 중..." : "코멘트 저장"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-violet-100 shadow-sm">
                    <p className="text-[10px] font-bold text-violet-500 mb-1">멘토 코멘트</p>
                    <p className="text-sm font-medium text-gray-700 leading-relaxed">
                        {dailyMentorComment
                            ? dailyMentorComment
                            : "아직 멘토 코멘트가 등록되지 않았어요."}
                    </p>
                </div>

                <PlannerTasks
                    tasks={tasks}
                    categories={categories}
                    onToggleCompletion={toggleTaskCompletion}
                    onUpdateTaskTimeRange={updateTaskTimeRange}
                    onDelete={handleDeleteRequest}
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

            <RecurringDeleteModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onDeleteSingle={handleDeleteSingle}
                onDeleteAll={handleDeleteAll}
            />

        </div>
    );
}
