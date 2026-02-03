'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (sessionId) {
      setStatus('success');
    } else {
      setStatus('error');
    }
  }, [sessionId]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center p-6">
      {status === 'loading' && <p className="text-muted-foreground">Processing...</p>}
      {status === 'success' && (
        <Card className="w-full">
          <CardContent className="flex flex-col items-center pt-8 pb-8">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="mb-2 text-xl font-semibold">Payment successful</h1>
            <p className="mb-6 text-center text-muted-foreground">
              Your payment has been processed. You will receive a confirmation email shortly.
            </p>
            <div className="flex gap-2">
              <Link href="/search">
                <Button>Find another business</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Back to home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
      {status === 'error' && (
        <Card className="w-full">
          <CardContent className="pt-8 pb-8">
            <p className="text-center text-muted-foreground">
              Unable to verify payment. If you completed payment, check your email for confirmation.
            </p>
            <div className="mt-4 flex justify-center">
              <Link href="/search">
                <Button>Find a business</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
