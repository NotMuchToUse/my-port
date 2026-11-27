import { useEffect, useState } from 'react';
import {
  ArrowDownRight,
  CheckCircle2,
  Database,
  Github,
  Layers,
  Linkedin,
  Mail,
  MapPin,
  Server,
  Terminal,
  User,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { DICTIONARY } from '@/src/lib/i18n';
import { isSafeUrl } from '@/src/lib/portfolioLogic';
import type { ProfileSettings, SiteLanguage } from '@/src/types/database';

interface HeroSectionProps {
  profile: ProfileSettings;
  language: SiteLanguage;
}

export function HeroSection({ profile, language }: HeroSectionProps) {
  const [activePillarId, setActivePillarId] = useState<
    'backend' | 'databases' | 'fullstack'
  >('backend');
  const [avatarError, setAvatarError] = useState(false);

  const t = DICTIONARY[language].hero;

  useEffect(() => {
    setAvatarError(false);
  }, [profile.avatar_url]);

  const pillars = [
    {
      id: 'backend' as const,
      label: t.pillarLabels.backend,
      icon: Server,
      ...t.pillars.backend,
    },
    {
      id: 'databases' as const,
      label: t.pillarLabels.databases,
      icon: Database,
      ...t.pillars.databases,
    },
    {
      id: 'fullstack' as const,
      label: t.pillarLabels.fullstack,
      icon: Layers,
      ...t.pillars.fullstack,
    },
  ];

  const activePillar =
    pillars.find((item) => item.id === activePillarId) ?? pillars[0];

  const hasValidAvatar =
    !avatarError && Boolean(profile.avatar_url) && isSafeUrl(profile.avatar_url);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="about"
      className="relative overflow-hidden border-b border-zinc-200/80 bg-[#FAFAFA]"
    >
      {/* Subtle ambient orange radial glow behind hero headline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/4 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-radial from-orange-500/12 via-amber-500/5 to-transparent blur-2xl"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Identity, Availability, Bio, Primary CTAs */}
          <div className="flex flex-col justify-center lg:col-span-7 lg:pt-4">
            <div>
              {profile.is_available && (
                <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-orange-200/80 bg-gradient-to-r from-orange-50/90 to-amber-50/70 px-3.5 py-1.5 text-xs font-medium text-orange-800">
                  <span className="relative flex h-2 w-2" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
                  </span>
                  <span>{profile.availability_text}</span>
                </div>
              )}

              <h1 className="text-4xl font-extrabold tracking-tight text-[#09090B] sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08] text-balance">
                {profile.full_name}
              </h1>

              <p className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl text-balance">
                <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                  {profile.role_title}
                </span>
              </p>

              <p className="mt-5 max-w-2xl text-base font-medium text-zinc-800 leading-relaxed sm:text-lg">
                {profile.tagline}
              </p>

              <p className="mt-3 max-w-2xl text-sm text-zinc-600 leading-relaxed sm:text-base">
                {profile.bio}
              </p>

              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-zinc-500">
                <MapPin className="h-3.5 w-3.5 text-orange-500" aria-hidden="true" />
                <span>{profile.location}</span>
              </div>
            </div>

            {/* Action buttons & social links */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                size="lg"
                onClick={() => scrollToSection('projects')}
              >
                <span>{t.viewWork}</span>
                <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => scrollToSection('contact')}
              >
                <Mail className="h-4 w-4 text-zinc-600" aria-hidden="true" />
                <span>{t.contactMe}</span>
              </Button>

              <div className="flex items-center gap-2 pl-1">
                {isSafeUrl(profile.github_url) && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="GitHub profile"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-200/80 bg-white text-zinc-700 transition-colors hover:border-orange-300 hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                  >
                    <Github className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
                {isSafeUrl(profile.linkedin_url) && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="LinkedIn profile"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-200/80 bg-white text-zinc-700 transition-colors hover:border-orange-300 hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                  >
                    <Linkedin className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Framed Portrait Photo Card + Engineering Focus Card */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Framed Portrait Photo Card */}
            <div className="relative overflow-hidden rounded-2xl border border-orange-200/80 bg-gradient-to-br from-orange-500/10 via-white to-amber-500/10 p-2 shadow-xs">
              <div className="relative overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-100">
                {hasValidAvatar ? (
                  <img
                    src={profile.avatar_url as string}
                    alt={profile.full_name}
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarError(true)}
                    className="h-56 w-full object-cover object-top sm:h-64"
                  />
                ) : (
                  <div className="flex h-56 w-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-zinc-50 to-zinc-100 text-zinc-400 sm:h-64">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-orange-200/80 bg-orange-50 text-orange-500">
                      <User className="h-7 w-7" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-medium text-zinc-500">
                      {t.portraitEmpty}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-zinc-200/80 bg-white/95 px-3.5 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-zinc-950">
                      {profile.full_name}
                    </p>
                    <p className="truncate text-[11px] text-zinc-500">
                      {profile.role_title}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-md border border-orange-200/80 bg-orange-50 px-2 py-0.5 font-mono text-[11px] font-medium text-orange-700">
                    {t.portraitCaptionRole}
                  </span>
                </div>
              </div>
            </div>

            {/* Compact Engineering Focus Card */}
            <div className="flex w-full flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs">
              <div>
                <div className="flex items-center gap-2.5 border-b border-zinc-200/70 pb-3.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-orange-200/80 bg-gradient-to-br from-orange-50 to-amber-50 text-orange-600">
                    <Terminal className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-zinc-950">
                      {t.focusTitle}
                    </h2>
                    <p className="text-xs text-zinc-500">{t.focusSubtitle}</p>
                  </div>
                </div>

                {/* Interactive pillar selector */}
                <div
                  className="mt-3.5 grid grid-cols-3 gap-1.5 rounded-xl bg-zinc-100/80 p-1"
                  role="tablist"
                  aria-label={t.focusTitle}
                >
                  {pillars.map((pillar) => {
                    const Icon = pillar.icon;
                    const active = pillar.id === activePillar.id;
                    return (
                      <button
                        key={pillar.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setActivePillarId(pillar.id)}
                        className={`flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-center text-xs font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                          active
                            ? 'bg-white text-zinc-950 shadow-xs'
                            : 'text-zinc-600 hover:text-zinc-950'
                        }`}
                      >
                        <Icon
                          className={`h-3.5 w-3.5 ${
                            active ? 'text-orange-500' : 'text-zinc-500'
                          }`}
                          aria-hidden="true"
                        />
                        <span className="truncate max-w-full">
                          {pillar.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected pillar detail */}
                <div className="mt-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-zinc-950">
                      {activePillar.title}
                    </h3>
                    <span className="font-mono text-xs font-medium text-orange-600">
                      {activePillar.metricValue}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-zinc-600 leading-relaxed">
                    {activePillar.summary}
                  </p>
                  <ul className="mt-3 space-y-2 border-t border-zinc-200/70 pt-3">
                    {activePillar.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-2 text-xs text-zinc-700 leading-relaxed"
                      >
                        <CheckCircle2
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-500"
                          aria-hidden="true"
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Clean architectural summary footer */}
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-zinc-200/70 pt-3">
                <div>
                  <p className="text-[11px] text-zinc-500">
                    {t.summaryLabels.primary}
                  </p>
                  <p className="mt-0.5 font-mono text-xs font-semibold text-zinc-900">
                    TypeScript
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-zinc-500">
                    {t.summaryLabels.data}
                  </p>
                  <p className="mt-0.5 font-mono text-xs font-semibold text-zinc-900">
                    PostgreSQL
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-zinc-500">
                    {t.summaryLabels.runtime}
                  </p>
                  <p className="mt-0.5 font-mono text-xs font-semibold text-zinc-900">
                    Node / Next
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
