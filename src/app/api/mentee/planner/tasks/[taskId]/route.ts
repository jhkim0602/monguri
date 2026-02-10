import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/apiUtils";
import { revalidateMenteeHomeCacheByMenteeId } from "@/lib/menteeHomeServerCache";
import { revalidateMentorSurfaceCachesByMenteeId } from "@/lib/mentorServerCache";
import {
  plannerTaskDeleteQuerySchema,
  plannerTaskIdParamSchema,
  plannerTaskUpdateBodySchema,
} from "@/lib/validators/mentee";
import {
  deletePlannerTaskForMentee,
  getPlannerTaskForMentee,
  updatePlannerTaskForMentee,
} from "@/services/plannerTasksService";

type RouteParams = {
  params: {
    taskId: string;
  };
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const paramsParsed = plannerTaskIdParamSchema.safeParse({
      taskId: params.taskId,
    });

    if (!paramsParsed.success) {
      return NextResponse.json({ error: "Invalid taskId." }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const queryParsed = plannerTaskDeleteQuerySchema.safeParse({
      menteeId: searchParams.get("menteeId"),
    });

    if (!queryParsed.success) {
      return NextResponse.json({ error: "Invalid menteeId." }, { status: 400 });
    }

    const task = await getPlannerTaskForMentee(
      paramsParsed.data.taskId,
      queryParsed.data.menteeId
    );

    return NextResponse.json({ task });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const paramsParsed = plannerTaskIdParamSchema.safeParse({
      taskId: params.taskId,
    });

    if (!paramsParsed.success) {
      return NextResponse.json({ error: "Invalid taskId." }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const bodyParsed = plannerTaskUpdateBodySchema.safeParse(body);

    if (!bodyParsed.success) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const task = await updatePlannerTaskForMentee(
      paramsParsed.data.taskId,
      bodyParsed.data.menteeId,
      {
        title: bodyParsed.data.title,
        date: bodyParsed.data.date,
        subjectSlug: bodyParsed.data.subjectSlug,
        completed: bodyParsed.data.completed,
        timeSpentSec: bodyParsed.data.timeSpentSec,
        startTime: bodyParsed.data.startTime,
        endTime: bodyParsed.data.endTime,
        studyNote: bodyParsed.data.studyNote ?? undefined,
        attachments: bodyParsed.data.attachments ?? undefined,
        materials: bodyParsed.data.materials ?? undefined,
      }
    );
    revalidateMenteeHomeCacheByMenteeId(bodyParsed.data.menteeId);
    await revalidateMentorSurfaceCachesByMenteeId(bodyParsed.data.menteeId);

    return NextResponse.json({ task });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const paramsParsed = plannerTaskIdParamSchema.safeParse({
      taskId: params.taskId,
    });

    if (!paramsParsed.success) {
      return NextResponse.json({ error: "Invalid taskId." }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const queryParsed = plannerTaskDeleteQuerySchema.safeParse({
      menteeId: searchParams.get("menteeId"),
    });

    if (!queryParsed.success) {
      return NextResponse.json({ error: "Invalid menteeId." }, { status: 400 });
    }

    const result = await deletePlannerTaskForMentee(
      paramsParsed.data.taskId,
      queryParsed.data.menteeId
    );
    revalidateMenteeHomeCacheByMenteeId(queryParsed.data.menteeId);
    await revalidateMentorSurfaceCachesByMenteeId(queryParsed.data.menteeId);

    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
