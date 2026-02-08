export type MentorMentee = {
  id: string;
  name: string;
  grade: string;
  track?: string;
  goal?: string;
  targetExam?: string;
  targetDate?: string | null;
  dDay?: number | null;
  avatarUrl?: string;
  stats: {
    studyHours: number;
    attendanceRate: string;
    tasksCompleted: number;
  };
};

export type MentorTaskStatus = "pending" | "submitted" | "feedback_completed";

export type MentorTask = {
  id: number | string;
  menteeId: string;
  subject: string;
  title: string;
  description: string;
  status: MentorTaskStatus;
  deadline: Date;
  startTime?: string;
  endTime?: string;
  hasMentorResponse?: boolean;
  mentorComment?: string;
  menteeName?: string;
  menteeAvatarUrl?: string;
};

export type MentorTaskInput = {
  menteeId: string;
  subject: string;
  title: string;
  description: string;
  deadline: Date;
  startTime?: string;
  endTime?: string;
};

export type PlannerDaySummary = {
  id: string;
  menteeId: string;
  date: Date;
  studyTime: number;
  mood: string;
  memo: string;
};

export type CalendarDaySummary = {
  id: string;
  menteeId: string;
  date: Date;
  items: Array<{
    id: number | string;
    title: string;
    categoryId: string;
    taskType: string;
    startTime?: string;
    endTime?: string;
    isMentorTask?: boolean;
  }>;
};

export type ColumnSeriesSummary = {
  id: string;
  title: string;
  description: string;
  themeClass: string;
};

export type ColumnArticleSummary = {
  slug: string;
  seriesId: string;
  title: string;
  subtitle: string;
  author: string;
  date: string;
  coverImage: string;
  excerpt: string;
  status: "published" | "coming_soon";
};

export type MentorColumnStatus = "draft" | "published";

export type MentorColumn = {
  id: string;
  slug: string;
  seriesId: string;
  title: string;
  subtitle: string;
  author: string;
  date: string;
  coverImage: string;
  excerpt: string;
  status: MentorColumnStatus;
  content: string;
  createdAt: Date;
  publishedAt: Date | null;
};

export type MentorColumnInput = {
  title: string;
  subtitle: string;
  seriesId: string;
  author: string;
  coverImage: string;
  excerpt: string;
  content: string;
};

export type MentorCalendarEvent = {
  id: string;
  title: string;
  category: "meeting" | "consulting" | "exam" | "other";
  date: Date;
  startTime?: string;
  endTime?: string;
  note?: string;
};

export type MentorStore = {
  tasks: MentorTask[];
  plannerDays: PlannerDaySummary[];
  plannerComments: Record<string, string>;
  columns: MentorColumn[];
  mentees: MentorMentee[];
  mentorCalendarEvents: MentorCalendarEvent[];
};
