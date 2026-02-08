import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/apiUtils";
import {
  profileIdQuerySchema,
  profileUpdateBodySchema,
} from "@/lib/validators/mentee";
import {
  getProfileForMenteePage,
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

    const profile = await getProfileForMenteePage(parsed.data.profileId);
    return NextResponse.json({ profile });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = profileUpdateBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const profile = await updateMenteeProfile(parsed.data.profileId, {
      name: parsed.data.name,
      intro: parsed.data.intro,
      avatarUrl: parsed.data.avatarUrl,
    });

    return NextResponse.json({ profile });
  } catch (error) {
    return handleRouteError(error);
  }
}
