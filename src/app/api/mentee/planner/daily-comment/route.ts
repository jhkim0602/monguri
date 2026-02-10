import { NextResponse } from "next/server";
import { z } from "zod";
import { handleRouteError } from "@/lib/apiUtils";
import { revalidateMenteeHomeCacheByMenteeId } from "@/lib/menteeHomeServerCache";
import { revalidateMentorSurfaceCachesByMenteeId } from "@/lib/mentorServerCache";
import {
  getDailyRecordByDate,
  upsertDailyRecord,
} from "@/repositories/dailyRecordsRepository";

const getQuerySchema = z.object({
  menteeId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const postBodySchema = z.object({
  menteeId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  comment: z.string().max(500),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = getQuerySchema.safeParse({
      menteeId: searchParams.get("menteeId"),
      date: searchParams.get("date"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid parameters." },
        { status: 400 }
      );
    }

    const record = await getDailyRecordByDate(
      parsed.data.menteeId,
      parsed.data.date
    );

    return NextResponse.json({
      success: true,
      data: {
        menteeComment: record?.mentee_comment ?? null,
        mentorReply: record?.mentor_reply ?? null,
        mentorReplyAt: record?.mentor_reply_at ?? null,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = postBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request body." },
        { status: 400 }
      );
    }

    const record = await upsertDailyRecord(
      parsed.data.menteeId,
      parsed.data.date,
      { menteeComment: parsed.data.comment }
    );
    revalidateMenteeHomeCacheByMenteeId(parsed.data.menteeId);
    await revalidateMentorSurfaceCachesByMenteeId(parsed.data.menteeId);

    return NextResponse.json({
      success: true,
      data: {
        id: record?.id,
        menteeComment: record?.mentee_comment,
        mentorReply: record?.mentor_reply,
        mentorReplyAt: record?.mentor_reply_at,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
