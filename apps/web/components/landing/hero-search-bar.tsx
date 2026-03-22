'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
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
      className={cn(
        'mx-auto flex w-full max-w-xl items-center',
        'h-14 rounded-full bg-white p-1.5',
        'shadow-xl shadow-gray-200/60',
        'ring-1 ring-gray-200',
        'focus-within:ring-2 focus-within:ring-accent-pink/50 focus-within:shadow-accent-pink/10',
        'transition-all'
      )}
    >
      <Search className="ml-4 size-5 shrink-0 text-gray-400" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search salons, barbers..."
        className="min-w-0 flex-1 bg-transparent px-3 text-base text-gray-900 outline-none placeholder:text-gray-400"
        aria-label="Search for businesses"
      />
      <button
        type="submit"
        className={cn(
          'h-11 shrink-0 rounded-full px-6 text-sm font-semibold',
          'bg-gray-900 text-white',
          'transition-all hover:bg-gray-800 active:scale-[0.98]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2'
        )}
      >
        Search
      </button>
    </form>
  );
}
