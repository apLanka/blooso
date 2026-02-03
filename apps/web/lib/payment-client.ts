import { apiClient } from './api-client';

export interface Payment {
  id: string;
  appointmentId: string;
  amount: number;
  method: string;
  status: string;
  tipAmount: number;
}

export async function createCheckoutSession(
  token: string,
  data: {
    appointmentId: string;
    successUrl?: string;
    cancelUrl?: string;
  }
): Promise<{ url: string; sessionId: string }> {
  return apiClient('/v1/payments/checkout', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

export async function recordInPersonPayment(
  token: string,
  businessId: string,
  appointmentId: string,
  data: { amount: number; method: string; tipAmount?: number }
): Promise<Payment> {
  return apiClient(`/v1/businesses/${businessId}/appointments/${appointmentId}/checkout`, {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

export async function getAppointmentPayments(
  token: string,
  businessId: string,
  appointmentId: string
): Promise<Payment[]> {
  return apiClient(`/v1/businesses/${businessId}/appointments/${appointmentId}/payments`, {
    token,
  });
}
