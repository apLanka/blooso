import { apiClient } from './api-client';

export interface AppointmentService {
  id: string;
  serviceId: string;
  staffId: string;
  priceCharged: number;
  durationMinutes: number;
  service?: { name: string };
}

export interface Appointment {
  id: string;
  businessId: string;
  locationId: string;
  staffId: string;
  clientId: string | null;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  startTime: string;
  endTime: string;
  status: string;
  source: string;
  totalPrice: number;
  notes: string | null;
  cancellationReason: string | null;
  staff?: { id: string; user: { name: string; email: string } };
  appointmentServices?: AppointmentService[];
}

export async function createBooking(
  token: string,
  data: {
    businessId: string;
    locationId: string;
    staffId: string;
    serviceIds: string[];
    startTime: string;
    clientId?: string;
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    source?: string;
    notes?: string;
  }
): Promise<Appointment> {
  return apiClient<Appointment>('/v1/bookings', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}
