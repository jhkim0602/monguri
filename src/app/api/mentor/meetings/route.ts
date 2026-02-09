import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { handleRouteError } from "@/lib/apiUtils";
import { supabaseServer } from "@/lib/supabaseServer";
import { getMentorMeetingsForScheduleUnchecked } from "@/services/mentorMeetingsService";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 },
      );
    }

    const { data: authData, error: authError } =
      await supabaseServer.auth.getUser(token);
    const userId = authData?.user?.id ?? null;

    if (authError || !userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !publishableKey) {
      return NextResponse.json(
        { success: false, error: "Missing Supabase environment variables." },
        { status: 500 },
      );
    }

    const viewerClient = createClient(supabaseUrl, publishableKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: profile, error: profileError } = await viewerClient
      .from("profiles")
      .select("id, role")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      throw new Error(profileError.message);
    }

    if (!profile || (profile.role !== "mentor" && profile.role !== "admin")) {
      return NextResponse.json(
        { success: false, error: "Profile is not a mentor." },
        { status: 403 },
      );
    }

    const data = await getMentorMeetingsForScheduleUnchecked(
      userId,
      viewerClient,
    );

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleRouteError(error);
  }
}
