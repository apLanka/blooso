'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { getMyBusinesses, type BusinessWithDetails } from '@/lib/business-client';
import {
  getDashboard,
  getRevenue,
  getTopServices,
  getAppointmentsReport,
} from '@/lib/report-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { DollarSign, Calendar, Users, Star, ChevronRight, TrendingUp } from 'lucide-react';
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
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!businesses || businesses.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Welcome, {user.name}</h2>
          <p className="text-muted-foreground">Get started by creating your first business.</p>
        </div>
        <Link href="/onboarding">
          <Button>Create your business</Button>
        </Link>
      </div>
    );
  }

  const kpiCards = [
    {
      title: "Today's revenue",
      value: `$${(stats?.todayRevenue ?? 0).toFixed(2)}`,
      icon: DollarSign,
    },
    {
      title: "Today's bookings",
      value: stats?.todayAppointments ?? 0,
      icon: Calendar,
    },
    {
      title: 'Total clients',
      value: stats?.totalClients ?? 0,
      icon: Users,
    },
    {
      title: 'Average rating',
      value: (stats?.avgRating ?? 0).toFixed(1),
      sub: `${stats?.reviewCount ?? 0} reviews`,
      icon: Star,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your business performance</p>
        </div>
        {businesses.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {businesses.map((b) => (
              <Button
                key={b.id}
                variant={b.id === currentBusinessId ? 'default' : 'outline'}
                size="sm"
                onClick={() => router.push(`/dashboard?business=${b.id}`)}
              >
                {b.name}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-2 text-2xl font-bold">{kpi.value}</p>
                {kpi.sub && <p className="text-xs text-muted-foreground">{kpi.sub}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue (7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {revenueData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(v) =>
                        new Date(v).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })
                      }
                    />
                    <YAxis tickFormatter={(v) => `$${v}`} />
                    <Tooltip labelFormatter={(v) => new Date(v).toLocaleDateString()} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-12 text-center text-muted-foreground">No revenue data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bookings (7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            {appointmentsData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={appointmentsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(v) =>
                        new Date(v).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })
                      }
                    />
                    <YAxis />
                    <Tooltip labelFormatter={(v) => new Date(v).toLocaleDateString()} />
                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-12 text-center text-muted-foreground">No booking data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s schedule</CardTitle>
            <p className="text-sm text-muted-foreground">Upcoming appointments</p>
          </CardHeader>
          <CardContent>
            {stats?.todaySchedule && stats.todaySchedule.length > 0 ? (
              <div className="space-y-3">
                {stats.todaySchedule.slice(0, 5).map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">
                        {apt.appointmentServices
                          ?.map((as) => as.service?.name)
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(apt.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        · {apt.staff?.user.name}
                      </p>
                    </div>
                    <Link
                      href={`/calendar?business=${currentBusinessId}&date=${apt.startTime.slice(0, 10)}`}
                    >
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-12 text-center text-muted-foreground">No appointments today</p>
            )}
          </CardContent>
        </Card>
      </div>

      {topServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top services</CardTitle>
            <p className="text-sm text-muted-foreground">Most popular services by bookings</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 text-left font-medium">Service</th>
                    <th className="pb-2 text-right font-medium">Bookings</th>
                    <th className="pb-2 text-right font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topServices.map((s) => (
                    <tr key={s.serviceId} className="border-b last:border-0">
                      <td className="py-2">{s.serviceName}</td>
                      <td className="py-2 text-right">{s.count}</td>
                      <td className="py-2 text-right">${s.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        <Link href={`/calendar?business=${currentBusinessId}`}>
          <Button variant="outline">View calendar</Button>
        </Link>
        <Link href={`/reviews?business=${currentBusinessId}`}>
          <Button variant="outline">Manage reviews</Button>
        </Link>
      </div>
    </div>
  );
}
