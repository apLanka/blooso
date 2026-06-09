'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { getMyBusinesses, type BusinessWithDetails } from '@/lib/business-client';
import * as clientClient from '@/lib/client-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, UserCircle, ChevronRight, Search, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ClientsListSkeleton } from '@/components/skeletons';

export default function ClientsPage() {
  const { user, isLoading, getToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessId = searchParams.get('business');

  const [businesses, setBusinesses] = useState<BusinessWithDetails[]>([]);
  const [clients, setClients] = useState<clientClient.Client[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const token = getToken();
  const currentBusinessId = businessId || businesses[0]?.id;

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!token || !user) return;

    getMyBusinesses(token)
      .then((list) => {
        setBusinesses(list);
        const bid = businessId && list.some((b) => b.id === businessId) ? businessId : list[0]?.id;
        if (bid && !businessId && list.length > 0) {
          router.replace(`/clients?business=${bid}`);
        }
        return bid;
      })
      .then((bid) => {
        if (bid) return clientClient.getClients(token, bid, { search: searchDebounced });
        return { data: [], total: 0, page: 1, limit: 20 };
      })
      .then((res) => {
        setClients(res.data);
        setTotal(res.total);
      })
      .catch(() => setClients([]))
      .finally(() => setLoading(false));
  }, [user, token, businessId, searchDebounced, router]);

  if (isLoading || !user) {
    router.replace('/login');
    return null;
  }

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !token ||
      !currentBusinessId ||
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim()
    )
      return;
    setSubmitting(true);
    setError(null);
    try {
      await clientClient.createClient(token, currentBusinessId, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
      });
      const res = await clientClient.getClients(token, currentBusinessId);
      setClients(res.data);
      setTotal(res.total);
      setForm({ firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '' });
      setFormOpen(false);
      toast.success('Client added successfully');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'body' in err
          ? ((err as { body?: { message?: string } }).body?.message as string)
          : 'Failed to add client';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d: string | null | undefined) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString();
  };

  if (loading) {
    return <ClientsListSkeleton />;
  }

  if (businesses.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Apply to list your business on Blooso to manage clients.
        </p>
        <Button onClick={() => router.push('/dashboard')}>Apply for Business</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Clients</h2>
          <p className="text-muted-foreground">
            Manage client profiles, notes, and appointment history
          </p>
        </div>
        {businesses.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {businesses.map((b) => (
              <Button
                key={b.id}
                variant={b.id === currentBusinessId ? 'default' : 'outline'}
                size="sm"
                onClick={() => router.push(`/clients?business=${b.id}`)}
              >
                {b.name}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add client
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Add client</h3>
                <Button variant="ghost" size="icon" onClick={() => setFormOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <form onSubmit={handleCreateClient} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>First name</Label>
                    <Input
                      value={form.firstName}
                      onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label>Last name</Label>
                    <Input
                      value={form.lastName}
                      onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                      required
                    />
                  </div>
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
                <div>
                  <Label>Phone (optional)</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Date of birth (optional)</Label>
                  <Input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Adding...' : 'Add client'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {clients.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <UserCircle className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No clients yet</h3>
            <p className="mb-4 text-center text-muted-foreground">
              {searchDebounced
                ? 'No clients match your search.'
                : 'Clients are auto-created when they book. You can also add them manually.'}
            </p>
            {!searchDebounced && (
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add your first client
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Phone</th>
                  <th className="px-4 py-3 text-left font-medium">Last visit</th>
                  <th className="px-4 py-3 text-left font-medium">Visits</th>
                  <th className="px-4 py-3 text-left font-medium">Tags</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id} className="border-b transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link
                        href={`/clients/${c.id}?business=${currentBusinessId}`}
                        className="font-medium hover:underline"
                      >
                        {c.firstName} {c.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.phone || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(c.lastVisit)}</td>
                    <td className="px-4 py-3">{c.totalVisits ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(c.tags ?? []).slice(0, 3).map((t) => (
                          <span
                            key={t.id}
                            className="rounded-full bg-primary/10 px-2 py-0.5 text-xs"
                          >
                            {t.tag}
                          </span>
                        ))}
                        {(c.tags ?? []).length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{(c.tags ?? []).length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/clients/${c.id}?business=${currentBusinessId}`}>
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total > clients.length && (
            <p className="px-4 py-2 text-sm text-muted-foreground">
              Showing {clients.length} of {total} clients
            </p>
          )}
        </div>
      )}
    </div>
  );
}
