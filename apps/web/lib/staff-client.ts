import { apiClient } from './api-client';

export const STAFF_ROLES = ['owner', 'manager', 'senior_staff', 'staff', 'junior_staff'] as const;

export interface StaffSchedule {
  id: string;
  staffId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface StaffService {
  id: string;
  staffId: string;
  serviceId: string;
  service?: { name: string };
}

export interface StaffMember {
  id: string;
  userId: string;
  businessId: string;
  role: string;
  commissionRate: number;
  bio: string | null;
  isActive: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  staffSchedules?: StaffSchedule[];
  staffServices?: StaffService[];
}

export async function getStaff(token: string, businessId: string): Promise<StaffMember[]> {
  return apiClient(`/v1/businesses/${businessId}/staff`, { token });
}

export async function getStaffById(
  token: string,
  businessId: string,
  staffId: string
): Promise<StaffMember> {
  return apiClient(`/v1/businesses/${businessId}/staff/${staffId}`, {
    token,
  });
}

export async function createStaff(
  token: string,
  businessId: string,
  data: {
    name: string;
    email: string;
    role: string;
    commissionRate?: number;
    bio?: string | null;
  }
) {
  return apiClient<StaffMember>(`/v1/businesses/${businessId}/staff`, {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

export async function updateStaff(
  token: string,
  businessId: string,
  staffId: string,
  data: Partial<{
    name: string;
    role: string;
    commissionRate: number;
    bio: string | null;
    isActive: boolean;
  }>
) {
  return apiClient<StaffMember>(`/v1/businesses/${businessId}/staff/${staffId}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(data),
  });
}

export async function deleteStaff(token: string, businessId: string, staffId: string) {
  return apiClient(`/v1/businesses/${businessId}/staff/${staffId}`, {
    method: 'DELETE',
    token,
  });
}

export async function setStaffServices(
  token: string,
  businessId: string,
  staffId: string,
  serviceIds: string[]
) {
  return apiClient<StaffMember>(`/v1/businesses/${businessId}/staff/${staffId}/services`, {
    method: 'PUT',
    token,
    body: JSON.stringify({ serviceIds }),
  });
}

export async function setStaffSchedule(
  token: string,
  businessId: string,
  staffId: string,
  schedule: { dayOfWeek: number; startTime: string; endTime: string; isAvailable: boolean }[]
) {
  return apiClient<StaffSchedule[]>(`/v1/businesses/${businessId}/staff/${staffId}/schedule`, {
    method: 'PUT',
    token,
    body: JSON.stringify({ schedule }),
  });
}
