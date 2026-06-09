'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getMyAppointments, type CustomerAppointment } from '@/lib/booking-client';
import { getMyFavorites, type FavoriteBusiness } from '@/lib/me-client';
import { getMyReviews, type MyReview } from '@/lib/me-client';
import Link from 'next/link';
import { CalendarDays, Heart, MessageSquare, ArrowRight, Star } from 'lucide-react';

export default function AccountPage() {
  const { getToken, user } = useAuth();
  const [appointments, setAppointments] = useState<CustomerAppointment[]>([]);
  const [favorites, setFavorites] = useState<FavoriteBusiness[]>([]);
  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    Promise.all([
      getMyAppointments(token).catch(() => []),
      getMyFavorites(token).catch(() => []),
      getMyReviews(token).catch(() => []),
    ])
      .then(([apts, favs, revs]) => {
        setAppointments(apts);
        setFavorites(favs);
        setReviews(revs);
      })
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

  const now = new Date();
  const upcoming = appointments.filter(
    (a) => new Date(a.startTime) >= now && a.status !== 'cancelled'
  );

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--blooso-text)' }}>
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
          Manage your bookings, favorites, and account settings.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div
          className="rounded-[16px] p-5"
          style={{ backgroundColor: '#fff', border: '1px solid var(--blooso-border-light)' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-rose-50">
              <CalendarDays className="size-5 text-rose-500" />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--blooso-text)' }}>
                {upcoming.length}
              </p>
              <p className="text-xs" style={{ color: 'var(--blooso-text-muted)' }}>
                Upcoming Bookings
              </p>
            </div>
          </div>
        </div>
        <div
          className="rounded-[16px] p-5"
          style={{ backgroundColor: '#fff', border: '1px solid var(--blooso-border-light)' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-pink-50">
              <Heart className="size-5 text-pink-500" />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--blooso-text)' }}>
                {favorites.length}
              </p>
              <p className="text-xs" style={{ color: 'var(--blooso-text-muted)' }}>
                Favorites
              </p>
            </div>
          </div>
        </div>
        <div
          className="rounded-[16px] p-5"
          style={{ backgroundColor: '#fff', border: '1px solid var(--blooso-border-light)' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-amber-50">
              <MessageSquare className="size-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--blooso-text)' }}>
                {reviews.length}
              </p>
              <p className="text-xs" style={{ color: 'var(--blooso-text-muted)' }}>
                Reviews Written
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Bookings */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: 'var(--blooso-text)' }}>
            Upcoming Bookings
          </h2>
          <Link
            href="/my-bookings"
            className="flex items-center gap-1 text-sm font-medium hover:underline"
            style={{ color: 'var(--blooso-rose)' }}
          >
            View All <ArrowRight className="size-4" />
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <div
            className="rounded-[16px] p-8 text-center"
            style={{ backgroundColor: '#fff', border: '1px solid var(--blooso-border-light)' }}
          >
            <CalendarDays className="mx-auto size-10 text-black/20" />
            <p className="mt-3 text-sm font-medium" style={{ color: 'var(--blooso-text-muted)' }}>
              No upcoming bookings
            </p>
            <Link
              href="/search"
              className="mt-3 inline-block text-sm font-semibold hover:underline"
              style={{ color: 'var(--blooso-rose)' }}
            >
              Discover Services
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 3).map((apt) => (
              <Link
                key={apt.id}
                href={`/b/${apt.business.slug}`}
                className="flex items-center gap-4 rounded-[16px] p-4 transition-all hover:shadow-md"
                style={{ backgroundColor: '#fff', border: '1px solid var(--blooso-border-light)' }}
              >
                {apt.business.logoUrl ? (
                  <img
                    src={apt.business.logoUrl}
                    alt={apt.business.name}
                    className="size-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-12 items-center justify-center rounded-full bg-rose-50 text-sm font-bold text-rose-600">
                    {apt.business.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate" style={{ color: 'var(--blooso-text)' }}>
                    {apt.business.name}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
                    {new Date(apt.startTime).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    at{' '}
                    {new Date(apt.startTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <ArrowRight className="size-4 text-black/30" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Favorites */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: 'var(--blooso-text)' }}>
            Favorites
          </h2>
          <Link
            href="/favorites"
            className="flex items-center gap-1 text-sm font-medium hover:underline"
            style={{ color: 'var(--blooso-rose)' }}
          >
            View All <ArrowRight className="size-4" />
          </Link>
        </div>
        {favorites.length === 0 ? (
          <div
            className="rounded-[16px] p-8 text-center"
            style={{ backgroundColor: '#fff', border: '1px solid var(--blooso-border-light)' }}
          >
            <Heart className="mx-auto size-10 text-black/20" />
            <p className="mt-3 text-sm font-medium" style={{ color: 'var(--blooso-text-muted)' }}>
              No favorites yet
            </p>
            <Link
              href="/search"
              className="mt-3 inline-block text-sm font-semibold hover:underline"
              style={{ color: 'var(--blooso-rose)' }}
            >
              Discover Services
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.slice(0, 3).map((biz) => (
              <Link
                key={biz.id}
                href={`/b/${biz.slug}`}
                className="flex items-center gap-3 rounded-[16px] p-4 transition-all hover:shadow-md"
                style={{ backgroundColor: '#fff', border: '1px solid var(--blooso-border-light)' }}
              >
                {biz.logoUrl ? (
                  <img
                    src={biz.logoUrl}
                    alt={biz.name}
                    className="size-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-12 items-center justify-center rounded-full bg-rose-50 text-sm font-bold text-rose-600">
                    {biz.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold truncate text-sm"
                    style={{ color: 'var(--blooso-text)' }}
                  >
                    {biz.name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--blooso-text-muted)' }}>
                    {biz.category}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-medium" style={{ color: 'var(--blooso-text)' }}>
                    {biz.avgRating.toFixed(1)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent Reviews */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: 'var(--blooso-text)' }}>
            Recent Reviews
          </h2>
          <Link
            href="/my-reviews"
            className="flex items-center gap-1 text-sm font-medium hover:underline"
            style={{ color: 'var(--blooso-rose)' }}
          >
            View All <ArrowRight className="size-4" />
          </Link>
        </div>
        {reviews.length === 0 ? (
          <div
            className="rounded-[16px] p-8 text-center"
            style={{ backgroundColor: '#fff', border: '1px solid var(--blooso-border-light)' }}
          >
            <MessageSquare className="mx-auto size-10 text-black/20" />
            <p className="mt-3 text-sm font-medium" style={{ color: 'var(--blooso-text-muted)' }}>
              No reviews yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.slice(0, 3).map((review) => (
              <div
                key={review.id}
                className="rounded-[16px] p-4"
                style={{ backgroundColor: '#fff', border: '1px solid var(--blooso-border-light)' }}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm" style={{ color: 'var(--blooso-text)' }}>
                    {review.business.name}
                  </p>
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
                </div>
                {review.comment && (
                  <p
                    className="mt-2 text-sm line-clamp-2"
                    style={{ color: 'var(--blooso-text-muted)' }}
                  >
                    {review.comment}
                  </p>
                )}
                <p className="mt-2 text-xs" style={{ color: 'var(--blooso-text-subtle)' }}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
