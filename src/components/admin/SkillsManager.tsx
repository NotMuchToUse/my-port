import { useMemo, useState, type FormEvent } from 'react';
import {
  ArrowDown,
  ArrowUp,
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
import { deleteSkill, upsertSkill } from '@/src/lib/data';
import { validateSkillInput } from '@/src/lib/portfolioLogic';
import type { Skill, SkillCategory } from '@/src/types/database';

interface SkillsManagerProps {
  skills: Skill[];
  onSkillsChange: (next: Skill[]) => void;
  onNotify: (type: 'success' | 'error', text: string) => void;
}

interface SkillFormState {
  id: string | null;
  name: string;
  category: SkillCategory;
  level_label: string;
  context: string;
  display_order: number;
}

export function SkillsManager({
  skills,
  onSkillsChange,
  onNotify,
}: SkillsManagerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<SkillFormState>({
    id: null,
    name: '',
    category: 'Backend & Architecture',
    level_label: 'Primary',
    context: '',
    display_order: skills.length + 1,
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null);
  const [deleting, setDeleting] = useState(false);

  const orderedSkills = useMemo(
    () => [...skills].sort((a, b) => a.display_order - b.display_order),
    [skills]
  );

  const openCreate = () => {
    setForm({
      id: null,
      name: '',
      category: 'Backend & Architecture',
      level_label: 'Primary',
      context: '',
      display_order: skills.length + 1,
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const openEdit = (skill: Skill) => {
    setForm({
      id: skill.id,
      name: skill.name,
      category: skill.category,
      level_label: skill.level_label ?? skill.proficiency,
      context: skill.context,
      display_order: skill.display_order,
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const validation = validateSkillInput({
      name: form.name,
      category: form.category,
      level_label: form.level_label,
      display_order: form.display_order,
    });

    if (!validation.valid) {
      setErrorMsg(
        Object.values(validation.errors)[0] ?? 'Please complete skill fields.'
      );
      return;
    }

    const isNew = !form.id;
    const record: Skill = {
      id: form.id ?? `skill-${Date.now()}`,
      name: form.name.trim(),
      category: form.category,
      level_label: form.level_label.trim(),
      proficiency: form.level_label.trim(),
      context: form.context.trim() || 'Production systems delivery',
      display_order: form.display_order,
    };

    setSaving(true);
    try {
      const next = await upsertSkill(record, isNew);
      onSkillsChange(next);
      setModalOpen(false);
      onNotify(
        'success',
        isNew ? `Added skill "${record.name}".` : `Updated skill "${record.name}".`
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save skill.');
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= orderedSkills.length) return;

    const current = orderedSkills[index];
    const swap = orderedSkills[targetIndex];

    const updatedCurrent = { ...current, display_order: swap.display_order };
    const updatedSwap = { ...swap, display_order: current.display_order };

    if (updatedCurrent.display_order === updatedSwap.display_order) {
      updatedCurrent.display_order = targetIndex + 1;
      updatedSwap.display_order = index + 1;
    }

    try {
      await upsertSkill(updatedCurrent, false);
      const next = await upsertSkill(updatedSwap, false);
      onSkillsChange(next);
    } catch (err) {
      onNotify(
        'error',
        err instanceof Error ? err.message : 'Unable to reorder skills.'
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const next = await deleteSkill(deleteTarget.id);
      onSkillsChange(next);
      onNotify('success', `Deleted skill "${deleteTarget.name}".`);
      setDeleteTarget(null);
    } catch (err) {
      onNotify(
        'error',
        err instanceof Error ? err.message : 'Failed to delete skill.'
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
            Skills & Stack Manager
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Add, edit, reorder, and organize capabilities across technical stack
            groups.
          </p>
        </div>

        <Button type="button" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add Skill</span>
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200/80 bg-[#FAFAFA] text-xs font-medium text-zinc-500">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Skill</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Level</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {orderedSkills.map((skill, idx) => (
                <tr key={skill.id} className="hover:bg-zinc-50/70">
                  <td className="px-5 py-3 font-mono text-xs text-zinc-500 tabular-nums">
                    {skill.display_order}
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-zinc-950">{skill.name}</p>
                    <p className="text-xs text-zinc-500">{skill.context}</p>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant="outline">{skill.category}</Badge>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-zinc-700">
                    {skill.level_label ?? skill.proficiency}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={idx === 0}
                        aria-label={`Move ${skill.name} up`}
                        onClick={() => handleMove(idx, -1)}
                      >
                        <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={idx === orderedSkills.length - 1}
                        aria-label={`Move ${skill.name} down`}
                        onClick={() => handleMove(idx, 1)}
                      >
                        <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        aria-label={`Edit skill ${skill.name}`}
                        onClick={() => openEdit(skill)}
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label={`Delete skill ${skill.name}`}
                        onClick={() => setDeleteTarget(skill)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Skill Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {form.id ? 'Edit Skill' : 'Add Technical Skill'}
            </DialogTitle>
            <DialogDescription>
              Configure skill name, category grouping, level label, and order.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            {errorMsg && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {errorMsg}
              </p>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="sk_name">Skill Name</Label>
              <Input
                id="sk_name"
                placeholder="PostgreSQL"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="sk_category">Category</Label>
                <select
                  id="sk_category"
                  value={form.category}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      category: e.target.value as SkillCategory,
                    }))
                  }
                  className="flex h-10 w-full rounded-lg border border-zinc-200/90 bg-white px-3 text-sm text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                >
                  <option value="Backend & Architecture">
                    Backend & Architecture
                  </option>
                  <option value="Frontend">Frontend</option>
                  <option value="Database & DevOps">Database & DevOps</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sk_level">Level Label</Label>
                <Input
                  id="sk_level"
                  placeholder="Primary / Advanced / Proficient"
                  value={form.level_label}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, level_label: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="sk_context">Context</Label>
                <Input
                  id="sk_context"
                  placeholder="Schema normalization, indexing, RLS policies"
                  value={form.context}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, context: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sk_order">Display Order</Label>
                <Input
                  id="sk_order"
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
                  <span>{form.id ? 'Save Changes' : 'Add Skill'}</span>
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
        title="Delete Skill"
        description={`Remove "${deleteTarget?.name ?? ''}" from your technical stack?`}
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
