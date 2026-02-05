"use client";

import { useState } from "react";
import { useModal } from "@/contexts/ModalContext";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Check,
  X,
  MoreHorizontal,
} from "lucide-react";
import { STUDENTS_MOCK } from "@/constants/mentor";

// Mock Data for Requests
const INITIAL_REQUESTS = [
  {
    id: 1,
    studentId: "s1",
    studentName: "김멘티",
    topic: "수학 기하 벡터 질문",
    requestedTime: "2026-02-05 19:00",
    status: "pending",
  },
  {
    id: 2,
    studentId: "s2",
    studentName: "이서울",
    topic: "영어 빈칸추론 상담",
    requestedTime: "2026-02-06 21:00",
    status: "pending",
  },
];

// Mock Data for Events (Confirmed Schedule)
const INITIAL_EVENTS = [
  {
    id: 101,
    title: "정기 멘토링 (이서울)",
    date: new Date(2026, 1, 3), // Feb 3
    time: "18:00",
    type: "mentoring",
  },
];

export default function SchedulePage() {
  const { openModal } = useModal();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [events, setEvents] = useState(INITIAL_EVENTS);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).getDay();
  const daysInMonth = getDaysInMonth(currentDate);

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  // Interaction Handlers
  const handleApprove = (reqId: number) => {
    const request = requests.find((r) => r.id === reqId);
    if (!request) return;

    openModal({
      title: "상담 요청 수락",
      content: `${request.studentName} 학생의 상담 요청을 수락하시겠습니까?`,
      type: "confirm",
      confirmText: "수락하기",
      onConfirm: () => {
        // Add to events
        const reqDate = new Date(request.requestedTime);
        setEvents((prev) => [
          ...prev,
          {
            id: Date.now(),
            title: `멘토링 (${request.studentName})`,
            date: reqDate,
            time: request.requestedTime.split(" ")[1],
            type: "mentoring",
          },
        ]);

        // Remove from pending
        setRequests((prev) => prev.filter((r) => r.id !== reqId));

        openModal({
          title: "수락 완료",
          content: "✅ 상담이 확정되었습니다.",
          type: "success",
        });
      },
    });
  };

  const handleAdjust = (reqId: number) => {
    const request = requests.find((r) => r.id === reqId);
    if (!request) return;

    openModal({
      title: "일정 조정",
      content: "학생에게 제안할 새로운 일정을 선택해주세요.",
      type: "schedule_adjust",
      defaultValue: request.requestedTime,
      confirmText: "변경 제안 보내기",
      onConfirm: (result: { date: string; reason: string }) => {
        if (result && result.date) {
          // Format date for display: "2026-02-07 14:00"
          const newDate = result.date.replace("T", " ");

          setRequests((prev) =>
            prev.map((r) =>
              r.id === reqId ? { ...r, requestedTime: newDate } : r,
            ),
          );

          openModal({
            title: "제안 전송 완료",
            content: (
              <div className="text-center">
                <p className="mb-2">📩 학생에게 일정 변경 요청을 보냈습니다.</p>
                <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-500 text-left">
                  <p>
                    <span className="font-bold">변경:</span> {newDate}
                  </p>
                  {result.reason && (
                    <p>
                      <span className="font-bold">사유:</span> {result.reason}
                    </p>
                  )}
                </div>
              </div>
            ),
            type: "success",
          });
        }
      },
    });
  };

  return (
    <div className="flex gap-8 h-[calc(100vh-8rem)]">
      {/* Calendar Section (Left, larger) */}
      <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </h2>
          <div className="flex gap-2">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentDate(today)}
              className="px-3 py-1.5 text-xs font-bold bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              오늘
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col p-6">
          <div className="grid grid-cols-7 mb-4">
            {weekDays.map((day, i) => (
              <div
                key={day}
                className={`text-center text-xs font-bold uppercase tracking-wider ${i === 0 ? "text-red-400" : "text-gray-400"}`}
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 grid-rows-6 flex-1 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const date = i + 1;
              const isToday =
                date === today.getDate() &&
                currentDate.getMonth() === today.getMonth() &&
                currentDate.getFullYear() === today.getFullYear();

              // Find events for this day
              const dayEvents = events.filter(
                (e) =>
                  e.date.getDate() === date &&
                  e.date.getMonth() === currentDate.getMonth() &&
                  e.date.getFullYear() === currentDate.getFullYear(),
              );

              return (
                <div
                  key={date}
                  className={`relative border border-gray-50 rounded-xl p-2 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group flex flex-col items-start justify-start`}
                >
                  <span
                    className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? "bg-gray-900 text-white shadow-lg" : "text-gray-700"}`}
                  >
                    {date}
                  </span>
                  {/* Events */}
                  <div className="mt-1 w-full space-y-1 overflow-y-auto max-h-[60px] no-scrollbar">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-bold truncate w-full"
                      >
                        {event.time} {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sidebar (Right, requests) */}
      <div className="w-80 flex flex-col gap-6">
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm h-1/2 overflow-hidden flex flex-col">
          <h3 className="font-bold text-lg mb-1 text-gray-900">상담 요청</h3>
          <p className="text-gray-500 text-xs mb-4">
            새로운 멘토링 요청이 {requests.length}건 있습니다.
          </p>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-gray-50 rounded-xl p-3 border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-sm block text-gray-900">
                    {req.studentName}
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded font-bold uppercase">
                    Pending
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-2 truncate">
                  {req.topic}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
                  <Clock size={12} />
                  {req.requestedTime}
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleApprove(req.id)}
                    className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    수락
                  </button>
                  <button
                    onClick={() => handleAdjust(req.id)}
                    className="flex-1 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg text-xs font-bold transition-colors"
                  >
                    조정
                  </button>
                </div>
              </div>
            ))}
            {requests.length === 0 && (
              <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                대기 중인 요청이 없습니다.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex-1 p-6 overflow-hidden">
          <h3 className="font-bold text-gray-900 mb-4">다가오는 일정</h3>
          <div className="space-y-4 relative h-full overflow-y-auto">
            {/* Timeline line */}
            <div className="absolute left-[7px] top-2 bottom-0 w-0.5 bg-gray-100 h-full" />

            {/* Sort events by date */}
            {[...events]
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .slice(0, 5) // limit to next 5
              .map((event, i) => (
                <div key={i} className="flex gap-4 relative">
                  <div className="w-4 h-4 rounded-full bg-white border-4 border-blue-500 shrink-0 z-10" />
                  <div className="pb-4">
                    <span className="block text-xs font-bold text-blue-600 mb-0.5">
                      {event.date.getMonth() + 1}월 {event.date.getDate()}일{" "}
                      {event.time}
                    </span>
                    <p className="text-sm font-bold text-gray-900">
                      {event.title}
                    </p>
                    <p className="text-xs text-gray-400">Zoom 온라인</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
