import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/apiUtils";
import { plannerOverviewQuerySchema } from "@/lib/validators/mentee";
import { getPlannerOverview } from "@/services/plannerOverviewService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = plannerOverviewQuerySchema.safeParse({
      menteeId: searchParams.get("menteeId"),
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query." }, { status: 400 });
    }

    const result = await getPlannerOverview(parsed.data.menteeId, {
      from: parsed.data.from,
      to: parsed.data.to,
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
