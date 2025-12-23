import { apiClient } from './api-client';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export async function register(email: string, password: string, name: string) {
  return apiClient<AuthResponse>('/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}

export async function login(email: string, password: string) {
  return apiClient<AuthResponse>('/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function refresh(refreshToken: string) {
  return apiClient<AuthResponse>('/v1/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export async function logout(refreshToken: string) {
  return apiClient<{ message: string }>('/v1/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export async function getMe(accessToken: string) {
  return apiClient<User>('/v1/auth/me', {
    token: accessToken,
  });
}
