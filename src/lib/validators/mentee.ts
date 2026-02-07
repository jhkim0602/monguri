import { z } from "zod";

import { uuidSchema } from "@/lib/validators/common";

export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format.");

export const menteeIdQuerySchema = z.object({
  menteeId: uuidSchema,
});

export const profileIdQuerySchema = z.object({
  profileId: uuidSchema,
});

export const taskIdParamSchema = z.object({
  taskId: uuidSchema,
});

export const plannerTaskIdParamSchema = z.object({
  taskId: uuidSchema,
});

const attachmentMetaSchema = z.object({
  bucket: z.string().min(1).max(200),
  path: z.string().min(1).max(1000),
  originalName: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(255),
  sizeBytes: z.number().int().nonnegative(),
  checksum: z.string().max(128).optional().nullable(),
});

export const taskSubmissionBodySchema = z.object({
  menteeId: uuidSchema,
  note: z.string().max(2000).optional().nullable(),
  attachments: z.array(attachmentMetaSchema).min(1),
});

export const taskFeedbackQuerySchema = z.object({
  menteeId: uuidSchema,
});

export const plannerTaskListQuerySchema = z.object({
  menteeId: uuidSchema,
  date: dateStringSchema.optional(),
  from: dateStringSchema.optional(),
  to: dateStringSchema.optional(),
});

export const plannerTaskCreateBodySchema = z.object({
  menteeId: uuidSchema,
  title: z.string().min(1).max(200),
  date: dateStringSchema,
  subjectSlug: z.string().min(1).max(100).optional().nullable(),
  completed: z.boolean().optional(),
  timeSpentSec: z.number().int().nonnegative().optional().nullable(),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
});

export const plannerTaskUpdateBodySchema = z
  .object({
    menteeId: uuidSchema,
    title: z.string().min(1).max(200).optional(),
    date: dateStringSchema.optional(),
    subjectSlug: z.string().min(1).max(100).optional().nullable(),
    completed: z.boolean().optional(),
    timeSpentSec: z.number().int().nonnegative().optional().nullable(),
    startTime: z.string().optional().nullable(),
    endTime: z.string().optional().nullable(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.date !== undefined ||
      data.subjectSlug !== undefined ||
      data.completed !== undefined ||
      data.timeSpentSec !== undefined ||
      data.startTime !== undefined ||
      data.endTime !== undefined,
    { message: "No fields to update." }
  );

export const plannerTaskDeleteQuerySchema = z.object({
  menteeId: uuidSchema,
});

export const plannerOverviewQuerySchema = z.object({
  menteeId: uuidSchema,
  from: dateStringSchema.optional(),
  to: dateStringSchema.optional(),
});
