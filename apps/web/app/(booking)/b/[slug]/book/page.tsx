'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBusinessBySlug, type BusinessPublicProfile } from '@/lib/business-client';
import { getAvailability } from '@/lib/availability-client';
import { createBooking } from '@/lib/booking-client';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

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
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
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
          : 'Booking failed'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const staff = business.staffMembers ?? [];

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
      </div>

      <h2 className="mb-6 text-2xl font-bold">Book at {business.name}</h2>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {step === 'services' && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold">Select services</h3>
            <div className="mt-4 space-y-2">
              {business.serviceCategories?.map((cat) =>
                cat.services.map((svc) => (
                  <label
                    key={svc.id}
                    className="flex cursor-pointer items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedServices.some((s) => s.id === svc.id)}
                        onChange={() => toggleService(svc)}
                      />
                      <span className="font-medium">{svc.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {svc.durationMinutes} min · ${svc.price}
                    </span>
                  </label>
                ))
              )}
            </div>
            {selectedServices.length > 0 && (
              <div className="mt-4 flex justify-between border-t pt-4">
                <p className="text-muted-foreground">
                  {totalDuration} min total · ${totalPrice}
                </p>
                <Button onClick={() => setStep('staff')}>Continue</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 'staff' && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold">Choose staff (optional)</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Select a preferred staff or any available
            </p>
            <div className="mt-4 space-y-2">
              <label className="flex cursor-pointer items-center justify-between rounded-lg border p-3 hover:bg-muted/50">
                <input
                  type="radio"
                  name="staff"
                  checked={selectedStaffId === 'any'}
                  onChange={() => setSelectedStaffId('any')}
                />
                <span className="ml-3">Any available</span>
              </label>
              {staff.map((s) => (
                <label
                  key={s.id}
                  className="flex cursor-pointer items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
                >
                  <input
                    type="radio"
                    name="staff"
                    checked={selectedStaffId === s.id}
                    onChange={() => setSelectedStaffId(s.id)}
                  />
                  <span className="ml-3">{s.user.name}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => setStep('services')}>
                Back
              </Button>
              <Button onClick={() => setStep('datetime')}>Continue</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'datetime' && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold">Select date & time</h3>
            <div className="mt-4">
              <Label>Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot(null);
                }}
                min={new Date().toISOString().slice(0, 10)}
              />
            </div>
            {selectedDate && (
              <div className="mt-4">
                <Label>Available times</Label>
                {loadingSlots ? (
                  <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
                ) : slots.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    No slots available. Try another date.
                  </p>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {slots.slice(0, 24).map((slot) => (
                      <Button
                        key={slot.startTime}
                        variant={selectedSlot?.startTime === slot.startTime ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {new Date(slot.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => setStep('staff')}>
                Back
              </Button>
              <Button onClick={() => setStep('confirm')} disabled={!selectedSlot}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'confirm' && selectedSlot && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold">Confirm booking</h3>
            <div className="mt-4 space-y-2">
              <p>
                <span className="text-muted-foreground">Services:</span>{' '}
                {selectedServices.map((s) => s.name).join(', ')}
              </p>
              <p>
                <span className="text-muted-foreground">Date:</span>{' '}
                {new Date(selectedSlot.startTime).toLocaleDateString()}
              </p>
              <p>
                <span className="text-muted-foreground">Time:</span>{' '}
                {new Date(selectedSlot.startTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p>
                <span className="text-muted-foreground">Total:</span> ${totalPrice}
              </p>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <Label>Your name</Label>
                <Input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => setStep('datetime')}>
                Back
              </Button>
              <Button onClick={handleConfirm} disabled={submitting || !guestName || !guestEmail}>
                {submitting ? 'Booking...' : 'Confirm booking'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'success' && booking && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold">Booking confirmed!</h3>
              <p className="mt-2 text-muted-foreground">
                Your appointment is confirmed. We&apos;ll send a reminder before your visit.
              </p>
              <div className="mt-6 flex gap-2">
                <Button onClick={() => router.push(`/b/${slug}/book`)}>Book again</Button>
                <Button variant="outline" onClick={() => router.push(`/b/${slug}`)}>
                  Back to {business.name}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!token && step !== 'success' && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <a href={`/login?redirect=/b/${slug}/book`} className="underline">
            Sign in
          </a>{' '}
          to complete your booking.
        </p>
      )}
    </div>
  );
}
