"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Flag,
    Plus,
    X,
    MessageCircle,
    Check,
    Loader2
} from "lucide-react";
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
    type PlannerTaskLike,
    type UiProfile
} from "@/lib/menteeAdapters";
import {
    readMenteePlannerCache,
    writeMenteePlannerCache
} from "@/lib/menteePlannerCache";
import {
    mergeSubjectCategories,
    UNKNOWN_SUBJECT_CATEGORY,
    type SubjectCategory,
} from "@/lib/subjectCategory";

export default function PlannerPage() {
    // 1. State from Sunbal + Head
    const [currentDate, setCurrentDate] = useState(new Date());
    const [categories, setCategories] = useState<SubjectCategory[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState("");

    // Grid & Tasks State
    const [studyTimeBlocks, setStudyTimeBlocks] = useState<{ [key: string]: string }>({});
    const [tasks, setTasks] = useState<Array<MentorTaskLike | PlannerTaskLike>>([]);
    const [newTaskTitle, setNewTaskTitle] = useState("");

    // Auth & Loading State (from HEAD)
    const [menteeId, setMenteeId] = useState<string | null>(null);
    const [profile, setProfile] = useState<UiProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const hasLoadedRef = useRef(false);
    const forceRefreshRef = useRef(false);
    const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [refreshTick, setRefreshTick] = useState(0);

    // Modal State
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string | number, recurringGroupId: string | null } | null>(null);

    // Daily Comment State
    const [menteeComment, setMenteeComment] = useState("");
    const [mentorReply, setMentorReply] = useState<string | null>(null);
    const [mentorReplyAt, setMentorReplyAt] = useState<string | null>(null);
    const [isCommentSaving, setIsCommentSaving] = useState(false);
    const commentSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Helpers
    const isSameDay = (date1: Date, date2: Date) => {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    };

    const isPlannerTask = (
        task: MentorTaskLike | PlannerTaskLike,
    ): task is PlannerTaskLike => task.isMentorTask === false;

    const toDateString = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const scheduleRefresh = useCallback(() => {
        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
        }
        refreshTimerRef.current = setTimeout(() => {
            forceRefreshRef.current = true;
            setRefreshTick((prev) => prev + 1);
        }, 250);
    }, []);

    // Load daily comment
    const loadDailyComment = useCallback(async (menteeIdVal: string, dateStr: string) => {
        try {
            const res = await fetch(`/api/mentee/planner/daily-comment?menteeId=${menteeIdVal}&date=${dateStr}`);
            if (res.ok) {
                const json = await res.json();
                if (json.success) {
                    setMenteeComment(json.data.menteeComment || "");
                    setMentorReply(json.data.mentorReply || null);
                    setMentorReplyAt(json.data.mentorReplyAt || null);
                }
            }
        } catch (e) {
            console.error("Failed to load daily comment", e);
        }
    }, []);

    // Save daily comment (debounced)
    const saveDailyComment = useCallback(async (comment: string) => {
        if (!menteeId) return;
        const dateStr = toDateString(currentDate);

        setIsCommentSaving(true);
        try {
            await fetch("/api/mentee/planner/daily-comment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    menteeId,
                    date: dateStr,
                    comment,
                }),
            });
        } catch (e) {
            console.error("Failed to save daily comment", e);
        } finally {
            setIsCommentSaving(false);
        }
    }, [menteeId, currentDate]);

    const handleCommentChange = (value: string) => {
        setMenteeComment(value);

        // Debounce save
        if (commentSaveTimerRef.current) {
            clearTimeout(commentSaveTimerRef.current);
        }
        commentSaveTimerRef.current = setTimeout(() => {
            saveDailyComment(value);
        }, 1000);
    };

    const persistCache = (
        nextTasks: Array<MentorTaskLike | PlannerTaskLike>,
        nextCategories = categories,
        nextSelectedCategoryId = selectedCategoryId,
        nextProfile = profile,
    ) => {
        if (!menteeId) return;
        const dateStr = toDateString(currentDate);
        writeMenteePlannerCache(`${menteeId}:${dateStr}`, {
            tasks: nextTasks,
            categories: nextCategories,
            selectedCategoryId: nextSelectedCategoryId,
            profile: nextProfile,
        });
    };

    useEffect(() => {
        let isMounted = true;
        const loadUser = async () => {
            const { data } = await supabase.auth.getUser();
            const user = data?.user;
            if (!isMounted) return;
            if (!user) {
                if (!hasLoadedRef.current) {
                    setIsLoading(false);
                    hasLoadedRef.current = true;
                }
                return;
            }
            setMenteeId(user.id);
        };

        loadUser();

        return () => {
            isMounted = false;
            if (refreshTimerRef.current) {
                clearTimeout(refreshTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!menteeId) return;

        const channel = supabase
            .channel(`mentee-planner:${menteeId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "mentor_tasks",
                    filter: `mentee_id=eq.${menteeId}`,
                },
                scheduleRefresh,
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "mentor_tasks",
                    filter: `mentee_id=eq.${menteeId}`,
                },
                scheduleRefresh,
            )
            .on(
                "postgres_changes",
                {
                    event: "DELETE",
                    schema: "public",
                    table: "mentor_tasks",
                    filter: `mentee_id=eq.${menteeId}`,
                },
                scheduleRefresh,
            )
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "planner_tasks",
                    filter: `mentee_id=eq.${menteeId}`,
                },
                scheduleRefresh,
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "planner_tasks",
                    filter: `mentee_id=eq.${menteeId}`,
                },
                scheduleRefresh,
            )
            .on(
                "postgres_changes",
                {
                    event: "DELETE",
                    schema: "public",
                    table: "planner_tasks",
                    filter: `mentee_id=eq.${menteeId}`,
                },
                scheduleRefresh,
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [menteeId, scheduleRefresh]);

    // 2. Data Fetching (with cache)
    useEffect(() => {
        let isMounted = true;
        if (!menteeId) return;

        const dateStr = toDateString(currentDate);
        const cacheKey = `${menteeId}:${dateStr}`;
        const cached = readMenteePlannerCache(cacheKey);
        const forceRefresh = forceRefreshRef.current;
        if (forceRefreshRef.current) {
            forceRefreshRef.current = false;
        }

        const ensureSelectedCategory = (
            nextCategories: { id: string }[],
            nextSelectedId: string,
        ) => {
            if (nextCategories.find((cat) => cat.id === nextSelectedId)) {
                return nextSelectedId;
            }
            return nextCategories[0]?.id ?? "";
        };

        if (cached) {
            setTasks(cached.data.tasks);
            setCategories(cached.data.categories);
            setProfile(cached.data.profile ?? null);
            setSelectedCategoryId(
                ensureSelectedCategory(
                    cached.data.categories,
                    cached.data.selectedCategoryId,
                ),
            );
            if (!hasLoadedRef.current) {
                setIsLoading(false);
                hasLoadedRef.current = true;
            }
        }

        if (
            cached &&
            cached.data.profile !== undefined &&
            !cached.stale &&
            !forceRefresh
        ) {
            return () => {
                isMounted = false;
            };
        }

        const load = async () => {
            if (!hasLoadedRef.current && !cached) {
                setIsLoading(true);
            }
            try {
                const [mentorRes, plannerRes, subjectsRes, profileRes] = await Promise.all([
                    fetch(`/api/mentee/tasks?menteeId=${menteeId}`),
                    fetch(`/api/mentee/planner/tasks?menteeId=${menteeId}&date=${dateStr}`),
                    fetch(`/api/subjects`),
                    fetch(`/api/mentee/profile?profileId=${menteeId}`)
                ]);

                let nextProfile = profile;
                if (profileRes.ok) {
                    const profileJson = await profileRes.json();
                    nextProfile = adaptProfileToUi(profileJson.profile ?? null);
                }

                let nextCategories = categories;
                let nextSelectedCategoryId = selectedCategoryId;

                if (subjectsRes.ok) {
                    const subjectsJson = await subjectsRes.json();
                    if (Array.isArray(subjectsJson.subjects) && subjectsJson.subjects.length > 0) {
                        nextCategories = subjectsJson.subjects.map((subject: any) => {
                            return {
                                id: subject.slug ?? subject.id,
                                name: subject.name,
                                colorHex: subject.colorHex ?? UNKNOWN_SUBJECT_CATEGORY.colorHex,
                                textColorHex:
                                    subject.textColorHex ?? UNKNOWN_SUBJECT_CATEGORY.textColorHex,
                            };
                        });
                        nextSelectedCategoryId = ensureSelectedCategory(
                            nextCategories,
                            nextSelectedCategoryId,
                        );
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

                if (!isMounted) return;

                const nextTasks = [...mentorTasksForDate, ...plannerTasksForDate];
                setCategories(nextCategories);
                setSelectedCategoryId(nextSelectedCategoryId);
                setTasks(nextTasks);
                setProfile(nextProfile);

                writeMenteePlannerCache(cacheKey, {
                    tasks: nextTasks,
                    categories: nextCategories,
                    selectedCategoryId: nextSelectedCategoryId,
                    profile: nextProfile,
                });
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
    }, [currentDate, menteeId, refreshTick]);

    // Sync studyTimeBlocks with tasks (UI Logic)
    useEffect(() => {
        setStudyTimeBlocks(generateTimeBlocksFromTasks(tasks));
    }, [tasks]);

    const displayCategories = useMemo(() => {
        const taskCategories = tasks.map((task: any) => ({
            id: task.categoryId,
            name: task.subject || task.categoryId || UNKNOWN_SUBJECT_CATEGORY.name,
            colorHex: task.badgeColor?.bg ?? UNKNOWN_SUBJECT_CATEGORY.colorHex,
            textColorHex:
                task.badgeColor?.text ?? UNKNOWN_SUBJECT_CATEGORY.textColorHex,
        }));

        return mergeSubjectCategories(categories, taskCategories);
    }, [categories, tasks]);

    const displayDDay = useMemo(() => {
        const targetDate = profile?.targetDate;
        if (!targetDate) return null;

        const [year, month, day] = targetDate.split("-").map(Number);
        if (!year || !month || !day) return null;

        const target = new Date(year, month - 1, day);
        target.setHours(0, 0, 0, 0);

        const base = new Date(currentDate);
        base.setHours(0, 0, 0, 0);

        const diffTime = target.getTime() - base.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }, [profile?.targetDate, currentDate]);

    // Load daily comment when date or menteeId changes
    useEffect(() => {
        if (!menteeId) return;
        const dateStr = toDateString(currentDate);
        loadDailyComment(menteeId, dateStr);

        return () => {
            if (commentSaveTimerRef.current) {
                clearTimeout(commentSaveTimerRef.current);
            }
        };
    }, [menteeId, currentDate, loadDailyComment]);

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
                if (createdTask) {
                    const nextTask: PlannerTaskLike = {
                        ...createdTask,
                        isRunning: false,
                        timeSpent: 0
                    };
                    setTasks(prev => {
                        const next = [
                            ...prev,
                            nextTask
                        ];
                        persistCache(next);
                        return next;
                    });
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
        const nextStatus: PlannerTaskLike["status"] = nextCompleted ? "submitted" : "pending";
        // Optimistic update
        setTasks(prev => {
            const next = prev.map(task => {
                if (String(task.id) !== taskIdStr) return task;
                if (!isPlannerTask(task)) return task;
                return { ...task, completed: nextCompleted, status: nextStatus };
            });
            persistCache(next);
            return next;
        });

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
        const targetTask = tasks.find((task) => String(task.id) === taskIdStr);
        if (!targetTask) return;

        // Reflect immediately in timeline for both mentor and planner tasks.
        setTasks(prev => {
            const next = prev.map(task => {
                if (String(task.id) !== taskIdStr) return task;
                return { ...task, startTime, endTime };
            });
            persistCache(next);
            return next;
        });

        if (!menteeId) return;

        try {
            if (targetTask.isMentorTask) {
                await fetch(`/api/mentee/tasks/${taskIdStr}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        menteeId,
                        startTime,
                        endTime
                    })
                });
            } else {
                await fetch(`/api/mentee/planner/tasks/${taskIdStr}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        menteeId,
                        startTime,
                        endTime
                    })
                });
            }
        } catch (e) {
            console.error("Failed to update task time range", e);
        }
    };

    const executeDelete = async (taskIdStr: string) => {
        setTasks(prev => {
            const next = prev.filter(task => String(task.id) !== taskIdStr);
            persistCache(next);
            return next;
        });

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
        setTasks(prev => {
            const next = prev.filter(task => task.recurringGroupId !== groupId);
            persistCache(next);
            return next;
        });

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
                        {displayDDay !== null && (
                            <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {displayDDay === 0 ? "D-Day" : displayDDay < 0 ? `D+${Math.abs(displayDDay)}` : `D-${displayDDay}`}
                            </span>
                        )}
                    </div>
                    <button onClick={handleNextDay} className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </section>

            <div className="px-4 space-y-4 pb-8">
                {/* Mentee Comment Card */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                            <Flag size={18} className="text-orange-500 fill-orange-500" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-[10px] font-bold text-gray-400">멘티 코멘트</p>
                                {isCommentSaving && (
                                    <Loader2 size={10} className="animate-spin text-gray-400" />
                                )}
                                {!isCommentSaving && menteeComment && (
                                    <Check size={10} className="text-green-500" />
                                )}
                            </div>
                            <input
                                type="text"
                                value={menteeComment}
                                onChange={(e) => handleCommentChange(e.target.value)}
                                placeholder="오늘 하루 요약이나 코멘트를 남겨주세요"
                                className="w-full text-sm placeholder-gray-300 border-none p-0 focus:ring-0 font-medium"
                            />
                        </div>
                    </div>

                    {/* Mentor Reply */}
                    {mentorReply && (
                        <div className="flex items-start gap-3 pt-3 border-t border-gray-100">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <MessageCircle size={18} className="text-blue-500" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-[10px] font-bold text-blue-600">멘토 답글</p>
                                    {mentorReplyAt && (
                                        <p className="text-[9px] text-gray-400">
                                            {new Date(mentorReplyAt).toLocaleDateString("ko-KR", {
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}
                                        </p>
                                    )}
                                </div>
                                <p className="text-sm text-gray-700 font-medium">{mentorReply}</p>
                            </div>
                        </div>
                    )}
                </div>

                <PlannerTasks
                    tasks={tasks}
                    categories={displayCategories}
                    onToggleCompletion={toggleTaskCompletion}
                    onUpdateTaskTimeRange={updateTaskTimeRange}
                    onDelete={handleDeleteRequest}
                    newTaskTitle={newTaskTitle}
                    setNewTaskTitle={setNewTaskTitle}
                    selectedCategoryId={selectedCategoryId}
                    setSelectedCategoryId={setSelectedCategoryId}
                    onAddTask={addTask}
                />

                <StudyTimeline
                    studyTimeBlocks={studyTimeBlocks}
                    categories={displayCategories}
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
