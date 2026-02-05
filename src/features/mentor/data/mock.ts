import {
  MENTOR_TASKS,
  USER_TASKS,
  WEEKLY_SCHEDULE,
  DAILY_RECORDS,
} from "@/constants/mentee";
import { COLUMN_ARTICLES, COLUMN_SERIES } from "@/constants/mentee/columns";
import type {
  MentorMentee,
  MentorTask,
  PlannerDaySummary,
  CalendarDaySummary,
  ColumnArticleSummary,
  ColumnSeriesSummary,
} from "@/features/mentor/types";

const MOCK_REFERENCE_DATE = new Date(2026, 1, 2);

export const MOCK_MENTEES: MentorMentee[] = [
  {
    id: "m1",
    name: "이서연",
    grade: "고2",
    track: "문과",
    goal: "연세대 경영학과",
    avatarUrl: "/avatar-1.png",
    stats: {
      studyHours: 42,
      attendanceRate: "95%",
      tasksCompleted: 128,
    },
  },
  {
    id: "m2",
    name: "김민준",
    grade: "고3",
    track: "이과",
    goal: "서울대 전기정보",
    avatarUrl: "/avatar-2.png",
    stats: {
      studyHours: 36,
      attendanceRate: "92%",
      tasksCompleted: 98,
    },
  },
  {
    id: "m3",
    name: "박지훈",
    grade: "N수생",
    track: "이과",
    goal: "성균관대 의예과",
    avatarUrl: "/avatar-3.png",
    stats: {
      studyHours: 48,
      attendanceRate: "97%",
      tasksCompleted: 142,
    },
  },
];

export const MOCK_MENTOR_TASKS: MentorTask[] = MOCK_MENTEES.flatMap(
  (mentee) =>
    MENTOR_TASKS.map((task) => ({
      id: `${mentee.id}-${task.id}`,
      menteeId: mentee.id,
      subject: task.subject,
      title: task.title,
      description: task.description,
      status: task.status as any,
      deadline: task.deadline,
      startTime: (task as any).startTime || "00:00",
      endTime: (task as any).endTime || "00:00",
      hasMentorResponse: task.hasMentorResponse,
      mentorComment: task.mentorComment ?? "",
    })),
);

export const MOCK_USER_TASKS = MOCK_MENTEES.flatMap((mentee) =>
  USER_TASKS.map((task) => ({
    ...task,
    id: `${mentee.id}-${task.id}`,
    menteeId: mentee.id,
  })),
);

export const MOCK_WEEKLY_SCHEDULE: CalendarDaySummary[] = MOCK_MENTEES.flatMap(
  (mentee) =>
    WEEKLY_SCHEDULE.map((day) => ({
      id: `${mentee.id}-${day.date.toISOString()}`,
      menteeId: mentee.id,
      date: day.date,
      items: day.events.map((event) => ({
        id: `${mentee.id}-${event.id}`,
        title: event.title,
        categoryId: event.categoryId,
        taskType: event.taskType,
        startTime: (event as any).startTime || "00:00", // Cast to any because original type might not have it
        endTime: (event as any).endTime || "00:00",
        isMentorTask: event.taskType === "mentor", // Removed non-existent property access
      })),
    })),
);

export const MOCK_DAILY_RECORDS: PlannerDaySummary[] = MOCK_MENTEES.flatMap(
  (mentee) =>
    DAILY_RECORDS.map((record) => ({
      id: `${mentee.id}-${record.date.toISOString()}`,
      menteeId: mentee.id,
      date: record.date,
      studyTime: record.studyTime,
      mood: record.mood,
      memo: record.memo,
    })),
);

export const MOCK_COLUMN_SERIES: ColumnSeriesSummary[] = COLUMN_SERIES.map(
  (series) => ({
    id: series.id,
    title: series.title,
    description: series.description,
    themeClass: series.themeClass,
  }),
);

export const MOCK_COLUMN_ARTICLES: ColumnArticleSummary[] =
  COLUMN_ARTICLES.map((article) => ({
    slug: article.slug,
    seriesId: article.seriesId,
    title: article.title,
    subtitle: article.subtitle,
    author: article.author,
    date: article.date,
    coverImage: article.coverImage,
    excerpt: article.excerpt,
    status: article.status,
  }));

export const getMockToday = () => new Date(MOCK_REFERENCE_DATE);

export const getMentorDashboardStats = () => {
  const pending = MOCK_MENTOR_TASKS.filter((task) => task.status === "pending")
    .length;
  const submitted = MOCK_MENTOR_TASKS.filter(
    (task) => task.status === "submitted",
  ).length;
  const feedbackCompleted = MOCK_MENTOR_TASKS.filter(
    (task) => task.status === "feedback_completed",
  ).length;

  return {
    pending,
    submitted,
    feedbackCompleted,
    total: MOCK_MENTOR_TASKS.length,
  };
};

export const getUpcomingTasks = (limit = 4) => {
  return [...MOCK_MENTOR_TASKS]
    .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
    .slice(0, limit);
};

export const getRecentSubmissions = (limit = 4) => {
  return MOCK_MENTOR_TASKS.filter((task) => task.status === "submitted").slice(
    0,
    limit,
  );
};
