/**
 * Time slot returned by availability API
 */
export interface TimeSlot {
  startTime: string; // ISO or "HH:mm"
  endTime: string;
  staffId: string;
}

/**
 * Query params for availability lookup
 */
export interface AvailabilityQuery {
  businessId: string;
  staffId?: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
}

/**
 * Availability override (time off, special hours)
 */
export interface AvailabilityOverride {
  id: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  reason: string | null;
}
