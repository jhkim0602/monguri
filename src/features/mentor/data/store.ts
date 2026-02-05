import type {
  MentorStore,
  MentorTask,
  MentorColumn,
  MentorColumnStatus,
  PlannerDaySummary,
  MentorCalendarEvent,
} from "@/features/mentor/types";
import {
  MOCK_COLUMN_ARTICLES,
  MOCK_DAILY_RECORDS,
  MOCK_MENTEES,
  MOCK_MENTOR_TASKS,
} from "@/features/mentor/data/mock";

const STORAGE_KEY = "mentor-store";

const serializeTask = (task: MentorTask) => ({
  ...task,
  deadline: task.deadline.toISOString(),
});

const deserializeTask = (task: MentorTask & { deadline: string }) => ({
  ...task,
  deadline: new Date(task.deadline),
});

const serializePlanner = (day: PlannerDaySummary) => ({
  ...day,
  date: day.date.toISOString(),
});

const deserializePlanner = (day: PlannerDaySummary & { date: string }) => ({
  ...day,
  date: new Date(day.date),
});

const serializeColumn = (column: MentorColumn) => ({
  ...column,
  createdAt: column.createdAt.toISOString(),
  publishedAt: column.publishedAt ? column.publishedAt.toISOString() : null,
});

const deserializeColumn = (column: MentorColumn & { createdAt: string; publishedAt: string | null }) => ({
  ...column,
  createdAt: new Date(column.createdAt),
  publishedAt: column.publishedAt ? new Date(column.publishedAt) : null,
});

const serializeCalendarEvent = (event: MentorCalendarEvent) => ({
  ...event,
  date: event.date.toISOString(),
});

const deserializeCalendarEvent = (
  event: MentorCalendarEvent & { date: string },
) => ({
  ...event,
  category: event.category ?? "other",
  date: new Date(event.date),
});

const createInitialColumns = (): MentorColumn[] => {
  return MOCK_COLUMN_ARTICLES.map((article) => {
    const status =
      article.status === "published"
        ? ("published" as MentorColumnStatus)
        : ("draft" as MentorColumnStatus);

    return {
      id: article.slug,
      slug: article.slug,
      seriesId: article.seriesId,
      title: article.title,
      subtitle: article.subtitle,
      author: article.author,
      date: article.date,
      coverImage: article.coverImage,
      excerpt: article.excerpt,
      status,
      content: "",
      createdAt: new Date(),
      publishedAt: status === "published" ? new Date() : null,
    };
  });
};

export const createInitialMentorStore = (): MentorStore => ({
  tasks: MOCK_MENTOR_TASKS,
  plannerDays: MOCK_DAILY_RECORDS,
  plannerComments: {},
  columns: createInitialColumns(),
  mentees: MOCK_MENTEES,
  mentorCalendarEvents: [
    {
      id: "mentor-ev-1",
      title: "멘토 팀 미팅",
      category: "meeting",
      date: new Date(2026, 1, 2),
      startTime: "13:00",
      endTime: "14:00",
      note: "주간 운영 회의",
    },
    {
      id: "mentor-ev-2",
      title: "모의고사 분석 정리",
      category: "exam",
      date: new Date(2026, 1, 3),
      startTime: "10:00",
      endTime: "12:00",
      note: "학생별 피드백 준비",
    },
  ],
});

export const loadMentorStore = (): MentorStore | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as {
      tasks: Array<MentorTask & { deadline: string }>;
      plannerDays: Array<PlannerDaySummary & { date: string }>;
      plannerComments: Record<string, string>;
      columns: Array<MentorColumn & { createdAt: string; publishedAt: string | null }>;
      mentees: MentorStore["mentees"];
      mentorCalendarEvents?: Array<MentorCalendarEvent & { date: string }>;
    };

    return {
      tasks: parsed.tasks.map(deserializeTask),
      plannerDays: parsed.plannerDays.map(deserializePlanner),
      plannerComments: parsed.plannerComments ?? {},
      columns: parsed.columns.map(deserializeColumn),
      mentees: parsed.mentees ?? MOCK_MENTEES,
      mentorCalendarEvents: parsed.mentorCalendarEvents
        ? parsed.mentorCalendarEvents.map(deserializeCalendarEvent)
        : [],
    };
  } catch {
    return null;
  }
};

export const saveMentorStore = (store: MentorStore) => {
  if (typeof window === "undefined") return;
  const payload = {
    tasks: store.tasks.map(serializeTask),
    plannerDays: store.plannerDays.map(serializePlanner),
    plannerComments: store.plannerComments,
    columns: store.columns.map(serializeColumn),
    mentees: store.mentees,
    mentorCalendarEvents: store.mentorCalendarEvents.map(serializeCalendarEvent),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};
