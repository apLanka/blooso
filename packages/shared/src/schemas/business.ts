import { z } from 'zod';
import { BUSINESS_CATEGORIES } from '../constants/business';

export const createBusinessSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  category: z.enum(BUSINESS_CATEGORIES),
  description: z.string().max(500).optional().nullable(),
});

export const updateBusinessSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  category: z.enum(BUSINESS_CATEGORIES).optional(),
  description: z.string().max(500).optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  settings: z.record(z.unknown()).optional(),
});

export const createLocationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  address: z.string().min(1, 'Address is required').max(255),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  country: z.string().min(1, 'Country is required').max(100),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  timezone: z.string().min(1, 'Timezone is required').default('UTC'),
  phone: z.string().max(20).optional().nullable(),
});

export const updateLocationSchema = createLocationSchema.partial();

export const businessHoursSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  openTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format: HH:mm'),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format: HH:mm'),
  isClosed: z.boolean(),
});

export const setBusinessHoursSchema = z.array(businessHoursSchema);

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>;
export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
export type BusinessHoursInput = z.infer<typeof businessHoursSchema>;
