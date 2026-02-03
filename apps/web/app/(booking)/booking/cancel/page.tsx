'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function BookingCancelPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center p-6">
      <Card className="w-full">
        <CardContent className="pt-8 pb-8">
          <h1 className="mb-2 text-xl font-semibold">Payment cancelled</h1>
          <p className="mb-6 text-center text-muted-foreground">
            Your payment was cancelled. No charges have been made. You can try again when
            you&apos;re ready.
          </p>
          <div className="flex justify-center gap-2">
            <Link href="/search">
              <Button>Find a business</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Back to home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
