import { z } from 'zod';

const STAFF_ROLES = ['owner', 'manager', 'senior_staff', 'staff', 'junior_staff'] as const;

export const createStaffSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email'),
  role: z.enum(STAFF_ROLES),
  commissionRate: z.number().min(0).max(100).default(0),
  bio: z.string().max(500).optional().nullable(),
});

export const updateStaffSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.enum(STAFF_ROLES).optional(),
  commissionRate: z.number().min(0).max(100).optional(),
  bio: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const staffScheduleItemSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  isAvailable: z.boolean(),
});

export const setStaffScheduleSchema = z.array(staffScheduleItemSchema);

export const setStaffServicesSchema = z.object({
  serviceIds: z.array(z.string().uuid()),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
export type StaffScheduleItemInput = z.infer<typeof staffScheduleItemSchema>;
