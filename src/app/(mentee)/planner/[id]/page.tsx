"use client";

import { useParams } from "next/navigation";
import TaskDetailView from "@/components/mentee/planner/TaskDetailView";
import { MENTOR_TASKS, USER_TASKS, WEEKLY_SCHEDULE } from "@/constants/mentee";
import { DEFAULT_CATEGORIES } from "@/constants/common";
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

        // Step 3: 로컬 스토리지(플래너 저장)에서 검색
        if (typeof window !== "undefined") {
            const raw = localStorage.getItem("planner-day-tasks");
            if (raw) {
                try {
                    const data = JSON.parse(raw) as Record<string, any[]>;
                    const storedTask = Object.values(data)
                        .flat()
                        .find((task) => String(task.id) === idStr);
                    if (storedTask) {
                        setTask({ ...storedTask, id: idStr, isMentorTask: storedTask.isMentorTask ?? false });
                        return;
                    }
                } catch {
                    // ignore parse errors
                }
            }
        }

        // Step 4: 주간 일정(반복 task)에서 검색
        const rawEventId = idStr.startsWith("plan-") ? idStr.replace("plan-", "") : idStr;
        const scheduleEvent = WEEKLY_SCHEDULE.flatMap((day) => day.events).find(
            (event) => String(event.id) === rawEventId
        );
        if (scheduleEvent) {
            const category = DEFAULT_CATEGORIES.find(c => c.id === scheduleEvent.categoryId) || DEFAULT_CATEGORIES[0];
            setTask({
                id: idStr,
                title: scheduleEvent.title,
                description: "주간 플래너 반복 일정",
                status: "pending",
                badgeColor: `${category.color} ${category.textColor}`,
                categoryId: scheduleEvent.categoryId,
                attachments: [],
                submissions: [],
                mentorComment: "",
                feedbackFiles: [],
                isMentorTask: scheduleEvent.isMentorTask ?? scheduleEvent.taskType === "mentor",
                completed: false,
                studyRecord: null,
                userQuestion: undefined,
                hasMentorResponse: false
            });
            return;
        }

        // Step 5: 둘 다 없으면 멘티가 설정한 과제로 간주 (isMentorTask: false)
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
