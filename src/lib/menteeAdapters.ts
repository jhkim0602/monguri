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
const parseDateString = (value: string | null) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return new Date(value);
  return new Date(year, month - 1, day);
};

export function adaptMentorTasksToUi(tasks: ApiMentorTask[]): MentorTaskLike[] {
  return tasks.map((task) => {
    const subject = task.subject;
    const fallbackCategory =
      (subject?.slug && DEFAULT_CATEGORIES.find((c) => c.id === subject.slug)) ??
      DEFAULT_CATEGORIES[0];
    const subjectName = subject?.name ?? fallbackCategory?.name ?? "과목";
    const subjectColor = subject?.colorHex ?? fallbackCategory?.colorHex ?? null;
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
  dDay: number;
  avatar: string;
};

export function adaptProfileToUi(
  profile: ApiProfile | null,
  fallback: UiProfile
): UiProfile {
  if (!profile) return fallback;

  return {
    ...fallback,
    name: profile.name ?? fallback.name,
    avatar: profile.avatar_url ?? fallback.avatar,
  };
}
