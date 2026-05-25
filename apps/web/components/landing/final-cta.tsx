import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FinalCta() {
  return (
    <section
      className="blooso-section-pad"
      style={{ backgroundColor: 'var(--blooso-bg)' }}
      aria-labelledby="final-cta-heading"
    >
      {/* Inner container with warm tinted background */}
      <div className="blooso-container">
        <div
          className="relative overflow-hidden rounded-[28px] px-8 py-16 text-center md:px-16"
          style={{ backgroundColor: 'var(--blooso-bg-warmer)' }}
        >
          {/* Subtle sand accent line top */}
          <div
            className="absolute left-1/2 top-0 h-0.5 w-24 -translate-x-1/2 rounded-full"
            style={{ backgroundColor: 'var(--blooso-sand)' }}
            aria-hidden
          />

          <h2
            id="final-cta-heading"
            className="mx-auto max-w-xl text-3xl font-bold tracking-tight md:text-4xl"
            style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
          >
            Ready to Experience Premium Booking?
          </h2>
          <p
            className="mt-4 text-base leading-relaxed"
            style={{ color: 'var(--blooso-text-muted)' }}
          >
            Join thousands of customers and businesses already using Blooso.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              id="final-cta-find-btn"
              href="/search"
              className={cn(
                'group inline-flex h-12 items-center justify-center gap-2 rounded-[10px] px-8 text-sm font-semibold',
                'transition-all hover:opacity-90 active:scale-[0.98]'
              )}
              style={{ backgroundColor: 'var(--blooso-rose)', color: '#fff' }}
            >
              Find a Service
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              id="final-cta-business-btn"
              href="/register"
              className={cn(
                'inline-flex h-12 items-center justify-center rounded-[10px] border px-8 text-sm font-semibold',
                'transition-all hover:bg-black/[0.04] active:scale-[0.98]'
              )}
              style={{
                borderColor: 'var(--blooso-border)',
                color: 'var(--blooso-text)',
              }}
            >
              List Your Business
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
