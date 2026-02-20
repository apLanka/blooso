import { apiClient } from './api-client';

export interface DashboardStats {
  todayAppointments: number;
  todayRevenue: number;
  weekRevenue: number;
  totalClients: number;
  avgRating: number;
  reviewCount: number;
  todaySchedule: Array<{
    id: string;
    startTime: string;
    endTime: string;
    status: string;
    staff?: { user: { name: string } };
    appointmentServices?: Array<{ service?: { name: string } }>;
  }>;
}

export async function getDashboard(token: string, businessId: string): Promise<DashboardStats> {
  return apiClient<DashboardStats>(`/v1/businesses/${businessId}/reports/dashboard`, { token });
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
}

export async function getRevenue(
  token: string,
  businessId: string,
  period?: string
): Promise<{ data: RevenueDataPoint[] }> {
  const q = period ? `?period=${period}` : '';
  return apiClient<{ data: RevenueDataPoint[] }>(
    `/v1/businesses/${businessId}/reports/revenue${q}`,
    { token }
  );
}

export interface AppointmentDataPoint {
  date: string;
  total: number;
  byStatus?: Record<string, number>;
}

export async function getAppointmentsReport(
  token: string,
  businessId: string,
  period?: string
): Promise<{ data: AppointmentDataPoint[] }> {
  const q = period ? `?period=${period}` : '';
  return apiClient<{ data: AppointmentDataPoint[] }>(
    `/v1/businesses/${businessId}/reports/appointments${q}`,
    { token }
  );
}

export interface TopClient {
  id: string;
  name: string;
  email: string;
  visits: number;
}

export async function getTopClients(
  token: string,
  businessId: string
): Promise<{ topByVisits: TopClient[] }> {
  return apiClient<{ topByVisits: TopClient[] }>(`/v1/businesses/${businessId}/reports/clients`, {
    token,
  });
}

export interface TopService {
  serviceId: string;
  serviceName: string;
  count: number;
  revenue: number;
}

export async function getTopServices(
  token: string,
  businessId: string
): Promise<{ data: TopService[] }> {
  return apiClient<{ data: TopService[] }>(`/v1/businesses/${businessId}/reports/top-services`, {
    token,
  });
}
