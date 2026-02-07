import { supabaseServer } from "@/lib/supabaseServer";

type PlannerTaskSubjectRow = {
  id: string;
  slug: string;
  name: string;
  color_hex: string | null;
  text_color_hex: string | null;
};

export type PlannerTaskRow = {
  id: string;
  mentee_id: string;
  subject_id: string | null;
  title: string;
  description: string | null;
  date: string;
  completed: boolean;
  time_spent_sec: number | null;
  start_time: string | null;
  end_time: string | null;
  recurring_group_id: string | null;
  created_at: string;
  is_mentor_task: boolean;
  materials?: any[] | null;
  mentor_comment: string | null;
  subjects: PlannerTaskSubjectRow | null;
};

type PlannerTaskFilters = {
  date?: string;
  from?: string;
  to?: string;
};

export async function listPlannerTasksByMenteeId(
  menteeId: string,
  filters: PlannerTaskFilters = {},
) {
  let query = supabaseServer
    .from("planner_tasks")
    .select(
      `
      id,
      mentee_id,
      subject_id,
      title,
      description,
      date,
      completed,
      time_spent_sec,
      start_time,
      end_time,
      recurring_group_id,
      is_mentor_task,
      materials,
      mentor_comment,
      created_at,
      subjects (
        id,
        slug,
        name,
        color_hex,
        text_color_hex
      )
    `,
    )
    .eq("mentee_id", menteeId);

  if (filters.date) {
    query = query.eq("date", filters.date);
  } else {
    if (filters.from) {
      query = query.gte("date", filters.from);
    }
    if (filters.to) {
      query = query.lte("date", filters.to);
    }
  }

  const { data, error } = await query
    .order("date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as PlannerTaskRow[];
}

export async function getPlannerTaskById(taskId: string) {
  const { data, error } = await supabaseServer
    .from("planner_tasks")
    .select(
      `
      id,
      mentee_id,
      subject_id,
      title,
      description,
      date,
      completed,
      time_spent_sec,
      start_time,
      end_time,
      is_mentor_task,
      materials,
      recurring_group_id,
      mentor_comment,
      created_at,
      subjects (
        id,
        slug,
        name,
        color_hex,
        text_color_hex
      )
    `,
    )
    .eq("id", taskId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as PlannerTaskRow | null;
}

type CreatePlannerTaskInput = {
  menteeId: string;
  subjectId: string | null;
  title: string;
  date: string;
  isMentorTask?: boolean;
  completed?: boolean;
  timeSpentSec?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  description?: string | null;
  materials?: { title: string; url: string }[] | null;
};

export async function createPlannerTask({
  menteeId,
  subjectId,
  title,
  date,
  isMentorTask,
  completed,
  timeSpentSec,
  startTime,
  endTime,
  description,
  materials,
}: CreatePlannerTaskInput) {
  const payload: {
    mentee_id: string;
    subject_id?: string | null;
    title: string;
    date: string;
    is_mentor_task?: boolean;
    completed?: boolean;
    time_spent_sec?: number | null;
    start_time?: string | null;
    end_time?: string | null;
    description?: string | null;
    materials?: any;
  } = {
    mentee_id: menteeId,
    title,
    date,
  };

  if (isMentorTask !== undefined) {
    payload.is_mentor_task = isMentorTask;
  }
  if (subjectId !== undefined) {
    payload.subject_id = subjectId;
  }
  if (completed !== undefined) {
    payload.completed = completed;
  }
  if (timeSpentSec !== undefined) {
    payload.time_spent_sec = timeSpentSec;
  }
  if (startTime !== undefined) {
    payload.start_time = startTime;
  }
  if (endTime !== undefined) {
    payload.end_time = endTime;
  }
  if (description !== undefined) {
    payload.description = description;
  }
  if (materials !== undefined) {
    payload.materials = materials;
  }

  const { data, error } = await supabaseServer
    .from("planner_tasks")
    .insert(payload)
    .select(
      `
      id,
      mentee_id,
      subject_id,
      title,
      description,
      date,
      completed,
      time_spent_sec,
      start_time,
      end_time,
      recurring_group_id,
      is_mentor_task,
      materials,
      mentor_comment,
      created_at,
      subjects (
        id,
        slug,
        name,
        color_hex,
        text_color_hex
      )
    `,
    )
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as PlannerTaskRow | null;
}

type UpdatePlannerTaskInput = {
  title?: string;
  description?: string | null;
  date?: string;
  subjectId?: string | null;
  completed?: boolean;
  timeSpentSec?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  mentorComment?: string | null;
};

export async function updatePlannerTask(
  taskId: string,
  updates: UpdatePlannerTaskInput,
) {
  const payload: {
    title?: string;
    description?: string | null;
    date?: string;
    subject_id?: string | null;
    completed?: boolean;
    time_spent_sec?: number | null;
    start_time?: string | null;
    end_time?: string | null;
    mentor_comment?: string | null;
  } = {};

  if (updates.title !== undefined) {
    payload.title = updates.title;
  }
  if (updates.description !== undefined) {
    payload.description = updates.description;
  }
  if (updates.date !== undefined) {
    payload.date = updates.date;
  }
  if (updates.subjectId !== undefined) {
    payload.subject_id = updates.subjectId;
  }
  if (updates.completed !== undefined) {
    payload.completed = updates.completed;
  }
  if (updates.timeSpentSec !== undefined) {
    payload.time_spent_sec = updates.timeSpentSec;
  }
  if (updates.startTime !== undefined) {
    payload.start_time = updates.startTime;
  }
  if (updates.endTime !== undefined) {
    payload.end_time = updates.endTime;
  }
  if (updates.mentorComment !== undefined) {
    payload.mentor_comment = updates.mentorComment;
  }

  const { data, error } = await supabaseServer
    .from("planner_tasks")
    .update(payload)
    .eq("id", taskId)
    .select(
      `
      id,
      mentee_id,
      subject_id,
      title,
      description,
      date,
      completed,
      time_spent_sec,
      start_time,
      end_time,
      recurring_group_id,
      is_mentor_task,
      materials,
      mentor_comment,
      created_at,
      subjects (
        id,
        slug,
        name,
        color_hex,
        text_color_hex
      )
    `,
    )
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as PlannerTaskRow | null;
}

export async function deletePlannerTask(taskId: string) {
  const { data, error } = await supabaseServer
    .from("planner_tasks")
    .delete()
    .eq("id", taskId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as { id: string } | null;
}

export async function createPlannerRecurringGroup(
  menteeId: string,
  recurrenceRule: any,
) {
  const { data, error } = await supabaseServer
    .from("planner_recurring_groups")
    .insert({
      mentee_id: menteeId,
      recurrence_rule: recurrenceRule,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createPlannerTaskBatch(
  tasks: CreatePlannerTaskInput[],
  recurringGroupId?: string,
) {
  if (tasks.length === 0) return [];

  const payload = tasks.map((task) => ({
    mentee_id: task.menteeId,
    subject_id: task.subjectId,
    title: task.title,
    description: task.description,
    date: task.date,
    completed: task.completed,
    time_spent_sec: task.timeSpentSec,
    start_time: task.startTime,
    end_time: task.endTime,
    recurring_group_id: recurringGroupId,
    is_mentor_task: task.isMentorTask,
    materials: task.materials,
  }));

  const { data, error } = await supabaseServer
    .from("planner_tasks")
    .insert(payload)
    .select(
      `
      id,
      mentee_id,
      subject_id,
      title,
      description,
      date,
      completed,
      time_spent_sec,
      start_time,
      end_time,
      recurring_group_id,
      is_mentor_task,
      materials,
      mentor_comment,
      created_at,
      subjects (
        id,
        slug,
        name,
        color_hex,
        text_color_hex
      )
    `,
    );

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as PlannerTaskRow[];
}

export async function deletePlannerRecurringGroup(groupId: string) {
  const { error } = await supabaseServer
    .from("planner_recurring_groups")
    .delete()
    .eq("id", groupId);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

export async function getCompletedPlannerTasksByMentorId(mentorId: string) {
  const { data: mentorMenteeRows, error: mentorMenteeError } = await supabaseServer
    .from("mentor_mentee")
    .select("mentee_id")
    .eq("mentor_id", mentorId)
    .eq("status", "active");

  if (mentorMenteeError) {
    throw new Error(mentorMenteeError.message);
  }

  const menteeIds = mentorMenteeRows?.map((row) => row.mentee_id) ?? [];
  if (menteeIds.length === 0) {
    return [];
  }

  const { data, error } = await supabaseServer
    .from("planner_tasks")
    .select(
      `
      id,
      mentee_id,
      subject_id,
      title,
      description,
      date,
      completed,
      time_spent_sec,
      start_time,
      end_time,
      recurring_group_id,
      is_mentor_task,
      materials,
      mentor_comment,
      created_at,
      subjects (
        id,
        slug,
        name,
        color_hex,
        text_color_hex
      ),
      mentee:profiles (
        id,
        name,
        avatar_url
      )
    `,
    )
    .in("mentee_id", menteeIds)
    .eq("completed", true)
    .order("date", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as (PlannerTaskRow & {
    mentee: { id: string; name: string; avatar_url: string | null } | null;
  })[];
}
