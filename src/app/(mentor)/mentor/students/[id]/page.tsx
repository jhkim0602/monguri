"use client";

import Link from "next/link";
import { useMentorStore } from "@/features/mentor/context/MentorStoreProvider";

export default function MentorStudentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { store } = useMentorStore();
  const mentee = store.mentees.find((item) => item.id === params.id);

  if (!mentee) {
    return (
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">학생 정보를 찾을 수 없습니다.</p>
        <Link
          href="/mentor/students"
          className="mt-4 inline-block text-sm text-blue-600"
        >
          학생 목록으로
        </Link>
      </div>
    );
  }

  const tasks = store.tasks.filter((task) => task.menteeId === mentee.id);
  const records = store.plannerDays.filter(
    (record) => record.menteeId === mentee.id,
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Link href="/mentor/students" className="text-xs text-gray-400">
          ← 학생 목록
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{mentee.name}</h1>
        <p className="text-sm text-gray-500">
          {mentee.grade} · {mentee.goal}
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">과제 현황</h2>
          <div className="mt-4 space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-2xl border border-gray-100 px-4 py-3"
              >
                <p className="text-sm font-semibold text-gray-900">
                  {task.title}
                </p>
                <p className="text-xs text-gray-400">
                  {task.subject} · {task.status}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">플래너 기록</h2>
          <div className="mt-4 space-y-3">
            {records.map((record) => (
              <div key={record.id} className="text-xs text-gray-500">
                <p className="font-semibold text-gray-800">
                  {record.date.toLocaleDateString("ko-KR", {
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p>
                  공부 {record.studyTime}분 · 기분 {record.mood}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
