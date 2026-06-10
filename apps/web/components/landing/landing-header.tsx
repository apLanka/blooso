'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const PUBLIC_NAV_LINKS = [
  { href: '/search', label: 'Services' },
  { href: '/register', label: 'For Businesses' },
];

const CLIENT_NAV_LINKS = [
  { href: '/search', label: 'Services' },
  { href: '/my-bookings', label: 'My Bookings' },
];

interface LandingHeaderProps {
  alwaysSolid?: boolean;
  user?: { name: string; email: string; role: string } | null;
  onLogout?: () => void;
}

export function LandingHeader({ alwaysSolid = false, user, onLogout }: LandingHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(alwaysSolid);

  useEffect(() => {
    if (alwaysSolid) return;
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [alwaysSolid]);

  const dashboardHref =
    user?.role === 'admin'
      ? '/admin/dashboard'
      : user?.role === 'client'
        ? '/my-bookings'
        : '/dashboard';

  const navLinks = user
    ? user.role === 'client'
      ? CLIENT_NAV_LINKS
      : [{ href: dashboardHref, label: 'Dashboard' }]
    : PUBLIC_NAV_LINKS;

  const extraLinks = [];

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
          href={user ? dashboardHref : '/'}
          className="font-serif text-2xl font-bold tracking-tight"
          style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
          aria-label="Blooso home"
        >
          Blooso
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
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

          {extraLinks.map((link) => (
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

          {user ? (
            <div className="flex items-center gap-3">
              <span
                className="hidden text-sm font-medium lg:block"
                style={{ color: 'var(--blooso-text-muted)' }}
              >
                {user.name}
              </span>
              <button
                onClick={onLogout}
                className={cn(
                  'inline-flex h-10 items-center justify-center gap-2 rounded-[10px] px-4 text-sm font-semibold',
                  'transition-all hover:opacity-90 active:scale-[0.98]'
                )}
                style={{
                  border: '1px solid var(--blooso-border)',
                  color: 'var(--blooso-text-muted)',
                }}
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <>
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
            </>
          )}
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
            {navLinks.map((link) => (
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

            {extraLinks.map((link) => (
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

            {user ? (
              <>
                <div
                  className="my-2 h-px"
                  style={{ backgroundColor: 'var(--blooso-border-light)' }}
                />
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold" style={{ color: 'var(--blooso-text)' }}>
                    {user.name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--blooso-text-subtle)' }}>
                    {user.email}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    onLogout?.();
                  }}
                  className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-black/5"
                  style={{ color: 'var(--blooso-text-muted)' }}
                >
                  <LogOut className="size-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
