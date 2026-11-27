import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Loader2,
  PhoneCall,
  ShieldCheck,
} from 'lucide-react';
import { AppRoute, DemoUser, IMAGES } from '../data/pregmamasData';
import { useLanguage, useTranslatedTexts } from '../context/LanguageContext';
import { PinkLmpCalendar } from '../components/PinkLmpCalendar';
import { PWAInstallButton } from '../components/PWAInstallButton';

interface LandingPageProps {
  user: DemoUser | null;
  onNavigate: (path: AppRoute, topic?: string) => void;
}

const DEFAULT_PREVIEW_LMP = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 24 * 7);
  return d.toISOString().split('T')[0];
})();

type DirectoryCategory = 'all' | 'pregnancy' | 'birth' | 'tools';

interface DirectoryCard {
  id: string;
  category: Exclude<DirectoryCategory, 'all'>;
  route: AppRoute;
  topic?: string;
  label: string;
  title: string;
  desc: string;
  image?: string;
  imageAlt: string;
  isContraceptionGrid?: boolean;
  isDiagramContain?: boolean;
}

const CARE_DIRECTORY_CARDS: DirectoryCard[] = [
  {
    id: 'dashboard-supplements',
    category: 'tools',
    route: '/dashboard',
    label: 'Mother Dashboard',
    title: 'Week Tracker & Daily Supplement Alarms',
    desc: 'Track your pregnancy week by LMP, set custom-sound vitamin alarms, and save clinic dates.',
    image: IMAGES.supplements,
    imageAlt: 'Daily prenatal folic acid and iron vitamins beside a glass of water',
  },
  {
    id: 'kicks',
    category: 'tools',
    route: '/kicks',
    label: 'Baby Kicks',
    title: 'Daily Movement Diary & Trigger Tips',
    desc: 'Learn what to eat and do to encourage baby movements and record how many times baby moved each day.',
    image: IMAGES.navBabyKicks,
    imageAlt: 'Expectant mother resting comfortably and logging daily baby movements',
  },
  {
    id: 'advisor',
    category: 'tools',
    route: '/advisor',
    label: 'Fast AI Advisor',
    title: 'Instant Pregnancy Q&A in Your Language',
    desc: 'Ask pregnancy, nutrition, and postpartum questions and receive fast, safety-checked guidance.',
    image: IMAGES.navAiAdvisor,
    imageAlt: 'Mother reading educational guidance on her mobile phone',
  },
  {
    id: 'rh-defects',
    category: 'pregnancy',
    route: '/learn',
    topic: 'blood-rh-hiv',
    label: 'Blood & Prevention',
    title: 'Blood Type (Rh), Anti-D & Defect Prevention',
    desc: 'How Rh-/Rh+ testing, Anti-D shots, folic acid, and iron help protect baby from birth defects.',
    image: IMAGES.bloodTypeRh,
    imageAlt: 'Blood type Rh-negative and Rh-positive chart explaining Anti-D shot protection',
    isDiagramContain: true,
  },
  {
    id: 'hiv-prep',
    category: 'pregnancy',
    route: '/learn',
    topic: 'blood-rh-hiv',
    label: 'HIV Care & PrEP',
    title: 'HIV+ Baby Protection & 3 PrEP Options',
    desc: 'Daily ART viral load steps for HIV+ moms plus visual guides on oral, injectable, and ring PrEP.',
    image: IMAGES.hivPmtctPrep,
    imageAlt: 'HIV-positive baby protection PMTCT steps and 3 types of PrEP',
    isDiagramContain: true,
  },
  {
    id: 'teen-unplanned',
    category: 'pregnancy',
    route: '/learn',
    topic: 'teen-support',
    label: 'Teen & Options Support',
    title: 'School Rights, Scripts & Calm Decisions',
    desc: 'Practical SA teen-mom examples, family conversation scripts, and non-judgmental clinic choices.',
    image: IMAGES.teenSupport,
    imageAlt: 'Young mother speaking with a counselor in a supportive clinic room',
  },
  {
    id: 'labour-bag',
    category: 'birth',
    route: '/labour-prep',
    label: 'Labour & Birth Bag',
    title: 'Exact Hospital Bag Counts for Mom & Baby',
    desc: 'Interactive packing checklist with exact quantities of clothes, nappies, and hygiene essentials.',
    image: IMAGES.laborBabyClothes,
    imageAlt: 'Newborn hospital clothes laid out: kimono bodysuits, sleepers, blankets, hats, and socks',
  },
  {
    id: 'baby-positions',
    category: 'birth',
    route: '/learn',
    topic: 'baby-positions',
    label: 'Birth Education',
    title: 'Baby Positions & Safe Prenatal Exercises',
    desc: 'Visual charts of Cephalic, Breech, Transverse, and Posterior positions plus guided stretch timers.',
    image: IMAGES.babyPositions,
    imageAlt: 'Illustrated chart showing baby positions inside the womb before birth',
    isDiagramContain: true,
  },
  {
    id: 'postpartum-fp',
    category: 'birth',
    route: '/postpartum',
    label: 'Postpartum & Family Planning',
    title: 'C-Section, Episiotomy, Lochia & Contraception',
    desc: 'Illustrated wound recovery steps, lochia pad guides, self-care routines, and clinic contraceptives.',
    imageAlt: 'Contraceptive options: oral pills, clinic injection, subdermal arm implant, and copper IUD',
    isContraceptionGrid: true,
  },
];

const QUICK_FOUR_STEPS = [
  {
    step: '01',
    title: 'Check Your Week',
    desc: 'Enter your Last Menstrual Period once to see baby size, trimester milestones, and clinic reminders.',
  },
  {
    step: '02',
    title: 'Learn With Pictures',
    desc: 'Browse clear illustrated guides on nutrition, Rh blood type, HIV/PrEP, baby positions, and birth recovery.',
  },
  {
    step: '03',
    title: 'Track Daily Care',
    desc: 'Use daily supplement alarms, kick counts, private mood notes, and your hospital bag checklist.',
  },
  {
    step: '04',
    title: 'Ask or Reach Care Fast',
    desc: 'Get fast AI guidance, ask verified clinicians on articles, or tap 10177 / 112 during urgent danger signs.',
  },
];

export function LandingPage({ user, onNavigate }: LandingPageProps) {
  const { t } = useLanguage();
  const [lmpDate, setLmpDate] = useState<string>(() => {
    return localStorage.getItem('pregmamas_lmp_date_v1') || DEFAULT_PREVIEW_LMP;
  });
  const [directoryTab, setDirectoryTab] = useState<DirectoryCategory>('all');

  useEffect(() => {
    localStorage.setItem('pregmamas_lmp_date_v1', lmpDate);
  }, [lmpDate]);

  const staticUiTexts = useMemo(
    () => [
      'All Guides & Tools',
      'Pregnancy Health',
      'Birth & Postpartum',
      'Daily Tools',
      'Private Health Logs',
      'Privacy & Consent',
    ],
    []
  );

  const textsToTranslate = useMemo(() => {
    const list: string[] = [...staticUiTexts];
    CARE_DIRECTORY_CARDS.forEach((c) => {
      list.push(c.label, c.title, c.desc);
    });
    QUICK_FOUR_STEPS.forEach((s) => {
      list.push(s.title, s.desc);
    });
    return list;
  }, [staticUiTexts]);

  const { translated, translating } = useTranslatedTexts(textsToTranslate);

  const uiOffset = 0;
  const dirOffset = staticUiTexts.length;
  const stepsOffset = dirOffset + CARE_DIRECTORY_CARDS.length * 3;

  const filteredDirectory = useMemo(
    () =>
      directoryTab === 'all'
        ? CARE_DIRECTORY_CARDS
        : CARE_DIRECTORY_CARDS.filter((item) => item.category === directoryTab),
    [directoryTab]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-14">
      {/* 1. Calm Asymmetric Hero */}
      <section className="pink-hero-panel p-6 sm:p-10 grid gap-8 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9d174d] m-0">
              {t('hero.eyebrow')}
            </p>
            <h1 className="font-display text-3xl sm:text-5xl font-semibold text-[#3f0d24] leading-[1.08] m-0">
              {t('hero.title')}
            </h1>
            <p className="text-base text-[#5c223d] max-w-xl leading-relaxed m-0">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {user ? (
                <button
                  type="button"
                  onClick={() => onNavigate('/dashboard')}
                  className="pink-btn-primary"
                >
                  {t('hero.openDashboard')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate('/register')}
                  className="pink-btn-primary"
                >
                  {t('hero.registerFree')}
                </button>
              )}
              <button
                type="button"
                onClick={() => onNavigate('/learn')}
                className="pink-btn-secondary"
              >
                {t('hero.browseGuides')}
              </button>
              <PWAInstallButton variant="hero" />
            </div>
          </div>

          <div className="pt-4 border-t border-[#ea91b8]/60 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-[#5c223d] flex items-center gap-2 m-0">
              <ShieldCheck className="w-4 h-4 text-[#be185d] shrink-0" aria-hidden="true" />
              <span>{t('hero.safetyNote')}</span>
            </p>
            {translating && (
              <span className="inline-flex items-center gap-1 text-xs text-[#be185d] font-medium">
                <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                {t('lang.translating')}
              </span>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="rounded-2xl overflow-hidden border border-[#ea91b8] bg-[#ffe4ef] flex-1 min-h-[220px]">
            <img
              src={IMAGES.hero}
              alt="Expectant mother sitting calmly by a sunlit window representing supportive pregnancy preparation"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('/learn')}
              className="pink-card px-4 py-3 text-left hover:border-[#db2777] transition-colors cursor-pointer"
            >
              <strong className="block font-display text-base sm:text-lg text-[#be185d] tabular-nums">
                {t('hero.topicsTitle')}
              </strong>
              <span className="text-xs text-[#5c223d]">{t('hero.topicsDesc')}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/emergency')}
              className="pink-card px-4 py-3 text-left hover:border-[#be123c] transition-colors cursor-pointer"
            >
              <strong className="block font-display text-base sm:text-lg text-[#be123c] tabular-nums">
                10177 / 112
              </strong>
              <span className="text-xs text-[#5c223d]">{t('hero.urgentDesc')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Why PregMamas + Interactive Week Calculator */}
      <section className="grid gap-6 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7 pink-card p-6 sm:p-8 space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#be185d] m-0">
              {t('landing.whyEyebrow')}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#3f0d24] m-0">
              {t('landing.whyTitle')}
            </h2>
            <p className="text-sm sm:text-base text-[#5c223d] leading-relaxed m-0">
              {t('landing.whyBody')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-3 border-t border-[#ffd6e7]">
            <div className="space-y-1">
              <strong className="block text-sm font-semibold text-[#3f0d24]">
                {t('landing.mobileTitle')}
              </strong>
              <p className="text-xs text-[#5c223d] leading-relaxed m-0">
                {t('landing.mobileDesc')}
              </p>
            </div>
            <div className="space-y-1">
              <strong className="block text-sm font-semibold text-[#3f0d24]">
                {t('landing.respectTitle')}
              </strong>
              <p className="text-xs text-[#5c223d] leading-relaxed m-0">
                {t('landing.respectDesc')}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#ffd6e7] grid sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-5 rounded-xl overflow-hidden border border-[#f4b6d0] bg-[#ffe4ef] aspect-[16/10]">
              <img
                src={IMAGES.clinicMidwife}
                alt="South African clinic nurse welcoming an expectant mother with her Road to Health booklet"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="sm:col-span-7 space-y-1">
              <strong className="block text-sm font-semibold text-[#3f0d24]">
                {t('landing.antenatalTitle')}
              </strong>
              <p className="text-xs text-[#5c223d] m-0 leading-relaxed">
                {t('landing.antenatalDesc')}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <PinkLmpCalendar lmpDate={lmpDate} onChangeLmpDate={setLmpDate} compact />
        </div>
      </section>

      {/* 3. Unified Care & Visual Guide Directory */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#be185d] m-0">
              {t('landing.libraryEyebrow')}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#3f0d24] m-0">
              {t('landing.libraryTitle')}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              role="tablist"
              aria-label="Filter care guides"
              className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-[#ffe4ef] border border-[#f4b6d0] p-1"
            >
              {(
                [
                  { id: 'all', label: translated[uiOffset] || 'All Guides & Tools' },
                  { id: 'pregnancy', label: translated[uiOffset + 1] || 'Pregnancy Health' },
                  { id: 'birth', label: translated[uiOffset + 2] || 'Birth & Postpartum' },
                  { id: 'tools', label: translated[uiOffset + 3] || 'Daily Tools' },
                ] as const
              ).map((tab) => {
                const active = directoryTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setDirectoryTab(tab.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#be185d] text-white'
                        : 'text-[#5c223d] hover:text-[#3f0d24]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDirectory.map((card) => {
            const origIdx = CARE_DIRECTORY_CARDS.findIndex((item) => item.id === card.id);
            const label = translated[dirOffset + origIdx * 3] || card.label;
            const title = translated[dirOffset + origIdx * 3 + 1] || card.title;
            const desc = translated[dirOffset + origIdx * 3 + 2] || card.desc;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onNavigate(card.route, card.topic)}
                className="pink-card overflow-hidden flex flex-col h-full hover:border-[#db2777] transition-colors group text-left cursor-pointer"
              >
                {card.isContraceptionGrid ? (
                  <div className="bg-[#ffe4ef] border-b border-[#f4b6d0] aspect-[16/10] w-full overflow-hidden grid grid-cols-2 grid-rows-2 gap-0.5 shrink-0">
                    <img
                      src={IMAGES.contraceptivePills}
                      alt="28-day oral contraceptive pills"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <img
                      src={IMAGES.contraceptiveInjection}
                      alt="Clinic contraceptive injection vial and syringe"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <img
                      src={IMAGES.contraceptiveImplant}
                      alt="Subdermal arm implant rod"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <img
                      src={IMAGES.contraceptiveIud}
                      alt="T-shaped copper IUD"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="bg-[#ffe4ef] border-b border-[#f4b6d0] aspect-[16/10] w-full overflow-hidden shrink-0">
                    <img
                      src={card.image}
                      alt={card.imageAlt}
                      referrerPolicy="no-referrer"
                      className={`w-full h-full ${
                        card.isDiagramContain
                          ? 'object-contain bg-[#fff7fa] p-2'
                          : 'object-cover'
                      }`}
                    />
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between gap-2">
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-[#be185d] m-0">{label}</p>
                    <h3 className="font-display text-lg font-semibold text-[#3f0d24] m-0 group-hover:text-[#be185d]">
                      {title}
                    </h3>
                    <p className="text-xs text-[#5c223d] m-0 leading-relaxed">{desc}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#9d174d] pt-1">
                    <span>{t('hero.browseGuides')}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Clean Quick Links Strip for Private Logs & Privacy */}
        <div className="pink-card px-5 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-semibold text-[#3f0d24]">
            <button
              type="button"
              onClick={() => onNavigate('/health-logs')}
              className="inline-flex items-center gap-1.5 hover:text-[#be185d] cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#be185d]" aria-hidden="true" />
              <span>{translated[uiOffset + 4] || 'Private Health Logs'}</span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/privacy')}
            className="text-xs font-semibold text-[#be185d] hover:underline cursor-pointer"
          >
            {translated[uiOffset + 5] || 'Privacy & Consent'}
          </button>
        </div>
      </section>

      {/* 4. Urgent Warning Signs Bar */}
      <section className="rounded-2xl bg-[#ffe0e9] border border-[#e11d48] p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-start gap-4 max-w-2xl">
          <div className="w-11 h-11 rounded-xl bg-[#be123c] text-white grid place-items-center shrink-0">
            <AlertTriangle className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h2 className="font-display text-xl font-semibold text-[#881337] m-0">
              {t('landing.urgentBannerTitle')}
            </h2>
            <p className="text-sm text-[#5c223d] m-0">{t('landing.urgentBannerBody')}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <a href="tel:10177" className="pink-btn-urgent tabular-nums">
            <PhoneCall className="w-4 h-4" aria-hidden="true" />
            <span>{t('landing.ambulanceBtn')}</span>
          </a>
          <a href="tel:112" className="pink-btn-urgent tabular-nums">
            <PhoneCall className="w-4 h-4" aria-hidden="true" />
            <span>{t('landing.emergencyBtn')}</span>
          </a>
          <button
            type="button"
            onClick={() => onNavigate('/emergency')}
            className="pink-btn-secondary"
          >
            {t('landing.viewDangerBtn')}
          </button>
        </div>
      </section>

      {/* 5. Simple 4-Step Guide */}
      <section className="space-y-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#be185d] m-0">
            {t('landing.howEyebrow')}
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#3f0d24] m-0">
            {t('landing.howTitle')}
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_FOUR_STEPS.map((item, idx) => (
            <div key={item.step} className="pink-card p-5 flex flex-col gap-2">
              <span className="font-mono text-xs font-semibold text-[#be185d] tabular-nums">
                {item.step}
              </span>
              <h3 className="font-display text-lg font-semibold text-[#3f0d24] m-0">
                {translated[stepsOffset + idx * 2] || item.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#5c223d] m-0 leading-relaxed">
                {translated[stepsOffset + idx * 2 + 1] || item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
