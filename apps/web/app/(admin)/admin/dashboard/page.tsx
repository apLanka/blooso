'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getAdminDashboardStats } from '@/lib/admin-client';
import { AdminDashboardStats } from '@repo/shared/types';
import { Users, Building2, Calendar, DollarSign, Clock, FileText } from 'lucide-react';

export default function AdminDashboardPage() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const data = await getAdminDashboardStats(token);
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
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

  const kpiCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users },
    { title: 'Total Businesses', value: stats?.totalBusinesses || 0, icon: Building2 },
    { title: 'Total Appointments', value: stats?.totalAppointments || 0, icon: Calendar },
    {
      title: 'Platform Revenue',
      value: `$${(stats?.totalRevenue || 0).toFixed(2)}`,
      icon: DollarSign,
    },
  ];

  return (
    <div className="animate-fade-up space-y-10 pb-12">
      <div>
        <h1
          className="text-3xl font-bold tracking-tight md:text-4xl"
          style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
        >
          Platform Overview
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
          High-level statistics across the entire Blooso platform.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className="flex flex-col rounded-[24px] bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              style={{ border: '1px solid var(--blooso-border-light)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="flex size-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'var(--blooso-bg-warm)' }}
                >
                  <Icon className="size-5" style={{ color: 'var(--blooso-rose)' }} />
                </div>
              </div>
              <p
                className="font-serif text-3xl font-bold tracking-tight"
                style={{ color: 'var(--blooso-text)' }}
              >
                {kpi.value}
              </p>
              <p
                className="mt-1 text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--blooso-text-subtle)' }}
              >
                {kpi.title}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Applications */}
        <div
          className="flex flex-col rounded-[24px] bg-white p-6 shadow-sm lg:p-8"
          style={{ border: '1px solid var(--blooso-border-light)' }}
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="size-5" style={{ color: 'var(--blooso-text-subtle)' }} />
              <h2
                className="text-xl font-bold"
                style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
              >
                Recent Applications
              </h2>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
              {stats?.totalApplications || 0} Total
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {stats?.recentApplications && stats.recentApplications.length > 0 ? (
              stats.recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between rounded-[12px] border p-4"
                  style={{ borderColor: 'var(--blooso-border-light)' }}
                >
                  <div>
                    <p className="font-bold text-sm" style={{ color: 'var(--blooso-text)' }}>
                      {app.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--blooso-text-muted)' }}>
                      by {app.user?.name} · {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-bold capitalize',
                      app.status === 'pending'
                        ? 'bg-amber-100 text-amber-700'
                        : app.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                    )}
                  >
                    {app.status}
                  </div>
                </div>
              ))
            ) : (
              <div
                className="py-8 text-center text-sm"
                style={{ color: 'var(--blooso-text-muted)' }}
              >
                No recent applications found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
