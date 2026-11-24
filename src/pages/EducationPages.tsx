import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Droplets,
  Eye,
  Hand,
  Heart,
  Loader2,
  PhoneCall,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Thermometer,
  Waves,
} from 'lucide-react';
import {
  AppRoute,
  DANGER_SIGNS,
  DemoUser,
  IMAGES,
  LEARNING_TOPICS,
  LearningTopic,
  PREVENTABLE_DEFECT_EXAMPLES,
  SA_PROVINCES,
} from '../data/pregmamasData';
import { TranslationKey } from '../data/saLanguages';
import { useLanguage, useTranslatedTexts } from '../context/LanguageContext';
import { useSharedContent } from '../context/SharedContentContext';
import { ArticleCommentsBox } from '../components/ArticleCommentsBox';
import { SupplementAlarmSection } from '../components/SupplementAlarmSection';
import { SafeExercisesSection } from '../components/SafeExercisesSection';
import { TeenSupportSection } from '../components/TeenSupportSection';
import { PostpartumSection } from '../components/PostpartumSection';
import { LaborBagSection } from '../components/LaborBagSection';
import { MaternalProtectionSection } from '../components/MaternalProtectionSection';

const TOPIC_TRANSLATION_KEY: Record<LearningTopic['slug'], TranslationKey> = {
  all: 'learn.topic.all',
  general: 'learn.topic.general',
  'blood-rh-hiv': 'learn.topic.bloodRhHiv',
  'teen-support': 'learn.topic.teenSupport',
  'unplanned-support': 'learn.topic.unplannedSupport',
  'danger-signs': 'learn.topic.dangerSigns',
  exercises: 'learn.topic.exercises',
  'baby-positions': 'learn.topic.babyPositions',
  'labour-prep': 'learn.topic.labourPrep',
  postpartum: 'learn.topic.postpartum',
  contraception: 'learn.topic.contraception',
};

interface LearnPageProps {
  initialTopic?: LearningTopic['slug'];
  user?: DemoUser | null;
  onNavigate: (path: AppRoute) => void;
}

export function LearnPage({ initialTopic = 'all', user = null, onNavigate }: LearnPageProps) {
  const { articles } = useSharedContent();
  const { t } = useLanguage();
  const [selectedTopic, setSelectedTopic] = useState<LearningTopic['slug']>(initialTopic);
  const [largeText, setLargeText] = useState(false);

  useEffect(() => {
    setSelectedTopic(initialTopic);
  }, [initialTopic]);

  const visibleArticles = useMemo(
    () =>
      selectedTopic === 'all'
        ? articles
        : articles.filter((a) => a.topic === selectedTopic),
    [articles, selectedTopic]
  );

  // Build flat string array for visible articles + defect example captions + micro labels
  const batchInfo = useMemo(() => {
    const texts: string[] = [
      'Reviewed Content',
      'Educational guide only',
      'Author',
      'Example Pictures of Preventable Baby Defects:',
      'New from Doctor / Midwife',
    ];
    const artSlices: Array<{
      titleIdx: number;
      summaryIdx: number;
      captionIdx: number;
      bodyStartIdx: number;
      bodyLen: number;
    }> = [];

    visibleArticles.forEach((art) => {
      const titleIdx = texts.length;
      texts.push(art.title);
      const summaryIdx = texts.length;
      texts.push(art.summary);
      const captionIdx = texts.length;
      texts.push(art.imageCaption);
      const bodyStartIdx = texts.length;
      art.body.forEach((line) => texts.push(line));
      artSlices.push({
        titleIdx,
        summaryIdx,
        captionIdx,
        bodyStartIdx,
        bodyLen: art.body.length,
      });
    });

    const defectStartIdx = texts.length;
    PREVENTABLE_DEFECT_EXAMPLES.forEach((d) => texts.push(d.defectExample));

    return { texts, artSlices, defectStartIdx };
  }, [visibleArticles]);

  const { translated, translating } = useTranslatedTexts(batchInfo.texts);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="pink-hero-panel p-6 sm:p-8 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9d174d] m-0">
              {t('learn.eyebrow')}
            </p>
            {translating && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-0.5 text-[11px] font-semibold text-[#be185d] border border-[#f4b6d0]">
                <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                {t('lang.translating')}
              </span>
            )}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#3f0d24] m-0">
            {t('learn.title')}
          </h1>
          <p className="text-sm text-[#5c223d] m-0">{t('learn.subtitle')}</p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setLargeText((v) => !v)}
            className="pink-btn-secondary text-xs"
          >
            {largeText ? t('learn.standardText') : t('learn.largerText')}
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/advisor')}
            className="pink-btn-primary text-xs"
          >
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            {t('learn.askAiBtn')}
          </button>
        </div>
      </div>

      {/* Topic Filter Bar */}
      <div
        role="tablist"
        aria-label="Learning topics"
        className="flex flex-wrap gap-1.5 rounded-2xl border border-[#f4b6d0] bg-[#ffeef5] p-2"
      >
        {LEARNING_TOPICS.map((topic) => {
          const active = selectedTopic === topic.slug;
          return (
            <button
              key={topic.slug}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelectedTopic(topic.slug)}
              className={`min-h-[36px] rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                active
                  ? 'bg-[#be185d] text-white shadow-sm'
                  : 'text-[#5c223d] hover:bg-white hover:text-[#3f0d24]'
              }`}
            >
              {t(TOPIC_TRANSLATION_KEY[topic.slug])}
            </button>
          );
        })}
      </div>

      {/* Verified Visual Articles Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {visibleArticles.map((art, artIdx) => {
          const slice = batchInfo.artSlices[artIdx];
          const artTitle = translated[slice.titleIdx] || art.title;
          const artSummary = translated[slice.summaryIdx] || art.summary;
          const artCaption = translated[slice.captionIdx] || art.imageCaption;

          return (
            <article key={art.id} className="pink-card overflow-hidden flex flex-col h-full">
              <figure className="m-0 border-b border-[#f4b6d0] bg-[#ffe4ef] flex flex-col">
                <img
                  src={art.image}
                  alt={art.imageAlt}
                  referrerPolicy="no-referrer"
                  className={`w-full h-56 ${
                    art.image === IMAGES.babyPositions ? 'object-contain bg-white p-2' : 'object-cover'
                  }`}
                />
                <figcaption className="px-4 py-2 text-[11px] text-center text-[#7e405c] bg-[#fff7fa] border-t border-[#ffd6e7]">
                  {artCaption}
                </figcaption>
              </figure>

              <div className="p-5 flex flex-col gap-4 flex-1">

              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-[#be185d]">
                    {t(TOPIC_TRANSLATION_KEY[art.topic])}
                  </span>
                  {art.isClinicianPublished ? (
                    <span className="rounded-md bg-[#be185d] px-2 py-0.5 text-[10px] font-bold text-white">
                      {translated[4] || 'New from Doctor / Midwife'} · {art.publishedAt || 'Published'}
                    </span>
                  ) : (
                    <span className="text-[#7e405c]">{translated[0] || 'Reviewed Content'}</span>
                  )}
                </div>
                <h2 className="font-display text-xl font-semibold text-[#3f0d24] m-0">
                  {artTitle}
                </h2>
                <p className={`${largeText ? 'text-base' : 'text-sm'} text-[#5c223d] leading-relaxed`}>
                  {artSummary}
                </p>
                <ul className={`space-y-1.5 ${largeText ? 'text-base' : 'text-xs'} text-[#3f0d24]`}>
                  {art.body.map((line, i) => (
                    <li key={i}>• {translated[slice.bodyStartIdx + i] || line}</li>
                  ))}
                </ul>

                {art.id === 'art-defects-prevention' && (
                  <div className="pt-2 space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#be185d] m-0">
                      {translated[3] || 'Example Pictures of Preventable Baby Defects:'}
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {PREVENTABLE_DEFECT_EXAMPLES.map((defect, dIdx) => (
                        <figure
                          key={defect.id}
                          className="m-0 rounded-xl border border-[#ea91b8] bg-[#fff7fa] overflow-hidden"
                        >
                          <img
                            src={defect.image}
                            alt={defect.imageAlt}
                            referrerPolicy="no-referrer"
                            className="w-full aspect-[4/3] object-cover border-b border-[#f4b6d0]"
                          />
                          <figcaption className="p-2 text-[11px] font-semibold text-[#3f0d24] leading-snug">
                            {translated[batchInfo.defectStartIdx + dIdx] || defect.defectExample}
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <ArticleCommentsBox
                articleId={art.id}
                articleTitle={artTitle}
                user={user}
                defaultOpen={Boolean(art.isClinicianPublished)}
              />

              <div className="mt-auto pt-3 border-t border-[#f4b6d0] text-xs text-[#7e405c] flex flex-wrap items-center justify-between gap-2">
                <span>
                  {translated[2] || 'Author'}: <strong>{art.authorName}</strong> · {art.authorProfession}
                </span>
                <span className="text-[#9d174d] font-medium">
                  {translated[1] || 'Educational guide only'}
                </span>
              </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Contextual Interactive Modules Inside Learn Topics */}
      {(selectedTopic === 'all' || selectedTopic === 'general') && (
        <div className="pink-card overflow-hidden">
          <SupplementAlarmSection />
        </div>
      )}
      {(selectedTopic === 'all' ||
        selectedTopic === 'blood-rh-hiv' ||
        selectedTopic === 'unplanned-support') && (
        <div className="pink-card overflow-hidden">
          <MaternalProtectionSection />
        </div>
      )}
      {(selectedTopic === 'all' || selectedTopic === 'labour-prep') && (
        <div className="pink-card overflow-hidden">
          <LaborBagSection />
        </div>
      )}
      {(selectedTopic === 'all' ||
        selectedTopic === 'postpartum' ||
        selectedTopic === 'contraception') && (
        <div className="pink-card overflow-hidden">
          <PostpartumSection
            initialTab={selectedTopic === 'contraception' ? 'contraception' : 'lochia'}
          />
        </div>
      )}
      {(selectedTopic === 'all' || selectedTopic === 'exercises') && (
        <div className="pink-card overflow-hidden">
          <SafeExercisesSection />
        </div>
      )}
      {(selectedTopic === 'all' || selectedTopic === 'teen-support') && (
        <div className="pink-card overflow-hidden">
          <TeenSupportSection />
        </div>
      )}
    </div>
  );
}

export function EmergencyPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');

  const emergencyTexts = useMemo(() => {
    const arr: string[] = [];
    DANGER_SIGNS.forEach((s) => {
      arr.push(s.title, s.detail);
    });
    SA_PROVINCES.forEach((p) => {
      arr.push(p.note);
    });
    return arr;
  }, []);

  const { translated, translating } = useTranslatedTexts(emergencyTexts);
  const provOffset = DANGER_SIGNS.length * 2;

  const translatedProvinces = useMemo(
    () =>
      SA_PROVINCES.map((p, idx) => ({
        ...p,
        translatedNote: translated[provOffset + idx] || p.note,
      })),
    [translated, provOffset]
  );

  const filteredProvinces = translatedProvinces.filter(
    (p) =>
      p.province.toLowerCase().includes(search.toLowerCase()) ||
      p.translatedNote.toLowerCase().includes(search.toLowerCase()) ||
      p.note.toLowerCase().includes(search.toLowerCase())
  );

  const iconFor = (id: string) => {
    switch (id) {
      case 'bleeding':
        return Droplets;
      case 'headache-vision':
        return Eye;
      case 'swelling':
        return Hand;
      case 'abdominal-pain':
        return Activity;
      case 'fever':
        return Thermometer;
      case 'waters':
        return Waves;
      case 'movements':
        return Heart;
      default:
        return AlertTriangle;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="rounded-2xl bg-[#ffe0e9] border-2 border-[#e11d48] p-6 sm:p-8 grid gap-6 lg:grid-cols-12 items-center">
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-2">
            <div className="inline-flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9f1239]">
              <ShieldAlert className="w-4 h-4" aria-hidden="true" />
              <span>{t('emerg.eyebrow')}</span>
              {translating && (
                <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-[#be185d]">
                  <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                  {t('lang.translating')}
                </span>
              )}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#881337] m-0">
              {t('emerg.title')}
            </h1>
            <p className="text-sm sm:text-base text-[#3f0d24] m-0">{t('emerg.subtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="tel:10177" className="pink-btn-urgent !min-h-[48px] tabular-nums">
              <PhoneCall className="w-4 h-4" aria-hidden="true" />
              {t('emerg.call10177')}
            </a>
            <a href="tel:112" className="pink-btn-urgent !min-h-[48px] tabular-nums">
              <PhoneCall className="w-4 h-4" aria-hidden="true" />
              {t('emerg.call112')}
            </a>
          </div>
        </div>
        <div className="lg:col-span-5">
          <img
            src={IMAGES.clinicMidwife}
            alt="Registered South African clinic midwife ready to assist an expectant mother"
            referrerPolicy="no-referrer"
            className="w-full aspect-[4/3] object-cover rounded-2xl border-2 border-[#e11d48]/35 bg-white"
          />
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold text-[#3f0d24] m-0">
          {t('emerg.signsTitle')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {DANGER_SIGNS.map((sign, idx) => {
            const Icon = iconFor(sign.id);
            return (
              <div
                key={sign.id}
                className="pink-card p-5 border-[#e11d48]/50 flex items-start gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-[#be123c] text-white grid place-items-center shrink-0">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#9f1239]">
                    {t('emerg.urgentBadge')}
                  </span>
                  <h3 className="font-display text-lg font-semibold text-[#3f0d24] m-0">
                    {translated[idx * 2] || sign.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5c223d] m-0 leading-relaxed">
                    {translated[idx * 2 + 1] || sign.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="pink-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#3f0d24] m-0">
              {t('emerg.clinicsTitle')}
            </h2>
            <p className="text-xs text-[#5c223d] mt-1 m-0">{t('emerg.clinicsSub')}</p>
          </div>
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-[#7e405c] absolute left-3 top-3" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('emerg.searchPlaceholder')}
              className="pink-input pl-9"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProvinces.map((prov) => (
            <div key={prov.province} className="pink-panel p-4 space-y-1">
              <strong className="block text-sm font-semibold text-[#3f0d24]">{prov.province}</strong>
              <p className="font-mono text-xs font-semibold text-[#be185d]">{prov.helpline}</p>
              <p className="text-xs text-[#5c223d] m-0">{prov.translatedNote}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  urgent?: boolean;
}

export function AdvisorPage({ onNavigate }: { onNavigate: (path: AppRoute) => void }) {
  const { language, languageInfo, t } = useLanguage();
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [responseCache, setResponseCache] = useState<Record<string, { text: string; urgent: boolean }>>({});

  const starters = useMemo(
    () => [
      t('advisor.starter1'),
      t('advisor.starter2'),
      t('advisor.starter3'),
      t('advisor.starter4'),
      t('advisor.starter5'),
    ],
    [t]
  );

  const handleAsk = async (textInput: string) => {
    const q = textInput.trim();
    if (q.length < 2 || loading) return;

    const activeLangCode = language;
    const activeLangObj = languageInfo;

    setErrorMsg('');
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: q,
    };
    const assistantId = `a-${Date.now() + 1}`;
    const cacheKey = `${activeLangCode}::${q.toLowerCase()}`;

    if (messages.length === 0 && responseCache[cacheKey]) {
      const cached = responseCache[cacheKey];
      setMessages([
        userMsg,
        { id: assistantId, role: 'assistant', text: cached.text, urgent: cached.urgent },
      ]);
      setQuestion('');
      return;
    }

    const priorHistory = messages.slice(-4).map((m) => ({ role: m.role, text: m.text }));

    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: 'assistant', text: '', urgent: false }]);
    setQuestion('');
    setLoading(true);

    let streamedText = '';
    let streamedUrgent = false;

    try {
      const res = await fetch('/api/advisor/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          history: priorHistory,
          language: activeLangCode,
          languageName: activeLangObj.nativeName,
        }),
      });

      if (!res.ok || !res.body) {
        if (res.status === 400 || res.status === 503) {
          const errData = (await res.json().catch(() => ({}))) as { error?: string };
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
          setErrorMsg(errData.error || 'Could not reach the PregMamas AI Advisor right now.');
          setLoading(false);
          return;
        }
        // Fast JSON fallback
        const fallback = await fetch('/api/advisor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: q,
            history: priorHistory,
            language: activeLangCode,
            languageName: activeLangObj.nativeName,
          }),
        });
        const data = (await fallback.json()) as { answer?: string; urgent?: boolean; error?: string };
        if (!fallback.ok || !data.answer) {
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
          setErrorMsg(data.error || 'Could not reach the PregMamas AI Advisor right now.');
        } else {
          const isUrg = Boolean(data.urgent);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, text: data.answer!, urgent: isUrg } : m
            )
          );
          if (priorHistory.length === 0) {
            setResponseCache((prev) => ({ ...prev, [cacheKey]: { text: data.answer!, urgent: isUrg } }));
          }
        }
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let streamError = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const ev of events) {
          const line = ev.trim();
          if (!line.startsWith('data:')) continue;
          try {
            const payload = JSON.parse(line.slice(5).trim()) as {
              meta?: boolean;
              urgent?: boolean;
              text?: string;
              error?: string;
              done?: boolean;
            };
            if (payload.meta && payload.urgent) {
              streamedUrgent = true;
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, urgent: true } : m))
              );
            }
            if (payload.text) {
              streamedText += payload.text;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, text: m.text + payload.text } : m
                )
              );
            }
            if (payload.error) {
              streamError = payload.error;
            }
          } catch {
            // skip partial frame
          }
        }
      }

      if (streamError) {
        setErrorMsg(streamError);
        setMessages((prev) =>
          prev.filter((m) => m.id !== assistantId || m.text.trim().length > 0)
        );
      } else if (streamedText.trim() && priorHistory.length === 0) {
        setResponseCache((prev) => ({
          ...prev,
          [cacheKey]: { text: streamedText.trim(), urgent: streamedUrgent },
        }));
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== assistantId || m.text.trim().length > 0));
      setErrorMsg('Network issue reaching the PregMamas AI Advisor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="pink-hero-panel p-6 sm:p-8 grid gap-6 md:grid-cols-12 items-center">
        <div className="md:col-span-7 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#9d174d] m-0">
            {t('advisor.eyebrow')}
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#3f0d24] m-0">
            {t('advisor.title')}
          </h1>
          <p className="text-xs sm:text-sm text-[#5c223d] m-0 leading-relaxed">
            {t('advisor.subtitle')}
          </p>
        </div>
        <div className="md:col-span-5">
          <img
            src={IMAGES.navAiAdvisor}
            alt="Smiling expectant mother reading warm maternity educational guidance on her phone"
            referrerPolicy="no-referrer"
            className="w-full aspect-[4/3] object-cover rounded-2xl border-2 border-[#ea91b8]"
          />
        </div>
      </div>

      {/* Live Conversation Messages */}
      {messages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#be185d]">
              {t('advisor.convoTitle')} ({languageInfo.nativeName})
            </span>
            <button
              type="button"
              onClick={() => {
                setMessages([]);
                setErrorMsg('');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9d174d] hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              {t('advisor.newTopic')}
            </button>
          </div>

          <div className="space-y-3">
            {messages.map((msg, idx) => {
              const isStreamingThis =
                loading && msg.role === 'assistant' && idx === messages.length - 1;
              return (
                <div
                  key={msg.id}
                  className={`rounded-2xl p-5 space-y-2.5 ${
                    msg.role === 'user'
                      ? 'bg-[#ffe4ef] border border-[#ea91b8] ml-0 sm:ml-12'
                      : msg.urgent
                        ? 'bg-[#ffe0e9] border-2 border-[#e11d48] mr-0 sm:mr-8'
                        : 'pink-card mr-0 sm:mr-8'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#be185d]">
                      {msg.role === 'user' ? t('advisor.youAsked') : t('advisor.aiLabel')}
                    </span>
                    {msg.urgent && (
                      <span className="text-[11px] font-bold uppercase text-[#be123c]">
                        {t('advisor.urgentWarning')}
                      </span>
                    )}
                  </div>
                  {isStreamingThis && !msg.text ? (
                    <div className="flex items-center gap-2.5 text-sm text-[#9d174d]">
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
                      <span>{t('advisor.replyingFast')}</span>
                    </div>
                  ) : (
                    <div className="text-sm text-[#3f0d24] leading-relaxed whitespace-pre-line">
                      {msg.text}
                    </div>
                  )}
                  {msg.urgent && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-[#e11d48]/25">
                      <a href="tel:10177" className="pink-btn-urgent !min-h-[38px] text-xs">
                        <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
                        {t('advisor.call10177')}
                      </a>
                      <a href="tel:112" className="pink-btn-urgent !min-h-[38px] text-xs">
                        <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
                        {t('advisor.call112')}
                      </a>
                      <button
                        type="button"
                        onClick={() => onNavigate('/emergency')}
                        className="pink-btn-secondary !min-h-[38px] text-xs"
                      >
                        {t('advisor.openDangerGuide')}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ask Form */}
      <div className="pink-card p-6 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleAsk(question);
          }}
          className="space-y-3"
        >
          <label htmlFor="ai-q" className="block text-xs font-semibold text-[#3f0d24]">
            {t('advisor.askLabel')} ({languageInfo.nativeName})
          </label>
          <textarea
            id="ai-q"
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void handleAsk(question);
              }
            }}
            placeholder={t('advisor.placeholder')}
            className="pink-input"
          />
          {errorMsg && (
            <p className="text-xs font-semibold text-[#be123c] m-0" role="alert">
              {errorMsg}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-[#7e405c]">{t('advisor.disclaimer')}</span>
            <button
              type="submit"
              disabled={loading || question.trim().length < 2}
              className="pink-btn-primary disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  {t('advisor.replyingBtn')}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" aria-hidden="true" />
                  {t('advisor.askBtn')}
                </>
              )}
            </button>
          </div>
        </form>

        <div className="pt-3 border-t border-[#f4b6d0] space-y-2">
          <span className="block text-xs font-semibold text-[#7e405c]">
            {t('advisor.popularTitle')}
          </span>
          <div className="flex flex-wrap gap-2">
            {starters.map((s) => (
              <button
                key={s}
                type="button"
                disabled={loading}
                onClick={() => void handleAsk(s)}
                className="text-left text-xs rounded-xl border border-[#ea91b8] bg-[#fff7fa] px-3 py-2 text-[#5c223d] hover:bg-[#ffe4ef] cursor-pointer disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const PRIVACY_RULES = [
  {
    title: 'Consent & Withdrawal',
    body: 'Partner education is strictly opt-in and can be withdrawn with one click at any time without affecting your care tools.',
  },
  {
    title: 'Private Health Logs Protection',
    body: 'Mood check-ins, weight logs, supplement schedules, and personal clinic questions remain private on your device.',
  },
  {
    title: 'Clinical Content Review',
    body: 'Healthcare professionals submit educational articles and administrators verify clinic registration before content is published.',
  },
  {
    title: 'Educational Boundaries',
    body: 'PregMamas supports mothers and families with clear guides and does not diagnose, prescribe, or replace midwives or clinic visits.',
  },
];

const PRIVACY_TEXTS = [
  'Section 8 — Safety, Privacy & Responsible Use',
  'How PregMamas Protects Mothers & Families',
  'Clear rules governing consent, data privacy, medical disclaimers, and clinical content review.',
  'South African Clinical Guideline Reference',
  'South African National Department of Health, National Integrated Maternal and Perinatal Care Guidelines for South Africa (2024). Qualified healthcare reviewers consult these national clinical guidelines when preparing and checking educational health content.',
  ...PRIVACY_RULES.flatMap((r) => [r.title, r.body]),
];

export function PrivacyPage() {
  const { translated } = useTranslatedTexts(PRIVACY_TEXTS);
  const tr = (idx: number, fallback: string) => translated[idx] || fallback;
  const rulesOffset = 5;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="pink-hero-panel p-6 sm:p-8 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#9d174d] m-0">
          {tr(0, 'Section 8 — Safety, Privacy & Responsible Use')}
        </p>
        <h1 className="font-display text-3xl font-semibold text-[#3f0d24] m-0">
          {tr(1, 'How PregMamas Protects Mothers & Families')}
        </h1>
        <p className="text-sm text-[#5c223d] m-0">
          {tr(2, 'Clear rules governing consent, data privacy, medical disclaimers, and clinical content review.')}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {PRIVACY_RULES.map((r, idx) => (
          <div key={r.title} className="pink-card p-5 space-y-1.5">
            <h2 className="font-display text-lg font-semibold text-[#3f0d24] flex items-center gap-2 m-0">
              <ShieldCheck className="w-4 h-4 text-[#be185d]" aria-hidden="true" />
              {tr(rulesOffset + idx * 2, r.title)}
            </h2>
            <p className="text-sm text-[#5c223d] m-0 leading-relaxed">
              {tr(rulesOffset + idx * 2 + 1, r.body)}
            </p>
          </div>
        ))}
      </div>

      <div className="pink-panel p-6 space-y-2">
        <h2 className="font-display text-lg font-semibold text-[#3f0d24] m-0">
          {tr(3, 'South African Clinical Guideline Reference')}
        </h2>
        <p className="text-sm text-[#5c223d] m-0">
          {tr(
            4,
            'South African National Department of Health, National Integrated Maternal and Perinatal Care Guidelines for South Africa (2024). Qualified healthcare reviewers consult these national clinical guidelines when preparing and checking educational health content.'
          )}
        </p>
      </div>
    </div>
  );
}
