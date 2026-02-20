'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBusinessBySlug, type BusinessPublicProfile } from '@/lib/business-client';
import { getReviews, type Review } from '@/lib/review-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, Star } from 'lucide-react';

export default function BusinessProfilePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [business, setBusiness] = useState<BusinessPublicProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getBusinessBySlug(slug)
      .then(setBusiness)
      .catch(() => setBusiness(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!business?.id) return;
    getReviews(business.id, { limit: 10 })
      .then((r) => setReviews(r.data))
      .catch(() => setReviews([]));
  }, [business?.id]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <p className="text-muted-foreground">Business not found.</p>
      </div>
    );
  }

  const services =
    business.serviceCategories?.flatMap((c) =>
      c.services.map((s) => ({ ...s, categoryName: c.name }))
    ) ?? [];

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-8">
        {business.logoUrl && (
          <div className="mb-4 h-24 w-24 overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={business.logoUrl}
              alt={business.name}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <h1 className="text-3xl font-bold">{business.name}</h1>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-sm capitalize text-muted-foreground">
            {business.category.replace(/_/g, ' ')}
          </p>
          {(business.avgRating ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {business.avgRating?.toFixed(1)} ({business.reviewCount ?? 0} reviews)
            </span>
          )}
        </div>
        {business.description && (
          <p className="mt-2 text-muted-foreground">{business.description}</p>
        )}
      </div>

      {business.locations?.[0] && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="font-semibold">Location</h3>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {business.locations[0].address}
              {business.locations[0].city && `, ${business.locations[0].city}`}
            </p>
            {business.locations[0].businessHours?.length ? (
              <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  {business.locations[0].businessHours
                    .filter((h) => !h.isClosed)
                    .map((h) => {
                      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                      return (
                        <p key={h.id}>
                          {days[h.dayOfWeek]}: {h.openTime} – {h.closeTime}
                        </p>
                      );
                    })}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="font-semibold">Services</h3>
          <div className="mt-4 space-y-4">
            {business.serviceCategories?.map((cat) => (
              <div key={cat.id}>
                <p className="mb-2 text-sm font-medium text-muted-foreground">{cat.name}</p>
                <div className="space-y-2">
                  {cat.services.map((svc) => (
                    <div
                      key={svc.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{svc.name}</p>
                        <p className="text-sm text-muted-foreground">{svc.durationMinutes} min</p>
                      </div>
                      <p className="font-medium">${svc.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {reviews.length > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="font-semibold">Reviews</h3>
            <div className="mt-4 space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {r.clientName ?? 'Anonymous'} · {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {r.comment && <p className="mt-1 text-sm">{r.comment}</p>}
                  {r.businessReply && (
                    <p className="mt-2 rounded bg-muted/50 p-2 text-sm italic">
                      Reply: {r.businessReply}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Button className="w-full" size="lg" onClick={() => router.push(`/b/${slug}/book`)}>
        Book now
      </Button>
    </div>
  );
}
