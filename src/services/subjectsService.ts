import { listSubjects } from "@/repositories/subjectsRepository";

export async function getSubjects() {
  const subjects = await listSubjects();
  return subjects.map((subject) => ({
    id: subject.id,
    slug: subject.slug,
    name: subject.name,
    colorHex: subject.color_hex,
    textColorHex: subject.text_color_hex,
    sortOrder: subject.sort_order,
  }));
}
