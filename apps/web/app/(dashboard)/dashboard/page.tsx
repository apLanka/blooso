'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Welcome, {user.name}</h2>
        <p className="text-muted-foreground">{user.email}</p>
      </div>
      <Button
        variant="outline"
        onClick={async () => {
          await logout();
          router.push('/login');
        }}
      >
        Sign out
      </Button>
    </div>
  );
}
