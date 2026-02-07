import { supabaseServer } from "@/lib/supabaseServer";
import type { FileRow } from "@/repositories/filesRepository";

export type MentorMaterial = {
  id: string;
  mentor_id: string | null; // potentially null if auth not fully set up
  title: string;
  type: "link" | "pdf" | "image";
  url: string | null;
  file_id: string | null;
  archived_at: string | null;
  created_at: string;
  file?: FileRow | null;
};

export type CreateMaterialInput = {
  mentorId: string;
  title: string;
  type?: "link" | "pdf" | "image";
  url?: string | null;
  fileId?: string | null;
};

export async function createMaterial(input: CreateMaterialInput) {
  const { data, error } = await supabaseServer
    .from("mentor_materials")
    .insert({
      mentor_id: input.mentorId,
      title: input.title,
      type: input.type || "link",
      url: input.url ?? null,
      file_id: input.fileId ?? null,
    })
    .select(
      "id, mentor_id, title, type, url, file_id, archived_at, created_at",
    )
    .single();

  if (error) {
    console.error("Error creating material:", error);
    throw error;
  }

  return data as MentorMaterial;
}

export async function getMaterials(mentorId?: string) {
  const query = supabaseServer
    .from("mentor_materials")
    .select(
      `
      id,
      mentor_id,
      title,
      type,
      url,
      file_id,
      archived_at,
      created_at,
      file:files (
        id,
        bucket,
        path,
        original_name,
        mime_type,
        size_bytes,
        uploader_id,
        checksum,
        created_at,
        deleted_at
      )
    `,
    )
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (mentorId) {
    query.eq("mentor_id", mentorId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching materials:", error);
    throw error;
  }

  const rows = (data ?? []) as Array<
    Omit<MentorMaterial, "file"> & {
      file?: FileRow | FileRow[] | null;
    }
  >;

  return rows.map((row) => ({
    ...row,
    file: Array.isArray(row.file) ? row.file[0] ?? null : row.file ?? null,
  }));
}

export async function archiveMaterial(id: string, mentorId: string) {
  const { data, error } = await supabaseServer
    .from("mentor_materials")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id)
    .eq("mentor_id", mentorId)
    .is("archived_at", null)
    .select("id, file_id")
    .maybeSingle();

  if (error) {
    console.error("Error archiving material:", error);
    throw error;
  }

  return (data ?? null) as { id: string; file_id: string | null } | null;
}
