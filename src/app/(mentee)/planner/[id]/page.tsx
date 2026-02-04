"use client";

import { useParams } from "next/navigation";
import TaskDetailView from "@/components/mentee/planner/TaskDetailView";
import { MENTOR_TASKS, USER_TASKS } from "@/constants/mentee";
import { useEffect, useState } from "react";

export default function TaskDetailPage() {
    const params = useParams();
    const id = params?.id;
    const [task, setTask] = useState<any>(null);

    useEffect(() => {
        if (!id) return;

        // 🔧 ID를 string으로 표준화
        const idStr = Array.isArray(id) ? id[0] : String(id);

        // Step 1: MENTOR_TASKS에서 검색
        let foundTask: any = MENTOR_TASKS.find(t => String(t.id) === idStr);
        if (foundTask) {
            setTask({ ...foundTask, id: idStr, isMentorTask: true });
            return;
        }

        // Step 2: USER_TASKS에서 검색
        foundTask = USER_TASKS.find(t => String(t.id) === idStr);
        if (foundTask) {
            setTask({ ...foundTask, id: idStr, isMentorTask: false });
            return;
        }

        // Step 3: 둘 다 없으면 멘티가 설정한 과제로 간주 (isMentorTask: false)
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
            feedbackFiles: [],
            isMentorTask: false,  // 🔧 멘티가 설정한 과제
            completed: false,
            studyRecord: null,
            userQuestion: undefined,
            hasMentorResponse: false
        });
    }, [id]);

    if (!task) return null;

    return <TaskDetailView task={task} />;
}
