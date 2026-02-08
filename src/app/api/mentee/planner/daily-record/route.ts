import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/apiUtils";
import {
  plannerDailyRecordQuerySchema,
  plannerDailyRecordUpdateBodySchema,
} from "@/lib/validators/mentee";
import {
  getPlannerDailyRecordForMentee,
  updatePlannerDailyRecordMemoForMentee,
} from "@/services/plannerDailyRecordService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = plannerDailyRecordQuerySchema.safeParse({
      menteeId: searchParams.get("menteeId"),
      date: searchParams.get("date"),
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query." }, { status: 400 });
    }

    const dailyRecord = await getPlannerDailyRecordForMentee(
      parsed.data.menteeId,
      parsed.data.date
    );

    return NextResponse.json({ dailyRecord });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = plannerDailyRecordUpdateBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const dailyRecord = await updatePlannerDailyRecordMemoForMentee(
      parsed.data.menteeId,
      parsed.data.date,
      parsed.data.memo
    );

    return NextResponse.json({ dailyRecord });
  } catch (error) {
    return handleRouteError(error);
  }
}
