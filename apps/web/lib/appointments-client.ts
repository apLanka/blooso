import { apiClient } from './api-client';
import type { Appointment } from './booking-client';

export async function getAppointments(
  token: string,
  businessId: string,
  params?: { date?: string; staffId?: string; status?: string }
): Promise<Appointment[]> {
  const search = new URLSearchParams();
  if (params?.date) search.set('date', params.date);
  if (params?.staffId) search.set('staffId', params.staffId);
  if (params?.status) search.set('status', params.status);
  const q = search.toString();
  return apiClient<Appointment[]>(`/v1/businesses/${businessId}/appointments${q ? `?${q}` : ''}`, {
    token,
  });
}

export async function getAppointment(
  token: string,
  businessId: string,
  appointmentId: string
): Promise<Appointment> {
  return apiClient<Appointment>(`/v1/businesses/${businessId}/appointments/${appointmentId}`, {
    token,
  });
}

export async function createAppointment(
  token: string,
  businessId: string,
  data: {
    locationId: string;
    staffId: string;
    serviceIds: string[];
    startTime: string;
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    notes?: string;
  }
): Promise<Appointment> {
  return apiClient<Appointment>(`/v1/businesses/${businessId}/appointments`, {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

export async function updateAppointment(
  token: string,
  businessId: string,
  appointmentId: string,
  data: { status?: string; notes?: string; startTime?: string; endTime?: string }
): Promise<Appointment> {
  return apiClient<Appointment>(`/v1/businesses/${businessId}/appointments/${appointmentId}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(data),
  });
}

export async function cancelAppointment(
  token: string,
  businessId: string,
  appointmentId: string,
  reason?: string
): Promise<Appointment> {
  return apiClient<Appointment>(
    `/v1/businesses/${businessId}/appointments/${appointmentId}/cancel`,
    {
      method: 'POST',
      token,
      body: JSON.stringify({ reason }),
    }
  );
}
