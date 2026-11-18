import { AppRoute } from '../data/pregmamasData';

const envSiteUrl =
  typeof import.meta !== 'undefined' &&
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_SITE_URL;

export const SITE_URL = (envSiteUrl || 'https://pregmamas.com').replace(/\/+$/, '');

interface RouteMeta {
  title: string;
  description: string;
  canonicalPath: AppRoute;
}

const DEFAULT_META: RouteMeta = {
  title: 'PregMamas — Supportive Pregnancy Education, Planning & Care',
  description:
    'PregMamas South Africa: pregnancy week tracker, daily supplement alarms, danger signs, nutrition guides, hospital bag counts, and fast AI maternal advice.',
  canonicalPath: '/',
};

const ROUTE_META: Partial<Record<AppRoute, RouteMeta>> = {
  '/': DEFAULT_META,
  '/dashboard': {
    title: 'Week-by-Week Mother Dashboard | PregMamas',
    description:
      'Track your pregnancy week by LMP, set daily prenatal supplement alarms, save clinic dates, and read advice from South African doctors and midwives.',
    canonicalPath: '/dashboard',
  },
  '/week-by-week': {
    title: 'Week-by-Week Pregnancy Tracker | PregMamas',
    description:
      'Follow baby growth week by week with fruit size comparisons, trimester milestones, and clinic reminders.',
    canonicalPath: '/week-by-week',
  },
  '/learn': {
    title: 'Pregnancy Health, Nutrition & Visual Guides | PregMamas',
    description:
      'Illustrated maternal health library covering nutrition, supplement defect prevention, Rh blood type, HIV/PrEP, baby positions, and teen support.',
    canonicalPath: '/learn',
  },
  '/nutrition': {
    title: 'Pregnancy Nutrition & Prenatal Vitamins | PregMamas',
    description:
      'Essential pregnancy nutrition, folic acid, iron, calcium, and affordable South African meal guidance for healthy fetal growth.',
    canonicalPath: '/nutrition',
  },
  '/emergency': {
    title: 'Pregnancy Danger Signs & Emergency Contacts | PregMamas',
    description:
      'Recognize urgent pregnancy danger signs and call South African emergency medical help (10177 / 112) fast, available offline.',
    canonicalPath: '/emergency',
  },
  '/danger-signs': {
    title: 'Urgent Pregnancy Danger Signs | PregMamas',
    description:
      'Offline checklist of pregnancy warning signs requiring immediate clinic or hospital attention plus 10177 / 112 emergency dialing.',
    canonicalPath: '/danger-signs',
  },
  '/kicks': {
    title: 'Baby Movement Diary & Trigger Tips | PregMamas',
    description:
      'Learn what to eat, drink, and do to gently encourage baby movements and record how many times baby moved in your Daily Movement Diary.',
    canonicalPath: '/kicks',
  },
  '/advisor': {
    title: 'Fast AI Pregnancy Advisor in 11 SA Languages | PregMamas',
    description:
      'Ask pregnancy, supplement, labour, and postpartum questions and receive fast answers in your South African home language.',
    canonicalPath: '/advisor',
  },
  '/community': {
    title: 'PregMamas Community & Midwife Q&A | PregMamas',
    description:
      'Read verified replies from doctors and midwives and connect with supportive mothers across South Africa.',
    canonicalPath: '/community',
  },
  '/labour-prep': {
    title: 'Hospital Bag Packing List & Labour Prep | PregMamas',
    description:
      'Interactive clinic and hospital bag checklist with exact quantities for mother and newborn baby.',
    canonicalPath: '/labour-prep',
  },
  '/postpartum': {
    title: 'Postpartum Healing, Lochia & Family Planning | PregMamas',
    description:
      'C-section and episiotomy recovery steps, lochia healing stages, and free clinic contraceptive examples.',
    canonicalPath: '/postpartum',
  },
  '/partners': {
    title: 'Partner Support & Encouragement | PregMamas',
    description:
      'Practical pregnancy care reminders and consent-based encouragement messages for supportive partners.',
    canonicalPath: '/partners',
  },
  '/health-logs': {
    title: 'Private Pregnancy Mood & Health Logs | PregMamas',
    description:
      'Keep private daily mood notes, weight logs, and questions ready for your next antenatal clinic visit.',
    canonicalPath: '/health-logs',
  },
  '/privacy': {
    title: 'Privacy, Consent & Offline Data Control | PregMamas',
    description:
      'Learn how PregMamas protects your privacy, consent settings, and local device storage.',
    canonicalPath: '/privacy',
  },
  '/professional': {
    title: 'Doctor & Midwife Clinical Studio | PregMamas',
    description:
      'Credential verification and clinical publishing workspace for registered doctors and midwives on PregMamas.',
    canonicalPath: '/professional',
  },
  '/admin': {
    title: 'Administrator Governance Console | PregMamas',
    description: 'Platform governance, clinician credential review, and safety moderation for PregMamas.',
    canonicalPath: '/admin',
  },
  '/login': {
    title: 'Sign In | PregMamas',
    description: 'Sign in to your PregMamas maternal care workspace.',
    canonicalPath: '/login',
  },
  '/register': {
    title: 'Create Account | PregMamas',
    description: 'Register for a PregMamas maternal care, partner, or clinician account.',
    canonicalPath: '/register',
  },
};

const NOINDEX_ROUTES = new Set<AppRoute>(['/admin', '/login', '/register', '/professional']);

const LEGACY_PATH_MAP: Record<string, AppRoute> = {
  '/home': '/',
  '/index.html': '/',
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

export function normalizeLegacyPath(pathname: string): AppRoute | null {
  let clean = pathname.trim() || '/';
  if (clean === '/PregMamas-' || clean === '/PregMamas-/') {
    return '/';
  }
  if (clean.startsWith('/PregMamas-/')) {
    clean = clean.slice('/PregMamas-'.length) || '/';
  }
  if (clean.length > 1 && clean.endsWith('/')) {
    clean = clean.slice(0, -1);
  }
  if (LEGACY_PATH_MAP[clean]) {
    return LEGACY_PATH_MAP[clean];
  }
  return clean as AppRoute;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function applyRouteSeo(path: AppRoute) {
  if (typeof document === 'undefined') return;
  const meta = ROUTE_META[path] || DEFAULT_META;
  const canonicalUrl = `${SITE_URL}${meta.canonicalPath === '/' ? '/' : meta.canonicalPath}`;
  const shareImageUrl = `${SITE_URL}/pwa-512x512.png`;

  document.title = meta.title;
  upsertMeta('name', 'robots', NOINDEX_ROUTES.has(path) ? 'noindex, nofollow' : 'index, follow');
  upsertMeta('name', 'description', meta.description);
  upsertMeta('property', 'og:site_name', 'PregMamas');
  upsertMeta('property', 'og:title', meta.title);
  upsertMeta('property', 'og:description', meta.description);
  upsertMeta('property', 'og:url', canonicalUrl);
  upsertMeta('property', 'og:image', shareImageUrl);
  upsertMeta('name', 'twitter:url', canonicalUrl);
  upsertMeta('name', 'twitter:title', meta.title);
  upsertMeta('name', 'twitter:description', meta.description);
  upsertMeta('name', 'twitter:image', shareImageUrl);

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', canonicalUrl);
}
