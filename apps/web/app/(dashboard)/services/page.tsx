'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { getMyBusinesses, type BusinessWithDetails } from '@/lib/business-client';
import * as serviceClient from '@/lib/service-client';
import type { CategoryWithServices } from '@/lib/service-client';
import { Plus, Pencil, Trash2, Scissors, X } from 'lucide-react';
import { toast } from 'sonner';
import { ServicesListSkeleton } from '@/components/skeletons';
import { cn } from '@/lib/utils';

export default function ServicesPage() {
  const { user, isLoading, getToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessId = searchParams.get('business');

  const [businesses, setBusinesses] = useState<BusinessWithDetails[]>([]);
  const [categories, setCategories] = useState<CategoryWithServices[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<serviceClient.Service | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    categoryId: '',
    durationMinutes: 60,
    price: 0,
    bufferBeforeMinutes: 0,
    bufferAfterMinutes: 0,
    isActive: true,
  });

  const token = getToken();
  const currentBusinessId = businessId || businesses[0]?.id;

  useEffect(() => {
    if (!token || !user) return;
    getMyBusinesses(token)
      .then((list) => {
        setBusinesses(list);
        const bid = businessId && list.some((b) => b.id === businessId) ? businessId : list[0]?.id;
        if (bid) {
          if (!businessId && list.length > 0) {
            router.replace(`/services?business=${bid}`);
          }
          return serviceClient.getCategories(token, bid);
        }
        return [];
      })
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, [user, token, businessId, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F7F5]">
        <div className="size-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--blooso-border)', borderTopColor: 'var(--blooso-rose)' }} />
      </div>
    );
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !currentBusinessId || !newCategoryName.trim()) return;
    setError(null);
    try {
      await serviceClient.createCategory(token, currentBusinessId, {
        name: newCategoryName.trim(),
      });
      const data = await serviceClient.getCategories(token, currentBusinessId);
      setCategories(data);
      setNewCategoryName('');
      setShowCategoryForm(false);
      toast.success('Category created');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'body' in err ? ((err as any).body?.message) : 'Failed to create category';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!token || !currentBusinessId || !confirm('Are you sure you want to delete this category and all its services?')) return;
    try {
      await serviceClient.deleteCategory(token, currentBusinessId, categoryId);
      const data = await serviceClient.getCategories(token, currentBusinessId);
      setCategories(data);
      toast.success('Category deleted');
    } catch {
      toast.error('Failed to delete category');
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !currentBusinessId || !serviceForm.name.trim() || !serviceForm.categoryId) return;
    setError(null);
    try {
      await serviceClient.createService(token, currentBusinessId, {
        ...serviceForm,
        description: serviceForm.description.trim() || null,
      });
      const data = await serviceClient.getCategories(token, currentBusinessId);
      setCategories(data);
      setServiceForm({ name: '', description: '', categoryId: '', durationMinutes: 60, price: 0, bufferBeforeMinutes: 0, bufferAfterMinutes: 0, isActive: true });
      setShowServiceForm(false);
      toast.success('Service created');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'body' in err ? ((err as any).body?.message) : 'Failed to create service';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !currentBusinessId || !editingService) return;
    setError(null);
    try {
      await serviceClient.updateService(token, currentBusinessId, editingService.id, {
        name: serviceForm.name.trim(),
        description: serviceForm.description.trim() || null,
        categoryId: serviceForm.categoryId,
        durationMinutes: serviceForm.durationMinutes,
        price: serviceForm.price,
        bufferBeforeMinutes: serviceForm.bufferBeforeMinutes,
        bufferAfterMinutes: serviceForm.bufferAfterMinutes,
        isActive: serviceForm.isActive,
      });
      const data = await serviceClient.getCategories(token, currentBusinessId);
      setCategories(data);
      setEditingService(null);
      setShowServiceForm(false);
      toast.success('Service updated');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'body' in err ? ((err as any).body?.message) : 'Failed to update service';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleToggleActive = async (svc: serviceClient.Service) => {
    if (!token || !currentBusinessId) return;
    try {
      await serviceClient.updateService(token, currentBusinessId, svc.id, { isActive: !svc.isActive });
      const data = await serviceClient.getCategories(token, currentBusinessId);
      setCategories(data);
      toast.success(svc.isActive ? 'Service disabled' : 'Service enabled');
    } catch {
      toast.error('Failed to update service');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!token || !currentBusinessId || !confirm('Are you sure you want to delete this service?')) return;
    try {
      await serviceClient.deleteService(token, currentBusinessId, serviceId);
      const data = await serviceClient.getCategories(token, currentBusinessId);
      setCategories(data);
      toast.success('Service deleted');
    } catch {
      toast.error('Failed to delete service');
    }
  };

  const openEditForm = (svc: serviceClient.Service) => {
    setEditingService(svc);
    setServiceForm({
      name: svc.name,
      description: svc.description || '',
      categoryId: svc.categoryId,
      durationMinutes: svc.durationMinutes,
      price: svc.price,
      bufferBeforeMinutes: svc.bufferBeforeMinutes,
      bufferAfterMinutes: svc.bufferAfterMinutes,
      isActive: svc.isActive,
    });
    setShowServiceForm(true);
  };

  const totalServices = categories.reduce((sum, c) => sum + c.services.length, 0);

  if (loading) {
    return <ServicesListSkeleton />;
  }

  if (businesses.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <Scissors className="mb-4 size-12 opacity-20" />
        <h2 className="mb-2 text-2xl font-bold font-serif">Welcome to Blooso</h2>
        <p className="mb-6 text-muted-foreground">You need to set up a business to manage services.</p>
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
    <div className="animate-fade-up space-y-10 pb-12">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl" style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}>
            Services
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
            Manage your service menu and categories
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {businesses.length > 1 && (
            <div className="flex shrink-0 flex-wrap gap-2 mr-4">
              {businesses.map((b) => (
                <button
                  key={b.id}
                  onClick={() => router.push(`/services?business=${b.id}`)}
                  className={cn(
                    'rounded-full px-5 py-2 text-sm font-semibold transition-all',
                    b.id === currentBusinessId ? 'shadow-md' : 'hover:bg-black/5'
                  )}
                  style={{
                    backgroundColor: b.id === currentBusinessId ? 'var(--blooso-text)' : 'transparent',
                    color: b.id === currentBusinessId ? '#fff' : 'var(--blooso-text)',
                    border: b.id === currentBusinessId ? 'none' : '1px solid var(--blooso-border)',
                  }}
                >
                  {b.name}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowCategoryForm(true)}
            className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all hover:bg-black/5"
            style={{ color: 'var(--blooso-text)', border: '1px solid var(--blooso-border)' }}
          >
            <Plus className="size-4" /> Add Category
          </button>
          
          <button
            onClick={() => {
              setShowServiceForm(true);
              setEditingService(null);
              setServiceForm({ name: '', description: '', categoryId: categories[0]?.id || '', durationMinutes: 60, price: 0, bufferBeforeMinutes: 0, bufferAfterMinutes: 0, isActive: true });
            }}
            disabled={categories.length === 0}
            className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-95 shadow-md disabled:opacity-50 disabled:active:scale-100"
            style={{ backgroundColor: 'var(--blooso-rose)' }}
          >
            <Plus className="size-4" /> Add Service
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-[12px] bg-red-50 p-4 text-sm font-semibold text-red-600 border border-red-100">
          {error}
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {totalServices === 0 && categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed bg-[#F9F7F5] py-24 text-center transition-colors hover:bg-black/[0.02]" style={{ borderColor: 'var(--blooso-border-light)' }}>
          <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-white shadow-sm">
            <Scissors className="size-8" style={{ color: 'var(--blooso-rose)' }} />
          </div>
          <h3 className="mb-2 text-2xl font-bold font-serif" style={{ color: 'var(--blooso-text)' }}>No services yet</h3>
          <p className="mb-8 max-w-sm text-sm" style={{ color: 'var(--blooso-text-muted)' }}>
            Start building your beautiful menu by adding your first service category.
          </p>
          <button
            onClick={() => setShowCategoryForm(true)}
            className="flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-95 shadow-md"
            style={{ backgroundColor: 'var(--blooso-rose)' }}
          >
            <Plus className="size-4" /> Create Category
          </button>
        </div>
      ) : (
        /* ── CATEGORY BLOCKS ── */
        <div className="space-y-8">
          {categories.map((cat) => (
            <div key={cat.id} className="rounded-[24px] bg-white p-6 shadow-sm lg:p-8 overflow-hidden border" style={{ borderColor: 'var(--blooso-border-light)' }}>
              
              <div className="mb-6 flex items-center justify-between border-b pb-6" style={{ borderColor: 'var(--blooso-border-light)' }}>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--blooso-text)', fontFamily: 'var(--font-serif)' }}>
                  {cat.name}
                </h2>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="group flex size-8 items-center justify-center rounded-full transition-colors hover:bg-red-50"
                >
                  <Trash2 className="size-4 text-black/20 transition-colors group-hover:text-red-500" />
                </button>
              </div>

              {cat.services.length === 0 ? (
                <div className="rounded-[16px] bg-[#F9F7F5] py-12 text-center">
                  <p className="text-sm font-medium" style={{ color: 'var(--blooso-text-muted)' }}>No services in this category yet.</p>
                  <button
                    onClick={() => {
                      setShowServiceForm(true);
                      setEditingService(null);
                      setServiceForm({ name: '', description: '', categoryId: cat.id, durationMinutes: 60, price: 0, bufferBeforeMinutes: 0, bufferAfterMinutes: 0, isActive: true });
                    }}
                    className="mt-4 text-sm font-bold transition-colors hover:underline"
                    style={{ color: 'var(--blooso-rose)' }}
                  >
                    Add a service
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {cat.services.map((svc) => (
                    <div
                      key={svc.id}
                      className={cn(
                        "group flex flex-col sm:flex-row sm:items-center justify-between rounded-[16px] p-4 transition-colors hover:bg-[#F9F7F5]",
                        !svc.isActive && "opacity-50 grayscale hover:grayscale-0"
                      )}
                    >
                      <div className="mb-4 sm:mb-0">
                        <p className="text-lg font-bold" style={{ color: 'var(--blooso-text)' }}>{svc.name}</p>
                        <div className="mt-1 flex items-center gap-3">
                          <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-xs font-semibold text-black/60">
                            {svc.durationMinutes} min
                          </span>
                          <span className="font-serif text-sm font-bold" style={{ color: 'var(--blooso-text)' }}>
                            ${svc.price.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {/* Custom Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleActive(svc)}
                          className={cn(
                            "relative mr-2 inline-flex h-6 w-11 items-center rounded-full transition-colors",
                            svc.isActive ? 'bg-[#8B3A52]' : 'bg-black/20'
                          )}
                        >
                          <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white transition-transform", svc.isActive ? 'translate-x-6' : 'translate-x-1')} />
                        </button>

                        <button
                          onClick={() => openEditForm(svc)}
                          className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-black/5 text-black/40 hover:text-black"
                        >
                          <Pencil className="size-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteService(svc.id)}
                          className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-red-50 text-black/20 hover:text-red-500"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── CREATE CATEGORY MODAL ── */}
      {showCategoryForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="w-full max-w-sm rounded-[24px] bg-white shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b p-6" style={{ borderColor: 'var(--blooso-border-light)' }}>
              <h3 className="text-xl font-bold font-serif">New Category</h3>
              <button onClick={() => { setShowCategoryForm(false); setNewCategoryName(''); }} className="flex size-8 items-center justify-center rounded-full bg-black/5 transition-colors hover:bg-black/10">
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleAddCategory} className="p-6">
              <label className="mb-2 block text-sm font-bold text-black">Category Name</label>
              <input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Haircuts, Massages..."
                className="mb-8 w-full rounded-[12px] border px-4 py-3 text-sm outline-none transition-all"
                style={{ borderColor: 'var(--blooso-border)', outlineColor: 'var(--blooso-rose)' }}
                autoFocus
                required
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowCategoryForm(false); setNewCategoryName(''); }}
                  className="rounded-[12px] px-6 py-3.5 text-sm font-bold transition-colors hover:bg-black/5"
                  style={{ color: 'var(--blooso-text)', border: '1px solid var(--blooso-border)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex flex-1 items-center justify-center rounded-[12px] py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
                  style={{ backgroundColor: 'var(--blooso-rose)' }}
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE/EDIT SERVICE MODAL ── */}
      {(showServiceForm || editingService) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="w-full max-w-lg rounded-[24px] bg-white shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b p-6" style={{ borderColor: 'var(--blooso-border-light)' }}>
              <h3 className="text-xl font-bold font-serif">{editingService ? 'Edit Service' : 'New Service'}</h3>
              <button onClick={() => { setShowServiceForm(false); setEditingService(null); }} className="flex size-8 items-center justify-center rounded-full bg-black/5 transition-colors hover:bg-black/10">
                <X className="size-4" />
              </button>
            </div>
            
            <form onSubmit={editingService ? handleUpdateService : handleAddService} className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
              
              <div>
                <label className="mb-2 block text-sm font-bold text-black">Service Name</label>
                <input
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm((s) => ({ ...s, name: e.target.value }))}
                  className="w-full rounded-[12px] border px-4 py-3 text-sm outline-none transition-all"
                  style={{ borderColor: 'var(--blooso-border)', outlineColor: 'var(--blooso-rose)' }}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-black">Description <span className="text-black/40 font-medium">(Optional)</span></label>
                <textarea
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm((s) => ({ ...s, description: e.target.value }))}
                  className="w-full rounded-[12px] border px-4 py-3 text-sm outline-none transition-all resize-none"
                  style={{ borderColor: 'var(--blooso-border)', outlineColor: 'var(--blooso-rose)' }}
                  rows={3}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-black">Category</label>
                <select
                  value={serviceForm.categoryId}
                  onChange={(e) => setServiceForm((s) => ({ ...s, categoryId: e.target.value }))}
                  className="w-full rounded-[12px] border px-4 py-3 text-sm outline-none transition-all appearance-none"
                  style={{ borderColor: 'var(--blooso-border)', outlineColor: 'var(--blooso-rose)' }}
                  required
                >
                  <option value="" disabled>Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-black">Duration (min)</label>
                  <input
                    type="number"
                    min={1}
                    value={serviceForm.durationMinutes}
                    onChange={(e) => setServiceForm((s) => ({ ...s, durationMinutes: parseInt(e.target.value) || 0 }))}
                    className="w-full rounded-[12px] border px-4 py-3 text-sm outline-none transition-all"
                    style={{ borderColor: 'var(--blooso-border)', outlineColor: 'var(--blooso-rose)' }}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-black">Price ($)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={serviceForm.price || ''}
                    onChange={(e) => setServiceForm((s) => ({ ...s, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full rounded-[12px] border px-4 py-3 text-sm outline-none transition-all"
                    style={{ borderColor: 'var(--blooso-border)', outlineColor: 'var(--blooso-rose)' }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-[16px] bg-[#F9F7F5] p-4 border" style={{ borderColor: 'var(--blooso-border-light)' }}>
                <div>
                  <p className="font-bold text-black">Active Service</p>
                  <p className="text-xs font-medium text-black/60 mt-0.5">Allow clients to book this service</p>
                </div>
                <button
                  type="button"
                  onClick={() => setServiceForm((s) => ({ ...s, isActive: !s.isActive }))}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    serviceForm.isActive ? 'bg-[#8B3A52]' : 'bg-black/20'
                  )}
                >
                  <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white transition-transform", serviceForm.isActive ? 'translate-x-6' : 'translate-x-1')} />
                </button>
              </div>

              <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--blooso-border-light)' }}>
                <button
                  type="button"
                  onClick={() => { setShowServiceForm(false); setEditingService(null); }}
                  className="rounded-[12px] px-6 py-3.5 text-sm font-bold transition-colors hover:bg-black/5"
                  style={{ color: 'var(--blooso-text)', border: '1px solid var(--blooso-border)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex flex-1 items-center justify-center rounded-[12px] py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
                  style={{ backgroundColor: 'var(--blooso-rose)' }}
                >
                  {editingService ? 'Save Changes' : 'Create Service'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
