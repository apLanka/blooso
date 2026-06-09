'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { Search, MapPin } from 'lucide-react';

export function HeroSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams();
      if (query.trim()) params.append('q', query.trim());
      if (location.trim()) params.append('location', location.trim());

      router.push(`/search?${params.toString()}`);
    },
    [query, location, router]
  );

  return (
    <div
      className="w-full rounded-[24px] bg-white p-5 shadow-2xl md:p-8"
      style={{ border: '1px solid var(--blooso-border-light)' }}
    >
      {/* ── Search Form ── */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:flex-row md:items-end">
        {/* Service Input */}
        <div className="flex-1">
          <label
            className="mb-2 block text-xs font-bold uppercase tracking-wider pl-1"
            style={{ color: 'var(--blooso-text-subtle)' }}
          >
            What are you looking for?
          </label>
          <div
            className="relative flex h-14 w-full items-center rounded-[12px] px-4 transition-all focus-within:shadow-md"
            style={{
              backgroundColor: '#F9F7F5',
              border: '1px solid var(--blooso-border)',
            }}
          >
            <Search
              className="mr-3 size-5 shrink-0"
              style={{ color: 'var(--blooso-text-subtle)' }}
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Haircut, Balayage, Massage..."
              className="w-full bg-transparent text-sm font-medium outline-none placeholder:font-normal placeholder:text-gray-400"
              style={{ color: 'var(--blooso-text)' }}
            />
          </div>
        </div>

        {/* Location Input */}
        <div className="flex-1">
          <label
            className="mb-2 block text-xs font-bold uppercase tracking-wider pl-1"
            style={{ color: 'var(--blooso-text-subtle)' }}
          >
            Where?
          </label>
          <div
            className="relative flex h-14 w-full items-center rounded-[12px] px-4 transition-all focus-within:shadow-md"
            style={{
              backgroundColor: '#F9F7F5',
              border: '1px solid var(--blooso-border)',
            }}
          >
            <MapPin
              className="mr-3 size-5 shrink-0"
              style={{ color: 'var(--blooso-text-subtle)' }}
            />
            <input
              type="search"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Colombo, Galle..."
              className="w-full bg-transparent text-sm font-medium outline-none placeholder:font-normal placeholder:text-gray-400"
              style={{ color: 'var(--blooso-text)' }}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="flex h-14 min-w-[140px] shrink-0 items-center justify-center rounded-[12px] px-8 text-sm font-bold shadow-md transition-all hover:opacity-90 active:scale-[0.98] w-full md:w-auto"
          style={{ backgroundColor: 'var(--blooso-rose)', color: '#fff' }}
        >
          Search
        </button>
      </form>
    </div>
  );
}
