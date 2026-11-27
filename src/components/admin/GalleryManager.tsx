import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Eye,
  EyeOff,
  ImageOff,
  Images,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { ConfirmDialog } from '@/src/components/ui/confirm-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Switch } from '@/src/components/ui/switch';
import {
  deleteGalleryItem,
  saveProfileSettings,
  uploadPortfolioMedia,
  upsertGalleryItem,
} from '@/src/lib/data';
import { measureImageDimensions } from '@/src/lib/imageDimensions';
import {
  isSafeUrl,
  resolveGalleryTitle,
  validateGalleryItemInput,
} from '@/src/lib/portfolioLogic';
import type { GalleryItem, ProfileSettings } from '@/src/types/database';

interface GalleryManagerProps {
  profile: ProfileSettings;
  items: GalleryItem[];
  onProfileChange: (updated: ProfileSettings) => void;
  onItemsChange: (next: GalleryItem[]) => void;
  onNotify: (type: 'success' | 'error', text: string) => void;
}

interface GalleryFormState {
  id: string | null;
  title: string;
  image_url: string;
  width: number | null;
  height: number | null;
  display_order: number;
  is_visible: boolean;
}

function emptyGalleryForm(nextOrder: number): GalleryFormState {
  return {
    id: null,
    title: '',
    image_url: '',
    width: null,
    height: null,
    display_order: nextOrder,
    is_visible: true,
  };
}

export function GalleryManager({
  profile,
  items,
  onProfileChange,
  onItemsChange,
  onNotify,
}: GalleryManagerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<GalleryFormState>(() =>
    emptyGalleryForm(items.length + 1)
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [detectingDims, setDetectingDims] = useState(false);
  const [togglingGlobal, setTogglingGlobal] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const ordered = [...items].sort((a, b) => a.display_order - b.display_order);

  // Automatically measure naturalWidth/naturalHeight when URL changes in modal
  useEffect(() => {
    const url = form.image_url.trim();
    if (!modalOpen || !isSafeUrl(url)) {
      return;
    }

    let active = true;
    const timer = window.setTimeout(async () => {
      setDetectingDims(true);
      const dims = await measureImageDimensions(url);
      if (!active) return;
      setDetectingDims(false);
      if (dims) {
        setForm((prev) =>
          prev.image_url.trim() === url
            ? { ...prev, width: dims.width, height: dims.height }
            : prev
        );
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [form.image_url, modalOpen]);

  const handleToggleGlobalGallery = async (checked: boolean) => {
    setTogglingGlobal(true);
    try {
      const updated = await saveProfileSettings({
        ...profile,
        show_gallery: checked,
      });
      onProfileChange(updated);
      onNotify(
        'success',
        checked
          ? 'Photo Gallery section enabled on public portfolio.'
          : 'Photo Gallery section hidden from public portfolio and Navbar.'
      );
    } catch (err) {
      onNotify(
        'error',
        err instanceof Error ? err.message : 'Unable to update gallery visibility.'
      );
    } finally {
      setTogglingGlobal(false);
    }
  };

  const openCreateModal = () => {
    setForm(emptyGalleryForm(items.length + 1));
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (item: GalleryItem) => {
    setForm({
      id: item.id,
      title: item.title ?? '',
      image_url: item.image_url ?? '',
      width: item.width ?? null,
      height: item.height ?? null,
      display_order: item.display_order,
      is_visible: item.is_visible,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleUploadSingleImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    setFormError(null);
    try {
      const uploaded = await uploadPortfolioMedia(file, 'gallery');
      const dims = await measureImageDimensions(uploaded.url);
      const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
      setForm((p) => ({
        ...p,
        image_url: uploaded.url,
        title: p.title.trim() ? p.title : baseName,
        width: dims?.width ?? p.width,
        height: dims?.height ?? p.height,
      }));
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Failed to upload gallery image.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleBulkUploadImages = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;

    setBulkUploading(true);
    let latestItems = ordered;
    let nextOrder =
      ordered.reduce((max, item) => Math.max(max, item.display_order), 0) + 1;
    let addedCount = 0;

    try {
      for (const file of files) {
        const uploaded = await uploadPortfolioMedia(file, 'gallery');
        const dims = await measureImageDimensions(uploaded.url);
        const title = resolveGalleryTitle(
          file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
          uploaded.url
        );
        const payload: GalleryItem = {
          id: `gal-${Date.now()}-${addedCount}`,
          title,
          caption: '',
          category: 'Gallery',
          image_url: uploaded.url,
          width: dims?.width ?? null,
          height: dims?.height ?? null,
          display_order: nextOrder++,
          is_visible: true,
          created_at: new Date().toISOString(),
        };
        latestItems = await upsertGalleryItem(payload, true);
        addedCount += 1;
      }

      onItemsChange(latestItems);
      onNotify(
        'success',
        `Uploaded ${addedCount} photo${addedCount === 1 ? '' : 's'} with natural dimensions.`
      );
    } catch (err) {
      onNotify(
        'error',
        err instanceof Error ? err.message : 'Bulk photo upload failed.'
      );
    } finally {
      setBulkUploading(false);
    }
  };

  const handleSaveItem = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validation = validateGalleryItemInput({
      title: form.title,
      image_url: form.image_url,
      display_order: form.display_order,
    });

    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0];
      setFormError(firstError ?? 'Provide a valid image URL or upload an image file.');
      return;
    }

    setSaving(true);
    try {
      const isNew = !form.id;
      const cleanUrl = form.image_url.trim();
      const dims =
        form.width && form.height
          ? { width: form.width, height: form.height }
          : await measureImageDimensions(cleanUrl);

      const payload: GalleryItem = {
        id: form.id ?? `gal-${Date.now()}`,
        title: resolveGalleryTitle(form.title, cleanUrl),
        caption: '',
        category: 'Gallery',
        image_url: cleanUrl,
        width: dims?.width ?? null,
        height: dims?.height ?? null,
        display_order: Number(form.display_order) || 1,
        is_visible: form.is_visible,
        created_at: new Date().toISOString(),
      };
      const next = await upsertGalleryItem(payload, isNew);
      onItemsChange(next);
      setModalOpen(false);
      onNotify(
        'success',
        isNew ? 'Gallery photo added.' : 'Gallery photo updated.'
      );
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Failed to save gallery photo.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleItemVisibility = async (item: GalleryItem) => {
    setTogglingId(item.id);
    try {
      const next = await upsertGalleryItem(
        { ...item, is_visible: !item.is_visible },
        false
      );
      onItemsChange(next);
      onNotify(
        'success',
        !item.is_visible ? 'Photo shown in public gallery.' : 'Photo hidden.'
      );
    } catch (err) {
      onNotify(
        'error',
        err instanceof Error ? err.message : 'Unable to toggle photo visibility.'
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const next = await deleteGalleryItem(deleteTarget.id);
      onItemsChange(next);
      onNotify('success', `Deleted "${deleteTarget.title || 'photo'}".`);
      setDeleteTarget(null);
    } catch (err) {
      onNotify(
        'error',
        err instanceof Error ? err.message : 'Unable to delete photo.'
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Master Visibility Control & Quick Bulk Upload Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200/80 bg-white p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-200/80 bg-orange-50 text-orange-600">
            {profile.show_gallery ? (
              <Eye className="h-4 w-4" aria-hidden="true" />
            ) : (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold tracking-tight text-zinc-950">
              Public Photo Gallery
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Auto-arranging masonry grid with automatic dimension detection.
              Toggle off to hide #gallery and the Navbar link.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2.5 self-end sm:flex-nowrap lg:self-auto">
          <div className="flex shrink-0 items-center gap-2 pr-1">
            <span className="text-xs font-medium text-zinc-600">
              {profile.show_gallery ? 'Visible' : 'Hidden'}
            </span>
            <Switch
              aria-label="Toggle public photo gallery visibility"
              disabled={togglingGlobal}
              checked={profile.show_gallery}
              onCheckedChange={handleToggleGlobalGallery}
            />
          </div>

          <label className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-orange-200/90 bg-orange-50/70 px-3 text-xs font-medium text-orange-800 transition-colors hover:bg-orange-100/70">
            {bulkUploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{bulkUploading ? 'Uploading...' : 'Quick Bulk Upload'}</span>
            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleBulkUploadImages}
              disabled={bulkUploading}
              className="sr-only"
            />
          </label>

          <Button
            type="button"
            size="sm"
            className="shrink-0 whitespace-nowrap"
            onClick={openCreateModal}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Add Photo</span>
          </Button>
        </div>
      </div>

      {/* Gallery Items Grid */}
      {ordered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-14 text-center">
          <Images className="h-8 w-8 text-zinc-400" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-zinc-800">
            No gallery photos added yet.
          </p>
          <Button
            type="button"
            size="sm"
            className="mt-4"
            onClick={openCreateModal}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Add First Photo</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.map((item) => (
            <div
              key={item.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white"
            >
              <div className="relative aspect-[4/3] bg-zinc-100">
                {isSafeUrl(item.image_url) ? (
                  <img
                    src={item.image_url}
                    alt={item.title || 'Gallery photo'}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-zinc-400">
                    <ImageOff className="h-6 w-6" aria-hidden="true" />
                  </div>
                )}

                {item.width && item.height && (
                  <span className="absolute top-3 left-3 rounded-md bg-zinc-950/75 px-2 py-0.5 font-mono text-[11px] text-white tabular-nums">
                    {item.width} × {item.height}
                  </span>
                )}
                <span className="absolute top-3 right-3 rounded-md bg-zinc-950/75 px-2 py-0.5 font-mono text-[11px] text-white">
                  #{item.display_order}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-zinc-200/70 p-3.5">
                <div className="flex items-center gap-2 min-w-0">
                  <Switch
                    aria-label={`Toggle visibility for ${item.title || 'photo'}`}
                    disabled={togglingId === item.id}
                    checked={item.is_visible}
                    onCheckedChange={() => handleToggleItemVisibility(item)}
                  />
                  <span className="truncate text-xs font-medium text-zinc-700">
                    {item.title || `Photo #${item.display_order}`}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(item)}
                    aria-label={`Edit ${item.title || 'photo'}`}
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteTarget(item)}
                    aria-label={`Delete ${item.title || 'photo'}`}
                  >
                    <Trash2
                      className="h-3.5 w-3.5 text-red-600"
                      aria-hidden="true"
                    />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Simplified Add / Edit Photo Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {form.id ? 'Edit Gallery Photo' : 'Add Gallery Photo'}
            </DialogTitle>
            <DialogDescription>
              Upload an image or paste an image URL. Natural dimensions are
              detected automatically.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveItem} className="space-y-4">
            {formError && (
              <div className="rounded-xl border border-red-200 bg-red-50/80 px-3.5 py-2.5 text-xs text-red-800">
                {formError}
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-50 flex items-center justify-center">
                {isSafeUrl(form.image_url) ? (
                  <img
                    src={form.image_url}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Images className="h-6 w-6 text-zinc-400" aria-hidden="true" />
                )}
              </div>

              <div className="space-y-2">
                <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200/90 bg-white px-3 text-xs font-medium text-zinc-700 transition-colors hover:border-orange-300 hover:text-orange-700">
                  {uploading ? (
                    <Loader2
                      className="h-3.5 w-3.5 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  <span>{uploading ? 'Uploading...' : 'Upload Image File'}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleUploadSingleImage}
                    disabled={uploading}
                    className="sr-only"
                  />
                </label>

                <div className="text-[11px] font-mono text-zinc-500">
                  {detectingDims
                    ? 'Detecting dimensions...'
                    : form.width && form.height
                    ? `Detected: ${form.width} × ${form.height} px`
                    : 'Dimensions auto-detected on load'}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gal_image_url">Image URL</Label>
              <Input
                id="gal_image_url"
                placeholder="https://... or /images/..."
                value={form.image_url ?? ''}
                onChange={(e) =>
                  setForm((p) => ({ ...p, image_url: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-end">
              <div className="space-y-1.5">
                <Label htmlFor="gal_title">Label (Optional)</Label>
                <Input
                  id="gal_title"
                  placeholder="Auto-filled if left blank"
                  value={form.title ?? ''}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gal_order">Display Order</Label>
                <Input
                  id="gal_order"
                  type="number"
                  min={1}
                  value={form.display_order}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      display_order: Number(e.target.value) || 1,
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-[#FAFAFA] px-3.5 py-2.5">
              <span className="text-xs font-medium text-zinc-900">
                Visible in public gallery
              </span>
              <Switch
                aria-label="Toggle public photo visibility"
                checked={form.is_visible}
                onCheckedChange={(checked) =>
                  setForm((p) => ({ ...p, is_visible: checked }))
                }
              />
            </div>

            <div className="flex justify-end gap-2.5 border-t border-zinc-200/80 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving || uploading}>
                {saving ? (
                  <>
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{form.id ? 'Save Changes' : 'Add Photo'}</span>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete gallery photo?"
        description={
          deleteTarget
            ? `Remove "${deleteTarget.title || 'this photo'}" from the portfolio gallery?`
            : ''
        }
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
