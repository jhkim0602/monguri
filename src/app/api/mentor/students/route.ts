import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/apiUtils";
import { mentorIdQuerySchema } from "@/lib/validators/mentor";
import { getMentorStudentsList } from "@/services/mentorStudentService";

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

    const students = await getMentorStudentsList(parsed.data.mentorId);
    return NextResponse.json({ success: true, data: students });
  } catch (error) {
    return handleRouteError(error);
  }
}
