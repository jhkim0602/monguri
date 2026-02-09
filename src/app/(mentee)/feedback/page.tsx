"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/mentee/layout/Header";
import FeedbackArchive from "@/components/mentee/mypage/FeedbackArchive";
import TaskDetailModal from "@/components/mentee/planner/TaskDetailModal";
import { supabase } from "@/lib/supabaseClient";
import {
    readMenteeFeedbackCache,
    writeMenteeFeedbackCache,
} from "@/lib/menteeFeedbackCache";
import {
    adaptMentorTasksToUi,
    adaptPlannerTasksToUi,
    type MentorTaskLike,
    type PlannerTaskLike,
} from "@/lib/menteeAdapters";

export default function FeedbackPage() {
    const router = useRouter();
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // Data States
    const [mentorTasks, setMentorTasks] = useState<MentorTaskLike[]>([]);
    const [plannerTasks, setPlannerTasks] = useState<PlannerTaskLike[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const hasLoadedRef = useRef(false);
    const forceRefreshRef = useRef(false);
    const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [refreshTick, setRefreshTick] = useState(0);

    const scheduleRefresh = useCallback(() => {
        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
        }
        refreshTimerRef.current = setTimeout(() => {
            forceRefreshRef.current = true;
            setRefreshTick((prev) => prev + 1);
        }, 250);
    }, []);

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
            setUserId(user.id);
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
        if (!userId) return;

        const channel = supabase
            .channel(`mentee-feedback:${userId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "mentor_tasks",
                    filter: `mentee_id=eq.${userId}`,
                },
                scheduleRefresh,
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "mentor_tasks",
                    filter: `mentee_id=eq.${userId}`,
                },
                scheduleRefresh,
            )
            .on(
                "postgres_changes",
                {
                    event: "DELETE",
                    schema: "public",
                    table: "mentor_tasks",
                    filter: `mentee_id=eq.${userId}`,
                },
                scheduleRefresh,
            )
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "planner_tasks",
                    filter: `mentee_id=eq.${userId}`,
                },
                scheduleRefresh,
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "planner_tasks",
                    filter: `mentee_id=eq.${userId}`,
                },
                scheduleRefresh,
            )
            .on(
                "postgres_changes",
                {
                    event: "DELETE",
                    schema: "public",
                    table: "planner_tasks",
                    filter: `mentee_id=eq.${userId}`,
                },
                scheduleRefresh,
            )
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "task_submissions",
                    filter: `mentee_id=eq.${userId}`,
                },
                scheduleRefresh,
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "task_submissions",
                    filter: `mentee_id=eq.${userId}`,
                },
                scheduleRefresh,
            )
            .on(
                "postgres_changes",
                {
                    event: "DELETE",
                    schema: "public",
                    table: "task_submissions",
                    filter: `mentee_id=eq.${userId}`,
                },
                scheduleRefresh,
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, scheduleRefresh]);

    useEffect(() => {
        let isMounted = true;
        if (!userId) return;

        const cacheKey = userId;
        const cached = readMenteeFeedbackCache(cacheKey);
        const forceRefresh = forceRefreshRef.current;
        if (forceRefreshRef.current) {
            forceRefreshRef.current = false;
        }

        if (cached) {
            setMentorTasks(cached.data.mentorTasks);
            setPlannerTasks(cached.data.plannerTasks);
            if (!hasLoadedRef.current) {
                setIsLoading(false);
                hasLoadedRef.current = true;
            }
        }

        if (cached && !cached.stale && !forceRefresh) {
            return () => {
                isMounted = false;
            };
        }

        const load = async () => {
            if (!hasLoadedRef.current && !cached) {
                setIsLoading(true);
            }
            try {
                const [tasksRes, plannerRes] = await Promise.all([
                    fetch(`/api/mentee/tasks?menteeId=${userId}`),
                    fetch(`/api/mentee/planner/tasks?menteeId=${userId}`)
                ]);

                const next = {
                    mentorTasks: [] as MentorTaskLike[],
                    plannerTasks: [] as PlannerTaskLike[],
                };

                if (tasksRes.ok) {
                    const tasksJson = await tasksRes.json();
                    if (Array.isArray(tasksJson.tasks)) {
                        next.mentorTasks = adaptMentorTasksToUi(tasksJson.tasks);
                    }
                }

                if (plannerRes.ok) {
                    const plannerJson = await plannerRes.json();
                    if (Array.isArray(plannerJson.tasks)) {
                        next.plannerTasks = adaptPlannerTasksToUi(plannerJson.tasks);
                    }
                }

                if (!isMounted) return;

                setMentorTasks(next.mentorTasks);
                setPlannerTasks(next.plannerTasks);
                writeMenteeFeedbackCache(cacheKey, next);
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
    }, [userId, refreshTick]);

    const handleOpenTask = (task: any) => {
        // If it's a modal view we can use the modal, but if we want navigation we can use router push
        // The original FeedbackArchive uses router.push if onOpenTask is provided with navigation logic,
        // OR we can just open the modal.
        // Let's use the Modal approach here since we have TaskDetailModal imported.
        // But wait, the previous MyPage implementation used `router.push(/planner/${task.id})`.
        // The user might prefer staying on the page. Let's try Modal first as it's cleaner for "Archive" viewing.
        // Actually, looking at the previous MyPage code:
        // onOpenTask={(task) => { router.push(/planner/${task.id}); }}
        // The code I saw in FeedbackPage.tsx (step 299) had TaskDetailModal set up.
        // I will use TaskDetailModal as it's already there and provides a nice overlay.
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    if (isLoading) {
        return <div className="min-h-screen bg-gray-50" />;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            <Header
                title="피드백 보관함"
                variant="clean"
            />

            <div className="pt-5">
                <FeedbackArchive
                    mentorTasks={mentorTasks}
                    userTasks={plannerTasks}
                    onOpenTask={handleOpenTask}
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
