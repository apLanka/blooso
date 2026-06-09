'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getMyReviews, type MyReview } from '@/lib/me-client';
import Link from 'next/link';
import { MessageSquare, Star } from 'lucide-react';

export default function ReviewsPage() {
  const { getToken } = useAuth();
  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    getMyReviews(token)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [getToken]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div
          className="size-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'var(--blooso-border)', borderTopColor: 'var(--blooso-rose)' }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--blooso-text)' }}>
          My Reviews
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
          Reviews you&apos;ve written for businesses.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div
          className="rounded-[24px] p-12 text-center"
          style={{ backgroundColor: '#fff', border: '1px solid var(--blooso-border-light)' }}
        >
          <MessageSquare className="mx-auto size-12 text-black/15" />
          <p className="mt-4 text-sm font-medium" style={{ color: 'var(--blooso-text-muted)' }}>
            No reviews yet
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--blooso-text-subtle)' }}>
            Complete a booking to leave a review.
          </p>
          <Link
            href="/my-bookings"
            className="mt-4 inline-block text-sm font-semibold hover:underline"
            style={{ color: 'var(--blooso-rose)' }}
          >
            View Bookings
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-[20px] p-6"
              style={{ backgroundColor: '#fff', border: '1px solid var(--blooso-border-light)' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {review.business.logoUrl ? (
                    <img
                      src={review.business.logoUrl}
                      alt={review.business.name}
                      className="size-12 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex size-12 items-center justify-center rounded-full text-sm font-bold"
                      style={{ backgroundColor: 'var(--blooso-rose)', color: '#fff' }}
                    >
                      {review.business.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <Link
                      href={`/b/${review.business.slug}`}
                      className="font-semibold hover:underline"
                      style={{ color: 'var(--blooso-text)' }}
                    >
                      {review.business.name}
                    </Link>
                    <div className="mt-0.5 flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`size-3.5 ${
                              i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-black/15'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs" style={{ color: 'var(--blooso-text-subtle)' }}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {review.services.length > 0 && (
                <p className="mt-3 text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
                  Services: {review.services.join(', ')}
                </p>
              )}

              {review.comment && (
                <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--blooso-text)' }}>
                  &ldquo;{review.comment}&rdquo;
                </p>
              )}

              {review.businessReply && (
                <div className="mt-4 rounded-[12px] p-4" style={{ backgroundColor: '#F9F7F5' }}>
                  <p
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--blooso-text-subtle)' }}
                  >
                    Business Reply
                  </p>
                  <p className="mt-1 text-sm" style={{ color: 'var(--blooso-text)' }}>
                    {review.businessReply}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
