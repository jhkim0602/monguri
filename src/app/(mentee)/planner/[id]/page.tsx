"use client";

import { useParams } from "next/navigation";
import TaskDetailView from "@/components/mentee/planner/TaskDetailView";
import { MENTOR_TASKS, USER_TASKS } from "@/constants/mentee";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { adaptMentorTasksToUi } from "@/lib/menteeAdapters";

export default function TaskDetailPage() {
    const params = useParams();
    const id = params?.id;
    const [task, setTask] = useState<any>(null);

    useEffect(() => {
        if (!id) return;
        let isMounted = true;

        const load = async () => {
            // 🔧 ID를 string으로 표준화
            const idStr = Array.isArray(id) ? id[0] : String(id);

            // Step 1: MENTOR_TASKS에서 검색
            let foundTask: any = MENTOR_TASKS.find(t => String(t.id) === idStr);
            if (foundTask) {
                if (isMounted) {
                    setTask({ ...foundTask, id: idStr, isMentorTask: true });
                }
                return;
            }

            // Step 2: USER_TASKS에서 검색
            foundTask = USER_TASKS.find(t => String(t.id) === idStr);
            if (foundTask) {
                if (isMounted) {
                    setTask({ ...foundTask, id: idStr, isMentorTask: false });
                }
                return;
            }

            // Step 3: API에서 멘토 과제 조회 (로그인 상태일 때만)
            const { data } = await supabase.auth.getUser();
            const user = data?.user;
            if (user) {
                const response = await fetch(`/api/mentee/tasks?menteeId=${user.id}`);
                if (response.ok) {
                    const json = await response.json();
                    const apiTasks = Array.isArray(json.tasks) ? adaptMentorTasksToUi(json.tasks) : [];
                    const apiTask = apiTasks.find(t => String(t.id) === idStr);
                    if (apiTask && isMounted) {
                        setTask({ ...apiTask, id: idStr, isMentorTask: true });
                        return;
                    }
                }
            }

            // Step 4: 둘 다 없으면 멘티가 설정한 과제로 간주 (isMentorTask: false)
            if (isMounted) {
                setTask({
                    id: idStr,
                    title: `할 일 #${idStr}`,
                    description: "상세 설명이 등록되어 있지 않은 할 일입니다.",
                    status: "pending",
                    badgeColor: { bg: "#F3F4F6", text: "#4B5563" },
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
            }
        };

        load();

        return () => {
            isMounted = false;
        };
    }, [id]);

    if (!task) return null;

    return <TaskDetailView task={task} />;
}
