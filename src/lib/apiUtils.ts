import { NextResponse } from "next/server";

import { HttpError } from "@/lib/httpErrors";

export function handleRouteError(error: unknown) {
  const httpError =
    error instanceof HttpError
      ? error
      : new HttpError(500, "Internal server error.");

  return NextResponse.json(
    { error: httpError.message },
    { status: httpError.status }
  );
}
