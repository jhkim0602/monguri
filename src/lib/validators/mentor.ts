import { z } from "zod";

import { uuidSchema } from "@/lib/validators/common";

export const mentorIdQuerySchema = z.object({
  mentorId: uuidSchema,
});

export const mentorStudentIdParamSchema = z.object({
  id: uuidSchema,
});

export const mentorFeedbackSubmitBodySchema = z.object({
  mentorId: uuidSchema,
  taskId: uuidSchema,
  comment: z.string().min(1).max(2000),
  rating: z.number().int().min(1).max(5).optional(),
  type: z.enum(["mentor_task", "planner_task"]),
});

export const mentorTaskCreateBodySchema = z
  .object({
    mentorId: uuidSchema,
    menteeId: uuidSchema,
    title: z.string().min(1).max(200),
    description: z.string().max(5000).optional().nullable(),
    subjectSlug: z.string().min(1).max(100).optional().nullable(),
    subject: z.string().min(1).max(100).optional().nullable(),
    deadline: z.string().min(1),
    materials: z
      .array(
        z.object({
          title: z.string().min(1).max(255),
          url: z.string().max(2000).optional().nullable(),
        }),
      )
      .optional(),
  })
  .refine((data) => !Number.isNaN(new Date(data.deadline).getTime()), {
    message: "Invalid deadline format.",
    path: ["deadline"],
  });

export const mentorMaterialsCreateBodySchema = z.object({
  mentorId: uuidSchema,
  title: z.string().min(1).max(200),
  type: z.enum(["link", "pdf", "image"]).optional(),
  url: z.string().min(1).max(2000),
});

export const mentorMaterialsDeleteQuerySchema = z.object({
  mentorId: uuidSchema,
  id: uuidSchema,
});
