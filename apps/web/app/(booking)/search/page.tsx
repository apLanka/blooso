'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { searchBusinesses, BUSINESS_CATEGORIES } from '@/lib/business-client';
import type { BusinessWithDetails } from '@/lib/business-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

function BusinessCard({ business, onBook }: { business: BusinessWithDetails; onBook: () => void }) {
  const location = business.locations?.[0];
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {business.logoUrl ? (
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={business.logoUrl}
                alt={business.name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted text-2xl font-bold text-muted-foreground">
              {business.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold">{business.name}</h3>
            <p className="text-sm capitalize text-muted-foreground">
              {business.category.replace(/_/g, ' ')}
            </p>
            {location?.city && (
              <p className="mt-1 text-xs text-muted-foreground">{location.city}</p>
            )}
            <Button className="mt-2" size="sm" onClick={onBook}>
              Book now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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

  const doSearch = (page = 1) => {
    setLoading(true);
    searchBusinesses({
      q: query || undefined,
      category: category || undefined,
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
  };

  useEffect(() => {
    doSearch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    router.push(`/search?${params}`);
    doSearch(1);
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Find a business</h1>

      <form onSubmit={handleSearch} className="mb-6 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {BUSINESS_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <Button type="submit">Search</Button>
      </form>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : results.length === 0 ? (
        <p className="text-muted-foreground">No businesses found.</p>
      ) : (
        <>
          {meta && (
            <p className="mb-4 text-sm text-muted-foreground">
              {meta.total} result{meta.total !== 1 ? 's' : ''}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {results.map((b) => (
              <BusinessCard
                key={b.id}
                business={b}
                onBook={() => router.push(`/b/${b.slug}/book`)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-4xl p-6">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
