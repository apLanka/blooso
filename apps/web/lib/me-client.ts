import { apiClient } from './api-client';

export interface MeProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  phone: string | null;
  createdAt: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
}

export interface FavoriteBusiness {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  category: string;
  avgRating: number;
  reviewCount: number;
}

export interface MyReview {
  id: string;
  rating: number;
  comment: string | null;
  businessReply: string | null;
  createdAt: string;
  business: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  appointmentDate: string;
  services: string[];
}

export async function getMe(token: string) {
  return apiClient<MeProfile>('/v1/me', { token });
}

export async function updateMe(token: string, data: UpdateProfileData) {
  return apiClient<MeProfile>('/v1/me', {
    method: 'PATCH',
    token,
    body: JSON.stringify(data),
  });
}

export async function cancelMyAppointment(token: string, appointmentId: string) {
  return apiClient(`/v1/bookings/my-appointments/${appointmentId}/cancel`, {
    method: 'POST',
    token,
  });
}

export async function getMyFavorites(token: string) {
  return apiClient<FavoriteBusiness[]>('/v1/me/favorites', { token });
}

export async function addFavorite(token: string, businessId: string) {
  return apiClient('/v1/me/favorites', {
    method: 'POST',
    token,
    body: JSON.stringify({ businessId }),
  });
}

export async function removeFavorite(token: string, businessId: string) {
  return apiClient(`/v1/me/favorites/${businessId}`, {
    method: 'DELETE',
    token,
  });
}

export async function getMyReviews(token: string) {
  return apiClient<MyReview[]>('/v1/reviews/me', { token });
}
