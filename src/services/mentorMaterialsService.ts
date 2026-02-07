import { HttpError } from "@/lib/httpErrors";
import {
  archiveMaterial,
  createMaterial,
  getMaterials,
  MentorMaterial,
} from "@/repositories/materialsRepository";
import {
  createFile,
  getFileReferenceCount,
  markFileDeleted,
} from "@/repositories/filesRepository";
import { ensureMentorProfile } from "@/services/mentorAccessService";

type FileMetaInput = {
  bucket: string;
  path: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  checksum?: string | null;
};

type CreateMentorMaterialInput =
  | {
      title: string;
      type: "link";
      url: string;
    }
  | {
      title: string;
      type: "pdf" | "image";
      file: FileMetaInput;
    };

export type MentorMaterialView = MentorMaterial & {
  accessUrl: string | null;
};

export async function listMentorMaterials(
  mentorId: string,
): Promise<MentorMaterialView[]> {
  await ensureMentorProfile(mentorId);
  const materials = await getMaterials(mentorId);
  const hydrated = await Promise.all(
    materials.map(async (material) => {
      if (material.type === "link") {
        return { ...material, accessUrl: material.url ?? null };
      }

      const file = material.file;
      if (!file || file.deleted_at) {
        return { ...material, accessUrl: material.url ?? null };
      }

      return {
        ...material,
        accessUrl: `/api/files/${file.id}?mode=preview`,
      };
    }),
  );

  return hydrated;
}

export async function createMentorMaterial(
  mentorId: string,
  input: CreateMentorMaterialInput,
) {
  await ensureMentorProfile(mentorId);

  if (input.type === "link") {
    return createMaterial({
      mentorId,
      title: input.title,
      type: input.type,
      url: input.url,
    });
  }

  const file = await createFile({
    bucket: input.file.bucket,
    path: input.file.path,
    originalName: input.file.originalName,
    mimeType: input.file.mimeType,
    sizeBytes: input.file.sizeBytes,
    uploaderId: mentorId,
    checksum: input.file.checksum ?? null,
  });

  return createMaterial({
    mentorId,
    title: input.title,
    type: input.type,
    fileId: file.id,
  });
}

export async function deleteMentorMaterial(mentorId: string, materialId: string) {
  await ensureMentorProfile(mentorId);

  const archived = await archiveMaterial(materialId, mentorId);
  if (!archived) {
    throw new HttpError(404, "Material not found.");
  }

  if (archived.file_id) {
    const refCount = await getFileReferenceCount(archived.file_id);
    if (refCount === 0) {
      await markFileDeleted(archived.file_id);
    }
  }

  return archived;
}
