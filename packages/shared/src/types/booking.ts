/**
 * Appointment status enum
 */
export const APPOINTMENT_STATUS = [
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUS)[number];

/**
 * Booking source enum
 */
export const BOOKING_SOURCES = ['web', 'mobile', 'walk_in', 'phone', 'marketplace'] as const;

export type BookingSource = (typeof BOOKING_SOURCES)[number];

/**
 * Appointment entity
 */
export interface Appointment {
  id: string;
  businessId: string;
  locationId: string;
  staffId: string;
  clientId: string | null;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  source: BookingSource;
  totalPrice: number;
  notes: string | null;
  cancellationReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Appointment service (line item)
 */
export interface AppointmentService {
  id: string;
  appointmentId: string;
  serviceId: string;
  staffId: string;
  priceCharged: number;
  durationMinutes: number;
  sortOrder: number;
}

/**
 * Appointment with relations
 */
export interface AppointmentWithDetails extends Appointment {
  staff?: { id: string; user: { name: string; email: string } };
  appointmentServices?: (AppointmentService & {
    service?: { name: string; durationMinutes: number };
  })[];
}
