import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/apiUtils";
import { getCachedMentorFeedbackItems } from "@/lib/mentorServerCache";
import { mentorIdQuerySchema } from "@/lib/validators/mentor";

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

    const data = await getCachedMentorFeedbackItems(parsed.data.mentorId);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleRouteError(error);
  }
}
