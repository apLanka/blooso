import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  {
    key: 'hair',
    label: 'Hair & Styling',
    image: '/landing/category_hair_styling_1779629020206.png',
    alt: 'Professional hairstylist working in a luxury salon',
    href: '/search?category=hair',
  },
  {
    key: 'skincare',
    label: 'Skincare & Facials',
    image: '/landing/category_skincare_1779629053343.png',
    alt: 'Woman receiving a luxury facial treatment',
    href: '/search?category=beauty',
  },
  {
    key: 'nails',
    label: 'Nail Care',
    image: '/landing/category_nail_care_1779629035607.png',
    alt: 'Nail technician applying polish in a luxury nail studio',
    href: '/search?category=nails',
  },
  {
    key: 'massage',
    label: 'Massage & Spa',
    image: '/landing/category_massage_spa_1779629087817.png',
    alt: 'Hot stone massage in a luxury spa',
    href: '/search?category=spa',
  },
  {
    key: 'barber',
    label: 'Barbering',
    image: '/landing/category_barbering_1779629104779.png',
    alt: "Skilled barber trimming a man's beard",
    href: '/search?category=barbershop',
  },
  {
    key: 'wellness',
    label: 'Wellness',
    image: '/landing/category_wellness_1779629121030.png',
    alt: 'Woman meditating in a serene wellness studio',
    href: '/search?category=wellness',
  },
];

export function CategoriesSection() {
  return (
    <section
      className="blooso-section-pad"
      style={{ backgroundColor: 'var(--blooso-bg-warm)' }}
      aria-labelledby="categories-heading"
    >
      <div className="blooso-container">
        {/* Section header */}
        <div className="mx-auto max-w-xl text-center">
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--blooso-rose)' }}
          >
            Browse by Category
          </p>
          <h2
            id="categories-heading"
            className="text-3xl font-bold tracking-tight md:text-4xl"
            style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
          >
            Find Your Service
          </h2>
          <p
            className="mt-4 text-base leading-relaxed"
            style={{ color: 'var(--blooso-text-muted)' }}
          >
            From hair care to holistic wellness — explore everything Blooso has to offer.
          </p>
        </div>

        {/* Category grid — 3×2 */}
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.key}
              href={cat.href}
              id={`category-${cat.key}-card`}
              className={cn(
                'group relative overflow-hidden rounded-2xl bg-white',
                'transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'
              )}
              style={{
                border: '1px solid var(--blooso-border-light)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              }}
            >
              {/* Photo thumbnail */}
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {/* Warm overlay on hover */}
                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ backgroundColor: 'rgba(139,58,82,0.12)' }}
                  aria-hidden
                />
              </div>

              {/* Card footer */}
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-sm font-semibold" style={{ color: 'var(--blooso-text)' }}>
                  {cat.label}
                </span>
                <span
                  className="flex items-center gap-1 text-xs font-medium transition-colors group-hover:gap-2"
                  style={{ color: 'var(--blooso-rose)' }}
                >
                  Explore
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
