import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/apiUtils";
import { getSubjects } from "@/services/subjectsService";

export const revalidate = 60;

export async function GET() {
  try {
    const subjects = await getSubjects();
    return NextResponse.json({ subjects });
  } catch (error) {
    return handleRouteError(error);
  }
}
