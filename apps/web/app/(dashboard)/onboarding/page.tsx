'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { submitApplication, getMyApplication } from '@/lib/application-client';
import { BUSINESS_CATEGORIES } from '@/lib/business-client';
import Image from 'next/image';
import Link from 'next/link';
import { Check, ChevronRight, MapPin, Store, Clock, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OnboardingPage() {
  const { user, isLoading, getToken } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [existingApplication, setExistingApplication] = useState<{
    status: string;
    rejectReason?: string | null;
  } | null>(null);
  const [checkingApplication, setCheckingApplication] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');

  const token = getToken();

  useEffect(() => {
    if (!token || !user) return;
    getMyApplication(token)
      .then((app) => {
        if (app) {
          setExistingApplication({ status: app.status, rejectReason: app.rejectReason });
        }
      })
      .catch(() => {})
      .finally(() => setCheckingApplication(false));
  }, [token, user]);

  if (isLoading || checkingApplication) {
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

  // Show existing application status
  if (existingApplication) {
    if (existingApplication.status === 'approved') {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9F7F5] p-6 text-center animate-in fade-in zoom-in duration-500">
          <div className="mb-8 flex size-24 items-center justify-center rounded-full bg-green-100 shadow-sm">
            <Check className="size-10 text-green-600" />
          </div>
          <h1
            className="mb-4 text-4xl font-bold tracking-tight md:text-5xl"
            style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
          >
            Application Approved!
          </h1>
          <p className="mb-10 max-w-md text-lg" style={{ color: 'var(--blooso-text-muted)' }}>
            Your business application has been approved. You now have access to the business
            dashboard.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
            style={{ backgroundColor: 'var(--blooso-rose)' }}
          >
            Go to Dashboard
            <ChevronRight className="size-4" />
          </button>
        </div>
      );
    }

    if (existingApplication.status === 'pending') {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9F7F5] p-6 text-center animate-in fade-in zoom-in duration-500">
          <div className="mb-8 flex size-24 items-center justify-center rounded-full bg-yellow-100 shadow-sm">
            <Clock className="size-10 text-yellow-600" />
          </div>
          <h1
            className="mb-4 text-4xl font-bold tracking-tight md:text-5xl"
            style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
          >
            Application Pending
          </h1>
          <p className="mb-10 max-w-md text-lg" style={{ color: 'var(--blooso-text-muted)' }}>
            Your business application is being reviewed by our team. We'll notify you once it's
            approved.
          </p>
          <button
            onClick={() => router.push('/my-bookings')}
            className="flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold transition-all hover:scale-105 active:scale-95"
            style={{
              color: 'var(--blooso-text)',
              border: '1px solid var(--blooso-border)',
              backgroundColor: '#fff',
            }}
          >
            Go to Client Dashboard
            <ChevronRight className="size-4" />
          </button>
        </div>
      );
    }

    if (existingApplication.status === 'rejected') {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9F7F5] p-6 text-center animate-in fade-in zoom-in duration-500">
          <div className="mb-8 flex size-24 items-center justify-center rounded-full bg-red-100 shadow-sm">
            <FileText className="size-10 text-red-600" />
          </div>
          <h1
            className="mb-4 text-4xl font-bold tracking-tight md:text-5xl"
            style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
          >
            Application Rejected
          </h1>
          <p className="mb-4 max-w-md text-lg" style={{ color: 'var(--blooso-text-muted)' }}>
            Your previous business application was not approved.
          </p>
          {existingApplication.rejectReason && (
            <p
              className="mb-8 max-w-md text-sm rounded-[12px] bg-red-50 p-4 border border-red-100"
              style={{ color: '#b91c1c' }}
            >
              Reason: {existingApplication.rejectReason}
            </p>
          )}
          <button
            onClick={() => {
              setExistingApplication(null);
              setStep(1);
            }}
            className="flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
            style={{ backgroundColor: 'var(--blooso-rose)' }}
          >
            Apply Again
            <ChevronRight className="size-4" />
          </button>
        </div>
      );
    }
  }

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError('Business name is required');
    if (!category) return setError('Category is required');
    setStep(2);
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!address.trim()) return setError('Address is required');
    if (!country.trim()) return setError('Country is required');
    setLoading(true);

    try {
      await submitApplication(token, {
        name: name.trim(),
        category,
        description: description.trim() || undefined,
        address: address.trim(),
        city: city.trim() || undefined,
        country: country.trim(),
        phone: phone.trim() || undefined,
      });
      setStep(3);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'body' in err
          ? (err as any).body?.message
          : 'Something went wrong';
      setError(typeof msg === 'string' ? msg : 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // SUCCESS STATE (Step 3)
  // ─────────────────────────────────────────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9F7F5] p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="mb-8 flex size-24 items-center justify-center rounded-full bg-green-100 shadow-sm">
          <Check className="size-10 text-green-600" />
        </div>
        <h1
          className="mb-4 text-4xl font-bold tracking-tight md:text-5xl"
          style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
        >
          Application Submitted!
        </h1>
        <p className="mb-10 max-w-md text-lg" style={{ color: 'var(--blooso-text-muted)' }}>
          Your business application for <strong>{name}</strong> has been submitted successfully. Our
          team will review it shortly. You'll receive access to the business dashboard once
          approved.
        </p>
        <button
          onClick={() => router.push('/my-bookings')}
          className="flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold transition-all hover:scale-105 active:scale-95"
          style={{
            color: 'var(--blooso-text)',
            border: '1px solid var(--blooso-border)',
            backgroundColor: '#fff',
          }}
        >
          Go to Client Dashboard
          <ChevronRight className="size-4" />
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // APPLICATION FORM LAYOUT
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
            Apply to list your business on Blooso and reach thousands of new clients.
          </p>
        </div>
      </div>

      {/* ── Right Side: Form ── */}
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
            {[1, 2].map((num) => (
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
                  {num === 1 ? 'Details' : 'Location'}
                </span>
              </div>
            ))}
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
                    Tell us about your salon or spa
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
                    Business location
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
                  disabled={loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-[12px] py-4 text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                  style={{ backgroundColor: 'var(--blooso-rose)' }}
                >
                  {loading ? (
                    <div className="size-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  ) : (
                    'Submit Application'
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
