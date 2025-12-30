import { apiClient } from './api-client';

export const BUSINESS_CATEGORIES = [
  'salon',
  'barbershop',
  'spa',
  'wellness',
  'nails',
  'tattoo',
  'massage',
  'hair',
  'beauty',
  'medspa',
  'other',
] as const;

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  category: string;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  businessId: string;
  name: string;
  address: string;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string;
  lat: number | null;
  lng: number | null;
  timezone: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessHours {
  id: string;
  locationId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessWithDetails extends Business {
  locations: (Location & { businessHours: BusinessHours[] })[];
}

export async function createBusiness(
  token: string,
  data: { name: string; category: string; description?: string }
) {
  return apiClient<BusinessWithDetails>('/v1/businesses', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

export async function getMyBusinesses(token: string) {
  return apiClient<BusinessWithDetails[]>('/v1/businesses', {
    token,
  });
}

export async function getBusinessById(token: string, id: string) {
  return apiClient<BusinessWithDetails>(`/v1/businesses/${id}`, {
    token,
  });
}

export async function updateBusiness(
  token: string,
  id: string,
  data: Partial<{ name: string; category: string; description: string | null; logoUrl: string | null }>
) {
  return apiClient<BusinessWithDetails>(`/v1/businesses/${id}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(data),
  });
}

export async function createLocation(
  token: string,
  businessId: string,
  data: {
    name: string;
    address: string;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country: string;
    timezone?: string;
    phone?: string | null;
  }
) {
  return apiClient<Location>(`/v1/businesses/${businessId}/locations`, {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

export async function updateLocation(
  token: string,
  businessId: string,
  locationId: string,
  data: Partial<{
    name: string;
    address: string;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string;
    timezone: string;
    phone: string | null;
  }>
) {
  return apiClient<Location>(
    `/v1/businesses/${businessId}/locations/${locationId}`,
    {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    }
  );
}

export async function setBusinessHours(
  token: string,
  businessId: string,
  locationId: string,
  hours: { dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }[]
) {
  return apiClient<BusinessHours[]>(
    `/v1/businesses/${businessId}/locations/${locationId}/hours`,
    {
      method: 'PUT',
      token,
      body: JSON.stringify({ hours }),
    }
  );
}
