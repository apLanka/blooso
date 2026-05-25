'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { Search, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HeroSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = query.trim();
      if (trimmed) {
        router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      } else {
        router.push('/search');
      }
    },
    [query, router]
  );

  return (
    <form
      onSubmit={handleSubmit}
      id="hero-search-form"
      className={cn(
        'flex w-full items-center',
        'h-14 rounded-[12px] bg-white p-1.5',
        'ring-1 transition-all',
        'focus-within:ring-2'
      )}
      style={{
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        outline: '1px solid var(--blooso-border)',
      }}
    >
      <Search
        className="ml-3 size-5 shrink-0"
        style={{ color: 'var(--blooso-text-subtle)' }}
        aria-hidden
      />
      <input
        id="hero-search-input"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Salon, spa, barbershop..."
        className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-sm"
        style={{
          color: 'var(--blooso-text)',
        }}
        aria-label="Search for beauty and wellness services"
      />
      <div
        className="hidden h-6 w-px shrink-0 sm:block"
        style={{ backgroundColor: 'var(--blooso-border)' }}
        aria-hidden
      />
      <div className="hidden shrink-0 items-center gap-1.5 px-3 sm:flex">
        <MapPin className="size-4" style={{ color: 'var(--blooso-text-subtle)' }} aria-hidden />
        <span className="text-sm" style={{ color: 'var(--blooso-text-subtle)' }}>
          Near me
        </span>
      </div>
      <button
        id="hero-search-submit-btn"
        type="submit"
        className={cn(
          'ml-1 h-11 shrink-0 rounded-[9px] px-5 text-sm font-semibold',
          'transition-all hover:opacity-90 active:scale-[0.98]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
        )}
        style={{ backgroundColor: 'var(--blooso-rose)', color: '#fff' }}
      >
        Search
      </button>
    </form>
  );
}
