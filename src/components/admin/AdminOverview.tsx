import {
  ArrowRight,
  Cpu,
  FolderKanban,
  Images,
  Inbox,
  Plus,
  Sparkles,
  UserCog,
} from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import {
  computeAdminOverviewStats,
  sortMessagesNewestFirst,
} from '@/src/lib/portfolioLogic';
import type { ContactMessage, PortfolioData } from '@/src/types/database';
import type { AdminSection } from './AdminSidebar';

interface AdminOverviewProps {
  data: PortfolioData;
  messages: ContactMessage[];
  onNavigateSection: (section: AdminSection) => void;
  onQuickAddProject: () => void;
}

export function AdminOverview({
  data,
  messages,
  onNavigateSection,
  onQuickAddProject,
}: AdminOverviewProps) {
  const stats = computeAdminOverviewStats(
    data.projects,
    data.skills,
    messages,
    data.galleryItems
  );
  const recentMessages = sortMessagesNewestFirst(messages).slice(0, 3);

  const statCards = [
    {
      label: 'Total Projects',
      value: stats.totalProjects,
      icon: FolderKanban,
      accent: false,
    },
    {
      label: 'Featured Projects',
      value: stats.featuredProjects,
      icon: Sparkles,
      accent: true,
    },
    {
      label: 'Gallery Photos',
      value: stats.totalGalleryItems,
      icon: Images,
      accent: false,
    },
    {
      label: 'Unread Messages',
      value: stats.unreadMessages,
      icon: Inbox,
      accent: stats.unreadMessages > 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-950">
            Dashboard Overview
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Manage portfolio projects, technical stack, photo gallery, CV, and
            inbound messages.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onNavigateSection('messages')}
          >
            <Inbox className="h-4 w-4" aria-hidden="true" />
            <span>View Latest Inquiries</span>
          </Button>
          <Button type="button" size="sm" onClick={onQuickAddProject}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Add New Project</span>
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-zinc-200/80 bg-white p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-zinc-500">
                  {card.label}
                </span>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                    card.accent
                      ? 'border-orange-200 bg-orange-50 text-orange-600'
                      : 'border-zinc-200/80 bg-zinc-50 text-zinc-600'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
              <p className="mt-3 font-mono text-2xl font-bold tracking-tight text-zinc-950 tabular-nums">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Sections & Recent Inquiries */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5 rounded-2xl border border-zinc-200/80 bg-white p-6">
          <h3 className="text-sm font-semibold text-zinc-950">
            Quick Management
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            Jump directly to any portfolio section editor.
          </p>

          <div className="mt-4 space-y-2">
            {[
              {
                section: 'profile' as const,
                title: 'Profile, Portrait & CV',
                desc: 'Portrait photo, PDF CV file, language, and contact email',
                icon: UserCog,
              },
              {
                section: 'projects' as const,
                title: 'Projects Manager',
                desc: `${stats.totalProjects} projects (${stats.featuredProjects} featured)`,
                icon: FolderKanban,
              },
              {
                section: 'gallery' as const,
                title: 'Photo Gallery',
                desc: `${stats.totalGalleryItems} photos • Public visibility ${
                  data.profile.show_gallery ? 'On' : 'Hidden'
                }`,
                icon: Images,
              },
              {
                section: 'skills' as const,
                title: 'Skills & Stack',
                desc: `${stats.totalSkills} skills across ${
                  new Set(data.skills.map((s) => s.category)).size || 3
                } categories`,
                icon: Cpu,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.section}
                  type="button"
                  onClick={() => onNavigateSection(item.section)}
                  className="flex w-full items-center justify-between rounded-xl border border-zinc-200/80 bg-[#FAFAFA] px-4 py-3 text-left transition-colors hover:border-orange-300 hover:bg-orange-50/30 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className="h-4 w-4 shrink-0 text-orange-600"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-sm font-medium text-zinc-950">
                        {item.title}
                      </p>
                      <p className="text-xs text-zinc-500">{item.desc}</p>
                    </div>
                  </div>
                  <ArrowRight
                    className="h-4 w-4 text-zinc-400"
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-7 rounded-2xl border border-zinc-200/80 bg-white p-6">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-zinc-950">
                Latest Inquiries
              </h3>
              <p className="mt-0.5 text-xs text-zinc-500">
                Most recent contact form submissions
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onNavigateSection('messages')}
            >
              <span>Open Inbox</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>

          {recentMessages.length === 0 ? (
            <p className="mt-6 text-sm text-zinc-500">
              No contact inquiries received yet.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-zinc-100">
              {recentMessages.map((msg) => (
                <li
                  key={msg.id}
                  className="flex items-start justify-between gap-4 py-3.5 first:pt-1 last:pb-0"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-zinc-950">
                        {msg.subject}
                      </p>
                      {!msg.is_read && <Badge variant="featured">Unread</Badge>}
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {msg.sender_name} ({msg.sender_email})
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-zinc-400 tabular-nums">
                    {msg.created_at.slice(0, 10)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
