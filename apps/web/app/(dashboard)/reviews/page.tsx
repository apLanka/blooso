'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { getMyBusinesses, type BusinessWithDetails } from '@/lib/business-client';
import { getReviewsForDashboard, replyToReview, type Review } from '@/lib/review-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star, MessageSquare, X } from 'lucide-react';
import { toast } from 'sonner';
import { ReviewsListSkeleton } from '@/components/skeletons';

export default function ReviewsPage() {
  const { user, isLoading, getToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessId = searchParams.get('business');

  const [businesses, setBusinesses] = useState<BusinessWithDetails[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = getToken();
  const currentBusinessId = businessId || businesses[0]?.id;

  useEffect(() => {
    if (!token || !user) return;
    getMyBusinesses(token)
      .then((list) => {
        setBusinesses(list);
        const bid = businessId && list.some((b) => b.id === businessId) ? businessId : list[0]?.id;
        if (bid && !businessId && list.length > 0) {
          router.replace(`/reviews?business=${bid}`);
        }
        return bid;
      })
      .catch(() => setBusinesses([]));
  }, [user, token, businessId, router]);

  useEffect(() => {
    if (!token || !currentBusinessId) return;
    getReviewsForDashboard(token, currentBusinessId)
      .then((r) => setReviews(r.data))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [token, currentBusinessId]);

  if (isLoading || !user) {
    router.replace('/login');
    return null;
  }

  const filteredReviews =
    ratingFilter === 'all'
      ? reviews
      : reviews.filter((r) => r.rating === parseInt(ratingFilter, 10));

  const handleReply = async (reviewId: string) => {
    if (!token || !replyText.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const updated = await replyToReview(token, reviewId, replyText.trim());
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, businessReply: updated.businessReply } : r))
      );
      setReplyingId(null);
      setReplyText('');
      toast.success('Reply sent');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'body' in err
          ? ((err as { body?: { message?: string } }).body?.message as string)
          : 'Failed to add reply';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <ReviewsListSkeleton />;
  }

  if (businesses.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Apply to list your business on Blooso to manage reviews.
        </p>
        <Button onClick={() => router.push('/dashboard')}>Apply for Business</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reviews</h2>
          <p className="text-muted-foreground">Manage and reply to customer reviews</p>
        </div>
        {businesses.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {businesses.map((b) => (
              <Button
                key={b.id}
                variant={b.id === currentBusinessId ? 'default' : 'outline'}
                size="sm"
                onClick={() => router.push(`/reviews?business=${b.id}`)}
              >
                {b.name}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Label htmlFor="rating-filter">Filter by rating</Label>
        <select
          id="rating-filter"
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="w-32 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">All</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={String(r)}>
              {r} stars
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {filteredReviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              {reviews.length === 0 ? 'No reviews yet.' : 'No reviews match the selected filter.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((r) => (
            <Card key={r.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
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
                    {r.comment && <p className="mt-2 text-sm">{r.comment}</p>}
                    {r.businessReply && (
                      <div className="mt-3 rounded bg-muted/50 p-3">
                        <p className="text-xs font-medium text-muted-foreground">Your reply</p>
                        <p className="text-sm">{r.businessReply}</p>
                      </div>
                    )}
                  </div>
                </div>
                {replyingId === r.id ? (
                  <div className="mt-4 space-y-2">
                    <Label>Your reply</Label>
                    <Input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleReply(r.id)}
                        disabled={submitting || !replyText.trim()}
                      >
                        {submitting ? 'Sending...' : 'Send reply'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setReplyingId(null);
                          setReplyText('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  !r.businessReply && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-4"
                      onClick={() => setReplyingId(r.id)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Reply
                    </Button>
                  )
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
