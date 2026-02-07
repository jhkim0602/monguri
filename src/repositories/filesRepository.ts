import { supabaseServer } from "@/lib/supabaseServer";

export type FileRow = {
  id: string;
  bucket: string;
  path: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  uploader_id: string | null;
  checksum: string | null;
  created_at: string;
  deleted_at: string | null;
};

type CreateFileInput = {
  bucket: string;
  path: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  uploaderId?: string | null;
  checksum?: string | null;
};

export async function createFile(input: CreateFileInput) {
  const { data, error } = await supabaseServer
    .from("files")
    .insert({
      bucket: input.bucket,
      path: input.path,
      original_name: input.originalName,
      mime_type: input.mimeType,
      size_bytes: input.sizeBytes,
      uploader_id: input.uploaderId ?? null,
      checksum: input.checksum ?? null,
    })
    .select(
      "id, bucket, path, original_name, mime_type, size_bytes, uploader_id, checksum, created_at, deleted_at",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as FileRow;
}

export async function getFileReferenceCount(fileId: string) {
  const { data, error } = await supabaseServer
    .from("file_reference_counts")
    .select("ref_count")
    .eq("file_id", fileId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data?.ref_count ?? 0) as number;
}

export async function markFileDeleted(fileId: string) {
  const { data, error } = await supabaseServer
    .from("files")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", fileId)
    .is("deleted_at", null)
    .select("id, deleted_at")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as { id: string; deleted_at: string } | null;
}
