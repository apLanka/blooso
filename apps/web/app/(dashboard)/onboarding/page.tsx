'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
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
import {
  createBusiness,
  createLocation,
  setBusinessHours,
  BUSINESS_CATEGORIES,
} from '@/lib/business-client';

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export default function OnboardingPage() {
  const { user, isLoading, getToken } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Business info
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  // Step 2: Location
  const [locName, setLocName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [phone, setPhone] = useState('');

  // Step 3: Hours
  const [hours, setHours] = useState(
    DAYS.map((d) => ({
      dayOfWeek: d.value,
      openTime: '09:00',
      closeTime: '17:00',
      isClosed: d.value === 0,
    }))
  );

  const token = getToken(); // From auth context

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!token) {
    router.replace('/login');
    return null;
  }

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Business name is required');
      return;
    }
    if (!category) {
      setError('Category is required');
      return;
    }
    setStep(2);
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!locName.trim()) {
      setError('Location name is required');
      return;
    }
    if (!address.trim()) {
      setError('Address is required');
      return;
    }
    if (!country.trim()) {
      setError('Country is required');
      return;
    }
    setStep(3);
  };

  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const business = await createBusiness(token, {
        name: name.trim(),
        category,
        description: description.trim() || undefined,
      });

      const location = await createLocation(token, business.id, {
        name: locName.trim(),
        address: address.trim(),
        city: city.trim() || undefined,
        country: country.trim(),
        timezone: timezone || 'UTC',
        phone: phone.trim() || undefined,
      });

      await setBusinessHours(token, business.id, location.id, hours);

      setStep(4);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'body' in err
          ? (err as { body?: { message?: string } }).body?.message
          : 'Something went wrong';
      setError(typeof msg === 'string' ? msg : 'Failed to create business');
    } finally {
      setLoading(false);
    }
  };

  const updateHours = (dayIndex: number, field: string, value: string | boolean) => {
    setHours((prev) =>
      prev.map((h, i) =>
        i === dayIndex ? { ...h, [field]: value } : h
      )
    );
  };

  if (step === 4) {
    return (
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>All set!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Your business has been created successfully. You can now manage
              your settings and add services.
            </p>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && 'Step 1: Business info'}
            {step === 2 && 'Step 2: Location'}
            {step === 3 && 'Step 3: Business hours'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {step === 1 && 'Tell us about your business'}
            {step === 2 && 'Add your primary location'}
            {step === 3 && 'Set your business hours'}
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="mb-4 text-sm text-destructive">{error}</p>
          )}

          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4">
              <div>
                <Label htmlFor="name">Business name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Blooso Salon"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v ?? '')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
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
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of your business"
                />
              </div>
              <Button type="submit" className="w-full">
                Next
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-4">
              <div>
                <Label htmlFor="locName">Location name</Label>
                <Input
                  id="locName"
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                  placeholder="e.g. Main location"
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address"
                />
              </div>
              <div>
                <Label htmlFor="city">City (optional)</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Country"
                />
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  placeholder="UTC"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" type="button" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="submit" className="flex-1">
                  Next
                </Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleStep3} className="space-y-4">
              <div className="space-y-3">
                {DAYS.map((day) => {
                  const h = hours.find((x) => x.dayOfWeek === day.value)!;
                  return (
                    <div
                      key={day.value}
                      className="flex flex-wrap items-center gap-2 rounded-lg border p-3"
                    >
                      <div className="w-24 flex-shrink-0">{day.label}</div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={h.isClosed}
                          onChange={(e) =>
                            updateHours(
                              hours.findIndex((x) => x.dayOfWeek === day.value),
                              'isClosed',
                              e.target.checked
                            )
                          }
                        />
                        <span className="text-sm">Closed</span>
                      </label>
                      {!h.isClosed && (
                        <>
                          <Input
                            type="time"
                            value={h.openTime}
                            onChange={(e) =>
                              updateHours(
                                hours.findIndex(
                                  (x) => x.dayOfWeek === day.value
                                ),
                                'openTime',
                                e.target.value.slice(0, 5)
                              )
                            }
                            className="w-28"
                          />
                          <span className="text-muted-foreground">to</span>
                          <Input
                            type="time"
                            value={h.closeTime}
                            onChange={(e) =>
                              updateHours(
                                hours.findIndex(
                                  (x) => x.dayOfWeek === day.value
                                ),
                                'closeTime',
                                e.target.value.slice(0, 5)
                              )
                            }
                            className="w-28"
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" type="button" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? 'Creating...' : 'Complete'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
