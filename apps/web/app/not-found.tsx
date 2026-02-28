import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-muted p-4">
              <span className="text-6xl font-bold text-muted-foreground">404</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Page not found</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/">
                <Button>
                  <Home className="mr-2 h-4 w-4" />
                  Go home
                </Button>
              </Link>
              <Link href="/search">
                <Button variant="outline">
                  <Search className="mr-2 h-4 w-4" />
                  Find a business
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
