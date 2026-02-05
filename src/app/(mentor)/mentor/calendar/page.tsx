"use client";

import { useEffect, useMemo, useState } from "react";
import { useMentorStore } from "@/features/mentor/context/MentorStoreProvider";
import type { MentorCalendarEvent } from "@/features/mentor/types";
import { MOCK_USER_TASKS, MOCK_WEEKLY_SCHEDULE } from "@/features/mentor/data/mock";

const CATEGORY_LABEL: Record<MentorCalendarEvent["category"], string> = {
  meeting: "미팅",
  consulting: "상담",
  exam: "모의고사",
  other: "기타",
};

const formatDateInput = (date: Date) =>
  date.toISOString().slice(0, 10);

const parseDateInput = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
};

const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const isSameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const buildCalendarDays = (month: Date) => {
  const year = month.getFullYear();
  const targetMonth = month.getMonth();
  const firstDay = new Date(year, targetMonth, 1);
  const lastDay = new Date(year, targetMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startOffset = firstDay.getDay();
  const days: Array<Date | null> = [];
  for (let i = 0; i < startOffset; i += 1) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(new Date(year, targetMonth, day));
  }
  return days;
};

export default function MentorCalendarPage() {
  const { store, addMentorCalendarEvent, removeMentorCalendarEvent, createTasks } =
    useMentorStore();
  const [viewMode, setViewMode] = useState<"mentor" | "mentee">("mentee");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [mentorSelectedDate, setMentorSelectedDate] = useState(
    formatDateInput(new Date()),
  );
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<MentorCalendarEvent["category"]>(
    "meeting",
  );
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [note, setNote] = useState("");
  const [menteeMonth, setMenteeMonth] = useState(new Date());
  const [menteeSelectedDate, setMenteeSelectedDate] = useState(
    formatDateInput(new Date()),
  );
  const [selectedMenteeId, setSelectedMenteeId] = useState(
    store.mentees[0]?.id ?? "",
  );
  const [taskTitle, setTaskTitle] = useState("");
  const [taskSubject, setTaskSubject] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskStartTime, setTaskStartTime] = useState("");
  const [taskEndTime, setTaskEndTime] = useState("");
  const [repeatType, setRepeatType] = useState<
    "none" | "weekly" | "biweekly" | "monthly"
  >("none");
  const [repeatDays, setRepeatDays] = useState<number[]>([1]);
  const [repeatStart, setRepeatStart] = useState("");
  const [repeatEnd, setRepeatEnd] = useState("");
  const [monthlyDay, setMonthlyDay] = useState(1);

  const upcomingEvents = useMemo(() => {
    return [...store.mentorCalendarEvents].sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );
  }, [store.mentorCalendarEvents]);

  const calendarDays = useMemo(() => {
    return buildCalendarDays(currentMonth);
  }, [currentMonth]);

  const monthEvents = useMemo(() => {
    return store.mentorCalendarEvents.filter((event) =>
      isSameMonth(event.date, currentMonth),
    );
  }, [store.mentorCalendarEvents, currentMonth]);

  const selectedDateEvents = useMemo(() => {
    const target = new Date(`${mentorSelectedDate}T12:00:00`);
    return store.mentorCalendarEvents.filter((event) =>
      isSameDay(event.date, target),
    );
  }, [store.mentorCalendarEvents, mentorSelectedDate]);

  const menteeCalendarDays = useMemo(() => {
    return buildCalendarDays(menteeMonth);
  }, [menteeMonth]);

  const menteeSchedule = useMemo(() => {
    return MOCK_WEEKLY_SCHEDULE.filter(
      (day) => day.menteeId === selectedMenteeId,
    );
  }, [selectedMenteeId]);

  const menteeEventsForDate = useMemo(() => {
    const selected = parseDateInput(menteeSelectedDate);
    const mentorTasks = store.tasks.filter(
      (task) => task.menteeId === selectedMenteeId && isSameDay(task.deadline, selected),
    );
    const userTasks = MOCK_USER_TASKS.filter(
      (task) => task.menteeId === selectedMenteeId && task.deadline && isSameDay(task.deadline, selected),
    );
    const schedule = menteeSchedule.find((day) => isSameDay(day.date, selected));
    const scheduleItems = schedule
      ? schedule.items.map((item) => ({
          id: item.id,
          title: item.title,
          type: "plan",
        }))
      : [];
    return [
      ...mentorTasks.map((task) => ({ id: task.id, title: task.title, type: "mentor" })),
      ...userTasks.map((task) => ({ id: task.id, title: task.title, type: "user" })),
      ...scheduleItems,
    ];
  }, [menteeSelectedDate, selectedMenteeId, menteeSchedule, store.tasks]);

  const getMenteeDayEvents = (date: Date) => {
    const mentorTasks = store.tasks.filter(
      (task) => task.menteeId === selectedMenteeId && isSameDay(task.deadline, date),
    );
    const userTasks = MOCK_USER_TASKS.filter(
      (task) => task.menteeId === selectedMenteeId && task.deadline && isSameDay(task.deadline, date),
    );
    const schedule = menteeSchedule.find((day) => isSameDay(day.date, date));
    const scheduleItems = schedule
      ? schedule.items.map((item) => ({ id: item.id, title: item.title, type: "plan" }))
      : [];
    return [
      ...mentorTasks.map((task) => ({ id: task.id, title: task.title, type: "mentor" })),
      ...userTasks.map((task) => ({ id: task.id, title: task.title, type: "user" })),
      ...scheduleItems,
    ];
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  const handleMenteePrevMonth = () => {
    const nextMonth = new Date(
      menteeMonth.getFullYear(),
      menteeMonth.getMonth() - 1,
      1,
    );
    setMenteeMonth(nextMonth);
    setMenteeSelectedDate(formatDateInput(nextMonth));
  };

  const handleMenteeNextMonth = () => {
    const nextMonth = new Date(
      menteeMonth.getFullYear(),
      menteeMonth.getMonth() + 1,
      1,
    );
    setMenteeMonth(nextMonth);
    setMenteeSelectedDate(formatDateInput(nextMonth));
  };

  const handleAdd = () => {
    if (!title || !mentorSelectedDate) return;
    addMentorCalendarEvent({
      title,
      category,
      date: new Date(`${mentorSelectedDate}T12:00:00`),
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      note: note || undefined,
    });
    setTitle("");
    setStartTime("");
    setEndTime("");
    setNote("");
  };

  const handleMenteeRepeat = () => {
    if (!selectedMenteeId || !taskTitle || !taskSubject) return;
    if (!menteeSelectedDate) return;
    const baseDate = parseDateInput(menteeSelectedDate);
    const start = repeatStart ? parseDateInput(repeatStart) : baseDate;
    const end = repeatEnd ? parseDateInput(repeatEnd) : baseDate;
    const dates: Date[] = [];

    if (repeatType === "none") {
      dates.push(baseDate);
    } else if (repeatType === "monthly") {
      const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
      const last = new Date(end.getFullYear(), end.getMonth(), 1);
      while (cursor <= last) {
        const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
        if (monthlyDay <= daysInMonth) {
          const target = new Date(cursor.getFullYear(), cursor.getMonth(), monthlyDay);
          if (target >= start && target <= end) dates.push(target);
        }
        cursor.setMonth(cursor.getMonth() + 1);
      }
    } else {
      const cursor = new Date(start);
      while (cursor <= end) {
        const diffDays = Math.floor((cursor.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const weekIndex = Math.floor(diffDays / 7);
        const isActiveWeek = repeatType === "biweekly" ? weekIndex % 2 === 0 : true;
        if (isActiveWeek && repeatDays.includes(cursor.getDay())) {
          dates.push(new Date(cursor));
        }
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    createTasks(
      {
        menteeId: selectedMenteeId,
        subject: taskSubject,
        title: taskTitle,
        description: taskDescription,
        deadline: dates[0] ?? baseDate,
        startTime: taskStartTime || undefined,
        endTime: taskEndTime || undefined,
      },
      dates,
    );

    setTaskTitle("");
    setTaskSubject("");
    setTaskDescription("");
    setTaskStartTime("");
    setTaskEndTime("");
  };

  useEffect(() => {
    if (!menteeSelectedDate) return;
    const base = parseDateInput(menteeSelectedDate);
    setRepeatStart(formatDateInput(base));
    setRepeatEnd(formatDateInput(addDays(base, 28)));
    setRepeatDays([base.getDay()]);
    setMonthlyDay(base.getDate());
  }, [menteeSelectedDate]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
          Mentor Calendar
        </p>
        <h1 className="text-2xl font-bold text-gray-900">일정 관리</h1>
        <p className="text-sm text-gray-500">
          멘토 일정(미팅/상담/모의고사)을 관리합니다.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setViewMode("mentee")}
          className={`rounded-full border px-4 py-1 text-xs font-semibold ${
            viewMode === "mentee"
              ? "border-gray-300 bg-gray-50 text-gray-700"
              : "border-gray-200 text-gray-400"
          }`}
        >
          멘티 캘린더
        </button>
        <button
          type="button"
          onClick={() => setViewMode("mentor")}
          className={`rounded-full border px-4 py-1 text-xs font-semibold ${
            viewMode === "mentor"
              ? "border-gray-300 bg-gray-50 text-gray-700"
              : "border-gray-200 text-gray-400"
          }`}
        >
          멘토 일정
        </button>
      </div>

      {viewMode === "mentor" ? (
        <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">월간 일정</h2>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="rounded-full border border-gray-200 px-2 py-1 text-xs"
                >
                  이전
                </button>
                <span>
                  {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="rounded-full border border-gray-200 px-2 py-1 text-xs"
                >
                  다음
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-2 text-center text-[11px] font-semibold text-gray-400">
              {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-0 border border-gray-100">
              {calendarDays.map((date, index) => {
                if (!date) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="h-24 border border-gray-100"
                    />
                  );
                }
                const dayEvents = monthEvents.filter((event) =>
                  isSameDay(event.date, date),
                );
                const isSelected = mentorSelectedDate === formatDateInput(date);
                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onClick={() => setMentorSelectedDate(formatDateInput(date))}
                    className={`flex h-24 flex-col border p-2 text-left text-xs transition ${
                      isSelected
                        ? "border-gray-300 bg-gray-50"
                        : "border-gray-100"
                    }`}
                  >
                    <span className="text-sm font-semibold text-gray-900">
                      {date.getDate()}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center gap-1 text-[10px] text-gray-600"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                          <span className="truncate">{event.title}</span>
                        </div>
                      ))}
                      {dayEvents.length > 3 ? (
                        <div className="text-[10px] text-gray-300">
                          +{dayEvents.length - 3}건
                        </div>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">
                  다가오는 일정
                </h3>
                <span className="text-xs text-gray-400">
                  {upcomingEvents.length}건
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {upcomingEvents.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-400">
                    등록된 일정이 없습니다.
                  </div>
                ) : (
                  upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-2xl border border-gray-100 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {event.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {event.date.toLocaleDateString("ko-KR")} ·{" "}
                            {CATEGORY_LABEL[event.category]}
                          </p>
                          <p className="text-xs text-gray-400">
                            {event.startTime && event.endTime
                              ? `${event.startTime} - ${event.endTime}`
                              : "시간 미지정"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMentorCalendarEvent(event.id)}
                          className="text-xs text-gray-400"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">일정 추가</h2>
              <div className="mt-4 space-y-3">
                <input
                  type="date"
                  value={mentorSelectedDate}
                  onChange={(event) => setMentorSelectedDate(event.target.value)}
                  className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                />
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="일정 제목"
                  className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                />
                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target.value as MentorCalendarEvent["category"],
                    )
                  }
                  className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="meeting">미팅</option>
                  <option value="consulting">상담</option>
                  <option value="exam">모의고사</option>
                  <option value="other">기타</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                    placeholder="시작 시간"
                    className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                  />
                  <input
                    value={endTime}
                    onChange={(event) => setEndTime(event.target.value)}
                    placeholder="종료 시간"
                    className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="메모"
                  rows={3}
                  className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={handleAdd}
                  className="w-full rounded-2xl bg-gray-900 py-2 text-sm font-semibold text-white"
                >
                  일정 추가
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">선택 날짜 일정</h2>
              <div className="mt-4 space-y-2">
                {selectedDateEvents.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-400">
                    선택한 날짜에 등록된 일정이 없습니다.
                  </div>
                ) : (
                  selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-2xl border border-gray-100 px-4 py-3"
                    >
                      <p className="text-sm font-semibold text-gray-900">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {CATEGORY_LABEL[event.category]} ·{" "}
                        {event.startTime && event.endTime
                          ? `${event.startTime} - ${event.endTime}`
                          : "시간 미지정"}
                      </p>
                      {event.note ? (
                        <p className="mt-1 text-xs text-gray-500">
                          {event.note}
                        </p>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">멘티 캘린더</h2>
                <p className="text-xs text-gray-400">
                  멘티 일정과 과제를 확인하고 반복 과제를 생성하세요.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <button
                  type="button"
                  onClick={handleMenteePrevMonth}
                  className="rounded-full border border-gray-200 px-2 py-1 text-xs"
                >
                  이전
                </button>
                <span>
                  {menteeMonth.getFullYear()}년 {menteeMonth.getMonth() + 1}월
                </span>
                <button
                  type="button"
                  onClick={handleMenteeNextMonth}
                  className="rounded-full border border-gray-200 px-2 py-1 text-xs"
                >
                  다음
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {store.mentees.map((mentee) => (
                <button
                  key={mentee.id}
                  type="button"
                  onClick={() => setSelectedMenteeId(mentee.id)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    selectedMenteeId === mentee.id
                      ? "border-gray-300 bg-gray-50 text-gray-700"
                      : "border-gray-200 text-gray-400"
                  }`}
                >
                  {mentee.name}
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-7 gap-2 text-center text-[11px] font-semibold text-gray-400">
              {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-0 border border-gray-100">
              {menteeCalendarDays.map((date, index) => {
                if (!date) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="h-24 border border-gray-100"
                    />
                  );
                }
                const dayEvents = getMenteeDayEvents(date);
                const isSelected = menteeSelectedDate === formatDateInput(date);
                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onClick={() => setMenteeSelectedDate(formatDateInput(date))}
                    className={`flex h-24 flex-col border p-2 text-left text-xs transition ${
                      isSelected
                        ? "border-gray-300 bg-gray-50"
                        : "border-gray-100"
                    }`}
                  >
                    <span className="text-sm font-semibold text-gray-900">
                      {date.getDate()}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={`${event.type}-${event.id}`}
                          className="flex items-center gap-1 text-[10px] text-gray-600"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                          <span className="truncate">{event.title}</span>
                        </div>
                      ))}
                      {dayEvents.length > 3 ? (
                        <div className="text-[10px] text-gray-300">
                          +{dayEvents.length - 3}건
                        </div>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                반복 과제 생성
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                선택된 멘티에게 반복 과제를 배정합니다.
              </p>
              <div className="mt-4 space-y-3">
                <input
                  type="date"
                  value={menteeSelectedDate}
                  onChange={(event) =>
                    setMenteeSelectedDate(event.target.value)
                  }
                  className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                />
                <input
                  value={taskTitle}
                  onChange={(event) => setTaskTitle(event.target.value)}
                  placeholder="과제 제목"
                  className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                />
                <input
                  value={taskSubject}
                  onChange={(event) => setTaskSubject(event.target.value)}
                  placeholder="과목"
                  className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={taskStartTime}
                    onChange={(event) => setTaskStartTime(event.target.value)}
                    placeholder="시작 시간"
                    className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                  />
                  <input
                    value={taskEndTime}
                    onChange={(event) => setTaskEndTime(event.target.value)}
                    placeholder="종료 시간"
                    className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <textarea
                  value={taskDescription}
                  onChange={(event) => setTaskDescription(event.target.value)}
                  placeholder="과제 설명"
                  rows={3}
                  className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                />
                <select
                  value={repeatType}
                  onChange={(event) =>
                    setRepeatType(event.target.value as typeof repeatType)
                  }
                  className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="none">반복 없음</option>
                  <option value="weekly">매주</option>
                  <option value="biweekly">격주</option>
                  <option value="monthly">매월</option>
                </select>
                {repeatType !== "none" ? (
                  <div className="space-y-3 rounded-2xl border border-dashed border-gray-200 p-4">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={repeatStart}
                        onChange={(event) => setRepeatStart(event.target.value)}
                        className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                      />
                      <input
                        type="date"
                        value={repeatEnd}
                        onChange={(event) => setRepeatEnd(event.target.value)}
                        className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                      />
                    </div>
                    {repeatType === "monthly" ? (
                      <div>
                        <label className="text-xs font-semibold text-gray-500">
                          매월 날짜
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={31}
                          value={monthlyDay}
                          onChange={(event) =>
                            setMonthlyDay(Number(event.target.value))
                          }
                          className="mt-2 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="text-xs font-semibold text-gray-500">
                          반복 요일
                        </label>
                        <div className="mt-2 grid grid-cols-7 gap-1 text-[11px]">
                          {["일", "월", "화", "수", "목", "금", "토"].map(
                            (label, index) => (
                              <button
                                key={label}
                                type="button"
                                onClick={() =>
                                  setRepeatDays((prev) =>
                                    prev.includes(index)
                                      ? prev.filter((day) => day !== index)
                                      : [...prev, index],
                                  )
                                }
                                className={`rounded-full border px-2 py-1 ${
                                  repeatDays.includes(index)
                                    ? "border-gray-400 bg-gray-100 text-gray-700"
                                    : "border-gray-200 text-gray-400"
                                }`}
                              >
                                {label}
                              </button>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={handleMenteeRepeat}
                  className="w-full rounded-2xl bg-gray-900 py-2 text-sm font-semibold text-white"
                >
                  반복 과제 생성
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">선택 날짜 일정</h2>
              <div className="mt-4 space-y-2">
                {menteeEventsForDate.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-400">
                    선택한 날짜에 등록된 일정이 없습니다.
                  </div>
                ) : (
                  menteeEventsForDate.map((event) => (
                    <div
                      key={`${event.type}-${event.id}`}
                      className="rounded-2xl border border-gray-100 px-4 py-3"
                    >
                      <p className="text-sm font-semibold text-gray-900">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {event.type === "mentor"
                          ? "멘토 과제"
                          : event.type === "user"
                            ? "멘티 과제"
                            : "학습 계획"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
