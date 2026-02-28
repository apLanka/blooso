'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, RefreshCw } from 'lucide-react';

export default function ServerErrorPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-destructive/10 p-4">
              <span className="text-4xl font-bold text-destructive">500</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Server error</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Something went wrong on our end. Please try again later.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/">
                <Button>
                  <Home className="mr-2 h-4 w-4" />
                  Go home
                </Button>
              </Link>
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
