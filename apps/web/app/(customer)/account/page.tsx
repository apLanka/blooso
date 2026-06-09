'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getMyAppointments, type CustomerAppointment } from '@/lib/booking-client';
import {
  getMyFavorites,
  getMyReviews,
  type FavoriteBusiness,
  type MyReview,
} from '@/lib/me-client';
import Link from 'next/link';
import { CalendarDays, Heart, MessageSquare, Star, Clock, ChevronRight } from 'lucide-react';

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
      getMyAppointments(token).catch(() => [] as CustomerAppointment[]),
      getMyFavorites(token).catch(() => [] as FavoriteBusiness[]),
      getMyReviews(token).catch(() => [] as MyReview[]),
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
      <div className="flex min-h-[50vh] items-center justify-center">
        <div
          className="size-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'var(--blooso-border)', borderTopColor: 'var(--blooso-rose)' }}
        />
      </div>
    );
  }

  const now = new Date();
  const upcomingCount = appointments.filter(
    (a) => new Date(a.startTime) >= now && a.status !== 'cancelled'
  ).length;

  const recentReviews = reviews.slice(0, 3);
  const topFavorites = favorites.slice(0, 3);

  const kpiCards = [
    {
      title: 'Upcoming Bookings',
      value: upcomingCount,
      icon: CalendarDays,
    },
    {
      title: 'Favorites',
      value: favorites.length,
      icon: Heart,
    },
    {
      title: 'Reviews Written',
      value: reviews.length,
      icon: MessageSquare,
    },
    {
      title: 'Total Appointments',
      value: appointments.length,
      icon: Clock,
    },
  ];

  return (
    <div className="animate-fade-up space-y-10 pb-12">
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-bold tracking-tight md:text-4xl"
          style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
        >
          Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
          Manage your bookings, favorites, and account settings.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className="flex flex-col rounded-[24px] bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              style={{ border: '1px solid var(--blooso-border-light)' }}
            >
              <div className="mb-4 flex items-start justify-between">
                <div
                  className="flex size-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'var(--blooso-bg-warm)' }}
                >
                  <Icon className="size-5" style={{ color: 'var(--blooso-rose)' }} />
                </div>
              </div>
              <p
                className="font-serif text-3xl font-bold tracking-tight"
                style={{ color: 'var(--blooso-text)' }}
              >
                {kpi.value}
              </p>
              <p
                className="mt-1 text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--blooso-text-muted)' }}
              >
                {kpi.title}
              </p>
            </div>
          );
        })}
      </div>

      {/* Upcoming Bookings */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2
            className="text-lg font-bold tracking-tight"
            style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
          >
            Upcoming Bookings
          </h2>
          <Link
            href="/my-bookings"
            className="flex items-center gap-1 text-sm font-semibold transition-colors hover:underline"
            style={{ color: 'var(--blooso-rose)' }}
          >
            View All <ChevronRight className="size-4" />
          </Link>
        </div>

        {upcomingCount === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-[24px] bg-white px-6 py-16 text-center shadow-sm"
            style={{ border: '1px solid var(--blooso-border-light)' }}
          >
            <div
              className="flex size-16 items-center justify-center rounded-full"
              style={{ backgroundColor: 'var(--blooso-bg-warm)' }}
            >
              <CalendarDays className="size-7" style={{ color: 'var(--blooso-rose)' }} />
            </div>
            <h3 className="mt-5 text-lg font-bold" style={{ color: 'var(--blooso-text)' }}>
              No upcoming bookings
            </h3>
            <p className="mt-1 text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
              Discover and book beauty & wellness services near you.
            </p>
            <Link
              href="/search"
              className="mt-6 rounded-[10px] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: 'var(--blooso-rose)' }}
            >
              Discover Services
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments
              .filter((a) => new Date(a.startTime) >= now && a.status !== 'cancelled')
              .slice(0, 3)
              .map((apt) => (
                <Link
                  key={apt.id}
                  href={`/b/${apt.business.slug}`}
                  className="flex items-center gap-4 rounded-[16px] bg-white p-4 shadow-sm transition-all hover:shadow-md"
                  style={{ border: '1px solid var(--blooso-border-light)' }}
                >
                  {apt.business.logoUrl ? (
                    <img
                      src={apt.business.logoUrl}
                      alt={apt.business.name}
                      className="size-14 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex size-14 items-center justify-center rounded-full text-lg font-bold"
                      style={{ backgroundColor: 'var(--blooso-rose)', color: '#fff' }}
                    >
                      {apt.business.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold" style={{ color: 'var(--blooso-text)' }}>
                      {apt.business.name}
                    </p>
                    <div
                      className="mt-1 flex items-center gap-3 text-sm"
                      style={{ color: 'var(--blooso-text-muted)' }}
                    >
                      <span>
                        {new Date(apt.startTime).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span>
                        {new Date(apt.startTime).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm" style={{ color: 'var(--blooso-text-subtle)' }}>
                      {apt.appointmentServices
                        ?.map((s) => s.service?.name)
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                  <ChevronRight
                    className="size-5 shrink-0"
                    style={{ color: 'var(--blooso-text-muted)' }}
                  />
                </Link>
              ))}
          </div>
        )}
      </section>

      {/* Favorites & Recent Reviews */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Favorites */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2
              className="text-lg font-bold tracking-tight"
              style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
            >
              Favorites
            </h2>
            <Link
              href="/favorites"
              className="flex items-center gap-1 text-sm font-semibold transition-colors hover:underline"
              style={{ color: 'var(--blooso-rose)' }}
            >
              View All <ChevronRight className="size-4" />
            </Link>
          </div>

          {topFavorites.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center rounded-[24px] bg-white px-6 py-12 text-center shadow-sm"
              style={{ border: '1px solid var(--blooso-border-light)' }}
            >
              <div
                className="flex size-12 items-center justify-center rounded-full"
                style={{ backgroundColor: 'var(--blooso-bg-warm)' }}
              >
                <Heart className="size-5" style={{ color: 'var(--blooso-rose)' }} />
              </div>
              <p className="mt-3 text-sm font-medium" style={{ color: 'var(--blooso-text-muted)' }}>
                No favorites yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {topFavorites.map((biz) => (
                <Link
                  key={biz.id}
                  href={`/b/${biz.slug}`}
                  className="flex items-center gap-3 rounded-[16px] bg-white p-4 shadow-sm transition-all hover:shadow-md"
                  style={{ border: '1px solid var(--blooso-border-light)' }}
                >
                  {biz.logoUrl ? (
                    <img
                      src={biz.logoUrl}
                      alt={biz.name}
                      className="size-12 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex size-12 items-center justify-center rounded-full text-sm font-bold"
                      style={{ backgroundColor: 'var(--blooso-rose)', color: '#fff' }}
                    >
                      {biz.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: 'var(--blooso-text)' }}
                    >
                      {biz.name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        <span
                          className="text-xs font-medium"
                          style={{ color: 'var(--blooso-text)' }}
                        >
                          {biz.avgRating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-xs" style={{ color: 'var(--blooso-text-subtle)' }}>
                        ({biz.reviewCount})
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className="size-4 shrink-0"
                    style={{ color: 'var(--blooso-text-muted)' }}
                  />
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Recent Reviews */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2
              className="text-lg font-bold tracking-tight"
              style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
            >
              Recent Reviews
            </h2>
            <Link
              href="/my-reviews"
              className="flex items-center gap-1 text-sm font-semibold transition-colors hover:underline"
              style={{ color: 'var(--blooso-rose)' }}
            >
              View All <ChevronRight className="size-4" />
            </Link>
          </div>

          {recentReviews.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center rounded-[24px] bg-white px-6 py-12 text-center shadow-sm"
              style={{ border: '1px solid var(--blooso-border-light)' }}
            >
              <div
                className="flex size-12 items-center justify-center rounded-full"
                style={{ backgroundColor: 'var(--blooso-bg-warm)' }}
              >
                <MessageSquare className="size-5" style={{ color: 'var(--blooso-rose)' }} />
              </div>
              <p className="mt-3 text-sm font-medium" style={{ color: 'var(--blooso-text-muted)' }}>
                No reviews yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-[16px] bg-white p-4 shadow-sm"
                  style={{ border: '1px solid var(--blooso-border-light)' }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold" style={{ color: 'var(--blooso-text)' }}>
                      {review.business.name}
                    </p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-black/15'}`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p
                      className="mt-2 line-clamp-2 text-sm leading-relaxed"
                      style={{ color: 'var(--blooso-text-muted)' }}
                    >
                      &ldquo;{review.comment}&rdquo;
                    </p>
                  )}
                  <p className="mt-2 text-xs" style={{ color: 'var(--blooso-text-subtle)' }}>
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
