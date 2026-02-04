import { listSubjects } from "@/repositories/subjectsRepository";

export async function getSubjects() {
  return listSubjects();
}
