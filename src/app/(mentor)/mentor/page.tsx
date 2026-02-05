"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMentorStore } from "@/features/mentor/context/MentorStoreProvider";
import TaskDetailPanel from "@/components/mentor/TaskDetailPanel";

const QUEUE_STATUS_LABEL: Record<
  "all" | "pending" | "submitted" | "feedback_completed",
  string
> = {
  all: "전체",
  pending: "대기",
  submitted: "제출됨",
  feedback_completed: "피드백 완료",
};

export default function MentorDashboardPage() {
  const { store, updateTaskComment, updateTaskStatus } = useMentorStore();
  const [selectedTaskId, setSelectedTaskId] = useState<string | number | null>(
    null,
  );
  const [queueStatus, setQueueStatus] = useState<
    "all" | "pending" | "submitted" | "feedback_completed"
  >("submitted");
  const [queueMenteeId, setQueueMenteeId] = useState<string>("all");

  const pending = store.tasks.filter((task) => task.status === "pending").length;
  const submitted = store.tasks.filter((task) => task.status === "submitted").length;
  const feedbackCompleted = store.tasks.filter(
    (task) => task.status === "feedback_completed",
  ).length;
  const menteeMap = useMemo(
    () => new Map(store.mentees.map((mentee) => [mentee.id, mentee.name])),
    [store.mentees],
  );

  const feedbackQueue = useMemo(() => {
    return [...store.tasks]
      .filter((task) =>
        queueStatus === "all" ? true : task.status === queueStatus,
      )
      .filter((task) =>
        queueMenteeId === "all" ? true : task.menteeId === queueMenteeId,
      )
      .sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
  }, [store.tasks, queueStatus, queueMenteeId]);

  const selectedTask = useMemo(
    () => store.tasks.find((task) => task.id === selectedTaskId) ?? null,
    [store.tasks, selectedTaskId],
  );

  const menteeSummary = useMemo(() => {
    return store.mentees.map((mentee) => {
      const tasks = store.tasks.filter((task) => task.menteeId === mentee.id);
      const submittedCount = tasks.filter((task) => task.status === "submitted")
        .length;
      const pendingCount = tasks.filter((task) => task.status === "pending").length;
      const completedCount = tasks.filter(
        (task) => task.status === "feedback_completed",
      ).length;
      return {
        mentee,
        submittedCount,
        pendingCount,
        completedCount,
      };
    });
  }, [store.mentees, store.tasks]);

  useEffect(() => {
    if (feedbackQueue.length === 0) {
      setSelectedTaskId(null);
      return;
    }
    if (!selectedTaskId) {
      setSelectedTaskId(feedbackQueue[0].id);
      return;
    }
    const exists = feedbackQueue.some((task) => task.id === selectedTaskId);
    if (!exists) setSelectedTaskId(feedbackQueue[0].id);
  }, [feedbackQueue, selectedTaskId]);
  const todayLabel = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
          Mentor Workspace
        </p>
        <h1 className="text-2xl font-bold text-gray-900">
          멘토 대시보드
        </h1>
        <p className="text-sm text-gray-500">{todayLabel}</p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-400">대기 중 피드백</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{pending}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-400">제출됨</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{submitted}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-400">피드백 완료</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {feedbackCompleted}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-400">전체 과제</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {store.tasks.length}
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                피드백 대기 큐
              </h2>
              <span className="text-xs text-gray-400">
                {feedbackQueue.length}건
              </span>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                {(Object.keys(QUEUE_STATUS_LABEL) as Array<
                  keyof typeof QUEUE_STATUS_LABEL
                >).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setQueueStatus(status)}
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                      queueStatus === status
                        ? "border-gray-300 bg-gray-50 text-gray-700"
                        : "border-gray-200 text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    {QUEUE_STATUS_LABEL[status]}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setQueueMenteeId("all")}
                  className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                    queueMenteeId === "all"
                      ? "border-gray-300 bg-gray-50 text-gray-700"
                      : "border-gray-200 text-gray-400 hover:border-gray-300"
                  }`}
                >
                  전체 학생
                </button>
                {store.mentees.map((mentee) => (
                  <button
                    key={mentee.id}
                    type="button"
                    onClick={() => setQueueMenteeId(mentee.id)}
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                      queueMenteeId === mentee.id
                        ? "border-gray-300 bg-gray-50 text-gray-700"
                        : "border-gray-200 text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    {mentee.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {feedbackQueue.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-400">
                  피드백 대기 과제가 없습니다.
                </div>
              ) : (
                feedbackQueue.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => setSelectedTaskId(task.id)}
                    className={`grid w-full grid-cols-1 gap-2 rounded-2xl border px-4 py-3 text-left text-sm transition md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] md:items-center ${
                      selectedTaskId === task.id
                        ? "border-gray-300 bg-gray-50"
                        : "border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-400">{task.subject}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {menteeMap.get(task.menteeId) ?? "멘티"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {task.deadline.toLocaleDateString("ko-KR")}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">학생별 현황</h2>
              <Link
                href="/mentor/students"
                className="text-xs font-semibold text-blue-600"
              >
                전체 보기
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {menteeSummary.map(({ mentee, submittedCount, pendingCount, completedCount }) => (
                <div
                  key={mentee.id}
                  className="rounded-2xl border border-gray-100 px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {mentee.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {mentee.grade} · {mentee.goal}
                      </p>
                    </div>
                    <Link
                      href={`/mentor/planner?menteeId=${mentee.id}`}
                      className="text-xs text-gray-500"
                    >
                      플래너 보기
                    </Link>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                    <span>대기 {pendingCount}</span>
                    <span>제출 {submittedCount}</span>
                    <span>완료 {completedCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <TaskDetailPanel
          task={selectedTask}
          menteeName={selectedTask ? menteeMap.get(selectedTask.menteeId) : undefined}
          onUpdateStatus={(status) =>
            selectedTask ? updateTaskStatus(selectedTask.id, status) : null
          }
          onSaveComment={(comment) =>
            selectedTask ? updateTaskComment(selectedTask.id, comment) : null
          }
        />
      </section>
    </div>
  );
}
