"use client";

import { Input } from "@/components/ui";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Student, SUBJECT_META } from "./types";

type MentorChatSidebarProps = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  students: Student[];
  selectedStudentId: string | null;
  isLoading: boolean;
  onSelectStudent: (id: string) => void;
  headingFontClassName: string;
};

export default function MentorChatSidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  students,
  selectedStudentId,
  isLoading,
  onSelectStudent,
  headingFontClassName,
}: MentorChatSidebarProps) {
  return (
    <aside
      className={`flex flex-col border-r border-slate-200/70 bg-gradient-to-b from-white via-slate-50 to-white transition-all duration-300 ${
        isSidebarOpen ? "w-[16.5rem] sm:w-[22rem]" : "w-[53px] sm:w-20"
      }`}
    >
      {isSidebarOpen ? (
        <>
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`${headingFontClassName} text-[11px] uppercase tracking-[0.3em] text-slate-400`}
                >
                  Mentor Inbox
                </p>
                <h2 className="text-lg font-bold text-[color:var(--chat-ink)]">
                  채팅
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="학생 이름 검색..."
                className="h-11 border-slate-200/70 bg-white/80 pl-9 pr-10 text-sm shadow-sm focus-visible:ring-[color:var(--chat-accent)]"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 shadow-sm hover:bg-slate-50">
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-5">
            {students.map((student) => {
              const subject = SUBJECT_META[student.subject];
              const isActive = selectedStudentId === student.id;

              return (
                <button
                  key={student.id}
                  onClick={() => onSelectStudent(student.id)}
                  className={`group w-full rounded-2xl border p-4 text-left transition-all ${
                    isActive
                      ? "border-[color:var(--chat-accent)] bg-white shadow-[0_18px_40px_-30px_rgba(15,23,42,0.5)]"
                      : "border-transparent bg-white/60 hover:border-slate-200 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div
                        className={`h-11 w-11 overflow-hidden rounded-2xl bg-gradient-to-br ${subject.avatar} flex items-center justify-center text-sm font-semibold text-white shadow-sm`}
                      >
                        {student.avatarUrl ? (
                          <img
                            src={student.avatarUrl}
                            alt={student.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          student.name[0]
                        )}
                      </div>
                      <div
                        className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
                          student.online ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">
                          {student.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {student.time}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">
                          {student.grade?.trim() || ""}
                        </span>
                      </div>
                      <p className="mt-2 truncate text-xs text-slate-500">
                        {student.lastMsg?.startsWith("MEETING_REQUEST:")
                          ? "미팅 신청이 도착했습니다"
                          : student.lastMsg?.startsWith("MENTOR_MEETING:")
                            ? "미팅이 등록되었습니다"
                            : student.lastMsg}
                      </p>
                    </div>

                    {student.unread > 0 && (
                      <div className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--chat-warm)] text-[10px] font-bold text-white shadow-sm">
                        {student.unread}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}

            {students.length === 0 && !isLoading && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-4 py-6 text-center text-xs text-slate-400">
                연결된 멘티가 없습니다.
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-center px-0.5 pt-3 sm:px-3 sm:pt-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm hover:bg-slate-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 flex-1 space-y-2 overflow-y-auto px-0.5 pt-1 pb-3 sm:mt-4 sm:space-y-3 sm:px-2 sm:pt-1 sm:pb-4">
            {students.map((student) => {
              const subject = SUBJECT_META[student.subject];
              const isActive = selectedStudentId === student.id;

              return (
                <button
                  key={student.id}
                  onClick={() => onSelectStudent(student.id)}
                  className={`relative flex w-full items-center justify-center rounded-xl p-0.5 transition-all sm:rounded-2xl sm:p-2 ${
                    isActive
                      ? "bg-white ring-1 ring-[color:var(--chat-accent)] shadow-[0_10px_20px_-18px_rgba(15,23,42,0.65)]"
                      : "bg-transparent hover:bg-white/90"
                  }`}
                >
                  <div
                    className={`h-10 w-10 sm:h-11 sm:w-11 overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br ${subject.avatar} flex items-center justify-center text-sm font-semibold text-white shadow-sm`}
                  >
                    {student.avatarUrl ? (
                      <img
                        src={student.avatarUrl}
                        alt={student.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      student.name[0]
                    )}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-white ${
                      student.online ? "bg-emerald-500" : "bg-slate-400"
                    }`}
                  />
                  {student.unread > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--chat-warm)] text-[9px] font-bold text-white shadow-sm">
                      {student.unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </aside>
  );
}
