"use client";

import { useParams } from "next/navigation";
import TaskDetailView from "@/components/mentee/planner/TaskDetailView";
import { MENTOR_TASKS } from "@/constants/mentee";
import { useEffect, useState } from "react";

export default function TaskDetailPage() {
    const params = useParams();
    const id = params?.id;
    const [task, setTask] = useState<any>(null);

    useEffect(() => {
        if (!id) return;

        // 🔧 ID를 string으로 표준화
        const idStr = Array.isArray(id) ? id[0] : String(id);

        // In a real app, you'd fetch from an API
        // For now, we search in MENTOR_TASKS or create a dummy from ID
        const foundTask = MENTOR_TASKS.find(t => String(t.id) === idStr);
        if (foundTask) {
            setTask({ ...foundTask, id: idStr });
        } else {
            // Dummy task if not found in mock data
            setTask({
                id: idStr,
                title: `할 일 #${idStr}`,
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
