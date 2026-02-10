import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/apiUtils";
import { plannerOverviewQuerySchema } from "@/lib/validators/mentee";
import { getCachedMenteeHomeData } from "@/lib/menteeHomeServerCache";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = plannerOverviewQuerySchema.safeParse({
      menteeId: searchParams.get("menteeId"),
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
    });

    if (!parsed.success || !parsed.data.from || !parsed.data.to) {
      return NextResponse.json({ error: "Invalid query." }, { status: 400 });
    }

    const data = await getCachedMenteeHomeData(
      parsed.data.menteeId,
      parsed.data.from,
      parsed.data.to,
    );

    return NextResponse.json(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
