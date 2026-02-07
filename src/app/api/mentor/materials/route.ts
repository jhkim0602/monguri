import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/apiUtils";
import {
  mentorIdQuerySchema,
  mentorMaterialsCreateBodySchema,
  mentorMaterialsDeleteQuerySchema,
} from "@/lib/validators/mentor";
import {
  createMentorMaterial,
  deleteMentorMaterial,
  listMentorMaterials,
} from "@/services/mentorMaterialsService";

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

    const data = await listMentorMaterials(parsed.data.mentorId);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = mentorMaterialsCreateBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid payload." },
        { status: 400 },
      );
    }

    const data = await createMentorMaterial(parsed.data.mentorId, {
      title: parsed.data.title,
      type: parsed.data.type,
      ...(parsed.data.type === "link"
        ? { url: parsed.data.url ?? "" }
        : { file: parsed.data.file! }),
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = mentorMaterialsDeleteQuerySchema.safeParse({
      mentorId: searchParams.get("mentorId"),
      id: searchParams.get("id"),
    });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid query." },
        { status: 400 },
      );
    }

    await deleteMentorMaterial(parsed.data.mentorId, parsed.data.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
