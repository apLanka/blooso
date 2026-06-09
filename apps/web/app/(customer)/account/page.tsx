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

      {/* Main Layout Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Content Area (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Favorites */}
          <div
            className="flex flex-col rounded-[24px] bg-white p-6 shadow-sm lg:p-8"
            style={{ border: '1px solid var(--blooso-border-light)' }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart className="size-5" style={{ color: 'var(--blooso-text-subtle)' }} />
                <h2
                  className="text-xl font-bold"
                  style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
                >
                  Favorites
                </h2>
              </div>
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
                className="flex h-[200px] flex-col items-center justify-center rounded-[16px] text-center"
                style={{ backgroundColor: 'var(--blooso-bg-warm)' }}
              >
                <Heart className="mb-3 size-8 opacity-20" style={{ color: 'var(--blooso-text)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--blooso-text-muted)' }}>
                  No favorites yet
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {topFavorites.map((biz) => (
                  <Link
                    key={biz.id}
                    href={`/b/${biz.slug}`}
                    className="flex items-center gap-4 rounded-[16px] p-4 transition-colors hover:bg-black/[0.02]"
                    style={{ border: '1px solid var(--blooso-border-light)' }}
                  >
                    {biz.logoUrl ? (
                      <img
                        src={biz.logoUrl}
                        alt={biz.name}
                        className="size-14 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex size-14 items-center justify-center rounded-full text-lg font-bold"
                        style={{ backgroundColor: 'var(--blooso-rose)', color: '#fff' }}
                      >
                        {biz.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-base font-semibold truncate"
                        style={{ color: 'var(--blooso-text)' }}
                      >
                        {biz.name}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="size-4 fill-amber-400 text-amber-400" />
                          <span
                            className="text-sm font-medium"
                            style={{ color: 'var(--blooso-text)' }}
                          >
                            {biz.avgRating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-sm" style={{ color: 'var(--blooso-text-subtle)' }}>
                          ({biz.reviewCount})
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      className="size-5 shrink-0"
                      style={{ color: 'var(--blooso-text-muted)' }}
                    />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Reviews */}
          <div
            className="flex flex-col rounded-[24px] bg-white p-6 shadow-sm lg:p-8"
            style={{ border: '1px solid var(--blooso-border-light)' }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="size-5" style={{ color: 'var(--blooso-text-subtle)' }} />
                <h2
                  className="text-xl font-bold"
                  style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
                >
                  Recent Reviews
                </h2>
              </div>
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
                className="flex h-[200px] flex-col items-center justify-center rounded-[16px] text-center"
                style={{ backgroundColor: 'var(--blooso-bg-warm)' }}
              >
                <MessageSquare
                  className="mb-3 size-8 opacity-20"
                  style={{ color: 'var(--blooso-text)' }}
                />
                <p className="text-sm font-medium" style={{ color: 'var(--blooso-text-muted)' }}>
                  No reviews yet
                </p>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {recentReviews.map((review) => (
                  <div
                    key={review.id}
                    className="flex flex-col rounded-[16px] p-5"
                    style={{ border: '1px solid var(--blooso-border-light)' }}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-semibold" style={{ color: 'var(--blooso-text)' }}>
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
                        className="flex-1 text-sm leading-relaxed"
                        style={{ color: 'var(--blooso-text-muted)' }}
                      >
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    )}
                    <p
                      className="mt-4 text-xs font-medium"
                      style={{ color: 'var(--blooso-text-subtle)' }}
                    >
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
          </div>
        </div>

        {/* Side Panel: Upcoming Bookings (4 cols) */}
        <div
          className="lg:col-span-4 flex flex-col rounded-[24px] p-6 shadow-sm lg:p-8"
          style={{
            backgroundColor: 'var(--blooso-bg-warm)',
            border: '1px solid var(--blooso-border-light)',
          }}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2
              className="text-xl font-bold"
              style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
            >
              Upcoming Bookings
            </h2>
            <Link
              href="/my-bookings"
              className="flex size-8 items-center justify-center rounded-full bg-white shadow-sm transition-transform hover:scale-110"
              style={{ color: 'var(--blooso-text)' }}
            >
              <ChevronRight className="size-4" />
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            {upcomingCount === 0 ? (
              <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
                <CalendarDays
                  className="mb-3 size-8 opacity-20"
                  style={{ color: 'var(--blooso-text)' }}
                />
                <p className="text-sm font-medium" style={{ color: 'var(--blooso-text-muted)' }}>
                  No upcoming bookings.
                </p>
                <Link
                  href="/search"
                  className="mt-4 rounded-full px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--blooso-rose)' }}
                >
                  Find Services
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {appointments
                  .filter((a) => new Date(a.startTime) >= now && a.status !== 'cancelled')
                  .slice(0, 5)
                  .map((apt) => (
                    <Link
                      key={apt.id}
                      href={`/b/${apt.business.slug}`}
                      className="group flex flex-col rounded-[16px] bg-white p-4 shadow-sm transition-all hover:shadow-md"
                      style={{ border: '1px solid var(--blooso-border-light)' }}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="size-3.5" style={{ color: 'var(--blooso-rose)' }} />
                          <span
                            className="text-xs font-bold uppercase tracking-wider"
                            style={{ color: 'var(--blooso-rose)' }}
                          >
                            {new Date(apt.startTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <span
                          className="text-xs font-medium"
                          style={{ color: 'var(--blooso-text-muted)' }}
                        >
                          {new Date(apt.startTime).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="font-semibold" style={{ color: 'var(--blooso-text)' }}>
                        {apt.business.name}
                      </p>
                      <p
                        className="mt-1 text-xs font-medium"
                        style={{ color: 'var(--blooso-text-muted)' }}
                      >
                        {apt.appointmentServices
                          ?.map((s) => s.service?.name)
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </Link>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
