/**
 * Business entity (matches Prisma model)
 */
export interface Business {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  category: string;
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Location entity (matches Prisma model)
 */
export interface Location {
  id: string;
  businessId: string;
  name: string;
  address: string;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string;
  lat: number | null;
  lng: number | null;
  timezone: string;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Business hours for a location (per day of week)
 */
export interface BusinessHours {
  id: string;
  locationId: string;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  openTime: string; // "09:00"
  closeTime: string; // "17:00"
  isClosed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Business with locations and hours (for API responses)
 */
export interface BusinessWithDetails extends Business {
  locations: (Location & { businessHours: BusinessHours[] })[];
}
