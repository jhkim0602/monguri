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
  date: string;
  completed: boolean;
  time_spent_sec: number | null;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
  subjects: PlannerTaskSubjectRow | null;
};

type PlannerTaskFilters = {
  date?: string;
  from?: string;
  to?: string;
};

export async function listPlannerTasksByMenteeId(
  menteeId: string,
  filters: PlannerTaskFilters = {}
) {
  let query = supabaseServer
    .from("planner_tasks")
    .select(
      `
      id,
      mentee_id,
      subject_id,
      title,
      date,
      completed,
      time_spent_sec,
      start_time,
      end_time,
      created_at,
      subjects (
        id,
        slug,
        name,
        color_hex,
        text_color_hex
      )
    `
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

  return (data ?? []) as PlannerTaskRow[];
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
      date,
      completed,
      time_spent_sec,
      start_time,
      end_time,
      created_at,
      subjects (
        id,
        slug,
        name,
        color_hex,
        text_color_hex
      )
    `
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
  completed?: boolean;
  timeSpentSec?: number | null;
  startTime?: string | null;
  endTime?: string | null;
};

export async function createPlannerTask({
  menteeId,
  subjectId,
  title,
  date,
  completed,
  timeSpentSec,
  startTime,
  endTime,
}: CreatePlannerTaskInput) {
  const payload: {
    mentee_id: string;
    subject_id?: string | null;
    title: string;
    date: string;
    completed?: boolean;
    time_spent_sec?: number | null;
    start_time?: string | null;
    end_time?: string | null;
  } = {
    mentee_id: menteeId,
    title,
    date,
  };

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

  const { data, error } = await supabaseServer
    .from("planner_tasks")
    .insert(payload)
    .select(
      `
      id,
      mentee_id,
      subject_id,
      title,
      date,
      completed,
      time_spent_sec,
      start_time,
      end_time,
      created_at,
      subjects (
        id,
        slug,
        name,
        color_hex,
        text_color_hex
      )
    `
    )
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as PlannerTaskRow | null;
}

type UpdatePlannerTaskInput = {
  title?: string;
  date?: string;
  subjectId?: string | null;
  completed?: boolean;
  timeSpentSec?: number | null;
  startTime?: string | null;
  endTime?: string | null;
};

export async function updatePlannerTask(
  taskId: string,
  updates: UpdatePlannerTaskInput
) {
  const payload: {
    title?: string;
    date?: string;
    subject_id?: string | null;
    completed?: boolean;
    time_spent_sec?: number | null;
    start_time?: string | null;
    end_time?: string | null;
  } = {};

  if (updates.title !== undefined) {
    payload.title = updates.title;
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
      date,
      completed,
      time_spent_sec,
      start_time,
      end_time,
      created_at,
      subjects (
        id,
        slug,
        name,
        color_hex,
        text_color_hex
      )
    `
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
