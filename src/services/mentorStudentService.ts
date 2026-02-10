import {
  adaptMenteeToUi,
  adaptMentorTaskToDetailUi,
  adaptPlannerTaskToDetailUi,
} from "@/lib/mentorAdapters";
import { HttpError } from "@/lib/httpErrors";
import { getMenteesByMentorId } from "@/repositories/mentorMenteeRepository";
import { listDailyRecordsByMenteeId } from "@/repositories/dailyRecordsRepository";
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

  const [mentorTasks, plannerTasks, dailyRecords] = await Promise.all([
    listMentorTasksByMenteeId(menteeId),
    listPlannerTasksByMenteeId(menteeId),
    listDailyRecordsByMenteeId(menteeId),
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

  const mappedDailyRecords = dailyRecords.map((record) => ({
    id: record.id,
    date: record.date,
    studyTime: (record.study_time_min ?? 0) * 60,
    memo: "",
    menteeComment: record.mentee_comment,
    mentorReply: record.mentor_reply,
    mentorReplyAt: record.mentor_reply_at,
  }));

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  const todayRecord =
    mappedDailyRecords.find((record) => record.date === todayStr) ?? null;

  return {
    student,
    tasks: uiTasks,
    dailyRecord: todayRecord,
    dailyRecords: mappedDailyRecords,
    events: [], // TODO: Fetch schedule events
  };
}
