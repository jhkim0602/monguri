import { getMenteeDetailById } from "@/repositories/mentorMenteeRepository";
import { adaptMenteeToUi, adaptMentorTaskToUi } from "@/lib/mentorAdapters";
import { listMentorTasksByMenteeId } from "@/repositories/mentorTasksRepository";
import { listPlannerTasksByMenteeId } from "@/repositories/plannerTasksRepository";
import { listWeeklyScheduleEventsByMenteeId } from "@/repositories/weeklyScheduleEventsRepository";
import StudentDetailClient from "./StudentDetailClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StudentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const menteeDetail = await getMenteeDetailById(params.id);

  if (!menteeDetail) {
    return <div className="p-8">학생을 찾을 수 없습니다.</div>;
  }

  const student = adaptMenteeToUi({
    id: "dummy-connection-id", // Placeholder as we only need mentee profile
    mentor_id: "current-mentor-id", // Placeholder
    mentee_id: menteeDetail.id,
    status: "active",
    started_at: "",
    mentee: menteeDetail,
  });

  // Fetch real tasks and events
  const [mentorTasks, plannerTasks, weeklyEvents] = await Promise.all([
    listMentorTasksByMenteeId(params.id),
    listPlannerTasksByMenteeId(params.id),
    listWeeklyScheduleEventsByMenteeId(params.id),
  ]);

  const mapToValidCategory = (slug: string | null | undefined) => {
    const valid = ["korean", "english", "math"];
    if (slug && valid.includes(slug)) return slug;
    if (slug === "eng") return "english";
    if (slug === "kor") return "korean";
    if (slug === "mat") return "math";
    return "math"; // Default to math (blue) for unknown/study
  };

  // Combine and adapt tasks
  const formattedMentorTasks = mentorTasks.map((row) => {
    const adapted = adaptMentorTaskToUi(row);
    // Access raw subject slug to match DEFAULT_CATEGORIES IDs (e.g. "math", "english")
    const subjectData = Array.isArray(row.subjects)
      ? row.subjects[0]
      : row.subjects;
    const rawSlug = subjectData?.slug;

    return {
      ...adapted,
      isMentorTask: true,
      categoryId: mapToValidCategory(rawSlug),
      subjectSlug: rawSlug,
      completed:
        adapted.status === "submitted" ||
        adapted.status === "feedback_completed",
    };
  });

  const formattedPlannerTasks = plannerTasks.map((t) => ({
    id: t.id,
    menteeId: t.mentee_id,
    title: t.title,
    date: new Date(t.date),
    completed: Boolean(t.completed),
    timeSpent: t.time_spent_sec || 0,
    startTime: t.start_time,
    endTime: t.end_time,
    categoryId: mapToValidCategory(t.subjects?.slug),
    subject: t.subjects?.name || "개인 학습",
    isMentorTask: Boolean(t.is_mentor_task),
    description: t.description || "개인 학습 계획",
    status: t.completed ? "submitted" : "pending",
    mentorComment: (t as any).mentor_comment,
    hasMentorResponse: !!(t as any).mentor_comment,
  }));

  const formattedEvents = weeklyEvents.map((e) => ({
    id: e.id,
    menteeId: e.mentee_id,
    title: e.title,
    date: new Date(e.date), // Normalize to Date object
    categoryId: mapToValidCategory((e.subjects as any)?.slug),
    taskType: "plan",
  }));

  const allTasks = [...formattedMentorTasks, ...formattedPlannerTasks];

  return (
    <StudentDetailClient
      student={student}
      initialTasks={allTasks}
      initialDailyRecord={null} // We will fetch this real later if needed
      initialDailyEvents={formattedEvents}
    />
  );
}
