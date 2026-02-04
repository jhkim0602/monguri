import { z } from "zod";

import { uuidSchema } from "@/lib/validators/common";

export const menteeIdQuerySchema = z.object({
  menteeId: uuidSchema,
});

export const profileIdQuerySchema = z.object({
  profileId: uuidSchema,
});
