import { useState, type FormEvent } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Send,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { submitContactMessage } from '@/src/lib/data';
import { DICTIONARY } from '@/src/lib/i18n';
import {
  validateContactForm,
  type ContactFormInput,
} from '@/src/lib/portfolioLogic';
import type {
  ContactMessage,
  ProfileSettings,
  SiteLanguage,
} from '@/src/types/database';

interface ContactSectionProps {
  profile: ProfileSettings;
  language: SiteLanguage;
  onMessageSubmitted?: (message: ContactMessage) => void;
}

const INITIAL_FORM: ContactFormInput = {
  sender_name: '',
  sender_email: '',
  subject: '',
  message: '',
};

export function ContactSection({
  profile,
  language,
  onMessageSubmitted,
}: ContactSectionProps) {
  const [form, setForm] = useState<ContactFormInput>(INITIAL_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ContactFormInput, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const t = DICTIONARY[language].contact;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const validation = validateContactForm(form, language);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const result = await submitContactMessage(form, language);
      onMessageSubmitted?.(result.message);
      setForm(INITIAL_FORM);
      setFeedback({
        type: 'success',
        text:
          result.mode === 'supabase' ? t.successSupabase : t.successFallback,
      });
    } catch {
      setFeedback({
        type: 'error',
        text: t.errorGeneric,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left column: Direct contact context */}
          <div className="lg:col-span-5">
            <p className="text-xs font-semibold tracking-wide text-orange-600">
              {t.kicker}
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#09090B] sm:text-3xl text-balance">
              {t.heading}
            </h2>
            <p className="mt-3 text-sm text-zinc-600 leading-relaxed sm:text-base">
              {t.subheading}
            </p>

            <div className="mt-8 space-y-4 rounded-2xl border border-zinc-200/80 bg-[#FAFAFA] p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-orange-200/80 bg-orange-50 text-orange-600">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-500">
                    {t.emailLabel}
                  </p>
                  <a
                    href={`mailto:${profile.email}`}
                    className="mt-0.5 text-sm font-medium text-zinc-950 hover:text-orange-600 transition-colors"
                  >
                    {profile.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-zinc-200/70 pt-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200/80 bg-white text-zinc-700">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-500">
                    {t.locationLabel}
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-zinc-950">
                    {profile.location}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Contact form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-2xl border border-zinc-200/80 bg-[#FAFAFA]/60 p-6 sm:p-8"
            >
              {feedback && (
                <div
                  role="status"
                  className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm ${
                    feedback.type === 'success'
                      ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
                      : 'border-red-200 bg-red-50/70 text-red-900'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                      aria-hidden="true"
                    />
                  ) : (
                    <AlertCircle
                      className="mt-0.5 h-4 w-4 shrink-0 text-red-600"
                      aria-hidden="true"
                    />
                  )}
                  <span>{feedback.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="sender_name">{t.nameLabel}</Label>
                  <Input
                    id="sender_name"
                    name="sender_name"
                    placeholder={t.namePlaceholder}
                    value={form.sender_name}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        sender_name: e.target.value,
                      }))
                    }
                    aria-invalid={Boolean(errors.sender_name)}
                  />
                  {errors.sender_name && (
                    <p className="text-xs text-red-600">{errors.sender_name}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sender_email">{t.emailFieldLabel}</Label>
                  <Input
                    id="sender_email"
                    name="sender_email"
                    type="email"
                    placeholder={t.emailPlaceholder}
                    value={form.sender_email}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        sender_email: e.target.value,
                      }))
                    }
                    aria-invalid={Boolean(errors.sender_email)}
                  />
                  {errors.sender_email && (
                    <p className="text-xs text-red-600">
                      {errors.sender_email}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 space-y-1.5">
                <Label htmlFor="subject">{t.subjectLabel}</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder={t.subjectPlaceholder}
                  value={form.subject}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, subject: e.target.value }))
                  }
                  aria-invalid={Boolean(errors.subject)}
                />
                {errors.subject && (
                  <p className="text-xs text-red-600">{errors.subject}</p>
                )}
              </div>

              <div className="mt-5 space-y-1.5">
                <Label htmlFor="message">{t.messageLabel}</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder={t.messagePlaceholder}
                  value={form.message}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, message: e.target.value }))
                  }
                  aria-invalid={Boolean(errors.message)}
                />
                {errors.message && (
                  <p className="text-xs text-red-600">{errors.message}</p>
                )}
              </div>

              <div className="mt-6 flex items-center justify-end">
                <Button type="submit" size="lg" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                      <span>{t.sending}</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" aria-hidden="true" />
                      <span>{t.send}</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
