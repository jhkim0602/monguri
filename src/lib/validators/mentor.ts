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
  taskId: uuidSchema.optional(),
  menteeId: uuidSchema.optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  comment: z.string().min(1).max(2000),
  rating: z.number().int().min(1).max(5).optional(),
  type: z.enum(["mentor_task", "planner_task", "daily_plan"]),
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
        z
          .object({
            title: z.string().min(1).max(255),
            type: z.enum(["link", "pdf", "image"]),
            url: z.string().max(2000).optional().nullable(),
            fileId: uuidSchema.optional().nullable(),
            sourceMaterialId: uuidSchema.optional().nullable(),
            file: z
              .object({
                bucket: z.string().min(1).max(200),
                path: z.string().min(1).max(1000),
                originalName: z.string().min(1).max(255),
                mimeType: z.string().min(1).max(255),
                sizeBytes: z.number().int().nonnegative(),
                checksum: z.string().max(128).optional().nullable(),
              })
              .optional(),
          })
          .refine(
            (data) => {
              if (data.type === "link") {
                return Boolean(data.url);
              }
              return Boolean(data.fileId || data.file);
            },
            { message: "Invalid material payload.", path: ["type"] },
          ),
      )
      .optional(),
  })
  .refine((data) => !Number.isNaN(new Date(data.deadline).getTime()), {
    message: "Invalid deadline format.",
    path: ["deadline"],
  });

export const mentorMaterialsCreateBodySchema = z
  .object({
    mentorId: uuidSchema,
    title: z.string().min(1).max(200),
    type: z.enum(["link", "pdf", "image"]),
    url: z.string().min(1).max(2000).optional().nullable(),
    file: z
      .object({
        bucket: z.string().min(1).max(200),
        path: z.string().min(1).max(1000),
        originalName: z.string().min(1).max(255),
        mimeType: z.string().min(1).max(255),
        sizeBytes: z.number().int().nonnegative(),
        checksum: z.string().max(128).optional().nullable(),
      })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.type === "link") {
        return Boolean(data.url);
      }
      return Boolean(data.file);
    },
    { message: "Invalid material payload.", path: ["type"] },
  );

export const mentorMaterialsDeleteQuerySchema = z.object({
  mentorId: uuidSchema,
  id: uuidSchema,
});

export const mentorProfileUpdateBodySchema = z
  .object({
    mentorId: uuidSchema,
    name: z.string().min(1).max(100).optional(),
    intro: z.string().max(500).optional().nullable(),
    avatar_url: z.string().url().max(500).optional().nullable(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.intro !== undefined ||
      data.avatar_url !== undefined,
    { message: "No fields to update." },
  );

export const mentorWeaknessSolutionsCreateBodySchema = z.object({
  mentorId: uuidSchema,
  title: z.string().min(1).max(200),
  subjectId: uuidSchema.optional().nullable(),
  materialId: uuidSchema.optional().nullable(),
});

export const mentorWeaknessSolutionsDeleteQuerySchema = z.object({
  mentorId: uuidSchema,
  id: uuidSchema,
});
