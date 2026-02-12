import { apiClient } from './api-client';

export interface ClientTag {
  id: string;
  clientId: string;
  tag: string;
}

export interface Client {
  id: string;
  businessId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  preferences: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  tags?: ClientTag[];
  totalVisits?: number;
  lastVisit?: string | null;
}

export interface ClientNote {
  id: string;
  clientId: string;
  content: string;
  isPrivate: boolean;
  authorId: string;
  createdAt: string;
}

export interface ClientsListResponse {
  data: Client[];
  total: number;
  page: number;
  limit: number;
}

export async function getClients(
  token: string,
  businessId: string,
  params?: { search?: string; page?: number; limit?: number }
): Promise<ClientsListResponse> {
  const search = new URLSearchParams();
  if (params?.search) search.set('search', params.search);
  if (params?.page) search.set('page', String(params.page));
  if (params?.limit) search.set('limit', String(params.limit));
  const q = search.toString();
  return apiClient<ClientsListResponse>(
    `/v1/businesses/${businessId}/clients${q ? `?${q}` : ''}`,
    { token }
  );
}

export async function getClient(
  token: string,
  businessId: string,
  clientId: string
): Promise<Client> {
  return apiClient<Client>(
    `/v1/businesses/${businessId}/clients/${clientId}`,
    { token }
  );
}

export async function createClient(
  token: string,
  businessId: string,
  data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    preferences?: Record<string, unknown>;
  }
): Promise<Client> {
  return apiClient<Client>(`/v1/businesses/${businessId}/clients`, {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

export async function updateClient(
  token: string,
  businessId: string,
  clientId: string,
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    preferences?: Record<string, unknown>;
  }
): Promise<Client> {
  return apiClient<Client>(
    `/v1/businesses/${businessId}/clients/${clientId}`,
    {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    }
  );
}

export async function deleteClient(
  token: string,
  businessId: string,
  clientId: string
): Promise<{ deleted: boolean }> {
  return apiClient<{ deleted: boolean }>(
    `/v1/businesses/${businessId}/clients/${clientId}`,
    { method: 'DELETE', token }
  );
}

export async function getClientNotes(
  token: string,
  businessId: string,
  clientId: string
): Promise<ClientNote[]> {
  return apiClient<ClientNote[]>(
    `/v1/businesses/${businessId}/clients/${clientId}/notes`,
    { token }
  );
}

export async function createClientNote(
  token: string,
  businessId: string,
  clientId: string,
  data: { content: string; isPrivate?: boolean }
): Promise<ClientNote> {
  return apiClient<ClientNote>(
    `/v1/businesses/${businessId}/clients/${clientId}/notes`,
    {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    }
  );
}

export async function deleteClientNote(
  token: string,
  businessId: string,
  clientId: string,
  noteId: string
): Promise<{ deleted: boolean }> {
  return apiClient<{ deleted: boolean }>(
    `/v1/businesses/${businessId}/clients/${clientId}/notes/${noteId}`,
    { method: 'DELETE', token }
  );
}

export async function addClientTag(
  token: string,
  businessId: string,
  clientId: string,
  tag: string
): Promise<ClientTag> {
  return apiClient<ClientTag>(
    `/v1/businesses/${businessId}/clients/${clientId}/tags`,
    {
      method: 'POST',
      token,
      body: JSON.stringify({ tag }),
    }
  );
}

export async function removeClientTag(
  token: string,
  businessId: string,
  clientId: string,
  tag: string
): Promise<{ deleted: boolean }> {
  return apiClient<{ deleted: boolean }>(
    `/v1/businesses/${businessId}/clients/${clientId}/tags/${encodeURIComponent(tag)}`,
    { method: 'DELETE', token }
  );
}

export async function getClientAppointments(
  token: string,
  businessId: string,
  clientId: string
): Promise<
  Array<{
    id: string;
    startTime: string;
    endTime: string;
    status: string;
    staff?: { user: { name: string } };
    appointmentServices?: Array<{ service?: { name: string } }>;
  }>
> {
  return apiClient(
    `/v1/businesses/${businessId}/clients/${clientId}/appointments`,
    { token }
  );
}
