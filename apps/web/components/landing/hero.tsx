'use client';

import Link from 'next/link';
import Image from 'next/image';
import { HeroSearchBar } from './hero-search-bar';

export function Hero() {
  return (
    <section
      className="relative flex flex-col items-center justify-center pt-32 pb-48"
      style={{ minHeight: '85vh' }}
      aria-label="Hero"
    >
      {/* ── Full-width Background Image ── */}
      <Image
        src="/landing/hero_spa_lifestyle_1779628990242.png"
        alt="Premium spa and salon booking"
        fill
        className="absolute inset-0 z-0 object-cover object-center"
        priority
        fetchPriority="high"
      />
      {/* ── Dark Gradient Overlay ── */}
      <div className="absolute inset-0 z-10 bg-black/40 bg-gradient-to-b from-black/70 via-black/30 to-black/80" />

      <div className="relative z-20 w-full max-w-6xl px-6 text-center">
        {/* Badge */}
        <div
          className="mx-auto mb-6 inline-flex animate-fade-up items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
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
          className="mx-auto max-w-4xl animate-fade-up text-[2.6rem] font-bold leading-[1.12] tracking-tight text-white sm:text-5xl md:text-6xl"
          style={{
            fontFamily: 'var(--font-serif)',
            animationDelay: '80ms',
          }}
        >
          Book Your Perfect <span style={{ color: 'var(--blooso-rose)' }}>Appointment.</span>
          <br className="hidden sm:block" /> Anytime.
        </h1>

        {/* Subheadline */}
        <p
          className="mx-auto mt-6 max-w-2xl animate-fade-up text-base leading-relaxed text-white/90 md:text-lg"
          style={{ animationDelay: '160ms' }}
        >
          Discover and book beauty &amp; wellness services near you — salons, spas, barbershops, and
          more — in seconds.
        </p>
      </div>

      {/* ── Floating Overlapping Search Bar ── */}
      <div
        className="absolute bottom-0 left-1/2 z-30 w-full max-w-5xl px-6"
        style={{ transform: 'translateX(-50%) translateY(50%)' }}
      >
        <div className="animate-fade-up w-full" style={{ animationDelay: '240ms' }}>
          <HeroSearchBar />
        </div>
      </div>
    </section>
  );
}
