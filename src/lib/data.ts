import { createClient, getSupabaseEnv } from './supabase/client';
import {
  SEED_EXPERIENCES,
  SEED_GALLERY_ITEMS,
  SEED_MESSAGES,
  SEED_PROFILE,
  SEED_PROJECTS,
  SEED_SKILLS,
} from './mockData';
import type {
  ContactMessage,
  DataSourceStatus,
  Experience,
  GalleryItem,
  PortfolioData,
  ProfileSettings,
  Project,
  Skill,
} from '../types/database';
import {
  formatExperiencePeriod,
  isSafeUrl,
  type ContactFormInput,
} from './portfolioLogic';

const STORAGE_KEYS = {
  profile: 'nqk_portfolio_profile_v2',
  projects: 'nqk_portfolio_projects_v2',
  skills: 'nqk_portfolio_skills_v2',
  experiences: 'nqk_portfolio_experiences_v2',
  gallery: 'nqk_portfolio_gallery_v2',
  messages: 'nqk_portfolio_messages_v2',
} as const;

const PORTFOLIO_BUCKET = 'portfolio-media';

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  return [];
}

function normalizeProfile(raw: Partial<ProfileSettings> | null | undefined): ProfileSettings {
  const base = SEED_PROFILE;
  if (!raw) return base;
  const email = raw.email ?? base.email;
  const cvUrl = raw.cv_url ?? '';
  return {
    id: raw.id ?? base.id,
    full_name: raw.full_name ?? base.full_name,
    monogram: raw.monogram ?? base.monogram,
    role_title: raw.role_title ?? base.role_title,
    tagline: raw.tagline ?? base.tagline,
    bio: raw.bio ?? base.bio,
    availability_text: raw.availability_text ?? base.availability_text,
    is_available:
      typeof raw.is_available === 'boolean' ? raw.is_available : base.is_available,
    location: raw.location ?? base.location,
    email,
    notification_email: raw.notification_email ?? email ?? base.notification_email,
    github_url: raw.github_url ?? '',
    linkedin_url: raw.linkedin_url ?? '',
    cv_url: cvUrl,
    cv_file_name: raw.cv_file_name ?? (cvUrl ? 'Nguyen-Quoc-Khang-CV.pdf' : ''),
    avatar_url:
      raw.avatar_url === undefined ? base.avatar_url : raw.avatar_url,
    show_gallery:
      typeof raw.show_gallery === 'boolean' ? raw.show_gallery : base.show_gallery,
    default_language:
      raw.default_language === 'en' || raw.default_language === 'vi'
        ? raw.default_language
        : 'vi',
    updated_at: raw.updated_at ?? base.updated_at,
  };
}

function normalizeProject(raw: Partial<Project>, index: number): Project {
  const repo = raw.repo_url ?? raw.github_url ?? null;
  return {
    id: raw.id ?? `proj-${index}`,
    slug: raw.slug ?? `project-${index}`,
    title: raw.title ?? 'Untitled Project',
    role: raw.role ?? 'Developer',
    summary: raw.summary ?? '',
    description: raw.description ?? raw.summary ?? '',
    tech_stack: normalizeStringArray(raw.tech_stack),
    highlights: normalizeStringArray(raw.highlights),
    github_url: repo,
    repo_url: repo,
    live_url: raw.live_url ?? null,
    thumbnail_url: raw.thumbnail_url ?? null,
    is_featured: Boolean(raw.is_featured),
    display_order:
      typeof raw.display_order === 'number' ? raw.display_order : index + 1,
    created_at: raw.created_at ?? new Date().toISOString(),
  };
}

function normalizeSkill(raw: Partial<Skill>, index: number): Skill {
  const label = raw.level_label ?? raw.proficiency ?? 'Chính';
  return {
    id: raw.id ?? `skill-${index}`,
    name: raw.name ?? 'Skill',
    category: raw.category ?? 'Backend & Architecture',
    proficiency: label,
    level_label: label,
    context: raw.context ?? '',
    display_order:
      typeof raw.display_order === 'number' ? raw.display_order : index + 1,
  };
}

function normalizeExperience(raw: Partial<Experience>, index: number): Experience {
  const startDate = raw.start_date ?? '';
  const endDate = raw.end_date ?? null;
  const computedPeriod = formatExperiencePeriod({
    period: raw.period,
    start_date: startDate,
    end_date: endDate,
    is_current: raw.is_current,
  });
  const text = raw.description ?? raw.summary ?? '';

  return {
    id: raw.id ?? `exp-${index}`,
    type: raw.type === 'education' ? 'education' : 'work',
    title: raw.title ?? 'Role',
    organization: raw.organization ?? '',
    location: raw.location ?? '',
    period: computedPeriod,
    start_date: startDate || computedPeriod,
    end_date: endDate,
    is_current: Boolean(raw.is_current),
    summary: text,
    description: text,
    highlights: normalizeStringArray(raw.highlights),
    display_order:
      typeof raw.display_order === 'number' ? raw.display_order : index + 1,
  };
}

function normalizeGalleryItem(raw: Partial<GalleryItem>, index: number): GalleryItem {
  return {
    id: raw.id ?? `gal-${index}`,
    title: raw.title ?? 'Photo',
    caption: raw.caption ?? '',
    category: raw.category ?? 'General',
    image_url: isSafeUrl(raw.image_url) ? (raw.image_url as string) : '',
    width:
      typeof raw.width === 'number' && raw.width > 0 ? Math.round(raw.width) : null,
    height:
      typeof raw.height === 'number' && raw.height > 0 ? Math.round(raw.height) : null,
    display_order:
      typeof raw.display_order === 'number' ? raw.display_order : index + 1,
    is_visible: typeof raw.is_visible === 'boolean' ? raw.is_visible : true,
    created_at: raw.created_at ?? new Date().toISOString(),
  };
}

export function getDataSourceStatus(): DataSourceStatus {
  const env = getSupabaseEnv();
  if (env.isConfigured) {
    return {
      mode: 'supabase',
      configured: true,
    };
  }
  return {
    mode: 'fallback',
    configured: false,
    reason:
      'Supabase environment variables are not configured; running with local fallback store.',
  };
}

/**
 * Loads portfolio data from Supabase tables when configured, otherwise returns typed fallback data.
 * Input: none; Output: Promise<PortfolioData>.
 */
export async function fetchPortfolioData(): Promise<PortfolioData> {
  const client = createClient();

  if (client) {
    try {
      const [profileRes, projectsRes, skillsRes, experiencesRes, galleryRes] =
        await Promise.all([
          client.from('profile_settings').select('*').limit(1).maybeSingle(),
          client
            .from('projects')
            .select('*')
            .order('display_order', { ascending: true }),
          client
            .from('skills')
            .select('*')
            .order('display_order', { ascending: true }),
          client
            .from('experiences')
            .select('*')
            .order('display_order', { ascending: true }),
          client
            .from('gallery_items')
            .select('*')
            .order('display_order', { ascending: true }),
        ]);

      if (
        !profileRes.error &&
        !projectsRes.error &&
        !skillsRes.error &&
        !experiencesRes.error
      ) {
        const galleryItems =
          !galleryRes.error && galleryRes.data && galleryRes.data.length > 0
            ? (galleryRes.data as Partial<GalleryItem>[]).map(normalizeGalleryItem)
            : readStorage<Partial<GalleryItem>[]>(
                STORAGE_KEYS.gallery,
                SEED_GALLERY_ITEMS
              ).map(normalizeGalleryItem);

        return {
          profile: normalizeProfile(profileRes.data as Partial<ProfileSettings> | null),
          projects:
            projectsRes.data && projectsRes.data.length > 0
              ? (projectsRes.data as Partial<Project>[]).map(normalizeProject)
              : SEED_PROJECTS.map(normalizeProject),
          skills:
            skillsRes.data && skillsRes.data.length > 0
              ? (skillsRes.data as Partial<Skill>[]).map(normalizeSkill)
              : SEED_SKILLS.map(normalizeSkill),
          experiences:
            experiencesRes.data && experiencesRes.data.length > 0
              ? (experiencesRes.data as Partial<Experience>[]).map(
                  normalizeExperience
                )
              : SEED_EXPERIENCES.map(normalizeExperience),
          galleryItems,
          status: {
            mode: 'supabase',
            configured: true,
          },
        };
      }
    } catch {
      // Fall through cleanly to local fallback data
    }
  }

  return {
    profile: normalizeProfile(
      readStorage<Partial<ProfileSettings>>(STORAGE_KEYS.profile, SEED_PROFILE)
    ),
    projects: readStorage<Partial<Project>[]>(
      STORAGE_KEYS.projects,
      SEED_PROJECTS
    ).map(normalizeProject),
    skills: readStorage<Partial<Skill>[]>(
      STORAGE_KEYS.skills,
      SEED_SKILLS
    ).map(normalizeSkill),
    experiences: readStorage<Partial<Experience>[]>(
      STORAGE_KEYS.experiences,
      SEED_EXPERIENCES
    ).map(normalizeExperience),
    galleryItems: readStorage<Partial<GalleryItem>[]>(
      STORAGE_KEYS.gallery,
      SEED_GALLERY_ITEMS
    ).map(normalizeGalleryItem),
    status: getDataSourceStatus(),
  };
}

/**
 * Uploads an image or PDF file to the Supabase Storage `portfolio-media` bucket,
 * falling back cleanly to a local Data URL when Supabase Storage isn't available.
 * Input: File and target folder ('avatars' | 'gallery' | 'cv'); Output: public URL string.
 */
export async function uploadPortfolioMedia(
  file: File,
  folder: 'avatars' | 'gallery' | 'cv'
): Promise<{ url: string; fileName: string; storageMode: 'supabase' | 'local' }> {
  const isPdf = folder === 'cv';
  const maxBytes = isPdf ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(
      isPdf
        ? 'PDF file exceeds the 10 MB limit.'
        : 'Image file exceeds the 5 MB limit.'
    );
  }

  if (isPdf) {
    const validPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');
    if (!validPdf) {
      throw new Error('Please upload a valid .pdf file.');
    }
  } else {
    const validImage = /^image\/(png|jpeg|jpg|webp|gif)$/i.test(file.type);
    if (!validImage) {
      throw new Error('Please upload a PNG, JPG, WebP, or GIF image.');
    }
  }

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
  const objectPath = `${folder}/${Date.now()}-${cleanFileName}`;
  const client = createClient();

  if (client) {
    try {
      const { error: uploadError } = await client.storage
        .from(PORTFOLIO_BUCKET)
        .upload(objectPath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
        });

      if (!uploadError) {
        const { data: urlData } = client.storage
          .from(PORTFOLIO_BUCKET)
          .getPublicUrl(objectPath);
        if (urlData?.publicUrl) {
          return {
            url: urlData.publicUrl,
            fileName: file.name,
            storageMode: 'supabase',
          };
        }
      }
    } catch {
      // Fall back to Data URL when bucket/storage policy isn't provisioned yet
    }
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Unable to read selected file.'));
      }
    };
    reader.onerror = () => reject(new Error('Unable to read selected file.'));
    reader.readAsDataURL(file);
  });

  return {
    url: dataUrl,
    fileName: file.name,
    storageMode: 'local',
  };
}

/**
 * Submits a contact form via the server `/api/contact` route (saving to Supabase + triggering Resend email),
 * with seamless direct fallback if static preview has no backend route.
 * Input: ContactFormInput and active language; Output: created ContactMessage and source mode.
 */
export async function submitContactMessage(
  input: ContactFormInput,
  language: 'vi' | 'en' = 'vi'
): Promise<{ message: ContactMessage; mode: 'supabase' | 'fallback'; emailSent?: boolean }> {
  const payload = {
    sender_name: input.sender_name.trim(),
    sender_email: input.sender_email.trim(),
    subject: input.subject.trim(),
    message: input.message.trim(),
    language,
  };

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const json = (await res.json()) as {
        ok?: boolean;
        message?: ContactMessage;
        mode?: 'supabase' | 'fallback';
        emailSent?: boolean;
      };
      if (json.ok && json.message) {
        if (json.mode === 'fallback') {
          const existing = readStorage<ContactMessage[]>(
            STORAGE_KEYS.messages,
            SEED_MESSAGES
          );
          writeStorage(STORAGE_KEYS.messages, [json.message, ...existing]);
        }
        return {
          message: json.message,
          mode: json.mode ?? 'fallback',
          emailSent: Boolean(json.emailSent),
        };
      }
    }
  } catch {
    // Fall back to direct Supabase / localStorage persistence
  }

  const client = createClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('contact_messages')
        .insert({
          sender_name: payload.sender_name,
          sender_email: payload.sender_email,
          subject: payload.subject,
          message: payload.message,
          is_read: false,
        })
        .select()
        .single();

      if (!error && data) {
        return { message: data as ContactMessage, mode: 'supabase', emailSent: false };
      }
    } catch {
      // Fall back to local persistence
    }
  }

  const created: ContactMessage = {
    id: `msg-${Date.now()}`,
    sender_name: payload.sender_name,
    sender_email: payload.sender_email,
    subject: payload.subject,
    message: payload.message,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  const existing = readStorage<ContactMessage[]>(
    STORAGE_KEYS.messages,
    SEED_MESSAGES
  );
  writeStorage(STORAGE_KEYS.messages, [created, ...existing]);
  return { message: created, mode: 'fallback', emailSent: false };
}

/**
 * Fetches contact messages ordered newest first for the Admin CMS.
 * Input: none; Output: Promise<ContactMessage[]>.
 */
export async function fetchContactMessages(): Promise<ContactMessage[]> {
  const client = createClient();

  if (client) {
    try {
      const { data, error } = await client
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as ContactMessage[];
      }
    } catch {
      // Fall back
    }
  }

  const stored = readStorage<ContactMessage[]>(
    STORAGE_KEYS.messages,
    SEED_MESSAGES
  );
  return [...stored].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

/**
 * Persists updated profile settings to Supabase or local fallback store.
 * Input: ProfileSettings; Output: saved ProfileSettings.
 */
export async function saveProfileSettings(
  profile: ProfileSettings
): Promise<ProfileSettings> {
  const updated: ProfileSettings = {
    ...profile,
    updated_at: new Date().toISOString(),
  };
  const client = createClient();

  if (client) {
    const { data, error } = await client
      .from('profile_settings')
      .update(updated)
      .eq('id', updated.id)
      .select()
      .maybeSingle();

    if (!error && data) {
      return normalizeProfile(data as Partial<ProfileSettings>);
    }

    const { data: upserted, error: upsertError } = await client
      .from('profile_settings')
      .upsert(updated)
      .select()
      .single();

    if (!upsertError && upserted) {
      return normalizeProfile(upserted as Partial<ProfileSettings>);
    }

    // Fallback gracefully if optional columns aren't migrated yet
    writeStorage(STORAGE_KEYS.profile, updated);
    if (upsertError) {
      throw new Error(upsertError.message);
    }
  }

  writeStorage(STORAGE_KEYS.profile, updated);
  return updated;
}

/**
 * Creates or updates a gallery item via Supabase `.insert()` / `.update()` or local fallback store.
 * Input: GalleryItem and optional isNew flag; Output: updated GalleryItem array.
 */
export async function upsertGalleryItem(
  item: GalleryItem,
  isNew?: boolean
): Promise<GalleryItem[]> {
  const normalized = normalizeGalleryItem(item, item.display_order);
  const client = createClient();

  if (client) {
    const basePayload = {
      title: normalized.title,
      caption: normalized.caption,
      category: normalized.category,
      image_url: normalized.image_url,
      display_order: normalized.display_order,
      is_visible: normalized.is_visible,
    };
    const payloadWithDims =
      normalized.width && normalized.height
        ? { ...basePayload, width: normalized.width, height: normalized.height }
        : basePayload;

    let { error } = isNew
      ? await client.from('gallery_items').insert(payloadWithDims).select().single()
      : await client
          .from('gallery_items')
          .update(payloadWithDims)
          .eq('id', normalized.id)
          .select()
          .single();

    if (error && (error.message.includes('width') || error.message.includes('height'))) {
      const retry = isNew
        ? await client.from('gallery_items').insert(basePayload).select().single()
        : await client
            .from('gallery_items')
            .update(basePayload)
            .eq('id', normalized.id)
            .select()
            .single();
      error = retry.error;
    }

    if (!error) {
      const refreshed = await fetchPortfolioData();
      return refreshed.galleryItems;
    }
    if (!error.message.includes('gallery_items')) {
      throw new Error(error.message);
    }
  }

  const current = readStorage<Partial<GalleryItem>[]>(
    STORAGE_KEYS.gallery,
    SEED_GALLERY_ITEMS
  ).map(normalizeGalleryItem);
  const exists = current.some((entry) => entry.id === normalized.id);
  const next = exists
    ? current.map((entry) => (entry.id === normalized.id ? normalized : entry))
    : [...current, normalized];

  const sorted = [...next].sort((a, b) => a.display_order - b.display_order);
  writeStorage(STORAGE_KEYS.gallery, sorted);
  return sorted;
}

/**
 * Deletes a gallery item by ID from Supabase or local fallback store.
 * Input: gallery item ID; Output: updated GalleryItem array.
 */
export async function deleteGalleryItem(id: string): Promise<GalleryItem[]> {
  const client = createClient();
  if (client) {
    const { error } = await client.from('gallery_items').delete().eq('id', id);
    if (!error) {
      const refreshed = await fetchPortfolioData();
      return refreshed.galleryItems;
    }
    if (!error.message.includes('gallery_items')) {
      throw new Error(error.message);
    }
  }

  const current = readStorage<Partial<GalleryItem>[]>(
    STORAGE_KEYS.gallery,
    SEED_GALLERY_ITEMS
  ).map(normalizeGalleryItem);
  const next = current.filter((item) => item.id !== id);
  writeStorage(STORAGE_KEYS.gallery, next);
  return next;
}

/**
 * Creates or updates a project via Supabase `.insert()` / `.update()` or local fallback store.
 * Input: Project and optional isNew flag; Output: updated Project array.
 */
export async function upsertProject(
  project: Project,
  isNew?: boolean
): Promise<Project[]> {
  const normalized = normalizeProject(project, project.display_order);
  const client = createClient();

  if (client) {
    const payload = {
      slug: normalized.slug,
      title: normalized.title,
      role: normalized.role,
      summary: normalized.summary,
      description: normalized.description,
      tech_stack: normalized.tech_stack,
      highlights: normalized.highlights,
      repo_url: normalized.repo_url ?? normalized.github_url,
      github_url: normalized.github_url ?? normalized.repo_url,
      live_url: normalized.live_url,
      thumbnail_url: normalized.thumbnail_url ?? null,
      is_featured: normalized.is_featured,
      display_order: normalized.display_order,
    };

    const { error } = isNew
      ? await client.from('projects').insert(payload).select().single()
      : await client
          .from('projects')
          .update(payload)
          .eq('id', normalized.id)
          .select()
          .single();

    if (error) {
      throw new Error(error.message);
    }
    const refreshed = await fetchPortfolioData();
    return refreshed.projects;
  }

  const current = readStorage<Partial<Project>[]>(
    STORAGE_KEYS.projects,
    SEED_PROJECTS
  ).map(normalizeProject);
  const exists = current.some((item) => item.id === normalized.id);
  const next = exists
    ? current.map((item) => (item.id === normalized.id ? normalized : item))
    : [...current, normalized];

  const sorted = [...next].sort((a, b) => a.display_order - b.display_order);
  writeStorage(STORAGE_KEYS.projects, sorted);
  return sorted;
}

/**
 * Deletes a project by ID from Supabase or local fallback store.
 * Input: project ID; Output: updated Project array.
 */
export async function deleteProject(id: string): Promise<Project[]> {
  const client = createClient();
  if (client) {
    const { error } = await client.from('projects').delete().eq('id', id);
    if (error) {
      throw new Error(error.message);
    }
    const refreshed = await fetchPortfolioData();
    return refreshed.projects;
  }

  const current = readStorage<Partial<Project>[]>(
    STORAGE_KEYS.projects,
    SEED_PROJECTS
  ).map(normalizeProject);
  const next = current.filter((item) => item.id !== id);
  writeStorage(STORAGE_KEYS.projects, next);
  return next;
}

/**
 * Creates or updates a skill entry via Supabase `.insert()` / `.update()` or local fallback.
 * Input: Skill and optional isNew flag; Output: updated Skill array.
 */
export async function upsertSkill(
  skill: Skill,
  isNew?: boolean
): Promise<Skill[]> {
  const normalized = normalizeSkill(skill, skill.display_order);
  const client = createClient();

  if (client) {
    const payload = {
      name: normalized.name,
      category: normalized.category,
      level_label: normalized.level_label ?? normalized.proficiency,
      proficiency: normalized.proficiency,
      context: normalized.context,
      display_order: normalized.display_order,
    };

    const { error } = isNew
      ? await client.from('skills').insert(payload).select().single()
      : await client
          .from('skills')
          .update(payload)
          .eq('id', normalized.id)
          .select()
          .single();

    if (error) {
      throw new Error(error.message);
    }
    const refreshed = await fetchPortfolioData();
    return refreshed.skills;
  }

  const current = readStorage<Partial<Skill>[]>(
    STORAGE_KEYS.skills,
    SEED_SKILLS
  ).map(normalizeSkill);
  const exists = current.some((item) => item.id === normalized.id);
  const next = exists
    ? current.map((item) => (item.id === normalized.id ? normalized : item))
    : [...current, normalized];

  const sorted = [...next].sort((a, b) => a.display_order - b.display_order);
  writeStorage(STORAGE_KEYS.skills, sorted);
  return sorted;
}

/**
 * Deletes a skill by ID.
 * Input: skill ID; Output: updated Skill array.
 */
export async function deleteSkill(id: string): Promise<Skill[]> {
  const client = createClient();
  if (client) {
    const { error } = await client.from('skills').delete().eq('id', id);
    if (error) {
      throw new Error(error.message);
    }
    const refreshed = await fetchPortfolioData();
    return refreshed.skills;
  }

  const current = readStorage<Partial<Skill>[]>(
    STORAGE_KEYS.skills,
    SEED_SKILLS
  ).map(normalizeSkill);
  const next = current.filter((item) => item.id !== id);
  writeStorage(STORAGE_KEYS.skills, next);
  return next;
}

/**
 * Creates or updates an experience/education entry via Supabase `.insert()` / `.update()` or local fallback.
 * Input: Experience and optional isNew flag; Output: updated Experience array.
 */
export async function upsertExperience(
  experience: Experience,
  isNew?: boolean
): Promise<Experience[]> {
  const normalized = normalizeExperience(experience, experience.display_order);
  const client = createClient();

  if (client) {
    const payload = {
      type: normalized.type,
      title: normalized.title,
      organization: normalized.organization,
      location: normalized.location,
      period: normalized.period,
      start_date: normalized.start_date,
      end_date: normalized.end_date,
      is_current: normalized.is_current,
      summary: normalized.summary,
      description: normalized.description ?? normalized.summary,
      highlights: normalized.highlights,
      display_order: normalized.display_order,
    };

    const { error } = isNew
      ? await client.from('experiences').insert(payload).select().single()
      : await client
          .from('experiences')
          .update(payload)
          .eq('id', normalized.id)
          .select()
          .single();

    if (error) {
      throw new Error(error.message);
    }
    const refreshed = await fetchPortfolioData();
    return refreshed.experiences;
  }

  const current = readStorage<Partial<Experience>[]>(
    STORAGE_KEYS.experiences,
    SEED_EXPERIENCES
  ).map(normalizeExperience);
  const exists = current.some((item) => item.id === normalized.id);
  const next = exists
    ? current.map((item) => (item.id === normalized.id ? normalized : item))
    : [...current, normalized];

  const sorted = [...next].sort((a, b) => a.display_order - b.display_order);
  writeStorage(STORAGE_KEYS.experiences, sorted);
  return sorted;
}

/**
 * Deletes an experience entry by ID.
 * Input: experience ID; Output: updated Experience array.
 */
export async function deleteExperience(id: string): Promise<Experience[]> {
  const client = createClient();
  if (client) {
    const { error } = await client.from('experiences').delete().eq('id', id);
    if (error) {
      throw new Error(error.message);
    }
    const refreshed = await fetchPortfolioData();
    return refreshed.experiences;
  }

  const current = readStorage<Partial<Experience>[]>(
    STORAGE_KEYS.experiences,
    SEED_EXPERIENCES
  ).map(normalizeExperience);
  const next = current.filter((item) => item.id !== id);
  writeStorage(STORAGE_KEYS.experiences, next);
  return next;
}

/**
 * Marks a contact message as read/unread.
 * Input: message ID and read flag; Output: updated ContactMessage array.
 */
export async function setMessageReadStatus(
  id: string,
  isRead: boolean
): Promise<ContactMessage[]> {
  const client = createClient();
  if (client) {
    const { error } = await client
      .from('contact_messages')
      .update({ is_read: isRead })
      .eq('id', id);
    if (error) {
      throw new Error(error.message);
    }
    return fetchContactMessages();
  }

  const current = readStorage<ContactMessage[]>(
    STORAGE_KEYS.messages,
    SEED_MESSAGES
  );
  const next = current.map((msg) =>
    msg.id === id ? { ...msg, is_read: isRead } : msg
  );
  writeStorage(STORAGE_KEYS.messages, next);
  return next;
}

/**
 * Deletes a contact message by ID.
 * Input: message ID; Output: updated ContactMessage array.
 */
export async function deleteContactMessage(
  id: string
): Promise<ContactMessage[]> {
  const client = createClient();
  if (client) {
    const { error } = await client
      .from('contact_messages')
      .delete()
      .eq('id', id);
    if (error) {
      throw new Error(error.message);
    }
    return fetchContactMessages();
  }

  const current = readStorage<ContactMessage[]>(
    STORAGE_KEYS.messages,
    SEED_MESSAGES
  );
  const next = current.filter((msg) => msg.id !== id);
  writeStorage(STORAGE_KEYS.messages, next);
  return next;
}

/**
 * Resets local fallback storage back to default seed records.
 * Input: none; Output: Promise<PortfolioData>.
 */
export async function resetDemoData(): Promise<PortfolioData> {
  writeStorage(STORAGE_KEYS.profile, SEED_PROFILE);
  writeStorage(STORAGE_KEYS.projects, SEED_PROJECTS);
  writeStorage(STORAGE_KEYS.skills, SEED_SKILLS);
  writeStorage(STORAGE_KEYS.experiences, SEED_EXPERIENCES);
  writeStorage(STORAGE_KEYS.gallery, SEED_GALLERY_ITEMS);
  writeStorage(STORAGE_KEYS.messages, SEED_MESSAGES);
  return fetchPortfolioData();
}
