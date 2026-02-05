"use client";

import { useEffect, useMemo, useState } from "react";
import { useMentorStore } from "@/features/mentor/context/MentorStoreProvider";
import type { MentorTaskStatus } from "@/features/mentor/types";
import { useSearchParams } from "next/navigation";

const FILTERS: Array<{ id: "all" | MentorTaskStatus; label: string }> = [
  { id: "all", label: "전체" },
  { id: "pending", label: "대기" },
  { id: "submitted", label: "제출됨" },
  { id: "feedback_completed", label: "피드백 완료" },
];

export default function MentorTasksPage() {
  const searchParams = useSearchParams();
  const {
    store,
    createTasks,
    updateTaskStatus,
    updateTaskComment,
  } = useMentorStore();
  const [filter, setFilter] = useState<"all" | MentorTaskStatus>("all");
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [selectedMenteeId, setSelectedMenteeId] = useState<string>("all");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [commentDraft, setCommentDraft] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDeadline, setSelectedDeadline] = useState("");
  const [repeatType, setRepeatType] = useState<
    "none" | "weekly" | "biweekly" | "monthly"
  >("none");
  const [repeatDays, setRepeatDays] = useState<number[]>([1]);
  const [repeatStart, setRepeatStart] = useState("");
  const [repeatEnd, setRepeatEnd] = useState("");
  const [monthlyDay, setMonthlyDay] = useState(1);

  const tasks = useMemo(() => {
    const base =
      selectedMenteeId === "all"
        ? store.tasks
        : store.tasks.filter((task) => task.menteeId === selectedMenteeId);
    if (filter === "all") return base;
    return base.filter((task) => task.status === filter);
  }, [filter, store.tasks, selectedMenteeId]);

  const menteeMap = useMemo(
    () => new Map(store.mentees.map((mentee) => [mentee.id, mentee.name])),
    [store.mentees],
  );

  const selectedTask = store.tasks.find((task) => task.id === selectedId) ?? null;

  const handleSelect = (id: string | number) => {
    setSelectedId(id);
    const task = store.tasks.find((item) => item.id === id);
    setCommentDraft(task?.mentorComment ?? "");
  };

  const pad2 = (value: number) => String(value).padStart(2, "0");
  const formatDateInput = (date: Date) =>
    `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
      date.getDate(),
    )}`;
  const parseDateInput = (value: string) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day, 12);
  };
  const addDays = (date: Date, days: number) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  useEffect(() => {
    const menteeQuery = searchParams?.get("menteeId");
    const taskQuery = searchParams?.get("taskId");
    if (menteeQuery) {
      setSelectedMenteeId(menteeQuery);
    }
    if (taskQuery) {
      setSelectedId(taskQuery);
      const target = store.tasks.find(
        (task) => String(task.id) === String(taskQuery),
      );
      if (target) {
        setSelectedMenteeId(target.menteeId);
        setCommentDraft(target.mentorComment ?? "");
      }
    }
  }, [searchParams, store.tasks]);

  useEffect(() => {
    if (!selectedDeadline) return;
    const base = parseDateInput(selectedDeadline);
    setCalendarMonth(new Date(base.getFullYear(), base.getMonth(), 1));
    setRepeatStart(selectedDeadline);
    setRepeatEnd(formatDateInput(addDays(base, 28)));
    setRepeatDays([base.getDay()]);
    setMonthlyDay(base.getDate());
  }, [selectedDeadline]);

  useEffect(() => {
    if (selectedDeadline) return;
    setSelectedDeadline(formatDateInput(new Date()));
  }, [selectedDeadline]);

  const getRepeatDates = () => {
    if (!selectedDeadline) return [];
    if (repeatType === "none") return [parseDateInput(selectedDeadline)];
    if (!repeatStart || !repeatEnd) return [];
    const start = parseDateInput(repeatStart);
    const end = parseDateInput(repeatEnd);
    const dates: Date[] = [];
    if (repeatType === "monthly") {
      const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
      const last = new Date(end.getFullYear(), end.getMonth(), 1);
      while (cursor <= last) {
        const daysInMonth = new Date(
          cursor.getFullYear(),
          cursor.getMonth() + 1,
          0,
        ).getDate();
        if (monthlyDay <= daysInMonth) {
          const target = new Date(
            cursor.getFullYear(),
            cursor.getMonth(),
            monthlyDay,
          );
          if (target >= start && target <= end) {
            dates.push(target);
          }
        }
        cursor.setMonth(cursor.getMonth() + 1);
      }
      return dates;
    }
    if (repeatDays.length === 0) return [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const diffDays = Math.floor(
        (cursor.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      );
      const weekIndex = Math.floor(diffDays / 7);
      const isActiveWeek = repeatType === "biweekly" ? weekIndex % 2 === 0 : true;
      if (isActiveWeek && repeatDays.includes(cursor.getDay())) {
        dates.push(new Date(cursor));
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return dates;
  };

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = getDaysInMonth(calendarMonth);
    const days: Array<Date | null> = [];
    for (let i = 0; i < startOffset; i += 1) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      days.push(new Date(year, month, day));
    }
    return days;
  }, [calendarMonth]);

  const tasksByDate = useMemo(() => {
    if (selectedMenteeId === "all") return new Map<string, number>();
    const map = new Map<string, number>();
    store.tasks
      .filter((task) => task.menteeId === selectedMenteeId)
      .forEach((task) => {
        const key = formatDateInput(task.deadline);
        map.set(key, (map.get(key) ?? 0) + 1);
      });
    return map;
  }, [store.tasks, selectedMenteeId]);

  const handleCreate = () => {
    const activeMenteeId = selectedMenteeId === "all" ? "" : selectedMenteeId;
    const dates = getRepeatDates();
    if (!title || !subject || !activeMenteeId || dates.length === 0) return;
    createTasks(
      {
        title,
        subject,
        menteeId: activeMenteeId,
        deadline: dates[0],
        description,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
      },
      dates,
    );
    setTitle("");
    setSubject("");
    setDescription("");
    setStartTime("");
    setEndTime("");
  };

  const handleSaveComment = () => {
    if (!selectedTask) return;
    updateTaskComment(selectedTask.id, commentDraft);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
          Mentor Tasks
        </p>
        <h1 className="text-2xl font-bold text-gray-900">과제 관리</h1>
        <p className="text-sm text-gray-500">
          멘티에게 배정한 과제 상태를 빠르게 확인하세요.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`rounded-full border px-4 py-1 text-xs font-semibold transition ${
              filter === item.id
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-gray-200 text-gray-400 hover:border-gray-300"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="grid gap-6 lg:grid-cols-[240px_1.1fr_1fr]">
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900">담당 학생</h2>
          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={() => setSelectedMenteeId("all")}
              className={`w-full rounded-2xl border px-3 py-2 text-left text-sm transition ${
                selectedMenteeId === "all"
                  ? "border-gray-300 bg-gray-50"
                  : "border-gray-100 hover:bg-gray-50"
              }`}
            >
              전체
            </button>
            {store.mentees.map((mentee) => (
              <button
                key={mentee.id}
                type="button"
                onClick={() => setSelectedMenteeId(mentee.id)}
                className={`w-full rounded-2xl border px-3 py-2 text-left text-sm transition ${
                  selectedMenteeId === mentee.id
                    ? "border-gray-300 bg-gray-50"
                    : "border-gray-100 hover:bg-gray-50"
                }`}
              >
                <p className="font-semibold text-gray-900">{mentee.name}</p>
                <p className="text-xs text-gray-400">{mentee.grade}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">과제 리스트</h2>
            <span className="text-xs text-gray-400">{tasks.length}건</span>
          </div>
          <div className="mt-4 space-y-2">
            <div className="hidden md:grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3 px-3 text-[11px] font-semibold text-gray-400">
              <span>과제</span>
              <span>학생</span>
              <span>마감</span>
              <span>상태</span>
            </div>
            <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => handleSelect(task.id)}
                  className={`grid w-full grid-cols-1 gap-2 px-4 py-3 text-left transition md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] md:items-center ${
                    selectedId === task.id
                      ? "bg-gray-50"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
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
                  <span className="text-xs text-gray-500">{task.status}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">과제 배정</h2>
            <p className="mt-1 text-xs text-gray-400">
              학생을 선택한 뒤 과제를 배정하세요.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-500">
                  선택된 학생
                </label>
                <p className="mt-2 rounded-2xl border border-gray-200 px-3 py-2 text-sm text-gray-600">
                  {selectedMenteeId === "all"
                    ? "학생을 먼저 선택해주세요."
                    : menteeMap.get(selectedMenteeId)}
                </p>
              </div>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="과제 제목"
                className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
              />
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="과목"
                className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
              />
              <input
                value={selectedDeadline}
                onChange={(event) => setSelectedDeadline(event.target.value)}
                type="date"
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
              <input
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                placeholder="시작 시간 (예: 09:00)"
                className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
              />
              <input
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                placeholder="종료 시간 (예: 10:00)"
                className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
              />
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="과제 설명"
                rows={3}
                className="md:col-span-2 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
              />
            </div>

            {repeatType !== "none" ? (
              <div className="mt-4 space-y-3 rounded-2xl border border-dashed border-gray-200 p-4">
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

            <div className="mt-5 rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">
                  학생 캘린더
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <button
                    type="button"
                    onClick={() =>
                      setCalendarMonth(
                        new Date(
                          calendarMonth.getFullYear(),
                          calendarMonth.getMonth() - 1,
                          1,
                        ),
                      )
                    }
                    className="rounded-full border border-gray-200 px-2 py-1"
                  >
                    이전
                  </button>
                  <span>
                    {calendarMonth.getFullYear()}년{" "}
                    {calendarMonth.getMonth() + 1}월
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCalendarMonth(
                        new Date(
                          calendarMonth.getFullYear(),
                          calendarMonth.getMonth() + 1,
                          1,
                        ),
                      )
                    }
                    className="rounded-full border border-gray-200 px-2 py-1"
                  >
                    다음
                  </button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-gray-400">
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
                        className="h-16 border border-gray-100"
                      />
                    );
                  }
                  const dateKey = formatDateInput(date);
                  const count = tasksByDate.get(dateKey) ?? 0;
                  const isSelected = selectedDeadline === dateKey;
                  return (
                    <button
                      key={dateKey}
                      type="button"
                      onClick={() => setSelectedDeadline(dateKey)}
                      className={`flex h-16 flex-col border p-2 text-left text-[10px] transition ${
                        isSelected
                          ? "border-gray-300 bg-gray-50"
                          : "border-gray-100"
                      }`}
                    >
                      <span className="text-xs font-semibold text-gray-900">
                        {date.getDate()}
                      </span>
                      {count > 0 ? (
                        <span className="mt-1 text-[9px] text-gray-500">
                          과제 {count}건
                        </span>
                      ) : (
                        <span className="mt-1 text-[9px] text-gray-300">
                          비어있음
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreate}
              className="mt-4 w-full rounded-2xl bg-gray-900 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
              disabled={
                selectedMenteeId === "all" ||
                !title ||
                !subject ||
                !selectedDeadline
              }
            >
              과제 생성
            </button>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">상세/피드백</h2>
            {selectedTask ? (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedTask.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {menteeMap.get(selectedTask.menteeId) ?? "멘티"} ·{" "}
                    {selectedTask.subject} · {selectedTask.status}
                  </p>
                  {selectedTask.description ? (
                    <p className="mt-2 text-xs text-gray-600">
                      {selectedTask.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => updateTaskStatus(selectedTask.id, "pending")}
                    className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-semibold text-gray-500"
                  >
                    대기
                  </button>
                  <button
                    type="button"
                    onClick={() => updateTaskStatus(selectedTask.id, "submitted")}
                    className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-semibold text-gray-500"
                  >
                    제출 확인
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateTaskStatus(selectedTask.id, "feedback_completed")
                    }
                    className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-semibold text-gray-500"
                  >
                    피드백 완료
                  </button>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">
                    피드백 코멘트
                  </label>
                  <textarea
                    value={commentDraft}
                    onChange={(event) => setCommentDraft(event.target.value)}
                    rows={4}
                    className="mt-2 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                    placeholder="멘티에게 전달할 코멘트를 적어주세요"
                  />
                  <button
                    type="button"
                    onClick={handleSaveComment}
                    className="mt-3 rounded-2xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    코멘트 저장
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-400">
                과제를 선택하면 상세 정보를 볼 수 있습니다.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
