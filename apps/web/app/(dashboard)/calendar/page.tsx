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
import type { Appointment } from '@/lib/booking-client';
import {
  ChevronLeft,
  ChevronRight,
  X,
  User,
  Clock,
  Check,
  XCircle,
  CreditCard,
  Banknote,
  Search,
  Calendar as CalendarIcon,
  MapPin,
  ClipboardList,
  Store,
} from 'lucide-react';
import { toast } from 'sonner';
import { CalendarSkeleton } from '@/components/skeletons';
import { cn } from '@/lib/utils';

const ROW_HEIGHT = 56;
const SLOT_MINUTES = 15;
const START_HOUR = 8;
const END_HOUR = 20;
const HEADER_HEIGHT = 56;

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
  pending: 'bg-[#fdf8f6] border-[#f0e3de] text-[#8B3A52]', // Soft Rose Tint
  confirmed: 'bg-[#8B3A52] border-[#70293f] text-white', // Blooso Rose
  in_progress: 'bg-[#C9A87C] border-[#a3835b] text-white', // Warm Sand
  completed: 'bg-white border-[#e6e2de] text-black shadow-sm', // Muted White
  cancelled: 'bg-red-50 border-red-100 text-red-600 opacity-70',
  no_show: 'bg-slate-50 border-slate-200 text-slate-500 opacity-70',
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
      toast.success('Payment recorded successfully');
    } catch (err: unknown) {
      setError(
        err && typeof err === 'object' && 'body' in err
          ? ((err as any).body?.message as string)
          : 'Failed to record payment'
      );
    } finally {
      setCheckoutSubmitting(false);
    }
  };

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
        .getClients(token, currentBusinessId, { search: clientSearch.trim(), limit: 8 })
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
      toast.success('Appointment created successfully');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'body' in err
          ? (err as any).body?.message
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
      toast.error('Failed to cancel appointment');
    }
  };

  const timeRows = Array.from({ length: ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES }, (_, i) => {
    const h = START_HOUR + Math.floor((i * SLOT_MINUTES) / 60);
    const m = (i * SLOT_MINUTES) % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  });

  if (loading && !appointments.length && !staff.length) {
    return <CalendarSkeleton />;
  }

  if (businesses.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <Store className="mb-4 size-12 opacity-20" />
        <h2 className="mb-2 text-2xl font-bold font-serif">Welcome to Blooso</h2>
        <p className="mb-6 text-muted-foreground">
          You need to set up a business to use the calendar.
        </p>
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
    <div className="animate-fade-up space-y-8 pb-12">
      {/* ── HEADER ── */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-4">
          <h1
            className="text-3xl font-bold tracking-tight md:text-4xl"
            style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
          >
            {viewDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className="flex items-center gap-1 rounded-[12px] bg-white p-1 shadow-sm border"
              style={{ borderColor: 'var(--blooso-border-light)' }}
            >
              <button
                onClick={handlePrevDay}
                className="flex size-8 items-center justify-center rounded-[8px] transition-colors hover:bg-black/5"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-4 py-1.5 text-sm font-semibold transition-colors hover:bg-black/5 rounded-[8px]"
              >
                Today
              </button>
              <button
                onClick={handleNextDay}
                className="flex size-8 items-center justify-center rounded-[8px] transition-colors hover:bg-black/5"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            <div className="relative">
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="appearance-none rounded-[12px] bg-white pl-4 pr-10 py-2.5 text-sm font-semibold shadow-sm border outline-none"
                style={{ borderColor: 'var(--blooso-border-light)' }}
              >
                <option value="all">All Staff</option>
                {staff
                  .filter((s) => s.isActive)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.user.name}
                    </option>
                  ))}
              </select>
              <User className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-black/40 pointer-events-none" />
            </div>
          </div>
        </div>

        {businesses.length > 1 && (
          <div className="flex shrink-0 flex-wrap gap-2">
            {businesses.map((b) => (
              <button
                key={b.id}
                onClick={() =>
                  router.push(`/calendar?business=${b.id}&date=${formatDate(viewDate)}`)
                }
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

      {error && (
        <div className="rounded-[12px] bg-red-50 p-4 text-sm font-semibold text-red-600 border border-red-100">
          {error}
        </div>
      )}

      {/* ── CALENDAR GRID ── */}
      <div
        className="rounded-[24px] bg-white shadow-sm overflow-hidden border"
        style={{ borderColor: 'var(--blooso-border-light)' }}
      >
        <div className="relative overflow-x-auto">
          <div
            className="relative grid min-w-[800px]"
            style={{
              gridTemplateColumns: `80px repeat(${displayStaff.length || 1}, minmax(180px, 1fr))`,
            }}
          >
            {/* Header Row */}
            <div
              className="sticky top-0 z-20 border-b border-r bg-[#F9F7F5] p-3 text-center text-xs font-bold uppercase tracking-wider text-black/40"
              style={{ borderColor: 'var(--blooso-border-light)' }}
            >
              Time
            </div>
            {displayStaff.map((s) => (
              <div
                key={s.id}
                className="sticky top-0 z-20 border-b border-r bg-[#F9F7F5] p-3 text-center text-sm font-bold text-black"
                style={{ borderColor: 'var(--blooso-border-light)' }}
              >
                {s.user.name}
              </div>
            ))}
            {displayStaff.length === 0 && (
              <div
                className="sticky top-0 z-20 border-b border-r bg-[#F9F7F5] p-3 text-center text-sm font-bold text-black/40"
                style={{ borderColor: 'var(--blooso-border-light)' }}
              >
                No staff available
              </div>
            )}

            {/* Time Rows & Slots */}
            {timeRows.map((time, rowIdx) => (
              <div key={`row-${rowIdx}`} className="contents">
                <div
                  className="border-b border-r p-2 text-right text-xs font-medium text-black/40 bg-[#F9F7F5]"
                  style={{ height: ROW_HEIGHT, borderColor: 'var(--blooso-border-light)' }}
                >
                  {rowIdx % 4 === 0 ? time : ''}
                </div>
                {displayStaff.map((s) => {
                  const startTime = `${formatDate(viewDate)}T${time}:00`;
                  return (
                    <div
                      key={`${s.id}-${rowIdx}`}
                      className="cursor-pointer border-b border-r border-dashed transition-colors hover:bg-black/[0.02]"
                      style={{ height: ROW_HEIGHT, borderColor: 'var(--blooso-border-light)' }}
                      onClick={() => handleSlotClick(s.id, startTime)}
                    />
                  );
                })}
                {displayStaff.length === 0 && (
                  <div
                    className="border-b border-r border-dashed"
                    style={{ height: ROW_HEIGHT, borderColor: 'var(--blooso-border-light)' }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* ── APPOINTMENT BLOCKS ── */}
          <div
            className="absolute inset-0 pointer-events-none min-w-[800px]"
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
                      className={cn(
                        'absolute rounded-[12px] border px-3 py-2 text-left transition-all hover:scale-[1.02] hover:shadow-md pointer-events-auto flex flex-col justify-start overflow-hidden',
                        STATUS_COLORS[apt.status] ??
                          'bg-white border-[#e6e2de] text-black shadow-sm'
                      )}
                      style={{
                        top: slotTop(apt.startTime) - HEADER_HEIGHT + 4,
                        height: slotHeight(apt.startTime, apt.endTime) - 8,
                        left: `calc(80px + ${staffIdx * colWidth}%)`,
                        width: `calc(${colWidth}% - 16px)`,
                        marginLeft: 8,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailAppointment(apt);
                      }}
                    >
                      <p className="truncate text-xs font-bold uppercase tracking-wider mb-0.5 opacity-80">
                        {new Date(apt.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="truncate text-sm font-bold leading-tight">
                        {apt.guestName || apt.guestEmail || 'Walk-in'}
                      </p>
                      <p className="truncate text-xs opacity-90 mt-auto pt-1 font-medium">
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
      </div>

      {/* ── CREATE APPOINTMENT MODAL ── */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="w-full max-w-lg rounded-[24px] bg-white shadow-xl animate-in zoom-in-95 duration-200">
            <div
              className="flex items-center justify-between border-b p-6"
              style={{ borderColor: 'var(--blooso-border-light)' }}
            >
              <h3 className="text-xl font-bold font-serif">New Appointment</h3>
              <button
                onClick={() => setCreateOpen(false)}
                className="flex size-8 items-center justify-center rounded-full bg-black/5 transition-colors hover:bg-black/10"
              >
                <X className="size-4" />
              </button>
            </div>

            <form
              onSubmit={handleCreateSubmit}
              className="p-6 space-y-6 max-h-[75vh] overflow-y-auto"
            >
              {/* Form Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-black">Staff</label>
                  <select
                    value={createForm.staffId}
                    onChange={(e) => setCreateForm((f) => ({ ...f, staffId: e.target.value }))}
                    className="w-full rounded-[12px] border px-4 py-3 text-sm outline-none transition-all appearance-none"
                    style={{
                      borderColor: 'var(--blooso-border)',
                      outlineColor: 'var(--blooso-rose)',
                    }}
                  >
                    <option value="" disabled>
                      Select staff
                    </option>
                    {staff
                      .filter((s) => s.isActive)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.user.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-black">Start time</label>
                  <input
                    type="datetime-local"
                    value={createForm.startTime ? createForm.startTime.slice(0, 16) : ''}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        startTime: e.target.value ? new Date(e.target.value).toISOString() : '',
                      }))
                    }
                    className="w-full rounded-[12px] border px-4 py-3 text-sm outline-none transition-all"
                    style={{
                      borderColor: 'var(--blooso-border)',
                      outlineColor: 'var(--blooso-rose)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-black">Services</label>
                <div
                  className="rounded-[16px] border p-4 max-h-48 overflow-y-auto bg-[#F9F7F5]"
                  style={{ borderColor: 'var(--blooso-border-light)' }}
                >
                  {categories.map((cat) =>
                    cat.services.map((svc) => (
                      <label
                        key={svc.id}
                        className="flex items-center gap-3 p-2 cursor-pointer hover:bg-black/5 rounded-[8px] transition-colors"
                      >
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
                          className="size-4 accent-[#8B3A52]"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-black">{svc.name}</span>
                          <span className="text-xs text-black/60">
                            {svc.durationMinutes} min • ${svc.price}
                          </span>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-4 border-t" style={{ borderColor: 'var(--blooso-border-light)' }}>
                <h4 className="text-sm font-bold text-black mb-4 uppercase tracking-wider">
                  Client Details
                </h4>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-black/40" />
                    <input
                      placeholder="Search existing client..."
                      value={clientSearch}
                      onChange={(e) => {
                        setClientSearch(e.target.value);
                        if (!e.target.value)
                          setCreateForm((f) => ({
                            ...f,
                            clientId: '',
                            guestName: '',
                            guestEmail: '',
                            guestPhone: '',
                          }));
                      }}
                      className="w-full rounded-[12px] border pl-10 pr-4 py-3 text-sm outline-none transition-all"
                      style={{
                        borderColor: 'var(--blooso-border)',
                        outlineColor: 'var(--blooso-rose)',
                      }}
                    />
                    {clientSearchResults.length > 0 && (
                      <div className="absolute z-10 mt-2 w-full rounded-[12px] border bg-white p-2 shadow-lg max-h-48 overflow-y-auto">
                        {clientSearchResults.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            className="flex w-full flex-col items-start rounded-[8px] p-3 text-left transition-colors hover:bg-black/5"
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
                            <span className="text-sm font-bold">
                              {c.firstName} {c.lastName}
                            </span>
                            <span className="text-xs text-black/60">{c.email}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      placeholder="Name"
                      value={createForm.guestName}
                      onChange={(e) => setCreateForm((f) => ({ ...f, guestName: e.target.value }))}
                      className="w-full rounded-[12px] border px-4 py-3 text-sm outline-none transition-all"
                      style={{
                        borderColor: 'var(--blooso-border)',
                        outlineColor: 'var(--blooso-rose)',
                      }}
                    />
                    <input
                      placeholder="Phone"
                      value={createForm.guestPhone}
                      onChange={(e) => setCreateForm((f) => ({ ...f, guestPhone: e.target.value }))}
                      className="w-full rounded-[12px] border px-4 py-3 text-sm outline-none transition-all"
                      style={{
                        borderColor: 'var(--blooso-border)',
                        outlineColor: 'var(--blooso-rose)',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
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
                  {saving ? 'Saving...' : 'Create Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DETAIL MODAL ── */}
      {detailAppointment && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 sm:items-center p-4">
          <div className="w-full max-w-lg rounded-[24px] bg-white shadow-xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            <div
              className="flex items-center justify-between border-b p-6"
              style={{ borderColor: 'var(--blooso-border-light)' }}
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-[#F9F7F5]">
                  <ClipboardList className="size-5" style={{ color: 'var(--blooso-rose)' }} />
                </div>
                <h3 className="text-xl font-bold font-serif">Appointment</h3>
              </div>
              <button
                onClick={() => setDetailAppointment(null)}
                className="flex size-8 items-center justify-center rounded-full bg-black/5 transition-colors hover:bg-black/10"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-6">
              <div className="rounded-[16px] bg-[#F9F7F5] p-5 mb-6">
                <h4 className="text-2xl font-bold font-serif text-black mb-1">
                  {detailAppointment.guestName || detailAppointment.guestEmail || 'Walk-in'}
                </h4>
                <p className="text-sm font-medium text-black/60 flex items-center gap-2">
                  <Clock className="size-3.5" />
                  {new Date(detailAppointment.startTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  –{' '}
                  {new Date(detailAppointment.endTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <div className="mt-4 pt-4 border-t border-black/10">
                  <p className="font-semibold text-black">
                    {detailAppointment.appointmentServices
                      ?.map((as) => as.service?.name)
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              </div>

              {/* Status and Payment Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <div
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border',
                    STATUS_COLORS[detailAppointment.status] || 'bg-slate-100'
                  )}
                >
                  {detailAppointment.status.replace('_', ' ')}
                </div>

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
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
                          refunded
                            ? 'bg-amber-100 text-amber-800'
                            : paid >= total && total > 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-slate-100 text-slate-600'
                        )}
                      >
                        {refunded ? 'Refunded' : paid >= total && total > 0 ? 'Paid' : 'Unpaid'}
                      </span>
                      {total > 0 && (
                        <span className="text-sm font-semibold text-black/60">
                          {paid > 0 ? `$${paid.toFixed(2)} paid` : ''}
                          {paid > 0 && paid < total ? ` of $${total.toFixed(2)}` : ''}
                          {paid === 0 && total > 0 ? `$${total.toFixed(2)} total` : ''}
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {detailAppointment.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate(detailAppointment.id, 'confirmed')}
                    className="flex items-center gap-2 rounded-[12px] bg-black px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                  >
                    <Check className="size-4" /> Confirm
                  </button>
                )}
                {(detailAppointment.status === 'pending' ||
                  detailAppointment.status === 'confirmed') && (
                  <button
                    onClick={() => handleStatusUpdate(detailAppointment.id, 'in_progress')}
                    className="flex items-center gap-2 rounded-[12px] border px-4 py-2.5 text-sm font-bold text-black transition-colors hover:bg-black/5"
                  >
                    Check-in
                  </button>
                )}
                {detailAppointment.status === 'in_progress' && (
                  <button
                    onClick={() => handleStatusUpdate(detailAppointment.id, 'completed')}
                    className="flex items-center gap-2 rounded-[12px] bg-black px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                  >
                    Complete
                  </button>
                )}
                {detailAppointment.status === 'completed' && (
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        `${window.location.origin}/review/${detailAppointment.id}`
                      );
                      toast.success('Link copied');
                    }}
                    className="flex items-center gap-2 rounded-[12px] border px-4 py-2.5 text-sm font-bold text-black transition-colors hover:bg-black/5"
                  >
                    Copy review link
                  </button>
                )}
                {(detailAppointment.status === 'pending' ||
                  detailAppointment.status === 'confirmed') && (
                  <button
                    onClick={() => handleStatusUpdate(detailAppointment.id, 'no_show')}
                    className="flex items-center gap-2 rounded-[12px] border px-4 py-2.5 text-sm font-bold text-black transition-colors hover:bg-black/5"
                  >
                    No-show
                  </button>
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
                  if (total > 0 && paid < total) {
                    return (
                      <button
                        onClick={() => setCheckoutOpen(true)}
                        className="flex items-center gap-2 rounded-[12px] px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: 'var(--blooso-rose)' }}
                      >
                        <Banknote className="size-4" /> Checkout
                      </button>
                    );
                  }
                  return null;
                })()}
                {detailAppointment.status !== 'cancelled' && (
                  <button
                    onClick={() => handleCancel(detailAppointment.id)}
                    className="flex items-center gap-2 rounded-[12px] bg-red-50 text-red-600 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-red-100 ml-auto"
                  >
                    <XCircle className="size-4" /> Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CHECKOUT MODAL ── */}
      {checkoutOpen && detailAppointment && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-[24px] bg-white shadow-xl animate-in zoom-in-95">
            <div
              className="flex items-center justify-between border-b p-6"
              style={{ borderColor: 'var(--blooso-border-light)' }}
            >
              <h3 className="text-xl font-bold font-serif">Checkout</h3>
              <button
                onClick={() => setCheckoutOpen(false)}
                className="flex size-8 items-center justify-center rounded-full bg-black/5 transition-colors hover:bg-black/10"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6 rounded-[16px] bg-[#F9F7F5] p-5 text-center">
                <p className="text-sm font-bold uppercase tracking-wider text-black/40 mb-1">
                  Total Due
                </p>
                <p
                  className="font-serif text-4xl font-bold"
                  style={{ color: 'var(--blooso-rose)' }}
                >
                  $
                  {(
                    detailAppointment.totalPrice ??
                    detailAppointment.appointmentServices?.reduce(
                      (s, as) => s + (as.priceCharged ?? 0),
                      0
                    ) ??
                    0
                  ).toFixed(2)}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <label className="block text-sm font-bold text-black">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['card', 'cash', 'transfer', 'other'] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => setCheckoutMethod(method)}
                      className={cn(
                        'flex items-center justify-center gap-2 rounded-[12px] border p-3 text-sm font-bold transition-all capitalize',
                        checkoutMethod === method
                          ? 'border-black bg-black text-white'
                          : 'hover:bg-black/5 text-black'
                      )}
                    >
                      {method === 'card' && <CreditCard className="size-4" />}
                      {method === 'cash' && <Banknote className="size-4" />}
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="mb-4 text-sm font-semibold text-red-600 bg-red-50 p-3 rounded-[8px]">
                  {error}
                </p>
              )}

              <button
                onClick={handleInPersonCheckout}
                disabled={checkoutSubmitting}
                className="w-full rounded-[12px] py-4 text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                style={{ backgroundColor: 'var(--blooso-rose)' }}
              >
                {checkoutSubmitting ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
