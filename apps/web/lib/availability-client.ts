import { apiClient } from './api-client';

export interface TimeSlot {
  startTime: string;
  endTime: string;
  staffId: string;
}

export async function getAvailability(
  params: {
    businessId: string;
    serviceId: string;
    date: string;
    staffId?: string;
    locationId?: string;
  },
  token?: string
): Promise<TimeSlot[]> {
  const search = new URLSearchParams({
    businessId: params.businessId,
    serviceId: params.serviceId,
    date: params.date,
  });
  if (params.staffId) search.set('staffId', params.staffId);
  if (params.locationId) search.set('locationId', params.locationId);
  return apiClient<TimeSlot[]>(`/v1/availability?${search}`, { token });
}
