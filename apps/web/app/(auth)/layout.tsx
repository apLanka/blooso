'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';

const QUOTES = {
  login: {
    text: 'Self-care is not self-indulgence, it is self-preservation.',
    author: 'Audre Lorde',
  },
  register: {
    text: 'Invest in your hair, it is the crown you never take off.',
    author: 'Unknown',
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isRegister = pathname?.includes('/register');

  const quote = isRegister ? QUOTES.register : QUOTES.login;
  const imageSrc = isRegister
    ? '/auth/auth_register_side_1779700133558.png'
    : '/auth/auth_side_lifestyle_1779698627684.png';

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--blooso-bg)' }}>
      {/* ── Left panel: lifestyle image ── */}
      <div className="relative hidden w-[46%] shrink-0 lg:block">
        {/* Full-bleed photo */}
        <Image
          key={imageSrc}
          src={imageSrc}
          alt={
            isRegister
              ? 'A calm, luxurious salon interior'
              : 'A woman relaxing in a luxury spa lounge'
          }
          fill
          className="object-cover"
          priority
          sizes="46vw"
        />

        {/* Dark gradient overlay at bottom for legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(26,16,12,0.72) 0%, rgba(26,16,12,0.18) 50%, transparent 100%)',
          }}
          aria-hidden
        />

        {/* Logo on top-left */}
        <div className="absolute left-8 top-8 z-10">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-white drop-shadow-sm"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Blooso
          </Link>
        </div>

        {/* Quote at bottom */}
        <div className="absolute bottom-10 left-8 right-8 z-10">
          <blockquote className="text-base font-medium leading-relaxed text-white/90">
            &ldquo;{quote?.text}&rdquo;
          </blockquote>
          <p className="mt-2 text-sm text-white/60">&mdash; {quote?.author}</p>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex flex-1 flex-col">
        {/* Mobile-only Navbar */}
        <div className="lg:hidden">
          <Navbar alwaysSolid />
        </div>

        {/* Centred form area */}
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-center border-t px-6 py-4"
          style={{ borderColor: 'var(--blooso-border-light)' }}
        >
          <p className="text-xs" style={{ color: 'var(--blooso-text-subtle)' }}>
            &copy; {new Date().getFullYear()} Blooso &middot;{' '}
            <Link
              href="/"
              className="hover:underline"
              style={{ color: 'var(--blooso-text-muted)' }}
            >
              Privacy
            </Link>
            {' · '}
            <Link
              href="/"
              className="hover:underline"
              style={{ color: 'var(--blooso-text-muted)' }}
            >
              Terms
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
