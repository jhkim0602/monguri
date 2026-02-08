import { supabaseServer } from "@/lib/supabaseServer";

export type MentorTaskRow = {
  id: string;
  mentor_id: string;
  mentee_id: string;
  subject_id: string | null;
  title: string;
  description: string | null;
  status: "pending" | "submitted" | "feedback_completed";
  deadline: string | null;
  badge_color: string | null;
  created_at: string;
  subjects: {
    id: string;
    slug: string;
    name: string;
    color_hex: string | null;
    text_color_hex: string | null;
  } | null;
  task_submissions:
    | {
        id: string;
        submitted_at: string;
        note: string | null;
        task_submission_files:
          | {
              id: string;
              file_id: string;
              created_at: string;
              file: {
                id: string;
                bucket: string;
                path: string;
                original_name: string;
                mime_type: string;
                size_bytes: number;
                deleted_at: string | null;
              } | null;
            }[]
          | null;
      }[]
    | null;
  mentor_task_materials:
    | {
        id: string;
        file_id: string;
        source_material_id: string | null;
        sort_order: number;
        created_at: string;
        file: {
          id: string;
          bucket: string;
          path: string;
          original_name: string;
          mime_type: string;
          size_bytes: number;
          deleted_at: string | null;
        } | null;
      }[]
    | null;
  task_feedback:
    | {
        id: string;
        comment: string | null;
        rating: number | null;
        status: "pending" | "reviewed";
        created_at: string;
      }[]
    | null;
};

export type MentorTaskStatus = "pending" | "submitted" | "feedback_completed";

export type MentorTaskCoreRow = {
  id: string;
  mentor_id: string;
  mentee_id: string;
  status: MentorTaskStatus;
  title: string;
};

export type MentorTaskMaterialRow = {
  id: string;
  task_id: string;
  file_id: string;
  source_material_id: string | null;
  sort_order: number;
  created_at: string;
};

export async function listMentorTasksByMenteeId(menteeId: string) {
  const { data, error } = await supabaseServer
    .from("mentor_tasks")
    .select(
      `
      id,
      mentor_id,
      mentee_id,
      subject_id,
      title,
      description,
      status,
      deadline,
      badge_color,
      created_at,
      subjects (
        id,
        slug,
        name,
        color_hex,
        text_color_hex
      ),
      task_submissions (
        id,
        submitted_at,
        note,
        task_submission_files (
          id,
          file_id,
          created_at,
          file:files (
            id,
            bucket,
            path,
            original_name,
            mime_type,
            size_bytes,
            deleted_at
          )
        )
      ),
      mentor_task_materials (
        id,
        file_id,
        source_material_id,
        sort_order,
        created_at,
        file:files (
          id,
          bucket,
          path,
          original_name,
          mime_type,
          size_bytes,
          deleted_at
        )
      ),
      task_feedback (
        id,
        comment,
        rating,
        status,
        created_at
      )
    `,
    )
    .eq("mentee_id", menteeId)
    .order("deadline", { ascending: true })
    .order("submitted_at", {
      foreignTable: "task_submissions",
      ascending: false,
    })
    .order("created_at", {
      foreignTable: "task_feedback",
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as MentorTaskRow[];
}

export async function getMentorTaskById(taskId: string) {
  const { data, error } = await supabaseServer
    .from("mentor_tasks")
    .select("id, mentor_id, mentee_id, status, title")
    .eq("id", taskId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as MentorTaskCoreRow | null;
}

export async function updateMentorTaskStatus(
  taskId: string,
  status: MentorTaskStatus,
) {
  const { data, error } = await supabaseServer
    .from("mentor_tasks")
    .update({ status })
    .eq("id", taskId)
    .select("id, status")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as { id: string; status: MentorTaskStatus } | null;
}

export async function getTasksByMentorId(mentorId: string) {
  const { data, error } = await supabaseServer
    .from("mentor_tasks")
    .select(
      `
      id,
      mentor_id,
      mentee_id,
      subject_id,
      title,
      description,
      status,
      deadline,
      badge_color,
      created_at,
      subjects (
        id,
        slug,
        name,
        color_hex,
        text_color_hex
      ),
      task_submissions (
        id,
        submitted_at,
        note,
        task_submission_files (
          id,
          file_id,
          created_at,
          file:files (
            id,
            bucket,
            path,
            original_name,
            mime_type,
            size_bytes,
            deleted_at
          )
        )
      ),
      mentor_task_materials (
        id,
        file_id,
        source_material_id,
        sort_order,
        created_at,
        file:files (
          id,
          bucket,
          path,
          original_name,
          mime_type,
          size_bytes,
          deleted_at
        )
      ),
      task_feedback (
        id,
        comment,
        rating,
        status,
        created_at
      ),
      mentee:profiles!mentor_tasks_mentee_id_fkey(
        id,
        name,
        avatar_url
      )
    `,
    )
    .eq("mentor_id", mentorId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as (MentorTaskRow & {
    mentee: { id: string; name: string; avatar_url: string | null } | null;
  })[];
}

export async function getTasksWithSubmissionsByMentorId(mentorId: string) {
  const { data, error } = await supabaseServer
    .from("mentor_tasks")
    .select(
      `
      id,
      mentor_id,
      mentee_id,
      subject_id,
      title,
      description,
      status,
      deadline,
      badge_color,
      created_at,
      subjects (
        id,
        slug,
        name,
        color_hex,
        text_color_hex
      ),
      task_submissions (
        id,
        submitted_at,
        note,
        task_submission_files (
          id,
          file_id,
          created_at,
          file:files (
            id,
            bucket,
            path,
            original_name,
            mime_type,
            size_bytes,
            deleted_at
          )
        )
      ),
      mentor_task_materials (
        id,
        file_id,
        source_material_id,
        sort_order,
        created_at,
        file:files (
          id,
          bucket,
          path,
          original_name,
          mime_type,
          size_bytes,
          deleted_at
        )
      ),
      task_feedback (
        id,
        comment,
        rating,
        status,
        created_at
      ),
      mentee:profiles!mentor_tasks_mentee_id_fkey(
        id,
        name,
        avatar_url
      )
    `,
    )
    .eq("mentor_id", mentorId)
    .in("status", ["submitted", "feedback_completed"])
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as (MentorTaskRow & {
    mentee: { id: string; name: string; avatar_url: string | null } | null;
  })[];
}

export async function createTaskFeedback(
  taskId: string,
  mentorId: string,
  feedback: { comment: string; rating: number },
) {
  // 1. Insert feedback
  const { error: insertError } = await supabaseServer
    .from("task_feedback")
    .insert({
      task_id: taskId,
      mentor_id: mentorId,
      comment: feedback.comment,
      rating: feedback.rating,
      status: "reviewed",
    });

  if (insertError) throw new Error(insertError.message);

  // 2. Update task status
  const { error: updateError } = await supabaseServer
    .from("mentor_tasks")
    .update({ status: "feedback_completed" })
    .eq("id", taskId);

  if (updateError) throw new Error(updateError.message);

  return true;
}

export async function createMentorTask(payload: {
  mentor_id: string;
  mentee_id: string;
  subject_id: string | null;
  title: string;
  description: string | null;
  status: "pending";
  deadline: string | null; // ISO timestamp
  materials?: any; // JSONB
}) {
  const { data, error } = await supabaseServer
    .from("mentor_tasks")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createMentorTaskMaterials(
  taskId: string,
  materials: {
    fileId: string;
    sourceMaterialId?: string | null;
    sortOrder?: number;
  }[],
) {
  if (materials.length === 0) return [];

  const payload = materials.map((material, index) => ({
    task_id: taskId,
    file_id: material.fileId,
    source_material_id: material.sourceMaterialId ?? null,
    sort_order: material.sortOrder ?? index,
  }));

  const { data, error } = await supabaseServer
    .from("mentor_task_materials")
    .insert(payload)
    .select("id, task_id, file_id, source_material_id, sort_order, created_at");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as MentorTaskMaterialRow[];
}
