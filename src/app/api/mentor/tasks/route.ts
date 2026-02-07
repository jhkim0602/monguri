import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/apiUtils";
import { mentorTaskCreateBodySchema } from "@/lib/validators/mentor";
import { createMentorTaskForMentee } from "@/services/mentorTaskService";

const LEGACY_SUBJECT_TO_SLUG: Record<string, string> = {
  국어: "korean",
  수학: "math",
  영어: "english",
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = mentorTaskCreateBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid payload." },
        { status: 400 },
      );
    }

    const normalizedSubjectSlug =
      parsed.data.subjectSlug ??
      (parsed.data.subject
        ? LEGACY_SUBJECT_TO_SLUG[parsed.data.subject] ?? null
        : null);

    const task = await createMentorTaskForMentee(parsed.data.mentorId, {
      menteeId: parsed.data.menteeId,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      subjectSlug: normalizedSubjectSlug,
      deadline: parsed.data.deadline,
      materials: parsed.data.materials ?? [],
    });

    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
