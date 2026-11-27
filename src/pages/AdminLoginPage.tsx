import { useState, type FormEvent } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Lock,
  Mail,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { validateLoginInput } from '@/src/lib/portfolioLogic';
import { signInAdmin } from '@/src/lib/supabase/auth';

interface AdminLoginPageProps {
  supabaseActive: boolean;
  onAuthenticated: () => void;
  onNavigate: (path: '/' | '/admin' | '/admin/login') => void;
}

export function AdminLoginPage({
  supabaseActive,
  onAuthenticated,
  onNavigate,
}: AdminLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const validation = validateLoginInput({ email, password });
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0];
      setErrorMsg(firstError ?? 'Please enter a valid email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await signInAdmin(email, password);
      if (!res.ok) {
        setErrorMsg(res.error ?? 'Invalid login credentials.');
        return;
      }
      onAuthenticated();
      onNavigate('/admin');
    } catch {
      setErrorMsg('Unable to sign in right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#FAFAFA] px-4 py-12 text-[#09090B]">
      {/* Ambient subtle orange glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 h-[380px] w-[540px] -translate-x-1/2 rounded-full bg-radial from-orange-500/12 via-amber-500/5 to-transparent blur-2xl"
      />

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 transition-colors hover:text-zinc-950 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded px-1 py-0.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to Portfolio</span>
          </button>

          <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-zinc-900">
            <span>NQK</span>
            <span className="h-2 w-2 rounded-full bg-orange-500" aria-hidden="true" />
            <span>CMS</span>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-200/80 bg-gradient-to-br from-orange-50 to-amber-50 text-orange-600">
              <Lock className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-zinc-950">
                Admin Sign In
              </h1>
              <p className="text-xs text-zinc-500">
                Sign in to manage portfolio content and inquiries
              </p>
            </div>
          </div>

          {!supabaseActive && (
            <div className="mt-5 rounded-xl border border-orange-200/80 bg-orange-50/70 px-3.5 py-2.5 text-xs text-orange-900 leading-relaxed">
              Supabase environment variables are not configured in preview. Sign
              in with any valid email and 6+ character password to enter Demo
              CMS mode.
            </div>
          )}

          {errorMsg && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/80 px-3.5 py-3 text-xs text-red-800"
            >
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0 text-red-600"
                aria-hidden="true"
              />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin_login_email">Email Address</Label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                  aria-hidden="true"
                />
                <Input
                  id="admin_login_email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin_login_password">Password</Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                  aria-hidden="true"
                />
                <Input
                  id="admin_login_password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
