import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/apiUtils";
import {
  profileIdQuerySchema,
  profileUpdateBodySchema,
} from "@/lib/validators/mentee";
import {
  getMenteeProfile,
  updateMenteeProfile,
} from "@/services/menteeService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = profileIdQuerySchema.safeParse({
      profileId: searchParams.get("profileId"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid profileId." },
        { status: 400 }
      );
    }

    const profile = await getMenteeProfile(parsed.data.profileId);
    return NextResponse.json({ profile });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const parsed = profileUpdateBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid request body." },
        { status: 400 }
      );
    }

    const { profileId, ...updates } = parsed.data;

    const profile = await updateMenteeProfile(profileId, updates);
    return NextResponse.json({ success: true, profile });
  } catch (error) {
    return handleRouteError(error);
  }
}
