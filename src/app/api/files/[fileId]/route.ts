import { NextResponse } from "next/server";
import { z } from "zod";

import { handleRouteError } from "@/lib/apiUtils";
import { supabaseServer } from "@/lib/supabaseServer";
import { uuidSchema } from "@/lib/validators/common";

const fileParamsSchema = z.object({
  fileId: uuidSchema,
});

const fileQuerySchema = z.object({
  mode: z.enum(["preview", "download"]).optional(),
});

async function canAccessFile(fileId: string, viewerId: string) {
  const { data: materialRows, error: materialError } = await supabaseServer
    .from("mentor_materials")
    .select("id")
    .eq("file_id", fileId)
    .eq("mentor_id", viewerId)
    .maybeSingle();

  if (materialError) {
    throw new Error(materialError.message);
  }

  if (materialRows) return true;

  const { data: materialLinks, error: materialLinkError } = await supabaseServer
    .from("mentor_task_materials")
    .select("task_id")
    .eq("file_id", fileId)
    .limit(20);

  if (materialLinkError) {
    throw new Error(materialLinkError.message);
  }

  const taskIds = (materialLinks ?? []).map((row) => row.task_id);
  if (taskIds.length > 0) {
    const { data: taskRows, error: taskError } = await supabaseServer
      .from("mentor_tasks")
      .select("id")
      .in("id", taskIds)
      .or(`mentor_id.eq.${viewerId},mentee_id.eq.${viewerId}`)
      .limit(1);

    if (taskError) {
      throw new Error(taskError.message);
    }

    if (taskRows && taskRows.length > 0) return true;
  }

  const { data: submissionLinks, error: submissionLinkError } =
    await supabaseServer
      .from("task_submission_files")
      .select("submission_id")
      .eq("file_id", fileId)
      .limit(20);

  if (submissionLinkError) {
    throw new Error(submissionLinkError.message);
  }

  const submissionIds = (submissionLinks ?? []).map((row) => row.submission_id);
  if (submissionIds.length > 0) {
    const { data: submissionRows, error: submissionError } = await supabaseServer
      .from("task_submissions")
      .select("id, task_id, mentee_id")
      .in("id", submissionIds)
      .limit(20);

    if (submissionError) {
      throw new Error(submissionError.message);
    }

    if ((submissionRows ?? []).some((row) => row.mentee_id === viewerId)) {
      return true;
    }

    const submissionTaskIds = (submissionRows ?? []).map((row) => row.task_id);
    if (submissionTaskIds.length > 0) {
      const { data: submissionTaskRows, error: submissionTaskError } =
        await supabaseServer
          .from("mentor_tasks")
          .select("id")
          .in("id", submissionTaskIds)
          .or(`mentor_id.eq.${viewerId},mentee_id.eq.${viewerId}`)
          .limit(1);

      if (submissionTaskError) {
        throw new Error(submissionTaskError.message);
      }

      if (submissionTaskRows && submissionTaskRows.length > 0) return true;
    }
  }

  return false;
}

export async function GET(
  request: Request,
  { params }: { params: { fileId: string } },
) {
  try {
    const paramsParsed = fileParamsSchema.safeParse(params);
    if (!paramsParsed.success) {
      return NextResponse.json({ error: "Invalid fileId." }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const queryParsed = fileQuerySchema.safeParse({
      mode: searchParams.get("mode") ?? undefined,
    });

    if (!queryParsed.success) {
      return NextResponse.json({ error: "Invalid query." }, { status: 400 });
    }

    const { fileId } = paramsParsed.data;
    const { mode } = queryParsed.data;

    const authHeader = request.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: authData, error: authError } =
      await supabaseServer.auth.getUser(token);

    if (authError || !authData?.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const viewerId = authData.user.id;

    const { data: file, error: fileError } = await supabaseServer
      .from("files")
      .select("id, bucket, path, original_name, mime_type, deleted_at")
      .eq("id", fileId)
      .maybeSingle();

    if (fileError) {
      throw new Error(fileError.message);
    }

    if (!file || file.deleted_at) {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }

    const allowed = await canAccessFile(fileId, viewerId);
    if (!allowed) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const { data, error } = await supabaseServer.storage
      .from(file.bucket)
      .download(file.path);

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to download file.");
    }

    const dispositionType = mode === "download" ? "attachment" : "inline";
    const headers = new Headers();
    headers.set(
      "Content-Disposition",
      `${dispositionType}; filename="${encodeURIComponent(file.original_name)}"`,
    );
    headers.set(
      "Content-Type",
      file.mime_type || "application/octet-stream",
    );
    headers.set("Cache-Control", "private, max-age=60");

    return new NextResponse(data, { headers });
  } catch (error) {
    return handleRouteError(error);
  }
}
