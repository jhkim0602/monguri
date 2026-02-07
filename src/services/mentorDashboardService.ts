import { adaptMenteeToUi, adaptMentorTaskToUi } from "@/lib/mentorAdapters";
import { getMenteesByMentorId } from "@/repositories/mentorMenteeRepository";
import { getTasksByMentorId } from "@/repositories/mentorTasksRepository";
import { ensureMentorProfile } from "@/services/mentorAccessService";

export async function getMentorDashboardData(mentorId: string) {
  await ensureMentorProfile(mentorId);

  const [menteesData, tasksData] = await Promise.all([
    getMenteesByMentorId(mentorId),
    getTasksByMentorId(mentorId),
  ]);

  const mentees = menteesData.map(adaptMenteeToUi);
  const tasks = tasksData.map(adaptMentorTaskToUi);

  // Simple aggregation for dashboard stats
  const pendingFeedbackCount = tasks.filter(
    (t) => t.status === "submitted",
  ).length;

  return {
    mentees,
    recentActivity: tasks.slice(0, 5), // Show recent 5 tasks
    stats: {
      totalMentees: mentees.length,
      pendingFeedback: pendingFeedbackCount,
      activeAlerts: 0, // Placeholder for alerts logic
    },
  };
}
