import { DICTIONARY } from '@/src/lib/i18n';
import type { ProfileSettings, SiteLanguage } from '@/src/types/database';

interface FooterProps {
  profile: ProfileSettings;
  language: SiteLanguage;
  isAuthenticated: boolean;
  onNavigate: (path: '/' | '/admin' | '/admin/login') => void;
}

export function Footer({
  profile,
  language,
  isAuthenticated,
  onNavigate,
}: FooterProps) {
  const dict = DICTIONARY[language];

  return (
    <footer className="border-t border-zinc-200/80 bg-[#FAFAFA]">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <p className="text-xs text-zinc-500">
          {dict.footer.rightsPrefix} {profile.full_name}.{' '}
          {dict.footer.rightsSuffix}
        </p>

        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-center gap-5 text-xs font-medium text-zinc-600"
        >
          <a href="#projects" className="transition-colors hover:text-zinc-950">
            {dict.nav.projects}
          </a>
          <a href="#stack" className="transition-colors hover:text-zinc-950">
            {dict.nav.stack}
          </a>
          {profile.show_gallery && (
            <a href="#gallery" className="transition-colors hover:text-zinc-950">
              {dict.nav.gallery}
            </a>
          )}
          <a
            href="#experience"
            className="transition-colors hover:text-zinc-950"
          >
            {dict.nav.experience}
          </a>
          <a href="#contact" className="transition-colors hover:text-zinc-950">
            {dict.nav.contact}
          </a>
          <a
            href={isAuthenticated ? '/admin' : '/admin/login'}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(isAuthenticated ? '/admin' : '/admin/login');
            }}
            className="text-orange-600 transition-colors hover:text-orange-700"
          >
            {isAuthenticated ? dict.footer.adminCms : dict.nav.signIn}
          </a>
        </nav>
      </div>
    </footer>
  );
}
