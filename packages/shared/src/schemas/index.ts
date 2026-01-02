import { z } from 'zod';

/**
 * UUID schema for ID validation
 */
export const idSchema = z.string().uuid();

/**
 * Pagination query schema
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export * from './auth';
export * from './business';
export * from './service';
