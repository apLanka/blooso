'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, ArrowRight } from 'lucide-react';
import { HeroSearchBar } from './hero-search-bar';
import { cn } from '@/lib/utils';

export function Hero() {
  return (
    <section
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: 'var(--blooso-bg)' }}
      aria-label="Hero"
    >
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-0 px-6 lg:grid-cols-2 lg:gap-16">
        {/* ── Left: Text content ── */}
        <div className="relative z-10 flex flex-col items-start pb-8 pt-28 lg:pb-16 lg:pt-0">
          {/* Badge */}
          <div
            className="mb-6 inline-flex animate-fade-up items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{
              backgroundColor: 'var(--blooso-rose-muted)',
              color: 'var(--blooso-rose)',
              animationDelay: '0ms',
            }}
          >
            <span
              className="inline-block size-1.5 rounded-full"
              style={{ backgroundColor: 'var(--blooso-rose)' }}
            />
            Premium Booking Platform
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-up text-[2.6rem] font-bold leading-[1.12] tracking-tight sm:text-5xl md:text-6xl"
            style={{
              color: 'var(--blooso-text)',
              fontFamily: 'var(--font-serif)',
              animationDelay: '80ms',
            }}
          >
            Book Your Perfect
            <br />
            <span style={{ color: 'var(--blooso-rose)' }}>Appointment.</span>
            <br />
            Anytime.
          </h1>

          {/* Subheadline */}
          <p
            className="mt-5 max-w-md animate-fade-up text-base leading-relaxed md:text-lg"
            style={{ color: 'var(--blooso-text-muted)', animationDelay: '160ms' }}
          >
            Discover and book beauty &amp; wellness services near you — salons, spas, barbershops,
            and more — in seconds.
          </p>

          {/* Search bar */}
          <div className="mt-8 w-full max-w-lg animate-fade-up" style={{ animationDelay: '240ms' }}>
            <HeroSearchBar />
          </div>

          {/* CTAs */}
          <div
            className="mt-5 flex animate-fade-up flex-col gap-3 sm:flex-row"
            style={{ animationDelay: '300ms' }}
          >
            <Link
              id="hero-find-service-btn"
              href="/search"
              className={cn(
                'group inline-flex h-12 items-center justify-center gap-2 rounded-[10px] px-7 text-sm font-semibold',
                'transition-all hover:opacity-90 active:scale-[0.98]'
              )}
              style={{ backgroundColor: 'var(--blooso-rose)', color: '#fff' }}
            >
              Find a Service
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              id="hero-how-it-works-btn"
              href="#how-it-works"
              className={cn(
                'inline-flex h-12 items-center justify-center rounded-[10px] border px-7 text-sm font-semibold',
                'transition-all hover:bg-black/[0.04] active:scale-[0.98]'
              )}
              style={{
                borderColor: 'var(--blooso-border)',
                color: 'var(--blooso-text)',
              }}
            >
              See How It Works
            </Link>
          </div>

          {/* Trust strip */}
          <div
            className="mt-10 flex animate-fade-up flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6"
            style={{ animationDelay: '380ms' }}
          >
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="size-4 fill-amber-400 text-amber-400" aria-hidden />
                ))}
              </div>
              <span className="text-sm font-semibold" style={{ color: 'var(--blooso-text)' }}>
                4.9
              </span>
            </div>
            <div
              className="hidden h-4 w-px sm:block"
              style={{ backgroundColor: 'var(--blooso-border)' }}
            />
            <span className="text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
              Trusted by{' '}
              <strong className="font-semibold" style={{ color: 'var(--blooso-text)' }}>
                500+
              </strong>{' '}
              businesses
            </span>
            <div
              className="hidden h-4 w-px sm:block"
              style={{ backgroundColor: 'var(--blooso-border)' }}
            />
            <span className="text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
              <strong className="font-semibold" style={{ color: 'var(--blooso-text)' }}>
                10,000+
              </strong>{' '}
              bookings made
            </span>
          </div>
        </div>

        {/* ── Right: Lifestyle image ── */}
        <div
          className="relative hidden animate-fade-in lg:block"
          style={{ animationDelay: '200ms' }}
        >
          {/* Warm decorative background shape */}
          <div
            className="absolute -right-8 -top-8 h-[580px] w-[500px] rounded-[32px]"
            style={{ backgroundColor: 'var(--blooso-bg-warmer)' }}
            aria-hidden
          />
          {/* Sand accent line */}
          <div
            className="absolute -bottom-2 left-4 h-1.5 w-32 rounded-full"
            style={{ backgroundColor: 'var(--blooso-sand)' }}
            aria-hidden
          />

          {/* Main image */}
          <div className="relative z-10 overflow-hidden rounded-[28px] shadow-2xl shadow-black/10">
            <Image
              src="/landing/hero_spa_lifestyle_1779628990242.png"
              alt="Woman relaxing during a luxury spa facial treatment"
              width={600}
              height={700}
              className="h-[620px] w-full object-cover"
              priority
              fetchPriority="high"
            />
          </div>

          {/* Floating review card */}
          <div
            className="absolute -left-8 bottom-12 z-20 rounded-2xl p-4 shadow-xl"
            style={{
              backgroundColor: 'var(--blooso-bg)',
              border: '1px solid var(--blooso-border-light)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="size-10 overflow-hidden rounded-full ring-2 ring-white">
                <Image
                  src="/landing/avatar_sarah_1779629186586.png"
                  alt="Sarah M."
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="mb-0.5 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="size-3 fill-amber-400 text-amber-400" aria-hidden />
                  ))}
                </div>
                <p className="text-xs font-medium" style={{ color: 'var(--blooso-text)' }}>
                  &ldquo;Found my favourite salon!&rdquo;
                </p>
                <p className="mt-0.5 text-xs" style={{ color: 'var(--blooso-text-subtle)' }}>
                  Sarah M., Colombo
                </p>
              </div>
            </div>
          </div>

          {/* Floating bookings counter */}
          <div
            className="absolute -right-5 top-16 z-20 rounded-2xl px-4 py-3"
            style={{
              backgroundColor: 'var(--blooso-bg)',
              border: '1px solid var(--blooso-border-light)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            }}
          >
            <p
              className="text-[10px] font-medium uppercase tracking-wider"
              style={{ color: 'var(--blooso-text-subtle)' }}
            >
              Booked today
            </p>
            <p
              className="mt-0.5 text-2xl font-bold"
              style={{ color: 'var(--blooso-rose)', fontFamily: 'var(--font-serif)' }}
            >
              127
            </p>
            <p className="text-[10px]" style={{ color: 'var(--blooso-text-subtle)' }}>
              appointments
            </p>
          </div>
        </div>
      </div>

      {/* Mobile hero image */}
      <div className="block px-6 pb-12 lg:hidden">
        <div className="overflow-hidden rounded-[20px] shadow-xl shadow-black/8">
          <Image
            src="/landing/hero_spa_lifestyle_1779628990242.png"
            alt="Woman relaxing during a luxury spa facial treatment"
            width={800}
            height={450}
            className="h-64 w-full object-cover sm:h-80"
          />
        </div>
      </div>
    </section>
  );
}
