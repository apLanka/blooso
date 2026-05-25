'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/search', label: 'Services' },
  { href: '/register', label: 'For Businesses' },
];

export function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'border-b bg-white/95 shadow-sm shadow-black/5 backdrop-blur-md'
          : 'bg-transparent'
      )}
      style={{ borderColor: scrolled ? 'var(--blooso-border-light)' : 'transparent' }}
    >
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="font-serif text-2xl font-bold tracking-tight"
          style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
          aria-label="Blooso home"
        >
          Blooso
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                'hover:bg-black/5'
              )}
              style={{ color: 'var(--blooso-text-muted)' }}
            >
              {link.label}
            </Link>
          ))}

          <div className="mx-3 h-4 w-px" style={{ backgroundColor: 'var(--blooso-border)' }} />

          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-black/5"
            style={{ color: 'var(--blooso-text-muted)' }}
          >
            Login
          </Link>

          <Link
            href="/register"
            id="header-signup-btn"
            className={cn(
              'ml-1 inline-flex h-10 items-center justify-center rounded-[10px] px-5 text-sm font-semibold',
              'transition-all hover:opacity-90 active:scale-[0.98]'
            )}
            style={{ backgroundColor: 'var(--blooso-rose)', color: '#fff' }}
          >
            Sign Up
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          id="mobile-menu-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="inline-flex size-10 items-center justify-center rounded-lg text-sm font-medium md:hidden"
          style={{ color: 'var(--blooso-text-muted)' }}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div
          className="border-t bg-white/98 backdrop-blur-md md:hidden"
          style={{ borderColor: 'var(--blooso-border-light)' }}
        >
          <nav className="flex flex-col gap-1 px-6 py-4" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-black/5"
                style={{ color: 'var(--blooso-text-muted)' }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-black/5"
              style={{ color: 'var(--blooso-text-muted)' }}
            >
              Login
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="mt-2 inline-flex h-11 items-center justify-center rounded-[10px] px-5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: 'var(--blooso-rose)', color: '#fff' }}
            >
              Sign Up
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
