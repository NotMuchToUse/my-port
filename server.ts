import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { validateContactForm } from './src/lib/portfolioLogic.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 3000);

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getServerSupabase() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (
    !url ||
    !key ||
    url.includes('your-project.supabase.co') ||
    key === 'your-anon-key'
  ) {
    return null;
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function handleContactPost(req: Request, res: Response) {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const sender_name =
    typeof body.sender_name === 'string' ? body.sender_name.trim() : '';
  const sender_email =
    typeof body.sender_email === 'string' ? body.sender_email.trim() : '';
  const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const lang = body.language === 'en' ? 'en' : 'vi';

  const validation = validateContactForm(
    { sender_name, sender_email, subject, message },
    lang
  );

  if (!validation.valid) {
    return res.status(400).json({
      ok: false,
      errors: validation.errors,
    });
  }

  const supabase = getServerSupabase();
  let savedMessage = {
    id: `msg-${Date.now()}`,
    sender_name,
    sender_email,
    subject,
    message,
    is_read: false,
    created_at: new Date().toISOString(),
  };
  let mode: 'supabase' | 'fallback' = 'fallback';
  let notificationEmail: string | null = null;

  if (supabase) {
    try {
      const { data: inserted, error: insertErr } = await supabase
        .from('contact_messages')
        .insert({
          sender_name,
          sender_email,
          subject,
          message,
          is_read: false,
        })
        .select()
        .single();

      if (!insertErr && inserted) {
        savedMessage = inserted;
        mode = 'supabase';
      }

      const { data: profileRow } = await supabase
        .from('profile_settings')
        .select('notification_email, email')
        .limit(1)
        .maybeSingle();

      notificationEmail =
        (profileRow?.notification_email as string | undefined) ||
        (profileRow?.email as string | undefined) ||
        null;
    } catch {
      // Keep fallback message object if Supabase request fails
    }
  }

  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail =
    process.env.RESEND_FROM_EMAIL?.trim() || 'Portfolio CMS <onboarding@resend.dev>';
  let emailSent = false;

  if (
    resendApiKey &&
    notificationEmail &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notificationEmail.trim())
  ) {
    try {
      const resend = new Resend(resendApiKey);
      const safeName = escapeHtml(sender_name);
      const safeEmail = escapeHtml(sender_email);
      const safeSubject = escapeHtml(subject);
      const safeMessage = escapeHtml(message).replace(/\n/g, '<br />');

      await resend.emails.send({
        from: fromEmail,
        to: [notificationEmail.trim()],
        replyTo: sender_email,
        subject: `[Portfolio] ${subject}`,
        text: `From: ${sender_name} (${sender_email})\nSubject: ${subject}\n\n${message}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #09090B; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E4E4E7; border-radius: 12px;">
            <p style="font-size: 12px; font-weight: 600; color: #EA580C; margin: 0 0 8px;">NEW PORTFOLIO INQUIRY</p>
            <h2 style="font-size: 18px; margin: 0 0 16px;">${safeSubject}</h2>
            <p style="font-size: 14px; color: #52525B; margin: 0 0 16px;">
              <strong>From:</strong> ${safeName} (${safeEmail})
            </p>
            <div style="font-size: 14px; line-height: 1.6; background: #FAFAFA; border: 1px solid #E4E4E7; border-radius: 8px; padding: 16px;">
              ${safeMessage}
            </div>
          </div>
        `,
      });
      emailSent = true;
    } catch {
      // Gracefully skip email failure so contact submission remains saved
      emailSent = false;
    }
  }

  return res.status(200).json({
    ok: true,
    message: savedMessage,
    mode,
    emailSent,
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/contact', handleContactPost);

  const isProd = process.env.NODE_ENV === 'production';
  const distDir = path.resolve(__dirname, 'dist');

  if (!isProd || !fs.existsSync(distDir)) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
