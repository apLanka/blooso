import { PrismaService } from '../prisma/prisma.service';

/**
 * Converts a name to a URL-safe slug (lowercase, hyphens, alphanumeric)
 */
export function nameToSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'business'
  );
}

/**
 * Generates a unique slug. If slug exists, appends -2, -3, etc.
 */
export async function generateUniqueSlug(
  prisma: PrismaService,
  baseName: string,
): Promise<string> {
  let slug = nameToSlug(baseName);
  let counter = 1;

  while (true) {
    const existing = await prisma.business.findUnique({
      where: { slug },
    });
    if (!existing) {
      return slug;
    }
    slug = `${nameToSlug(baseName)}-${++counter}`;
  }
}
