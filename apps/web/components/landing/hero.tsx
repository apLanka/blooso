import Link from 'next/link';
import { Sparkles, Star, ArrowRight } from 'lucide-react';
import { HeroSearchBar } from './hero-search-bar';
import { cn } from '@/lib/utils';

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-white">
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-[15%] top-[5%] h-[600px] w-[600px] rounded-full bg-accent-blue opacity-30 blur-[140px]" />
        <div className="absolute -right-[10%] top-[0%] h-[500px] w-[500px] rounded-full bg-accent-pink opacity-25 blur-[140px]" />
        <div className="absolute bottom-[5%] left-[30%] h-[400px] w-[600px] rounded-full bg-accent-blue-light opacity-30 blur-[140px]" />
      </div>

      {/* Subtle dot pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        aria-hidden
        style={{
          backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-24 pb-16">
        <div className="flex max-w-4xl flex-col items-center text-center">
          {/* Badge */}
          <div
            className="mb-8 inline-flex animate-fade-up items-center gap-2 rounded-full border border-accent-pink/30 bg-accent-pink/10 px-4 py-1.5"
            style={{ animationDelay: '0ms' }}
          >
            <Sparkles className="size-3.5 text-pink-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-pink-500">
              Premium booking platform
            </span>
          </div>

          {/* Headline */}
          <h1
            className={cn(
              'font-bold tracking-tight text-gray-900',
              'text-4xl leading-[1.08] sm:text-5xl md:text-6xl lg:text-7xl',
              'animate-fade-up'
            )}
            style={{ animationDelay: '100ms' }}
          >
            Book beauty &{' '}
            <span className="bg-gradient-to-r from-pink-400 via-accent-pink to-accent-blue bg-clip-text text-transparent">
              wellness
            </span>
            <br />
            services, anytime
          </h1>

          {/* Subheadline */}
          <p
            className={cn(
              'mt-6 max-w-lg text-lg leading-relaxed text-gray-500 md:text-xl',
              'animate-fade-up'
            )}
            style={{ animationDelay: '200ms' }}
          >
            Discover top-rated salons, spas, and barbershops.
            <br className="hidden sm:block" />
            Book your next appointment in just a few clicks.
          </p>

          {/* Search bar */}
          <div className="mt-10 w-full animate-fade-up" style={{ animationDelay: '350ms' }}>
            <HeroSearchBar />
          </div>

          {/* CTA buttons */}
          <div
            className={cn('mt-6 flex flex-col items-center gap-3 sm:flex-row', 'animate-fade-up')}
            style={{ animationDelay: '450ms' }}
          >
            <Link
              href="/search"
              className={cn(
                'group inline-flex h-11 items-center justify-center gap-2 rounded-full px-7 text-sm font-semibold',
                'bg-gray-900 text-white',
                'transition-all hover:bg-gray-800 hover:shadow-lg hover:shadow-gray-900/20 active:scale-[0.98]'
              )}
            >
              Find a business
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/register"
              className={cn(
                'inline-flex h-11 items-center justify-center rounded-full px-7 text-sm font-semibold',
                'border border-gray-200 text-gray-700 bg-white',
                'transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]'
              )}
            >
              For business owners
            </Link>
          </div>

          {/* Trust line */}
          <div
            className={cn(
              'mt-14 flex flex-col items-center gap-4 sm:flex-row sm:gap-6',
              'animate-fade-up'
            )}
            style={{ animationDelay: '550ms' }}
          >
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="size-4 fill-amber-400 text-amber-400" aria-hidden />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700">4.9</span>
            </div>
            <div className="hidden h-4 w-px bg-gray-200 sm:block" />
            <span className="text-sm text-gray-400">
              Trusted by <strong className="font-semibold text-gray-600">500+</strong> businesses
            </span>
            <div className="hidden h-4 w-px bg-gray-200 sm:block" />
            <span className="text-sm text-gray-400">
              <strong className="font-semibold text-gray-600">10,000+</strong> bookings made
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
