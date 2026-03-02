'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { getMyBusinesses, type BusinessWithDetails } from '@/lib/business-client';
import * as staffClient from '@/lib/staff-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Users, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { StaffListSkeleton } from '@/components/skeletons';

export default function StaffPage() {
  const { user, isLoading, getToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessId = searchParams.get('business');

  const [businesses, setBusinesses] = useState<BusinessWithDetails[]>([]);
  const [staff, setStaff] = useState<staffClient.StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'staff',
    commissionRate: 0,
    bio: '',
  });

  const token = getToken();

  useEffect(() => {
    if (!token || !user) return;

    getMyBusinesses(token)
      .then((list) => {
        setBusinesses(list);
        const bid = businessId && list.some((b) => b.id === businessId) ? businessId : list[0]?.id;
        if (bid) {
          if (!businessId && list.length > 0) {
            router.replace(`/staff?business=${bid}`);
          }
          return staffClient.getStaff(token, bid);
        }
        return [];
      })
      .then(setStaff)
      .catch(() => setStaff([]))
      .finally(() => setLoading(false));
  }, [user, token, businessId, router]);

  if (isLoading || !user) {
    router.replace('/login');
    return null;
  }

  const currentBusinessId = businessId || businesses[0]?.id;

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !currentBusinessId || !form.name.trim() || !form.email.trim()) return;
    setError(null);
    try {
      await staffClient.createStaff(token, currentBusinessId, {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        commissionRate: form.commissionRate,
        bio: form.bio.trim() || null,
      });
      const data = await staffClient.getStaff(token, currentBusinessId);
      setStaff(data);
      setForm({ name: '', email: '', role: 'staff', commissionRate: 0, bio: '' });
      setShowForm(false);
      toast.success('Staff member added');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'body' in err
          ? ((err as { body?: { message?: string } }).body?.message as string)
          : 'Failed to add staff';
      setError(msg);
      toast.error(msg);
    }
  };

  if (loading) {
    return <StaffListSkeleton />;
  }

  if (businesses.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Create a business first.</p>
        <Button onClick={() => router.push('/onboarding')}>Create business</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Staff</h2>
          <p className="text-muted-foreground">Manage your team members and their schedules</p>
        </div>
        {businesses.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {businesses.map((b) => (
              <Button
                key={b.id}
                variant={b.id === currentBusinessId ? 'default' : 'outline'}
                size="sm"
                onClick={() => router.push(`/staff?business=${b.id}`)}
              >
                {b.name}
              </Button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Role</Label>
                  <Select
                    value={form.role}
                    onValueChange={(v) => setForm((f) => ({ ...f, role: v ?? 'staff' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {staffClient.STAFF_ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Commission %</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={form.commissionRate}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        commissionRate: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Bio (optional)</Label>
                <Input
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Add staff</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {staff.length === 0 && !showForm ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No staff yet</h3>
            <p className="mb-4 text-center text-muted-foreground">
              Add team members to assign services and schedules
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add your first staff member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add staff
            </Button>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {staff
              .filter((s) => s.isActive)
              .map((s) => (
                <Link key={s.id} href={`/staff/${s.id}?business=${currentBusinessId}`}>
                  <Card className="transition-colors hover:bg-muted/50">
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium">{s.user.name}</p>
                        <p className="text-sm text-muted-foreground">{s.user.email}</p>
                        <p className="mt-1 text-xs capitalize text-muted-foreground">
                          {s.role.replace(/_/g, ' ')} · {s.staffServices?.length ?? 0} services
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
