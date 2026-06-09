import Link from 'next/link';
import Image from 'next/image';
import { Check, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const FEATURES = [
  'Online booking calendar — 24/7',
  'Automated appointment reminders',
  'Client management & history',
  'Stripe payments built-in',
];

export function ForBusinesses() {
  return (
    <section
      className="blooso-section-pad"
      style={{ backgroundColor: 'var(--blooso-bg-business)' }}
      aria-labelledby="for-businesses-heading"
    >
      <div className="blooso-container">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* ── Left: Text ── */}
          <div>
            {/* Badge label */}
            <div
              className="mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
              style={{
                backgroundColor: 'var(--blooso-rose-muted)',
                color: 'var(--blooso-rose)',
              }}
            >
              <span
                className="inline-block size-1.5 rounded-full"
                style={{ backgroundColor: 'var(--blooso-rose)' }}
              />
              For Business Owners
            </div>

            <h2
              id="for-businesses-heading"
              className="text-3xl font-bold tracking-tight md:text-4xl"
              style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
            >
              Grow Your Bookings.
              <br />
              Effortlessly.
            </h2>

            <p
              className="mt-5 max-w-md text-base leading-relaxed"
              style={{ color: 'var(--blooso-text-muted)' }}
            >
              Join hundreds of salons and spas using Blooso to manage appointments, reduce no-shows,
              and attract new clients 24/7.
            </p>

            {/* Feature list */}
            <ul className="mt-8 space-y-3.5">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <div
                    className="flex size-5 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: 'var(--blooso-rose)', color: '#fff' }}
                  >
                    <Check className="size-3" strokeWidth={3} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--blooso-text)' }}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Link
              id="business-list-cta-btn"
              href="/onboarding"
              className={cn(
                'mt-10 inline-flex h-12 items-center justify-center gap-2 rounded-[10px] px-8 text-sm font-semibold',
                'transition-all hover:opacity-90 active:scale-[0.98]'
              )}
              style={{ backgroundColor: 'var(--blooso-rose)', color: '#fff' }}
            >
              List Your Business
              <ArrowRight className="size-4" />
            </Link>

            {/* Sub-note */}
            <p className="mt-4 text-xs" style={{ color: 'var(--blooso-text-subtle)' }}>
              Free to get started · No credit card required
            </p>
          </div>

          {/* ── Right: Dashboard mockup ── */}
          <div className="relative">
            {/* Decorative warm blob */}
            <div
              className="absolute -left-6 -top-6 h-40 w-40 rounded-full blur-3xl"
              style={{ backgroundColor: 'var(--blooso-sand-light)', opacity: 0.5 }}
              aria-hidden
            />

            <div
              className="relative overflow-hidden rounded-[24px] shadow-2xl shadow-black/10"
              style={{ border: '1px solid var(--blooso-border-light)' }}
            >
              <Image
                src="/landing/business_dashboard_mockup_1779629171266.png"
                alt="Blooso business dashboard showing appointment calendar with bookings"
                width={640}
                height={520}
                className="w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Floating stat */}
            <div
              className="absolute -right-4 bottom-8 z-10 rounded-2xl px-5 py-4"
              style={{
                backgroundColor: 'var(--blooso-bg)',
                border: '1px solid var(--blooso-border-light)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              }}
            >
              <p
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: 'var(--blooso-text-subtle)' }}
              >
                Monthly bookings
              </p>
              <p
                className="mt-1 text-2xl font-bold"
                style={{ color: 'var(--blooso-rose)', fontFamily: 'var(--font-serif)' }}
              >
                +42%
              </p>
              <p className="text-xs" style={{ color: 'var(--blooso-text-subtle)' }}>
                avg. business growth
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
