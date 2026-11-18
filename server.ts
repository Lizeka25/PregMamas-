import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import http from 'http';
import path from 'path';
import nodemailer from 'nodemailer';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const PORT = Number(process.env.PORT) || 3000;
const STORE_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(STORE_DIR, 'pregmamas-shared-store.json');

interface StoredReply {
  id: string;
  author: string;
  authorRole?: string;
  professionBadge?: string;
  text: string;
  createdAt?: string;
}

interface StoredCommunityPost {
  id: string;
  author: string;
  authorRole?: string;
  professionBadge?: string;
  topic?: string;
  title?: string;
  body: string;
  createdAt: string;
  replies: StoredReply[];
}

interface StoredArticleComment {
  id: string;
  author: string;
  authorRole: string;
  professionBadge?: string;
  isQuestion?: boolean;
  text: string;
  createdAt: string;
}

interface StoredArticle {
  id: string;
  topic: string;
  title: string;
  summary: string;
  body: string[];
  image: string;
  imageKey?: string;
  imageAlt: string;
  imageCaption: string;
  authorName: string;
  authorProfession: string;
  isClinicianPublished?: boolean;
  publishedAt?: string;
}

interface PartnerDispatchRecord {
  id: string;
  partnerName: string;
  email?: string;
  whatsappPhone?: string;
  subject: string;
  message: string;
  emailStatus: string;
  whatsappStatus: string;
  sentAt: string;
  isAutoScheduled?: boolean;
}

interface PartnerAutoSchedule {
  enabled: boolean;
  intervalHours: number;
  partnerName: string;
  whatsappPhone: string;
  partnerEmail: string;
  subject: string;
  message: string;
  rotateMessages: boolean;
  rotationIndex: number;
  lastSentAtMs: number | null;
  nextSendAtMs: number | null;
  totalAutoSent: number;
  lastRunSummary: string;
}

const DEFAULT_AUTO_SCHEDULE: PartnerAutoSchedule = {
  enabled: false,
  intervalHours: 3,
  partnerName: 'Trusted Partner',
  whatsappPhone: '',
  partnerEmail: '',
  subject: 'PregMamas Encouragement: Take Good Care of Your Partner Today',
  message: '',
  rotateMessages: true,
  rotationIndex: 0,
  lastSentAtMs: null,
  nextSendAtMs: null,
  totalAutoSent: 0,
  lastRunSummary: '',
};

interface StoredClinicianVerification {
  id: string;
  clinicianName: string;
  profession: string;
  registrationBody: 'HPCSA' | 'SANC' | 'Other Medical Council';
  registrationNumber: string;
  facilityName: string;
  proofFileName?: string;
  proofDataUrl?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminReviewNote?: string;
  submittedAt: string;
  reviewedAt?: string;
}

interface SharedStore {
  customArticles: StoredArticle[];
  articleComments: Record<string, StoredArticleComment[]>;
  communityPosts: StoredCommunityPost[];
  clinicianVerifications: StoredClinicianVerification[];
  partnerDispatches: PartnerDispatchRecord[];
  partnerAutoSchedule: PartnerAutoSchedule;
}

function loadSharedStore(): SharedStore {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')) as Partial<SharedStore>;
      return {
        customArticles: Array.isArray(parsed.customArticles) ? parsed.customArticles : [],
        articleComments:
          parsed.articleComments && typeof parsed.articleComments === 'object'
            ? parsed.articleComments
            : {},
        communityPosts: Array.isArray(parsed.communityPosts) ? parsed.communityPosts : [],
        clinicianVerifications: Array.isArray(parsed.clinicianVerifications)
          ? parsed.clinicianVerifications
          : [],
        partnerDispatches: Array.isArray(parsed.partnerDispatches) ? parsed.partnerDispatches : [],
        partnerAutoSchedule:
          parsed.partnerAutoSchedule && typeof parsed.partnerAutoSchedule === 'object'
            ? { ...DEFAULT_AUTO_SCHEDULE, ...parsed.partnerAutoSchedule, intervalHours: 3 }
            : { ...DEFAULT_AUTO_SCHEDULE },
      };
    }
  } catch {
    // ignore corrupt/missing store
  }
  return {
    customArticles: [],
    articleComments: {},
    communityPosts: [],
    clinicianVerifications: [],
    partnerDispatches: [],
    partnerAutoSchedule: { ...DEFAULT_AUTO_SCHEDULE },
  };
}

let sharedStore: SharedStore = loadSharedStore();

function normalizeWhatsappDigits(rawPhone: string): string {
  const digits = rawPhone.replace(/[^\d]/g, '');
  if (!digits) return '';
  // Default South Africa country code (+27) when entered as local 0xx xxx xxxx
  if (digits.startsWith('0') && digits.length === 10) {
    return `27${digits.slice(1)}`;
  }
  return digits;
}

function getPartnerMessagingCapabilities() {
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const hasSmtp = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  const hasMetaWhatsapp = Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
  const hasTwilioWhatsapp = Boolean(
    process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM
  );

  return {
    emailServerConfigured: hasResend || hasSmtp,
    emailProvider: hasResend ? 'Resend API' : hasSmtp ? 'SMTP' : 'Direct Email App',
    whatsappServerConfigured: hasMetaWhatsapp || hasTwilioWhatsapp,
    whatsappProvider: hasMetaWhatsapp
      ? 'Meta WhatsApp Cloud API'
      : hasTwilioWhatsapp
        ? 'Twilio WhatsApp API'
        : 'Direct WhatsApp App',
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function persistSharedStore() {
  try {
    fs.mkdirSync(STORE_DIR, { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify(sharedStore, null, 2), 'utf8');
  } catch {
    // ignore disk permission issues gracefully
  }
}

const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

function buildRotatingAutoMessage(partnerName: string, index: number, fallbackMessage: string) {
  const templates = [
    {
      subject: `PregMamas 3-Hour Care Reminder: Take Good Care of Your Woman Today`,
      body: `Hello ${partnerName}, this is your automatic 3-hour PregMamas encouragement: please check on your woman right now, bring her clean drinking water, help her rest, and remind her gently about her daily pregnancy vitamins.`,
    },
    {
      subject: `PregMamas 3-Hour Reminder: Share Chores & Ease Her Load`,
      body: `Hello ${partnerName}, pregnancy takes real strength. Take a few minutes now to carry any heavy groceries, water buckets, or laundry for your woman, prepare something nourishing to eat, and speak to her with warmth and patience.`,
    },
    {
      subject: `PregMamas 3-Hour Reminder: Clinic Readiness & Early Arrival`,
      body: `Hello ${partnerName}, remember to keep transport ready for her antenatal clinic visits and plan ahead so you arrive at least 30 minutes early together with her Road to Health booklet, ID, water, and a light snack.`,
    },
    {
      subject: `PregMamas 3-Hour Reminder: Kindness, Comfort & Danger Signs Watch`,
      body: `Hello ${partnerName}, check how she and baby are feeling right now. Ask if she has felt baby moving well, rub her tired back or feet, and never delay clinic help if any danger sign appears.`,
    },
  ];
  const picked = templates[index % templates.length];
  return {
    subject: picked.subject,
    message: picked.body || fallbackMessage,
  };
}

async function dispatchPartnerEncouragement(input: {
  partnerName: string;
  whatsappPhone: string;
  partnerEmail: string;
  subject: string;
  message: string;
  sendWhatsapp?: boolean;
  sendEmail?: boolean;
  isAutoScheduled?: boolean;
}) {
  const cleanName = (input.partnerName || 'Trusted Partner').trim();
  const cleanEmail = (input.partnerEmail || '').trim();
  const cleanWhatsappDigits = normalizeWhatsappDigits(input.whatsappPhone || '');
  const cleanSubject = (
    input.subject || `PregMamas Encouragement for ${cleanName}: Caring for Her Today`
  ).trim();
  const cleanMessage = (input.message || '').trim();
  const sendWhatsapp = input.sendWhatsapp !== false;
  const sendEmail = input.sendEmail !== false;

  const whatsappUrl = cleanWhatsappDigits
    ? `https://api.whatsapp.com/send?phone=${cleanWhatsappDigits}&text=${encodeURIComponent(cleanMessage)}`
    : null;
  const mailtoUrl = cleanEmail
    ? `mailto:${encodeURIComponent(cleanEmail)}?subject=${encodeURIComponent(cleanSubject)}&body=${encodeURIComponent(cleanMessage)}`
    : null;

  const emailResult: { attempted: boolean; sent: boolean; provider?: string; detail: string } = {
    attempted: Boolean(sendEmail && cleanEmail),
    sent: false,
    detail: cleanEmail ? 'Email not requested' : 'No partner email provided',
  };

  const whatsappResult: { attempted: boolean; sent: boolean; provider?: string; detail: string } = {
    attempted: Boolean(sendWhatsapp && cleanWhatsappDigits),
    sent: false,
    detail: cleanWhatsappDigits ? 'WhatsApp not requested' : 'No WhatsApp number provided',
  };

  // 1. Real Automated Email Send (Resend OR Nodemailer SMTP)
  if (emailResult.attempted) {
    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #fff7fa; border: 1px solid #ea91b8; border-radius: 16px; padding: 24px; color: #3f0d24;">
        <p style="font-size: 12px; font-weight: 700; color: #be185d; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 8px;">${
          input.isAutoScheduled
            ? 'PregMamas Automatic 3-Hour Partner Reminder'
            : 'PregMamas Partner Care Encouragement'
        }</p>
        <h2 style="margin: 0 0 12px; font-size: 20px; color: #3f0d24;">Hello ${escapeHtml(cleanName)},</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #5c223d; white-space: pre-line; margin: 0 0 18px;">${escapeHtml(cleanMessage)}</p>
        <div style="background: #ffeef5; border: 1px solid #f4b6d0; border-radius: 12px; padding: 12px; font-size: 12px; color: #5c223d;">
          <strong>Privacy Note:</strong> Sent with mother's explicit opt-in consent. Never includes private mood logs, weight, HIV status, or personal clinic notes.
        </div>
      </div>
    `;

    if (process.env.RESEND_API_KEY) {
      try {
        const rRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.SMTP_FROM || 'PregMamas <onboarding@resend.dev>',
            to: [cleanEmail],
            subject: cleanSubject,
            text: cleanMessage,
            html: htmlBody,
          }),
        });
        if (rRes.ok) {
          emailResult.sent = true;
          emailResult.provider = 'Resend API';
          emailResult.detail = `Real email delivered automatically to ${cleanEmail} via Resend.`;
        } else {
          const errTxt = await rRes.text();
          emailResult.detail = `Resend API error (${rRes.status}): ${errTxt.slice(0, 140)}. Use Send Directly in Email App below as immediate backup.`;
        }
      } catch (err) {
        emailResult.detail = `Resend error: ${err instanceof Error ? err.message : 'Network error'}.`;
      }
    } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: cleanEmail,
          subject: cleanSubject,
          text: cleanMessage,
          html: htmlBody,
        });
        emailResult.sent = true;
        emailResult.provider = 'SMTP';
        emailResult.detail = `Real email delivered automatically to ${cleanEmail} via SMTP.`;
      } catch (err) {
        emailResult.detail = `SMTP error: ${err instanceof Error ? err.message : 'Check SMTP credentials'}. Use Send Directly in Email App below.`;
      }
    } else {
      emailResult.detail =
        'Automated server email secrets (SMTP_USER/SMTP_PASS or RESEND_API_KEY) are not configured yet—tap "Send Directly in Email App" below to send the real email right now from your device.';
    }
  }

  // 2. Real Automated WhatsApp Send (Meta WhatsApp Cloud API OR Twilio WhatsApp)
  if (whatsappResult.attempted) {
    if (process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
      try {
        const wRes = await fetch(
          `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: cleanWhatsappDigits,
              type: 'text',
              text: { body: cleanMessage },
            }),
          }
        );
        if (wRes.ok) {
          whatsappResult.sent = true;
          whatsappResult.provider = 'Meta WhatsApp Cloud API';
          whatsappResult.detail = `Real WhatsApp message delivered automatically to +${cleanWhatsappDigits}.`;
        } else {
          const errTxt = await wRes.text();
          whatsappResult.detail = `WhatsApp Cloud API error (${wRes.status}): ${errTxt.slice(0, 140)}. Tap "Send Directly in WhatsApp App" below to deliver immediately.`;
        }
      } catch (err) {
        whatsappResult.detail = `WhatsApp API error: ${err instanceof Error ? err.message : 'Network error'}. Tap "Send Directly in WhatsApp App" below.`;
      }
    } else if (
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_WHATSAPP_FROM
    ) {
      try {
        const auth = Buffer.from(
          `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
        ).toString('base64');
        const form = new URLSearchParams({
          From: process.env.TWILIO_WHATSAPP_FROM.startsWith('whatsapp:')
            ? process.env.TWILIO_WHATSAPP_FROM
            : `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
          To: `whatsapp:+${cleanWhatsappDigits}`,
          Body: cleanMessage,
        });
        const tRes = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: form.toString(),
          }
        );
        if (tRes.ok) {
          whatsappResult.sent = true;
          whatsappResult.provider = 'Twilio WhatsApp API';
          whatsappResult.detail = `Real WhatsApp message delivered automatically to +${cleanWhatsappDigits} via Twilio.`;
        } else {
          const errTxt = await tRes.text();
          whatsappResult.detail = `Twilio error (${tRes.status}): ${errTxt.slice(0, 140)}. Tap "Send Directly in WhatsApp App" below.`;
        }
      } catch (err) {
        whatsappResult.detail = `Twilio WhatsApp error: ${err instanceof Error ? err.message : 'Network error'}.`;
      }
    } else {
      whatsappResult.detail =
        'Automated WhatsApp API secrets are not configured yet—tap "Send Directly in WhatsApp App" below to open WhatsApp directly to your partner with this message ready to send!';
    }
  }

  const record: PartnerDispatchRecord = {
    id: `pd-${Date.now()}`,
    partnerName: cleanName,
    email: cleanEmail || undefined,
    whatsappPhone: cleanWhatsappDigits ? `+${cleanWhatsappDigits}` : undefined,
    subject: cleanSubject,
    message: cleanMessage,
    emailStatus: emailResult.sent
      ? `Sent (${emailResult.provider})`
      : emailResult.attempted
        ? 'Queued / Ready in Email App'
        : 'Skipped',
    whatsappStatus: whatsappResult.sent
      ? `Sent (${whatsappResult.provider})`
      : whatsappResult.attempted
        ? 'Queued / Ready in WhatsApp App'
        : 'Skipped',
    sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isAutoScheduled: Boolean(input.isAutoScheduled),
  };

  sharedStore.partnerDispatches = [record, ...sharedStore.partnerDispatches].slice(0, 30);
  persistSharedStore();

  return {
    record,
    emailResult,
    whatsappResult,
    whatsappUrl,
    mailtoUrl,
  };
}

let autoScheduleRunning = false;

async function executeScheduledThreeHourDispatch(reason: 'timer' | 'manual') {
  const sched = sharedStore.partnerAutoSchedule;
  if (!sched.enabled) return null;
  if (!sched.partnerEmail.trim() && !normalizeWhatsappDigits(sched.whatsappPhone)) {
    return null;
  }

  const now = Date.now();
  sched.lastSentAtMs = now;
  sched.nextSendAtMs = now + THREE_HOURS_MS;

  const content = sched.rotateMessages
    ? buildRotatingAutoMessage(sched.partnerName || 'Trusted Partner', sched.rotationIndex, sched.message)
    : { subject: sched.subject, message: sched.message };

  sched.rotationIndex = (sched.rotationIndex + 1) % 4;
  sched.totalAutoSent += 1;
  persistSharedStore();

  const result = await dispatchPartnerEncouragement({
    partnerName: sched.partnerName,
    whatsappPhone: sched.whatsappPhone,
    partnerEmail: sched.partnerEmail,
    subject: content.subject,
    message: content.message,
    sendWhatsapp: Boolean(normalizeWhatsappDigits(sched.whatsappPhone)),
    sendEmail: Boolean(sched.partnerEmail.trim()),
    isAutoScheduled: true,
  });

  sched.lastRunSummary = `${
    reason === 'timer' ? 'Auto 3h cycle' : 'Scheduled check'
  } at ${result.record.sentAt} — WhatsApp: ${result.record.whatsappStatus}, Email: ${result.record.emailStatus}`;
  persistSharedStore();

  return result;
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const URGENT_PATTERN =
  /(heavy bleed|vaginal bleed|bleeding|blood clot|severe headache|blurred vision|seeing spots|convuls|fit|seizure|high fever|chest pain|less movement|not moving|stopped moving|reduced movement|water broke|waters broke|faint|collapse|bloeding|hoofpyn|ukopha|igazi|madi|ngati|malofha|ingati|iingazi|ukugula kakhulu|umkhuhlane)/i;

const SYSTEM_INSTRUCTION = `You are the PregMamas Fast Educational Maternal Health Advisor for South African mothers, expecting teens, and partners.
Reply fast in 3-5 short, warm, scannable bullet points (under 130 words unless asked for more).
Key facts:
- Hospital Bag & Hygiene: Mom: 3 front-opening gowns, 2 loose outfits, 4-5 cotton underwear, 3 nursing bras, 2 grip socks, shower sandals, 1 robe, 2 packs maternity pads, peri bottle, ID & Maternity Case Record. Baby: 5-6 kimono bodysuits (3 NB, 3 0-3M), 3-4 zip sleepers, 2-3 swaddles, 2 hats, 2 mittens, 3 socks, 1 romper, 20-24 nappies, wipes, car seat. Labour hygiene: trim/shave neatly ahead of labour (avoid nicks), wash outer genital area daily with warm water & mild fragrance-free soap (wipe front-to-back, never douche).
- Antenatal Visits: Arrive at least 30 minutes early with Road to Health booklet, ID, water, and a light snack.
- Supplements: Folic acid 400-800 mcg daily (prevents Spina Bifida), Iron 27 mg spaced 2h from calcium (prevents anemia & low birth weight), Calcium + Vit D, Omega-3 DHA.
- Blood/Rh & HIV: Early ABO + Rh test; Rh-negative needs Anti-D at ~28w, after bleeding, and within 72h post-birth. HIV+ daily ART until undetectable (U=U) + baby Nevirapine drops; HIV- PrEP options: daily pill, 2-monthly injection, or monthly ring.
- Healing & Lochia: C-section cuts (Low Transverse, Low Vertical, Classical); Episiotomy care (warm peri bottle, ice pack, sitz bath, pat dry). Lochia: Rubra (days 1-4 red), Serosa (days 5-10 pink/brown), Alba (days 11-wk 6 creamy); pads only for 6 weeks.
- Baby Kicks: Track 10 movements in 2 hours (week 24+); if reduced, go to clinic/MOU same day or call 10177 / 112.
Safety: Educational guidance only—never diagnose/prescribe. Direct urgent danger signs straight to clinic/MOU or 10177 / 112.`;

function buildAdvisorSystemInstruction(language?: string, languageName?: string): string {
  const code = (language || 'en').trim().toLowerCase();
  const label = (languageName || '').trim();
  if (!code || code === 'en' || !label) {
    return SYSTEM_INSTRUCTION;
  }
  return `${SYSTEM_INSTRUCTION}\n\nHOME LANGUAGE REQUIREMENT: Reply warmly, naturally, and completely in ${label} (${code}) so a South African mother who speaks ${label} at home understands every word clearly. Keep emergency numbers 10177 and 112 clear.`;
}

const translationCache = new Map<string, string>();

function buildPrompt(
  question: string,
  history?: Array<{ role: 'user' | 'assistant'; text: string }>
): string {
  const prior = Array.isArray(history)
    ? history
        .slice(-4)
        .map((h) => `${h.role === 'user' ? 'Mom' : 'Advisor'}: ${h.text}`)
        .join('\n')
    : '';
  return prior ? `Context:\n${prior}\n\nQuestion: ${question}` : question;
}

function cleanError(err: unknown): string {
  const message = err instanceof Error ? err.message : 'Unable to reach AI Advisor right now.';
  if (/503|UNAVAILABLE|high demand/i.test(message)) {
    return 'The PregMamas AI Advisor is temporarily busy. Please try again in a few seconds.';
  }
  if (/API_KEY_INVALID|PERMISSION_DENIED|403|400/.test(message)) {
    return 'Please verify that GEMINI_API_KEY is configured in Settings > Secrets.';
  }
  return message;
}

const CANONICAL_SITE_URL = (process.env.SITE_URL || 'https://pregmamas.ai.studio').replace(/\/+$/, '');
const CANONICAL_HOST = (() => {
  try {
    return new URL(CANONICAL_SITE_URL).hostname.toLowerCase();
  } catch {
    return 'pregmamas.ai.studio';
  }
})();
const OLD_HOSTS = new Set(
  [
    'lizeka25.github.io',
    ...(process.env.OLD_SITE_HOSTS || '').split(','),
  ]
    .map((h) => h.trim().toLowerCase())
    .filter((h) => h && h !== CANONICAL_HOST)
);

const LEGACY_PATH_REDIRECTS: Record<string, string> = {
  '/home': '/',
  '/dashboard.html': '/dashboard',
  '/week-by-week.html': '/week-by-week',
  '/learn.html': '/learn',
  '/nutrition.html': '/nutrition',
  '/emergency.html': '/emergency',
  '/danger-signs.html': '/danger-signs',
  '/advisor.html': '/advisor',
  '/community.html': '/community',
  '/kicks.html': '/kicks',
  '/labour-prep.html': '/labour-prep',
  '/postpartum.html': '/postpartum',
  '/partners.html': '/partners',
  '/privacy.html': '/privacy',
};

const SITEMAP_ROUTES: Array<{ path: string; changefreq: string; priority: string }> = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/dashboard', changefreq: 'daily', priority: '0.9' },
  { path: '/week-by-week', changefreq: 'weekly', priority: '0.9' },
  { path: '/learn', changefreq: 'daily', priority: '0.9' },
  { path: '/nutrition', changefreq: 'weekly', priority: '0.9' },
  { path: '/emergency', changefreq: 'weekly', priority: '0.9' },
  { path: '/danger-signs', changefreq: 'weekly', priority: '0.9' },
  { path: '/advisor', changefreq: 'weekly', priority: '0.8' },
  { path: '/kicks', changefreq: 'weekly', priority: '0.8' },
  { path: '/labour-prep', changefreq: 'monthly', priority: '0.8' },
  { path: '/postpartum', changefreq: 'monthly', priority: '0.8' },
  { path: '/community', changefreq: 'daily', priority: '0.7' },
  { path: '/partners', changefreq: 'monthly', priority: '0.7' },
  { path: '/health-logs', changefreq: 'monthly', priority: '0.6' },
  { path: '/privacy', changefreq: 'monthly', priority: '0.5' },
];

async function startServer() {
  const app = express();
  app.set('trust proxy', true);
  app.use(express.json({ limit: '5mb' }));

  // 301 Permanent Redirects from old URLs / apex domain / HTTP / legacy repo paths to canonical URL
  app.use((req, res, next) => {
    const rawHost = String(req.headers['x-forwarded-host'] || req.headers.host || '')
      .split(',')[0]
      .trim()
      .toLowerCase();
    const hostname = rawHost.split(':')[0];
    const proto = String(req.headers['x-forwarded-proto'] || req.protocol || 'https')
      .split(',')[0]
      .trim()
      .toLowerCase();

    const isLocalOrPreview =
      !hostname ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.run.app');

    // Legacy GitHub Pages / old static paths work on both production and preview hosts
    let legacyTarget: string | null = null;
    if (req.path === '/PregMamas-' || req.path === '/PregMamas-/') {
      legacyTarget = '/';
    } else if (req.path.startsWith('/PregMamas-/')) {
      legacyTarget = req.path.slice('/PregMamas-'.length) || '/';
    } else if (LEGACY_PATH_REDIRECTS[req.path]) {
      legacyTarget = LEGACY_PATH_REDIRECTS[req.path];
    }

    const queryIndex = req.originalUrl.indexOf('?');
    const querySuffix = queryIndex >= 0 ? req.originalUrl.slice(queryIndex) : '';

    if (!isLocalOrPreview) {
      const shouldRedirectHost = OLD_HOSTS.has(hostname);
      const shouldUpgradeProto = hostname === CANONICAL_HOST && proto === 'http' && CANONICAL_SITE_URL.startsWith('https://');
      if (shouldRedirectHost || shouldUpgradeProto) {
        const targetPath = legacyTarget || req.path || '/';
        return res.redirect(301, `${CANONICAL_SITE_URL}${targetPath}${querySuffix}`);
      }
    }

    if (legacyTarget) {
      return res.redirect(301, `${legacyTarget}${querySuffix}`);
    }

    return next();
  });

  app.get('/sitemap.xml', (_req, res) => {
    const urlsXml = SITEMAP_ROUTES.map(
      (route) => `  <url>
    <loc>${CANONICAL_SITE_URL}${route.path}</loc>
    <lastmod>2026-11-18</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    ).join('\n');

    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>
`);
  });

  app.get('/robots.txt', (_req, res) => {
    res.type('text/plain').send(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin
Disallow: /login
Disallow: /register

Host: ${CANONICAL_HOST}
Sitemap: ${CANONICAL_SITE_URL}/sitemap.xml
`);
  });

  // Optional Google Search Console HTML file verification via GOOGLE_SITE_VERIFICATION env var
  app.get(/^\/google([a-zA-Z0-9_-]+)\.html$/, (req, res, next) => {
    const configured = (process.env.GOOGLE_SITE_VERIFICATION || '').trim();
    const requestedFile = req.path.replace(/^\//, '');
    if (!configured) return next();
    const normalizedFile = configured.endsWith('.html')
      ? configured
      : configured.startsWith('google')
        ? `${configured}.html`
        : `google${configured}.html`;
    if (requestedFile === normalizedFile) {
      return res.type('text/html').send(`google-site-verification: ${normalizedFile}`);
    }
    return next();
  });

  // Shared Doctor/Midwife Articles, Article Q&A Comments & Community Posts API
  app.get('/api/shared-content', (_req, res) => {
    res.json(sharedStore);
  });

  app.post('/api/shared-content/seed', (_req, res) => {
    // Brand-new website launches with empty community posts and comments; ignore legacy seed payloads
    res.json(sharedStore);
  });

  app.post('/api/articles', (req, res) => {
    const payload = req.body as Partial<StoredArticle>;
    const title = (payload.title || '').trim();
    const summary = (payload.summary || '').trim();
    if (!title || !summary) {
      return res.status(400).json({ error: 'Article title and summary are required.' });
    }
    const newArticle: StoredArticle = {
      id: `doc-art-${Date.now()}`,
      topic: payload.topic || 'general',
      title,
      summary,
      body:
        Array.isArray(payload.body) && payload.body.length > 0
          ? payload.body.map((b) => b.trim()).filter(Boolean)
          : [summary],
      image: payload.image || '',
      imageKey: payload.imageKey || 'clinicMidwife',
      imageAlt: payload.imageAlt || title,
      imageCaption: payload.imageCaption || `Clinical Guide by ${payload.authorName || 'Doctor / Midwife'}`,
      authorName: (payload.authorName || 'PregMamas Clinician').trim(),
      authorProfession: (payload.authorProfession || 'Registered Doctor / Midwife').trim(),
      isClinicianPublished: true,
      publishedAt: 'Just now',
    };
    sharedStore.customArticles = [newArticle, ...sharedStore.customArticles];
    persistSharedStore();
    return res.status(201).json({ article: newArticle, customArticles: sharedStore.customArticles });
  });

  app.post('/api/articles/:articleId/comments', (req, res) => {
    const { articleId } = req.params;
    const { author, authorRole, professionBadge, isQuestion, text } = req.body as {
      author?: string;
      authorRole?: string;
      professionBadge?: string;
      isQuestion?: boolean;
      text?: string;
    };
    const trimmed = (text || '').trim();
    if (!trimmed) {
      return res.status(400).json({ error: 'Comment or question cannot be empty.' });
    }
    const comment: StoredArticleComment = {
      id: `ac-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      author: (author || (authorRole === 'professional' ? 'PregMamas Midwife' : 'Mama on PregMamas')).trim(),
      authorRole: authorRole || 'mother',
      professionBadge: professionBadge?.trim() || undefined,
      isQuestion: Boolean(isQuestion),
      text: trimmed,
      createdAt: 'Just now',
    };
    const existing = sharedStore.articleComments[articleId] || [];
    sharedStore.articleComments = {
      ...sharedStore.articleComments,
      [articleId]: [...existing, comment],
    };
    persistSharedStore();
    return res.status(201).json({ comment, comments: sharedStore.articleComments[articleId] });
  });

  app.post('/api/community/posts', (req, res) => {
    const { author, authorRole, professionBadge, title, body } = req.body as {
      author?: string;
      authorRole?: string;
      professionBadge?: string;
      title?: string;
      body?: string;
    };
    const trimmed = (body || '').trim();
    if (!trimmed) {
      return res.status(400).json({ error: 'Post text cannot be empty.' });
    }
    const post: StoredCommunityPost = {
      id: `post-${Date.now()}`,
      author: (author || 'Mama on PregMamas').trim(),
      authorRole: authorRole || 'mother',
      professionBadge: professionBadge?.trim() || undefined,
      title: title?.trim() || undefined,
      body: trimmed,
      createdAt: 'Just now',
      replies: [],
    };
    sharedStore.communityPosts = [post, ...sharedStore.communityPosts];
    persistSharedStore();
    return res.status(201).json({ post, communityPosts: sharedStore.communityPosts });
  });

  app.post('/api/community/posts/:postId/replies', (req, res) => {
    const { postId } = req.params;
    const { author, authorRole, professionBadge, text } = req.body as {
      author?: string;
      authorRole?: string;
      professionBadge?: string;
      text?: string;
    };
    const trimmed = (text || '').trim();
    if (!trimmed) {
      return res.status(400).json({ error: 'Reply cannot be empty.' });
    }
    const reply: StoredReply = {
      id: `rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      author: (author || (authorRole === 'professional' ? 'PregMamas Doctor / Midwife' : 'Community Mama')).trim(),
      authorRole: authorRole || 'mother',
      professionBadge: professionBadge?.trim() || undefined,
      text: trimmed,
      createdAt: 'Just now',
    };
    let updatedPost: StoredCommunityPost | undefined;
    sharedStore.communityPosts = sharedStore.communityPosts.map((p) => {
      if (p.id !== postId) return p;
      updatedPost = { ...p, replies: [...p.replies, reply] };
      return updatedPost;
    });
    if (!updatedPost) {
      return res.status(404).json({ error: 'Community post not found.' });
    }
    persistSharedStore();
    return res.status(201).json({ reply, post: updatedPost, communityPosts: sharedStore.communityPosts });
  });

  // Doctor / Midwife Proof & Certification Verification Queue API
  app.post('/api/clinician-verifications', (req, res) => {
    const payload = req.body as Partial<StoredClinicianVerification>;
    const clinicianName = (payload.clinicianName || '').trim();
    const profession = (payload.profession || 'Doctor / Midwife').trim();
    const registrationBody =
      payload.registrationBody === 'HPCSA' || payload.registrationBody === 'SANC'
        ? payload.registrationBody
        : 'Other Medical Council';
    const registrationNumber = (payload.registrationNumber || '').trim();
    const facilityName = (payload.facilityName || '').trim();
    const proofFileName = (payload.proofFileName || '').trim() || undefined;
    const proofDataUrl = (payload.proofDataUrl || '').trim() || undefined;
    const notes = (payload.notes || '').trim() || undefined;

    if (!clinicianName) {
      return res.status(400).json({ error: 'Please enter your full Doctor or Midwife name.' });
    }
    if (!registrationNumber && !proofDataUrl) {
      return res.status(400).json({
        error: 'Please provide your SANC / HPCSA registration number or upload your certificate proof.',
      });
    }

    const record: StoredClinicianVerification = {
      id: `verif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      clinicianName,
      profession,
      registrationBody,
      registrationNumber: registrationNumber || 'Certificate Attached',
      facilityName: facilityName || 'South African Clinic / Practice',
      proofFileName,
      proofDataUrl,
      notes,
      status: 'pending',
      submittedAt: new Date().toLocaleString(),
    };

    sharedStore.clinicianVerifications = [record, ...sharedStore.clinicianVerifications];
    persistSharedStore();
    return res.status(201).json({
      verification: record,
      clinicianVerifications: sharedStore.clinicianVerifications,
    });
  });

  app.post('/api/clinician-verifications/:id/review', (req, res) => {
    const { id } = req.params;
    const { status, adminReviewNote } = req.body as {
      status?: 'approved' | 'rejected';
      adminReviewNote?: string;
    };
    if (status !== 'approved' && status !== 'rejected') {
      return res.status(400).json({ error: 'Review status must be approved or rejected.' });
    }

    const target = sharedStore.clinicianVerifications.find((v) => v.id === id);
    if (!target) {
      return res.status(404).json({ error: 'Clinician verification request not found.' });
    }

    const reviewedAt = new Date().toLocaleString();
    sharedStore.clinicianVerifications = sharedStore.clinicianVerifications.map((v) =>
      v.id === id
        ? {
            ...v,
            status,
            adminReviewNote: (adminReviewNote || '').trim() || undefined,
            reviewedAt,
          }
        : v
    );
    persistSharedStore();
    const updated = sharedStore.clinicianVerifications.find((v) => v.id === id);
    return res.json({
      verification: updated,
      clinicianVerifications: sharedStore.clinicianVerifications,
    });
  });

  // Partner Messaging Capabilities, Real WhatsApp + Email Dispatch & Automatic 3-Hour Scheduler
  app.get('/api/partners/capabilities', (_req, res) => {
    res.json({
      ...getPartnerMessagingCapabilities(),
      dispatches: sharedStore.partnerDispatches.slice(0, 12),
      autoSchedule: sharedStore.partnerAutoSchedule,
      serverNowMs: Date.now(),
    });
  });

  app.post('/api/partners/auto-schedule', async (req, res) => {
    const {
      enabled,
      partnerName,
      whatsappPhone,
      partnerEmail,
      subject,
      message,
      rotateMessages = true,
      sendFirstNow = false,
    } = req.body as {
      enabled?: boolean;
      partnerName?: string;
      whatsappPhone?: string;
      partnerEmail?: string;
      subject?: string;
      message?: string;
      rotateMessages?: boolean;
      sendFirstNow?: boolean;
    };

    if (!enabled) {
      sharedStore.partnerAutoSchedule = {
        ...sharedStore.partnerAutoSchedule,
        enabled: false,
        nextSendAtMs: null,
        lastRunSummary: 'Automatic 3-hour messaging paused.',
      };
      persistSharedStore();
      return res.json({
        autoSchedule: sharedStore.partnerAutoSchedule,
        dispatches: sharedStore.partnerDispatches.slice(0, 12),
        serverNowMs: Date.now(),
      });
    }

    const cleanEmail = (partnerEmail || '').trim();
    const cleanWhatsappDigits = normalizeWhatsappDigits(whatsappPhone || '');
    if (!cleanEmail && !cleanWhatsappDigits) {
      return res.status(400).json({
        error: 'Please enter a partner WhatsApp mobile number and/or email address before enabling the 3-hour auto-sender.',
      });
    }

    const now = Date.now();
    sharedStore.partnerAutoSchedule = {
      ...sharedStore.partnerAutoSchedule,
      enabled: true,
      intervalHours: 3,
      partnerName: (partnerName || 'Trusted Partner').trim(),
      whatsappPhone: (whatsappPhone || '').trim(),
      partnerEmail: cleanEmail,
      subject: (subject || 'PregMamas 3-Hour Partner Encouragement').trim(),
      message: (message || '').trim(),
      rotateMessages: Boolean(rotateMessages),
      nextSendAtMs: now + THREE_HOURS_MS,
      lastRunSummary: sendFirstNow
        ? 'Automatic 3-hour messaging active — sending initial encouragement now...'
        : 'Automatic 3-hour messaging active — system will send automatically every 3 hours.',
    };
    persistSharedStore();

    let immediateResult = null;
    if (sendFirstNow) {
      immediateResult = await executeScheduledThreeHourDispatch('manual');
    }

    return res.json({
      autoSchedule: sharedStore.partnerAutoSchedule,
      immediateResult,
      dispatches: sharedStore.partnerDispatches.slice(0, 12),
      serverNowMs: Date.now(),
    });
  });

  // Fast cached batch translation endpoint for all South African home languages
  app.post('/api/translate', async (req, res) => {
    const { targetLanguage, targetLanguageName, texts } = req.body as {
      targetLanguage?: string;
      targetLanguageName?: string;
      texts?: string[];
    };

    const langCode = (targetLanguage || 'en').trim().toLowerCase();
    const langName = (targetLanguageName || '').trim();
    if (!Array.isArray(texts) || texts.length === 0) {
      return res.json({ translations: [] });
    }
    if (langCode === 'en' || !langName || !process.env.GEMINI_API_KEY) {
      return res.json({ translations: texts });
    }

    const result = [...texts];
    const uncachedIndices: number[] = [];
    const uncachedTexts: string[] = [];

    texts.forEach((txt, idx) => {
      const clean = (txt || '').trim();
      if (!clean) return;
      const key = `${langCode}::${clean}`;
      const hit = translationCache.get(key);
      if (hit) {
        result[idx] = hit;
      } else {
        uncachedIndices.push(idx);
        uncachedTexts.push(txt);
      }
    });

    if (uncachedTexts.length === 0) {
      return res.json({ translations: result, cached: true });
    }

    try {
      const BATCH_SIZE = 25;
      for (let start = 0; start < uncachedTexts.length; start += BATCH_SIZE) {
        const chunk = uncachedTexts.slice(start, start + BATCH_SIZE);
        const chunkIndices = uncachedIndices.slice(start, start + BATCH_SIZE);

        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: JSON.stringify(chunk),
          config: {
            systemInstruction: `Translate each string in the JSON array accurately, warmly, and naturally into South African ${langName} (${langCode}) for pregnant mothers and families. Keep numbers (like 10177, 112, 28 weeks, 400-800 mcg, mg) and medical terms understandable. Return a JSON array of strings with the EXACT same length (${chunk.length}) and order.`,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
            abortSignal: AbortSignal.timeout(12000),
          },
        });

        const parsed = JSON.parse((response.text || '[]').trim()) as unknown;
        if (Array.isArray(parsed)) {
          chunkIndices.forEach((origIdx, j) => {
            const translated = typeof parsed[j] === 'string' && parsed[j].trim() ? parsed[j].trim() : texts[origIdx];
            result[origIdx] = translated;
            const cleanOrig = (texts[origIdx] || '').trim();
            if (cleanOrig) {
              translationCache.set(`${langCode}::${cleanOrig}`, translated);
            }
          });
        }
      }
      return res.json({ translations: result });
    } catch (err) {
      console.warn('[translate] failed:', err instanceof Error ? err.message : err);
      return res.json({ translations: result, fallback: true });
    }
  });

  // Fast streaming endpoint for instant word-by-word replies
  app.post('/api/advisor/stream', async (req, res) => {
    const { question, history, language, languageName } = req.body as {
      question?: string;
      history?: Array<{ role: 'user' | 'assistant'; text: string }>;
      language?: string;
      languageName?: string;
    };

    const trimmed = (question || '').trim();
    if (trimmed.length < 2) {
      return res.status(400).json({ error: 'Please enter a question to ask the PregMamas AI Advisor.' });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured yet in Settings > Secrets.',
      });
    }

    const isUrgent = URGENT_PATTERN.test(trimmed);
    const prompt = buildPrompt(trimmed, history);
    const systemInstruction = buildAdvisorSystemInstruction(language, languageName);

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    res.write(`data: ${JSON.stringify({ meta: true, urgent: isUrgent })}\n\n`);

    const clientAbort = new AbortController();
    res.on('close', () => {
      if (!res.writableEnded) {
        clientAbort.abort();
      }
    });

    try {
      const modelsToTry: Array<{ model: string; level: ThinkingLevel; timeoutMs: number }> = [
        { model: 'gemini-3.1-flash-lite', level: ThinkingLevel.MINIMAL, timeoutMs: 8000 },
        { model: 'gemini-4-hydrogen', level: ThinkingLevel.LOW, timeoutMs: 12000 },
      ];

      let streamStarted = false;
      let lastErr: unknown = null;

      for (const candidate of modelsToTry) {
        if (clientAbort.signal.aborted) break;
        const timeoutSignal = AbortSignal.any([
          clientAbort.signal,
          AbortSignal.timeout(candidate.timeoutMs),
        ]);
        try {
          const stream = await ai.models.generateContentStream({
            model: candidate.model,
            contents: prompt,
            config: {
              systemInstruction,
              thinkingConfig: { thinkingLevel: candidate.level },
              abortSignal: timeoutSignal,
            },
          });

          for await (const chunk of stream) {
            const text = chunk.text || '';
            if (text) {
              streamStarted = true;
              res.write(`data: ${JSON.stringify({ text })}\n\n`);
            }
          }
          if (streamStarted) {
            lastErr = null;
            break;
          }
        } catch (err) {
          lastErr = err;
          console.warn(`[advisor/stream] ${candidate.model} failed:`, err instanceof Error ? err.message : err);
          if (streamStarted || clientAbort.signal.aborted) {
            throw err;
          }
        }
      }

      if (lastErr && !streamStarted) {
        throw lastErr;
      }

      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      }
    } catch (err) {
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ error: cleanError(err) })}\n\n`);
        res.end();
      }
    }
  });

  // Fast standard JSON endpoint
  app.post('/api/advisor', async (req, res) => {
    try {
      const { question, history, language, languageName } = req.body as {
        question?: string;
        history?: Array<{ role: 'user' | 'assistant'; text: string }>;
        language?: string;
        languageName?: string;
      };

      const trimmed = (question || '').trim();
      if (trimmed.length < 2) {
        return res.status(400).json({ error: 'Please enter a question to ask the PregMamas AI Advisor.' });
      }

      const isUrgent = URGENT_PATTERN.test(trimmed);

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY is not configured yet in Settings > Secrets.',
        });
      }

      const prompt = buildPrompt(trimmed, history);
      const systemInstruction = buildAdvisorSystemInstruction(language, languageName);
      let answerText = '';
      let lastErr: unknown = null;

      const modelsToTry: Array<{ model: string; level: ThinkingLevel; timeoutMs: number }> = [
        { model: 'gemini-3.1-flash-lite', level: ThinkingLevel.MINIMAL, timeoutMs: 8000 },
        { model: 'gemini-4-hydrogen', level: ThinkingLevel.LOW, timeoutMs: 12000 },
      ];

      for (const candidate of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: candidate.model,
            contents: prompt,
            config: {
              systemInstruction,
              thinkingConfig: { thinkingLevel: candidate.level },
              abortSignal: AbortSignal.timeout(candidate.timeoutMs),
            },
          });
          answerText = (response.text || '').trim();
          if (answerText) {
            lastErr = null;
            break;
          }
        } catch (err) {
          lastErr = err;
          console.warn(`[advisor] ${candidate.model} failed:`, err instanceof Error ? err.message : err);
        }
      }

      if (lastErr && !answerText) {
        throw lastErr;
      }

      if (!answerText) {
        return res.status(502).json({
          error: 'The AI advisor returned an empty response. Please try rephrasing your question.',
        });
      }

      return res.json({
        answer: answerText,
        urgent: isUrgent,
      });
    } catch (err) {
      return res.status(500).json({ error: cleanError(err) });
    }
  });

  // Google Search Console HTML file verification (serve directly in dev & production)
  app.get('/googlecb4461bac1f9ee46.html', (_req, res) => {
    res.type('text/html').send('google-site-verification: googlecb4461bac1f9ee46.html');
  });

  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    if (process.env.DISABLE_HMR === 'true') {
      app.get('/@vite/client', (_req, res) => {
        res.type('application/javascript').send(`
          const sheetsMap = new Map();
          export function updateStyle(id, content) {
            let style = sheetsMap.get(id);
            if (!style) {
              style = document.createElement('style');
              style.type = 'text/css';
              style.setAttribute('data-vite-dev-id', id);
              style.textContent = content;
              document.head.appendChild(style);
              sheetsMap.set(id, style);
            } else if (style.textContent !== content) {
              style.textContent = content;
            }
          }
          export function removeStyle(id) {
            const style = sheetsMap.get(id);
            if (style) { document.head.removeChild(style); sheetsMap.delete(id); }
          }
          export function createHotContext() {
            return { accept() {}, dispose() {}, prune() {}, invalidate() {}, decline() {}, on() {}, off() {}, send() {}, data: {} };
          }
          export function injectQuery(url) { return url; }
          export class ErrorOverlay extends HTMLElement {}
        `);
      });
    }

    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer },
        ws: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Background 3-Hour Automatic Partner Message Scheduler (runs continuously every 30s check)
  setInterval(() => {
    const sched = sharedStore.partnerAutoSchedule;
    if (!sched.enabled || !sched.nextSendAtMs || autoScheduleRunning) return;
    if (Date.now() >= sched.nextSendAtMs) {
      autoScheduleRunning = true;
      executeScheduledThreeHourDispatch('timer')
        .catch(() => {
          // keep scheduler resilient against transient network errors
        })
        .finally(() => {
          autoScheduleRunning = false;
        });
    }
  }, 30 * 1000);

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`PregMamas server listening on http://localhost:${PORT}`);
  });
}

startServer();
