import { HttpError } from "@/lib/httpErrors";
import {
  createMaterial,
  deleteMaterial,
  getMaterials,
  MentorMaterial,
} from "@/repositories/materialsRepository";
import { ensureMentorProfile } from "@/services/mentorAccessService";

type CreateMentorMaterialInput = {
  title: string;
  type?: "link" | "pdf" | "image";
  url: string;
};

export async function listMentorMaterials(
  mentorId: string,
): Promise<MentorMaterial[]> {
  await ensureMentorProfile(mentorId);
  return getMaterials(mentorId);
}

export async function createMentorMaterial(
  mentorId: string,
  input: CreateMentorMaterialInput,
) {
  await ensureMentorProfile(mentorId);

  return createMaterial({
    mentorId,
    title: input.title,
    type: input.type,
    url: input.url,
  });
}

export async function deleteMentorMaterial(mentorId: string, materialId: string) {
  await ensureMentorProfile(mentorId);

  const deleted = await deleteMaterial(materialId, mentorId);
  if (!deleted) {
    throw new HttpError(404, "Material not found.");
  }

  return deleted;
}
