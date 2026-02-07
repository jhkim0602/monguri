import { getTasksWithSubmissionsByMentorId } from "@/repositories/mentorTasksRepository";
import { getCompletedPlannerTasksByMentorId } from "@/repositories/plannerTasksRepository";

export type FeedbackItem = {
  id: string;
  type: "task" | "plan" | "self";
  studentId: string;
  studentName: string;
  avatarUrl?: string; // Add avatarUrl
  title: string;
  subtitle?: string;
  date: Date;
  status: "pending" | "completed" | "reviewed" | "submitted";
  isUrgent?: boolean;
  data: any;
};

export async function getPendingFeedbackItems(
  mentorId: string,
): Promise<FeedbackItem[]> {
  // 1. Fetch pending tasks (submitted but not reviewed)
  const [taskRows, planRows] = await Promise.all([
    getTasksWithSubmissionsByMentorId(mentorId),
    getCompletedPlannerTasksByMentorId(mentorId),
  ]);

  const taskItems: FeedbackItem[] = taskRows.map((row) => ({
    id: `task-${row.id}`,
    type: "task",
    studentId: row.mentee_id,
    studentName: row.mentee?.name || "알 수 없음",
    avatarUrl: row.mentee?.avatar_url || undefined,
    title: row.title,
    subtitle: row.subjects?.name || "기타",
    date: new Date(row.task_submissions?.[0]?.submitted_at || row.created_at),
    status: row.status === "feedback_completed" ? "reviewed" : row.status,
    data: {
      ...row,
      submissions: row.task_submissions?.map((s) => ({
        name: `제출 파일 (${new Date(s.submitted_at).toLocaleDateString()})`, // Placeholder name as we don't have file names in schema yet
        url: "#", // Placeholder
      })),
    },
  }));

  const planItems: FeedbackItem[] = planRows.map((row) => ({
    id: `plan-${row.id}`,
    type: "plan",
    studentId: row.mentee?.id ?? row.mentee_id,
    studentName: row.mentee?.name || "알 수 없음",
    avatarUrl: row.mentee?.avatar_url || undefined,
    title: row.title,
    subtitle: row.subjects?.name || "개인 학습",
    date: new Date(row.date),
    status: "submitted", // Treat completed plans as submitted for review
    data: row,
  }));

  // Sort by date descending (newest first)
  return [...taskItems, ...planItems].sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );
}
