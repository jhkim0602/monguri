import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/apiUtils";
import { mentorFeedbackSubmitBodySchema } from "@/lib/validators/mentor";
import {
  submitTaskFeedback,
  submitPlannerTaskFeedback,
} from "@/services/mentorTaskService";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = mentorFeedbackSubmitBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid payload." },
        { status: 400 },
      );
    }

    const { mentorId, taskId, comment, rating, type } = parsed.data;

    if (type === "mentor_task") {
      await submitTaskFeedback(taskId, mentorId, comment, rating ?? 5);
    } else if (type === "planner_task") {
      await submitPlannerTaskFeedback(taskId, mentorId, comment);
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid task type" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
