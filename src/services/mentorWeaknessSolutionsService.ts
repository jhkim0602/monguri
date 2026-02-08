import { ensureMentorProfile } from "@/services/mentorAccessService";
import {
  archiveMentorWeaknessSolution,
  createMentorWeaknessSolution,
  listMentorWeaknessSolutions,
  MentorWeaknessSolutionRow,
} from "@/repositories/mentorWeaknessSolutionsRepository";
import { getSubjects } from "@/services/subjectsService";

export type MentorWeaknessSolutionView = {
  id: string;
  title: string;
  subjectId: string | null;
  subjectName: string | null;
  materialId: string | null;
  materialTitle: string | null;
  createdAt: string;
};

const mapWeaknessSolutionRow = (
  row: MentorWeaknessSolutionRow,
): MentorWeaknessSolutionView => ({
  id: row.id,
  title: row.title,
  subjectId: row.subject_id ?? null,
  subjectName: row.subject?.name ?? null,
  materialId: row.material_id ?? null,
  materialTitle: row.material?.title ?? null,
  createdAt: row.created_at,
});

export async function listMentorWeaknessSolutionsByMentor(mentorId: string) {
  await ensureMentorProfile(mentorId);

  const [solutions, subjects] = await Promise.all([
    listMentorWeaknessSolutions(mentorId),
    getSubjects(),
  ]);

  return {
    solutions: solutions.map(mapWeaknessSolutionRow),
    subjects: subjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
      colorHex: subject.colorHex ?? null,
      textColorHex: subject.textColorHex ?? null,
    })),
  };
}

export async function createMentorWeaknessSolutionForMentor(
  mentorId: string,
  input: {
    title: string;
    subjectId?: string | null;
    materialId?: string | null;
  },
) {
  await ensureMentorProfile(mentorId);

  const created = await createMentorWeaknessSolution({
    mentorId,
    title: input.title,
    subjectId: input.subjectId ?? null,
    materialId: input.materialId ?? null,
  });

  return mapWeaknessSolutionRow(created);
}

export async function deleteMentorWeaknessSolutionForMentor(
  mentorId: string,
  solutionId: string,
) {
  await ensureMentorProfile(mentorId);
  return archiveMentorWeaknessSolution(solutionId, mentorId);
}
