import type { Metadata } from 'next';
import { getBusinessBySlug } from '@/lib/business-client';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const business = await getBusinessBySlug(slug);
    const title = `${business.name} | Blooso`;
    const description =
      business.description ||
      `Book ${business.category.replace(/_/g, ' ')} services at ${business.name}`;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: business.logoUrl ? [business.logoUrl] : undefined,
      },
    };
  } catch {
    return {
      title: 'Business | Blooso',
    };
  }
}

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
