import { adaptMenteeToUi } from "@/lib/mentorAdapters";
import { getMenteesByMentorId } from "@/repositories/mentorMenteeRepository";
import { listPlannerTasksByMenteeId } from "@/repositories/plannerTasksRepository";
import StudentsClient from "./StudentsClient";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  // Hardcoded Mentor ID for development
  const MENTOR_ID = "702826a1-0c48-42d0-a643-0d7e123a16bd";

  const menteesData = await getMenteesByMentorId(MENTOR_ID);

  const menteesWithStats = await Promise.all(
    menteesData.map(async (data) => {
      const basicProfile = adaptMenteeToUi(data);

      // Fetch recent tasks for stats
      const recentTasks = await listPlannerTasksByMenteeId(data.mentee_id);

      // Normalization Helper
      const normalizeDate = (d: string | Date) => {
        const dateObj = new Date(d);
        return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
      };

      const todayStr = normalizeDate(new Date());

      const todayTasks = recentTasks.filter(
        (t) => normalizeDate(t.date) === todayStr,
      );
      const total = todayTasks.length;
      const completed = todayTasks.filter((t) => t.completed).length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

      const sorted = recentTasks.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      const latest = sorted.find((t) => t.completed) || sorted[0];

      return {
        ...basicProfile,
        stats: {
          ...basicProfile.stats,
          attendanceRate: `${rate}%`,
        },
        recentTask: latest
          ? {
              title: latest.title,
              date: latest.date,
            }
          : null,
      };
    }),
  );

  return <StudentsClient mentees={menteesWithStats} />;
}
