import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/apiUtils";
import { menteeIdQuerySchema } from "@/lib/validators/mentee";
import { getMentorForMentee } from "@/services/menteeService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = menteeIdQuerySchema.safeParse({
      menteeId: searchParams.get("menteeId"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid menteeId." },
        { status: 400 }
      );
    }

    const mentorRelation = await getMentorForMentee(parsed.data.menteeId);
    return NextResponse.json({ mentor: mentorRelation });
  } catch (error) {
    return handleRouteError(error);
  }
}
