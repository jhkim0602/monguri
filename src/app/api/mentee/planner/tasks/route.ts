import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/apiUtils";
import {
  plannerTaskCreateBodySchema,
  plannerTaskListQuerySchema,
} from "@/lib/validators/mentee";
import {
  createPlannerTaskForMentee,
  getPlannerTasksForMentee,
} from "@/services/plannerTasksService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = plannerTaskListQuerySchema.safeParse({
      menteeId: searchParams.get("menteeId"),
      date: searchParams.get("date") ?? undefined,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query." }, { status: 400 });
    }

    const result = await getPlannerTasksForMentee(parsed.data.menteeId, {
      date: parsed.data.date,
      from: parsed.data.from,
      to: parsed.data.to,
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = plannerTaskCreateBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const task = await createPlannerTaskForMentee(parsed.data.menteeId, {
      title: parsed.data.title,
      date: parsed.data.date,
      subjectSlug: parsed.data.subjectSlug ?? null,
      completed: parsed.data.completed,
      timeSpentSec: parsed.data.timeSpentSec ?? null,
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
