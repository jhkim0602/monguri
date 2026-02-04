import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/apiUtils";
import { profileIdQuerySchema } from "@/lib/validators/mentee";
import { getMenteeProfile } from "@/services/menteeService";

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
