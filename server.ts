import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
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

interface SharedStore {
  customArticles: StoredArticle[];
  articleComments: Record<string, StoredArticleComment[]>;
  communityPosts: StoredCommunityPost[];
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
  /(heavy bleed|vaginal bleed|bleeding|blood clot|severe headache|blurred vision|seeing spots|convuls|fit|seizure|high fever|chest pain|less movement|not moving|stopped moving|reduced movement|water broke|waters broke|faint|collapse)/i;

const SYSTEM_INSTRUCTION = `You are the PregMamas Fast Educational Maternal Health Advisor for South African mothers, expecting teens, and supportive partners.
Keep answers concise, warm, clear, and formatted with short scannable bullet points.
Clinical & Practical Reference:
- Hospital Bag & Labour Hygiene: Mom needs 3 front-opening gowns, 2 loose going-home outfits, 4-5 high-waisted cotton underwear, 3 nursing bras, 2 grip socks, shower sandals, 1 robe, 2 packs maternity pads, peri bottle, ID & Maternity Case Record. Baby needs 5-6 side-snap kimono bodysuits (3 NB, 3 0-3M), 3-4 two-way zip sleepers, 2-3 swaddles, 2 hats, 2 pairs mittens, 3 pairs socks, 1 romper, 20-24 nappies, wipes, car seat. Labour Hygiene Prep: Advise women to shave or trim neatly ahead of labour with a clean razor/trimmer (avoid skin nicks right before surgery or let ward staff trim safely), wash the outer genital area daily with warm water & mild fragrance-free soap to stay clean down there (wipe front-to-back, clean cotton underwear, never douche internally), and pack hygiene necessities (unscented soap, clean razor/trimmer, 2 soft washcloths, bath towel, peri rinse bottle, extra-heavy pads, unscented wipes, toothbrush, toothpaste, deodorant).
- Antenatal Visits: Always advise arriving early (at least 30 minutes before clinic opening or appointment time) for every antenatal visit with the Road to Health / antenatal booklet, ID, water, and a light snack.
- Supplements & Defect Prevention: Folic acid (400-800 mcg daily prevents Neural Tube Defects like Spina Bifida), Iron (27 mg spaced 2h from calcium prevents anemia & low birth weight), Calcium + Vit D (supports bones & lowers pre-eclampsia risk), Omega-3 DHA.
- Blood Type & Rh Factor: Every mom needs ABO + Rh testing early. If Rh-negative, she needs protective Anti-D immunoglobulin at ~28 weeks, after any bleeding, and within 72h after birth to prevent Rh sensitization / newborn hemolytic jaundice.
- HIV & PrEP: HIV-positive moms taking daily ART until Viral Load is Undetectable (U=U) plus baby Nevirapine drops protect baby from transmission. HIV-negative moms at risk can use 3 PrEP types free/via clinics: Daily Oral PrEP pills, Long-acting Injectable PrEP (every 2 months), or Monthly Vaginal PrEP Ring.
- C-section types: Low Transverse (bikini cut), Low Vertical, Classical Vertical. Episiotomy: Mediolateral or Midline; care via warm peri bottle rinse, cool ice compress, warm sitz bath, pat dry & cotton pad.
- Lochia stages: Rubra (Days 1-4 red), Serosa (Days 5-10 pinkish-brown), Alba (Days 11-Week 6 creamy). Pads only, no tampons for 6 weeks.
- Baby movements: Track 10 movements within 2 hours and daily totals; if reduced from week 24+, go to clinic/MOU same day or call 10177 / 112.
Safety Rule: Educational guidance only—never diagnose or prescribe. For urgent danger symptoms, direct immediately to a clinic/MOU or 10177 / 112.`;

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

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Shared Doctor/Midwife Articles, Article Q&A Comments & Community Posts API
  app.get('/api/shared-content', (_req, res) => {
    res.json(sharedStore);
  });

  app.post('/api/shared-content/seed', (req, res) => {
    const { communityPosts, articleComments } = req.body as {
      communityPosts?: StoredCommunityPost[];
      articleComments?: Record<string, StoredArticleComment[]>;
    };
    let changed = false;
    if (sharedStore.communityPosts.length === 0 && Array.isArray(communityPosts) && communityPosts.length > 0) {
      sharedStore.communityPosts = communityPosts;
      changed = true;
    }
    if (articleComments && typeof articleComments === 'object') {
      for (const [artId, list] of Object.entries(articleComments)) {
        if (!sharedStore.articleComments[artId] && Array.isArray(list) && list.length > 0) {
          sharedStore.articleComments[artId] = list;
          changed = true;
        }
      }
    }
    if (changed) persistSharedStore();
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

  // Partner Messaging Capabilities, Real WhatsApp + Email Dispatch & Automatic 3-Hour Scheduler
  app.get('/api/partners/capabilities', (_req, res) => {
    res.json({
      ...getPartnerMessagingCapabilities(),
      dispatches: sharedStore.partnerDispatches.slice(0, 12),
      autoSchedule: sharedStore.partnerAutoSchedule,
      serverNowMs: Date.now(),
    });
  });

  app.post('/api/partners/send-encouragement', async (req, res) => {
    const {
      partnerName,
      whatsappPhone,
      partnerEmail,
      subject,
      message,
      sendWhatsapp = true,
      sendEmail = true,
    } = req.body as {
      partnerName?: string;
      whatsappPhone?: string;
      partnerEmail?: string;
      subject?: string;
      message?: string;
      sendWhatsapp?: boolean;
      sendEmail?: boolean;
    };

    const cleanEmail = (partnerEmail || '').trim();
    const cleanWhatsappDigits = normalizeWhatsappDigits(whatsappPhone || '');
    const cleanMessage = (message || '').trim();

    if (!cleanMessage) {
      return res.status(400).json({ error: 'Please include an encouragement message to send.' });
    }
    if (!cleanEmail && !cleanWhatsappDigits) {
      return res.status(400).json({
        error: 'Please enter a partner WhatsApp mobile number and/or email address.',
      });
    }

    const result = await dispatchPartnerEncouragement({
      partnerName: partnerName || 'Trusted Partner',
      whatsappPhone: whatsappPhone || '',
      partnerEmail: cleanEmail,
      subject: subject || '',
      message: cleanMessage,
      sendWhatsapp,
      sendEmail,
      isAutoScheduled: false,
    });

    return res.json({
      ...result,
      dispatches: sharedStore.partnerDispatches.slice(0, 12),
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
        : 'Automatic 3-hour messaging active — next automatic message scheduled in 3 hours.',
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

  app.post('/api/partners/auto-schedule/trigger-now', async (_req, res) => {
    const sched = sharedStore.partnerAutoSchedule;
    if (!sched.enabled) {
      return res.status(400).json({
        error: 'Turn on the Automatic 3-Hour Messaging schedule first.',
      });
    }
    const result = await executeScheduledThreeHourDispatch('manual');
    return res.json({
      autoSchedule: sharedStore.partnerAutoSchedule,
      immediateResult: result,
      dispatches: sharedStore.partnerDispatches.slice(0, 12),
      serverNowMs: Date.now(),
    });
  });

  // Fast streaming endpoint for instant word-by-word replies
  app.post('/api/advisor/stream', async (req, res) => {
    const { question, history } = req.body as {
      question?: string;
      history?: Array<{ role: 'user' | 'assistant'; text: string }>;
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

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    res.write(`data: ${JSON.stringify({ meta: true, urgent: isUrgent })}\n\n`);

    try {
      let streamStarted = false;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const stream = await ai.models.generateContentStream({
            model: 'gemini-4-hydrogen',
            contents: prompt,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            },
          });

          for await (const chunk of stream) {
            const text = chunk.text || '';
            if (text) {
              streamStarted = true;
              res.write(`data: ${JSON.stringify({ text })}\n\n`);
            }
          }
          break;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          const isTransient = /503|UNAVAILABLE|429|high demand/i.test(msg);
          if (!isTransient || attempt === 1 || streamStarted) {
            throw err;
          }
          await new Promise((r) => setTimeout(r, 450));
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (err) {
      res.write(`data: ${JSON.stringify({ error: cleanError(err) })}\n\n`);
      res.end();
    }
  });

  // Fast standard JSON endpoint
  app.post('/api/advisor', async (req, res) => {
    try {
      const { question, history } = req.body as {
        question?: string;
        history?: Array<{ role: 'user' | 'assistant'; text: string }>;
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
      let answerText = '';

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-4-hydrogen',
            contents: prompt,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            },
          });
          answerText = (response.text || '').trim();
          if (answerText) break;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          const isTransient = /503|UNAVAILABLE|429|high demand/i.test(msg);
          if (!isTransient || attempt === 2) {
            throw err;
          }
          await new Promise((r) => setTimeout(r, 450 * (attempt + 1)));
        }
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

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PregMamas server listening on http://localhost:${PORT}`);
  });
}

startServer();
