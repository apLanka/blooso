'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getAdminUsers } from '@/lib/admin-client';
import { AdminUserDTO } from '@repo/shared/types';
import { Users as UsersIcon, Shield, Mail, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminUsersPage() {
  const { getToken } = useAuth();
  const [users, setUsers] = useState<AdminUserDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const data = await getAdminUsers(token);
        setUsers(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
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

  const roleColors: Record<string, string> = {
    admin: 'bg-rose-100 text-rose-700',
    owner: 'bg-emerald-100 text-emerald-700',
    manager: 'bg-blue-100 text-blue-700',
    staff: 'bg-amber-100 text-amber-700',
    client: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="animate-fade-up space-y-8 pb-12">
      <div>
        <h1
          className="text-3xl font-bold tracking-tight md:text-4xl"
          style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
        >
          Users
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
          Manage all users registered on the platform.
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
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Businesses</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <UsersIcon className="size-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Mail className="size-3" /> {u.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider',
                        roleColors[u.role] || roleColors.client
                      )}
                    >
                      {u.role === 'admin' && <Shield className="size-3" />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Calendar className="size-3.5 opacity-50" />
                      {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-900">
                      {u.businesses.length > 0 ? `${u.businesses.length} Businesses` : '-'}
                    </span>
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
