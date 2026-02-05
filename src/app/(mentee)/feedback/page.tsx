"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/mentee/layout/Header";
import FeedbackArchive from "@/components/mentee/mypage/FeedbackArchive";
import { Search } from "lucide-react";
import TaskDetailModal from "@/components/mentee/planner/TaskDetailModal";
import { supabase } from "@/lib/supabaseClient";
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

    // Data States
    const [mentorTasks, setMentorTasks] = useState<MentorTaskLike[]>([]);
    const [plannerTasks, setPlannerTasks] = useState<PlannerTaskLike[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const hasLoadedRef = useRef(false);

    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            if (!hasLoadedRef.current) {
                setIsLoading(true);
            }
            try {
                const { data } = await supabase.auth.getUser();
                const user = data?.user;
                if (!user) return;

                const [tasksRes, plannerRes] = await Promise.all([
                    fetch(`/api/mentee/tasks?menteeId=${user.id}`),
                    fetch(`/api/mentee/planner/tasks?menteeId=${user.id}`)
                ]);

                if (tasksRes.ok) {
                    const tasksJson = await tasksRes.json();
                    if (isMounted && Array.isArray(tasksJson.tasks)) {
                        setMentorTasks(adaptMentorTasksToUi(tasksJson.tasks));
                    }
                }

                if (plannerRes.ok) {
                    const plannerJson = await plannerRes.json();
                    if (isMounted && Array.isArray(plannerJson.tasks)) {
                        setPlannerTasks(adaptPlannerTasksToUi(plannerJson.tasks));
                    }
                }

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
    }, []);

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
                rightElement={
                    <button className="p-2.5 text-gray-400 bg-white rounded-full border border-gray-100 shadow-sm hover:text-primary transition-all active:scale-95">
                        <Search size={20} />
                    </button>
                }
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
