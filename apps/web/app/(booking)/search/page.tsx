'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, Star, Filter } from 'lucide-react';
import Image from 'next/image';
import { searchBusinesses, BUSINESS_CATEGORIES } from '@/lib/business-client';
import type { BusinessWithDetails } from '@/lib/business-client';
import { cn } from '@/lib/utils';

// --- Business Card Component ---
function BusinessCard({ business, onBook }: { business: BusinessWithDetails; onBook: () => void }) {
  const location = business.locations?.[0];
  const categoryFormatted = business.category.replace(/_/g, ' ');

  return (
    <div
      className={cn(
        'group flex flex-col overflow-hidden rounded-[20px] transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-xl'
      )}
      style={{
        backgroundColor: 'var(--blooso-bg-warm)',
        border: '1px solid var(--blooso-border-light)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      }}
    >
      {/* Top Image area (we use logo if available or fallback gradient) */}
      <div className="relative h-40 w-full overflow-hidden bg-muted">
        {business.logoUrl ? (
          <img
            src={business.logoUrl}
            alt={business.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center transition-transform duration-500 group-hover:scale-105"
            style={{
              background:
                'linear-gradient(135deg, var(--blooso-sand-light), var(--blooso-bg-warmer))',
            }}
          >
            <span
              className="text-4xl font-bold uppercase"
              style={{ color: 'var(--blooso-sand)', fontFamily: 'var(--font-serif)' }}
            >
              {business.name.charAt(0)}
            </span>
          </div>
        )}
        {/* Category badge */}
        <div
          className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold capitalize tracking-wide shadow-sm backdrop-blur-sm"
          style={{ color: 'var(--blooso-text)' }}
        >
          {categoryFormatted}
        </div>
      </div>

      {/* Content area */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <h3
            className="font-serif text-xl font-bold leading-tight"
            style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
          >
            {business.name}
          </h3>
          <div className="flex shrink-0 items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold" style={{ color: 'var(--blooso-text)' }}>
              4.9
            </span>
          </div>
        </div>

        {location?.city && (
          <div className="mt-2 flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" style={{ color: 'var(--blooso-text-subtle)' }} />
            <span className="text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
              {location.city}
              {location.state ? `, ${location.state}` : ''}
            </span>
          </div>
        )}

        <div className="mt-6 mt-auto pt-4">
          <button
            onClick={onBook}
            className={cn(
              'w-full rounded-[10px] py-2.5 text-sm font-semibold transition-all',
              'hover:opacity-90 active:scale-[0.98]'
            )}
            style={{ backgroundColor: 'var(--blooso-rose)', color: '#fff' }}
          >
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Search Page Content ---
function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qParam = searchParams.get('q') ?? '';
  const categoryParam = searchParams.get('category') ?? '';

  const [query, setQuery] = useState(qParam);
  const [category, setCategory] = useState(categoryParam);
  const [results, setResults] = useState<BusinessWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);

  const doSearch = useCallback(
    (page = 1, forceQuery = query, forceCat = category) => {
      setLoading(true);
      searchBusinesses({
        q: forceQuery || undefined,
        category: forceCat || undefined,
        page,
        limit: 12,
      })
        .then((res) => {
          setResults(res.data);
          setMeta(res.meta);
        })
        .catch(() => {
          setResults([]);
          setMeta(null);
        })
        .finally(() => setLoading(false));
    },
    [query, category]
  );

  useEffect(() => {
    doSearch(1, qParam, categoryParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qParam, categoryParam]); // Refetch if URL params change externally

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    router.push(`/search?${params}`);
    doSearch(1, query, category);
  };

  const setCategoryFilter = (cat: string) => {
    setCategory(cat);
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (cat) params.set('category', cat);
    router.push(`/search?${params}`);
    doSearch(1, query, cat);
  };

  return (
    <div className="animate-fade-in pb-20">
      {/* ── Hero Search Area ── */}
      <section
        className="relative overflow-hidden px-6 py-16 md:py-24"
        style={{ backgroundColor: 'var(--blooso-bg-warmer)' }}
      >
        <div className="blooso-container relative z-10 mx-auto max-w-4xl text-center">
          <h1
            className="text-4xl font-bold tracking-tight md:text-5xl"
            style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
          >
            Discover Premium Services
          </h1>
          <p className="mt-4 text-base md:text-lg" style={{ color: 'var(--blooso-text-muted)' }}>
            Find the best salons, spas, and studios near you.
          </p>

          <form
            onSubmit={handleSearch}
            className="mx-auto mt-10 flex w-full max-w-2xl items-center rounded-[14px] bg-white p-2 shadow-xl"
            style={{
              border: '1px solid var(--blooso-border)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
            }}
          >
            <Search
              className="ml-3 size-5 shrink-0"
              style={{ color: 'var(--blooso-text-subtle)' }}
            />
            <input
              type="search"
              placeholder="Search by salon name, service..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-12 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-sm"
              style={{ color: 'var(--blooso-text)' }}
            />
            <button
              type="submit"
              className="ml-2 h-12 rounded-[10px] px-8 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: 'var(--blooso-rose)', color: '#fff' }}
            >
              Search
            </button>
          </form>

          {/* Category Pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setCategoryFilter('')}
              className={cn(
                'rounded-full border px-5 py-2 text-sm font-medium transition-colors',
                !category ? 'border-transparent shadow-sm' : 'bg-transparent hover:bg-black/5'
              )}
              style={{
                backgroundColor: !category ? 'var(--blooso-text)' : 'transparent',
                color: !category ? '#fff' : 'var(--blooso-text-muted)',
                borderColor: !category ? 'transparent' : 'var(--blooso-border)',
              }}
            >
              All
            </button>
            {BUSINESS_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={cn(
                  'rounded-full border px-5 py-2 text-sm font-medium capitalize transition-colors',
                  category === c
                    ? 'border-transparent shadow-sm'
                    : 'bg-transparent hover:bg-black/5'
                )}
                style={{
                  backgroundColor: category === c ? 'var(--blooso-text)' : 'transparent',
                  color: category === c ? '#fff' : 'var(--blooso-text-muted)',
                  borderColor: category === c ? 'transparent' : 'var(--blooso-border)',
                }}
              >
                {c.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Decorative sand blob */}
        <div
          className="absolute -right-20 top-0 h-64 w-64 rounded-full blur-3xl"
          style={{ backgroundColor: 'var(--blooso-sand-light)', opacity: 0.6 }}
          aria-hidden
        />
      </section>

      {/* ── Results Area ── */}
      <div className="blooso-container mx-auto mt-12 px-6">
        {/* Results count header */}
        <div className="mb-8 flex items-center justify-between">
          <h2
            className="text-xl font-bold"
            style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
          >
            {category
              ? `${category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())} Services`
              : 'All Services'}
          </h2>
          {meta && (
            <p className="text-sm font-medium" style={{ color: 'var(--blooso-text-subtle)' }}>
              Showing <strong style={{ color: 'var(--blooso-text)' }}>{meta.total}</strong> results
            </p>
          )}
        </div>

        {/* Loading / Empty / Grid */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-[20px]"
                style={{ backgroundColor: 'var(--blooso-bg-warm)' }}
              />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-[24px] border border-dashed py-24 text-center"
            style={{ borderColor: 'var(--blooso-border)' }}
          >
            <div
              className="flex size-16 items-center justify-center rounded-full"
              style={{ backgroundColor: 'var(--blooso-bg-warmer)' }}
            >
              <Search className="size-6" style={{ color: 'var(--blooso-text-subtle)' }} />
            </div>
            <h3 className="mt-6 text-lg font-semibold" style={{ color: 'var(--blooso-text)' }}>
              No businesses found
            </h3>
            <p className="mt-2 text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
              Try adjusting your search query or removing category filters.
            </p>
            {(query || category) && (
              <button
                onClick={() => {
                  setQuery('');
                  setCategoryFilter('');
                }}
                className="mt-6 rounded-[10px] px-6 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--blooso-text)', color: '#fff' }}
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((b) => (
              <BusinessCard key={b.id} business={b} onBook={() => router.push(`/b/${b.slug}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div
            className="size-8 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: 'var(--blooso-border)', borderTopColor: 'var(--blooso-rose)' }}
          />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
