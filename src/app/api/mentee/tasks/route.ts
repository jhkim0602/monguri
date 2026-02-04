import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/apiUtils";
import { menteeIdQuerySchema } from "@/lib/validators/mentee";
import { getMenteeMentorTasks } from "@/services/mentorTasksService";

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

    const result = await getMenteeMentorTasks(parsed.data.menteeId);
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
