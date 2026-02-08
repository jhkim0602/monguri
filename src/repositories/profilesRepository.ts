import { supabaseServer } from "@/lib/supabaseServer";

export type ProfileRow = {
  id: string;
  role: "mentor" | "mentee" | "admin";
  name: string | null;
  avatar_url: string | null;
  intro: string | null;
  d_day_date?: string | null;
  d_day_target_date?: string | null;
  dday_date?: string | null;
  target_date?: string | null;
  exam_date?: string | null;
  d_day_label?: string | null;
  d_day_name?: string | null;
  dday_label?: string | null;
  dday_name?: string | null;
  target_label?: string | null;
  exam_label?: string | null;
  created_at: string;
};

export async function getProfileById(profileId: string) {
  const { data, error } = await supabaseServer
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as ProfileRow | null;
}

type UpdateProfileInput = {
  name?: string | null;
  intro?: string | null;
  avatar_url?: string | null;
};

export async function updateProfileById(
  profileId: string,
  updates: UpdateProfileInput,
) {
  const payload: UpdateProfileInput = {};

  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.intro !== undefined) payload.intro = updates.intro;
  if (updates.avatar_url !== undefined) payload.avatar_url = updates.avatar_url;

  const { data, error } = await supabaseServer
    .from("profiles")
    .update(payload)
    .eq("id", profileId)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as ProfileRow | null;
}
