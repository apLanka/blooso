import { z } from 'zod';

const idSchema = z.string().uuid();
import { APPOINTMENT_STATUS, BOOKING_SOURCES } from '../types/booking';

export const createBookingSchema = z.object({
  businessId: idSchema,
  locationId: idSchema,
  staffId: idSchema,
  serviceIds: z.array(idSchema).min(1),
  startTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
  clientId: idSchema.optional().nullable(),
  guestName: z.string().min(1).optional(),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().optional(),
  source: z.enum(BOOKING_SOURCES).default('walk_in'),
  notes: z.string().optional().nullable(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const cancelBookingSchema = z.object({
  reason: z.string().optional().nullable(),
});

export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;

export const appointmentStatusSchema = z.enum(APPOINTMENT_STATUS);
