'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CalendarDays,
  Heart,
  MessageSquare,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/navbar';

const navItems = [
  { href: '/account', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/my-bookings', label: 'Bookings', icon: CalendarDays },
  { href: '/favorites', label: 'Favorites', icon: Heart },
  { href: '/my-reviews', label: 'Reviews', icon: MessageSquare },
  { href: '/my-settings', label: 'Settings', icon: Settings },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

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
    return null;
  }

  const SidebarContent = () => (
    <nav className="flex-1 space-y-1.5 px-4 pt-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={cn(
              'group flex items-center gap-3.5 rounded-[12px] px-4 py-3 text-sm font-semibold transition-all',
              isActive ? 'shadow-sm' : 'hover:bg-black/5'
            )}
            style={{
              backgroundColor: isActive ? 'var(--blooso-rose)' : 'transparent',
              color: isActive ? '#fff' : 'var(--blooso-text-muted)',
            }}
          >
            <Icon
              className={cn(
                'size-4 transition-transform group-hover:scale-110',
                isActive ? 'text-white' : 'text-current'
              )}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F9F7F5' }}>
      <Navbar alwaysSolid />

      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden w-72 flex-col border-r pt-[120px] md:flex"
        style={{
          backgroundColor: 'var(--blooso-bg-warm)',
          borderColor: 'var(--blooso-border-light)',
        }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden transition-opacity animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Mobile Sidebar ── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col shadow-2xl transition-transform duration-300 md:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ backgroundColor: 'var(--blooso-bg-warm)' }}
      >
        <div className="flex h-20 items-center px-8">
          <Link
            href="/"
            className="font-serif text-2xl font-bold tracking-tight"
            style={{ color: 'var(--blooso-text)' }}
          >
            Blooso<span style={{ color: 'var(--blooso-rose)' }}>.</span>
          </Link>
        </div>
        <SidebarContent />
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute right-4 top-6 flex size-8 items-center justify-center rounded-full bg-black/5 text-black/60 transition-colors hover:bg-black/10 hover:text-black"
        >
          <X className="size-4" />
        </button>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex flex-1 flex-col overflow-hidden pt-[120px]">
        {/* Mobile Sidebar Toggle */}
        <button
          className="fixed bottom-6 right-6 z-30 flex size-14 items-center justify-center rounded-full shadow-lg md:hidden"
          style={{ backgroundColor: 'var(--blooso-rose)', color: '#fff' }}
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="size-6" />
        </button>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-10 lg:p-12">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
