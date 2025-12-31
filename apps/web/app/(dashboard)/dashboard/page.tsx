'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { getMyBusinesses, type BusinessWithDetails } from '@/lib/business-client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isLoading, getToken } = useAuth();
  const router = useRouter();
  const [businesses, setBusinesses] = useState<BusinessWithDetails[] | null>(null);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token || !user) return;

    getMyBusinesses(token)
      .then(setBusinesses)
      .catch(() => setBusinesses([]))
      .finally(() => setLoadingBusinesses(false));
  }, [user, getToken]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    router.replace('/login');
    return null;
  }

  if (loadingBusinesses) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!businesses || businesses.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Welcome, {user.name}</h2>
          <p className="text-muted-foreground">Get started by creating your first business.</p>
        </div>
        <Link href="/onboarding">
          <Button>Create your business</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Welcome, {user.name}</h2>
        <p className="text-muted-foreground">{user.email}</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your businesses</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {businesses.map((b) => (
            <Link
              key={b.id}
              href={`/settings?business=${b.id}`}
              className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <h4 className="font-medium">{b.name}</h4>
              <p className="text-sm text-muted-foreground capitalize">{b.category}</p>
              {b.locations.length > 0 && (
                <p className="mt-2 text-sm text-muted-foreground">{b.locations[0]!.address}</p>
              )}
            </Link>
          ))}
        </div>
      </div>

      <Link href="/onboarding">
        <Button variant="outline">Add another business</Button>
      </Link>
    </div>
  );
}
