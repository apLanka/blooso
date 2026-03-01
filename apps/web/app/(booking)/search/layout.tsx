import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find a Business',
  description:
    'Search for salons, spas, barbershops, and wellness businesses. Book appointments online.',
  openGraph: {
    title: 'Find a Business | Blooso',
    description: 'Search for beauty and wellness businesses. Book appointments online.',
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
