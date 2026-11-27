import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Loader2,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
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
import { Switch } from '@/src/components/ui/switch';
import { Textarea } from '@/src/components/ui/textarea';
import { deleteProject, upsertProject } from '@/src/lib/data';
import { slugifyTitle, validateProjectInput } from '@/src/lib/portfolioLogic';
import type { Project } from '@/src/types/database';

interface ProjectsManagerProps {
  projects: Project[];
  openCreateSignal?: number;
  onProjectsChange: (next: Project[]) => void;
  onNotify: (type: 'success' | 'error', text: string) => void;
}

interface ProjectFormState {
  id: string | null;
  title: string;
  slug: string;
  slugManual: boolean;
  role: string;
  summary: string;
  description: string;
  tech_stack: string[];
  highlights: string[];
  repo_url: string;
  live_url: string;
  thumbnail_url: string;
  is_featured: boolean;
  display_order: number;
}

function buildEmptyForm(nextOrder: number): ProjectFormState {
  return {
    id: null,
    title: '',
    slug: '',
    slugManual: false,
    role: 'Full-Stack Engineer',
    summary: '',
    description: '',
    tech_stack: ['TypeScript', 'PostgreSQL'],
    highlights: [''],
    repo_url: '',
    live_url: '',
    thumbnail_url: '',
    is_featured: true,
    display_order: nextOrder,
  };
}

export function ProjectsManager({
  projects,
  openCreateSignal = 0,
  onProjectsChange,
  onNotify,
}: ProjectsManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ProjectFormState>(() =>
    buildEmptyForm(projects.length + 1)
  );
  const [tagInput, setTagInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openCreateModal = () => {
    setForm(buildEmptyForm(projects.length + 1));
    setTagInput('');
    setFormError(null);
    setModalOpen(true);
  };

  useEffect(() => {
    if (openCreateSignal > 0) {
      openCreateModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openCreateSignal]);

  const openEditModal = (proj: Project) => {
    setForm({
      id: proj.id,
      title: proj.title,
      slug: proj.slug,
      slugManual: true,
      role: proj.role,
      summary: proj.summary,
      description: proj.description,
      tech_stack: [...(proj.tech_stack ?? [])],
      highlights:
        (proj.highlights ?? []).length > 0 ? [...(proj.highlights ?? [])] : [''],
      repo_url: proj.repo_url ?? proj.github_url ?? '',
      live_url: proj.live_url ?? '',
      thumbnail_url: proj.thumbnail_url ?? '',
      is_featured: proj.is_featured,
      display_order: proj.display_order,
    });
    setTagInput('');
    setFormError(null);
    setModalOpen(true);
  };

  const filteredProjects = useMemo(() => {
    const ordered = [...projects].sort(
      (a, b) => a.display_order - b.display_order
    );
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ordered;
    return ordered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        (p.tech_stack ?? []).some((t) => t.toLowerCase().includes(q))
    );
  }, [projects, searchQuery]);

  const handleAddTag = () => {
    const clean = tagInput.trim();
    if (!clean) return;
    if (!form.tech_stack.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      setForm((prev) => ({
        ...prev,
        tech_stack: [...prev.tech_stack, clean],
      }));
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tech_stack: prev.tech_stack.filter((t) => t !== tag),
    }));
  };

  const handleHighlightChange = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      highlights: prev.highlights.map((item, idx) =>
        idx === index ? value : item
      ),
    }));
  };

  const handleAddHighlight = () => {
    setForm((prev) => ({
      ...prev,
      highlights: [...prev.highlights, ''],
    }));
  };

  const handleRemoveHighlight = (index: number) => {
    setForm((prev) => ({
      ...prev,
      highlights:
        prev.highlights.length > 1
          ? prev.highlights.filter((_, idx) => idx !== index)
          : [''],
    }));
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanHighlights = form.highlights
      .map((h) => h.trim())
      .filter(Boolean);

    const finalSlug = form.slug.trim() || slugifyTitle(form.title);

    const validation = validateProjectInput({
      title: form.title,
      slug: finalSlug,
      role: form.role,
      summary: form.summary,
      description: form.description,
      tech_stack: form.tech_stack,
      highlights: cleanHighlights,
    });

    if (!validation.valid) {
      const firstErr = Object.values(validation.errors)[0];
      setFormError(firstErr ?? 'Please check all required fields.');
      return;
    }

    const isNew = !form.id;
    const existing = form.id
      ? projects.find((p) => p.id === form.id)
      : undefined;

    const record: Project = {
      id: form.id ?? `proj-${Date.now()}`,
      slug: finalSlug,
      title: form.title.trim(),
      role: form.role.trim(),
      summary: form.summary.trim(),
      description: form.description.trim(),
      tech_stack: form.tech_stack,
      highlights: cleanHighlights,
      repo_url: form.repo_url.trim() || null,
      github_url: form.repo_url.trim() || null,
      live_url: form.live_url.trim() || null,
      thumbnail_url: form.thumbnail_url.trim() || null,
      is_featured: form.is_featured,
      display_order: Number.isFinite(form.display_order)
        ? form.display_order
        : projects.length + 1,
      created_at: existing?.created_at ?? new Date().toISOString(),
    };

    setSaving(true);
    try {
      const next = await upsertProject(record, isNew);
      onProjectsChange(next);
      setModalOpen(false);
      onNotify(
        'success',
        isNew
          ? `Created project "${record.title}".`
          : `Updated project "${record.title}".`
      );
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Unable to save project.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFeatured = async (proj: Project) => {
    setTogglingId(proj.id);
    const optimistic = projects.map((item) =>
      item.id === proj.id ? { ...item, is_featured: !item.is_featured } : item
    );
    onProjectsChange(optimistic);

    try {
      const synced = await upsertProject(
        { ...proj, is_featured: !proj.is_featured },
        false
      );
      onProjectsChange(synced);
      onNotify(
        'success',
        `${proj.title} ${!proj.is_featured ? 'featured' : 'unfeatured'}.`
      );
    } catch (err) {
      onProjectsChange(projects);
      onNotify(
        'error',
        err instanceof Error ? err.message : 'Failed to update featured status.'
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const next = await deleteProject(deleteTarget.id);
      onProjectsChange(next);
      onNotify('success', `Deleted project "${deleteTarget.title}".`);
      setDeleteTarget(null);
    } catch (err) {
      onNotify(
        'error',
        err instanceof Error ? err.message : 'Failed to delete project.'
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
            Projects Manager
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Create, edit, reorder, feature, and remove portfolio projects.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400"
              aria-hidden="true"
            />
            <Input
              aria-label="Search projects"
              placeholder="Filter projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-52 pl-8 text-xs"
            />
          </div>
          <Button type="button" size="sm" onClick={openCreateModal}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>New Project</span>
          </Button>
        </div>
      </div>

      {/* Table / List View */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white">
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-medium text-zinc-900">
              No matching projects found.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={openCreateModal}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Add First Project</span>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200/80 bg-[#FAFAFA] text-xs font-medium text-zinc-500">
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Project</th>
                  <th className="px-5 py-3 hidden md:table-cell">Stack</th>
                  <th className="px-5 py-3">Featured</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredProjects.map((proj) => (
                  <tr
                    key={proj.id}
                    className="transition-colors hover:bg-zinc-50/70"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-zinc-500 tabular-nums">
                      {proj.display_order}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-zinc-950">
                          {proj.title}
                        </span>
                        {proj.is_featured && (
                          <Badge variant="featured">
                            <Sparkles className="h-3 w-3" aria-hidden="true" />
                            <span>Featured</span>
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-zinc-500">{proj.role}</p>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell min-w-[220px]">
                      <div className="flex flex-wrap gap-1.5">
                        {(proj.tech_stack ?? []).slice(0, 4).map((tech) => (
                          <span
                            key={tech}
                            className="whitespace-nowrap rounded border border-zinc-200/80 bg-zinc-50 px-2 py-0.5 font-mono text-[11px] text-zinc-700"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Switch
                        aria-label={`Toggle featured for ${proj.title}`}
                        checked={proj.is_featured}
                        disabled={togglingId === proj.id}
                        onCheckedChange={() => handleToggleFeatured(proj)}
                      />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          aria-label={`Edit project ${proj.title}`}
                          onClick={() => openEditModal(proj)}
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label={`Delete project ${proj.title}`}
                          onClick={() => setDeleteTarget(proj)}
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
        )}
      </div>

      {/* Create / Edit Project Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {form.id ? 'Edit Project' : 'Create New Project'}
            </DialogTitle>
            <DialogDescription>
              Configure architectural details, tech tags, highlights, and
              repository links.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            {formError && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700"
              >
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="pm_title">Project Title</Label>
                <Input
                  id="pm_title"
                  placeholder="My-Logistics Multi-Platform Ecosystem"
                  value={form.title}
                  onChange={(e) => {
                    const nextTitle = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      title: nextTitle,
                      slug: prev.slugManual
                        ? prev.slug
                        : slugifyTitle(nextTitle),
                    }));
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pm_slug">Slug (auto-generated)</Label>
                <Input
                  id="pm_slug"
                  placeholder="my-logistics-ecosystem"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      slug: e.target.value,
                      slugManual: true,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="pm_role">Role</Label>
                <Input
                  id="pm_role"
                  value={form.role}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, role: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pm_order">Display Order</Label>
                <Input
                  id="pm_order"
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
              <Label htmlFor="pm_summary">Card Summary</Label>
              <Textarea
                id="pm_summary"
                className="min-h-[75px]"
                value={form.summary}
                onChange={(e) =>
                  setForm((p) => ({ ...p, summary: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pm_desc">Architectural Description</Label>
              <Textarea
                id="pm_desc"
                className="min-h-[95px]"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>

            {/* Dynamic Tech Stack Tag Input */}
            <div className="space-y-2">
              <Label htmlFor="pm_tag_input">Tech Stack Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="pm_tag_input"
                  placeholder="Add technology tag (e.g. Redis)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTag}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>Add Tag</span>
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {form.tech_stack.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-xs text-zinc-800"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      aria-label={`Remove tag ${tag}`}
                      onClick={() => handleRemoveTag(tag)}
                      className="text-zinc-400 hover:text-zinc-900 cursor-pointer"
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Dynamic Highlights List Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Key Highlights</Label>
                <button
                  type="button"
                  onClick={handleAddHighlight}
                  className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Add Highlight</span>
                </button>
              </div>
              <div className="space-y-2">
                {form.highlights.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      aria-label={`Highlight ${idx + 1}`}
                      placeholder="Describe an architectural achievement or metric..."
                      value={item}
                      onChange={(e) =>
                        handleHighlightChange(idx, e.target.value)
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove highlight ${idx + 1}`}
                      onClick={() => handleRemoveHighlight(idx)}
                    >
                      <X className="h-4 w-4 text-zinc-500" aria-hidden="true" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="pm_repo">Repository URL</Label>
                <Input
                  id="pm_repo"
                  placeholder="https://github.com/..."
                  value={form.repo_url}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, repo_url: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pm_live">Live Demo URL</Label>
                <Input
                  id="pm_live"
                  placeholder="https://..."
                  value={form.live_url}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, live_url: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pm_thumb">Thumbnail URL</Label>
                <Input
                  id="pm_thumb"
                  placeholder="https://..."
                  value={form.thumbnail_url}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, thumbnail_url: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-[#FAFAFA] px-4 py-3">
              <div>
                <p className="text-xs font-medium text-zinc-900">
                  Featured Project
                </p>
                <p className="text-[11px] text-zinc-500">
                  Highlight this project under the Featured tab
                </p>
              </div>
              <Switch
                aria-label="Mark project as featured"
                checked={form.is_featured}
                onCheckedChange={(checked) =>
                  setForm((p) => ({ ...p, is_featured: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-zinc-200/80 pt-4">
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
                  <span>{form.id ? 'Save Changes' : 'Create Project'}</span>
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
        title="Delete Project"
        description={`Are you sure you want to remove "${
          deleteTarget?.title ?? ''
        }"? This action cannot be undone.`}
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
