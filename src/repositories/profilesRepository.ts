import { supabaseServer } from "@/lib/supabaseServer";

export type ProfileRow = {
  id: string;
  role: "mentor" | "mentee" | "admin";
  name: string | null;
  avatar_url: string | null;
  intro: string | null;
  goal: string | null;
  target_exam: string | null;
  target_date: string | null;
  grade: string | null;
  created_at: string;
};

export type ProfileUpdateInput = {
  name?: string;
  intro?: string | null;
  avatar_url?: string | null;
  goal?: string | null;
  target_exam?: string | null;
  target_date?: string | null;
  grade?: string | null;
};

export async function getProfileById(profileId: string) {
  // Try with new fields first
  const { data, error } = await supabaseServer
    .from("profiles")
    .select("id, role, name, avatar_url, intro, goal, target_exam, target_date, grade, created_at")
    .eq("id", profileId)
    .maybeSingle();

  if (error) {
    // If error is due to missing columns, fallback to basic fields
    if (error.message.includes("goal") || error.message.includes("target_") || error.message.includes("grade")) {
      const { data: fallbackData, error: fallbackError } = await supabaseServer
        .from("profiles")
        .select("id, role, name, avatar_url, intro, created_at")
        .eq("id", profileId)
        .maybeSingle();

      if (fallbackError) {
        throw new Error(fallbackError.message);
      }

      if (fallbackData) {
        return {
          ...fallbackData,
          goal: null,
          target_exam: null,
          target_date: null,
          grade: null,
        } as ProfileRow;
      }
      return null;
    }
    throw new Error(error.message);
  }

  return (data ?? null) as ProfileRow | null;
}

export async function updateProfileById(
  profileId: string,
  updates: ProfileUpdateInput
) {
  // Filter out undefined values
  const cleanUpdates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      cleanUpdates[key] = value;
    }
  }

  const { data, error } = await supabaseServer
    .from("profiles")
    .update(cleanUpdates)
    .eq("id", profileId)
    .select("id, role, name, avatar_url, intro, goal, target_exam, target_date, grade, created_at")
    .single();

  if (error) {
    // If error is due to missing columns, try with basic fields only
    if (error.message.includes("goal") || error.message.includes("target_") || error.message.includes("grade")) {
      // Remove new fields from update
      const basicUpdates: Record<string, unknown> = {};
      const basicFields = ["name", "intro", "avatar_url"];
      for (const [key, value] of Object.entries(cleanUpdates)) {
        if (basicFields.includes(key)) {
          basicUpdates[key] = value;
        }
      }

      const { data: fallbackData, error: fallbackError } = await supabaseServer
        .from("profiles")
        .update(basicUpdates)
        .eq("id", profileId)
        .select("id, role, name, avatar_url, intro, created_at")
        .single();

      if (fallbackError) {
        throw new Error(fallbackError.message);
      }

      return {
        ...fallbackData,
        goal: null,
        target_exam: null,
        target_date: null,
        grade: null,
      } as ProfileRow;
    }
    throw new Error(error.message);
  }

  return data as ProfileRow;
}
