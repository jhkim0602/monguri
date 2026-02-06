import { DEFAULT_CATEGORIES } from "@/constants/common";

type ApiSubject = {
  id: string;
  slug?: string | null;
  name: string;
  colorHex?: string | null;
  textColorHex?: string | null;
};

type ApiMentorTask = {
  id: string;
  mentorId: string;
  menteeId: string;
  subject: ApiSubject | null;
  title: string;
  description: string | null;
  status: "pending" | "submitted" | "feedback_completed";
  deadline: string | null;
  badgeColor?: {
    bg: string;
    text: string;
  } | null;
  latestSubmission?: {
    id: string;
    submittedAt: string;
    note: string | null;
  } | null;
  latestFeedback?: {
    id: string;
    comment: string | null;
    rating: number | null;
    status: "pending" | "reviewed";
    createdAt: string;
  } | null;
  hasMentorResponse?: boolean;
};

export type MentorTaskLike = {
  id: string | number;
  subject: string;
  title: string;
  status: "pending" | "submitted" | "feedback_completed";
  badgeColor: {
    bg: string;
    text: string;
  };
  description: string;
  categoryId: string;
  mentorFeedback: string;
  mentorComment: string;
  deadline: Date | null;
  attachments: any[];
  submissions: any[];
  feedbackFiles: any[];
  isMentorTask: boolean;
  completed: boolean;
  studyRecord: any;
  hasMentorResponse: boolean;
  startTime?: string;
  endTime?: string;
};

const DEFAULT_BADGE = {
  bg: "#F3F4F6",
  text: "#4B5563",
};
export const parseDateString = (value: string | null) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return new Date(value);
  return new Date(year, month - 1, day);
};

export function adaptMentorTasksToUi(tasks: ApiMentorTask[]): MentorTaskLike[] {
  return tasks.map((task) => {
    const subject = task.subject;
    const fallbackCategory =
      (subject?.slug &&
        DEFAULT_CATEGORIES.find((c) => c.id === subject.slug)) ??
      DEFAULT_CATEGORIES[0];
    const subjectName = subject?.name ?? fallbackCategory?.name ?? "과목";
    const subjectColor =
      subject?.colorHex ?? fallbackCategory?.colorHex ?? null;
    const subjectTextColor =
      subject?.textColorHex ?? fallbackCategory?.textColorHex ?? null;
    const badgeColor = task.badgeColor || {
      bg: subjectColor ?? DEFAULT_BADGE.bg,
      text: subjectTextColor ?? DEFAULT_BADGE.text,
    };
    const mentorFeedback = task.latestFeedback?.comment ?? "";

    return {
      id: task.id,
      subject: subjectName,
      title: task.title,
      status: task.status,
      badgeColor,
      description: task.description ?? "",
      categoryId: subject?.slug ?? fallbackCategory?.id ?? "unknown",
      mentorFeedback,
      mentorComment: mentorFeedback,
      deadline: parseDateString(task.deadline),
      attachments: [],
      submissions: [],
      feedbackFiles: [],
      isMentorTask: true,
      completed: task.status === "feedback_completed",
      studyRecord: null,
      hasMentorResponse:
        typeof task.hasMentorResponse === "boolean"
          ? task.hasMentorResponse
          : Boolean(task.latestFeedback),
    };
  });
}

type ApiPlannerTask = {
  id: string;
  menteeId: string;
  subject: ApiSubject | null;
  title: string;
  date: string;
  completed: boolean;
  timeSpentSec: number | null;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
};

export type PlannerTaskLike = {
  id: string;
  title: string;
  categoryId: string;
  subject?: string;
  badgeColor?: {
    bg: string;
    text: string;
  };
  description?: string;
  status?: "pending" | "submitted";
  deadline: Date | null;
  completed: boolean;
  timeSpent: number;
  isRunning: boolean;
  isMentorTask: false;
  studyRecord: any;
  attachments?: any[];
  submissions?: any[];
  feedbackFiles?: any[];
  mentorComment?: string;
  userQuestion?: string;
  hasMentorResponse?: boolean;
  startTime?: string;
  endTime?: string;
};

export function adaptPlannerTasksToUi(
  tasks: ApiPlannerTask[],
): PlannerTaskLike[] {
  return tasks.map((task) => {
    const subject = task.subject;
    const fallbackCategory =
      (subject?.slug &&
        DEFAULT_CATEGORIES.find((c) => c.id === subject.slug)) ??
      DEFAULT_CATEGORIES[0];
    const subjectName = subject?.name ?? fallbackCategory?.name ?? "과목";
    const subjectColor =
      subject?.colorHex ?? fallbackCategory?.colorHex ?? null;
    const subjectTextColor =
      subject?.textColorHex ?? fallbackCategory?.textColorHex ?? null;
    const badgeColor = {
      bg: subjectColor ?? DEFAULT_BADGE.bg,
      text: subjectTextColor ?? DEFAULT_BADGE.text,
    };

    return {
      id: task.id,
      title: task.title,
      categoryId: subject?.slug ?? fallbackCategory?.id ?? "unknown",
      subject: subjectName,
      badgeColor,
      description: "직접 세운 학습 계획입니다.",
      status: task.completed ? "submitted" : "pending",
      deadline: parseDateString(task.date),
      completed: task.completed,
      timeSpent: task.timeSpentSec ?? 0,
      isRunning: false,
      isMentorTask: false,
      studyRecord: null,
      attachments: [],
      submissions: [],
      feedbackFiles: [],
      mentorComment: "",
      hasMentorResponse: false,
      startTime: task.startTime ?? undefined,
      endTime: task.endTime ?? undefined,
    };
  });
}

type ApiPlanEvent = {
  id: string;
  menteeId: string;
  subject: ApiSubject | null;
  title: string;
  date: string;
};

export type ScheduleEventLike = {
  id: string;
  title: string;
  date: Date | null;
  categoryId: string;
  taskType: "mentor" | "user" | "plan";
};

export function adaptPlanEventsToUi(
  events: ApiPlanEvent[],
): ScheduleEventLike[] {
  return events.map((event) => {
    const subject = event.subject;
    const fallbackCategory =
      (subject?.slug &&
        DEFAULT_CATEGORIES.find((c) => c.id === subject.slug)) ??
      DEFAULT_CATEGORIES[0];

    return {
      id: event.id,
      title: event.title,
      date: parseDateString(event.date),
      categoryId: subject?.slug ?? fallbackCategory?.id ?? "unknown",
      taskType: "plan",
    };
  });
}

type ApiDailyRecord = {
  id: string;
  menteeId: string;
  date: string;
  studyTimeMin: number;
  mood: "best" | "good" | "normal" | "bad" | "worst" | null;
};

export type DailyRecordLike = {
  id: string;
  date: Date | null;
  studyTime: number;
  mood: "best" | "good" | "normal" | "bad" | "worst" | null;
  memo: string;
  studyTimeBlocks: { [key: string]: string };
};

export function adaptDailyRecordsToUi(
  records: ApiDailyRecord[],
): DailyRecordLike[] {
  return records.map((record) => ({
    id: record.id,
    date: parseDateString(record.date),
    studyTime: record.studyTimeMin * 60,
    mood: record.mood,
    memo: "",
    studyTimeBlocks: {},
  }));
}

type ApiProfile = {
  id: string;
  role: "mentor" | "mentee" | "admin";
  name: string | null;
  avatar_url: string | null;
  intro: string | null;
};

export type UiProfile = {
  name: string;
  role: string;
  dDay: number | null;
  avatar: string;
};

export function adaptProfileToUi(profile: ApiProfile | null): UiProfile | null {
  if (!profile) return null;

  return {
    name: profile.name ?? "",
    role: profile.role,
    dDay: null,
    avatar: profile.avatar_url ?? "",
  };
}
