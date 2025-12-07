/**
 * Calculate total pages for pagination
 */
export function getTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit) || 1;
}
