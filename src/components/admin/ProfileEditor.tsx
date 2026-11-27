import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  ExternalLink,
  FileText,
  Globe,
  Loader2,
  Mail,
  Save,
  Trash2,
  Upload,
  User,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Switch } from '@/src/components/ui/switch';
import { Textarea } from '@/src/components/ui/textarea';
import { saveProfileSettings, uploadPortfolioMedia } from '@/src/lib/data';
import { isSafeUrl } from '@/src/lib/portfolioLogic';
import type { ProfileSettings, SiteLanguage } from '@/src/types/database';

interface ProfileEditorProps {
  profile: ProfileSettings;
  onSaved: (updated: ProfileSettings) => void;
  onNotify: (type: 'success' | 'error', text: string) => void;
}

export function ProfileEditor({
  profile,
  onSaved,
  onNotify,
}: ProfileEditorProps) {
  const [form, setForm] = useState<ProfileSettings>(profile);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const uploaded = await uploadPortfolioMedia(file, 'avatars');
      setForm((p) => ({ ...p, avatar_url: uploaded.url }));
      onNotify(
        'success',
        uploaded.storageMode === 'supabase'
          ? 'Portrait photo uploaded to Supabase Storage. Save profile to apply.'
          : 'Portrait photo loaded locally. Save profile to apply.'
      );
    } catch (err) {
      onNotify(
        'error',
        err instanceof Error ? err.message : 'Unable to upload portrait photo.'
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCvUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadingCv(true);
    try {
      const uploaded = await uploadPortfolioMedia(file, 'cv');
      setForm((p) => ({
        ...p,
        cv_url: uploaded.url,
        cv_file_name: uploaded.fileName,
      }));
      onNotify(
        'success',
        uploaded.storageMode === 'supabase'
          ? 'CV PDF uploaded to Supabase Storage. Save profile to apply.'
          : 'CV PDF loaded locally. Save profile to apply.'
      );
    } catch (err) {
      onNotify(
        'error',
        err instanceof Error ? err.message : 'Unable to upload CV PDF.'
      );
    } finally {
      setUploadingCv(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.role_title.trim()) {
      onNotify('error', 'Full name and role title are required.');
      return;
    }

    if (form.avatar_url && !isSafeUrl(form.avatar_url)) {
      onNotify('error', 'Portrait photo URL must be a safe http/https or local path.');
      return;
    }
    if (form.cv_url && !isSafeUrl(form.cv_url)) {
      onNotify('error', 'CV URL must be a safe http/https, PDF, or local path.');
      return;
    }

    setSaving(true);
    try {
      const saved = await saveProfileSettings(form);
      onSaved(saved);
      onNotify('success', 'Profile, portrait, and CV settings saved.');
    } catch (err) {
      onNotify(
        'error',
        err instanceof Error ? err.message : 'Failed to save profile settings.'
      );
    } finally {
      setSaving(false);
    }
  };

  const hasValidAvatar = Boolean(form.avatar_url) && isSafeUrl(form.avatar_url);
  const hasValidCv = Boolean(form.cv_url?.trim()) && isSafeUrl(form.cv_url);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Core Identity & Copy */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 sm:p-8 space-y-6">
        <div className="border-b border-zinc-200/70 pb-4">
          <h2 className="text-lg font-bold tracking-tight text-zinc-950">
            Profile & Hero Editor
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Edit public identity, default site language, availability pill, and
            contact routing.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="prof_full_name">Full Name</Label>
            <Input
              id="prof_full_name"
              value={form.full_name ?? ''}
              onChange={(e) =>
                setForm((p) => ({ ...p, full_name: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prof_role_title">Role Title</Label>
            <Input
              id="prof_role_title"
              value={form.role_title ?? ''}
              onChange={(e) =>
                setForm((p) => ({ ...p, role_title: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="prof_tagline">Tagline</Label>
          <Input
            id="prof_tagline"
            value={form.tagline ?? ''}
            onChange={(e) =>
              setForm((p) => ({ ...p, tagline: e.target.value }))
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="prof_bio">Bio</Label>
          <Textarea
            id="prof_bio"
            value={form.bio ?? ''}
            onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="prof_location">Location</Label>
            <Input
              id="prof_location"
              value={form.location ?? ''}
              onChange={(e) =>
                setForm((p) => ({ ...p, location: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prof_email">Public Email</Label>
            <Input
              id="prof_email"
              type="email"
              value={form.email ?? ''}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prof_notification_email">
              Notification Email (Resend)
            </Label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400"
                aria-hidden="true"
              />
              <Input
                id="prof_notification_email"
                type="email"
                placeholder="alerts@example.com"
                value={form.notification_email ?? ''}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    notification_email: e.target.value,
                  }))
                }
                className="pl-8"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="prof_github">GitHub URL</Label>
            <Input
              id="prof_github"
              value={form.github_url ?? ''}
              onChange={(e) =>
                setForm((p) => ({ ...p, github_url: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prof_linkedin">LinkedIn URL</Label>
            <Input
              id="prof_linkedin"
              value={form.linkedin_url ?? ''}
              onChange={(e) =>
                setForm((p) => ({ ...p, linkedin_url: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 items-end border-t border-zinc-200/70 pt-5">
          <div className="space-y-1.5 sm:col-span-1">
            <Label htmlFor="prof_default_language">Default Language</Label>
            <div className="relative">
              <Globe
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400"
                aria-hidden="true"
              />
              <select
                id="prof_default_language"
                value={form.default_language ?? 'vi'}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    default_language: e.target.value as SiteLanguage,
                  }))
                }
                className="flex h-10 w-full rounded-lg border border-zinc-200/90 bg-white pl-8 pr-3 text-sm text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <option value="vi">Tiếng Việt (vi)</option>
                <option value="en">English (en)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5 sm:col-span-1">
            <Label htmlFor="prof_availability">Availability Banner Text</Label>
            <Input
              id="prof_availability"
              value={form.availability_text ?? ''}
              onChange={(e) =>
                setForm((p) => ({ ...p, availability_text: e.target.value }))
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-[#FAFAFA] px-4 py-2.5">
            <div>
              <p className="text-xs font-medium text-zinc-900">
                Available Badge
              </p>
              <p className="text-[11px] text-zinc-500">Show on Hero</p>
            </div>
            <Switch
              aria-label="Toggle availability status"
              checked={form.is_available}
              onCheckedChange={(checked) =>
                setForm((p) => ({ ...p, is_available: checked }))
              }
            />
          </div>
        </div>
      </div>

      {/* Portrait Photo & CV Management Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Portrait Photo Management */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 space-y-5">
          <div className="border-b border-zinc-200/70 pb-3">
            <h3 className="text-base font-bold tracking-tight text-zinc-950">
              Hero Portrait Photo
            </h3>
            <p className="mt-0.5 text-xs text-zinc-500">
              Upload an avatar to Supabase Storage or paste an image URL.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-50 flex items-center justify-center">
              {hasValidAvatar ? (
                <img
                  src={form.avatar_url as string}
                  alt="Portrait preview"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <User className="h-7 w-7 text-zinc-400" aria-hidden="true" />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200/90 bg-white px-3 text-xs font-medium text-zinc-700 transition-colors hover:border-orange-300 hover:text-orange-700">
                {uploadingAvatar ? (
                  <Loader2
                    className="h-3.5 w-3.5 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>{uploadingAvatar ? 'Uploading...' : 'Upload Image'}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="sr-only"
                />
              </label>

              {form.avatar_url && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setForm((p) => ({ ...p, avatar_url: null }))}
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-600" aria-hidden="true" />
                  <span>Remove Photo</span>
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prof_avatar_url">Portrait Image URL</Label>
            <Input
              id="prof_avatar_url"
              placeholder="https://... or /assets/..."
              value={form.avatar_url ?? ''}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  avatar_url: e.target.value.trim() ? e.target.value : null,
                }))
              }
            />
          </div>
        </div>

        {/* CV File Management */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 space-y-5">
          <div className="border-b border-zinc-200/70 pb-3">
            <h3 className="text-base font-bold tracking-tight text-zinc-950">
              CV / Resume File Management
            </h3>
            <p className="mt-0.5 text-xs text-zinc-500">
              Upload a PDF CV or link an external file. Leaving CV URL empty
              automatically hides the Download CV button in the Navbar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-orange-200/90 bg-orange-50/70 px-3 text-xs font-medium text-orange-800 transition-colors hover:bg-orange-100/70">
              {uploadingCv ? (
                <Loader2
                  className="h-3.5 w-3.5 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Upload className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>{uploadingCv ? 'Uploading PDF...' : 'Upload PDF CV'}</span>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleCvUpload}
                disabled={uploadingCv}
                className="sr-only"
              />
            </label>

            {hasValidCv && (
              <Button asChild type="button" variant="outline" size="sm">
                <a
                  href={form.cv_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Preview CV</span>
                </a>
              </Button>
            )}

            {form.cv_url && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setForm((p) => ({ ...p, cv_url: '', cv_file_name: '' }))
                }
              >
                <Trash2 className="h-3.5 w-3.5 text-red-600" aria-hidden="true" />
                <span>Remove CV</span>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="prof_cv_url">CV PDF URL</Label>
              <Input
                id="prof_cv_url"
                placeholder="/Nguyen-Quoc-Khang-CV.pdf"
                value={form.cv_url ?? ''}
                onChange={(e) =>
                  setForm((p) => ({ ...p, cv_url: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prof_cv_file_name">Download Filename</Label>
              <div className="relative">
                <FileText
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400"
                  aria-hidden="true"
                />
                <Input
                  id="prof_cv_file_name"
                  placeholder="Nguyen-Quoc-Khang-CV.pdf"
                  value={form.cv_file_name ?? ''}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, cv_file_name: e.target.value }))
                  }
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button Bar */}
      <div className="flex justify-end rounded-2xl border border-zinc-200/80 bg-white px-6 py-4">
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" aria-hidden="true" />
              <span>Save Profile Settings</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
