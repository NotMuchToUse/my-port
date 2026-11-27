import { useMemo, useState, type FormEvent } from 'react';
import {
  Briefcase,
  GraduationCap,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';
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
import { Textarea } from '@/src/components/ui/textarea';
import { deleteExperience, upsertExperience } from '@/src/lib/data';
import { validateExperienceInput } from '@/src/lib/portfolioLogic';
import type { Experience, ExperienceType } from '@/src/types/database';

interface ExperienceManagerProps {
  experiences: Experience[];
  onExperiencesChange: (next: Experience[]) => void;
  onNotify: (type: 'success' | 'error', text: string) => void;
}

interface ExperienceFormState {
  id: string | null;
  title: string;
  organization: string;
  period: string;
  location: string;
  type: ExperienceType;
  description: string;
  display_order: number;
}

export function ExperienceManager({
  experiences,
  onExperiencesChange,
  onNotify,
}: ExperienceManagerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ExperienceFormState>({
    id: null,
    title: '',
    organization: '',
    period: '2025-06 to Present',
    location: 'Ho Chi Minh City',
    type: 'work',
    description: '',
    display_order: experiences.length + 1,
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Experience | null>(null);
  const [deleting, setDeleting] = useState(false);

  const ordered = useMemo(
    () => [...experiences].sort((a, b) => a.display_order - b.display_order),
    [experiences]
  );

  const openCreate = () => {
    setForm({
      id: null,
      title: '',
      organization: '',
      period: '2026-01 to Present',
      location: 'Ho Chi Minh City',
      type: 'work',
      description: '',
      display_order: experiences.length + 1,
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const openEdit = (entry: Experience) => {
    const periodText =
      entry.period ??
      `${entry.start_date} to ${entry.is_current ? 'Present' : entry.end_date ?? 'Present'}`;
    setForm({
      id: entry.id,
      title: entry.title,
      organization: entry.organization,
      period: periodText,
      location: entry.location,
      type: entry.type,
      description: entry.description ?? entry.summary,
      display_order: entry.display_order,
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const validation = validateExperienceInput({
      title: form.title,
      organization: form.organization,
      period: form.period,
      type: form.type,
      description: form.description,
      display_order: form.display_order,
    });

    if (!validation.valid) {
      setErrorMsg(
        Object.values(validation.errors)[0] ??
          'Please complete all required experience fields.'
      );
      return;
    }

    const isNew = !form.id;
    const existing = form.id
      ? experiences.find((x) => x.id === form.id)
      : undefined;
    const parts = form.period.split(/\s+to\s+|\s*-\s*/i);
    const startPart = parts[0]?.trim() || form.period.trim();
    const endPart = parts[1]?.trim() || null;
    const isCurrent = /present/i.test(form.period);

    const record: Experience = {
      id: form.id ?? `exp-${Date.now()}`,
      type: form.type,
      title: form.title.trim(),
      organization: form.organization.trim(),
      location: form.location.trim() || 'Remote',
      period: form.period.trim(),
      start_date: startPart,
      end_date: isCurrent ? null : endPart,
      is_current: isCurrent,
      summary: form.description.trim(),
      description: form.description.trim(),
      highlights: existing?.highlights ?? [],
      display_order: form.display_order,
    };

    setSaving(true);
    try {
      const next = await upsertExperience(record, isNew);
      onExperiencesChange(next);
      setModalOpen(false);
      onNotify(
        'success',
        isNew
          ? `Added timeline entry "${record.title}".`
          : `Updated timeline entry "${record.title}".`
      );
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Unable to save entry.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const next = await deleteExperience(deleteTarget.id);
      onExperiencesChange(next);
      onNotify('success', `Deleted "${deleteTarget.title}".`);
      setDeleteTarget(null);
    } catch (err) {
      onNotify(
        'error',
        err instanceof Error ? err.message : 'Failed to delete entry.'
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-950">
            Experience & Education Manager
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Manage work history and academic credentials displayed on your
            timeline.
          </p>
        </div>

        <Button type="button" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add Entry</span>
        </Button>
      </div>

      <div className="space-y-3">
        {ordered.map((entry) => {
          const isWork = entry.type === 'work';
          const Icon = isWork ? Briefcase : GraduationCap;
          return (
            <div
              key={entry.id}
              className="flex flex-col justify-between gap-4 rounded-2xl border border-zinc-200/80 bg-white p-5 sm:flex-row sm:items-center"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                    isWork
                      ? 'border-orange-200 bg-orange-50 text-orange-600'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-700'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-zinc-400 tabular-nums">
                      #{entry.display_order}
                    </span>
                    <h3 className="text-sm font-semibold text-zinc-950">
                      {entry.title}
                    </h3>
                    <Badge variant={isWork ? 'featured' : 'outline'}>
                      {isWork ? 'Work' : 'Education'}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {entry.organization} —{' '}
                    {entry.period ??
                      `${entry.start_date} to ${
                        entry.is_current ? 'Present' : entry.end_date
                      }`}
                  </p>
                  <p className="mt-1.5 text-xs text-zinc-600 leading-relaxed">
                    {entry.description ?? entry.summary}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label={`Edit experience ${entry.title}`}
                  onClick={() => openEdit(entry)}
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Edit</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={`Delete experience ${entry.title}`}
                  onClick={() => setDeleteTarget(entry)}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {form.id ? 'Edit Timeline Entry' : 'Add Experience or Education'}
            </DialogTitle>
            <DialogDescription>
              Specify role title, organization, period, type, and description.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            {errorMsg && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {errorMsg}
              </p>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ex_type">Type</Label>
                <select
                  id="ex_type"
                  value={form.type}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      type: e.target.value as ExperienceType,
                    }))
                  }
                  className="flex h-10 w-full rounded-lg border border-zinc-200/90 bg-white px-3 text-sm text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                >
                  <option value="work">Work</option>
                  <option value="education">Education</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ex_order">Display Order</Label>
                <Input
                  id="ex_order"
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

            <div className="space-y-1.5">
              <Label htmlFor="ex_title">Role or Degree Title</Label>
              <Input
                id="ex_title"
                placeholder="Backend Engineering Intern"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ex_org">Organization</Label>
                <Input
                  id="ex_org"
                  placeholder="My-Logistics Tech Lab"
                  value={form.organization}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, organization: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ex_period">Period</Label>
                <Input
                  id="ex_period"
                  placeholder="2025-06 to 2026-02"
                  value={form.period}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, period: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ex_location">Location</Label>
              <Input
                id="ex_location"
                value={form.location}
                onChange={(e) =>
                  setForm((p) => ({ ...p, location: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ex_desc">Description</Label>
              <Textarea
                id="ex_desc"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
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
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{form.id ? 'Save Changes' : 'Add Entry'}</span>
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
        title="Delete Experience Entry"
        description={`Delete "${deleteTarget?.title ?? ''}" from your background timeline?`}
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
