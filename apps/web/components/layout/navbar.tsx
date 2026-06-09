'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, LogOut, User, Settings, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';

const PUBLIC_LINKS = [
  { href: '/search', label: 'Services' },
  { href: '/register', label: 'For Businesses' },
];

const CLIENT_LINKS = [
  { href: '/search', label: 'Services' },
  { href: '/account', label: 'Account' },
  { href: '/onboarding', label: 'For Businesses' },
];

const OWNER_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/clients', label: 'Clients' },
  { href: '/services', label: 'Services' },
  { href: '/staff', label: 'Staff' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/settings', label: 'Settings' },
];

const ADMIN_EXTRA_LINKS = [{ href: '/admin/applications', label: 'Applications' }];

interface NavbarProps {
  alwaysSolid?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = [
    'bg-rose-100 text-rose-700',
    'bg-orange-100 text-orange-700',
    'bg-amber-100 text-amber-700',
    'bg-emerald-100 text-emerald-700',
    'bg-sky-100 text-sky-700',
    'bg-violet-100 text-violet-700',
    'bg-pink-100 text-pink-700',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index]!;
}

export function Navbar({ alwaysSolid = false }: NavbarProps) {
  const { user, logout, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(alwaysSolid);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (alwaysSolid) return;
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [alwaysSolid]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [profileOpen]);

  const navLinks = user ? (user.role === 'client' ? CLIENT_LINKS : OWNER_LINKS) : PUBLIC_LINKS;

  const extraLinks = user?.role === 'admin' ? ADMIN_EXTRA_LINKS : [];

  const dashboardHref = user?.role === 'client' ? '/account' : '/dashboard';

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
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-black/5"
              style={{ color: 'var(--blooso-text-muted)' }}
            >
              {link.label}
            </Link>
          ))}

          {extraLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-black/5"
              style={{ color: 'var(--blooso-text-muted)' }}
            >
              {link.label}
            </Link>
          ))}

          <div className="mx-3 h-4 w-px" style={{ backgroundColor: 'var(--blooso-border)' }} />

          {user ? (
            /* ── Signed-in: user profile dropdown ── */
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className={cn(
                  'flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-3 transition-all',
                  'hover:shadow-sm',
                  profileOpen && 'shadow-sm'
                )}
                style={{ border: '1px solid var(--blooso-border-light)' }}
              >
                {/* Avatar */}
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="size-8 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className={cn(
                      'flex size-8 items-center justify-center rounded-full text-xs font-bold',
                      getAvatarColor(user.name)
                    )}
                  >
                    {getInitials(user.name)}
                  </div>
                )}

                {/* Name */}
                <span
                  className="hidden text-sm font-semibold lg:block"
                  style={{ color: 'var(--blooso-text)' }}
                >
                  {user.name}
                </span>
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div
                  className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border shadow-lg"
                  style={{
                    backgroundColor: '#fff',
                    borderColor: 'var(--blooso-border-light)',
                  }}
                >
                  {/* User info */}
                  <div
                    className="border-b px-4 py-3"
                    style={{ borderColor: 'var(--blooso-border-light)' }}
                  >
                    <p className="text-sm font-semibold" style={{ color: 'var(--blooso-text)' }}>
                      {user.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--blooso-text-subtle)' }}>
                      {user.email}
                    </p>
                  </div>

                  {/* Menu items */}
                  <div className="p-1.5">
                    <Link
                      href={dashboardHref}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-black/5"
                      style={{ color: 'var(--blooso-text-muted)' }}
                    >
                      <LayoutDashboard className="size-4" />
                      Dashboard
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-black/5"
                      style={{ color: 'var(--blooso-text-muted)' }}
                    >
                      <Settings className="size-4" />
                      Settings
                    </Link>
                  </div>

                  {/* Sign out */}
                  <div
                    className="border-t p-1.5"
                    style={{ borderColor: 'var(--blooso-border-light)' }}
                  >
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        logout?.();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-black/5"
                      style={{ color: 'var(--blooso-text-muted)' }}
                    >
                      <LogOut className="size-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : isLoading ? (
            /* ── Loading: show placeholder ── */
            <div className="flex items-center gap-2">
              <div className="size-8 animate-pulse rounded-full bg-black/10" />
              <div className="hidden h-4 w-20 animate-pulse rounded bg-black/10 lg:block" />
            </div>
          ) : (
            /* ── Signed-out: Login + Sign Up ── */
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
          onClick={() => setMobileOpen(!mobileOpen)}
          className="inline-flex size-10 items-center justify-center rounded-lg text-sm font-medium md:hidden"
          style={{ color: 'var(--blooso-text-muted)' }}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* ── Mobile nav drawer ── */}
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
                {/* User info */}
                <div
                  className="my-2 flex items-center gap-3 rounded-xl border px-4 py-3"
                  style={{ borderColor: 'var(--blooso-border-light)' }}
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="size-10 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={cn(
                        'flex size-10 items-center justify-center rounded-full text-sm font-bold',
                        getAvatarColor(user.name)
                      )}
                    >
                      {getInitials(user.name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p
                      className="truncate text-sm font-semibold"
                      style={{ color: 'var(--blooso-text)' }}
                    >
                      {user.name}
                    </p>
                    <p className="truncate text-xs" style={{ color: 'var(--blooso-text-subtle)' }}>
                      {user.email}
                    </p>
                  </div>
                </div>

                <Link
                  href={dashboardHref}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-black/5"
                  style={{ color: 'var(--blooso-text-muted)' }}
                >
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-black/5"
                  style={{ color: 'var(--blooso-text-muted)' }}
                >
                  <Settings className="size-4" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    logout?.();
                  }}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-black/5"
                  style={{ color: 'var(--blooso-text-muted)' }}
                >
                  <LogOut className="size-4" />
                  Sign Out
                </button>
              </>
            ) : isLoading ? (
              /* ── Loading: show placeholder ── */
              <div className="flex flex-col gap-3 py-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 animate-pulse rounded-full bg-black/10" />
                  <div className="flex-1">
                    <div className="h-4 w-24 animate-pulse rounded bg-black/10" />
                    <div className="mt-1 h-3 w-32 animate-pulse rounded bg-black/10" />
                  </div>
                </div>
              </div>
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
