import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

import { handleRouteError } from "@/lib/apiUtils";
import {
  getMentorDashboardCacheTag,
  MENTOR_SERVER_CACHE_TTL_SEC,
} from "@/lib/mentorServerCache";
import { supabaseServer } from "@/lib/supabaseServer";
import { getMentorDashboardData } from "@/services/mentorDashboardService";

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

    const cachedLoader = unstable_cache(
      async () =>
        getMentorDashboardData(userId, {
          meetingsClient: viewerClient,
          chatsClient: viewerClient,
        }),
      ["mentor-dashboard", userId],
      {
        revalidate: MENTOR_SERVER_CACHE_TTL_SEC,
        tags: [getMentorDashboardCacheTag(userId)],
      },
    );

    const dashboardData = await cachedLoader();

    return NextResponse.json({ success: true, data: dashboardData });
  } catch (error) {
    return handleRouteError(error);
  }
}
