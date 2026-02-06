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
