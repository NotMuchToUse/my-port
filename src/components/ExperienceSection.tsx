import { useMemo, useState } from 'react';
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  GraduationCap,
  MapPin,
} from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';
import { DICTIONARY } from '@/src/lib/i18n';
import { formatExperiencePeriod, sortExperiences } from '@/src/lib/portfolioLogic';
import type { Experience, SiteLanguage } from '@/src/types/database';

interface ExperienceSectionProps {
  experiences: Experience[];
  language: SiteLanguage;
}

export function ExperienceSection({
  experiences,
  language,
}: ExperienceSectionProps) {
  const [filter, setFilter] = useState<'all' | 'work' | 'education'>('all');
  const t = DICTIONARY[language].experience;

  const sorted = useMemo(
    () => sortExperiences(experiences, filter),
    [experiences, filter]
  );

  return (
    <section
      id="experience"
      className="border-b border-zinc-200/80 bg-[#FAFAFA] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wide text-orange-600">
              {t.kicker}
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#09090B] sm:text-3xl text-balance">
              {t.heading}
            </h2>
            <p className="mt-2 text-sm text-zinc-600 leading-relaxed sm:text-base">
              {t.subheading}
            </p>
          </div>

          <div
            className="inline-flex items-center gap-1 rounded-xl border border-zinc-200/80 bg-white p-1 self-start sm:self-auto"
            role="tablist"
            aria-label={t.heading}
          >
            {(['all', 'work', 'education'] as const).map((tab) => {
              const active = filter === tab;
              const label =
                tab === 'all'
                  ? t.all
                  : tab === 'work'
                  ? t.work
                  : t.education;
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(tab)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                    active
                      ? 'bg-zinc-950 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative mt-10 space-y-6 before:absolute before:left-5 before:top-2 before:bottom-2 before:w-px before:bg-zinc-200/80">
          {sorted.map((entry) => {
            const isWork = entry.type === 'work';
            const Icon = isWork ? Briefcase : GraduationCap;
            const dateRange = formatExperiencePeriod(entry);

            return (
              <div key={entry.id} className="relative pl-14">
                <div
                  className={`absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-xl border ${
                    isWork
                      ? 'border-orange-200 bg-orange-50 text-orange-600'
                      : 'border-zinc-200 bg-white text-zinc-700'
                  }`}
                  aria-hidden="true"
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 transition-colors hover:border-zinc-300">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={isWork ? 'featured' : 'outline'}>
                          {isWork ? t.work : t.education}
                        </Badge>
                        {entry.is_current && (
                          <span className="text-xs font-medium text-orange-600">
                            {t.current}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2.5 text-base font-semibold text-zinc-950 sm:text-lg">
                        {entry.title}
                      </h3>
                      <p className="mt-0.5 text-sm font-medium text-zinc-700">
                        {entry.organization}
                      </p>
                    </div>

                    <div className="flex flex-col items-start sm:items-end gap-1 text-xs text-zinc-500">
                      <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                        <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{dateRange}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{entry.location}</span>
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
                    {entry.summary}
                  </p>

                  {Array.isArray(entry.highlights) &&
                    entry.highlights.length > 0 && (
                      <ul className="mt-4 space-y-2 border-t border-zinc-200/70 pt-3.5">
                        {entry.highlights.map((highlight) => (
                          <li
                            key={highlight}
                            className="flex items-start gap-2.5 text-xs text-zinc-700 leading-relaxed sm:text-sm"
                          >
                            <CheckCircle2
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-500"
                              aria-hidden="true"
                            />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
