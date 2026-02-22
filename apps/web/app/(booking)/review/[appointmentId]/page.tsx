'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createReview } from '@/lib/review-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Star, Check } from 'lucide-react';

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.appointmentId as string;

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentId || rating < 1) return;
    setSubmitting(true);
    setError(null);
    try {
      await createReview({
        appointmentId,
        rating,
        comment: comment.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      setError(
        err && typeof err === 'object' && 'body' in err
          ? ((err as { body?: { message?: string } }).body?.message as string)
          : 'Failed to submit review'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center p-6">
        <Card className="w-full">
          <CardContent className="flex flex-col items-center pt-8 pb-8">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="mb-2 text-xl font-semibold">Thank you for your review!</h1>
            <p className="mb-6 text-center text-muted-foreground">
              Your feedback helps us improve our service.
            </p>
            <Button onClick={() => router.push('/search')}>Find another business</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <Card>
        <CardContent className="pt-6">
          <h1 className="mb-2 text-xl font-semibold">How was your experience?</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Share your feedback to help others and improve our service.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Rating</Label>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    className="rounded p-1 transition-colors hover:bg-muted"
                    onClick={() => setRating(i)}
                    onMouseEnter={() => setHoverRating(i)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    <Star
                      className={`h-10 w-10 ${
                        i <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Comment (optional)</Label>
              <textarea
                className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us more about your experience..."
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting || rating < 1}>
              {submitting ? 'Submitting...' : 'Submit review'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
