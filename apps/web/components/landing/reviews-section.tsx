import Image from 'next/image';
import { Star } from 'lucide-react';

const REVIEWS = [
  {
    id: 'sarah-m',
    name: 'Sarah M.',
    city: 'Colombo',
    rating: 5,
    avatar: '/landing/avatar_sarah_1779629186586.png',
    quote:
      "I found my favourite salon through Blooso and haven't looked back. Booking was seamless and I got instant confirmation. Highly recommend!",
  },
  {
    id: 'james-k',
    name: 'James K.',
    city: 'Kandy',
    rating: 5,
    avatar: '/landing/avatar_james_1779629207092.png',
    quote:
      "Finally a platform that understands barbershops. Easy to find availability and book with my regular barber. Wouldn't go back to calling in.",
  },
  {
    id: 'emma-l',
    name: 'Emma L.',
    city: 'Galle',
    rating: 5,
    avatar: '/landing/avatar_emma_1779629251024.png',
    quote:
      'Booked a facial in minutes. The reminders mean I never miss an appointment anymore. Blooso has genuinely changed how I treat myself.',
  },
];

export function ReviewsSection() {
  return (
    <section
      className="blooso-section-pad"
      style={{ backgroundColor: 'var(--blooso-bg)' }}
      aria-labelledby="reviews-heading"
    >
      <div className="blooso-container">
        {/* Section header */}
        <div className="mx-auto max-w-xl text-center">
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--blooso-rose)' }}
          >
            Customer Stories
          </p>
          <h2
            id="reviews-heading"
            className="text-3xl font-bold tracking-tight md:text-4xl"
            style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
          >
            Loved by Thousands of Customers
          </h2>
          <p
            className="mt-4 text-base leading-relaxed"
            style={{ color: 'var(--blooso-text-muted)' }}
          >
            Don't take our word for it — here's what our community says.
          </p>
        </div>

        {/* Testimonial cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {REVIEWS.map((review) => (
            <div
              key={review.id}
              id={`review-${review.id}`}
              className="flex flex-col rounded-2xl p-7 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              style={{
                backgroundColor: 'var(--blooso-bg-warm)',
                border: '1px solid var(--blooso-border-light)',
              }}
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="size-4 fill-amber-400 text-amber-400" aria-hidden />
                ))}
              </div>

              {/* Quote */}
              <blockquote
                className="mt-4 flex-1 text-sm leading-relaxed"
                style={{ color: 'var(--blooso-text-muted)' }}
              >
                &ldquo;{review.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3">
                <div className="size-10 overflow-hidden rounded-full ring-2 ring-white shadow-sm">
                  <Image
                    src={review.avatar}
                    alt={`${review.name} avatar`}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--blooso-text)' }}>
                    {review.name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--blooso-text-subtle)' }}>
                    {review.city}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Aggregate trust badge */}
        <div className="mt-10 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="size-4 fill-amber-400 text-amber-400" aria-hidden />
              ))}
            </div>
            <span className="text-sm font-semibold" style={{ color: 'var(--blooso-text)' }}>
              4.9 / 5
            </span>
          </div>
          <div
            className="h-4 w-px"
            style={{ backgroundColor: 'var(--blooso-border)' }}
            aria-hidden
          />
          <span className="text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
            Based on <strong style={{ color: 'var(--blooso-text)' }}>2,400+</strong> verified
            reviews
          </span>
        </div>
      </div>
    </section>
  );
}
