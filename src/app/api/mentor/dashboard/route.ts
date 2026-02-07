import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/apiUtils";
import { mentorIdQuerySchema } from "@/lib/validators/mentor";
import { getMentorDashboardData } from "@/services/mentorDashboardService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = mentorIdQuerySchema.safeParse({
      mentorId: searchParams.get("mentorId"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid mentorId." },
        { status: 400 },
      );
    }

    const dashboardData = await getMentorDashboardData(parsed.data.mentorId);

    return NextResponse.json({ success: true, data: dashboardData });
  } catch (error) {
    return handleRouteError(error);
  }
}
