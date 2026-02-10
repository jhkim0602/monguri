import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/apiUtils";
import { revalidateMenteeHomeCacheByMenteeId } from "@/lib/menteeHomeServerCache";
import { revalidateMentorSurfaceCachesByMentorId } from "@/lib/mentorServerCache";
import { mentorFeedbackSubmitBodySchema } from "@/lib/validators/mentor";
import {
  submitTaskFeedback,
  submitPlannerTaskFeedback,
} from "@/services/mentorTaskService";
import { updateMentorReply } from "@/repositories/dailyRecordsRepository";

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

    const { mentorId, taskId, menteeId, date, comment, rating, type } = parsed.data;

    if (type === "mentor_task") {
      if (!taskId) {
        return NextResponse.json(
          { success: false, error: "taskId is required for mentor_task" },
          { status: 400 },
        );
      }
      const result = await submitTaskFeedback(taskId, mentorId, comment, rating ?? 5);
      revalidateMenteeHomeCacheByMenteeId(result.menteeId);
    } else if (type === "planner_task") {
      if (!taskId) {
        return NextResponse.json(
          { success: false, error: "taskId is required for planner_task" },
          { status: 400 },
        );
      }
      const result = await submitPlannerTaskFeedback(taskId, mentorId, comment);
      revalidateMenteeHomeCacheByMenteeId(result.menteeId);
    } else if (type === "daily_plan") {
      if (!menteeId || !date) {
        return NextResponse.json(
          { success: false, error: "menteeId and date are required for daily_plan" },
          { status: 400 },
        );
      }
      await updateMentorReply(menteeId, date, comment);
      revalidateMenteeHomeCacheByMenteeId(menteeId);
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid task type" },
        { status: 400 },
      );
    }
    revalidateMentorSurfaceCachesByMentorId(mentorId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
