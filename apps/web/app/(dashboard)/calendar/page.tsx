'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { getMyBusinesses, type BusinessWithDetails } from '@/lib/business-client';
import * as staffClient from '@/lib/staff-client';
import * as serviceClient from '@/lib/service-client';
import * as appointmentsClient from '@/lib/appointments-client';
import { recordInPersonPayment, getAppointmentPayments, type Payment } from '@/lib/payment-client';
import * as clientClient from '@/lib/client-client';
import { getAvailability } from '@/lib/availability-client';
import type { Appointment } from '@/lib/booking-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  User,
  Clock,
  Check,
  XCircle,
  CreditCard,
  Banknote,
} from 'lucide-react';
import { toast } from 'sonner';
import { CalendarSkeleton } from '@/components/skeletons';

const ROW_HEIGHT = 48;
const SLOT_MINUTES = 15;
const START_HOUR = 8;
const END_HOUR = 20;
const HEADER_HEIGHT = 49;

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function timeToMinutes(time: string) {
  const [h, m] = time.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function slotTop(startTime: string) {
  const d = new Date(startTime);
  const h = d.getHours();
  const m = d.getMinutes();
  const mins = h * 60 + m - START_HOUR * 60;
  return HEADER_HEIGHT + (mins / SLOT_MINUTES) * ROW_HEIGHT;
}

function slotHeight(startTime: string, endTime: string) {
  const s = new Date(startTime).getTime();
  const e = new Date(endTime).getTime();
  return Math.max(ROW_HEIGHT / 2, ((e - s) / (60 * 1000) / SLOT_MINUTES) * ROW_HEIGHT);
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 border-amber-300',
  confirmed: 'bg-blue-100 border-blue-300',
  in_progress: 'bg-green-100 border-green-300',
  completed: 'bg-slate-100 border-slate-300',
  cancelled: 'bg-red-50 border-red-200 opacity-60',
  no_show: 'bg-slate-50 border-slate-200 opacity-60',
};

export default function CalendarPage() {
  const { user, isLoading, getToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessId = searchParams.get('business');
  const dateParam = searchParams.get('date');

  const [businesses, setBusinesses] = useState<BusinessWithDetails[]>([]);
  const [staff, setStaff] = useState<staffClient.StaffMember[]>([]);
  const [categories, setCategories] = useState<serviceClient.CategoryWithServices[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaffId, setSelectedStaffId] = useState<string | 'all'>('all');
  const [viewDate, setViewDate] = useState(() => {
    if (dateParam) {
      const d = new Date(dateParam);
      return isNaN(d.getTime()) ? new Date() : d;
    }
    return new Date();
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [detailAppointment, setDetailAppointment] = useState<Appointment | null>(null);
  const [createForm, setCreateForm] = useState({
    staffId: '',
    serviceIds: [] as string[],
    startTime: '',
    clientId: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    notes: '',
  });
  const [clientSearch, setClientSearch] = useState('');
  const [clientSearchResults, setClientSearchResults] = useState<clientClient.Client[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailPayments, setDetailPayments] = useState<Payment[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutMethod, setCheckoutMethod] = useState<'cash' | 'card' | 'transfer' | 'other'>(
    'card'
  );
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);

  const token = getToken();
  const currentBusinessId = businessId || businesses[0]?.id;
  const locationId = businesses.find((b) => b.id === currentBusinessId)?.locations?.[0]?.id;

  const loadData = useCallback(() => {
    if (!token || !currentBusinessId) return;
    setLoading(true);
    Promise.all([
      appointmentsClient.getAppointments(token, currentBusinessId, {
        date: formatDate(viewDate),
        staffId: selectedStaffId === 'all' ? undefined : selectedStaffId,
      }),
      staffClient.getStaff(token, currentBusinessId),
      serviceClient.getCategories(token, currentBusinessId),
    ])
      .then(([apts, s, cats]) => {
        setAppointments(apts);
        setStaff(s);
        setCategories(cats);
      })
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, [token, currentBusinessId, viewDate, selectedStaffId]);

  useEffect(() => {
    if (!token || !user) return;
    getMyBusinesses(token)
      .then((list) => {
        setBusinesses(list);
        const bid = businessId && list.some((b) => b.id === businessId) ? businessId : list[0]?.id;
        if (bid && !businessId && list.length > 0) {
          router.replace(`/calendar?business=${bid}`);
        }
      })
      .catch(() => {});
  }, [user, token, businessId, router]);

  useEffect(() => {
    if (!token || !currentBusinessId) return;
    setLoading(true);
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!token || !currentBusinessId || !detailAppointment) {
      setDetailPayments([]);
      return;
    }
    getAppointmentPayments(token, currentBusinessId, detailAppointment.id)
      .then(setDetailPayments)
      .catch(() => setDetailPayments([]));
  }, [token, currentBusinessId, detailAppointment?.id]);

  const handleInPersonCheckout = async () => {
    if (!token || !currentBusinessId || !detailAppointment) return;
    const amount =
      detailAppointment.totalPrice ??
      detailAppointment.appointmentServices?.reduce((s, as) => s + (as.priceCharged ?? 0), 0) ??
      0;
    if (amount <= 0) return;
    setCheckoutSubmitting(true);
    setError(null);
    try {
      await recordInPersonPayment(token, currentBusinessId, detailAppointment.id, {
        amount,
        method: checkoutMethod,
      });
      setCheckoutOpen(false);
      setDetailAppointment(null);
      loadData();
    } catch (err: unknown) {
      setError(
        err && typeof err === 'object' && 'body' in err
          ? ((err as { body?: { message?: string } }).body?.message as string)
          : 'Failed to record payment'
      );
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  if (isLoading || !user) {
    router.replace('/login');
    return null;
  }

  const displayStaff =
    selectedStaffId === 'all'
      ? staff.filter((s) => s.isActive)
      : staff.filter((s) => s.id === selectedStaffId);

  const handlePrevDay = () => {
    const d = new Date(viewDate);
    d.setDate(d.getDate() - 1);
    setViewDate(d);
    router.replace(`/calendar?business=${currentBusinessId}&date=${formatDate(d)}`);
  };

  const handleNextDay = () => {
    const d = new Date(viewDate);
    d.setDate(d.getDate() + 1);
    setViewDate(d);
    router.replace(`/calendar?business=${currentBusinessId}&date=${formatDate(d)}`);
  };

  const handleToday = () => {
    const d = new Date();
    setViewDate(d);
    router.replace(`/calendar?business=${currentBusinessId}&date=${formatDate(d)}`);
  };

  const handleSlotClick = (staffId: string, startTime: string) => {
    setCreateForm({
      staffId,
      serviceIds: [],
      startTime,
      clientId: '',
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      notes: '',
    });
    setClientSearch('');
    setClientSearchResults([]);
    setCreateOpen(true);
  };

  useEffect(() => {
    if (!token || !currentBusinessId || !clientSearch.trim()) {
      setClientSearchResults([]);
      return;
    }
    const t = setTimeout(() => {
      clientClient
        .getClients(token, currentBusinessId, {
          search: clientSearch.trim(),
          limit: 8,
        })
        .then((res) => setClientSearchResults(res.data))
        .catch(() => setClientSearchResults([]));
    }, 200);
    return () => clearTimeout(t);
  }, [token, currentBusinessId, clientSearch]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !token ||
      !currentBusinessId ||
      !locationId ||
      !createForm.staffId ||
      createForm.serviceIds.length === 0
    )
      return;
    setSaving(true);
    setError(null);
    try {
      await appointmentsClient.createAppointment(token, currentBusinessId, {
        locationId,
        staffId: createForm.staffId,
        serviceIds: createForm.serviceIds,
        startTime: createForm.startTime,
        clientId: createForm.clientId || undefined,
        guestName: createForm.guestName || undefined,
        guestEmail: createForm.guestEmail || undefined,
        guestPhone: createForm.guestPhone || undefined,
        notes: createForm.notes || undefined,
      });
      setCreateOpen(false);
      loadData();
      toast.success('Appointment created');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'body' in err
          ? ((err as { body?: { message?: string } }).body?.message as string)
          : 'Failed to create appointment';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (aptId: string, status: string) => {
    if (!token || !currentBusinessId) return;
    try {
      await appointmentsClient.updateAppointment(token, currentBusinessId, aptId, { status });
      setDetailAppointment(null);
      loadData();
      toast.success('Appointment updated');
    } catch {
      setError('Failed to update');
      toast.error('Failed to update appointment');
    }
  };

  const handleCancel = async (aptId: string) => {
    if (!token || !currentBusinessId) return;
    try {
      await appointmentsClient.cancelAppointment(token, currentBusinessId, aptId);
      setDetailAppointment(null);
      loadData();
      toast.success('Appointment cancelled');
    } catch {
      setError('Failed to cancel');
      toast.error('Failed to cancel appointment');
    }
  };

  const timeRows = Array.from({ length: ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES }, (_, i) => {
    const h = START_HOUR + Math.floor((i * SLOT_MINUTES) / 60);
    const m = (i * SLOT_MINUTES) % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  });

  if (loading) {
    return <CalendarSkeleton />;
  }

  if (businesses.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Create a business first.</p>
        <Button onClick={() => router.push('/onboarding')}>Create business</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold">Calendar</h2>
        <div className="flex flex-wrap items-center gap-2">
          {businesses.length > 1 &&
            businesses.map((b) => (
              <Button
                key={b.id}
                variant={b.id === currentBusinessId ? 'default' : 'outline'}
                size="sm"
                onClick={() =>
                  router.push(`/calendar?business=${b.id}&date=${formatDate(viewDate)}`)
                }
              >
                {b.name}
              </Button>
            ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={handlePrevDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <span className="font-medium">
          {viewDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
        <div className="w-48">
          <Select value={selectedStaffId} onValueChange={(v) => setSelectedStaffId(v as string)}>
            <SelectTrigger>
              <SelectValue placeholder="Staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All staff</SelectItem>
              {staff
                .filter((s) => s.isActive)
                .map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.user.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardContent className="relative p-0">
          <div className="overflow-x-auto">
            <div
              className="relative grid min-w-[600px]"
              style={{
                gridTemplateColumns: `80px repeat(${displayStaff.length || 1}, minmax(120px, 1fr))`,
              }}
            >
              <div className="border-b border-r bg-muted/30 p-2 font-medium">Time</div>
              {displayStaff.map((s) => (
                <div
                  key={s.id}
                  className="border-b border-r bg-muted/30 p-2 text-center font-medium"
                >
                  {s.user.name}
                </div>
              ))}
              {displayStaff.length === 0 && (
                <div className="border-b border-r bg-muted/30 p-2 text-center text-muted-foreground">
                  No staff
                </div>
              )}

              {timeRows.map((time, rowIdx) => (
                <>
                  <div
                    key={`time-${rowIdx}`}
                    className="border-b border-r p-1 text-xs text-muted-foreground"
                    style={{ height: ROW_HEIGHT }}
                  >
                    {time}
                  </div>
                  {displayStaff.map((s) => {
                    const dateStr = formatDate(viewDate);
                    const startTime = `${dateStr}T${time}:00`;
                    return (
                      <div
                        key={`${s.id}-${rowIdx}`}
                        className="cursor-pointer border-b border-r hover:bg-muted/50"
                        style={{ height: ROW_HEIGHT }}
                        onClick={() => handleSlotClick(s.id, startTime)}
                      />
                    );
                  })}
                  {displayStaff.length === 0 && (
                    <div className="border-b border-r" style={{ height: ROW_HEIGHT }} />
                  )}
                </>
              ))}
            </div>

            <div
              className="absolute left-0 right-0 top-0 min-w-[600px]"
              style={{ paddingTop: HEADER_HEIGHT }}
            >
              <div className="relative w-full" style={{ height: timeRows.length * ROW_HEIGHT }}>
                {appointments
                  .filter((a) => a.status !== 'cancelled' && a.status !== 'no_show')
                  .map((apt) => {
                    const staffIdx = displayStaff.findIndex((s) => s.id === apt.staffId);
                    if (staffIdx < 0) return null;
                    const colWidth = 100 / (displayStaff.length || 1);
                    return (
                      <button
                        key={apt.id}
                        type="button"
                        className={`absolute rounded border px-2 py-1 text-left text-xs transition-colors hover:ring-2 pointer-events-auto ${
                          STATUS_COLORS[apt.status] ?? 'bg-slate-100 border-slate-300'
                        }`}
                        style={{
                          top: slotTop(apt.startTime) - HEADER_HEIGHT + 2,
                          height: slotHeight(apt.startTime, apt.endTime) - 4,
                          left: `calc(80px + ${staffIdx * colWidth}%)`,
                          width: `calc(${colWidth}% - 24px)`,
                          marginLeft: 8,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailAppointment(apt);
                        }}
                      >
                        <p className="truncate font-medium">
                          {apt.guestName || apt.guestEmail || 'Walk-in'}
                        </p>
                        <p className="truncate text-muted-foreground">
                          {apt.appointmentServices
                            ?.map((as) => as.service?.name)
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="max-h-[90vh] w-full max-w-lg overflow-y-auto">
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">New appointment</h3>
                <Button variant="ghost" size="icon" onClick={() => setCreateOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <Label>Staff</Label>
                  <Select
                    value={createForm.staffId}
                    onValueChange={(v) => setCreateForm((f) => ({ ...f, staffId: v ?? '' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {staff
                        .filter((s) => s.isActive)
                        .map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.user.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Services</Label>
                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                    {categories.map((cat) =>
                      cat.services.map((svc) => (
                        <label key={svc.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={createForm.serviceIds.includes(svc.id)}
                            onChange={(e) =>
                              setCreateForm((f) => ({
                                ...f,
                                serviceIds: e.target.checked
                                  ? [...f.serviceIds, svc.id]
                                  : f.serviceIds.filter((id) => id !== svc.id),
                              }))
                            }
                          />
                          {svc.name} ({svc.durationMinutes} min, ${svc.price})
                        </label>
                      ))
                    )}
                  </div>
                </div>
                <div>
                  <Label>Start time</Label>
                  <Input
                    type="datetime-local"
                    value={createForm.startTime ? createForm.startTime.slice(0, 16) : ''}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        startTime: e.target.value ? new Date(e.target.value).toISOString() : '',
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Client (optional)</Label>
                  <Input
                    placeholder="Search client by name, email..."
                    value={clientSearch}
                    onChange={(e) => {
                      setClientSearch(e.target.value);
                      if (!e.target.value) {
                        setCreateForm((f) => ({
                          ...f,
                          clientId: '',
                          guestName: '',
                          guestEmail: '',
                          guestPhone: '',
                        }));
                      }
                    }}
                  />
                  {clientSearchResults.length > 0 && (
                    <div className="mt-1 max-h-32 overflow-y-auto rounded border">
                      {clientSearchResults.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
                          onClick={() => {
                            setCreateForm((f) => ({
                              ...f,
                              clientId: c.id,
                              guestName: `${c.firstName} ${c.lastName}`.trim(),
                              guestEmail: c.email,
                              guestPhone: c.phone || '',
                            }));
                            setClientSearch(`${c.firstName} ${c.lastName}`);
                            setClientSearchResults([]);
                          }}
                        >
                          {c.firstName} {c.lastName} · {c.email}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <Label>Guest name</Label>
                  <Input
                    value={createForm.guestName}
                    onChange={(e) => setCreateForm((f) => ({ ...f, guestName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Guest email</Label>
                  <Input
                    type="email"
                    value={createForm.guestEmail}
                    onChange={(e) => setCreateForm((f) => ({ ...f, guestEmail: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Guest phone</Label>
                  <Input
                    value={createForm.guestPhone}
                    onChange={(e) => setCreateForm((f) => ({ ...f, guestPhone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input
                    value={createForm.notes}
                    onChange={(e) => setCreateForm((f) => ({ ...f, notes: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={saving}>
                    Create
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {detailAppointment && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <Card className="w-full max-w-md sm:max-w-lg">
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Appointment</h3>
                <Button variant="ghost" size="icon" onClick={() => setDetailAppointment(null)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {detailAppointment.guestName || detailAppointment.guestEmail || 'Walk-in'}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {new Date(detailAppointment.startTime).toLocaleTimeString()} –{' '}
                  {new Date(detailAppointment.endTime).toLocaleTimeString()}
                </p>
                <p>
                  {detailAppointment.appointmentServices
                    ?.map((as) => as.service?.name)
                    .filter(Boolean)
                    .join(', ')}
                </p>
                <p className="text-sm text-muted-foreground">Status: {detailAppointment.status}</p>
                {(() => {
                  const total =
                    detailAppointment.totalPrice ??
                    detailAppointment.appointmentServices?.reduce(
                      (s, as) => s + (as.priceCharged ?? 0),
                      0
                    ) ??
                    0;
                  const paid = detailPayments
                    .filter((p) => p.status === 'completed')
                    .reduce((s, p) => s + p.amount + (p.tipAmount ?? 0), 0);
                  const refunded = detailPayments.some((p) => p.status === 'refunded');
                  return (
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          refunded
                            ? 'bg-amber-100 text-amber-800'
                            : paid >= total && total > 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {refunded ? 'Refunded' : paid >= total && total > 0 ? 'Paid' : 'Unpaid'}
                      </span>
                      {total > 0 && (
                        <span className="text-sm text-muted-foreground">
                          {paid > 0 ? `$${paid.toFixed(2)} paid` : ''}
                          {paid > 0 && paid < total ? ` of $${total.toFixed(2)}` : ''}
                          {paid === 0 && total > 0 ? `$${total.toFixed(2)} total` : ''}
                          {detailPayments.length > 0 &&
                            ` · ${detailPayments.map((p) => p.method).join(', ')}`}
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {detailAppointment.status === 'pending' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(detailAppointment.id, 'confirmed')}
                  >
                    <Check className="mr-1 h-4 w-4" />
                    Confirm
                  </Button>
                )}
                {(detailAppointment.status === 'pending' ||
                  detailAppointment.status === 'confirmed') && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate(detailAppointment.id, 'in_progress')}
                  >
                    Check-in
                  </Button>
                )}
                {detailAppointment.status === 'in_progress' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(detailAppointment.id, 'completed')}
                  >
                    Complete
                  </Button>
                )}
                {detailAppointment.status === 'completed' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/review/${detailAppointment.id}`;
                      navigator.clipboard?.writeText(url);
                    }}
                  >
                    Copy review link
                  </Button>
                )}
                {(detailAppointment.status === 'pending' ||
                  detailAppointment.status === 'confirmed') && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate(detailAppointment.id, 'no_show')}
                  >
                    No-show
                  </Button>
                )}
                {(() => {
                  const total =
                    detailAppointment.totalPrice ??
                    detailAppointment.appointmentServices?.reduce(
                      (s, as) => s + (as.priceCharged ?? 0),
                      0
                    ) ??
                    0;
                  const paid = detailPayments
                    .filter((p) => p.status === 'completed')
                    .reduce((s, p) => s + p.amount + (p.tipAmount ?? 0), 0);
                  const needsPayment = total > 0 && paid < total;
                  return (
                    needsPayment && (
                      <Button size="sm" variant="outline" onClick={() => setCheckoutOpen(true)}>
                        <Banknote className="mr-1 h-4 w-4" />
                        Checkout
                      </Button>
                    )
                  );
                })()}
                {detailAppointment.status !== 'cancelled' && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleCancel(detailAppointment.id)}
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {checkoutOpen && detailAppointment && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-sm">
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">In-person checkout</h3>
                <Button variant="ghost" size="icon" onClick={() => setCheckoutOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Amount: $
                {(
                  detailAppointment.totalPrice ??
                  detailAppointment.appointmentServices?.reduce(
                    (s, as) => s + (as.priceCharged ?? 0),
                    0
                  ) ??
                  0
                ).toFixed(2)}
              </p>
              <div className="mb-4">
                <Label>Payment method</Label>
                <Select
                  value={checkoutMethod}
                  onValueChange={(v) =>
                    setCheckoutMethod(v as 'cash' | 'card' | 'transfer' | 'other')
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">
                      <CreditCard className="mr-2 inline h-4 w-4" />
                      Card
                    </SelectItem>
                    <SelectItem value="cash">
                      <Banknote className="mr-2 inline h-4 w-4" />
                      Cash
                    </SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && <p className="mb-2 text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCheckoutOpen(false)}
                  disabled={checkoutSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleInPersonCheckout}
                  disabled={checkoutSubmitting}
                >
                  {checkoutSubmitting ? 'Recording...' : 'Record payment'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
