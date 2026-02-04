import { supabaseServer } from "@/lib/supabaseServer";

export type ProfileRow = {
  id: string;
  role: "mentor" | "mentee" | "admin";
  name: string | null;
  avatar_url: string | null;
  intro: string | null;
  created_at: string;
};

export async function getProfileById(profileId: string) {
  const { data, error } = await supabaseServer
    .from("profiles")
    .select("id, role, name, avatar_url, intro, created_at")
    .eq("id", profileId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as ProfileRow | null;
}
