import { supabaseServer } from "@/lib/supabaseServer";
import type { MentorMaterial } from "@/repositories/materialsRepository";
import type { SubjectRow } from "@/repositories/subjectsRepository";

export type MentorWeaknessSolutionRow = {
  id: string;
  mentor_id: string;
  subject_id: string | null;
  title: string;
  material_id: string | null;
  created_at: string;
  archived_at: string | null;
  subject?: SubjectRow | null;
  material?: MentorMaterial | null;
};

export type CreateMentorWeaknessSolutionInput = {
  mentorId: string;
  title: string;
  subjectId?: string | null;
  materialId?: string | null;
};

const SELECT_FIELDS = `
  id,
  mentor_id,
  subject_id,
  title,
  material_id,
  created_at,
  archived_at,
  subject:subjects (
    id,
    slug,
    name,
    color_hex,
    text_color_hex,
    sort_order
  ),
  material:mentor_materials (
    id,
    title,
    type,
    url,
    file_id,
    archived_at,
    created_at
  )
`;

export async function listMentorWeaknessSolutions(mentorId: string) {
  const { data, error } = await supabaseServer
    .from("mentor_weakness_solutions")
    .select(SELECT_FIELDS)
    .eq("mentor_id", mentorId)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching mentor weakness solutions:", error);
    throw error;
  }

  // Transform Supabase join arrays to single objects
  const transformed = (data ?? []).map((row: any) => ({
    ...row,
    subject: Array.isArray(row.subject) ? row.subject[0] ?? null : row.subject ?? null,
    material: Array.isArray(row.material) ? row.material[0] ?? null : row.material ?? null,
  }));

  return transformed as MentorWeaknessSolutionRow[];
}

export async function createMentorWeaknessSolution(
  input: CreateMentorWeaknessSolutionInput,
) {
  const { data, error } = await supabaseServer
    .from("mentor_weakness_solutions")
    .insert({
      mentor_id: input.mentorId,
      title: input.title,
      subject_id: input.subjectId ?? null,
      material_id: input.materialId ?? null,
    })
    .select(SELECT_FIELDS)
    .single();

  if (error) {
    console.error("Error creating mentor weakness solution:", error);
    throw error;
  }

  // Transform Supabase join arrays to single objects
  const row = data as any;
  const transformed = {
    ...row,
    subject: Array.isArray(row.subject) ? row.subject[0] ?? null : row.subject ?? null,
    material: Array.isArray(row.material) ? row.material[0] ?? null : row.material ?? null,
  };

  return transformed as MentorWeaknessSolutionRow;
}

export async function archiveMentorWeaknessSolution(
  id: string,
  mentorId: string,
) {
  const { data, error } = await supabaseServer
    .from("mentor_weakness_solutions")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id)
    .eq("mentor_id", mentorId)
    .is("archived_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Error archiving mentor weakness solution:", error);
    throw error;
  }

  return (data ?? null) as { id: string } | null;
}
