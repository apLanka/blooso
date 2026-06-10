'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getAdminBusinesses } from '@/lib/admin-client';
import { AdminBusinessDTO } from '@repo/shared/types';
import { Building2, Calendar, MapPin, Users, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminBusinessesPage() {
  const { getToken } = useAuth();
  const [businesses, setBusinesses] = useState<AdminBusinessDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const data = await getAdminBusinesses(token);
        setBusinesses(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBusinesses();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div
          className="size-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'var(--blooso-border)', borderTopColor: 'var(--blooso-rose)' }}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-8 pb-12">
      <div>
        <h1
          className="text-3xl font-bold tracking-tight md:text-4xl"
          style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
        >
          Businesses
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
          Manage all approved businesses on the platform.
        </p>
      </div>

      <div
        className="rounded-[24px] bg-white shadow-sm"
        style={{ border: '1px solid var(--blooso-border-light)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Business</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4">Staff</th>
                <th className="px-6 py-4">Appointments</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {businesses.map((b) => (
                <tr key={b.id} className="transition-colors hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <Building2 className="size-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{b.name}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="size-3" /> {b.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{b.owner.name}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Mail className="size-3" /> {b.owner.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Calendar className="size-3.5 opacity-50" />
                      {new Date(b.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-900">{b._count.staffMembers}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-900">{b._count.appointments}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
