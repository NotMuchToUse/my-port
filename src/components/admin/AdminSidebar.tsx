import {
  ArrowUpRight,
  Briefcase,
  Cpu,
  Database,
  FolderKanban,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  UserCog,
  X,
} from 'lucide-react';
import type { DataSourceStatus } from '@/src/types/database';

export type AdminSection =
  | 'overview'
  | 'profile'
  | 'projects'
  | 'skills'
  | 'gallery'
  | 'experience'
  | 'messages';

interface AdminSidebarProps {
  activeSection: AdminSection;
  unreadCount: number;
  status: DataSourceStatus;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onSelectSection: (section: AdminSection) => void;
  onBackToSite: () => void;
  onSignOut: () => void;
}

const NAV_ITEMS: Array<{
  id: AdminSection;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'profile', label: 'Profile & Hero', icon: UserCog },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'skills', label: 'Skills & Stack', icon: Cpu },
  { id: 'gallery', label: 'Gallery', icon: Images },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'messages', label: 'Messages', icon: Inbox },
];

export function AdminSidebar({
  activeSection,
  unreadCount,
  status,
  mobileOpen,
  onCloseMobile,
  onSelectSection,
  onBackToSite,
  onSignOut,
}: AdminSidebarProps) {
  const sidebarBody = (
    <div className="flex h-full flex-col justify-between bg-white px-4 py-5">
      <div>
        <div className="flex items-center justify-between border-b border-zinc-200/80 pb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-zinc-950">
              NQK
            </span>
            <span
              className="h-2 w-2 rounded-full bg-orange-500"
              aria-hidden="true"
            />
            <span className="text-sm font-semibold text-zinc-900">
              Admin CMS
            </span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
            className="inline-flex lg:hidden h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Admin dashboard navigation" className="mt-5 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectSection(item.id);
                  onCloseMobile();
                }}
                aria-current={active ? 'page' : undefined}
                className={`flex w-full items-center justify-between gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                  active
                    ? 'bg-gradient-to-r from-orange-500/12 to-amber-500/8 text-orange-700'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      active ? 'text-orange-600' : 'text-zinc-500'
                    }`}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </span>

                {item.id === 'messages' && unreadCount > 0 && (
                  <span className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-2 py-0.5 font-mono text-[11px] font-semibold text-white tabular-nums">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-6 border-t border-zinc-200/80 pt-4">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onBackToSite();
            }}
            className="flex w-full items-center justify-between rounded-lg border border-zinc-200/80 bg-zinc-50/70 px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:border-orange-300 hover:text-orange-700"
          >
            <span>Back to Live Site</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="space-y-3 border-t border-zinc-200/80 pt-4">
        <div
          className="flex items-center gap-2 rounded-lg border border-zinc-200/80 bg-[#FAFAFA] px-3 py-2 text-xs text-zinc-600"
          title={status.reason ?? 'Supabase connection active'}
        >
          <Database
            className={`h-3.5 w-3.5 shrink-0 ${
              status.mode === 'supabase' ? 'text-emerald-600' : 'text-orange-500'
            }`}
            aria-hidden="true"
          />
          <span className="truncate">
            {status.mode === 'supabase'
              ? 'Supabase Connected'
              : 'Demo Fallback Mode'}
          </span>
        </div>

        <button
          type="button"
          onClick={onSignOut}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-red-50 hover:text-red-700 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop persistent left sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-zinc-200/80 bg-white">
        <div className="sticky top-0 h-screen">{sidebarBody}</div>
      </aside>

      {/* Mobile collapsible sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-zinc-950/45"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 h-full w-72 border-r border-zinc-200 bg-white shadow-xl">
            {sidebarBody}
          </aside>
        </div>
      )}
    </>
  );
}
