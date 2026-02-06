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
  mentorId?: string; // Optional for now
  title: string;
  type?: "link" | "pdf" | "image";
  url: string;
};

export async function createMaterial(input: CreateMaterialInput) {
  const { data, error } = await supabaseServer
    .from("mentor_materials") // User instructions said "mentor_materials"
    .insert({
      mentor_id: input.mentorId || "00000000-0000-0000-0000-000000000000", // Default for dev
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
  // If mentorId is provided, filter by it. otherwise fetch all (or limit?)
  // For dev simpler to fetch all or default ID
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

export async function deleteMaterial(id: string) {
  const { error } = await supabaseServer
    .from("mentor_materials")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting material:", error);
    throw error;
  }
  return true;
}
