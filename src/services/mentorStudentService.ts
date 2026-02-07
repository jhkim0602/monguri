import {
  adaptMenteeToUi,
  adaptMentorTaskToDetailUi,
  adaptPlannerTaskToDetailUi,
} from "@/lib/mentorAdapters";
import { HttpError } from "@/lib/httpErrors";
import { getMenteesByMentorId } from "@/repositories/mentorMenteeRepository";
import { listMentorTasksByMenteeId } from "@/repositories/mentorTasksRepository";
import { listPlannerTasksByMenteeId } from "@/repositories/plannerTasksRepository";
import { getProfileById } from "@/repositories/profilesRepository";
import {
  ensureMenteeAssignedToMentor,
  ensureMentorProfile,
} from "@/services/mentorAccessService";

export async function getMentorStudentsList(mentorId: string) {
  await ensureMentorProfile(mentorId);

  const menteesData = await getMenteesByMentorId(mentorId);
  return menteesData.map(adaptMenteeToUi);
}

export async function getMentorStudentDetail(mentorId: string, menteeId: string) {
  await ensureMentorProfile(mentorId);

  const profile = await getProfileById(menteeId);
  if (!profile) {
    throw new HttpError(404, "Mentee profile not found.");
  }

  const relationship = await ensureMenteeAssignedToMentor(mentorId, menteeId);

  const [mentorTasks, plannerTasks] = await Promise.all([
    listMentorTasksByMenteeId(menteeId),
    listPlannerTasksByMenteeId(menteeId),
  ]);

  const uiTasks = [
    ...mentorTasks.map(adaptMentorTaskToDetailUi),
    ...plannerTasks.map(adaptPlannerTaskToDetailUi),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Adapt Profile to MentorMentee (reusing adapter with constructed row)
  const student = adaptMenteeToUi({
    id: relationship.id,
    mentor_id: relationship.mentor_id,
    mentee_id: menteeId,
    status: relationship.status,
    started_at: relationship.started_at,
    mentee: profile as any,
  });

  return {
    student,
    tasks: uiTasks,
    dailyRecord: null, // TODO: Fetch daily record
    events: [], // TODO: Fetch schedule events
  };
}
