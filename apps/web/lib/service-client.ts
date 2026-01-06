import { apiClient } from './api-client';

export interface ServiceCategory {
  id: string;
  businessId: string;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  businessId: string;
  categoryId: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceWithCategory extends Service {
  category: ServiceCategory;
}

export interface CategoryWithServices extends ServiceCategory {
  services: ServiceWithCategory[];
}

export async function getCategories(
  token: string,
  businessId: string
): Promise<CategoryWithServices[]> {
  return apiClient(`/v1/businesses/${businessId}/service-categories`, { token });
}

export async function createCategory(
  token: string,
  businessId: string,
  data: { name: string; sortOrder?: number }
) {
  return apiClient<ServiceCategory>(`/v1/businesses/${businessId}/service-categories`, {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

export async function updateCategory(
  token: string,
  businessId: string,
  categoryId: string,
  data: { name?: string; sortOrder?: number }
) {
  return apiClient<ServiceCategory>(
    `/v1/businesses/${businessId}/service-categories/${categoryId}`,
    {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    }
  );
}

export async function deleteCategory(token: string, businessId: string, categoryId: string) {
  return apiClient(`/v1/businesses/${businessId}/service-categories/${categoryId}`, {
    method: 'DELETE',
    token,
  });
}

export async function reorderCategories(
  token: string,
  businessId: string,
  items: { id: string; sortOrder: number }[]
) {
  return apiClient<CategoryWithServices[]>(
    `/v1/businesses/${businessId}/service-categories/reorder`,
    {
      method: 'PATCH',
      token,
      body: JSON.stringify({ items }),
    }
  );
}

export async function getServices(
  token: string,
  businessId: string
): Promise<ServiceWithCategory[]> {
  return apiClient(`/v1/businesses/${businessId}/services`, { token });
}

export async function createService(
  token: string,
  businessId: string,
  data: {
    name: string;
    description?: string | null;
    categoryId: string;
    durationMinutes: number;
    price: number;
    bufferBeforeMinutes?: number;
    bufferAfterMinutes?: number;
    isActive?: boolean;
  }
) {
  return apiClient<ServiceWithCategory>(`/v1/businesses/${businessId}/services`, {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

export async function updateService(
  token: string,
  businessId: string,
  serviceId: string,
  data: Partial<{
    name: string;
    description: string | null;
    categoryId: string;
    durationMinutes: number;
    price: number;
    bufferBeforeMinutes: number;
    bufferAfterMinutes: number;
    isActive: boolean;
  }>
) {
  return apiClient<ServiceWithCategory>(`/v1/businesses/${businessId}/services/${serviceId}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(data),
  });
}

export async function deleteService(token: string, businessId: string, serviceId: string) {
  return apiClient(`/v1/businesses/${businessId}/services/${serviceId}`, {
    method: 'DELETE',
    token,
  });
}
