'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Settings,
  Menu,
  X,
  LogOut,
  Scissors,
  Users,
  UserCircle,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/clients', label: 'Clients', icon: UserCircle },
  { href: '/services', label: 'Services', icon: Scissors },
  { href: '/staff', label: 'Staff', icon: Users },
  { href: '/reviews', label: 'Reviews', icon: MessageSquare },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F7F5]">
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

  const SidebarContent = () => (
    <>
      <div className="flex h-20 items-center px-8">
        <Link
          href="/dashboard"
          className="font-serif text-2xl font-bold tracking-tight"
          style={{ color: 'var(--blooso-text)' }}
        >
          Blooso<span style={{ color: 'var(--blooso-rose)' }}>.</span>
        </Link>
      </div>
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

      <div className="p-6">
        <div
          className="rounded-[16px] p-5 shadow-sm"
          style={{ backgroundColor: '#fff', border: '1px solid var(--blooso-border-light)' }}
        >
          <p
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: 'var(--blooso-text-subtle)' }}
          >
            Logged in as
          </p>
          <p
            className="mt-1 truncate text-sm font-semibold"
            style={{ color: 'var(--blooso-text)' }}
          >
            {user.name}
          </p>
          <button
            onClick={async () => {
              await logout();
              router.push('/login');
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-[8px] py-2 text-xs font-semibold transition-colors hover:bg-black/5"
            style={{ color: 'var(--blooso-text-muted)', border: '1px solid var(--blooso-border)' }}
          >
            <LogOut className="size-3.5" />
            Sign out
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F9F7F5' }}>
      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden w-72 flex-col border-r md:flex"
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
        <SidebarContent />
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute right-4 top-6 flex size-8 items-center justify-center rounded-full bg-black/5 text-black/60 transition-colors hover:bg-black/10 hover:text-black"
        >
          <X className="size-4" />
        </button>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header
          className="flex h-16 shrink-0 items-center justify-between border-b px-6 md:hidden backdrop-blur-md sticky top-0 z-30"
          style={{
            backgroundColor: 'rgba(249, 247, 245, 0.8)',
            borderColor: 'var(--blooso-border-light)',
          }}
        >
          <Link
            href="/dashboard"
            className="font-serif text-xl font-bold tracking-tight"
            style={{ color: 'var(--blooso-text)' }}
          >
            Blooso<span style={{ color: 'var(--blooso-rose)' }}>.</span>
          </Link>
          <button
            className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-black/5"
            style={{ color: 'var(--blooso-text)' }}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="size-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-10 lg:p-12">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
