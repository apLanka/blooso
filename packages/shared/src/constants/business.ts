/**
 * Business categories for beauty and wellness
 */
export const BUSINESS_CATEGORIES = [
  'salon',
  'barbershop',
  'spa',
  'wellness',
  'nails',
  'tattoo',
  'massage',
  'hair',
  'beauty',
  'medspa',
  'other',
] as const;

export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number];
