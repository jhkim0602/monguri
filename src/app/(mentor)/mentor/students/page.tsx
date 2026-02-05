"use client";

import Link from "next/link";
import { useMentorStore } from "@/features/mentor/context/MentorStoreProvider";

export default function MentorStudentsPage() {
  const { store } = useMentorStore();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
          Students
        </p>
        <h1 className="text-2xl font-bold text-gray-900">학생 관리</h1>
        <p className="text-sm text-gray-500">
          담당 학생의 학습 상태를 확인하세요.
        </p>
      </header>

      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="hidden md:grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] gap-3 px-3 text-[11px] font-semibold text-gray-400">
          <span>학생</span>
          <span>학년</span>
          <span>목표</span>
          <span>성과</span>
        </div>
        <div className="mt-3 divide-y divide-gray-100 rounded-2xl border border-gray-100">
          {store.mentees.map((mentee) => (
            <Link
              key={mentee.id}
              href={`/mentor/students/${mentee.id}`}
              className="grid grid-cols-1 gap-3 px-4 py-4 text-sm transition hover:bg-gray-50 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] md:items-center"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-100">
                  {mentee.avatarUrl ? (
                    <img
                      src={mentee.avatarUrl}
                      alt={mentee.name}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{mentee.name}</p>
                  <p className="text-xs text-gray-400">{mentee.track ?? "-"}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">{mentee.grade}</span>
              <span className="text-xs text-gray-500">{mentee.goal}</span>
              <div className="text-xs text-gray-500">
                {mentee.stats?.studyHours ?? 0}h ·{" "}
                {mentee.stats?.tasksCompleted ?? 0} tasks
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
