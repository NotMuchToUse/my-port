import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Menu,
  RotateCcw,
  X,
} from 'lucide-react';
import { AdminOverview } from '@/src/components/admin/AdminOverview';
import {
  AdminSidebar,
  type AdminSection,
} from '@/src/components/admin/AdminSidebar';
import { ExperienceManager } from '@/src/components/admin/ExperienceManager';
import { GalleryManager } from '@/src/components/admin/GalleryManager';
import { MessagesInbox } from '@/src/components/admin/MessagesInbox';
import { ProfileEditor } from '@/src/components/admin/ProfileEditor';
import { ProjectsManager } from '@/src/components/admin/ProjectsManager';
import { SkillsManager } from '@/src/components/admin/SkillsManager';
import { Button } from '@/src/components/ui/button';
import { resetDemoData } from '@/src/lib/data';
import type { ContactMessage, PortfolioData } from '@/src/types/database';

interface AdminPageProps {
  data: PortfolioData;
  messages: ContactMessage[];
  userEmail: string | null;
  onDataChange: (next: PortfolioData) => void;
  onMessagesChange: (next: ContactMessage[]) => void;
  onNavigate: (path: '/' | '/admin' | '/admin/login') => void;
  onSignOut: () => Promise<void>;
}

const SECTION_LABELS: Record<AdminSection, string> = {
  overview: 'Overview',
  profile: 'Profile & Hero',
  projects: 'Projects',
  skills: 'Skills & Stack',
  gallery: 'Gallery',
  experience: 'Experience',
  messages: 'Messages',
};

export function AdminPage({
  data,
  messages,
  userEmail,
  onDataChange,
  onMessagesChange,
  onNavigate,
  onSignOut,
}: AdminPageProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [projectCreateSignal, setProjectCreateSignal] = useState(0);
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const unreadCount = messages.filter((msg) => !msg.is_read).length;

  const notify = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
  };

  const handleQuickAddProject = () => {
    setActiveSection('projects');
    setProjectCreateSignal((n) => n + 1);
  };

  const handleResetDemo = async () => {
    const fresh = await resetDemoData();
    onDataChange(fresh);
    notify('success', 'Restored default demo portfolio records.');
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] text-[#09090B]">
      <AdminSidebar
        activeSection={activeSection}
        unreadCount={unreadCount}
        status={data.status}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onSelectSection={setActiveSection}
        onBackToSite={() => onNavigate('/')}
        onSignOut={onSignOut}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar with contextual breadcrumb & quick actions */}
        <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Open admin navigation"
                className="inline-flex lg:hidden h-9 w-9 items-center justify-center rounded-lg border border-zinc-200/80 bg-white text-zinc-700 hover:bg-zinc-100 cursor-pointer"
              >
                <Menu className="h-4 w-4" aria-hidden="true" />
              </button>

              <div className="flex items-center gap-2 text-sm truncate">
                <span className="text-zinc-500">Admin</span>
                <span className="text-zinc-300" aria-hidden="true">
                  /
                </span>
                <h1 className="font-semibold text-zinc-950 truncate">
                  {SECTION_LABELS[activeSection]}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {userEmail && (
                <span className="hidden sm:inline text-xs text-zinc-500">
                  {userEmail}
                </span>
              )}
              {data.status.mode === 'fallback' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetDemo}
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Reset Demo</span>
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Main Workspace Content */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {toast && (
            <div
              role="status"
              className={`mb-6 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
                toast.type === 'success'
                  ? 'border-orange-200 bg-orange-50/80 text-orange-950'
                  : 'border-red-200 bg-red-50/80 text-red-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {toast.type === 'success' ? (
                  <CheckCircle2
                    className="h-4 w-4 shrink-0 text-orange-600"
                    aria-hidden="true"
                  />
                ) : (
                  <AlertCircle
                    className="h-4 w-4 shrink-0 text-red-600"
                    aria-hidden="true"
                  />
                )}
                <span>{toast.text}</span>
              </div>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => setToast(null)}
                className="rounded p-1 text-zinc-500 hover:bg-white/70 hover:text-zinc-900 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          )}

          {activeSection === 'overview' && (
            <AdminOverview
              data={data}
              messages={messages}
              onNavigateSection={setActiveSection}
              onQuickAddProject={handleQuickAddProject}
            />
          )}

          {activeSection === 'profile' && (
            <ProfileEditor
              profile={data.profile}
              onSaved={(updated) => onDataChange({ ...data, profile: updated })}
              onNotify={notify}
            />
          )}

          {activeSection === 'projects' && (
            <ProjectsManager
              projects={data.projects}
              openCreateSignal={projectCreateSignal}
              onProjectsChange={(next) =>
                onDataChange({ ...data, projects: next })
              }
              onNotify={notify}
            />
          )}

          {activeSection === 'skills' && (
            <SkillsManager
              skills={data.skills}
              onSkillsChange={(next) => onDataChange({ ...data, skills: next })}
              onNotify={notify}
            />
          )}

          {activeSection === 'gallery' && (
            <GalleryManager
              profile={data.profile}
              items={data.galleryItems}
              onProfileChange={(updated) =>
                onDataChange({ ...data, profile: updated })
              }
              onItemsChange={(next) =>
                onDataChange({ ...data, galleryItems: next })
              }
              onNotify={notify}
            />
          )}

          {activeSection === 'experience' && (
            <ExperienceManager
              experiences={data.experiences}
              onExperiencesChange={(next) =>
                onDataChange({ ...data, experiences: next })
              }
              onNotify={notify}
            />
          )}

          {activeSection === 'messages' && (
            <MessagesInbox
              messages={messages}
              onMessagesChange={onMessagesChange}
              onNotify={notify}
            />
          )}
        </main>
      </div>
    </div>
  );
}
