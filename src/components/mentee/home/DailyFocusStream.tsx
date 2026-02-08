"use client";

import YesterdayRecap from "./sections/YesterdayRecap";
import TodayTimeline from "./sections/TodayTimeline";
import TomorrowPreview from "./sections/TomorrowPreview";

type FocusTask = {
  id: string | number;
  status?: string;
  deadline?: Date | string | null;
  type?: "mentor" | "user";
  [key: string]: unknown;
};

interface DailyFocusStreamProps {
  tasks?: FocusTask[];
  baseDate?: Date;
}

const normalizeDate = (value?: Date | string | null) => {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
};

const isSameDay = (d1: Date, d2?: Date | null) => {
  if (!d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export default function DailyFocusStream({
  tasks = [],
  baseDate = new Date(),
}: DailyFocusStreamProps) {
  const today = new Date(baseDate);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const normalizedTasks = tasks.map((task) => ({
    ...task,
    deadline: normalizeDate(task.deadline),
    type: task.type ?? "user",
  }));

  const yesterdayTasks = normalizedTasks.filter((task) =>
    isSameDay(yesterday, task.deadline as Date | null),
  );
  const missedTasks = yesterdayTasks.filter(
    (task) => task.status !== "submitted" && task.status !== "feedback_completed",
  );
  const feedbackTasks = yesterdayTasks.filter(
    (task) => task.status === "feedback_completed",
  );

  const todayTasks = normalizedTasks
    .filter((task) => isSameDay(today, task.deadline as Date | null))
    .sort((a, b) => {
      const score = (status?: string) => (status === "pending" ? 0 : 1);
      return score(a.status) - score(b.status);
    });

  const tomorrowTasks = normalizedTasks.filter((task) =>
    isSameDay(tomorrow, task.deadline as Date | null),
  );

  return (
    <div className="flex min-h-[300px] flex-col">
      <YesterdayRecap missedTasks={missedTasks} feedbackTasks={feedbackTasks} />
      <TodayTimeline tasks={todayTasks} />
      <TomorrowPreview tasks={tomorrowTasks} />
    </div>
  );
}
