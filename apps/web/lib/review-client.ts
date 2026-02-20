import { apiClient } from './api-client';

export interface Review {
  id: string;
  businessId: string;
  appointmentId: string;
  rating: number;
  comment: string | null;
  businessReply: string | null;
  createdAt: string;
  clientName?: string;
}

export interface ReviewsResponse {
  data: Review[];
  total: number;
  page: number;
  limit: number;
}

export async function getReviews(
  businessId: string,
  params?: { page?: number; limit?: number; rating?: number }
): Promise<ReviewsResponse> {
  const search = new URLSearchParams();
  search.set('businessId', businessId);
  if (params?.page) search.set('page', String(params.page));
  if (params?.limit) search.set('limit', String(params.limit));
  if (params?.rating) search.set('rating', String(params.rating));
  return apiClient<ReviewsResponse>(`/v1/reviews?${search.toString()}`);
}

export async function createReview(data: {
  appointmentId: string;
  rating: number;
  comment?: string;
}): Promise<Review> {
  return apiClient<Review>('/v1/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function replyToReview(
  token: string,
  reviewId: string,
  reply: string
): Promise<Review> {
  return apiClient<Review>(`/v1/reviews/${reviewId}/reply`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ reply }),
  });
}

export async function getReviewsForDashboard(
  token: string,
  businessId: string
): Promise<ReviewsResponse> {
  return apiClient<ReviewsResponse>(`/v1/reviews/business/${businessId}`, { token });
}
