/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { fetchContactMessages, fetchPortfolioData } from '@/src/lib/data';
import {
  SEED_EXPERIENCES,
  SEED_GALLERY_ITEMS,
  SEED_MESSAGES,
  SEED_PROFILE,
  SEED_PROJECTS,
  SEED_SKILLS,
} from '@/src/lib/mockData';
import { getAdminAuthState, signOutAdmin } from '@/src/lib/supabase/auth';
import { createClient } from '@/src/lib/supabase/client';
import { AdminLoginPage } from '@/src/pages/AdminLoginPage';
import { AdminPage } from '@/src/pages/AdminPage';
import { PortfolioPage } from '@/src/pages/PortfolioPage';
import type {
  ContactMessage,
  PortfolioData,
  SiteLanguage,
} from '@/src/types/database';

type AppRoute = '/' | '/admin' | '/admin/login';

const LANG_STORAGE_KEY = 'nqk_site_lang_v1';

function resolvePath(): AppRoute {
  if (typeof window === 'undefined') return '/';
  const pathname = window.location.pathname;
  if (pathname.startsWith('/admin/login')) return '/admin/login';
  if (pathname.startsWith('/admin')) return '/admin';
  return '/';
}

function resolveInitialLanguage(): SiteLanguage {
  if (typeof window === 'undefined') return 'vi';
  try {
    const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'en' || saved === 'vi') return saved;
  } catch {
    // Ignore storage access errors
  }
  return 'vi';
}

const INITIAL_BUNDLE: PortfolioData = {
  profile: SEED_PROFILE,
  projects: SEED_PROJECTS,
  skills: SEED_SKILLS,
  experiences: SEED_EXPERIENCES,
  galleryItems: SEED_GALLERY_ITEMS,
  status: { mode: 'fallback', configured: false },
};

export default function App() {
  const [route, setRoute] = useState<AppRoute>(resolvePath);
  const [data, setData] = useState<PortfolioData>(INITIAL_BUNDLE);
  const [messages, setMessages] = useState<ContactMessage[]>(SEED_MESSAGES);
  const [language, setLanguage] = useState<SiteLanguage>(resolveInitialLanguage);
  const [hydrated, setHydrated] = useState(false);
  const [supabaseActive, setSupabaseActive] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const navigate = (path: AppRoute) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setRoute(path);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleLanguageChange = (nextLang: SiteLanguage) => {
    setLanguage(nextLang);
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, nextLang);
    } catch {
      // Ignore storage access errors
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      const [portfolioBundle, inboxMessages, authState] = await Promise.all([
        fetchPortfolioData(),
        fetchContactMessages(),
        getAdminAuthState(),
      ]);

      if (!active) return;
      setData(portfolioBundle);
      setMessages(inboxMessages);
      setSupabaseActive(authState.supabaseActive);
      setIsAuthenticated(Boolean(authState.session));
      setUserEmail(authState.user?.email ?? null);

      try {
        const storedLang = window.localStorage.getItem(LANG_STORAGE_KEY);
        if (!storedLang && portfolioBundle.profile.default_language) {
          setLanguage(portfolioBundle.profile.default_language);
        }
      } catch {
        // Ignore storage errors
      }

      setHydrated(true);
    }

    hydrate();

    const client = createClient();
    const subscription = client
      ? client.auth.onAuthStateChange((_event, session) => {
          setIsAuthenticated(Boolean(session));
          setUserEmail(session?.user?.email ?? null);
        }).data.subscription
      : null;

    const handlePopState = () => {
      setRoute(resolvePath());
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      active = false;
      subscription?.unsubscribe();
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Protect /admin/* routes when Supabase auth is active
  useEffect(() => {
    if (!hydrated) return;
    if (route === '/admin' && supabaseActive && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [hydrated, route, supabaseActive, isAuthenticated]);

  const handleMessageSubmitted = (created: ContactMessage) => {
    setMessages((prev) => [created, ...prev]);
  };

  const handleSignOut = async () => {
    await signOutAdmin();
    setIsAuthenticated(false);
    setUserEmail(null);
    navigate('/admin/login');
  };

  if (!hydrated && (route === '/admin' || route === '/admin/login')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] text-zinc-600">
        <div className="flex items-center gap-2 text-sm">
          <Loader2
            className="h-4 w-4 animate-spin text-orange-500"
            aria-hidden="true"
          />
          <span>Checking session...</span>
        </div>
      </div>
    );
  }

  if (route === '/admin/login') {
    return (
      <AdminLoginPage
        supabaseActive={supabaseActive}
        onAuthenticated={() => setIsAuthenticated(true)}
        onNavigate={navigate}
      />
    );
  }

  if (route === '/admin') {
    if (supabaseActive && !isAuthenticated) {
      return (
        <AdminLoginPage
          supabaseActive={supabaseActive}
          onAuthenticated={() => setIsAuthenticated(true)}
          onNavigate={navigate}
        />
      );
    }

    return (
      <AdminPage
        data={data}
        messages={messages}
        userEmail={userEmail}
        onDataChange={setData}
        onMessagesChange={setMessages}
        onNavigate={navigate}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <PortfolioPage
      data={data}
      language={language}
      isAuthenticated={isAuthenticated}
      onLanguageChange={handleLanguageChange}
      onNavigate={navigate}
      onMessageSubmitted={handleMessageSubmitted}
    />
  );
}
