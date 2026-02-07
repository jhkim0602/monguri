import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/apiUtils";
import {
  mentorIdQuerySchema,
  mentorStudentIdParamSchema,
} from "@/lib/validators/mentor";
import { getMentorStudentDetail } from "@/services/mentorStudentService";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const paramsParsed = mentorStudentIdParamSchema.safeParse({
      id: params.id,
    });
    if (!paramsParsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid student id." },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(request.url);
    const queryParsed = mentorIdQuerySchema.safeParse({
      mentorId: searchParams.get("mentorId"),
    });
    if (!queryParsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid mentorId." },
        { status: 400 },
      );
    }

    const detail = await getMentorStudentDetail(
      queryParsed.data.mentorId,
      paramsParsed.data.id,
    );

    if (!detail) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: detail });
  } catch (error) {
    return handleRouteError(error);
  }
}
