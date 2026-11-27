import type {
  AdminOverviewStats,
  ContactMessage,
  Experience,
  GalleryItem,
  Project,
  SiteLanguage,
  Skill,
  SkillCategory,
} from '../types/database';

export type ProjectFilter = 'All' | 'Featured' | string;

export interface ContactFormInput {
  sender_name: string;
  sender_email: string;
  subject: string;
  message: string;
}

export interface ContactValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof ContactFormInput, string>>;
}

export interface ProjectDraftInput {
  title: string;
  slug?: string;
  role: string;
  summary: string;
  description: string;
  tech_stack: string[];
  highlights: string[];
}

export interface ProjectValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof ProjectDraftInput, string>>;
}

export interface SkillDraftInput {
  name: string;
  category: SkillCategory;
  level_label: string;
  display_order: number;
}

export interface ExperienceDraftInput {
  title: string;
  organization: string;
  period: string;
  type: 'work' | 'education';
  description: string;
  display_order: number;
}

export interface GalleryDraftInput {
  title?: string;
  caption?: string;
  category?: string;
  image_url: string;
  width?: number | null;
  height?: number | null;
  display_order: number;
}

export interface LoginDraftInput {
  email: string;
  password: string;
}

const SKILL_CATEGORY_ORDER: SkillCategory[] = [
  'Backend & Architecture',
  'Frontend',
  'Database & DevOps',
];

/**
 * Validates that a URL uses a safe scheme (http, https, root-relative, hash, or allowed image/pdf data URI).
 * Input: raw URL string; Output: boolean indicating whether rendering as href/src is safe.
 */
export function isSafeUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return true;
  if (/^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(trimmed)) return true;
  if (/^data:application\/pdf;base64,/i.test(trimmed)) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Computes summary KPI metrics for the Admin Overview dashboard.
 * Input: projects, skills, contact messages, and optional gallery items; Output: AdminOverviewStats.
 */
export function computeAdminOverviewStats(
  projects: Project[],
  skills: Skill[],
  messages: ContactMessage[],
  galleryItems: GalleryItem[] = []
): AdminOverviewStats {
  return {
    totalProjects: projects.length,
    featuredProjects: projects.filter((p) => p.is_featured).length,
    totalSkills: skills.length,
    unreadMessages: messages.filter((m) => !m.is_read).length,
    totalGalleryItems: galleryItems.length,
  };
}

/**
 * Filters and sorts projects by All, Featured, or a specific tech stack tag.
 * Input: projects array and active filter; Output: filtered and ordered Project array.
 */
export function filterProjects(
  projects: Project[],
  filter: ProjectFilter
): Project[] {
  const sorted = [...projects].sort((a, b) => a.display_order - b.display_order);

  if (filter === 'All') {
    return sorted;
  }

  if (filter === 'Featured') {
    return sorted.filter((project) => project.is_featured);
  }

  const normalizedFilter = filter.toLowerCase();
  return sorted.filter((project) =>
    (project.tech_stack ?? []).some(
      (tag) => tag.toLowerCase() === normalizedFilter
    )
  );
}

/**
 * Extracts top technology tags ordered by frequency for project filter tabs.
 * Input: projects array and max count; Output: array of unique tech stack strings.
 */
export function extractTopTechTags(projects: Project[], limit = 5): string[] {
  const counts = new Map<string, number>();

  for (const project of projects) {
    for (const tag of project.tech_stack ?? []) {
      const trimmed = tag.trim();
      if (!trimmed) continue;
      counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([tag]) => tag);
}

/**
 * Groups skills into fixed architectural categories sorted by display order.
 * Input: skills array; Output: array of { category, items } sections.
 */
export function groupSkillsByCategory(
  skills: Skill[]
): Array<{ category: SkillCategory; items: Skill[] }> {
  return SKILL_CATEGORY_ORDER.map((category) => ({
    category,
    items: skills
      .filter((skill) => skill.category === category)
      .sort((a, b) => a.display_order - b.display_order),
  }));
}

/**
 * Filters visible gallery items and optionally narrows by category, ordered by display_order.
 * Input: gallery items array and active category ('All' for all); Output: ordered GalleryItem[].
 */
export function getVisibleGalleryItems(
  items: GalleryItem[],
  category = 'All'
): GalleryItem[] {
  const visible = items.filter((item) => item.is_visible);
  const filtered =
    category === 'All'
      ? visible
      : visible.filter(
          (item) => item.category.toLowerCase() === category.toLowerCase()
        );
  return [...filtered].sort((a, b) => a.display_order - b.display_order);
}

/**
 * Extracts unique non-empty categories from visible gallery items.
 * Input: gallery items; Output: ordered unique category strings.
 */
export function extractGalleryCategories(items: GalleryItem[]): string[] {
  const seen = new Set<string>();
  const categories: string[] = [];

  for (const item of [...items].sort((a, b) => a.display_order - b.display_order)) {
    if (!item.is_visible) continue;
    const cat = item.category.trim();
    if (!cat || seen.has(cat.toLowerCase())) continue;
    seen.add(cat.toLowerCase());
    categories.push(cat);
  }

  return categories;
}

export interface AlbumPhotoItem {
  key: string;
  src: string;
  width: number;
  height: number;
  alt: string;
}

/**
 * Resolves a default gallery title from filename or timestamp when left blank.
 * Input: raw title string, image URL, optional epoch ms; Output: clean non-empty title.
 */
export function resolveGalleryTitle(
  rawTitle: string | null | undefined,
  imageUrl: string,
  timestamp = Date.now()
): string {
  const trimmed = (rawTitle ?? '').trim();
  if (trimmed) return trimmed;

  const cleanUrl = imageUrl.trim();
  if (cleanUrl && !cleanUrl.startsWith('data:')) {
    try {
      const pathPart = cleanUrl.split('?')[0].split('#')[0];
      const baseName = pathPart.split('/').pop() ?? '';
      const withoutExt = baseName.replace(/\.[^.]+$/, '').replace(/^\d+-/, '');
      const readable = withoutExt.replace(/[-_]+/g, ' ').trim();
      if (readable.length >= 2) {
        return readable.slice(0, 80);
      }
    } catch {
      // Fallback to timestamp label
    }
  }

  return `Photo ${new Date(timestamp).toISOString().slice(0, 16).replace('T', ' ')}`;
}

/**
 * Maps visible, safe-URL gallery items into react-photo-album photo descriptors
 * using stored or browser-measured natural aspect dimensions.
 * Input: GalleryItem[] and measured dimension lookup; Output: ordered AlbumPhotoItem[].
 */
export function buildAlbumPhotos(
  items: GalleryItem[],
  measuredDimensions: Record<string, { width: number; height: number }> = {}
): AlbumPhotoItem[] {
  return getVisibleGalleryItems(items, 'All')
    .filter((item) => isSafeUrl(item.image_url))
    .map((item) => {
      const measured = measuredDimensions[item.id];
      const width =
        measured?.width && measured.width > 0
          ? measured.width
          : typeof item.width === 'number' && item.width > 0
          ? item.width
          : 1200;
      const height =
        measured?.height && measured.height > 0
          ? measured.height
          : typeof item.height === 'number' && item.height > 0
          ? item.height
          : 896;

      return {
        key: item.id,
        src: item.image_url,
        width,
        height,
        alt: item.title?.trim() || 'Gallery photo',
      };
    });
}

/**
 * Sorts experiences by optional type filter and display_order ascending.
 * Input: experiences array and optional type; Output: sorted Experience array.
 */
export function sortExperiences(
  experiences: Experience[],
  typeFilter: 'all' | 'work' | 'education' = 'all'
): Experience[] {
  const filtered =
    typeFilter === 'all'
      ? experiences
      : experiences.filter((item) => item.type === typeFilter);

  return [...filtered].sort((a, b) => a.display_order - b.display_order);
}

/**
 * Formats an experience period cleanly without duplicating "to Present" when start_date already encodes a range.
 * Input: partial Experience date fields; Output: clean period label.
 */
export function formatExperiencePeriod(input: {
  period?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_current?: boolean;
}): string {
  const explicitPeriod = input.period?.trim();
  if (explicitPeriod) return explicitPeriod;

  const start = input.start_date?.trim() ?? '';
  const end = input.end_date?.trim() ?? '';
  if (!start) return 'Present';

  const alreadyRange = !end && /(\s-\s|\sto\s|present)/i.test(start);
  if (alreadyRange) return start;

  return `${start} to ${input.is_current ? 'Present' : end || 'Present'}`;
}

/**
 * Sorts messages by created_at descending (newest first).
 * Input: ContactMessage[]; Output: sorted ContactMessage[].
 */
export function sortMessagesNewestFirst(
  messages: ContactMessage[]
): ContactMessage[] {
  return [...messages].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

/**
 * Validates login email and password fields before Supabase authentication.
 * Input: LoginDraftInput; Output: { valid, errors }.
 */
export function validateLoginInput(input: LoginDraftInput): {
  valid: boolean;
  errors: Partial<Record<keyof LoginDraftInput, string>>;
} {
  const errors: Partial<Record<keyof LoginDraftInput, string>> = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(input.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }
  if (input.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates contact form fields before submission in Vietnamese or English.
 * Input: ContactFormInput and optional SiteLanguage; Output: validation status and localized error messages.
 */
export function validateContactForm(
  input: ContactFormInput,
  lang: SiteLanguage = 'en'
): ContactValidationResult {
  const errors: Partial<Record<keyof ContactFormInput, string>> = {};
  const name = input.sender_name.trim();
  const email = input.sender_email.trim();
  const subject = input.subject.trim();
  const message = input.message.trim();

  if (name.length < 2) {
    errors.sender_name =
      lang === 'vi'
        ? 'Vui lòng nhập họ tên (tối thiểu 2 ký tự).'
        : 'Please enter your name (at least 2 characters).';
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    errors.sender_email =
      lang === 'vi'
        ? 'Vui lòng nhập địa chỉ email hợp lệ.'
        : 'Please enter a valid email address.';
  }

  if (subject.length < 3) {
    errors.subject =
      lang === 'vi'
        ? 'Vui lòng nhập tiêu đề ngắn gọn (tối thiểu 3 ký tự).'
        : 'Please provide a short subject line (at least 3 characters).';
  }

  if (message.length < 10) {
    errors.message =
      lang === 'vi'
        ? 'Vui lòng nhập nội dung tối thiểu 10 ký tự.'
        : 'Please enter a message of at least 10 characters.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates CMS project creation/edit inputs.
 * Input: ProjectDraftInput; Output: validation status and per-field errors.
 */
export function validateProjectInput(
  input: ProjectDraftInput
): ProjectValidationResult {
  const errors: Partial<Record<keyof ProjectDraftInput, string>> = {};

  if (input.title.trim().length < 2) {
    errors.title = 'Project title is required.';
  }
  if (input.slug !== undefined && input.slug.trim().length < 2) {
    errors.slug = 'Project slug is required.';
  }
  if (input.role.trim().length < 2) {
    errors.role = 'Role is required.';
  }
  if (input.summary.trim().length < 10) {
    errors.summary = 'Summary must be at least 10 characters.';
  }
  if (input.description.trim().length < 20) {
    errors.description = 'Description must be at least 20 characters.';
  }
  if (input.tech_stack.length === 0) {
    errors.tech_stack = 'Add at least one technology tag.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates CMS skill creation/edit inputs.
 * Input: SkillDraftInput; Output: { valid, errors }.
 */
export function validateSkillInput(input: SkillDraftInput): {
  valid: boolean;
  errors: Partial<Record<keyof SkillDraftInput, string>>;
} {
  const errors: Partial<Record<keyof SkillDraftInput, string>> = {};

  if (input.name.trim().length < 1) {
    errors.name = 'Skill name is required.';
  }
  if (input.level_label.trim().length < 2) {
    errors.level_label = 'Level label is required.';
  }
  if (!Number.isFinite(input.display_order) || input.display_order < 0) {
    errors.display_order = 'Display order must be a positive number.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates CMS experience/education creation/edit inputs.
 * Input: ExperienceDraftInput; Output: { valid, errors }.
 */
export function validateExperienceInput(input: ExperienceDraftInput): {
  valid: boolean;
  errors: Partial<Record<keyof ExperienceDraftInput, string>>;
} {
  const errors: Partial<Record<keyof ExperienceDraftInput, string>> = {};

  if (input.title.trim().length < 2) {
    errors.title = 'Title is required.';
  }
  if (input.organization.trim().length < 2) {
    errors.organization = 'Organization is required.';
  }
  if (input.period.trim().length < 4) {
    errors.period = 'Period is required (e.g. 2025-06 to 2026-02).';
  }
  if (input.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates CMS gallery item creation/edit inputs (title is optional and auto-filled on save).
 * Input: GalleryDraftInput; Output: { valid, errors }.
 */
export function validateGalleryItemInput(input: GalleryDraftInput): {
  valid: boolean;
  errors: Partial<Record<keyof GalleryDraftInput, string>>;
} {
  const errors: Partial<Record<keyof GalleryDraftInput, string>> = {};

  if (!isSafeUrl(input.image_url)) {
    errors.image_url = 'Provide a valid image URL or upload an image file.';
  }
  if (!Number.isFinite(input.display_order) || input.display_order < 1) {
    errors.display_order = 'Display order must be at least 1.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Generates a URL-safe slug from a project title.
 * Input: title string; Output: lowercase hyphenated slug.
 */
export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
