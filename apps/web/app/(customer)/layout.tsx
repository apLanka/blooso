'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { LogOut, CalendarDays, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          className="size-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'var(--blooso-border)', borderTopColor: 'var(--blooso-rose)' }}
        />
      </div>
    );
  }

  if (!user) {
    router.replace('/login');
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F9F7F5]">
      {/* ── Top Navigation ── */}
      <header
        className="sticky top-0 z-40 w-full border-b backdrop-blur-xl"
        style={{
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderColor: 'var(--blooso-border-light)',
        }}
      >
        <div className="blooso-container mx-auto flex h-16 items-center justify-between px-6">
          <Link
            href="/search"
            className="font-serif text-xl font-bold tracking-tight"
            style={{ color: 'var(--blooso-text)' }}
          >
            Blooso
          </Link>

          <div className="flex items-center gap-6">
            <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
              <Link
                href="/my-bookings"
                className={cn(
                  'transition-colors hover:text-black',
                  pathname === '/my-bookings' ? 'text-black font-semibold' : 'text-black/60'
                )}
              >
                My Bookings
              </Link>
            </nav>

            <div
              className="flex items-center gap-4 border-l pl-4"
              style={{ borderColor: 'var(--blooso-border-light)' }}
            >
              <div className="hidden flex-col items-end sm:flex">
                <span className="text-sm font-semibold" style={{ color: 'var(--blooso-text)' }}>
                  {user.name}
                </span>
                <span className="text-xs" style={{ color: 'var(--blooso-text-subtle)' }}>
                  {user.email}
                </span>
              </div>
              <button
                onClick={async () => {
                  await logout();
                  router.push('/');
                }}
                className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-black/5"
                style={{ color: 'var(--blooso-text-muted)' }}
                title="Sign out"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Navigation (Bottom) ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white pb-safe md:hidden"
        style={{ borderColor: 'var(--blooso-border-light)' }}
      >
        <div className="flex h-16 items-center justify-around px-2">
          <Link
            href="/my-bookings"
            className={cn(
              'flex flex-col items-center justify-center gap-1 w-full h-full transition-colors',
              pathname === '/my-bookings' ? 'text-black' : 'text-black/40'
            )}
          >
            <CalendarDays className="size-5" />
            <span className="text-[10px] font-semibold">Bookings</span>
          </Link>
          <button
            onClick={async () => {
              await logout();
              router.push('/');
            }}
            className="flex flex-col items-center justify-center gap-1 w-full h-full transition-colors text-black/40"
          >
            <LogOut className="size-5" />
            <span className="text-[10px] font-semibold">Sign out</span>
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 pb-24 md:pb-12">{children}</main>
    </div>
  );
}
