'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import {
  getAllApplications,
  reviewApplication,
  type BusinessApplicationWithUser,
} from '@/lib/application-client';
import { Check, X, Clock, ChevronDown, ChevronUp } from 'lucide-react';

export default function AdminApplicationsPage() {
  const { user, isLoading, getToken } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<BusinessApplicationWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const token = getToken();

  useEffect(() => {
    if (!token || !user) return;
    if (user.role !== 'admin') {
      router.replace('/dashboard');
      return;
    }
    fetchApplications();
  }, [token, user]);

  const fetchApplications = async () => {
    if (!token) return;
    try {
      const data = await getAllApplications(token);
      setApplications(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (applicationId: string, status: 'approved' | 'rejected') => {
    if (!token) return;
    setProcessingId(applicationId);
    try {
      await reviewApplication(token, applicationId, {
        status,
        rejectReason: status === 'rejected' ? rejectReason : undefined,
      });
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status, reviewedAt: new Date().toISOString() } : app
        )
      );
      setExpandedId(null);
      setRejectReason('');
    } catch {
      // ignore
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div
          className="size-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'var(--blooso-border)', borderTopColor: 'var(--blooso-rose)' }}
        />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const pending = applications.filter((a) => a.status === 'pending');
  const reviewed = applications.filter((a) => a.status !== 'pending');

  const statusConfig = {
    pending: { bg: '#FEF3C7', text: '#D97706', icon: Clock, label: 'Pending' },
    approved: { bg: '#D1FAE5', text: '#059669', icon: Check, label: 'Approved' },
    rejected: { bg: '#FEE2E2', text: '#DC2626', icon: X, label: 'Rejected' },
  };

  return (
    <div className="animate-fade-up space-y-8 pb-12">
      <div>
        <h1
          className="text-3xl font-bold tracking-tight md:text-4xl"
          style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}
        >
          Business Applications
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
          Review and manage business applications from users.
        </p>
      </div>

      {/* Pending Applications */}
      <div>
        <h2 className="mb-4 text-lg font-bold" style={{ color: 'var(--blooso-text)' }}>
          Pending ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div
            className="rounded-[24px] bg-white p-8 text-center shadow-sm"
            style={{ border: '1px solid var(--blooso-border-light)' }}
          >
            <Clock
              className="mx-auto mb-3 size-8 opacity-20"
              style={{ color: 'var(--blooso-text)' }}
            />
            <p className="text-sm font-medium" style={{ color: 'var(--blooso-text-muted)' }}>
              No pending applications
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((app) => {
              const config = statusConfig[app.status];
              const StatusIcon = config.icon;
              const isExpanded = expandedId === app.id;

              return (
                <div
                  key={app.id}
                  className="rounded-[24px] bg-white shadow-sm transition-shadow hover:shadow-md"
                  style={{ border: '1px solid var(--blooso-border-light)' }}
                >
                  <div
                    className="flex cursor-pointer items-center justify-between p-6"
                    onClick={() => setExpandedId(isExpanded ? null : app.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="flex size-10 items-center justify-center rounded-full"
                        style={{ backgroundColor: config.bg }}
                      >
                        <StatusIcon className="size-5" style={{ color: config.text }} />
                      </div>
                      <div>
                        <h3 className="font-bold" style={{ color: 'var(--blooso-text)' }}>
                          {app.name}
                        </h3>
                        <p className="text-xs" style={{ color: 'var(--blooso-text-muted)' }}>
                          by {app.user.name} ({app.user.email}) · {app.category} ·{' '}
                          {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp
                        className="size-5"
                        style={{ color: 'var(--blooso-text-subtle)' }}
                      />
                    ) : (
                      <ChevronDown
                        className="size-5"
                        style={{ color: 'var(--blooso-text-subtle)' }}
                      />
                    )}
                  </div>

                  {isExpanded && (
                    <div
                      className="border-t px-6 pb-6 pt-4"
                      style={{ borderColor: 'var(--blooso-border-light)' }}
                    >
                      <div
                        className="mb-4 space-y-2 text-sm"
                        style={{ color: 'var(--blooso-text-muted)' }}
                      >
                        {app.description && (
                          <p>
                            <strong>Description:</strong> {app.description}
                          </p>
                        )}
                        <p>
                          <strong>Address:</strong> {app.address}
                          {app.city ? `, ${app.city}` : ''}, {app.country}
                        </p>
                        {app.phone && (
                          <p>
                            <strong>Phone:</strong> {app.phone}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleReview(app.id, 'approved')}
                          disabled={processingId === app.id}
                          className="flex items-center gap-2 rounded-[10px] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                          style={{ backgroundColor: '#059669' }}
                        >
                          <Check className="size-4" />
                          Approve
                        </button>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Rejection reason (optional)"
                            className="w-full rounded-[10px] border px-3 py-2.5 text-sm outline-none"
                            style={{
                              borderColor: 'var(--blooso-border)',
                              color: 'var(--blooso-text)',
                            }}
                          />
                        </div>
                        <button
                          onClick={() => handleReview(app.id, 'rejected')}
                          disabled={processingId === app.id}
                          className="flex items-center gap-2 rounded-[10px] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                          style={{ backgroundColor: '#DC2626' }}
                        >
                          <X className="size-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reviewed Applications */}
      {reviewed.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-bold" style={{ color: 'var(--blooso-text)' }}>
            Reviewed ({reviewed.length})
          </h2>
          <div className="space-y-3">
            {reviewed.map((app) => {
              const config = statusConfig[app.status];
              const StatusIcon = config.icon;

              return (
                <div
                  key={app.id}
                  className="flex items-center justify-between rounded-[16px] bg-white p-4 shadow-sm"
                  style={{ border: '1px solid var(--blooso-border-light)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex size-8 items-center justify-center rounded-full"
                      style={{ backgroundColor: config.bg }}
                    >
                      <StatusIcon className="size-4" style={{ color: config.text }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--blooso-text)' }}>
                        {app.name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--blooso-text-muted)' }}>
                        {app.user.name} · {config.label}
                        {app.reviewedAt && ` · ${new Date(app.reviewedAt).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  {app.rejectReason && (
                    <p className="max-w-xs text-xs" style={{ color: 'var(--blooso-text-muted)' }}>
                      {app.rejectReason}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
