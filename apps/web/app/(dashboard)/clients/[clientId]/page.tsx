'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { getMyBusinesses } from '@/lib/business-client';
import * as clientClient from '@/lib/client-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  Lock,
  Trash2,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';

type Tab = 'overview' | 'appointments' | 'notes' | 'tags';

export default function ClientDetailPage() {
  const { user, isLoading, getToken } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const clientId = params.clientId as string;
  const businessId = searchParams.get('business');

  const [client, setClient] = useState<clientClient.Client | null>(null);
  const [appointments, setAppointments] = useState<
    Awaited<ReturnType<typeof clientClient.getClientAppointments>>
  >([]);
  const [notes, setNotes] = useState<clientClient.ClientNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
  });
  const [saving, setSaving] = useState(false);

  const [newNote, setNewNote] = useState('');
  const [notePrivate, setNotePrivate] = useState(false);
  const [addingNote, setAddingNote] = useState(false);

  const [newTag, setNewTag] = useState('');
  const [addingTag, setAddingTag] = useState(false);

  const token = getToken();
  const currentBusinessId = businessId;

  useEffect(() => {
    if (!token || !user || !clientId) return;

    const bid = businessId;
    if (!bid) {
      getMyBusinesses(token).then((list) => {
        if (list.length > 0) {
          router.replace(`/clients/${clientId}?business=${list[0]!.id}`);
        }
      });
      return;
    }

    clientClient
      .getClient(token, bid, clientId)
      .then((c) => {
        setClient(c);
        setEditForm({
          firstName: c.firstName,
          lastName: c.lastName,
          email: c.email,
          phone: c.phone || '',
          dateOfBirth: c.dateOfBirth
            ? new Date(c.dateOfBirth).toISOString().slice(0, 10)
            : '',
        });
      })
      .catch(() => setClient(null))
      .finally(() => setLoading(false));
  }, [user, token, clientId, businessId, router]);

  useEffect(() => {
    if (!token || !currentBusinessId || !clientId || activeTab !== 'appointments')
      return;
    clientClient
      .getClientAppointments(token, currentBusinessId, clientId)
      .then(setAppointments)
      .catch(() => setAppointments([]));
  }, [token, currentBusinessId, clientId, activeTab]);

  useEffect(() => {
    if (!token || !currentBusinessId || !clientId || activeTab !== 'notes')
      return;
    clientClient
      .getClientNotes(token, currentBusinessId, clientId)
      .then(setNotes)
      .catch(() => setNotes([]));
  }, [token, currentBusinessId, clientId, activeTab]);

  if (isLoading || !user) {
    router.replace('/login');
    return null;
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !currentBusinessId || !client) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await clientClient.updateClient(
        token,
        currentBusinessId,
        clientId,
        {
          firstName: editForm.firstName.trim(),
          lastName: editForm.lastName.trim(),
          email: editForm.email.trim(),
          phone: editForm.phone.trim() || undefined,
          dateOfBirth: editForm.dateOfBirth || undefined,
        }
      );
      setClient(updated);
    } catch (err: unknown) {
      setError(
        err && typeof err === 'object' && 'body' in err
          ? ((err as { body?: { message?: string } }).body?.message as string)
          : 'Failed to update'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !currentBusinessId || !clientId || !newNote.trim()) return;
    setAddingNote(true);
    setError(null);
    try {
      const note = await clientClient.createClientNote(
        token,
        currentBusinessId,
        clientId,
        { content: newNote.trim(), isPrivate: notePrivate }
      );
      setNotes((prev) => [note, ...prev]);
      setNewNote('');
      setNotePrivate(false);
    } catch (err: unknown) {
      setError(
        err && typeof err === 'object' && 'body' in err
          ? ((err as { body?: { message?: string } }).body?.message as string)
          : 'Failed to add note'
      );
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!token || !currentBusinessId || !clientId) return;
    try {
      await clientClient.deleteClientNote(
        token,
        currentBusinessId,
        clientId,
        noteId
      );
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch {
      setError('Failed to delete note');
    }
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !currentBusinessId || !clientId || !newTag.trim()) return;
    setAddingTag(true);
    setError(null);
    try {
      const tag = await clientClient.addClientTag(
        token,
        currentBusinessId,
        clientId,
        newTag.trim()
      );
      setClient((prev) =>
        prev
          ? {
              ...prev,
              tags: [...(prev.tags ?? []), tag],
            }
          : null
      );
      setNewTag('');
    } catch (err: unknown) {
      setError(
        err && typeof err === 'object' && 'body' in err
          ? ((err as { body?: { message?: string } }).body?.message as string)
          : 'Failed to add tag'
      );
    } finally {
      setAddingTag(false);
    }
  };

  const handleRemoveTag = async (tag: string) => {
    if (!token || !currentBusinessId || !clientId) return;
    try {
      await clientClient.removeClientTag(
        token,
        currentBusinessId,
        clientId,
        tag
      );
      setClient((prev) =>
        prev
          ? {
              ...prev,
              tags: (prev.tags ?? []).filter((t) => t.tag !== tag),
            }
          : null
      );
    } catch {
      setError('Failed to remove tag');
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Client not found.</p>
        <Link href={`/clients?business=${currentBusinessId}`}>
          <Button variant="outline">Back to clients</Button>
        </Link>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'appointments', label: 'Appointments' },
    { id: 'notes', label: 'Notes' },
    { id: 'tags', label: 'Tags' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/clients?business=${currentBusinessId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold">
            {client.firstName} {client.lastName}
          </h2>
          <p className="text-muted-foreground">{client.email}</p>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2 border-b">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <p className="text-sm text-muted-foreground">
              Total visits: {client.totalVisits ?? 0} · Last visit:{' '}
              {client.lastVisit
                ? formatDate(client.lastVisit)
                : '—'}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>First name</Label>
                  <Input
                    value={editForm.firstName}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, firstName: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Last name</Label>
                  <Input
                    value={editForm.lastName}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, lastName: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Date of birth</Label>
                <Input
                  type="date"
                  value={editForm.dateOfBirth}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, dateOfBirth: e.target.value }))
                  }
                />
              </div>
              <Button type="submit" disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'appointments' && (
        <Card>
          <CardHeader>
            <CardTitle>Appointment history</CardTitle>
            <p className="text-sm text-muted-foreground">
              Past and upcoming appointments
            </p>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <p className="text-muted-foreground">No appointments yet.</p>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => (
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
                        {formatDate(apt.startTime)} at {formatTime(apt.startTime)}{' '}
                        · {apt.staff?.user.name} · {apt.status}
                      </p>
                    </div>
                    <Link
                      href={`/calendar?business=${currentBusinessId}&date=${apt.startTime.slice(0, 10)}`}
                    >
                      <Button variant="outline" size="sm">
                        <Calendar className="mr-1 h-4 w-4" />
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'notes' && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <p className="text-sm text-muted-foreground">
              Add notes about this client. Private notes are only visible to you.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAddNote} className="space-y-2">
              <Label>New note</Label>
              <Input
                placeholder="Add a note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={notePrivate}
                    onChange={(e) => setNotePrivate(e.target.checked)}
                  />
                  <Lock className="h-4 w-4" />
                  Private (only you can see)
                </label>
                <Button type="submit" size="sm" disabled={addingNote || !newNote.trim()}>
                  <Plus className="mr-1 h-4 w-4" />
                  {addingNote ? 'Adding...' : 'Add'}
                </Button>
              </div>
            </form>
            <div className="space-y-2">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="flex items-start justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm">{note.content}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(note.createdAt)}
                      {note.isPrivate && (
                        <span className="ml-2">
                          <Lock className="inline h-3 w-3" /> Private
                        </span>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'tags' && (
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
            <p className="text-sm text-muted-foreground">
              Add tags to organize and filter clients (e.g. VIP, Regular)
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAddTag} className="flex gap-2">
              <Input
                placeholder="Type to add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
              />
              <Button type="submit" disabled={addingTag || !newTag.trim()}>
                <Plus className="mr-1 h-4 w-4" />
                {addingTag ? 'Adding...' : 'Add'}
              </Button>
            </form>
            <div className="flex flex-wrap gap-2">
              {(client.tags ?? []).map((t) => (
                <span
                  key={t.id}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm"
                >
                  {t.tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t.tag)}
                    className="ml-1 rounded-full hover:bg-primary/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
