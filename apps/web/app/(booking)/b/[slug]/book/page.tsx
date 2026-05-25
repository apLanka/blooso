'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBusinessBySlug, type BusinessPublicProfile } from '@/lib/business-client';
import { getAvailability } from '@/lib/availability-client';
import { createBooking } from '@/lib/booking-client';
import { createCheckoutSession } from '@/lib/payment-client';
import { useAuth } from '@/contexts/auth-context';
import { ArrowLeft, Check, CreditCard, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type Step = 'services' | 'staff' | 'datetime' | 'confirm' | 'success';

export default function BookPage() {
  const params = useParams();
  const router = useRouter();
  const { getToken } = useAuth();
  const slug = params.slug as string;

  const [business, setBusiness] = useState<BusinessPublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState<Step>('services');

  const [selectedServices, setSelectedServices] = useState<
    { id: string; name: string; duration: number; price: number }[]
  >([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string | 'any'>('any');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<{
    startTime: string;
    endTime: string;
    staffId: string;
  } | null>(null);
  const [slots, setSlots] = useState<{ startTime: string; endTime: string; staffId: string }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [booking, setBooking] = useState<{ id: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = getToken();
  const locationId = business?.locations?.[0]?.id;

  useEffect(() => {
    if (!slug) return;
    getBusinessBySlug(slug)
      .then(setBusiness)
      .catch(() => setBusiness(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (step === 'datetime' && selectedServices[0] && business && locationId) {
      setLoadingSlots(true);
      const date = selectedDate || new Date().toISOString().slice(0, 10);
      if (!selectedDate) setSelectedDate(date); // Initialize with today if empty

      getAvailability(
        {
          businessId: business.id,
          serviceId: selectedServices[0].id,
          date,
          staffId: selectedStaffId === 'any' ? undefined : selectedStaffId,
          locationId,
        },
        token ?? undefined
      )
        .then(setSlots)
        .catch(() => setSlots([]))
        .finally(() => setLoadingSlots(false));
    }
  }, [step, selectedServices, selectedDate, selectedStaffId, business, locationId, token]);

  if (loading || !business) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div
          className="size-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'var(--blooso-border)', borderTopColor: 'var(--blooso-rose)' }}
        />
      </div>
    );
  }

  const totalDuration = selectedServices.reduce((a, s) => a + s.duration, 0);
  const totalPrice = selectedServices.reduce((a, s) => a + s.price, 0);

  const toggleService = (svc: {
    id: string;
    name: string;
    durationMinutes: number;
    price: number;
  }) => {
    setSelectedServices((prev) =>
      prev.some((s) => s.id === svc.id)
        ? prev.filter((s) => s.id !== svc.id)
        : [...prev, { id: svc.id, name: svc.name, duration: svc.durationMinutes, price: svc.price }]
    );
  };

  const handleConfirm = async () => {
    if (!selectedSlot || !locationId) return;
    if (!token) {
      setError('Please sign in to complete your booking');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const b = await createBooking(token, {
        businessId: business.id,
        locationId,
        staffId: selectedSlot.staffId,
        serviceIds: selectedServices.map((s) => s.id),
        startTime: selectedSlot.startTime,
        guestName: guestName || undefined,
        guestEmail: guestEmail || undefined,
        guestPhone: guestPhone || undefined,
        source: 'web',
      });
      setBooking({ id: b.id });
      setStep('success');
    } catch (err: unknown) {
      setError(
        err && typeof err === 'object' && 'body' in err
          ? ((err as { body?: { message?: string } }).body?.message as string)
          : 'Booking failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayWithCard = async () => {
    if (!token || !booking) return;
    setPaying(true);
    setError(null);
    try {
      const base = typeof window !== 'undefined' ? window.location.origin : '';
      const { url } = await createCheckoutSession(token, {
        appointmentId: booking.id,
        successUrl: `${base}/booking/success`,
        cancelUrl: `${base}/booking/cancel`,
      });
      if (url) window.location.href = url;
    } catch (err: unknown) {
      setError(
        err && typeof err === 'object' && 'body' in err
          ? ((err as { body?: { message?: string } }).body?.message as string)
          : 'Could not start payment. Please try again later.'
      );
    } finally {
      setPaying(false);
    }
  };

  const staff = business.staffMembers ?? [];

  const STEPS: Record<Step, number> = {
    services: 1,
    staff: 2,
    datetime: 3,
    confirm: 4,
    success: 5,
  };

  const currentStepNum = STEPS[step];

  return (
    <div className="animate-fade-up pb-32">
      {/* ── Top Bar ── */}
      <div className="blooso-container mx-auto px-6 py-8">
        <button
          onClick={() =>
            step === 'services'
              ? router.back()
              : setStep(
                  Object.keys(STEPS).find(
                    (key) => STEPS[key as Step] === currentStepNum - 1
                  ) as Step
                )
          }
          className="group inline-flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: 'var(--blooso-text-muted)' }}
          disabled={step === 'success'}
        >
          {step !== 'success' && (
            <>
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
              <span className="group-hover:text-black">Back</span>
            </>
          )}
        </button>

        {step !== 'success' && (
          <div className="mt-8 mb-4">
            <h1
              className="text-3xl font-bold tracking-tight md:text-4xl"
              style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
            >
              Book Appointment
            </h1>
            <p className="mt-2 text-sm md:text-base" style={{ color: 'var(--blooso-text-muted)' }}>
              {business.name}
            </p>
          </div>
        )}
      </div>

      <div className="blooso-container mx-auto max-w-3xl px-6">
        {/* ── Progress Indicator ── */}
        {step !== 'success' && (
          <div className="mb-10 flex items-center justify-between text-xs font-semibold uppercase tracking-wider md:text-sm">
            {['Services', 'Professional', 'Time', 'Confirm'].map((label, i) => {
              const num = i + 1;
              const isActive = currentStepNum === num;
              const isPast = currentStepNum > num;

              return (
                <div key={label} className="flex items-center">
                  <div
                    className={cn(
                      'flex items-center gap-2 transition-colors',
                      isActive ? 'text-black' : isPast ? 'text-black/60' : 'text-black/30'
                    )}
                  >
                    <span
                      className="flex size-6 items-center justify-center rounded-full text-[10px] md:size-7 md:text-xs"
                      style={{
                        backgroundColor: isActive
                          ? 'var(--blooso-rose)'
                          : isPast
                            ? 'var(--blooso-text)'
                            : 'transparent',
                        color: isActive || isPast ? '#fff' : 'inherit',
                        border: !isActive && !isPast ? '1px solid var(--blooso-border)' : 'none',
                      }}
                    >
                      {isPast ? <Check className="size-3" /> : num}
                    </span>
                    <span className="hidden sm:inline-block">{label}</span>
                  </div>
                  {num < 4 && (
                    <div
                      className="mx-2 h-px w-8 sm:w-16"
                      style={{ backgroundColor: 'var(--blooso-border-light)' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {error && (
          <div
            className="mb-8 rounded-xl px-4 py-3 text-sm font-medium"
            style={{
              backgroundColor: 'rgba(185, 28, 28, 0.06)',
              color: '#b91c1c',
              border: '1px solid rgba(185, 28, 28, 0.15)',
            }}
            role="alert"
          >
            {error}
          </div>
        )}

        {/* ── Step 1: Services ── */}
        {step === 'services' && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <h2
              className="mb-6 text-xl font-bold"
              style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
            >
              Select services
            </h2>

            <div className="flex flex-col gap-8">
              {business.serviceCategories?.map((cat) => (
                <div key={cat.id}>
                  <h3
                    className="mb-4 text-sm font-bold uppercase tracking-wider"
                    style={{ color: 'var(--blooso-text-subtle)' }}
                  >
                    {cat.name}
                  </h3>
                  <div className="flex flex-col gap-3">
                    {cat.services.map((svc) => {
                      const isSelected = selectedServices.some((s) => s.id === svc.id);
                      return (
                        <label
                          key={svc.id}
                          className={cn(
                            'flex cursor-pointer items-center justify-between rounded-[16px] border p-4 transition-all hover:shadow-md',
                            isSelected ? 'bg-white shadow-sm' : 'bg-transparent'
                          )}
                          style={{
                            borderColor: isSelected
                              ? 'var(--blooso-rose)'
                              : 'var(--blooso-border-light)',
                            backgroundColor: isSelected ? 'var(--blooso-bg-warm)' : 'transparent',
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="flex size-5 shrink-0 items-center justify-center rounded-[6px] border transition-colors"
                              style={{
                                borderColor: isSelected
                                  ? 'var(--blooso-rose)'
                                  : 'var(--blooso-border)',
                                backgroundColor: isSelected ? 'var(--blooso-rose)' : 'transparent',
                              }}
                            >
                              {isSelected && <Check className="size-3.5 text-white" />}
                            </div>
                            <div>
                              <span
                                className="font-semibold"
                                style={{ color: 'var(--blooso-text)' }}
                              >
                                {svc.name}
                              </span>
                              <p
                                className="mt-0.5 text-sm"
                                style={{ color: 'var(--blooso-text-subtle)' }}
                              >
                                {svc.durationMinutes} min
                              </p>
                            </div>
                          </div>
                          <span
                            className="font-serif text-lg font-bold"
                            style={{ color: 'var(--blooso-text)' }}
                          >
                            ${svc.price}
                          </span>

                          {/* Hidden actual checkbox for accessibility */}
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={isSelected}
                            onChange={() => toggleService(svc)}
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {selectedServices.length > 0 && (
              <div
                className="sticky bottom-6 mt-12 flex items-center justify-between rounded-[20px] p-5 shadow-2xl backdrop-blur-md"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  border: '1px solid var(--blooso-border)',
                }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--blooso-text-muted)' }}>
                    {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''}{' '}
                    selected
                  </p>
                  <p
                    className="font-serif text-xl font-bold"
                    style={{ color: 'var(--blooso-text)' }}
                  >
                    ${totalPrice}{' '}
                    <span className="font-sans text-sm font-normal text-muted-foreground">
                      ({totalDuration} min)
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setStep('staff')}
                  className="flex items-center gap-2 rounded-[10px] px-8 py-3.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ backgroundColor: 'var(--blooso-rose)', color: '#fff' }}
                >
                  Continue
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Staff ── */}
        {step === 'staff' && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <h2
              className="mb-2 text-xl font-bold"
              style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
            >
              Choose Professional
            </h2>
            <p className="mb-6 text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
              Select a preferred professional or choose anyone available.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <label
                className={cn(
                  'flex cursor-pointer items-center gap-4 rounded-[16px] border p-5 transition-all hover:shadow-md',
                  selectedStaffId === 'any' ? 'bg-white shadow-sm' : 'bg-transparent'
                )}
                style={{
                  borderColor:
                    selectedStaffId === 'any' ? 'var(--blooso-text)' : 'var(--blooso-border-light)',
                  backgroundColor:
                    selectedStaffId === 'any' ? 'var(--blooso-bg-warm)' : 'transparent',
                }}
              >
                <div
                  className="flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors"
                  style={{
                    borderColor:
                      selectedStaffId === 'any' ? 'var(--blooso-text)' : 'var(--blooso-border)',
                  }}
                >
                  {selectedStaffId === 'any' && (
                    <div
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: 'var(--blooso-text)' }}
                    />
                  )}
                </div>
                <div className="flex size-12 items-center justify-center rounded-full bg-black/5">
                  <span className="font-serif font-bold text-black/40">A</span>
                </div>
                <span className="font-semibold" style={{ color: 'var(--blooso-text)' }}>
                  Anyone Available
                </span>

                <input
                  type="radio"
                  name="staff"
                  className="sr-only"
                  checked={selectedStaffId === 'any'}
                  onChange={() => setSelectedStaffId('any')}
                />
              </label>

              {staff.map((s) => (
                <label
                  key={s.id}
                  className={cn(
                    'flex cursor-pointer items-center gap-4 rounded-[16px] border p-5 transition-all hover:shadow-md',
                    selectedStaffId === s.id ? 'bg-white shadow-sm' : 'bg-transparent'
                  )}
                  style={{
                    borderColor:
                      selectedStaffId === s.id
                        ? 'var(--blooso-text)'
                        : 'var(--blooso-border-light)',
                    backgroundColor:
                      selectedStaffId === s.id ? 'var(--blooso-bg-warm)' : 'transparent',
                  }}
                >
                  <div
                    className="flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors"
                    style={{
                      borderColor:
                        selectedStaffId === s.id ? 'var(--blooso-text)' : 'var(--blooso-border)',
                    }}
                  >
                    {selectedStaffId === s.id && (
                      <div
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: 'var(--blooso-text)' }}
                      />
                    )}
                  </div>
                  <div
                    className="flex size-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: 'var(--blooso-sand-light)' }}
                  >
                    <span
                      className="font-serif font-bold uppercase"
                      style={{ color: 'var(--blooso-text)' }}
                    >
                      {s.user.name.charAt(0)}
                    </span>
                  </div>
                  <span className="font-semibold" style={{ color: 'var(--blooso-text)' }}>
                    {s.user.name}
                  </span>

                  <input
                    type="radio"
                    name="staff"
                    className="sr-only"
                    checked={selectedStaffId === s.id}
                    onChange={() => setSelectedStaffId(s.id)}
                  />
                </label>
              ))}
            </div>

            <div className="mt-10">
              <button
                onClick={() => setStep('datetime')}
                className="w-full rounded-[10px] py-4 text-base font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: 'var(--blooso-rose)', color: '#fff' }}
              >
                Continue to Time
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Date & Time ── */}
        {step === 'datetime' && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <h2
              className="mb-6 text-xl font-bold"
              style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
            >
              Select Date & Time
            </h2>

            <div className="mb-8">
              <label
                className="mb-2 block text-sm font-semibold"
                style={{ color: 'var(--blooso-text)' }}
              >
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot(null);
                }}
                min={new Date().toISOString().slice(0, 10)}
                className="h-12 w-full max-w-sm rounded-[10px] border px-4 text-base outline-none transition-all focus:ring-2"
                style={{
                  borderColor: 'var(--blooso-border)',
                  backgroundColor: '#fff',
                  color: 'var(--blooso-text)',
                  // @ts-expect-error custom css prop
                  '--tw-ring-color': 'rgba(139,58,82,0.2)',
                }}
              />
            </div>

            {selectedDate && (
              <div>
                <label
                  className="mb-4 block text-sm font-semibold"
                  style={{ color: 'var(--blooso-text)' }}
                >
                  Available Times
                </label>
                {loadingSlots ? (
                  <div className="flex gap-3">
                    <div
                      className="h-10 w-24 animate-pulse rounded-full"
                      style={{ backgroundColor: 'var(--blooso-border-light)' }}
                    />
                    <div
                      className="h-10 w-24 animate-pulse rounded-full"
                      style={{ backgroundColor: 'var(--blooso-border-light)' }}
                    />
                    <div
                      className="h-10 w-24 animate-pulse rounded-full"
                      style={{ backgroundColor: 'var(--blooso-border-light)' }}
                    />
                  </div>
                ) : slots.length === 0 ? (
                  <div
                    className="rounded-[16px] border border-dashed py-10 text-center"
                    style={{ borderColor: 'var(--blooso-border)' }}
                  >
                    <p
                      className="text-sm font-medium"
                      style={{ color: 'var(--blooso-text-muted)' }}
                    >
                      No times available on this date. Please select another.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {slots.slice(0, 24).map((slot) => {
                      const isSelected = selectedSlot?.startTime === slot.startTime;
                      return (
                        <button
                          key={slot.startTime}
                          onClick={() => setSelectedSlot(slot)}
                          className={cn(
                            'rounded-full border px-5 py-2.5 text-sm font-semibold transition-all',
                            isSelected ? 'shadow-md scale-105' : 'hover:bg-black/5'
                          )}
                          style={{
                            backgroundColor: isSelected ? 'var(--blooso-text)' : 'transparent',
                            color: isSelected ? '#fff' : 'var(--blooso-text)',
                            borderColor: isSelected ? 'var(--blooso-text)' : 'var(--blooso-border)',
                          }}
                        >
                          {new Date(slot.startTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="mt-12">
              <button
                onClick={() => setStep('confirm')}
                disabled={!selectedSlot}
                className="w-full rounded-[10px] py-4 text-base font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: 'var(--blooso-rose)', color: '#fff' }}
              >
                Review & Confirm
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Confirm ── */}
        {step === 'confirm' && selectedSlot && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            {!token && (
              <div
                className="mb-8 flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium"
                style={{ backgroundColor: 'var(--blooso-sand-light)', color: 'var(--blooso-text)' }}
              >
                <span>Sign in to book faster next time.</span>
                <Link
                  href={`/login?redirect=/b/${slug}/book`}
                  className="font-bold hover:underline"
                  style={{ color: 'var(--blooso-rose)' }}
                >
                  Sign in
                </Link>
              </div>
            )}

            <div className="grid gap-10 md:grid-cols-2">
              {/* Receipt Area */}
              <div>
                <h2
                  className="mb-4 text-xl font-bold"
                  style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
                >
                  Booking Summary
                </h2>
                <div
                  className="rounded-[20px] p-6 shadow-sm"
                  style={{
                    backgroundColor: 'var(--blooso-bg-warm)',
                    border: '1px solid var(--blooso-border-light)',
                  }}
                >
                  <p className="mb-6 font-bold" style={{ color: 'var(--blooso-text)' }}>
                    {business.name}
                  </p>

                  <div className="mb-6 flex flex-col gap-2 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--blooso-text-muted)' }}>Date</span>
                      <span className="font-medium" style={{ color: 'var(--blooso-text)' }}>
                        {new Date(selectedSlot.startTime).toLocaleDateString(undefined, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--blooso-text-muted)' }}>Time</span>
                      <span className="font-medium" style={{ color: 'var(--blooso-text)' }}>
                        {new Date(selectedSlot.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div
                    className="mb-6 border-t pt-4"
                    style={{ borderColor: 'var(--blooso-border-light)' }}
                  >
                    <div className="flex flex-col gap-3">
                      {selectedServices.map((s) => (
                        <div key={s.id} className="flex justify-between text-sm">
                          <span style={{ color: 'var(--blooso-text)' }}>{s.name}</span>
                          <span className="font-medium" style={{ color: 'var(--blooso-text)' }}>
                            ${s.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className="flex justify-between border-t pt-4"
                    style={{ borderColor: 'var(--blooso-border-light)' }}
                  >
                    <span className="font-bold" style={{ color: 'var(--blooso-text)' }}>
                      Total
                    </span>
                    <span
                      className="font-serif text-xl font-bold"
                      style={{ color: 'var(--blooso-text)' }}
                    >
                      ${totalPrice}
                    </span>
                  </div>
                </div>
              </div>

              {/* Your Details */}
              <div>
                <h2
                  className="mb-4 text-xl font-bold"
                  style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
                >
                  Your Details
                </h2>

                <div className="flex flex-col gap-4">
                  <div>
                    <label
                      className="mb-1.5 block text-sm font-semibold"
                      style={{ color: 'var(--blooso-text)' }}
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Jane Doe"
                      className="h-12 w-full rounded-[10px] border px-4 text-sm outline-none transition-all focus:ring-2"
                      style={{
                        borderColor: 'var(--blooso-border)',
                        backgroundColor: '#fff',
                        color: 'var(--blooso-text)',
                        // @ts-expect-error custom css prop
                        '--tw-ring-color': 'rgba(139,58,82,0.2)',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      className="mb-1.5 block text-sm font-semibold"
                      style={{ color: 'var(--blooso-text)' }}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="h-12 w-full rounded-[10px] border px-4 text-sm outline-none transition-all focus:ring-2"
                      style={{
                        borderColor: 'var(--blooso-border)',
                        backgroundColor: '#fff',
                        color: 'var(--blooso-text)',
                        // @ts-expect-error custom css prop
                        '--tw-ring-color': 'rgba(139,58,82,0.2)',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      className="mb-1.5 block text-sm font-semibold"
                      style={{ color: 'var(--blooso-text)' }}
                    >
                      Phone Number{' '}
                      <span className="font-normal text-muted-foreground">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="h-12 w-full rounded-[10px] border px-4 text-sm outline-none transition-all focus:ring-2"
                      style={{
                        borderColor: 'var(--blooso-border)',
                        backgroundColor: '#fff',
                        color: 'var(--blooso-text)',
                        // @ts-expect-error custom css prop
                        '--tw-ring-color': 'rgba(139,58,82,0.2)',
                      }}
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={handleConfirm}
                    disabled={submitting || !guestName || !guestEmail || !token}
                    className="w-full rounded-[10px] py-4 text-base font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ backgroundColor: 'var(--blooso-rose)', color: '#fff' }}
                  >
                    {submitting ? 'Confirming...' : 'Confirm Appointment'}
                  </button>
                  <p
                    className="mt-4 text-center text-xs"
                    style={{ color: 'var(--blooso-text-subtle)' }}
                  >
                    By confirming, you agree to Blooso's Terms of Service and Cancellation Policy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 5: Success ── */}
        {step === 'success' && booking && (
          <div className="animate-in fade-in zoom-in-95 flex flex-col items-center justify-center py-12 text-center">
            <div
              className="mb-8 flex size-24 items-center justify-center rounded-full shadow-lg"
              style={{ backgroundColor: 'var(--blooso-text)', color: '#fff' }}
            >
              <Check className="size-10" />
            </div>

            <h2
              className="mb-4 text-3xl font-bold md:text-4xl"
              style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
            >
              Booking Confirmed!
            </h2>
            <p
              className="max-w-md text-base leading-relaxed"
              style={{ color: 'var(--blooso-text-muted)' }}
            >
              Your appointment at <strong>{business.name}</strong> is all set. We've sent a
              confirmation email to <strong>{guestEmail}</strong>.
            </p>

            <div className="mt-12 w-full max-w-sm space-y-4">
              {totalPrice > 0 && (
                <div
                  className="rounded-[16px] p-6 shadow-sm"
                  style={{ backgroundColor: '#fff', border: '1px solid var(--blooso-border)' }}
                >
                  <p
                    className="mb-4 text-sm font-medium"
                    style={{ color: 'var(--blooso-text-muted)' }}
                  >
                    Pre-pay now to save time
                  </p>
                  <button
                    onClick={handlePayWithCard}
                    disabled={paying}
                    className="flex w-full items-center justify-center gap-2 rounded-[10px] py-3.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                    style={{ backgroundColor: 'var(--blooso-rose)', color: '#fff' }}
                  >
                    <CreditCard className="size-4" />
                    {paying ? 'Redirecting to Stripe...' : `Pay $${totalPrice} securely`}
                  </button>
                </div>
              )}

              <Link
                href={`/b/${slug}`}
                className="inline-flex h-12 w-full items-center justify-center rounded-[10px] border text-sm font-semibold transition-colors hover:bg-black/5"
                style={{ borderColor: 'var(--blooso-border)', color: 'var(--blooso-text)' }}
              >
                Back to {business.name}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
