'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { Search, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'hair', label: 'Hair & Styling' },
  { id: 'spa', label: 'Spa & Massage' },
  { id: 'nails', label: 'Nails' },
  { id: 'barber', label: 'Barbershops' },
];

export function HeroSearchBar() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams();
      if (query.trim()) params.append('q', query.trim());
      if (location.trim()) params.append('location', location.trim());
      params.append('category', activeCategory);

      router.push(`/search?${params.toString()}`);
    },
    [query, location, activeCategory, router]
  );

  return (
    <div
      className="w-full rounded-[24px] bg-white p-5 shadow-2xl md:p-8"
      style={{ border: '1px solid var(--blooso-border-light)' }}
    >
      {/* ── Tabs ── */}
      <div
        className="mb-6 flex overflow-x-auto border-b pb-4 hide-scrollbar gap-2"
        style={{ borderColor: 'var(--blooso-border-light)' }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'whitespace-nowrap px-4 py-2 text-sm font-semibold transition-all relative rounded-full',
                isActive ? 'bg-black/5' : 'hover:bg-black/5'
              )}
              style={{
                color: isActive ? 'var(--blooso-text)' : 'var(--blooso-text-muted)',
              }}
            >
              {cat.label}
              {isActive && (
                <div
                  className="absolute bottom-[-16px] left-1/2 -translate-x-1/2 h-[3px] w-8 rounded-t-full"
                  style={{ backgroundColor: 'var(--blooso-rose)' }}
                />
              )}
            </button>
          );
        })}
      </div>

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
          className="flex h-14 items-center justify-center rounded-[12px] px-10 text-sm font-bold transition-all hover:opacity-90 active:scale-[0.98] md:w-auto shadow-md"
          style={{ backgroundColor: 'var(--blooso-rose)', color: '#fff' }}
        >
          Search
        </button>
      </form>
    </div>
  );
}
