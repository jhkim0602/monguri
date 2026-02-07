import {
  MentorMentee,
  MentorTask,
  MentorTaskStatus,
} from "@/features/mentor/types";
import { MentorMenteeRow } from "@/repositories/mentorMenteeRepository";
import { MentorTaskRow } from "@/repositories/mentorTasksRepository";

export function adaptMenteeToUi(
  row: Omit<MentorMenteeRow, "mentor"> & {
    mentee: {
      id: string;
      role: "mentor" | "mentee" | "admin";
      name: string | null;
      avatar_url: string | null;
      intro: string | null;
    } | null;
  },
): MentorMentee {
  return {
    id: row.mentee_id,
    name: row.mentee?.name || "이름 없음",
    grade: "고3", // Default or fetch from profile if added
    track: "수능/정시", // Default or fetch
    goal: row.mentee?.intro || "목표가 설정되지 않았습니다.",
    avatarUrl: row.mentee?.avatar_url || undefined,
    stats: {
      studyHours: 0, // Needs aggregation query
      attendanceRate: "0%", // Needs aggregation query
      tasksCompleted: 0, // Needs aggregation query
    },
  };
}

export function adaptMentorTaskToUi(
  row: MentorTaskRow & {
    mentee?: { id: string; name: string; avatar_url: string | null } | null;
  },
): MentorTask {
  // Handle case where subjects might be an array due to Supabase join
  const subjectData = Array.isArray(row.subjects)
    ? row.subjects[0]
    : row.subjects;

  const latestFeedback = row.task_feedback?.[0];

  return {
    id: row.id,
    menteeId: row.mentee_id,
    subject: subjectData?.name || "기타",
    title: row.title,
    description: row.description || "",
    status: row.status as MentorTaskStatus,
    deadline: new Date(row.deadline || Date.now()),
    hasMentorResponse: Boolean(latestFeedback),
    mentorComment: latestFeedback?.comment || undefined,
    menteeName: row.mentee?.name || "이름 없음",
    menteeAvatarUrl: row.mentee?.avatar_url || undefined,
  };
}
// Unified Task Type for Student Detail Client
export interface StudentDetailTaskUi {
  id: string;
  isMentorTask: boolean;
  title: string;
  description?: string;
  date: Date; // For sorting and display
  deadline?: Date; // Specific to mentor tasks
  completed: boolean;
  categoryId: string; // For coloring (subject slug or id)
  subject: string; // Display name
  timeSpent: number;
  hasMentorResponse?: boolean;
  mentorComment?: string;
  startTime?: string;
  endTime?: string;
}

import { PlannerTaskRow } from "@/repositories/plannerTasksRepository";

export function adaptPlannerTaskToDetailUi(
  row: PlannerTaskRow,
): StudentDetailTaskUi {
  // Handle subject array/object quirks
  const subjectData = Array.isArray(row.subjects)
    ? row.subjects[0]
    : row.subjects;

  return {
    id: row.id,
    isMentorTask: false,
    title: row.title,
    description: row.description || undefined,
    date: new Date(row.date), // Planner tasks use 'date'
    completed: row.completed,
    categoryId: subjectData?.slug || "study",
    subject: subjectData?.name || "자습",
    timeSpent: row.time_spent_sec || 0,
    hasMentorResponse: Boolean(row.mentor_comment),
    mentorComment: row.mentor_comment || undefined,
    startTime: row.start_time || undefined,
    endTime: row.end_time || undefined,
  };
}

export function adaptMentorTaskToDetailUi(
  row: MentorTaskRow,
): StudentDetailTaskUi {
  const subjectData = Array.isArray(row.subjects)
    ? row.subjects[0]
    : row.subjects;

  const latestFeedback = row.task_feedback?.[0];
  const isCompleted =
    row.status === "submitted" || row.status === "feedback_completed";

  return {
    id: row.id,
    isMentorTask: true,
    title: row.title,
    description: row.description || undefined,
    date: new Date(row.deadline || row.created_at), // Use deadline as primary date for sorting
    deadline: row.deadline ? new Date(row.deadline) : undefined,
    completed: isCompleted,
    categoryId: subjectData?.slug || "mentor",
    subject: subjectData?.name || "멘토 과제",
    timeSpent: 0, // Mentor tasks might not track time yet
    hasMentorResponse: Boolean(latestFeedback),
    mentorComment: latestFeedback?.comment || undefined,
  };
}
