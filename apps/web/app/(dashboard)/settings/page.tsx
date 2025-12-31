'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import {
  getMyBusinesses,
  getBusinessById,
  updateBusiness,
  type BusinessWithDetails,
} from '@/lib/business-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BUSINESS_CATEGORIES } from '@/lib/business-client';

export default function SettingsPage() {
  const { user, isLoading, getToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessId = searchParams.get('business');

  const [businesses, setBusinesses] = useState<BusinessWithDetails[]>([]);
  const [business, setBusiness] = useState<BusinessWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token || !user) return;

    getMyBusinesses(token)
      .then((list) => {
        setBusinesses(list);
        if (businessId && list.some((b) => b.id === businessId)) {
          return getBusinessById(token, businessId);
        }
        if (list.length > 0 && !businessId) {
          const first = list[0]!;
          router.replace(`/settings?business=${first.id}`);
          return getBusinessById(token, first.id);
        }
        return null;
      })
      .then((b) => {
        if (b) {
          setBusiness(b);
          setName(b.name);
          setCategory(b.category);
          setDescription(b.description || '');
          setLogoUrl(b.logoUrl || '');
        }
      })
      .catch(() => setBusinesses([]))
      .finally(() => setLoading(false));
  }, [user, getToken, businessId, router]);

  if (isLoading || !user) {
    router.replace('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">No businesses yet. Create one to get started.</p>
        <Button onClick={() => router.push('/onboarding')}>Create business</Button>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Select a business</p>
        <div className="flex flex-wrap gap-2">
          {businesses.map((b) => (
            <Button
              key={b.id}
              variant="outline"
              onClick={() => router.push(`/settings?business=${b.id}`)}
            >
              {b.name}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const token = getToken();
    if (!token) return;

    try {
      const updated = await updateBusiness(token, business.id, {
        name: name.trim(),
        category,
        description: description.trim() || null,
        logoUrl: logoUrl.trim() || null,
      });
      setBusiness(updated);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'body' in err
          ? (err as { body?: { message?: string } }).body?.message
          : 'Failed to update';
      setError(typeof msg === 'string' ? msg : 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Business settings</h2>
        <p className="text-muted-foreground">Edit your business information</p>
      </div>

      {businesses.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {businesses.map((b) => (
            <Button
              key={b.id}
              variant={b.id === business.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => router.push(`/settings?business=${b.id}`)}
            >
              {b.name}
            </Button>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{business.name}</CardTitle>
          <p className="text-sm text-muted-foreground">Slug: /b/{business.slug}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div>
              <Label htmlFor="name">Business name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v ?? '')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description"
              />
            </div>
            <div>
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {business.locations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {business.locations.map((loc) => (
                <li key={loc.id} className="rounded border p-3">
                  <p className="font-medium">{loc.name}</p>
                  <p className="text-sm text-muted-foreground">{loc.address}</p>
                  {loc.phone && <p className="text-sm text-muted-foreground">{loc.phone}</p>}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
