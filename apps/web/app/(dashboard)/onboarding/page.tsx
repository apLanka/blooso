'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import {
  createBusiness,
  createLocation,
  setBusinessHours,
  BUSINESS_CATEGORIES,
} from '@/lib/business-client';
import Image from 'next/image';
import Link from 'next/link';
import { Check, ChevronRight, MapPin, Clock, Store } from 'lucide-react';
import { cn } from '@/lib/utils';

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export default function OnboardingPage() {
  const { user, isLoading, getToken } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Business info
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  // Step 2: Location
  const [locName, setLocName] = useState('Main Location');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [phone, setPhone] = useState('');

  // Step 3: Hours
  const [hours, setHours] = useState(
    DAYS.map((d) => ({
      dayOfWeek: d.value,
      openTime: '09:00',
      closeTime: '17:00',
      isClosed: d.value === 0,
    }))
  );

  const token = getToken();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F7F5]">
        <div
          className="size-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'var(--blooso-border)', borderTopColor: 'var(--blooso-rose)' }}
        />
      </div>
    );
  }

  if (!user || !token) {
    router.replace('/login');
    return null;
  }

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError('Business name is required');
    if (!category) return setError('Category is required');
    setStep(2);
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!address.trim()) return setError('Address is required');
    if (!country.trim()) return setError('Country is required');
    setStep(3);
  };

  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const business = await createBusiness(token, {
        name: name.trim(),
        category,
        description: description.trim() || undefined,
      });

      const location = await createLocation(token, business.id, {
        name: locName.trim(),
        address: address.trim(),
        city: city.trim() || undefined,
        country: country.trim(),
        timezone: timezone || 'UTC',
        phone: phone.trim() || undefined,
      });

      await setBusinessHours(token, business.id, location.id, hours);

      setStep(4);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'body' in err
          ? (err as any).body?.message
          : 'Something went wrong';
      setError(typeof msg === 'string' ? msg : 'Failed to create business');
    } finally {
      setLoading(false);
    }
  };

  const updateHours = (dayIndex: number, field: string, value: string | boolean) => {
    setHours((prev) => prev.map((h, i) => (i === dayIndex ? { ...h, [field]: value } : h)));
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // SUCCESS STATE (Step 4)
  // ─────────────────────────────────────────────────────────────────────────────
  if (step === 4) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9F7F5] p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="mb-8 flex size-24 items-center justify-center rounded-full bg-green-100 shadow-sm">
          <Check className="size-10 text-green-600" />
        </div>
        <h1
          className="mb-4 text-4xl font-bold tracking-tight md:text-5xl"
          style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
        >
          Welcome to Blooso
        </h1>
        <p className="mb-10 max-w-md text-lg" style={{ color: 'var(--blooso-text-muted)' }}>
          Your business <strong>{name}</strong> has been created successfully. You're ready to start
          managing your schedule and growing your clientele.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
          style={{ backgroundColor: 'var(--blooso-rose)' }}
        >
          Go to my Dashboard
          <ChevronRight className="size-4" />
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ONBOARDING FORM LAYOUT
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen">
      {/* ── Left Side: Imagery ── */}
      <div
        className="hidden w-1/2 flex-col justify-between p-12 lg:flex relative overflow-hidden"
        style={{ backgroundColor: 'var(--blooso-bg-warm)' }}
      >
        <Image
          src="/onboarding/lifestyle.png"
          alt="Salon lifestyle"
          fill
          className="object-cover absolute inset-0 z-0"
          priority
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="relative z-20">
          <Link href="/" className="font-serif text-3xl font-bold tracking-tight text-white">
            Blooso<span style={{ color: 'var(--blooso-rose)' }}>.</span>
          </Link>
        </div>

        <div className="relative z-20 max-w-md mb-8">
          <h2 className="mb-6 font-serif text-4xl font-bold leading-tight text-white">
            Build the business you've always envisioned.
          </h2>
          <p className="text-lg text-white/80">
            Set up your profile, locations, and hours in less than three minutes.
          </p>
        </div>
      </div>

      {/* ── Right Side: Form Wizard ── */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-white">
        {/* Mobile Header */}
        <div
          className="flex items-center justify-between border-b p-6 lg:hidden"
          style={{ borderColor: 'var(--blooso-border-light)' }}
        >
          <Link
            href="/"
            className="font-serif text-xl font-bold tracking-tight"
            style={{ color: 'var(--blooso-text)' }}
          >
            Blooso<span style={{ color: 'var(--blooso-rose)' }}>.</span>
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center p-8 py-12 md:p-12">
          {/* Progress Indicators */}
          <div className="mb-12 flex items-center justify-between">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    'flex size-10 items-center justify-center rounded-full text-sm font-bold transition-colors',
                    step >= num ? 'text-white' : 'text-black/30'
                  )}
                  style={{
                    backgroundColor:
                      step >= num ? 'var(--blooso-rose)' : 'var(--blooso-border-light)',
                    boxShadow: step === num ? '0 0 0 4px var(--blooso-sand-light)' : 'none',
                  }}
                >
                  {step > num ? <Check className="size-5" /> : num}
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider hidden sm:block"
                  style={{
                    color: step >= num ? 'var(--blooso-text)' : 'var(--blooso-text-subtle)',
                  }}
                >
                  {num === 1 ? 'Details' : num === 2 ? 'Location' : 'Hours'}
                </span>
              </div>
            ))}
            {/* Connecting Lines */}
            <div
              className="absolute left-[30%] right-[30%] top-[4.2rem] h-[2px] -z-10 hidden sm:block"
              style={{ backgroundColor: 'var(--blooso-border-light)' }}
            />
          </div>

          {error && (
            <div className="mb-6 rounded-[12px] bg-red-50 p-4 text-sm font-semibold text-red-600 border border-red-100">
              {error}
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <form
              onSubmit={handleStep1}
              className="animate-in slide-in-from-right-4 fade-in duration-300"
            >
              <div className="mb-8 flex items-center gap-3">
                <div
                  className="flex size-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'var(--blooso-bg-warm)' }}
                >
                  <Store className="size-5" style={{ color: 'var(--blooso-rose)' }} />
                </div>
                <div>
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
                  >
                    Business details
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
                    What's the name of your salon or spa?
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label
                    className="mb-2 block text-sm font-bold"
                    style={{ color: 'var(--blooso-text)' }}
                  >
                    Business Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-[12px] border px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                    style={{
                      borderColor: 'var(--blooso-border)',
                      backgroundColor: '#fff',
                      outlineColor: 'var(--blooso-rose)',
                    }}
                    placeholder="e.g. Avenir Studio"
                  />
                </div>
                <div>
                  <label
                    className="mb-2 block text-sm font-bold"
                    style={{ color: 'var(--blooso-text)' }}
                  >
                    Primary Category
                  </label>
                  <select
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-[12px] border px-4 py-3 text-sm outline-none transition-all focus:ring-2 appearance-none bg-white"
                    style={{
                      borderColor: 'var(--blooso-border)',
                      outlineColor: 'var(--blooso-rose)',
                    }}
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {BUSINESS_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="mb-2 block text-sm font-bold"
                    style={{ color: 'var(--blooso-text)' }}
                  >
                    Description{' '}
                    <span className="text-normal font-normal text-muted-foreground">
                      (Optional)
                    </span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full resize-none rounded-[12px] border px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                    style={{
                      borderColor: 'var(--blooso-border)',
                      outlineColor: 'var(--blooso-rose)',
                    }}
                    placeholder="Brief description of your business and services"
                    rows={4}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-10 flex w-full items-center justify-center gap-2 rounded-[12px] py-4 text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: 'var(--blooso-rose)' }}
              >
                Continue to Location
                <ChevronRight className="size-4" />
              </button>
            </form>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form
              onSubmit={handleStep2}
              className="animate-in slide-in-from-right-4 fade-in duration-300"
            >
              <div className="mb-8 flex items-center gap-3">
                <div
                  className="flex size-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'var(--blooso-bg-warm)' }}
                >
                  <MapPin className="size-5" style={{ color: 'var(--blooso-rose)' }} />
                </div>
                <div>
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
                  >
                    Primary location
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
                    Where can clients find you?
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label
                    className="mb-2 block text-sm font-bold"
                    style={{ color: 'var(--blooso-text)' }}
                  >
                    Street Address
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-[12px] border px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                    style={{
                      borderColor: 'var(--blooso-border)',
                      outlineColor: 'var(--blooso-rose)',
                    }}
                    placeholder="123 Salon Street, Suite 100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="mb-2 block text-sm font-bold"
                      style={{ color: 'var(--blooso-text)' }}
                    >
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-[12px] border px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                      style={{
                        borderColor: 'var(--blooso-border)',
                        outlineColor: 'var(--blooso-rose)',
                      }}
                      placeholder="City name"
                    />
                  </div>
                  <div>
                    <label
                      className="mb-2 block text-sm font-bold"
                      style={{ color: 'var(--blooso-text)' }}
                    >
                      Country
                    </label>
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full rounded-[12px] border px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                      style={{
                        borderColor: 'var(--blooso-border)',
                        outlineColor: 'var(--blooso-rose)',
                      }}
                      placeholder="e.g. USA"
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="mb-2 block text-sm font-bold"
                    style={{ color: 'var(--blooso-text)' }}
                  >
                    Contact Phone{' '}
                    <span className="text-normal font-normal text-muted-foreground">
                      (Optional)
                    </span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-[12px] border px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                    style={{
                      borderColor: 'var(--blooso-border)',
                      outlineColor: 'var(--blooso-rose)',
                    }}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-[12px] px-6 py-4 text-sm font-bold transition-colors hover:bg-black/5"
                  style={{ color: 'var(--blooso-text)', border: '1px solid var(--blooso-border)' }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex flex-1 items-center justify-center gap-2 rounded-[12px] py-4 text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
                  style={{ backgroundColor: 'var(--blooso-rose)' }}
                >
                  Continue to Hours
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <form
              onSubmit={handleStep3}
              className="animate-in slide-in-from-right-4 fade-in duration-300"
            >
              <div className="mb-8 flex items-center gap-3">
                <div
                  className="flex size-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'var(--blooso-bg-warm)' }}
                >
                  <Clock className="size-5" style={{ color: 'var(--blooso-rose)' }} />
                </div>
                <div>
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
                  >
                    Business hours
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
                    When are you open for bookings?
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {DAYS.map((day) => {
                  const h = hours.find((x) => x.dayOfWeek === day.value)!;
                  return (
                    <div
                      key={day.value}
                      className={cn(
                        'flex flex-col sm:flex-row sm:items-center justify-between rounded-[16px] p-4 transition-colors',
                        h.isClosed ? 'bg-black/5' : 'bg-white'
                      )}
                      style={{ border: '1px solid var(--blooso-border-light)' }}
                    >
                      <div className="flex items-center justify-between mb-3 sm:mb-0 sm:w-32">
                        <span
                          className={cn(
                            'font-semibold',
                            h.isClosed ? 'text-black/40' : 'text-black'
                          )}
                        >
                          {day.label}
                        </span>

                        {/* Custom Toggle */}
                        <button
                          type="button"
                          onClick={() => updateHours(day.value, 'isClosed', !h.isClosed)}
                          className={cn(
                            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors sm:hidden',
                            h.isClosed ? 'bg-black/20' : 'bg-[#8B3A52]'
                          )}
                        >
                          <span
                            className={cn(
                              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                              h.isClosed ? 'translate-x-1' : 'translate-x-6'
                            )}
                          />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => updateHours(day.value, 'isClosed', !h.isClosed)}
                          className={cn(
                            'relative hidden sm:inline-flex h-6 w-11 items-center rounded-full transition-colors mr-2',
                            h.isClosed ? 'bg-black/20' : 'bg-[#8B3A52]'
                          )}
                        >
                          <span
                            className={cn(
                              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                              h.isClosed ? 'translate-x-1' : 'translate-x-6'
                            )}
                          />
                        </button>

                        {!h.isClosed ? (
                          <>
                            <input
                              type="time"
                              value={h.openTime}
                              onChange={(e) =>
                                updateHours(day.value, 'openTime', e.target.value.slice(0, 5))
                              }
                              className="rounded-[8px] bg-black/5 px-3 py-1.5 text-sm font-semibold outline-none"
                            />
                            <span className="text-sm font-medium text-black/40">to</span>
                            <input
                              type="time"
                              value={h.closeTime}
                              onChange={(e) =>
                                updateHours(day.value, 'closeTime', e.target.value.slice(0, 5))
                              }
                              className="rounded-[8px] bg-black/5 px-3 py-1.5 text-sm font-semibold outline-none"
                            />
                          </>
                        ) : (
                          <span className="text-sm font-bold uppercase tracking-wider text-black/40 flex-1 sm:text-right">
                            Closed
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-10 flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-[12px] px-6 py-4 text-sm font-bold transition-colors hover:bg-black/5"
                  style={{ color: 'var(--blooso-text)', border: '1px solid var(--blooso-border)' }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-[12px] py-4 text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                  style={{ backgroundColor: 'var(--blooso-rose)' }}
                >
                  {loading ? (
                    <div className="size-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  ) : (
                    'Complete Setup'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
