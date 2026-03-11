import Link from 'next/link';
import {
  Scissors,
  Sparkles,
  Heart,
  Palette,
  Gem,
  CircleDot,
  HandMetal,
  Waves,
  Stethoscope,
} from 'lucide-react';
import { BUSINESS_CATEGORIES } from '@/lib/business-client';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  salon: Scissors,
  barbershop: HandMetal,
  spa: Waves,
  wellness: Heart,
  nails: Palette,
  tattoo: CircleDot,
  massage: Heart,
  hair: Scissors,
  beauty: Sparkles,
  medspa: Stethoscope,
  other: Gem,
};

const CATEGORY_LABELS: Record<string, string> = {
  salon: 'Salon',
  barbershop: 'Barbershop',
  spa: 'Spa',
  wellness: 'Wellness',
  nails: 'Nails',
  tattoo: 'Tattoo',
  massage: 'Massage',
  hair: 'Hair',
  beauty: 'Beauty',
  medspa: 'Med Spa',
  other: 'Other',
};

export function CategoriesSection() {
  return (
    <section className="relative overflow-hidden bg-gray-50 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Browse by category
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-lg text-gray-500">
            Find the perfect service for your needs
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {BUSINESS_CATEGORIES.filter((c) => c !== 'other').map((category) => {
            const Icon = CATEGORY_ICONS[category] ?? Gem;
            const label = CATEGORY_LABELS[category] ?? category;
            return (
              <Link
                key={category}
                href={`/search?category=${category}`}
                className={cn(
                  'group flex flex-col items-center gap-3 rounded-2xl p-6',
                  'bg-white border border-gray-100',
                  'transition-all hover:border-accent-pink/30 hover:shadow-lg hover:shadow-accent-pink/5',
                  'hover:-translate-y-0.5'
                )}
              >
                <div
                  className={cn(
                    'flex size-14 items-center justify-center rounded-xl',
                    'bg-accent-blue-light/30 text-accent-blue',
                    'transition-colors group-hover:bg-accent-pink/20 group-hover:text-accent-pink'
                  )}
                >
                  <Icon className="size-7" />
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
