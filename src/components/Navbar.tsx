import { useState } from 'react';
import {
  Download,
  Globe,
  LayoutDashboard,
  LogIn,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { DICTIONARY } from '@/src/lib/i18n';
import { isSafeUrl } from '@/src/lib/portfolioLogic';
import type { SiteLanguage } from '@/src/types/database';

interface NavbarProps {
  monogram: string;
  fullName: string;
  cvUrl: string;
  cvFileName: string;
  showGallery: boolean;
  language: SiteLanguage;
  isAuthenticated: boolean;
  onLanguageChange: (lang: SiteLanguage) => void;
  onNavigate: (path: '/' | '/admin' | '/admin/login') => void;
}

export function Navbar({
  monogram,
  fullName,
  cvUrl,
  cvFileName,
  showGallery,
  language,
  isAuthenticated,
  onLanguageChange,
  onNavigate,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = DICTIONARY[language].nav;

  const navLinks = [
    { label: t.about, href: '#about' },
    { label: t.projects, href: '#projects' },
    { label: t.stack, href: '#stack' },
    ...(showGallery ? [{ label: t.gallery, href: '#gallery' }] : []),
    { label: t.experience, href: '#experience' },
    { label: t.contact, href: '#contact' },
  ];

  const hasValidCv = Boolean(cvUrl?.trim()) && isSafeUrl(cvUrl);

  const handleAnchorClick = (href: string) => {
    setMobileOpen(false);
    const id = href.replace('#', '');
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-[#FAFAFA]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand monogram/name with subtle orange accent dot */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-2.5 text-base font-bold tracking-tight text-[#09090B] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-md px-1"
          aria-label={fullName}
        >
          <span className="font-mono text-sm font-semibold tracking-tight text-zinc-950">
            {monogram}
          </span>
          <span
            className="h-2 w-2 rounded-full bg-orange-500"
            aria-hidden="true"
          />
          <span className="hidden lg:inline text-sm font-semibold text-zinc-900">
            {fullName}
          </span>
        </a>

        {/* Single-line smooth-scroll navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-4 lg:gap-5"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleAnchorClick(link.href);
              }}
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-[#09090B] hover:underline hover:decoration-orange-500/70 hover:underline-offset-4 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded px-1 py-0.5"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right action group: VI | EN switcher, Tải CV, Đăng nhập / Quản trị */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <div
            className="inline-flex items-center gap-1 rounded-lg border border-zinc-200/80 bg-white p-0.5"
            role="group"
            aria-label="Language switcher"
          >
            <Globe
              className="ml-1.5 h-3.5 w-3.5 text-zinc-500"
              aria-hidden="true"
            />
            {(['vi', 'en'] as const).map((code) => {
              const active = language === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => onLanguageChange(code)}
                  aria-pressed={active}
                  className={`rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wide transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                    active
                      ? 'bg-orange-50 text-orange-700'
                      : 'text-zinc-500 hover:text-zinc-950'
                  }`}
                >
                  {code.toUpperCase()}
                </button>
              );
            })}
          </div>

          {hasValidCv && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-orange-200/90 bg-orange-50/50 text-orange-700 hover:bg-orange-100/70 hover:text-orange-800 whitespace-nowrap shrink-0"
            >
              <a
                href={cvUrl}
                download={cvFileName || 'CV.pdf'}
                target={cvUrl.startsWith('http') ? '_blank' : undefined}
                rel={cvUrl.startsWith('http') ? 'noreferrer' : undefined}
                onClick={(e) => {
                  if (cvUrl.startsWith('#')) {
                    e.preventDefault();
                    handleAnchorClick(cvUrl);
                  }
                }}
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t.downloadCv}</span>
              </a>
            </Button>
          )}

          {isAuthenticated ? (
            <Button
              type="button"
              size="sm"
              className="whitespace-nowrap shrink-0"
              onClick={() => onNavigate('/admin')}
            >
              <LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t.adminPanel}</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="whitespace-nowrap shrink-0"
              onClick={() => onNavigate('/admin/login')}
            >
              <LogIn className="h-3.5 w-3.5 text-zinc-600" aria-hidden="true" />
              <span>{t.signIn}</span>
            </Button>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <div
            className="inline-flex items-center gap-0.5 rounded-lg border border-zinc-200/80 bg-white p-0.5"
            role="group"
            aria-label="Mobile language switcher"
          >
            {(['vi', 'en'] as const).map((code) => {
              const active = language === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => onLanguageChange(code)}
                  aria-pressed={active}
                  className={`rounded-md px-2 py-1 text-[11px] font-semibold uppercase cursor-pointer ${
                    active
                      ? 'bg-orange-50 text-orange-700'
                      : 'text-zinc-500 hover:text-zinc-950'
                  }`}
                >
                  {code.toUpperCase()}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? t.closeMenu : t.openMenu}
            aria-expanded={mobileOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200/80 bg-white text-zinc-700 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer"
          >
            {mobileOpen ? (
              <X className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Menu className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileOpen && (
        <div className="border-t border-zinc-200/80 bg-white px-4 py-4 md:hidden">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleAnchorClick(link.href);
                }}
                className="flex h-11 items-center rounded-lg px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-zinc-200/80 pt-3">
            {hasValidCv && (
              <Button
                asChild
                variant="outline"
                className="flex-1 border-orange-200/90 bg-orange-50/50 text-orange-700"
              >
                <a
                  href={cvUrl}
                  download={cvFileName || 'CV.pdf'}
                  target={cvUrl.startsWith('http') ? '_blank' : undefined}
                  rel={cvUrl.startsWith('http') ? 'noreferrer' : undefined}
                  onClick={() => setMobileOpen(false)}
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  <span>{t.downloadCv}</span>
                </a>
              </Button>
            )}
            {isAuthenticated ? (
              <Button
                type="button"
                className="flex-1"
                onClick={() => {
                  setMobileOpen(false);
                  onNavigate('/admin');
                }}
              >
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                <span>{t.adminPanel}</span>
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setMobileOpen(false);
                  onNavigate('/admin/login');
                }}
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                <span>{t.signIn}</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
