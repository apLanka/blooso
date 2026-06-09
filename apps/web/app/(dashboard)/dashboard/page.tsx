'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { getMyBusinesses, type BusinessWithDetails } from '@/lib/business-client';
import { getMyApplication } from '@/lib/application-client';
import {
  getDashboard,
  getRevenue,
  getTopServices,
  getAppointmentsReport,
} from '@/lib/report-client';
import Link from 'next/link';
import {
  DollarSign,
  Calendar,
  Users,
  Star,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Clock,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function DashboardPage() {
  const { user, isLoading, getToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessId = searchParams.get('business');

  const [businesses, setBusinesses] = useState<BusinessWithDetails[] | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getDashboard>> | null>(null);
  const [revenueData, setRevenueData] = useState<{ date: string; revenue: number }[]>([]);
  const [topServices, setTopServices] = useState<
    Awaited<ReturnType<typeof getTopServices>>['data']
  >([]);
  const [appointmentsData, setAppointmentsData] = useState<{ date: string; total: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const token = getToken();
  const currentBusinessId = businessId || businesses?.[0]?.id;

  useEffect(() => {
    if (!token || !user) return;
    getMyBusinesses(token)
      .then((list) => {
        setBusinesses(list);
        const bid = businessId && list.some((b) => b.id === businessId) ? businessId : list[0]?.id;
        if (bid && !businessId && list.length > 0) {
          router.replace(`/dashboard?business=${bid}`);
        }
        if (list.length === 0) {
          getMyApplication(token)
            .then((app) => setApplicationStatus(app?.status || null))
            .catch(() => {});
        }
        return bid;
      })
      .catch(() => setBusinesses([]));
  }, [user, token, businessId, router]);

  useEffect(() => {
    if (!token || !currentBusinessId) return;
    Promise.all([
      getDashboard(token, currentBusinessId),
      getRevenue(token, currentBusinessId, 'week'),
      getTopServices(token, currentBusinessId),
      getAppointmentsReport(token, currentBusinessId, 'week'),
    ])
      .then(([dashboard, revenue, services, appointments]) => {
        setStats(dashboard);
        setRevenueData(revenue.data);
        setTopServices(services.data);
        setAppointmentsData(appointments.data.map((d) => ({ date: d.date, total: d.total })));
      })
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [token, currentBusinessId]);

  if (isLoading || !user) {
    router.replace('/login');
    return null;
  }

  if (loading && !stats) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div
          className="size-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'var(--blooso-border)', borderTopColor: 'var(--blooso-rose)' }}
        />
      </div>
    );
  }

  if (!businesses || businesses.length === 0) {
    if (applicationStatus === 'pending') {
      return (
        <div
          className="animate-fade-in flex flex-col items-center justify-center rounded-[32px] px-6 py-24 text-center bg-white shadow-sm"
          style={{ border: '1px solid var(--blooso-border-light)' }}
        >
          <div
            className="mb-6 flex size-20 items-center justify-center rounded-full"
            style={{ backgroundColor: '#FEF3C7' }}
          >
            <Clock className="size-10 text-yellow-600" />
          </div>
          <h2
            className="mb-3 text-3xl font-bold"
            style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
          >
            Application Pending
          </h2>
          <p className="mb-8 max-w-sm text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
            Your business application is being reviewed. You'll get access to the dashboard once
            approved.
          </p>
          <button
            onClick={() => router.push('/my-bookings')}
            className="rounded-[10px] px-8 py-3.5 text-sm font-semibold transition-all hover:bg-black/5 active:scale-[0.98]"
            style={{ color: 'var(--blooso-text)', border: '1px solid var(--blooso-border)' }}
          >
            Go to Client Dashboard
          </button>
        </div>
      );
    }

    if (applicationStatus === 'rejected') {
      return (
        <div
          className="animate-fade-in flex flex-col items-center justify-center rounded-[32px] px-6 py-24 text-center bg-white shadow-sm"
          style={{ border: '1px solid var(--blooso-border-light)' }}
        >
          <div
            className="mb-6 flex size-20 items-center justify-center rounded-full"
            style={{ backgroundColor: '#FEE2E2' }}
          >
            <FileText className="size-10 text-red-600" />
          </div>
          <h2
            className="mb-3 text-3xl font-bold"
            style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
          >
            Application Rejected
          </h2>
          <p className="mb-8 max-w-sm text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
            Your previous business application was not approved. You can apply again.
          </p>
          <Link
            href="/onboarding"
            className="rounded-[10px] px-8 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: 'var(--blooso-rose)' }}
          >
            Apply Again
          </Link>
        </div>
      );
    }

    return (
      <div
        className="animate-fade-in flex flex-col items-center justify-center rounded-[32px] px-6 py-24 text-center bg-white shadow-sm"
        style={{ border: '1px solid var(--blooso-border-light)' }}
      >
        <div
          className="mb-6 flex size-20 items-center justify-center rounded-full"
          style={{ backgroundColor: 'var(--blooso-sand-light)' }}
        >
          <span className="font-serif text-3xl font-bold" style={{ color: 'var(--blooso-text)' }}>
            B
          </span>
        </div>
        <h2
          className="mb-3 text-3xl font-bold"
          style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
        >
          Welcome to Blooso
        </h2>
        <p className="mb-8 max-w-sm text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
          Get started managing your salon or spa by applying to list your business on Blooso.
        </p>
        <Link
          href="/onboarding"
          className="rounded-[10px] px-8 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: 'var(--blooso-rose)' }}
        >
          Apply for Business
        </Link>
      </div>
    );
  }

  const kpiCards = [
    {
      title: "Today's Revenue",
      value: `$${(stats?.todayRevenue ?? 0).toFixed(2)}`,
      icon: DollarSign,
    },
    {
      title: "Today's Bookings",
      value: stats?.todayAppointments ?? 0,
      icon: Calendar,
    },
    {
      title: 'Total Clients',
      value: stats?.totalClients ?? 0,
      icon: Users,
    },
    {
      title: 'Average Rating',
      value: (stats?.avgRating ?? 0).toFixed(1),
      sub: `${stats?.reviewCount ?? 0} reviews`,
      icon: Star,
    },
  ];

  return (
    <div className="animate-fade-up space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight md:text-4xl"
            style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
          >
            Overview
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
            Here's what's happening at your business today.
          </p>
        </div>

        {businesses.length > 1 && (
          <div className="flex shrink-0 flex-wrap gap-2">
            {businesses.map((b) => (
              <button
                key={b.id}
                onClick={() => router.push(`/dashboard?business=${b.id}`)}
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
              {kpi.sub && (
                <p
                  className="mt-1.5 text-xs font-medium"
                  style={{ color: 'var(--blooso-text-muted)' }}
                >
                  {kpi.sub}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Charts & Schedule */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Revenue Chart */}
        <div
          className="lg:col-span-8 flex flex-col rounded-[24px] bg-white p-6 shadow-sm lg:p-8"
          style={{ border: '1px solid var(--blooso-border-light)' }}
        >
          <div className="mb-8 flex items-center gap-3">
            <TrendingUp className="size-5" style={{ color: 'var(--blooso-text-subtle)' }} />
            <h2
              className="text-xl font-bold"
              style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
            >
              Revenue (7 days)
            </h2>
          </div>

          <div className="h-[300px] w-full">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    dy={10}
                    tickFormatter={(v) =>
                      new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                    }
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    }}
                    labelFormatter={(v) =>
                      new Date(v).toLocaleDateString(undefined, {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--blooso-rose)"
                    strokeWidth={4}
                    dot={{ fill: 'var(--blooso-rose)', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div
                className="flex h-full items-center justify-center text-sm font-medium"
                style={{ color: 'var(--blooso-text-muted)' }}
              >
                No revenue data yet
              </div>
            )}
          </div>
        </div>

        {/* Today's Schedule */}
        <div
          className="lg:col-span-4 flex flex-col rounded-[24px] p-6 shadow-sm lg:p-8"
          style={{
            backgroundColor: 'var(--blooso-bg-warm)',
            border: '1px solid var(--blooso-border-light)',
          }}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2
              className="text-xl font-bold"
              style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
            >
              Today's Schedule
            </h2>
            <Link
              href={`/calendar?business=${currentBusinessId}`}
              className="flex size-8 items-center justify-center rounded-full bg-white shadow-sm transition-transform hover:scale-110"
              style={{ color: 'var(--blooso-text)' }}
            >
              <ChevronRight className="size-4" />
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            {stats?.todaySchedule && stats.todaySchedule.length > 0 ? (
              <div className="flex flex-col gap-4">
                {stats.todaySchedule.map((apt) => (
                  <div
                    key={apt.id}
                    className="group flex flex-col rounded-[16px] bg-white p-4 shadow-sm transition-all hover:shadow-md"
                    style={{ border: '1px solid var(--blooso-border-light)' }}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <Clock className="size-3.5" style={{ color: 'var(--blooso-rose)' }} />
                      <span
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: 'var(--blooso-rose)' }}
                      >
                        {new Date(apt.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="font-semibold" style={{ color: 'var(--blooso-text)' }}>
                      {apt.appointmentServices
                        ?.map((as) => as.service?.name)
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                    <p
                      className="mt-1 text-xs font-medium"
                      style={{ color: 'var(--blooso-text-muted)' }}
                    >
                      with {apt.staff?.user.name}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
                <Calendar
                  className="mb-3 size-8 opacity-20"
                  style={{ color: 'var(--blooso-text)' }}
                />
                <p className="text-sm font-medium" style={{ color: 'var(--blooso-text-muted)' }}>
                  No appointments scheduled for today.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bookings Chart */}
        <div
          className="flex flex-col rounded-[24px] bg-white p-6 shadow-sm lg:p-8"
          style={{ border: '1px solid var(--blooso-border-light)' }}
        >
          <div className="mb-8 flex items-center gap-3">
            <BarChart3 className="size-5" style={{ color: 'var(--blooso-text-subtle)' }} />
            <h2
              className="text-xl font-bold"
              style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
            >
              Bookings (7 days)
            </h2>
          </div>

          <div className="h-[260px] w-full">
            {appointmentsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={appointmentsData}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                  barSize={32}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    dy={10}
                    tickFormatter={(v) =>
                      new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                    }
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar dataKey="total" fill="var(--blooso-sand)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                className="flex h-full items-center justify-center text-sm font-medium"
                style={{ color: 'var(--blooso-text-muted)' }}
              >
                No booking data yet
              </div>
            )}
          </div>
        </div>

        {/* Top Services */}
        {topServices.length > 0 && (
          <div
            className="flex flex-col rounded-[24px] bg-white p-6 shadow-sm lg:p-8"
            style={{ border: '1px solid var(--blooso-border-light)' }}
          >
            <div className="mb-6">
              <h2
                className="text-xl font-bold"
                style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
              >
                Top Services
              </h2>
              <p className="mt-1 text-sm font-medium" style={{ color: 'var(--blooso-text-muted)' }}>
                Most popular services by booking volume.
              </p>
            </div>

            <div className="flex flex-col gap-1">
              {topServices.map((s) => (
                <div
                  key={s.serviceId}
                  className="flex items-center justify-between rounded-[12px] p-4 transition-colors hover:bg-black/[0.02]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex size-8 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: 'var(--blooso-sand-light)',
                        color: 'var(--blooso-text)',
                      }}
                    >
                      <span className="text-xs font-bold">{s.count}</span>
                    </div>
                    <span className="font-semibold" style={{ color: 'var(--blooso-text)' }}>
                      {s.serviceName}
                    </span>
                  </div>
                  <span
                    className="font-serif text-lg font-bold"
                    style={{ color: 'var(--blooso-text)' }}
                  >
                    ${s.revenue.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
