import { AdminDashboardStats, AdminUserDTO, AdminBusinessDTO } from '@repo/shared/types';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function getAdminDashboardStats(token: string): Promise<AdminDashboardStats> {
  const res = await fetch(`${API_URL}/admin/dashboard-stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch admin stats');
  }
  return res.json();
}

export async function getAdminUsers(token: string): Promise<AdminUserDTO[]> {
  const res = await fetch(`${API_URL}/admin/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch admin users');
  }
  return res.json();
}

export async function getAdminBusinesses(token: string): Promise<AdminBusinessDTO[]> {
  const res = await fetch(`${API_URL}/admin/businesses`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch admin businesses');
  }
  return res.json();
}
