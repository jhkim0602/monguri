"use client";

import { useParams } from "next/navigation";
import TaskDetailView from "@/components/mentee/planner/TaskDetailView";
import { MENTOR_TASKS } from "@/constants/common";
import { useEffect, useState } from "react";

export default function TaskDetailPage() {
    const { id } = useParams();
    const [task, setTask] = useState<any>(null);

    useEffect(() => {
        // In a real app, you'd fetch from an API
        // For now, we search in MENTOR_TASKS or create a dummy from ID
        const foundTask = MENTOR_TASKS.find(t => t.id.toString() === id);
        if (foundTask) {
            setTask(foundTask);
        } else {
            // Dummy task if not found in mock data
            setTask({
                id: id,
                title: `할 일 #${id}`,
                description: "상세 설명이 등록되어 있지 않은 할 일입니다.",
                status: "pending",
                badgeColor: "bg-gray-100 text-gray-600",
                categoryId: "korean",
                attachments: [],
                submissions: [],
                mentorComment: "",
                feedbackFiles: []
            });
        }
    }, [id]);

    if (!task) return null;

    return <TaskDetailView task={task} />;
}
