'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBusinessBySlug, type BusinessPublicProfile } from '@/lib/business-client';
import { getReviews, type Review } from '@/lib/review-client';
import { MapPin, Clock, Star, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function BusinessProfilePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [business, setBusiness] = useState<BusinessPublicProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getBusinessBySlug(slug)
      .then(setBusiness)
      .catch(() => setBusiness(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!business?.id) return;
    getReviews(business.id, { limit: 10 })
      .then((r) => setReviews(r.data))
      .catch(() => setReviews([]));
  }, [business?.id]);

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

  if (!business) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h2
          className="text-2xl font-bold"
          style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
        >
          Business not found
        </h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
          The page you are looking for does not exist or has been removed.
        </p>
        <Link
          href="/search"
          className="mt-6 rounded-[10px] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--blooso-rose)' }}
        >
          Back to Search
        </Link>
      </div>
    );
  }

  const location = business.locations?.[0];
  const activeHours = location?.businessHours?.filter((h) => !h.isClosed) || [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="animate-fade-in relative pb-32 pt-24">
      {/* ── Top Navigation / Back ── */}
      <div className="blooso-container mx-auto px-6 py-6">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: 'var(--blooso-text-muted)' }}
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          <span className="group-hover:text-black">Back to results</span>
        </button>
      </div>

      <div className="blooso-container mx-auto grid max-w-6xl grid-cols-1 items-start gap-12 px-6 lg:grid-cols-12">
        {/* ── Main Content Column (Left) ── */}
        <div className="flex flex-col gap-12 lg:col-span-8">
          {/* Header Section */}
          <section className="flex flex-col md:flex-row md:items-end gap-6">
            {business.logoUrl ? (
              <div
                className="size-28 shrink-0 overflow-hidden rounded-[24px] shadow-sm md:size-36"
                style={{ border: '1px solid var(--blooso-border-light)' }}
              >
                <img
                  src={business.logoUrl}
                  alt={business.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div
                className="flex size-28 shrink-0 items-center justify-center rounded-[24px] shadow-sm md:size-36"
                style={{
                  background:
                    'linear-gradient(135deg, var(--blooso-sand-light), var(--blooso-bg-warmer))',
                  border: '1px solid var(--blooso-border-light)',
                }}
              >
                <span
                  className="text-5xl font-bold uppercase"
                  style={{ color: 'var(--blooso-sand)', fontFamily: 'var(--font-serif)' }}
                >
                  {business.name.charAt(0)}
                </span>
              </div>
            )}

            <div className="flex-1 pb-2">
              <div
                className="mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold capitalize tracking-wide"
                style={{
                  backgroundColor: 'var(--blooso-bg-warm)',
                  color: 'var(--blooso-text)',
                  border: '1px solid var(--blooso-border-light)',
                }}
              >
                {business.category.replace(/_/g, ' ')}
              </div>
              <h1
                className="text-4xl font-bold tracking-tight md:text-5xl"
                style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
              >
                {business.name}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                {(business.avgRating ?? 0) > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold" style={{ color: 'var(--blooso-text)' }}>
                      {business.avgRating?.toFixed(1)}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--blooso-text-subtle)' }}>
                      ({business.reviewCount ?? 0} reviews)
                    </span>
                  </div>
                )}
                {location && (
                  <div
                    className="flex items-center gap-1.5 text-sm"
                    style={{ color: 'var(--blooso-text-muted)' }}
                  >
                    <MapPin className="size-4" style={{ color: 'var(--blooso-text-subtle)' }} />
                    {location.city}
                    {location.state ? `, ${location.state}` : ''}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* About Section */}
          {business.description && (
            <section>
              <h2
                className="mb-4 text-2xl font-bold"
                style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
              >
                About
              </h2>
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--blooso-text-muted)' }}
              >
                {business.description}
              </p>
            </section>
          )}

          {/* Services Menu */}
          <section>
            <h2
              className="mb-6 text-2xl font-bold"
              style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
            >
              Service Menu
            </h2>
            <div className="flex flex-col gap-10">
              {business.serviceCategories?.map((cat) => (
                <div key={cat.id}>
                  <h3
                    className="mb-4 text-lg font-bold tracking-tight"
                    style={{ color: 'var(--blooso-text)' }}
                  >
                    {cat.name}
                  </h3>
                  <div className="flex flex-col">
                    {cat.services.map((svc) => (
                      <div
                        key={svc.id}
                        className="group flex items-center justify-between border-b py-4 last:border-0 transition-colors hover:bg-black/[0.02]"
                        style={{ borderColor: 'var(--blooso-border-light)' }}
                      >
                        <div className="pr-4">
                          <p className="font-semibold" style={{ color: 'var(--blooso-text)' }}>
                            {svc.name}
                          </p>
                          <p
                            className="mt-1 text-sm"
                            style={{ color: 'var(--blooso-text-subtle)' }}
                          >
                            {svc.durationMinutes} minutes
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p
                            className="font-serif text-lg font-bold"
                            style={{ color: 'var(--blooso-text)' }}
                          >
                            ${svc.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <section>
              <h2
                className="mb-6 text-2xl font-bold"
                style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
              >
                Client Reviews
              </h2>
              <div className="flex flex-col gap-6">
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-[16px] p-6"
                    style={{
                      backgroundColor: 'var(--blooso-bg-warm)',
                      border: '1px solid var(--blooso-border-light)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex size-10 items-center justify-center rounded-full"
                          style={{ backgroundColor: 'var(--blooso-sand-light)' }}
                        >
                          <span
                            className="font-serif font-bold uppercase"
                            style={{ color: 'var(--blooso-text)' }}
                          >
                            {(r.clientName ?? 'A').charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: 'var(--blooso-text)' }}>
                            {r.clientName ?? 'Anonymous'}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--blooso-text-subtle)' }}>
                            {new Date(r.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`size-3.5 ${
                              i <= r.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-black/5 text-black/5'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {r.comment && (
                      <p
                        className="mt-4 text-sm leading-relaxed"
                        style={{ color: 'var(--blooso-text-muted)' }}
                      >
                        "{r.comment}"
                      </p>
                    )}
                    {r.businessReply && (
                      <div
                        className="mt-4 rounded-[8px] p-4"
                        style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}
                      >
                        <p
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: 'var(--blooso-rose)' }}
                        >
                          Owner Reply
                        </p>
                        <p
                          className="mt-1 text-sm italic"
                          style={{ color: 'var(--blooso-text-muted)' }}
                        >
                          {r.businessReply}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Sticky Sidebar (Right) ── */}
        <div className="lg:col-span-4">
          <div className="sticky top-[100px] flex flex-col gap-6">
            {/* Booking CTA Card */}
            <div
              className="rounded-[24px] p-6 shadow-xl"
              style={{ backgroundColor: '#fff', border: '1px solid var(--blooso-border)' }}
            >
              <h3
                className="mb-2 text-xl font-bold"
                style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
              >
                Ready to book?
              </h3>
              <p className="mb-6 text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
                Select your services and preferred time instantly.
              </p>
              <button
                onClick={() => router.push(`/b/${slug}/book`)}
                className={cn(
                  'w-full rounded-[10px] py-3.5 text-base font-semibold transition-all shadow-sm',
                  'hover:opacity-90 active:scale-[0.98]'
                )}
                style={{ backgroundColor: 'var(--blooso-rose)', color: '#fff' }}
              >
                Book Appointment
              </button>
            </div>

            {/* Location & Hours Card */}
            {(location || activeHours.length > 0) && (
              <div
                className="rounded-[24px] p-6"
                style={{
                  backgroundColor: 'var(--blooso-bg-warm)',
                  border: '1px solid var(--blooso-border-light)',
                }}
              >
                {location && (
                  <div className="mb-6">
                    <h4
                      className="mb-3 text-sm font-bold uppercase tracking-wider"
                      style={{ color: 'var(--blooso-text-subtle)' }}
                    >
                      Location
                    </h4>
                    <p
                      className="text-sm font-medium leading-relaxed"
                      style={{ color: 'var(--blooso-text)' }}
                    >
                      {location.address}
                      <br />
                      {location.city}
                      {location.state ? `, ${location.state}` : ''}
                    </p>
                  </div>
                )}

                {activeHours.length > 0 && (
                  <div>
                    <h4
                      className="mb-3 text-sm font-bold uppercase tracking-wider"
                      style={{ color: 'var(--blooso-text-subtle)' }}
                    >
                      Hours
                    </h4>
                    <div className="flex flex-col gap-2">
                      {activeHours.map((h) => (
                        <div key={h.id} className="flex justify-between text-sm">
                          <span style={{ color: 'var(--blooso-text-muted)' }}>
                            {days[h.dayOfWeek]}
                          </span>
                          <span className="font-medium" style={{ color: 'var(--blooso-text)' }}>
                            {h.openTime} - {h.closeTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
