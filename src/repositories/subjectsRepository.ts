import { supabaseServer } from "@/lib/supabaseServer";

export type SubjectRow = {
  id: string;
  slug: string;
  name: string;
  color_hex: string | null;
  text_color_hex: string | null;
  sort_order: number | null;
};

export async function listSubjects() {
  const { data, error } = await supabaseServer
    .from("subjects")
    .select("id, slug, name, color_hex, text_color_hex, sort_order")
    .order("sort_order", { ascending: true, nullsFirst: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as SubjectRow[];
}
