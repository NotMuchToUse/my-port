import { useMemo } from 'react';
import { Database, Layout, Server } from 'lucide-react';
import { DICTIONARY } from '@/src/lib/i18n';
import { groupSkillsByCategory } from '@/src/lib/portfolioLogic';
import type { SiteLanguage, Skill, SkillCategory } from '@/src/types/database';

interface StackSectionProps {
  skills: Skill[];
  language: SiteLanguage;
}

function getCategoryIcon(category: SkillCategory) {
  switch (category) {
    case 'Backend & Architecture':
      return Server;
    case 'Frontend':
      return Layout;
    case 'Database & DevOps':
      return Database;
  }
}

export function StackSection({ skills, language }: StackSectionProps) {
  const grouped = useMemo(() => groupSkillsByCategory(skills), [skills]);
  const t = DICTIONARY[language].stack;

  return (
    <section
      id="stack"
      className="border-b border-zinc-200/80 bg-[#FAFAFA] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
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

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {grouped.map(({ category, items }) => {
            const Icon = getCategoryIcon(category);
            return (
              <div
                key={category}
                className="flex flex-col rounded-2xl border border-zinc-200/80 bg-white p-6 transition-colors duration-150 hover:border-orange-300/90"
              >
                <div className="flex items-center justify-between gap-3 border-b border-zinc-200/70 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200/80 bg-zinc-50 text-orange-600">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <h3 className="text-base font-semibold text-zinc-950">
                      {t.categories[category]}
                    </h3>
                  </div>
                  <span className="font-mono text-xs text-zinc-500 tabular-nums">
                    {items.length}
                  </span>
                </div>

                <ul className="mt-4 divide-y divide-zinc-100">
                  {items.map((skill) => (
                    <li
                      key={skill.id}
                      className="group py-3 first:pt-1 last:pb-0"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-zinc-900 transition-colors group-hover:text-orange-600">
                          {skill.name}
                        </span>
                        <span className="font-mono text-xs text-zinc-500">
                          {skill.proficiency}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-600 leading-relaxed">
                        {skill.context}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
