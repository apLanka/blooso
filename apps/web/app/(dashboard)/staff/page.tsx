'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { getMyBusinesses, type BusinessWithDetails } from '@/lib/business-client';
import * as staffClient from '@/lib/staff-client';
import { Plus, Users, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { StaffListSkeleton } from '@/components/skeletons';
import { cn } from '@/lib/utils';

// Helper to generate consistent colors based on a string (name)
function getAvatarColor(name: string) {
  const colors = [
    { bg: 'bg-[#fdf8f6]', text: 'text-[#8B3A52]' }, // Rose Tint
    { bg: 'bg-[#fdf6f0]', text: 'text-[#C9A87C]' }, // Sand Tint
    { bg: 'bg-blue-50', text: 'text-blue-700' },
    { bg: 'bg-emerald-50', text: 'text-emerald-700' },
    { bg: 'bg-purple-50', text: 'text-purple-700' },
    { bg: 'bg-indigo-50', text: 'text-indigo-700' },
  ];
  const charCode = name.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
}

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
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'staff',
    commissionRate: 0,
    bio: '',
  });

  const token = getToken();
  const currentBusinessId = businessId || businesses[0]?.id;

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
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F7F5]">
        <div
          className="size-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'var(--blooso-border)', borderTopColor: 'var(--blooso-rose)' }}
        />
      </div>
    );
  }

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !currentBusinessId || !form.name.trim() || !form.email.trim()) return;

    setSaving(true);
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
          ? (err as any).body?.message
          : 'Failed to add staff';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <StaffListSkeleton />;
  }

  if (businesses.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <Users className="mb-4 size-12 opacity-20" />
        <h2 className="mb-2 text-2xl font-bold font-serif">Welcome to Blooso</h2>
        <p className="mb-6 text-muted-foreground">You need to set up a business to manage staff.</p>
        <button
          onClick={() => router.push('/onboarding')}
          className="rounded-full px-8 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--blooso-rose)' }}
        >
          Create Business
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-10 pb-12">
      {/* ── HEADER ── */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight md:text-4xl"
            style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
          >
            Staff
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
            Manage your team members and their schedules
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {businesses.length > 1 && (
            <div className="flex shrink-0 flex-wrap gap-2 mr-4">
              {businesses.map((b) => (
                <button
                  key={b.id}
                  onClick={() => router.push(`/staff?business=${b.id}`)}
                  className={cn(
                    'rounded-full px-5 py-2 text-sm font-semibold transition-all',
                    b.id === currentBusinessId ? 'shadow-md' : 'hover:bg-black/5'
                  )}
                  style={{
                    backgroundColor:
                      b.id === currentBusinessId ? 'var(--blooso-text)' : 'transparent',
                    color: b.id === currentBusinessId ? '#fff' : 'var(--blooso-text)',
                    border: b.id === currentBusinessId ? 'none' : '1px solid var(--blooso-border)',
                  }}
                >
                  {b.name}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-95 shadow-md"
            style={{ backgroundColor: 'var(--blooso-rose)' }}
          >
            <Plus className="size-4" /> Add Staff Member
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-[12px] bg-red-50 p-4 text-sm font-semibold text-red-600 border border-red-100">
          {error}
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {staff.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-[32px] border border-dashed bg-[#F9F7F5] py-24 text-center transition-colors hover:bg-black/[0.02]"
          style={{ borderColor: 'var(--blooso-border-light)' }}
        >
          <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-white shadow-sm">
            <Users className="size-8" style={{ color: 'var(--blooso-rose)' }} />
          </div>
          <h3
            className="mb-2 text-2xl font-bold font-serif"
            style={{ color: 'var(--blooso-text)' }}
          >
            No staff members yet
          </h3>
          <p className="mb-8 max-w-sm text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
            Start building your team by adding your first staff member. You can configure their
            schedule and services later.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-95 shadow-md"
            style={{ backgroundColor: 'var(--blooso-rose)' }}
          >
            <Plus className="size-4" /> Add Staff Member
          </button>
        </div>
      ) : (
        /* ── STAFF GRID ── */
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {staff
            .filter((s) => s.isActive)
            .map((s) => {
              const avatarColor = getAvatarColor(s.user.name) ?? {
                bg: 'bg-gray-100',
                text: 'text-gray-700',
              };
              return (
                <Link key={s.id} href={`/staff/${s.id}?business=${currentBusinessId}`}>
                  <div
                    className="group flex flex-col rounded-[24px] bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-md border"
                    style={{ borderColor: 'var(--blooso-border-light)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            'flex size-14 items-center justify-center rounded-full font-serif text-xl font-bold',
                            avatarColor.bg,
                            avatarColor.text
                          )}
                        >
                          {s.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-lg font-bold" style={{ color: 'var(--blooso-text)' }}>
                            {s.user.name}
                          </p>
                          <p
                            className="text-sm font-medium"
                            style={{ color: 'var(--blooso-text-muted)' }}
                          >
                            {s.user.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex size-10 items-center justify-center rounded-full bg-black/5 opacity-0 transition-all group-hover:opacity-100 group-hover:bg-black/10">
                        <ChevronRight className="size-5" style={{ color: 'var(--blooso-text)' }} />
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-black/60">
                        {s.role.replace(/_/g, ' ')}
                      </span>
                      <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-black/60">
                        {s.staffServices?.length ?? 0} Services
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
      )}

      {/* ── ADD STAFF MODAL ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="w-full max-w-lg rounded-[24px] bg-white shadow-xl animate-in zoom-in-95 duration-200">
            <div
              className="flex items-center justify-between border-b p-6"
              style={{ borderColor: 'var(--blooso-border-light)' }}
            >
              <h3 className="text-xl font-bold font-serif">New Staff Member</h3>
              <button
                onClick={() => setShowForm(false)}
                className="flex size-8 items-center justify-center rounded-full bg-black/5 transition-colors hover:bg-black/10"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-black">Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-[12px] border px-4 py-3 text-sm outline-none transition-all"
                    style={{
                      borderColor: 'var(--blooso-border)',
                      outlineColor: 'var(--blooso-rose)',
                    }}
                    placeholder="Jane Doe"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-black">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full rounded-[12px] border px-4 py-3 text-sm outline-none transition-all"
                    style={{
                      borderColor: 'var(--blooso-border)',
                      outlineColor: 'var(--blooso-rose)',
                    }}
                    placeholder="jane@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-black">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                    className="w-full rounded-[12px] border px-4 py-3 text-sm outline-none transition-all appearance-none capitalize"
                    style={{
                      borderColor: 'var(--blooso-border)',
                      outlineColor: 'var(--blooso-rose)',
                    }}
                  >
                    {staffClient.STAFF_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-black">Commission</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={form.commissionRate || ''}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, commissionRate: parseFloat(e.target.value) || 0 }))
                      }
                      className="w-full rounded-[12px] border pl-4 pr-10 py-3 text-sm outline-none transition-all"
                      style={{
                        borderColor: 'var(--blooso-border)',
                        outlineColor: 'var(--blooso-rose)',
                      }}
                      placeholder="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-black/40">
                      %
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-black">
                  Bio <span className="text-black/40 font-medium">(Optional)</span>
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  className="w-full rounded-[12px] border px-4 py-3 text-sm outline-none transition-all resize-none"
                  style={{
                    borderColor: 'var(--blooso-border)',
                    outlineColor: 'var(--blooso-rose)',
                  }}
                  placeholder="Tell us a bit about this staff member..."
                  rows={3}
                />
              </div>

              <div
                className="flex gap-3 pt-4 border-t"
                style={{ borderColor: 'var(--blooso-border-light)' }}
              >
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-[12px] px-6 py-3.5 text-sm font-bold transition-colors hover:bg-black/5"
                  style={{ color: 'var(--blooso-text)', border: '1px solid var(--blooso-border)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex flex-1 items-center justify-center rounded-[12px] py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                  style={{ backgroundColor: 'var(--blooso-rose)' }}
                >
                  {saving ? 'Adding...' : 'Add Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
