/**
 * Service category entity (matches Prisma model)
 */
export interface ServiceCategory {
  id: string;
  businessId: string;
  name: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Service entity (matches Prisma model)
 */
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
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Service with category relation (for API responses)
 */
export interface ServiceWithCategory extends Service {
  category: ServiceCategory;
}
