"use client";

import { useEffect, useMemo, useState } from "react";
import { DEFAULT_CATEGORIES } from "@/constants/common";
import PlannerCollectionView from "@/components/mentee/calendar/PlannerCollectionView";
import PlannerDetailView from "@/components/mentee/calendar/PlannerDetailView";
import { useMentorStore } from "@/features/mentor/context/MentorStoreProvider";
import {
  MOCK_USER_TASKS,
  MOCK_WEEKLY_SCHEDULE,
} from "@/features/mentor/data/mock";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const getDaysInMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

export default function MentorPlannerPage() {
  const { store, savePlannerComment } = useMentorStore();
  const searchParams = useSearchParams();
  const menteeParam = searchParams?.get("menteeId");
  const [selectedMenteeId, setSelectedMenteeId] = useState<string>(
    menteeParam ?? store.mentees[0]?.id ?? "",
  );
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const mentee = store.mentees.find((item) => item.id === selectedMenteeId);
  const menteePlannerDays = useMemo(() => {
    return store.plannerDays
      .filter((day) => day.menteeId === selectedMenteeId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [store.plannerDays, selectedMenteeId]);

  useEffect(() => {
    if (menteePlannerDays.length === 0) {
      const today = new Date();
      setSelectedDate(today);
      setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
      return;
    }
    setSelectedDate(menteePlannerDays[0].date);
    setCurrentDate(
      new Date(
        menteePlannerDays[0].date.getFullYear(),
        menteePlannerDays[0].date.getMonth(),
        1,
      ),
    );
  }, [selectedMenteeId, menteePlannerDays]);

  useEffect(() => {
    if (menteeParam) {
      setSelectedMenteeId(menteeParam);
    }
  }, [menteeParam]);

  useEffect(() => {
    if (
      selectedDate.getFullYear() !== currentDate.getFullYear() ||
      selectedDate.getMonth() !== currentDate.getMonth()
    ) {
      setCurrentDate(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
      );
    }
  }, [selectedDate, currentDate]);

  const getCategoryIdBySubject = (subject: string) => {
    const category = DEFAULT_CATEGORIES.find((item) => item.name === subject);
    return category?.id ?? DEFAULT_CATEGORIES[0].id;
  };

  const buildMentorTaskItem = (task: typeof store.tasks[number]) => ({
    id: task.id,
    title: task.title,
    categoryId: getCategoryIdBySubject(task.subject),
    startTime: task.startTime,
    endTime: task.endTime,
    status: task.status,
    isMentorTask: true,
  });

  const buildUserTaskItem = (task: typeof MOCK_USER_TASKS[number]) => ({
    id: task.id,
    title: task.title,
    categoryId: task.categoryId,
    startTime: task.startTime,
    endTime: task.endTime,
    status: task.status,
    isMentorTask: false,
  });

  const getPlannerTasksForDate = (date: Date) => {
    const mentorTasks = store.tasks
      .filter(
        (task) =>
          task.menteeId === selectedMenteeId &&
          isSameDay(task.deadline, date),
      )
      .map(buildMentorTaskItem);

    const userTasks = MOCK_USER_TASKS.filter(
      (task) =>
        task.menteeId === selectedMenteeId &&
        (task.deadline ? isSameDay(task.deadline, date) : false),
    ).map(buildUserTaskItem);

    const combined = [...mentorTasks, ...userTasks];
    return combined.length > 0 ? combined : null;
  };

  const mentorTasksForSelected = useMemo(
    () =>
      store.tasks
        .filter(
          (task) =>
            task.menteeId === selectedMenteeId &&
            isSameDay(task.deadline, selectedDate),
        )
        .map(buildMentorTaskItem),
    [store.tasks, selectedDate, selectedMenteeId],
  );

  const userTasksForSelected = useMemo(
    () =>
      MOCK_USER_TASKS.filter(
        (task) =>
          task.menteeId === selectedMenteeId &&
          (task.deadline ? isSameDay(task.deadline, selectedDate) : false),
      ).map(buildUserTaskItem),
    [selectedDate, selectedMenteeId],
  );

  const weeklyScheduleForMentee = useMemo(() => {
    return MOCK_WEEKLY_SCHEDULE.filter(
      (day) => day.menteeId === selectedMenteeId,
    ).map((day) => ({
      date: day.date,
      events: day.items.map((item) => ({
        id: item.id,
        title: item.title,
        categoryId: item.categoryId,
        taskType: item.taskType,
        startTime: item.startTime,
        endTime: item.endTime,
        isMentorTask: item.isMentorTask ?? item.taskType === "mentor",
      })),
    }));
  }, [selectedMenteeId]);

  const dailyEventsForSelected = useMemo(() => {
    const match = weeklyScheduleForMentee.find((day) =>
      isSameDay(day.date, selectedDate),
    );
    return match ? match.events : [];
  }, [weeklyScheduleForMentee, selectedDate]);

  const record = store.plannerDays.find(
    (day) =>
      day.menteeId === selectedMenteeId && isSameDay(day.date, selectedDate),
  );
  const recordId =
    record?.id ?? `${selectedMenteeId}-${selectedDate.toISOString()}`;

  const daysInMonth = getDaysInMonth(currentDate);
  const today = new Date();
  const isToday = (date: Date) => isSameDay(date, today);

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
          Planner Review
        </p>
        <h1 className="text-2xl font-bold text-gray-900">
          학생 플래너 피드백
        </h1>
        <p className="text-sm text-gray-500">
          학생 캘린더 안에서 미니 플래너를 열고 피드백을 남겨주세요.
        </p>
      </header>

      <section className="space-y-6">
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">학생 선택</h2>
              <p className="text-xs text-gray-400">
                학생을 선택하면 해당 캘린더와 미니 플래너가 표시됩니다.
              </p>
            </div>
            {mentee ? (
              <div className="text-xs text-gray-500">
                {mentee.grade} · {mentee.goal}
              </div>
            ) : null}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {store.mentees.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedMenteeId(item.id)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  selectedMenteeId === item.id
                    ? "border-gray-300 bg-gray-50 text-gray-900"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevDay}
              className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-500"
            >
              이전
            </button>
            <div className="text-sm font-semibold text-gray-900">
              {selectedDate.toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </div>
            <button
              type="button"
              onClick={handleNextDay}
              className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-500"
            >
              다음
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {mentee?.name ?? "학생"} 캘린더
                  </h2>
                  <p className="text-xs text-gray-400">
                    미니 플래너를 클릭해 피드백을 작성하세요.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="rounded-full border border-gray-200 px-2 py-1 text-xs"
                  >
                    이전
                  </button>
                  <span>
                    {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
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

              <div className="mt-5">
                <PlannerCollectionView
                  currentDate={currentDate}
                  daysInMonth={daysInMonth}
                  isToday={isToday}
                  isSameDay={isSameDay}
                  onDateClick={(date) => setSelectedDate(date)}
                  getPlannerTasksForDate={getPlannerTasksForDate}
                  weeklySchedule={weeklyScheduleForMentee}
                  dailyRecords={menteePlannerDays.map((day) => ({
                    date: day.date,
                    studyTime: day.studyTime,
                    memo: day.memo,
                  }))}
                  fillCard
                  fillScale={0.52}
                  gridClassName="grid grid-cols-2 gap-2 border-t border-gray-200 auto-rows-[minmax(220px,1fr)] md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
                  showDateLabel
                  dateLabelClassName="text-xs md:text-sm"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900">플래너 업로드</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {menteePlannerDays.length === 0 ? (
                  <div className="w-full rounded-2xl border border-dashed border-gray-200 px-3 py-4 text-center text-xs text-gray-400">
                    업로드된 플래너가 없습니다.
                  </div>
                ) : (
                  menteePlannerDays.map((day) => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => setSelectedDate(day.date)}
                      className={`rounded-full border px-3 py-2 text-left text-xs transition ${
                        isSameDay(day.date, selectedDate)
                          ? "border-gray-300 bg-gray-50"
                          : "border-gray-100 hover:bg-gray-50"
                      }`}
                    >
                      {day.date.toLocaleDateString("ko-KR")}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                {selectedDate.toLocaleDateString("ko-KR", {
                  month: "long",
                  day: "numeric",
                  weekday: "short",
                })} 플래너
              </h2>
              <div className="mt-4 flex justify-center">
                <PlannerDetailView
                  date={selectedDate}
                  dailyRecord={record}
                  mentorDeadlines={mentorTasksForSelected}
                  userTasks={userTasksForSelected}
                  dailyEvents={dailyEventsForSelected}
                  size="page"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">멘토 코멘트</h2>
              <textarea
                value={store.plannerComments[recordId] ?? ""}
                onChange={(event) =>
                  savePlannerComment(recordId, event.target.value)
                }
                placeholder="학생에게 전달할 코멘트를 남겨주세요."
                className="mt-4 w-full rounded-2xl border border-gray-200 p-3 text-sm"
                rows={6}
              />
              <button
                type="button"
                onClick={() =>
                  savePlannerComment(
                    recordId,
                    store.plannerComments[recordId] ?? "",
                  )
                }
                className="mt-3 w-full rounded-2xl bg-gray-900 py-2 text-sm font-semibold text-white"
              >
                코멘트 저장
              </button>
              <Link
                href={`/mentor/tasks?menteeId=${selectedMenteeId}`}
                className="mt-3 flex w-full items-center justify-center rounded-2xl border border-gray-200 py-2 text-sm font-semibold text-gray-700"
              >
                과제 관리로 이동
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
