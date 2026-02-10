import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/apiUtils";
import { revalidateMenteeHomeCacheByMenteeId } from "@/lib/menteeHomeServerCache";
import {
  mentorTaskUpdateBodySchema,
  taskIdParamSchema,
} from "@/lib/validators/mentee";
import { updateMenteeMentorTaskTimeRange } from "@/services/mentorTasksService";

type RouteParams = {
  params: {
    taskId: string;
  };
};

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const paramsParsed = taskIdParamSchema.safeParse({ taskId: params.taskId });

    if (!paramsParsed.success) {
      return NextResponse.json({ error: "Invalid taskId." }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const bodyParsed = mentorTaskUpdateBodySchema.safeParse(body);

    if (!bodyParsed.success) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const task = await updateMenteeMentorTaskTimeRange(
      paramsParsed.data.taskId,
      bodyParsed.data.menteeId,
      {
        startTime: bodyParsed.data.startTime,
        endTime: bodyParsed.data.endTime,
      },
    );
    revalidateMenteeHomeCacheByMenteeId(bodyParsed.data.menteeId);

    return NextResponse.json({ task });
  } catch (error) {
    return handleRouteError(error);
  }
}
