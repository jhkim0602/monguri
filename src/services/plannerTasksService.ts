import { HttpError } from "@/lib/httpErrors";
import {
  createPlannerTask,
  deletePlannerTask,
  getPlannerTaskById,
  listPlannerTasksByMenteeId,
  updatePlannerTask,
} from "@/repositories/plannerTasksRepository";
import { getMentorByMenteeId } from "@/repositories/mentorMenteeRepository";
import { createNotification } from "@/repositories/notificationsRepository";
import { getProfileById } from "@/repositories/profilesRepository";
import { getSubjectBySlug } from "@/repositories/subjectsRepository";

const ensureMenteeProfile = async (menteeId: string) => {
  const profile = await getProfileById(menteeId);
  if (!profile) {
    throw new HttpError(404, "Mentee profile not found.");
  }
  if (profile.role !== "mentee") {
    throw new HttpError(403, "Profile is not a mentee.");
  }
  return profile;
};

type PlannerTaskSubject = {
  id: string;
  slug: string;
  name: string;
  colorHex: string | null;
  textColorHex: string | null;
};

type PlannerTaskResponse = {
  id: string;
  menteeId: string;
  subject: PlannerTaskSubject | null;
  title: string;
  date: string;
  completed: boolean;
  timeSpentSec: number | null;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
  recurringGroupId?: string | null;
};

const mapSubject = (subject: {
  id: string;
  slug: string;
  name: string;
  color_hex: string | null;
  text_color_hex: string | null;
} | null): PlannerTaskSubject | null => {
  if (!subject) return null;
  return {
    id: subject.id,
    slug: subject.slug,
    name: subject.name,
    colorHex: subject.color_hex,
    textColorHex: subject.text_color_hex,
  };
};

const mapPlannerTask = (task: {
  id: string;
  mentee_id: string;
  title: string;
  date: string;
  completed: boolean;
  time_spent_sec: number | null;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
  recurring_group_id?: string | null;
  subjects: {
    id: string;
    slug: string;
    name: string;
    color_hex: string | null;
    text_color_hex: string | null;
  } | null;
}): PlannerTaskResponse => ({
  id: task.id,
  menteeId: task.mentee_id,
  subject: mapSubject(task.subjects),
  title: task.title,
  date: task.date,
  completed: task.completed,
  timeSpentSec: task.time_spent_sec,
  startTime: task.start_time,
  endTime: task.end_time,
  createdAt: task.created_at,
  recurringGroupId: task.recurring_group_id,
});

type PlannerTaskFilters = {
  date?: string;
  from?: string;
  to?: string;
};

export async function getPlannerTasksForMentee(
  menteeId: string,
  filters: PlannerTaskFilters = {}
) {
  await ensureMenteeProfile(menteeId);
  const tasks = await listPlannerTasksByMenteeId(menteeId, filters);

  return {
    menteeId,
    tasks: tasks.map(mapPlannerTask),
  };
}

export async function getPlannerTaskForMentee(
  taskId: string,
  menteeId: string
) {
  await ensureMenteeProfile(menteeId);
  const task = await getPlannerTaskById(taskId);

  if (!task) {
    throw new HttpError(404, "Planner task not found.");
  }
  if (task.mentee_id !== menteeId) {
    throw new HttpError(403, "Planner task does not belong to mentee.");
  }

  return mapPlannerTask(task);
}

type PlannerTaskCreateInput = {
  title: string;
  date: string;
  subjectSlug?: string | null;
  completed?: boolean;
  timeSpentSec?: number | null;
  startTime?: string | null;
  endTime?: string | null;
};

export async function createPlannerTaskForMentee(
  menteeId: string,
  input: PlannerTaskCreateInput
) {
  await ensureMenteeProfile(menteeId);

  let subjectId: string | null = null;
  if (input.subjectSlug) {
    const subject = await getSubjectBySlug(input.subjectSlug);
    if (!subject) {
      throw new HttpError(400, "Subject not found.");
    }
    subjectId = subject.id;
  }

  const created = await createPlannerTask({
    menteeId,
    subjectId,
    title: input.title,
    date: input.date,
    completed: input.completed,
    timeSpentSec: input.timeSpentSec,
    startTime: input.startTime,
    endTime: input.endTime,
  });

  if (!created) {
    throw new HttpError(500, "Failed to create planner task.");
  }

  return mapPlannerTask(created);
}

type PlannerTaskUpdateInput = {
  title?: string;
  date?: string;
  subjectSlug?: string | null;
  completed?: boolean;
  timeSpentSec?: number | null;
  startTime?: string | null;
  endTime?: string | null;
};

export async function updatePlannerTaskForMentee(
  taskId: string,
  menteeId: string,
  updates: PlannerTaskUpdateInput
) {
  const menteeProfile = await ensureMenteeProfile(menteeId);

  const existing = await getPlannerTaskById(taskId);
  if (!existing) {
    throw new HttpError(404, "Planner task not found.");
  }
  if (existing.mentee_id !== menteeId) {
    throw new HttpError(403, "Planner task does not belong to mentee.");
  }

  let subjectId: string | null | undefined = undefined;
  if (updates.subjectSlug !== undefined) {
    if (updates.subjectSlug === null) {
      subjectId = null;
    } else {
      const subject = await getSubjectBySlug(updates.subjectSlug);
      if (!subject) {
        throw new HttpError(400, "Subject not found.");
      }
      subjectId = subject.id;
    }
  }

  const updated = await updatePlannerTask(taskId, {
    title: updates.title,
    date: updates.date,
    subjectId,
    completed: updates.completed,
    timeSpentSec: updates.timeSpentSec,
    startTime: updates.startTime,
    endTime: updates.endTime,
  });

  if (!updated) {
    throw new HttpError(500, "Failed to update planner task.");
  }

  if (updates.completed === true && !existing.completed) {
    try {
      const mentorPair = await getMentorByMenteeId(menteeId);
      const mentorId = mentorPair?.mentor?.id ?? null;
      if (mentorId) {
        const menteeName = menteeProfile.name || "멘티";
        const itemId = `plan-${updated.id}`;
        await createNotification({
          recipientId: mentorId,
          recipientRole: "mentor",
          type: "plan_submitted",
          refType: "planner_task",
          refId: updated.id,
          title: `${menteeName} 플래너 제출`,
          message: updated.title,
          actionUrl: `/mentor-feedback?itemId=${encodeURIComponent(itemId)}`,
          actorId: menteeId,
          avatarUrl: menteeProfile.avatar_url ?? null,
          meta: {
            plannerTaskId: updated.id,
            date: updated.date,
          },
        });
      }
    } catch (error) {
      console.error("Failed to create planner submission notification:", error);
    }
  }

  return mapPlannerTask(updated);
}

export async function deletePlannerTaskForMentee(
  taskId: string,
  menteeId: string
) {
  await ensureMenteeProfile(menteeId);

  const existing = await getPlannerTaskById(taskId);
  if (!existing) {
    throw new HttpError(404, "Planner task not found.");
  }
  if (existing.mentee_id !== menteeId) {
    throw new HttpError(403, "Planner task does not belong to mentee.");
  }

  const deleted = await deletePlannerTask(taskId);
  if (!deleted) {
    throw new HttpError(500, "Failed to delete planner task.");
  }

  return { id: deleted.id };
}
