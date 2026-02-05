import { z } from "zod";

import { uuidSchema } from "@/lib/validators/common";

export const menteeIdQuerySchema = z.object({
  menteeId: uuidSchema,
});

export const profileIdQuerySchema = z.object({
  profileId: uuidSchema,
});

export const taskIdParamSchema = z.object({
  taskId: uuidSchema,
});

export const taskSubmissionBodySchema = z.object({
  menteeId: uuidSchema,
  note: z.string().max(2000).optional().nullable(),
});

export const taskFeedbackQuerySchema = z.object({
  menteeId: uuidSchema,
});
