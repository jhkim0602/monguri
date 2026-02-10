import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/apiUtils";
import { revalidateMenteeHomeCacheByMenteeId } from "@/lib/menteeHomeServerCache";
import { revalidateMentorSurfaceCachesByMenteeId } from "@/lib/mentorServerCache";
import {
  taskIdParamSchema,
  taskSubmissionBodySchema,
} from "@/lib/validators/mentee";
import { createMenteeTaskSubmission } from "@/services/taskSubmissionService";

type RouteParams = {
  params: {
    taskId: string;
  };
};

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const paramsParsed = taskIdParamSchema.safeParse({ taskId: params.taskId });

    if (!paramsParsed.success) {
      return NextResponse.json({ error: "Invalid taskId." }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const bodyParsed = taskSubmissionBodySchema.safeParse(body);

    if (!bodyParsed.success) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const result = await createMenteeTaskSubmission(
      paramsParsed.data.taskId,
      bodyParsed.data.menteeId,
      bodyParsed.data.note ?? null,
      bodyParsed.data.attachments
    );
    revalidateMenteeHomeCacheByMenteeId(bodyParsed.data.menteeId);
    await revalidateMentorSurfaceCachesByMenteeId(bodyParsed.data.menteeId);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
