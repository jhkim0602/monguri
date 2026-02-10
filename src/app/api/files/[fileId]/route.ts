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

const FILE_ROUTE_LOG_PREFIX = "[api/files/[fileId]]";

function logFileRouteError(
  stage: string,
  requestId: string,
  context: Record<string, unknown>,
  error: unknown,
) {
  console.error(FILE_ROUTE_LOG_PREFIX, stage, {
    requestId,
    ...context,
    error,
  });
}

function plannerMaterialsContainFileId(materials: unknown, fileId: string) {
  if (!Array.isArray(materials)) return false;
  return materials.some((item) => {
    if (!item || typeof item !== "object") return false;
    const row = item as Record<string, unknown>;
    const candidates = [row.fileId, row.file_id, row.id];
    return candidates.some((candidate) => candidate === fileId);
  });
}

async function canAccessFile(fileId: string, viewerId: string, requestId: string) {

  const { data: materialRows, error: materialError } = await supabaseServer
    .from("mentor_materials")
    .select("id")
    .eq("file_id", fileId)
    .eq("mentor_id", viewerId)
    .maybeSingle();

  if (materialError) {
    logFileRouteError(
      "canAccessFile.mentor_materials",
      requestId,
      { fileId, viewerId },
      materialError,
    );
    throw new Error(materialError.message);
  }

  if (materialRows) return true;

  const { data: materialLinks, error: materialLinkError } = await supabaseServer
    .from("mentor_task_materials")
    .select("task_id")
    .eq("file_id", fileId)
    .limit(20);

  if (materialLinkError) {
    logFileRouteError(
      "canAccessFile.mentor_task_materials",
      requestId,
      { fileId, viewerId },
      materialLinkError,
    );
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
      logFileRouteError(
        "canAccessFile.mentor_tasks_from_materials",
        requestId,
        { fileId, viewerId, taskIds },
        taskError,
      );
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
    logFileRouteError(
      "canAccessFile.task_submission_files",
      requestId,
      { fileId, viewerId },
      submissionLinkError,
    );
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
      logFileRouteError(
        "canAccessFile.task_submissions",
        requestId,
        { fileId, viewerId, submissionIds },
        submissionError,
      );
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
        logFileRouteError(
          "canAccessFile.mentor_tasks_from_submissions",
          requestId,
          { fileId, viewerId, submissionTaskIds },
          submissionTaskError,
        );
        throw new Error(submissionTaskError.message);
      }

      if (submissionTaskRows && submissionTaskRows.length > 0) return true;
    }
  }

  const { data: ownPlannerRows, error: ownPlannerRowsError } = await supabaseServer
    .from("planner_tasks")
    .select("id, mentee_id, materials")
    .eq("mentee_id", viewerId)
    .not("materials", "is", null)
    .limit(500);

  if (ownPlannerRowsError) {
    logFileRouteError(
      "canAccessFile.own_planner_tasks",
      requestId,
      { fileId, viewerId },
      ownPlannerRowsError,
    );
    throw new Error(ownPlannerRowsError.message);
  }

  if (
    (ownPlannerRows ?? []).some((row) =>
      plannerMaterialsContainFileId((row as any).materials, fileId),
    )
  ) {
    return true;
  }

  const { data: mentorMenteeRows, error: mentorMenteeError } = await supabaseServer
    .from("mentor_mentee")
    .select("mentee_id")
    .eq("mentor_id", viewerId)
    .eq("status", "active")
    .limit(2000);

  if (mentorMenteeError) {
    logFileRouteError(
      "canAccessFile.mentor_mentee_lookup",
      requestId,
      { fileId, viewerId },
      mentorMenteeError,
    );
    throw new Error(mentorMenteeError.message);
  }

  const plannerMenteeIds = Array.from(
    new Set((mentorMenteeRows ?? []).map((row) => row.mentee_id).filter(Boolean)),
  );
  if (plannerMenteeIds.length > 0) {
    const { data: menteePlannerRows, error: menteePlannerRowsError } =
      await supabaseServer
        .from("planner_tasks")
        .select("id, mentee_id, materials")
        .in("mentee_id", plannerMenteeIds)
        .not("materials", "is", null)
        .limit(5000);

    if (menteePlannerRowsError) {
      logFileRouteError(
        "canAccessFile.mentee_planner_tasks",
        requestId,
        { fileId, viewerId, plannerMenteeIds },
        menteePlannerRowsError,
      );
      throw new Error(menteePlannerRowsError.message);
    }

    if (
      (menteePlannerRows ?? []).some((row) =>
        plannerMaterialsContainFileId((row as any).materials, fileId),
      )
    ) {
      return true;
    }
  }

  return false;
}

export async function GET(
  request: Request,
  { params }: { params: { fileId: string } },
) {
  const requestId = crypto.randomUUID();
  try {
    const paramsParsed = fileParamsSchema.safeParse(params);
    if (!paramsParsed.success) {
      console.warn(FILE_ROUTE_LOG_PREFIX, "invalid_file_id", {
        requestId,
        params,
      });
      return NextResponse.json({ error: "Invalid fileId." }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const queryParsed = fileQuerySchema.safeParse({
      mode: searchParams.get("mode") ?? undefined,
    });

    if (!queryParsed.success) {
      console.warn(FILE_ROUTE_LOG_PREFIX, "invalid_query", {
        requestId,
        fileId: paramsParsed.data.fileId,
        query: searchParams.toString(),
      });
      return NextResponse.json({ error: "Invalid query." }, { status: 400 });
    }

    const { fileId } = paramsParsed.data;
    const { mode } = queryParsed.data;

    const authHeader = request.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null;

    if (!token) {
      console.warn(FILE_ROUTE_LOG_PREFIX, "missing_token", {
        requestId,
        fileId,
        mode,
      });
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: authData, error: authError } =
      await supabaseServer.auth.getUser(token);

    if (authError || !authData?.user) {
      console.warn(FILE_ROUTE_LOG_PREFIX, "auth_failed", {
        requestId,
        fileId,
        mode,
        authError,
      });
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const viewerId = authData.user.id;

    const { data: file, error: fileError } = await supabaseServer
      .from("files")
      .select("id, bucket, path, original_name, mime_type, deleted_at")
      .eq("id", fileId)
      .maybeSingle();

    if (fileError) {
      logFileRouteError("files_lookup", requestId, { fileId, mode, viewerId }, fileError);
      throw new Error(fileError.message);
    }

    if (!file || file.deleted_at) {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }

    const allowed = await canAccessFile(fileId, viewerId, requestId);
    if (!allowed) {
      console.warn(FILE_ROUTE_LOG_PREFIX, "access_denied", {
        requestId,
        fileId,
        mode,
        viewerId,
      });
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const { data, error } = await supabaseServer.storage
      .from(file.bucket)
      .download(file.path);

    if (error || !data) {
      logFileRouteError(
        "storage_download",
        requestId,
        {
          fileId,
          mode,
          viewerId,
          bucket: file.bucket,
          path: file.path,
        },
        error ?? "download returned empty data",
      );
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
    logFileRouteError(
      "unhandled",
      requestId,
      {
        fileId: params?.fileId ?? null,
        url: request.url,
      },
      error,
    );
    return handleRouteError(error);
  }
}
