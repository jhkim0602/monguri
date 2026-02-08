import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/apiUtils";
import {
  mentorIdQuerySchema,
  mentorWeaknessSolutionsCreateBodySchema,
  mentorWeaknessSolutionsDeleteQuerySchema,
} from "@/lib/validators/mentor";
import {
  createMentorWeaknessSolutionForMentor,
  deleteMentorWeaknessSolutionForMentor,
  listMentorWeaknessSolutionsByMentor,
} from "@/services/mentorWeaknessSolutionsService";

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

    const data = await listMentorWeaknessSolutionsByMentor(parsed.data.mentorId);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = mentorWeaknessSolutionsCreateBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid payload." },
        { status: 400 },
      );
    }

    const data = await createMentorWeaknessSolutionForMentor(
      parsed.data.mentorId,
      {
        title: parsed.data.title,
        subjectId: parsed.data.subjectId ?? null,
        materialId: parsed.data.materialId ?? null,
      },
    );

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = mentorWeaknessSolutionsDeleteQuerySchema.safeParse({
      mentorId: searchParams.get("mentorId"),
      id: searchParams.get("id"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid query." },
        { status: 400 },
      );
    }

    await deleteMentorWeaknessSolutionForMentor(
      parsed.data.mentorId,
      parsed.data.id,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
