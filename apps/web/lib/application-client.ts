import { apiClient } from './api-client';

export interface BusinessApplication {
  id: string;
  userId: string;
  name: string;
  category: string;
  description: string | null;
  address: string;
  city: string | null;
  country: string;
  phone: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessApplicationWithUser extends BusinessApplication {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export async function submitApplication(
  token: string,
  data: {
    name: string;
    category: string;
    description?: string;
    address: string;
    city?: string;
    country: string;
    phone?: string;
  }
) {
  return apiClient<BusinessApplication>('/v1/business-applications', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

export async function getMyApplication(token: string) {
  return apiClient<BusinessApplication>('/v1/business-applications/me', {
    token,
  });
}

export async function getAllApplications(token: string) {
  return apiClient<BusinessApplicationWithUser[]>('/v1/admin/applications', {
    token,
  });
}

export async function getPendingApplications(token: string) {
  return apiClient<BusinessApplicationWithUser[]>('/v1/admin/applications/pending', { token });
}

export async function reviewApplication(
  token: string,
  applicationId: string,
  data: { status: 'approved' | 'rejected'; rejectReason?: string }
) {
  return apiClient<BusinessApplication>(`/v1/admin/applications/${applicationId}/review`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(data),
  });
}
