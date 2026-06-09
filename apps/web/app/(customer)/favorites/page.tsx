'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getMyFavorites, removeFavorite, type FavoriteBusiness } from '@/lib/me-client';
import Link from 'next/link';
import { Heart, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function FavoritesPage() {
  const { getToken } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteBusiness[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    getMyFavorites(token)
      .then(setFavorites)
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false));
  }, [getToken]);

  const handleRemove = async (businessId: string, name: string) => {
    const token = getToken();
    if (!token) return;

    try {
      await removeFavorite(token, businessId);
      setFavorites((prev) => prev.filter((f) => f.id !== businessId));
      toast.success(`Removed ${name} from favorites`);
    } catch {
      toast.error('Failed to remove from favorites');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div
          className="size-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'var(--blooso-border)', borderTopColor: 'var(--blooso-rose)' }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--blooso-text)' }}>
          Favorites
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
          Your saved businesses for quick access.
        </p>
      </div>

      {favorites.length === 0 ? (
        <div
          className="rounded-[24px] p-12 text-center"
          style={{ backgroundColor: '#fff', border: '1px solid var(--blooso-border-light)' }}
        >
          <Heart className="mx-auto size-12 text-black/15" />
          <p className="mt-4 text-sm font-medium" style={{ color: 'var(--blooso-text-muted)' }}>
            No favorites yet
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--blooso-text-subtle)' }}>
            Save businesses you love for quick access.
          </p>
          <Link
            href="/search"
            className="mt-4 inline-block text-sm font-semibold hover:underline"
            style={{ color: 'var(--blooso-rose)' }}
          >
            Discover Services
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((biz) => (
            <div
              key={biz.id}
              className="group relative rounded-[20px] p-5 transition-all hover:shadow-md"
              style={{ backgroundColor: '#fff', border: '1px solid var(--blooso-border-light)' }}
            >
              <button
                onClick={() => handleRemove(biz.id, biz.name)}
                className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/5 text-black/30 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                title="Remove from favorites"
              >
                <Trash2 className="size-4" />
              </button>

              <Link href={`/b/${biz.slug}`} className="block">
                <div className="flex items-center gap-4">
                  {biz.logoUrl ? (
                    <img
                      src={biz.logoUrl}
                      alt={biz.name}
                      className="size-16 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex size-16 items-center justify-center rounded-full text-xl font-bold"
                      style={{ backgroundColor: 'var(--blooso-rose)', color: '#fff' }}
                    >
                      {biz.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold truncate" style={{ color: 'var(--blooso-text)' }}>
                      {biz.name}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
                      {biz.category}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        <span
                          className="text-sm font-medium"
                          style={{ color: 'var(--blooso-text)' }}
                        >
                          {biz.avgRating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-xs" style={{ color: 'var(--blooso-text-subtle)' }}>
                        ({biz.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
