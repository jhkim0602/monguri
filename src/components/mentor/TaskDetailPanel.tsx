"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { MentorTask, MentorTaskStatus } from "@/features/mentor/types";
import { MENTOR_TASKS } from "@/constants/mentee";

const STATUS_LABEL: Record<MentorTaskStatus, string> = {
  pending: "대기",
  submitted: "제출 확인",
  feedback_completed: "피드백 완료",
};

const findSourceTask = (task: MentorTask) => {
  const rawId = String(task.id);
  const parts = rawId.split("-");
  const sourceId = parts.length > 1 ? parts[parts.length - 1] : rawId;
  return MENTOR_TASKS.find((item) => String(item.id) === sourceId);
};

type TaskDetailPanelProps = {
  task: MentorTask | null;
  menteeName?: string;
  onUpdateStatus: (status: MentorTaskStatus) => void;
  onSaveComment: (comment: string) => void;
};

export default function TaskDetailPanel({
  task,
  menteeName,
  onUpdateStatus,
  onSaveComment,
}: TaskDetailPanelProps) {
  const [commentDraft, setCommentDraft] = useState("");

  const sourceTask = useMemo(() => (task ? findSourceTask(task) : null), [task]);

  useEffect(() => {
    if (!task) return;
    setCommentDraft(task.mentorComment ?? "");
  }, [task?.id, task?.mentorComment]);

  if (!task) {
    return (
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-400">
          왼쪽에서 과제를 선택하면 상세가 열립니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
          Task Detail
        </p>
        <h2 className="text-lg font-bold text-gray-900">{task.title}</h2>
        <p className="text-xs text-gray-400">
          {menteeName ?? "멘티"} · {task.subject} · 마감 {task.deadline.toLocaleDateString("ko-KR")}
        </p>
      </div>

      {task.description ? (
        <div className="rounded-2xl border border-gray-100 px-4 py-3 text-sm text-gray-600">
          {task.description}
        </div>
      ) : null}

      <div>
        <h3 className="text-sm font-bold text-gray-900">제출/기록</h3>
        <div className="mt-3 space-y-2">
          {sourceTask?.submissions && sourceTask.submissions.length > 0 ? (
            sourceTask.submissions.map((file) => (
              <div
                key={file.name}
                className="rounded-2xl border border-gray-100 px-4 py-3 text-xs text-gray-500"
              >
                {file.name}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-center text-xs text-gray-400">
              제출물 없음
            </div>
          )}
          {sourceTask?.studyRecord?.note ? (
            <div className="rounded-2xl border border-gray-100 px-4 py-3 text-xs text-gray-500">
              메모: {sourceTask.studyRecord.note}
            </div>
          ) : null}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-gray-900">상태 변경</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(STATUS_LABEL) as MentorTaskStatus[]).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onUpdateStatus(status)}
              className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-semibold text-gray-500"
            >
              {STATUS_LABEL[status]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-gray-900">멘토 피드백</h3>
        <textarea
          value={commentDraft}
          onChange={(event) => setCommentDraft(event.target.value)}
          rows={5}
          className="mt-3 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
          placeholder="멘티에게 전달할 피드백을 작성하세요"
        />
        <button
          type="button"
          onClick={() => onSaveComment(commentDraft)}
          className="mt-3 w-full rounded-2xl bg-gray-900 py-2 text-sm font-semibold text-white"
        >
          피드백 저장
        </button>
      </div>

      <Link
        href={`/mentor/tasks?menteeId=${task.menteeId}&taskId=${task.id}`}
        className="text-xs font-semibold text-gray-500"
      >
        과제 관리 화면에서 열기 →
      </Link>
    </div>
  );
}
