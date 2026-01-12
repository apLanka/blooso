'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { getMyBusinesses } from '@/lib/business-client';
import * as staffClient from '@/lib/staff-client';
import * as serviceClient from '@/lib/service-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export default function StaffDetailPage() {
  const { user, isLoading, getToken } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const staffId = params.staffId as string;
  const businessId = searchParams.get('business');

  const [staff, setStaff] = useState<staffClient.StaffMember | null>(null);
  const [categories, setCategories] = useState<serviceClient.CategoryWithServices[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'services' | 'schedule'>('profile');

  const [profileForm, setProfileForm] = useState({
    name: '',
    role: 'staff',
    commissionRate: 0,
    bio: '',
    isActive: true,
  });
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [schedule, setSchedule] = useState<
    Record<number, { startTime: string; endTime: string; isAvailable: boolean }>
  >(
    Object.fromEntries(
      DAYS.map((d) => [
        d.value,
        { startTime: '09:00', endTime: '17:00', isAvailable: d.value !== 0 },
      ])
    )
  );

  const token = getToken();

  useEffect(() => {
    if (!token || !user || !staffId) return;

    const bid = businessId;
    if (!bid) {
      getMyBusinesses(token).then((list) => {
        if (list.length > 0) {
          router.replace(`/staff/${staffId}?business=${list[0]!.id}`);
        }
      });
      return;
    }

    Promise.all([
      staffClient.getStaffById(token, bid, staffId),
      serviceClient.getCategories(token, bid),
    ])
      .then(([s, cats]) => {
        setStaff(s);
        setCategories(cats);
        setProfileForm({
          name: s.user.name,
          role: s.role,
          commissionRate: s.commissionRate,
          bio: s.bio || '',
          isActive: s.isActive,
        });
        setSelectedServiceIds((s.staffServices ?? []).map((ss) => ss.serviceId));
        const toTime = (t: string) => (t ? t.slice(0, 5) : '09:00');
        const sched: Record<number, { startTime: string; endTime: string; isAvailable: boolean }> =
          {};
        if (s.staffSchedules?.length) {
          for (const item of s.staffSchedules) {
            sched[item.dayOfWeek] = {
              startTime: toTime(item.startTime),
              endTime: toTime(item.endTime),
              isAvailable: item.isAvailable,
            };
          }
        }
        for (const d of DAYS) {
          if (!(d.value in sched)) {
            sched[d.value] = {
              startTime: '09:00',
              endTime: '17:00',
              isAvailable: d.value !== 0,
            };
          }
        }
        setSchedule(sched);
      })
      .catch(() => setStaff(null))
      .finally(() => setLoading(false));
  }, [user, token, staffId, businessId, router]);

  if (isLoading || !user) {
    router.replace('/login');
    return null;
  }

  const currentBusinessId = businessId;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !currentBusinessId || !staff) return;
    setError(null);
    try {
      const updated = await staffClient.updateStaff(token, currentBusinessId, staffId, profileForm);
      setStaff(updated);
    } catch (err: unknown) {
      setError(
        err && typeof err === 'object' && 'body' in err
          ? ((err as { body?: { message?: string } }).body?.message as string)
          : 'Failed to update'
      );
    }
  };

  const handleSaveServices = async () => {
    if (!token || !currentBusinessId) return;
    setError(null);
    try {
      const updated = await staffClient.setStaffServices(
        token,
        currentBusinessId,
        staffId,
        selectedServiceIds
      );
      setStaff(updated);
    } catch (err: unknown) {
      setError(
        err && typeof err === 'object' && 'body' in err
          ? ((err as { body?: { message?: string } }).body?.message as string)
          : 'Failed to update services'
      );
    }
  };

  const handleSaveSchedule = async () => {
    if (!token || !currentBusinessId) return;
    setError(null);
    try {
      const scheduleArray = DAYS.map((d) => ({
        dayOfWeek: d.value,
        ...schedule[d.value],
      }));
      await staffClient.setStaffSchedule(token, currentBusinessId, staffId, scheduleArray);
      const updated = await staffClient.getStaffById(token, currentBusinessId, staffId);
      setStaff(updated);
    } catch (err: unknown) {
      setError(
        err && typeof err === 'object' && 'body' in err
          ? ((err as { body?: { message?: string } }).body?.message as string)
          : 'Failed to update schedule'
      );
    }
  };

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Staff not found.</p>
        <Link href={`/staff?business=${currentBusinessId}`}>
          <Button variant="outline">Back to staff</Button>
        </Link>
      </div>
    );
  }

  const allServices = categories.flatMap((c) => c.services);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/staff?business=${currentBusinessId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold">{staff.user.name}</h2>
          <p className="text-muted-foreground">{staff.user.email}</p>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2 border-b">
        {(['profile', 'services', 'schedule'] as const).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select
                  value={profileForm.role}
                  onValueChange={(v) => setProfileForm((f) => ({ ...f, role: v ?? 'staff' }))}
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
                  value={profileForm.commissionRate}
                  onChange={(e) =>
                    setProfileForm((f) => ({
                      ...f,
                      commissionRate: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Bio</Label>
                <Input
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm((f) => ({ ...f, bio: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={profileForm.isActive}
                  onCheckedChange={(v) => setProfileForm((f) => ({ ...f, isActive: v }))}
                />
                <Label>Active</Label>
              </div>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'services' && (
        <Card>
          <CardHeader>
            <CardTitle>Assigned services</CardTitle>
            <p className="text-sm text-muted-foreground">
              Select which services this staff can perform
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {categories.map((cat) => (
              <div key={cat.id}>
                <p className="mb-2 font-medium">{cat.name}</p>
                <div className="space-y-2">
                  {cat.services.map((svc) => (
                    <label key={svc.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedServiceIds.includes(svc.id)}
                        onChange={() => toggleService(svc.id)}
                      />
                      {svc.name} ({svc.durationMinutes} min)
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <Button onClick={handleSaveServices}>
              <Save className="mr-2 h-4 w-4" />
              Save assignments
            </Button>
          </CardContent>
        </Card>
      )}

      {activeTab === 'schedule' && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly schedule</CardTitle>
            <p className="text-sm text-muted-foreground">Set availability for each day</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {DAYS.map((day) => {
              const s = schedule[day.value];
              if (!s) return null;
              return (
                <div
                  key={day.value}
                  className="flex flex-wrap items-center gap-4 rounded-lg border p-3"
                >
                  <div className="w-24">{day.label}</div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={s.isAvailable}
                      onChange={(e) =>
                        setSchedule((prev) => ({
                          ...prev,
                          [day.value]: {
                            ...prev[day.value],
                            isAvailable: e.target.checked,
                          },
                        }))
                      }
                    />
                    Available
                  </label>
                  {s.isAvailable && (
                    <>
                      <Input
                        type="time"
                        value={s.startTime}
                        onChange={(e) =>
                          setSchedule((prev) => ({
                            ...prev,
                            [day.value]: {
                              ...prev[day.value],
                              startTime: e.target.value.slice(0, 5),
                            },
                          }))
                        }
                        className="w-28"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={s.endTime}
                        onChange={(e) =>
                          setSchedule((prev) => ({
                            ...prev,
                            [day.value]: {
                              ...prev[day.value],
                              endTime: e.target.value.slice(0, 5),
                            },
                          }))
                        }
                        className="w-28"
                      />
                    </>
                  )}
                </div>
              );
            })}
            <Button onClick={handleSaveSchedule}>
              <Save className="mr-2 h-4 w-4" />
              Save schedule
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
