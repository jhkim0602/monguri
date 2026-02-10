import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/apiUtils";
import { supabaseServer } from "@/lib/supabaseServer";

/* ─── GET: 멘티의 미팅 일정 조회 ─── */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const menteeId = searchParams.get("menteeId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!menteeId) {
      return NextResponse.json(
        { error: "menteeId is required." },
        { status: 400 },
      );
    }

    let query = supabaseServer
      .from("mentor_meetings")
      .select(`
        id,
        topic,
        confirmed_time,
        zoom_link,
        recurring_group_id,
        mentor_id,
        mentor:profiles!mentor_meetings_mentor_id_fkey(name, avatar_url)
      `)
      .eq("mentee_id", menteeId)
      .order("confirmed_time", { ascending: true });

    if (from) query = query.gte("confirmed_time", `${from}T00:00:00`);
    if (to) query = query.lte("confirmed_time", `${to}T23:59:59`);

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, meetings: data ?? [] });
  } catch (error) {
    return handleRouteError(error);
  }
}
