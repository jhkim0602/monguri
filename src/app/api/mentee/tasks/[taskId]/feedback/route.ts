import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/apiUtils";
import {
  taskFeedbackMarkReadBodySchema,
  taskFeedbackQuerySchema,
  taskIdParamSchema,
} from "@/lib/validators/mentee";
import {
  getTaskFeedbackForMentee,
  markTaskFeedbackReadForMentee,
} from "@/services/taskFeedbackService";

type RouteParams = {
  params: {
    taskId: string;
  };
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const paramsParsed = taskIdParamSchema.safeParse({ taskId: params.taskId });

    if (!paramsParsed.success) {
      return NextResponse.json({ error: "Invalid taskId." }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const queryParsed = taskFeedbackQuerySchema.safeParse({
      menteeId: searchParams.get("menteeId"),
    });

    if (!queryParsed.success) {
      return NextResponse.json({ error: "Invalid menteeId." }, { status: 400 });
    }

    const result = await getTaskFeedbackForMentee(
      paramsParsed.data.taskId,
      queryParsed.data.menteeId
    );

    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const paramsParsed = taskIdParamSchema.safeParse({ taskId: params.taskId });

    if (!paramsParsed.success) {
      return NextResponse.json({ error: "Invalid taskId." }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const bodyParsed = taskFeedbackMarkReadBodySchema.safeParse(body);

    if (!bodyParsed.success) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const result = await markTaskFeedbackReadForMentee(
      paramsParsed.data.taskId,
      bodyParsed.data.menteeId,
    );

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return handleRouteError(error);
  }
}
