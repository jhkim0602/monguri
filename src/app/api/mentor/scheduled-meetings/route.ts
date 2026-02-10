import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { handleRouteError } from "@/lib/apiUtils";
import { supabaseServer } from "@/lib/supabaseServer";

/** helper – create a viewer‑scoped Supabase client */
function viewerSupabase(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Authenticate and return userId + token, or throw */
async function authenticate(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (!token)
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data, error } = await supabaseServer.auth.getUser(token);
  if (error || !data?.user?.id)
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  return { userId: data.user.id, token };
}

/* ─── GET: 멘토의 예약 미팅 목록 ─── */
export async function GET(request: Request) {
  try {
    const auth = await authenticate(request);
    if (auth instanceof NextResponse) return auth;
    const { userId, token } = auth;
    const client = viewerSupabase(token);

    const { data, error } = await client
      .from("mentor_meetings")
      .select("*, recurring_group:meeting_recurring_groups(*)")
      .eq("mentor_id", userId)
      .order("confirmed_time", { ascending: true });

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, meetings: data });
  } catch (error) {
    return handleRouteError(error);
  }
}

/* ─── POST: 미팅 생성 (단일 + 반복) ─── */
export async function POST(request: Request) {
  try {
    const auth = await authenticate(request);
    if (auth instanceof NextResponse) return auth;
    const { userId, token } = auth;
    const client = viewerSupabase(token);

    const body = await request.json();
    const {
      mentorMenteeId,
      menteeId,
      topic,
      meetings, // [{ confirmed_time: string }]
      recurrenceRule, // optional { type, start, end, days }
      menteeDescription, // optional message for mentee
    } = body;

    if (!mentorMenteeId || !menteeId || !meetings?.length) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 },
      );
    }

    // 반복 그룹 생성 (반복 미팅인 경우)
    let recurringGroupId: string | null = null;
    if (recurrenceRule) {
      const { data: group, error: groupError } = await client
        .from("meeting_recurring_groups")
        .insert({
          mentor_id: userId,
          mentee_id: menteeId,
          recurrence_rule: recurrenceRule,
        })
        .select("id")
        .single();

      if (groupError) throw new Error(groupError.message);
      recurringGroupId = group.id;
    }

    // 개별 미팅 row 생성
    const rows = meetings.map((m: { confirmed_time: string }) => ({
      mentor_mentee_id: mentorMenteeId,
      mentor_id: userId,
      mentee_id: menteeId,
      topic: topic || "멘토링",
      confirmed_time: m.confirmed_time,
      recurring_group_id: recurringGroupId,
      mentee_description: menteeDescription || null,
    }));

    const { data: inserted, error: insertError } = await client
      .from("mentor_meetings")
      .insert(rows)
      .select();

    if (insertError) throw new Error(insertError.message);

    // 채팅 시스템 메시지 전송 (각 생성된 미팅마다 카드 형태)
    if (inserted && inserted.length > 0) {
      const chatMessages = inserted.map((m: { id: string }) => ({
        mentor_mentee_id: mentorMenteeId,
        sender_id: userId,
        body: `MENTOR_MEETING:${m.id}`,
        message_type: "meeting_scheduled",
      }));

      await client.from("chat_messages").insert(chatMessages);
    }

    // 멘티에게 알림 발송
    try {
      const { data: mentorProfile } = await client
        .from("profiles")
        .select("name, avatar_url")
        .eq("id", userId)
        .single();

      const firstMeeting = inserted?.[0];
      const firstDate = firstMeeting
        ? new Date(firstMeeting.confirmed_time).toLocaleString("ko-KR", {
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })
        : "";

      const notifTitle = recurrenceRule
        ? "정기 미팅이 등록되었습니다"
        : "새로운 미팅이 등록되었습니다";

      const notifMessage = recurrenceRule
        ? `${firstDate}부터 ${inserted?.length ?? 0}회의 정기 미팅이 예정되어 있습니다.`
        : `${firstDate}에 미팅이 예정되어 있습니다.`;

      await client.from("notifications").insert({
        recipient_id: menteeId,
        recipient_role: "mentee",
        type: "meeting_created",
        ref_type: "mentor_meetings",
        ref_id: firstMeeting?.id ?? null,
        title: notifTitle,
        message: notifMessage,
        action_url: `/chat?scrollTo=${firstMeeting?.id ?? ""}`,
        actor_id: userId,
        avatar_url: mentorProfile?.avatar_url ?? null,
        meta: {
          mentorMenteeId,
          mentorMeetingId: firstMeeting?.id ?? null,
          isRecurring: !!recurrenceRule,
        },
      });
    } catch (notifErr) {
      console.error("Failed to send meeting notification:", notifErr);
    }

    return NextResponse.json({
      success: true,
      meetings: inserted,
      recurringGroupId,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

/* ─── PATCH: 줌 링크 업데이트 + 알림 ─── */
export async function PATCH(request: Request) {
  try {
    const auth = await authenticate(request);
    if (auth instanceof NextResponse) return auth;
    const { userId, token } = auth;
    const client = viewerSupabase(token);

    const { meetingId, zoomLink, mentorNote } = await request.json();

    if (!meetingId) {
      return NextResponse.json({ error: "meetingId is required." }, { status: 400 });
    }

    // 기존 미팅 조회
    const { data: existing, error: fetchErr } = await client
      .from("mentor_meetings")
      .select("*")
      .eq("id", meetingId)
      .eq("mentor_id", userId)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
    }

    const hadLink = !!existing.zoom_link;

    // 업데이트 (zoom_link + mentor_note)
    const updateData: Record<string, string | null> = {};
    if (zoomLink !== undefined) updateData.zoom_link = zoomLink || null;
    if (mentorNote !== undefined) updateData.mentor_note = mentorNote || null;

    const { error: updateErr } = await client
      .from("mentor_meetings")
      .update(updateData)
      .eq("id", meetingId);

    if (updateErr) throw new Error(updateErr.message);

    // 새로 링크가 추가된 경우 알림 전송
    if (zoomLink && !hadLink) {
      const { data: mentorProfile } = await client
        .from("profiles")
        .select("name, avatar_url")
        .eq("id", userId)
        .single();

      const meetingDate = new Date(existing.confirmed_time);
      const meetingDateStr = meetingDate.toLocaleString("ko-KR", {
        month: "long", day: "numeric", hour: "numeric", minute: "2-digit",
      });
      const dateParam = `${meetingDate.getFullYear()}-${String(meetingDate.getMonth() + 1).padStart(2, "0")}-${String(meetingDate.getDate()).padStart(2, "0")}`;

      await client.from("notifications").insert({
        recipient_id: existing.mentee_id,
        recipient_role: "mentee",
        type: "zoom_link_added",
        ref_type: "mentor_meetings",
        ref_id: meetingId,
        title: "화상 회의 링크가 등록되었습니다",
        message: `${meetingDateStr} 미팅의 줌 링크가 준비되었습니다.`,
        action_url: null,
        actor_id: userId,
        avatar_url: mentorProfile?.avatar_url ?? null,
        meta: {
          mentorMeetingId: meetingId,
          zoomLink,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}

/* ─── DELETE: 미팅 취소 (삭제 + 알림) ─── */
export async function DELETE(request: Request) {
  try {
    const auth = await authenticate(request);
    if (auth instanceof NextResponse) return auth;
    const { userId, token } = auth;
    const client = viewerSupabase(token);

    const { meetingId } = await request.json();

    if (!meetingId) {
      return NextResponse.json({ error: "meetingId is required." }, { status: 400 });
    }

    // 기존 미팅 조회 (삭제 전 정보 보존)
    const { data: existing, error: fetchErr } = await client
      .from("mentor_meetings")
      .select("*")
      .eq("id", meetingId)
      .eq("mentor_id", userId)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
    }

    // DB에서 삭제
    const { error: deleteErr } = await client
      .from("mentor_meetings")
      .delete()
      .eq("id", meetingId);

    if (deleteErr) throw new Error(deleteErr.message);

    // 멘티에게 취소 알림 발송
    try {
      const { data: mentorProfile } = await client
        .from("profiles")
        .select("name, avatar_url")
        .eq("id", userId)
        .single();

      const meetingDate = new Date(existing.confirmed_time);
      const meetingDateStr = meetingDate.toLocaleString("ko-KR", {
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });

      await client.from("notifications").insert({
        recipient_id: existing.mentee_id,
        recipient_role: "mentee",
        type: "meeting_cancelled",
        ref_type: "mentor_meetings",
        ref_id: meetingId,
        title: "미팅이 취소되었습니다",
        message: `${meetingDateStr} "${existing.topic}" 미팅이 취소되었습니다.`,
        action_url: `/chat?scrollTo=${meetingId}`,
        actor_id: userId,
        avatar_url: mentorProfile?.avatar_url ?? null,
        meta: {
          mentorMeetingId: meetingId,
          topic: existing.topic,
          confirmedTime: existing.confirmed_time,
        },
      });
    } catch (notifErr) {
      console.error("Failed to send cancellation notification:", notifErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
