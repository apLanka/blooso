'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getMyAppointments, type CustomerAppointment } from '@/lib/booking-client';
import { Calendar as CalendarIcon, Clock, MapPin, Search } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function MyBookingsPage() {
  const { getToken, user } = useAuth();
  const [appointments, setAppointments] = useState<CustomerAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    getMyAppointments(token)
      .then(setAppointments)
      .catch(() => setAppointments([]))
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
  const past = appointments.filter((a) => new Date(a.startTime) < now || a.status === 'cancelled');

  const renderAppointmentCard = (apt: CustomerAppointment, isPast: boolean) => (
    <div
      key={apt.id}
      className={cn(
        'flex flex-col gap-5 rounded-[24px] p-6 sm:flex-row sm:items-center sm:justify-between transition-all hover:shadow-md',
        isPast ? 'opacity-70 bg-white' : 'bg-white shadow-sm'
      )}
      style={{ border: '1px solid var(--blooso-border-light)' }}
    >
      <div className="flex items-start gap-5">
        {apt.business.logoUrl ? (
          <img
            src={apt.business.logoUrl}
            alt={apt.business.name}
            className="size-16 shrink-0 rounded-[12px] object-cover border"
            style={{ borderColor: 'var(--blooso-border-light)' }}
          />
        ) : (
          <div
            className="flex size-16 shrink-0 items-center justify-center rounded-[12px] border"
            style={{
              backgroundColor: 'var(--blooso-sand-light)',
              borderColor: 'var(--blooso-border-light)',
            }}
          >
            <span
              className="font-serif text-2xl font-bold uppercase"
              style={{ color: 'var(--blooso-text)' }}
            >
              {apt.business.name.charAt(0)}
            </span>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-serif text-lg font-bold" style={{ color: 'var(--blooso-text)' }}>
              {apt.business.name}
            </h3>
            {apt.status === 'cancelled' && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700">
                Cancelled
              </span>
            )}
          </div>

          <div
            className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
            style={{ color: 'var(--blooso-text-muted)' }}
          >
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="size-3.5" />
              <span className={cn(isPast ? '' : 'font-medium text-black')}>
                {new Date(apt.startTime).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              <span className={cn(isPast ? '' : 'font-medium text-black')}>
                {new Date(apt.startTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          <p className="mt-2 text-sm font-medium" style={{ color: 'var(--blooso-text)' }}>
            {apt.appointmentServices?.map((s) => s.service?.name).join(', ')}
            <span className="text-muted-foreground font-normal"> with {apt.staff?.user.name}</span>
          </p>
        </div>
      </div>

      <div className="flex shrink-0 gap-3 pt-2 sm:pt-0">
        {!isPast ? (
          <>
            <button
              className="flex-1 rounded-[10px] px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-black/5 sm:flex-none"
              style={{ color: 'var(--blooso-text)', border: '1px solid var(--blooso-border)' }}
            >
              Reschedule
            </button>
            <Link
              href={`/b/${apt.business.slug}`}
              className="flex-1 rounded-[10px] px-5 py-2.5 text-sm font-semibold text-center transition-opacity hover:opacity-90 sm:flex-none"
              style={{ backgroundColor: 'var(--blooso-rose)', color: '#fff' }}
            >
              Details
            </Link>
          </>
        ) : (
          <Link
            href={`/b/${apt.business.slug}`}
            className="flex-1 rounded-[10px] px-5 py-2.5 text-sm font-semibold text-center transition-colors hover:bg-black/5 sm:flex-none"
            style={{ color: 'var(--blooso-text)', border: '1px solid var(--blooso-border)' }}
          >
            Book Again
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <div className="blooso-container animate-fade-in mx-auto max-w-4xl px-6 pt-12">
      <div className="mb-12">
        <h1
          className="text-4xl font-bold tracking-tight md:text-5xl"
          style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
        >
          My Bookings
        </h1>
        <p className="mt-3 text-base" style={{ color: 'var(--blooso-text-muted)' }}>
          Manage your upcoming appointments and view past visits.
        </p>
      </div>

      {appointments.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-[32px] px-6 py-20 text-center"
          style={{ backgroundColor: 'white', border: '1px solid var(--blooso-border-light)' }}
        >
          <div
            className="mb-6 flex size-20 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--blooso-sand-light)' }}
          >
            <CalendarIcon className="size-8" style={{ color: 'var(--blooso-text)' }} />
          </div>
          <h2
            className="mb-2 text-2xl font-bold"
            style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
          >
            No appointments yet
          </h2>
          <p className="mb-8 max-w-sm text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
            You haven't booked any services yet. Discover top-rated professionals in your area.
          </p>
          <Link
            href="/search"
            className="flex items-center gap-2 rounded-[10px] px-8 py-3.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: 'var(--blooso-rose)', color: '#fff' }}
          >
            <Search className="size-4" />
            Discover Services
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {upcoming.length > 0 && (
            <section>
              <h2
                className="mb-6 flex items-center gap-2 text-xl font-bold uppercase tracking-wider"
                style={{
                  color: 'var(--blooso-text-subtle)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.85rem',
                }}
              >
                <div
                  className="size-2 rounded-full"
                  style={{ backgroundColor: 'var(--blooso-rose)' }}
                />
                Upcoming
              </h2>
              <div className="flex flex-col gap-4">
                {upcoming.map((apt) => renderAppointmentCard(apt, false))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2
                className="mb-6 text-xl font-bold uppercase tracking-wider"
                style={{
                  color: 'var(--blooso-text-subtle)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.85rem',
                }}
              >
                Past Visits
              </h2>
              <div className="flex flex-col gap-4">
                {past.map((apt) => renderAppointmentCard(apt, true))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
