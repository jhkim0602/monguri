import { supabaseServer } from "@/lib/supabaseServer";

export type SubjectRow = {
  id: string;
  name: string;
  color: string | null;
  text_color: string | null;
  sort_order: number | null;
};

export async function listSubjects() {
  const { data, error } = await supabaseServer
    .from("subjects")
    .select("id, name, color, text_color, sort_order")
    .order("sort_order", { ascending: true, nullsFirst: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as SubjectRow[];
}
