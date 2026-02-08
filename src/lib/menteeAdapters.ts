import { toSubjectCategory } from "@/lib/subjectCategory";

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
  attachments?: {
    id: string;
    fileId: string;
    name: string;
    type: "pdf" | "image";
    url: string | null;
    previewUrl: string | null;
  }[];
  submissions?: {
    id: string;
    fileId: string;
    name: string;
    type: "pdf" | "image";
    url?: string | null;
    previewUrl?: string | null;
  }[];
  submissionNote?: string | null;
  submittedAt?: string | null;
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
  submissionNote?: string | null;
  submittedAt?: string | null;
  startTime?: string;
  endTime?: string;
  recurringGroupId?: string | null;
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
    const subjectCategory = toSubjectCategory(
      subject
        ? {
            id: subject.id,
            slug: subject.slug,
            name: subject.name,
            colorHex: subject.colorHex,
            textColorHex: subject.textColorHex,
          }
        : null,
    );
    const subjectName = subject?.name ?? subjectCategory.name;
    const subjectColor = subject?.colorHex ?? subjectCategory.colorHex;
    const subjectTextColor =
      subject?.textColorHex ?? subjectCategory.textColorHex;
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
      categoryId: subjectCategory.id,
      mentorFeedback,
      mentorComment: mentorFeedback,
      deadline: parseDateString(task.deadline),
      attachments: task.attachments ?? [],
      submissions: task.submissions ?? [],
      feedbackFiles: [],
      isMentorTask: true,
      completed: task.status === "feedback_completed",
      studyRecord: null,
      hasMentorResponse:
        typeof task.hasMentorResponse === "boolean"
          ? task.hasMentorResponse
          : Boolean(task.latestFeedback),
      submissionNote: task.submissionNote ?? task.latestSubmission?.note ?? null,
      submittedAt:
        task.submittedAt ?? task.latestSubmission?.submittedAt ?? null,
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
  recurringGroupId: string | null;
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
  recurringGroupId?: string | null;
};

export function adaptPlannerTasksToUi(
  tasks: ApiPlannerTask[],
): PlannerTaskLike[] {
  return tasks.map((task) => {
    const subject = task.subject;
    const subjectCategory = toSubjectCategory(
      subject
        ? {
            id: subject.id,
            slug: subject.slug,
            name: subject.name,
            colorHex: subject.colorHex,
            textColorHex: subject.textColorHex,
          }
        : null,
    );
    const subjectName = subject?.name ?? subjectCategory.name;
    const subjectColor = subject?.colorHex ?? subjectCategory.colorHex;
    const subjectTextColor =
      subject?.textColorHex ?? subjectCategory.textColorHex;
    const badgeColor = {
      bg: subjectColor ?? DEFAULT_BADGE.bg,
      text: subjectTextColor ?? DEFAULT_BADGE.text,
    };

    return {
      id: task.id,
      title: task.title,
      categoryId: subjectCategory.id,
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
      recurringGroupId: task.recurringGroupId,
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
  colorHex?: string;
  textColorHex?: string;
  subjectName?: string;
};

export function adaptPlanEventsToUi(
  events: ApiPlanEvent[],
): ScheduleEventLike[] {
  return events.map((event) => {
    const subject = event.subject;
    const subjectCategory = toSubjectCategory(
      subject
        ? {
            id: subject.id,
            slug: subject.slug,
            name: subject.name,
            colorHex: subject.colorHex,
            textColorHex: subject.textColorHex,
          }
        : null,
    );

    return {
      id: event.id,
      title: event.title,
      date: parseDateString(event.date),
      categoryId: subjectCategory.id,
      taskType: "plan",
      colorHex: subjectCategory.colorHex,
      textColorHex: subjectCategory.textColorHex,
      subjectName: subjectCategory.name,
    };
  });
}

type ApiDailyRecord = {
  id: string;
  menteeId: string;
  date: string;
  studyTimeMin: number;
  mood: "best" | "good" | "normal" | "bad" | "worst" | null;
  menteeComment?: string | null;
  mentorReply?: string | null;
  mentorReplyAt?: string | null;
};

export type DailyRecordLike = {
  id: string;
  date: Date | null;
  studyTime: number;
  mood: "best" | "good" | "normal" | "bad" | "worst" | null;
  memo: string;
  studyTimeBlocks: { [key: string]: string };
  menteeComment: string | null;
  mentorReply: string | null;
  mentorReplyAt: string | null;
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
    menteeComment: record.menteeComment ?? null,
    mentorReply: record.mentorReply ?? null,
    mentorReplyAt: record.mentorReplyAt ?? null,
  }));
}

type ApiProfile = {
  id: string;
  role: "mentor" | "mentee" | "admin";
  name: string | null;
  avatar_url: string | null;
  intro: string | null;
  goal: string | null;
  target_exam: string | null;
  target_date: string | null;
  grade: string | null;
};

export type UiProfile = {
  name: string;
  role: string;
  dDay: number | null;
  avatar: string;
  intro: string;
  goal: string;
  targetExam: string;
  targetDate: string | null;
  grade: string;
};

function calculateDDay(targetDate: string | null): number | null {
  if (!targetDate) return null;

  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

export function adaptProfileToUi(profile: ApiProfile | null): UiProfile | null {
  if (!profile) return null;

  return {
    name: profile.name ?? "",
    role: profile.role,
    dDay: calculateDDay(profile.target_date),
    avatar: profile.avatar_url ?? "",
    intro: profile.intro ?? "",
    goal: profile.goal ?? "",
    targetExam: profile.target_exam ?? "",
    targetDate: profile.target_date ?? null,
    grade: profile.grade ?? "",
  };
}
