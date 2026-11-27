import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  FolderGit2,
  Github,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import { DICTIONARY } from '@/src/lib/i18n';
import {
  extractTopTechTags,
  filterProjects,
  isSafeUrl,
  type ProjectFilter,
} from '@/src/lib/portfolioLogic';
import type { Project, SiteLanguage } from '@/src/types/database';

interface ProjectsSectionProps {
  projects: Project[];
  language: SiteLanguage;
}

export function ProjectsSection({ projects, language }: ProjectsSectionProps) {
  const [activeFilter, setActiveFilter] = useState<ProjectFilter>('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const t = DICTIONARY[language].projects;

  const topTechTags = useMemo(
    () => extractTopTechTags(projects, 3),
    [projects]
  );

  const filterOptions = useMemo(() => {
    const base = ['All', 'Featured', ...topTechTags];
    if (
      activeFilter !== 'All' &&
      activeFilter !== 'Featured' &&
      !base.some((opt) => opt.toLowerCase() === activeFilter.toLowerCase())
    ) {
      return [...base, activeFilter];
    }
    return base;
  }, [topTechTags, activeFilter]);

  const visibleProjects = useMemo(
    () => filterProjects(projects, activeFilter),
    [projects, activeFilter]
  );

  return (
    <section
      id="projects"
      className="border-b border-zinc-200/80 bg-white py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
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

          {/* Filter tabs */}
          <div
            className="flex flex-wrap lg:flex-nowrap items-center gap-1 rounded-xl border border-zinc-200/80 bg-zinc-50 p-1 self-start lg:self-auto shrink-0"
            role="tablist"
            aria-label={t.heading}
          >
            {filterOptions.map((option) => {
              const isActive = activeFilter === option;
              const label =
                option === 'All'
                  ? t.all
                  : option === 'Featured'
                  ? t.featured
                  : option;
              return (
                <button
                  key={option}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveFilter(option)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                    isActive
                      ? 'bg-white text-zinc-950 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {visibleProjects.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/70 px-6 py-14 text-center">
            <FolderGit2 className="h-8 w-8 text-zinc-400" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-zinc-900">
              {t.emptyPrefix} "{activeFilter}".
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setActiveFilter('All')}
            >
              {t.showAll}
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {visibleProjects.map((project) => (
              <Card
                key={project.id}
                className="flex flex-col justify-between transition-all duration-150 hover:border-orange-300/90"
              >
                <div>
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge variant="outline">{project.role}</Badge>
                      {project.is_featured && (
                        <Badge variant="featured">
                          <Sparkles className="h-3 w-3" aria-hidden="true" />
                          <span>{t.featured}</span>
                        </Badge>
                      )}
                    </div>

                    <CardTitle className="mt-3 text-lg sm:text-xl">
                      <button
                        type="button"
                        onClick={() => setSelectedProject(project)}
                        className="group inline-flex items-start gap-1.5 text-left text-[#09090B] transition-colors hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded cursor-pointer"
                      >
                        <span>{project.title}</span>
                        <ArrowUpRight
                          className="mt-1 h-4 w-4 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-orange-500"
                          aria-hidden="true"
                        />
                      </button>
                    </CardTitle>

                    <CardDescription>{project.summary}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {(project.highlights ?? []).length > 0 && (
                      <ul className="space-y-2">
                        {(project.highlights ?? []).slice(0, 2).map((highlight) => (
                          <li
                            key={highlight}
                            className="flex items-start gap-2.5 text-xs text-zinc-700 leading-relaxed sm:text-sm"
                          >
                            <CheckCircle2
                              className="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
                              aria-hidden="true"
                            />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {(project.tech_stack ?? []).map((tech) => (
                        <button
                          key={tech}
                          type="button"
                          onClick={() => setActiveFilter(tech)}
                          className={`rounded-md border px-2.5 py-1 font-mono text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                            activeFilter.toLowerCase() === tech.toLowerCase()
                              ? 'border-orange-300 bg-orange-50 text-orange-700 font-medium'
                              : 'border-zinc-200/80 bg-zinc-50 text-zinc-700 hover:border-orange-200 hover:text-orange-700'
                          }`}
                        >
                          {tech}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </div>

                {/* Card footer actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200/70 px-6 py-4">
                  <button
                    type="button"
                    onClick={() => setSelectedProject(project)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded px-1 py-0.5"
                  >
                    <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t.inspectArchitecture}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {isSafeUrl(project.github_url) && (
                      <a
                        href={project.github_url as string}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${t.viewSource}: ${project.title}`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-zinc-200/80 bg-white px-2.5 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:text-zinc-950"
                      >
                        <Github className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{t.code}</span>
                      </a>
                    )}
                    {isSafeUrl(project.live_url) && (
                      <a
                        href={project.live_url as string}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${t.openDemo}: ${project.title}`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-zinc-200/80 bg-white px-2.5 text-xs font-medium text-zinc-700 transition-colors hover:border-orange-300 hover:text-orange-600"
                      >
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{t.demo}</span>
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Project Architecture Modal */}
      <Dialog
        open={Boolean(selectedProject)}
        onOpenChange={(open) => {
          if (!open) setSelectedProject(null);
        }}
      >
        <DialogContent>
          {selectedProject && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{selectedProject.role}</Badge>
                  {selectedProject.is_featured && (
                    <Badge variant="featured">
                      <Sparkles className="h-3 w-3" aria-hidden="true" />
                      <span>{t.featured}</span>
                    </Badge>
                  )}
                </div>
                <DialogTitle className="mt-2">
                  {selectedProject.title}
                </DialogTitle>
                <DialogDescription>{selectedProject.summary}</DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    {t.modalOverview}
                  </h4>
                  <p className="mt-2 text-sm text-zinc-700 leading-relaxed">
                    {selectedProject.description}
                  </p>
                </div>

                {(selectedProject.highlights ?? []).length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      {t.modalHighlights}
                    </h4>
                    <ul className="mt-2.5 space-y-2.5">
                      {(selectedProject.highlights ?? []).map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2.5 text-sm text-zinc-700 leading-relaxed"
                        >
                          <CheckCircle2
                            className="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
                            aria-hidden="true"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    {t.modalStack}
                  </h4>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {(selectedProject.tech_stack ?? []).map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md border border-zinc-200/80 bg-zinc-50 px-2.5 py-1 font-mono text-xs text-zinc-800"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-zinc-200/80 pt-4">
                  {isSafeUrl(selectedProject.github_url) && (
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={selectedProject.github_url as string}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Github className="h-4 w-4" aria-hidden="true" />
                        <span>{t.viewSource}</span>
                      </a>
                    </Button>
                  )}
                  {isSafeUrl(selectedProject.live_url) && (
                    <Button asChild size="sm">
                      <a
                        href={selectedProject.live_url as string}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        <span>{t.openDemo}</span>
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
