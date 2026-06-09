'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getMyAppointments, type CustomerAppointment } from '@/lib/booking-client';
import { cancelMyAppointment } from '@/lib/me-client';
import { Calendar as CalendarIcon, Clock, MapPin, Search, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type FilterTab = 'all' | 'upcoming' | 'past' | 'cancelled';

export default function MyBookingsPage() {
  const { getToken } = useAuth();
  const [appointments, setAppointments] = useState<CustomerAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('upcoming');
  const [cancelModal, setCancelModal] = useState<CustomerAppointment | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [rescheduleModal, setRescheduleModal] = useState<CustomerAppointment | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    getMyAppointments(token)
      .then(setAppointments)
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, [getToken]);

  const handleCancel = async () => {
    if (!cancelModal) return;
    const token = getToken();
    if (!token) return;

    setCancelling(true);
    try {
      await cancelMyAppointment(token, cancelModal.id);
      setAppointments((prev) =>
        prev.map((a) => (a.id === cancelModal.id ? { ...a, status: 'cancelled' } : a))
      );
      toast.success('Appointment cancelled');
      setCancelModal(null);
    } catch {
      toast.error('Failed to cancel appointment');
    } finally {
      setCancelling(false);
    }
  };

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
  const filtered = appointments.filter((a) => {
    if (activeTab === 'upcoming') return new Date(a.startTime) >= now && a.status !== 'cancelled';
    if (activeTab === 'past') return new Date(a.startTime) < now && a.status !== 'cancelled';
    if (activeTab === 'cancelled') return a.status === 'cancelled';
    return true;
  });

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    {
      key: 'upcoming',
      label: 'Upcoming',
      count: appointments.filter((a) => new Date(a.startTime) >= now && a.status !== 'cancelled')
        .length,
    },
    {
      key: 'past',
      label: 'Past',
      count: appointments.filter((a) => new Date(a.startTime) < now && a.status !== 'cancelled')
        .length,
    },
    {
      key: 'cancelled',
      label: 'Cancelled',
      count: appointments.filter((a) => a.status === 'cancelled').length,
    },
    { key: 'all', label: 'All', count: appointments.length },
  ];

  const renderAppointmentCard = (apt: CustomerAppointment) => {
    const isPast = new Date(apt.startTime) < now || apt.status === 'cancelled';
    const isCancelled = apt.status === 'cancelled';

    return (
      <div
        key={apt.id}
        className={cn(
          'flex flex-col gap-5 rounded-[24px] p-6 sm:flex-row sm:items-center sm:justify-between transition-all hover:shadow-md',
          isPast ? 'opacity-70 bg-white' : 'bg-white shadow-sm'
        )}
        style={{ border: '1px solid var(--blooso-border-light)' }}
      >
        {/* Left: Business Info */}
        <div className="flex items-center gap-4">
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
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold" style={{ color: 'var(--blooso-text)' }}>
                {apt.business.name}
              </h3>
              {isCancelled && (
                <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                  Cancelled
                </span>
              )}
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span
                className="flex items-center gap-1.5"
                style={{ color: 'var(--blooso-text-muted)' }}
              >
                <CalendarIcon className="size-3.5" />
                {new Date(apt.startTime).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <span
                className="flex items-center gap-1.5"
                style={{ color: 'var(--blooso-text-muted)' }}
              >
                <Clock className="size-3.5" />
                {new Date(apt.startTime).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
              {apt.location && (
                <span
                  className="flex items-center gap-1.5"
                  style={{ color: 'var(--blooso-text-muted)' }}
                >
                  <MapPin className="size-3.5" />
                  {apt.location.city}
                </span>
              )}
            </div>

            <p className="mt-1.5 text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
              {apt.appointmentServices
                ?.map((s) => s.service?.name)
                .filter(Boolean)
                .join(', ')}
              {apt.staff && ` · ${apt.staff.user.name}`}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 sm:flex-shrink-0">
          {!isPast && !isCancelled ? (
            <>
              <button
                onClick={() => setRescheduleModal(apt)}
                className="flex-1 rounded-[10px] px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-black/5 sm:flex-none"
                style={{ color: 'var(--blooso-text)', border: '1px solid var(--blooso-border)' }}
              >
                Reschedule
              </button>
              <button
                onClick={() => setCancelModal(apt)}
                className="flex-1 rounded-[10px] px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-red-50 text-red-600 sm:flex-none"
                style={{ border: '1px solid var(--blooso-border)' }}
              >
                Cancel
              </button>
            </>
          ) : (
            <Link
              href={`/b/${apt.business.slug}`}
              className="flex items-center gap-2 rounded-[10px] px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--blooso-rose)', color: '#fff' }}
            >
              Book Again <ArrowRight className="size-4" />
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--blooso-text)' }}>
          My Bookings
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
          View and manage your appointments.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.key ? 'text-white' : 'hover:bg-black/5'
            )}
            style={{
              backgroundColor: activeTab === tab.key ? 'var(--blooso-rose)' : 'transparent',
              color: activeTab === tab.key ? '#fff' : 'var(--blooso-text-muted)',
            }}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div
          className="rounded-[24px] p-12 text-center"
          style={{ backgroundColor: '#fff', border: '1px solid var(--blooso-border-light)' }}
        >
          <CalendarIcon className="mx-auto size-12 text-black/15" />
          <p className="mt-4 text-sm font-medium" style={{ color: 'var(--blooso-text-muted)' }}>
            {activeTab === 'upcoming'
              ? 'No upcoming bookings'
              : activeTab === 'past'
                ? 'No past bookings'
                : activeTab === 'cancelled'
                  ? 'No cancelled bookings'
                  : 'No bookings yet'}
          </p>
          <Link
            href="/search"
            className="mt-4 inline-block text-sm font-semibold hover:underline"
            style={{ color: 'var(--blooso-rose)' }}
          >
            Discover Services
          </Link>
        </div>
      ) : (
        <div className="space-y-4">{filtered.map(renderAppointmentCard)}</div>
      )}

      {/* ── Cancel Modal ── */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-[24px] bg-white shadow-xl animate-in zoom-in-95">
            <div
              className="flex items-center justify-between border-b p-6"
              style={{ borderColor: 'var(--blooso-border-light)' }}
            >
              <h3 className="text-lg font-bold" style={{ color: 'var(--blooso-text)' }}>
                Cancel Appointment
              </h3>
              <button
                onClick={() => setCancelModal(null)}
                className="flex size-8 items-center justify-center rounded-full bg-black/5 transition-colors hover:bg-black/10"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
                Are you sure you want to cancel your appointment at{' '}
                <span className="font-semibold" style={{ color: 'var(--blooso-text)' }}>
                  {cancelModal.business.name}
                </span>{' '}
                on{' '}
                <span className="font-semibold" style={{ color: 'var(--blooso-text)' }}>
                  {new Date(cancelModal.startTime).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>{' '}
                at{' '}
                <span className="font-semibold" style={{ color: 'var(--blooso-text)' }}>
                  {new Date(cancelModal.startTime).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
                ?
              </p>
              <p className="mt-3 text-sm" style={{ color: 'var(--blooso-text-subtle)' }}>
                This action cannot be undone.
              </p>
            </div>
            <div
              className="flex gap-3 border-t p-6"
              style={{ borderColor: 'var(--blooso-border-light)' }}
            >
              <button
                onClick={() => setCancelModal(null)}
                className="flex-1 rounded-[10px] px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-black/5"
                style={{
                  border: '1px solid var(--blooso-border)',
                  color: 'var(--blooso-text-muted)',
                }}
              >
                Keep Appointment
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 rounded-[10px] bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reschedule Modal ── */}
      {rescheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-[24px] bg-white shadow-xl animate-in zoom-in-95">
            <div
              className="flex items-center justify-between border-b p-6"
              style={{ borderColor: 'var(--blooso-border-light)' }}
            >
              <h3 className="text-lg font-bold" style={{ color: 'var(--blooso-text)' }}>
                Reschedule Appointment
              </h3>
              <button
                onClick={() => setRescheduleModal(null)}
                className="flex size-8 items-center justify-center rounded-full bg-black/5 transition-colors hover:bg-black/10"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
                To reschedule your appointment at{' '}
                <span className="font-semibold" style={{ color: 'var(--blooso-text)' }}>
                  {rescheduleModal.business.name}
                </span>
                , please visit the booking page and select a new time slot.
              </p>
            </div>
            <div
              className="flex gap-3 border-t p-6"
              style={{ borderColor: 'var(--blooso-border-light)' }}
            >
              <button
                onClick={() => setRescheduleModal(null)}
                className="flex-1 rounded-[10px] px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-black/5"
                style={{
                  border: '1px solid var(--blooso-border)',
                  color: 'var(--blooso-text-muted)',
                }}
              >
                Close
              </button>
              <Link
                href={`/b/${rescheduleModal.business.slug}`}
                onClick={() => setRescheduleModal(null)}
                className="flex-1 rounded-[10px] px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: 'var(--blooso-rose)' }}
              >
                Go to Booking Page
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
