'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
          Blooso
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/search"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            Find a business
          </Link>
          <Link
            href="/register"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            For businesses
          </Link>
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className={cn(
              'ml-2 inline-flex h-9 items-center justify-center rounded-full px-5 text-sm font-semibold',
              'bg-gray-900 text-white transition-all hover:bg-gray-800 active:scale-[0.98]'
            )}
          >
            Get started
          </Link>
        </nav>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="inline-flex size-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:text-gray-900 md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white/95 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-1 px-6 py-4">
            <Link
              href="/search"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              Find a business
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              For businesses
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="mt-2 inline-flex h-10 items-center justify-center rounded-full bg-gray-900 px-5 text-sm font-semibold text-white transition-all hover:bg-gray-800 active:scale-[0.98]"
            >
              Get started
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
