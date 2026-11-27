export type SiteLanguage = 'vi' | 'en';

export interface ProfileSettings {
  id: string;
  full_name: string;
  monogram: string;
  role_title: string;
  tagline: string;
  bio: string;
  availability_text: string;
  is_available: boolean;
  location: string;
  email: string;
  notification_email: string;
  github_url: string;
  linkedin_url: string;
  cv_url: string;
  cv_file_name: string;
  avatar_url: string | null;
  show_gallery: boolean;
  default_language: SiteLanguage;
  updated_at: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  role: string;
  summary: string;
  description: string;
  tech_stack: string[];
  highlights: string[];
  github_url: string | null;
  repo_url?: string | null;
  live_url: string | null;
  thumbnail_url?: string | null;
  is_featured: boolean;
  display_order: number;
  created_at: string;
}

export type SkillCategory =
  | 'Backend & Architecture'
  | 'Frontend'
  | 'Database & DevOps';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  proficiency: string;
  level_label?: string;
  context: string;
  display_order: number;
}

export type ExperienceType = 'work' | 'education';

export interface Experience {
  id: string;
  type: ExperienceType;
  title: string;
  organization: string;
  location: string;
  period?: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  summary: string;
  description?: string;
  highlights: string[];
  display_order: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  category: string;
  image_url: string;
  width?: number | null;
  height?: number | null;
  display_order: number;
  is_visible: boolean;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface DataSourceStatus {
  mode: 'supabase' | 'fallback';
  configured: boolean;
  reason?: string;
}

export interface PortfolioData {
  profile: ProfileSettings;
  projects: Project[];
  skills: Skill[];
  experiences: Experience[];
  galleryItems: GalleryItem[];
  status: DataSourceStatus;
}

export interface AdminOverviewStats {
  totalProjects: number;
  featuredProjects: number;
  totalSkills: number;
  unreadMessages: number;
  totalGalleryItems: number;
}
