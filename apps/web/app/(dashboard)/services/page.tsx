'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { getMyBusinesses, type BusinessWithDetails } from '@/lib/business-client';
import * as serviceClient from '@/lib/service-client';
import type { CategoryWithServices } from '@/lib/service-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Scissors } from 'lucide-react';
import { toast } from 'sonner';
import { ServicesListSkeleton } from '@/components/skeletons';

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
    router.replace('/login');
    return null;
  }

  const currentBusinessId = businessId || businesses[0]?.id;

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
      const msg =
        err && typeof err === 'object' && 'body' in err
          ? ((err as { body?: { message?: string } }).body?.message as string)
          : 'Failed to create category';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!token || !currentBusinessId || !confirm('Delete this category and all its services?'))
      return;
    try {
      await serviceClient.deleteCategory(token, currentBusinessId, categoryId);
      const data = await serviceClient.getCategories(token, currentBusinessId);
      setCategories(data);
      toast.success('Category deleted');
    } catch {
      setError('Failed to delete category');
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
      setServiceForm({
        name: '',
        description: '',
        categoryId: '',
        durationMinutes: 60,
        price: 0,
        bufferBeforeMinutes: 0,
        bufferAfterMinutes: 0,
        isActive: true,
      });
      setShowServiceForm(false);
      toast.success('Service created');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'body' in err
          ? ((err as { body?: { message?: string } }).body?.message as string)
          : 'Failed to create service';
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
      const msg =
        err && typeof err === 'object' && 'body' in err
          ? ((err as { body?: { message?: string } }).body?.message as string)
          : 'Failed to update service';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleToggleActive = async (svc: serviceClient.Service) => {
    if (!token || !currentBusinessId) return;
    try {
      await serviceClient.updateService(token, currentBusinessId, svc.id, {
        isActive: !svc.isActive,
      });
      const data = await serviceClient.getCategories(token, currentBusinessId);
      setCategories(data);
      toast.success('Service updated');
    } catch {
      setError('Failed to update service');
      toast.error('Failed to update service');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!token || !currentBusinessId || !confirm('Delete this service?')) return;
    try {
      await serviceClient.deleteService(token, currentBusinessId, serviceId);
      const data = await serviceClient.getCategories(token, currentBusinessId);
      setCategories(data);
      toast.success('Service deleted');
    } catch {
      setError('Failed to delete service');
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
      <div className="space-y-4">
        <p className="text-muted-foreground">Create a business first.</p>
        <Button onClick={() => router.push('/onboarding')}>Create business</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Services</h2>
          <p className="text-muted-foreground">Manage your service menu and categories</p>
        </div>
        {businesses.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {businesses.map((b) => (
              <Button
                key={b.id}
                variant={b.id === currentBusinessId ? 'default' : 'outline'}
                size="sm"
                onClick={() => router.push(`/services?business=${b.id}`)}
              >
                {b.name}
              </Button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {totalServices === 0 && categories.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Scissors className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No services yet</h3>
            <p className="mb-4 text-center text-muted-foreground">
              Add a category and services to build your menu
            </p>
            <Button onClick={() => setShowCategoryForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add your first category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowCategoryForm(true);
                setShowServiceForm(false);
                setEditingService(null);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add category
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setShowServiceForm(true);
                setShowCategoryForm(false);
                setEditingService(null);
                setServiceForm({
                  name: '',
                  description: '',
                  categoryId: categories[0]?.id || '',
                  durationMinutes: 60,
                  price: 0,
                  bufferBeforeMinutes: 0,
                  bufferAfterMinutes: 0,
                  isActive: true,
                });
              }}
              disabled={categories.length === 0}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add service
            </Button>
          </div>

          {showCategoryForm && (
            <Card>
              <CardHeader>
                <CardTitle>New category</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddCategory} className="flex gap-2">
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Category name"
                  />
                  <Button type="submit">Add</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCategoryForm(false);
                      setNewCategoryName('');
                    }}
                  >
                    Cancel
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {(showServiceForm || editingService) && (
            <Card>
              <CardHeader>
                <CardTitle>{editingService ? 'Edit service' : 'New service'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={editingService ? handleUpdateService : handleAddService}
                  className="space-y-4"
                >
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={serviceForm.name}
                      onChange={(e) => setServiceForm((s) => ({ ...s, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={serviceForm.description}
                      onChange={(e) =>
                        setServiceForm((s) => ({ ...s, description: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={serviceForm.categoryId}
                      onValueChange={(v) => setServiceForm((s) => ({ ...s, categoryId: v ?? '' }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Duration (min)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={serviceForm.durationMinutes}
                        onChange={(e) =>
                          setServiceForm((s) => ({
                            ...s,
                            durationMinutes: parseInt(e.target.value) || 0,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Price</Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={serviceForm.price}
                        onChange={(e) =>
                          setServiceForm((s) => ({
                            ...s,
                            price: parseFloat(e.target.value) || 0,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={serviceForm.isActive}
                      onCheckedChange={(v) => setServiceForm((s) => ({ ...s, isActive: v }))}
                    />
                    <Label>Active</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">{editingService ? 'Save' : 'Add service'}</Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowServiceForm(false);
                        setEditingService(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-6">
            {categories.map((cat) => (
              <Card key={cat.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{cat.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {cat.services.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No services. Add one above.</p>
                  ) : (
                    <ul className="space-y-3">
                      {cat.services.map((svc) => (
                        <li
                          key={svc.id}
                          className={`flex items-center justify-between rounded-lg border p-3 ${
                            !svc.isActive ? 'opacity-60' : ''
                          }`}
                        >
                          <div>
                            <p className="font-medium">{svc.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {svc.durationMinutes} min · ${svc.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={svc.isActive}
                              onCheckedChange={() => handleToggleActive(svc)}
                            />
                            <Button variant="ghost" size="icon" onClick={() => openEditForm(svc)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteService(svc.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
