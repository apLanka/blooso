'use client';

import { useRef, useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const REVIEWS = [
  {
    name: 'Sarah M.',
    location: 'London, UK',
    rating: 5,
    title: 'So easy to book',
    comment:
      'I found my new favourite salon through Blooso. Booking was seamless and I got instant confirmation. Highly recommend!',
  },
  {
    name: 'James K.',
    location: 'Manchester, UK',
    rating: 5,
    title: 'Great for barbers',
    comment:
      'Finally a platform that understands barbershops. Easy to find availability and book with my regular barber. Love it.',
  },
  {
    name: 'Emma L.',
    location: 'Birmingham, UK',
    rating: 5,
    title: 'Perfect for massages',
    comment:
      'Booked a massage in minutes. The reminders are helpful and I never miss an appointment anymore. Such a time-saver!',
  },
  {
    name: 'David R.',
    location: 'Leeds, UK',
    rating: 5,
    title: 'Best booking app',
    comment:
      "I've tried several booking apps and Blooso is by far the best. Clean interface, real-time availability, and great support.",
  },
  {
    name: 'Olivia T.',
    location: 'Bristol, UK',
    rating: 5,
    title: 'My go-to for beauty',
    comment:
      'Nails, hair, facials — I book everything through Blooso now. So convenient and I always find top-rated places.',
  },
];

export function ReviewsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      const ro = new ResizeObserver(checkScroll);
      ro.observe(el);
      return () => ro.disconnect();
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'left' ? -320 : 320, behavior: 'smooth' });
    setTimeout(checkScroll, 300);
  };

  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Loved by customers
            </h2>
            <p className="mt-4 max-w-xl text-lg text-gray-500">
              See what people are saying about Blooso
            </p>
          </div>
          <div className="hidden gap-2 md:flex">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="flex size-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Previous reviews"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="flex size-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Next reviews"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="mt-12 flex gap-6 overflow-x-auto pb-4 scroll-smooth scrollbar-hide md:snap-x md:snap-mandatory"
        >
          {REVIEWS.map((review) => (
            <div
              key={review.name}
              className={cn(
                'min-w-[300px] max-w-[340px] shrink-0 rounded-2xl border border-gray-100 bg-gray-50 p-6',
                'md:snap-start'
              )}
            >
              <div className="flex gap-1">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="size-4 fill-amber-400 text-amber-400" aria-hidden />
                ))}
              </div>
              <h3 className="mt-3 font-semibold text-gray-900">{review.title}</h3>
              <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-gray-500">
                {review.comment}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="font-medium text-gray-900">{review.name}</span>
                <span className="text-sm text-gray-400">·</span>
                <span className="text-sm text-gray-500">{review.location}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
