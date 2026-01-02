import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const reorderCategoriesSchema = z.array(
  z.object({
    id: z.string().uuid(),
    sortOrder: z.number().int().min(0),
  })
);

export const createServiceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional().nullable(),
  categoryId: z.string().uuid(),
  durationMinutes: z.number().int().min(1).max(480),
  price: z.number().min(0),
  bufferBeforeMinutes: z.number().int().min(0).max(60).default(0),
  bufferAfterMinutes: z.number().int().min(0).max(60).default(0),
  isActive: z.boolean().default(true),
});

export const updateServiceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  categoryId: z.string().uuid().optional(),
  durationMinutes: z.number().int().min(1).max(480).optional(),
  price: z.number().min(0).optional(),
  bufferBeforeMinutes: z.number().int().min(0).max(60).optional(),
  bufferAfterMinutes: z.number().int().min(0).max(60).optional(),
  isActive: z.boolean().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
