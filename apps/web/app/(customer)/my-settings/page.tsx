'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getMe, updateMe, type MeProfile } from '@/lib/me-client';
import { Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { getToken } = useAuth();
  const [profile, setProfile] = useState<MeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    getMe(token)
      .then((p) => {
        setProfile(p);
        setName(p.name);
        setEmail(p.email);
        setPhone(p.phone ?? '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [getToken]);

  const handleSave = async () => {
    const token = getToken();
    if (!token) return;

    setSaving(true);
    try {
      const updated = await updateMe(token, { name, email, phone });
      setProfile(updated);
      toast.success('Profile updated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div
          className="size-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'var(--blooso-border)', borderTopColor: 'var(--blooso-rose)' }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--blooso-text)' }}>
          Settings
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
          Manage your account information.
        </p>
      </div>

      <div
        className="rounded-[24px] p-6 sm:p-8"
        style={{ backgroundColor: '#fff', border: '1px solid var(--blooso-border-light)' }}
      >
        <h2 className="text-lg font-bold" style={{ color: 'var(--blooso-text)' }}>
          Profile
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
          Update your personal information.
        </p>

        <div className="mt-6 space-y-5">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium"
              style={{ color: 'var(--blooso-text)' }}
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-[10px] border px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-offset-0"
              style={{
                borderColor: 'var(--blooso-border)',
                color: 'var(--blooso-text)',
                backgroundColor: '#fff',
              }}
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium"
              style={{ color: 'var(--blooso-text)' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[10px] border px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-offset-0"
              style={{
                borderColor: 'var(--blooso-border)',
                color: 'var(--blooso-text)',
                backgroundColor: '#fff',
              }}
            />
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="mb-1.5 block text-sm font-medium"
              style={{ color: 'var(--blooso-text)' }}
            >
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full rounded-[10px] border px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-offset-0"
              style={{
                borderColor: 'var(--blooso-border)',
                color: 'var(--blooso-text)',
                backgroundColor: '#fff',
              }}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs" style={{ color: 'var(--blooso-text-subtle)' }}>
            Member since {profile ? new Date(profile.createdAt).toLocaleDateString() : ''}
          </p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-[10px] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: 'var(--blooso-rose)' }}
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
