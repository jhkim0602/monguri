import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/apiUtils";
import {
  mentorIdQuerySchema,
  mentorProfileUpdateBodySchema,
} from "@/lib/validators/mentor";
import {
  getMentorProfile,
  updateMentorProfile,
} from "@/services/mentorProfileService";

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

    const profile = await getMentorProfile(parsed.data.mentorId);
    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = mentorProfileUpdateBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || "Invalid request body.",
        },
        { status: 400 },
      );
    }

    const { mentorId, ...updates } = parsed.data;
    const profile = await updateMentorProfile(mentorId, updates);
    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    return handleRouteError(error);
  }
}
