/**
 * Pagination metadata for list responses
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Standard API list response wrapper
 */
export interface ApiListResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Standard API single item response wrapper
 */
export interface ApiResponse<T> {
  data: T;
}

/**
 * Base schema for UUID IDs
 */
export type Id = string;
