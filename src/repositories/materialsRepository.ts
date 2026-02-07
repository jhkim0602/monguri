import { supabaseServer } from "@/lib/supabaseServer";

export type MentorMaterial = {
  id: string;
  mentor_id: string; // potentially null if auth not fully set up
  title: string;
  type: "link" | "pdf" | "image";
  url: string;
  created_at: string;
};

export type CreateMaterialInput = {
  mentorId: string;
  title: string;
  type?: "link" | "pdf" | "image";
  url: string;
};

export async function createMaterial(input: CreateMaterialInput) {
  const { data, error } = await supabaseServer
    .from("mentor_materials")
    .insert({
      mentor_id: input.mentorId,
      title: input.title,
      type: input.type || "link",
      url: input.url,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating material:", error);
    throw error;
  }

  return data;
}

export async function getMaterials(mentorId?: string) {
  const query = supabaseServer
    .from("mentor_materials")
    .select("*")
    .order("created_at", { ascending: false });

  if (mentorId) {
    query.eq("mentor_id", mentorId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching materials:", error);
    throw error;
  }

  return data as MentorMaterial[];
}

export async function deleteMaterial(id: string, mentorId: string) {
  const { data, error } = await supabaseServer
    .from("mentor_materials")
    .delete()
    .eq("id", id)
    .eq("mentor_id", mentorId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Error deleting material:", error);
    throw error;
  }
  return (data ?? null) as { id: string } | null;
}
