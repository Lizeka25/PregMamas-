import { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Droplets,
  Eye,
  Hand,
  Heart,
  Loader2,
  Mail,
  MessageCircle,
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
import { useSharedContent } from '../context/SharedContentContext';
import { ArticleCommentsBox } from '../components/ArticleCommentsBox';
import { SupplementAlarmSection } from '../components/SupplementAlarmSection';
import { SafeExercisesSection } from '../components/SafeExercisesSection';
import { TeenSupportSection } from '../components/TeenSupportSection';
import { PostpartumSection } from '../components/PostpartumSection';
import { LaborBagSection } from '../components/LaborBagSection';
import { MaternalProtectionSection } from '../components/MaternalProtectionSection';

interface LearnPageProps {
  initialTopic?: LearningTopic['slug'];
  user?: DemoUser | null;
  onNavigate: (path: AppRoute) => void;
}

export function LearnPage({ initialTopic = 'all', user = null, onNavigate }: LearnPageProps) {
  const { articles } = useSharedContent();
  const [selectedTopic, setSelectedTopic] = useState<LearningTopic['slug']>(initialTopic);
  const [largeText, setLargeText] = useState(false);

  useEffect(() => {
    setSelectedTopic(initialTopic);
  }, [initialTopic]);

  const visibleArticles =
    selectedTopic === 'all'
      ? articles
      : articles.filter((a) => a.topic === selectedTopic);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="pink-hero-panel p-6 sm:p-8 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#9d174d] m-0">
            Step 3 — Verified Maternal Health Learning
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#3f0d24] m-0">
            Learn & Prepare: All 9 Maternal Topics
          </h1>
          <p className="text-sm text-[#5c223d] m-0">
            Clear visual guides with pictures across every stage of pregnancy, teen support, labour preparation, safe exercises, and postpartum healing.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setLargeText((v) => !v)}
            className="pink-btn-secondary text-xs"
          >
            {largeText ? 'Use Standard Text Size' : 'Use Larger Reading Text'}
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/advisor')}
            className="pink-btn-primary text-xs"
          >
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            Ask AI Educational Helper
          </button>
        </div>
      </div>

      {/* 9 Topic Filter Tabs */}
      <div role="tablist" aria-label="Learning topics" className="flex flex-wrap gap-2">
        {LEARNING_TOPICS.map((topic) => {
          const active = selectedTopic === topic.slug;
          return (
            <button
              key={topic.slug}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelectedTopic(topic.slug)}
              className={`min-h-[38px] rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                active
                  ? 'bg-[#be185d] text-white border-[#be185d]'
                  : 'bg-[#fff7fa] text-[#5c223d] border-[#ea91b8] hover:bg-[#ffe4ef]'
              }`}
            >
              {topic.label}
            </button>
          );
        })}
      </div>

      {/* Verified Visual Articles Grid — Pictures on EVERY topic */}
      <div className="grid gap-6 md:grid-cols-2">
        {visibleArticles.map((art) => (
          <article key={art.id} className="pink-card p-5 flex flex-col gap-4">
            <figure className="m-0 rounded-xl border border-[#f4b6d0] bg-[#fff7fa] p-2.5 space-y-1.5">
              <img
                src={art.image}
                alt={art.imageAlt}
                referrerPolicy="no-referrer"
                className={`w-full h-56 rounded-lg ${
                  art.image === IMAGES.babyPositions ? 'object-contain bg-white' : 'object-cover'
                }`}
              />
              <figcaption className="text-[11px] text-center text-[#7e405c]">
                {art.imageCaption}
              </figcaption>
            </figure>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-[#be185d]">
                  {LEARNING_TOPICS.find((t) => t.slug === art.topic)?.label}
                </span>
                {art.isClinicianPublished ? (
                  <span className="rounded-md bg-[#be185d] px-2 py-0.5 text-[10px] font-bold text-white">
                    New from Doctor / Midwife · {art.publishedAt || 'Published'}
                  </span>
                ) : (
                  <span className="text-[#7e405c]">Reviewed Content</span>
                )}
              </div>
              <h2 className="font-display text-xl font-semibold text-[#3f0d24] m-0">
                {art.title}
              </h2>
              <p className={`${largeText ? 'text-base' : 'text-sm'} text-[#5c223d] leading-relaxed`}>
                {art.summary}
              </p>
              <ul className={`space-y-1.5 ${largeText ? 'text-base' : 'text-xs'} text-[#3f0d24]`}>
                {art.body.map((line, i) => (
                  <li key={i}>• {line}</li>
                ))}
              </ul>

              {art.id === 'art-defects-prevention' && (
                <div className="pt-2 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#be185d] m-0">
                    Example Pictures of Preventable Baby Defects:
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {PREVENTABLE_DEFECT_EXAMPLES.map((defect) => (
                      <figure
                        key={defect.id}
                        className="m-0 rounded-xl border border-[#ea91b8] bg-[#fff7fa] overflow-hidden"
                      >
                        <img
                          src={defect.image}
                          alt={defect.imageAlt}
                          referrerPolicy="no-referrer"
                          className="w-full aspect-[4/3] object-contain bg-white border-b border-[#f4b6d0]"
                        />
                        <figcaption className="p-2 text-[11px] font-semibold text-[#3f0d24] leading-snug">
                          {defect.defectExample}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <ArticleCommentsBox
              articleId={art.id}
              articleTitle={art.title}
              user={user}
              defaultOpen={Boolean(art.isClinicianPublished)}
            />

            <div className="mt-auto pt-3 border-t border-[#f4b6d0] text-xs text-[#7e405c] flex flex-wrap items-center justify-between gap-2">
              <span>
                Author: <strong>{art.authorName}</strong> · {art.authorProfession}
              </span>
              <span className="text-[#9d174d] font-medium">Educational guide only</span>
            </div>
          </article>
        ))}
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
  const [search, setSearch] = useState('');
  const filteredProvinces = SA_PROVINCES.filter(
    (p) =>
      p.province.toLowerCase().includes(search.toLowerCase()) ||
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
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9f1239]">
              <ShieldAlert className="w-4 h-4" aria-hidden="true" />
              <span>Step 5 — Urgent Medical Safety</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#881337] m-0">
              Emergency Warning Signs & Immediate Care
            </h1>
            <p className="text-sm sm:text-base text-[#3f0d24] m-0">
              If you notice any of the warning signs below during pregnancy or in the weeks after birth,{' '}
              <strong>do not wait for an AI answer or online post</strong>. Go immediately to your nearest clinic, Midwife Obstetric Unit (MOU), or hospital emergency unit.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="tel:10177" className="pink-btn-urgent !min-h-[48px] tabular-nums">
              <PhoneCall className="w-4 h-4" aria-hidden="true" />
              Call 10177 (SA Ambulance)
            </a>
            <a href="tel:112" className="pink-btn-urgent !min-h-[48px] tabular-nums">
              <PhoneCall className="w-4 h-4" aria-hidden="true" />
              Call 112 (Cell Emergency)
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
          Recognise These Warning Signs (Icon + Written Label)
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {DANGER_SIGNS.map((sign) => {
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
                    Urgent Warning Sign — Seek Immediate Care
                  </span>
                  <h3 className="font-display text-lg font-semibold text-[#3f0d24] m-0">
                    {sign.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5c223d] m-0 leading-relaxed">
                    {sign.detail}
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
              South African Provincial Clinic & Hospital Directories
            </h2>
            <p className="text-xs text-[#5c223d] mt-1 m-0">
              Find public primary healthcare clinics, Midwife Obstetric Units (MOUs), and provincial health helplines.
            </p>
          </div>
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-[#7e405c] absolute left-3 top-3" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by province..."
              className="pink-input pl-9"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProvinces.map((prov) => (
            <div key={prov.province} className="pink-panel p-4 space-y-1">
              <strong className="block text-sm font-semibold text-[#3f0d24]">{prov.province}</strong>
              <p className="font-mono text-xs font-semibold text-[#be185d]">{prov.helpline}</p>
              <p className="text-xs text-[#5c223d] m-0">{prov.note}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const ADVISOR_STARTERS = [
  'What exact clothes should I pack in my hospital bag for Mom and Baby?',
  'I am a teenager and nervous about telling my family or going to the clinic.',
  'What is postpartum lochia and how do I care for a C-section scar?',
  'What gentle exercises can help with lower back ache in pregnancy?',
  'How do I encourage baby to move and track 10 kicks safely?',
];

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  urgent?: boolean;
}

export function AdvisorPage({ onNavigate }: { onNavigate: (path: AppRoute) => void }) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAsk = async (textInput: string) => {
    const q = textInput.trim();
    if (q.length < 2 || loading) return;

    setErrorMsg('');
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: q,
    };
    const assistantId = `a-${Date.now() + 1}`;
    const priorHistory = messages.slice(-4).map((m) => ({ role: m.role, text: m.text }));

    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: 'assistant', text: '', urgent: false }]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await fetch('/api/advisor/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, history: priorHistory }),
      });

      if (!res.ok || !res.body) {
        // Fast JSON fallback
        const fallback = await fetch('/api/advisor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: q, history: priorHistory }),
        });
        const data = (await fallback.json()) as { answer?: string; urgent?: boolean; error?: string };
        if (!fallback.ok || !data.answer) {
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
          setErrorMsg(data.error || 'Could not reach the PregMamas AI Advisor right now.');
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, text: data.answer!, urgent: Boolean(data.urgent) } : m
            )
          );
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
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, urgent: true } : m))
              );
            }
            if (payload.text) {
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
        <div className="md:col-span-7 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#9d174d] m-0">
            Educational AI Advisor · Powered by Gemini & Safety-Screened
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#3f0d24] m-0">
            PregMamas Educational Question Helper
          </h1>
          <p className="text-xs sm:text-sm text-[#5c223d] m-0 leading-relaxed">
            Ask any real question about pregnancy nutrition, supplement schedules, hospital bag clothes, teen support, baby movements, or postpartum healing. (Educational support only—if you notice danger signs, go straight to a clinic or call 10177 / 112.)
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
              Conversation with PregMamas Advisor
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
              New Topic
            </button>
          </div>

          <div className="space-y-3">
            {messages.map((msg) => (
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
                    {msg.role === 'user' ? 'You asked' : 'PregMamas AI Advisor'}
                  </span>
                  {msg.urgent && (
                    <span className="text-[11px] font-bold uppercase text-[#be123c]">
                      Urgent Symptom Warning
                    </span>
                  )}
                </div>
                <div className="text-sm text-[#3f0d24] leading-relaxed whitespace-pre-line">
                  {msg.text}
                </div>
                {msg.urgent && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[#e11d48]/25">
                    <a href="tel:10177" className="pink-btn-urgent !min-h-[38px] text-xs">
                      <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
                      Call 10177
                    </a>
                    <a href="tel:112" className="pink-btn-urgent !min-h-[38px] text-xs">
                      <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
                      Call 112
                    </a>
                    <button
                      type="button"
                      onClick={() => onNavigate('/emergency')}
                      className="pink-btn-secondary !min-h-[38px] text-xs"
                    >
                      Open Danger Signs Guide
                    </button>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="pink-card p-5 mr-0 sm:mr-8 flex items-center gap-3 text-sm text-[#9d174d]">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
                <span>Preparing a clear, helpful educational answer...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ask Form */}
      <div className="pink-card p-6 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(question);
          }}
          className="space-y-3"
        >
          <label htmlFor="ai-q" className="block text-xs font-semibold text-[#3f0d24]">
            Ask your question below
          </label>
          <textarea
            id="ai-q"
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Example: What happens at a first antenatal clinic visit in South Africa, or what should I eat with iron tablets?"
            className="pink-input"
          />
          {errorMsg && (
            <p className="text-xs font-semibold text-[#be123c] m-0" role="alert">
              {errorMsg}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-[#7e405c]">
              Educational responses only · Always confirm personal care with a nurse or midwife.
            </span>
            <button
              type="submit"
              disabled={loading || question.trim().length < 2}
              className="pink-btn-primary disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  Thinking...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" aria-hidden="true" />
                  Ask AI Advisor
                </>
              )}
            </button>
          </div>
        </form>

        <div className="pt-3 border-t border-[#f4b6d0] space-y-2">
          <span className="block text-xs font-semibold text-[#7e405c]">
            Popular questions to try right now:
          </span>
          <div className="flex flex-wrap gap-2">
            {ADVISOR_STARTERS.map((s) => (
              <button
                key={s}
                type="button"
                disabled={loading}
                onClick={() => handleAsk(s)}
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

const PARTNER_TEMPLATES = [
  {
    id: 'daily-care',
    label: 'Daily Vitamins & Chores',
    subject: 'PregMamas Encouragement: Take Good Care of Your Partner Today',
    buildText: (partner: string) =>
      `Hello ${partner}, this is a warm PregMamas reminder to care lovingly for your woman today: bring her a cool glass of water for her daily prenatal vitamins, carry heavy groceries, water buckets, and laundry so she can rest, and speak gently with patience and support.`,
  },
  {
    id: 'antenatal-early',
    label: 'Antenatal Visit Early Arrival',
    subject: 'PregMamas Reminder: Arrive Early for Her Antenatal Clinic Visit',
    buildText: (partner: string) =>
      `Hello ${partner}, please encourage and support your woman ahead of her antenatal checkup: help arrange reliable transport and wake up early so you arrive at least 30 minutes before the clinic opens with her Road to Health booklet, ID, water, and a light snack.`,
  },
  {
    id: 'labour-readiness',
    label: 'Labour Hygiene & Hospital Bag',
    subject: 'PregMamas Reminder: Preparing Together Safely for Birth',
    buildText: (partner: string) =>
      `Hello ${partner}, as birth gets closer, show your woman extra love and care: help check that her Mom & Baby hospital clothes and personal hygiene necessities are packed, keep your phone charged day and night, and keep 10177 / 112 and clinic transport ready.`,
  },
  {
    id: 'kindness-check',
    label: 'Emotional Love & Rest',
    subject: 'PregMamas Note: Check In With Kindness & Help Her Rest',
    buildText: (partner: string) =>
      `Hello ${partner}, pregnancy takes huge physical and emotional strength. Take 10 quiet minutes tonight to ask how she is feeling, make her a warm cup of tea or healthy meal, rub her tired feet or back, and remind her she is not alone.`,
  },
];

function formatWhatsappDigitsClient(raw: string): string {
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return '';
  if (digits.startsWith('0') && digits.length === 10) return `27${digits.slice(1)}`;
  return digits;
}

export function PartnersPage() {
  const [enabled, setEnabled] = useState(
    () => localStorage.getItem('pregmamas_partner_consent_v1') === 'true'
  );
  const [partnerName, setPartnerName] = useState(
    () => localStorage.getItem('pregmamas_partner_name_v1') || 'Trusted Partner'
  );
  const [whatsappPhone, setWhatsappPhone] = useState(
    () => localStorage.getItem('pregmamas_partner_whatsapp_v1') || ''
  );
  const [partnerEmail, setPartnerEmail] = useState(
    () => localStorage.getItem('pregmamas_partner_email_v1') || ''
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState(PARTNER_TEMPLATES[0].id);
  const [customMessage, setCustomMessage] = useState(() =>
    PARTNER_TEMPLATES[0].buildText(
      localStorage.getItem('pregmamas_partner_name_v1') || 'Trusted Partner'
    )
  );
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [capabilities, setCapabilities] = useState<{
    emailServerConfigured: boolean;
    emailProvider: string;
    whatsappServerConfigured: boolean;
    whatsappProvider: string;
  } | null>(null);
  const [dispatchLog, setDispatchLog] = useState<
    Array<{
      id: string;
      partnerName: string;
      email?: string;
      whatsappPhone?: string;
      emailStatus: string;
      whatsappStatus: string;
      sentAt: string;
      isAutoScheduled?: boolean;
    }>
  >([]);
  const [autoSchedule, setAutoSchedule] = useState<{
    enabled: boolean;
    intervalHours: number;
    rotateMessages: boolean;
    lastSentAtMs: number | null;
    nextSendAtMs: number | null;
    totalAutoSent: number;
    lastRunSummary: string;
  }>({
    enabled: false,
    intervalHours: 3,
    rotateMessages: true,
    lastSentAtMs: null,
    nextSendAtMs: null,
    totalAutoSent: 0,
    lastRunSummary: '',
  });
  const [rotateAutoMessages, setRotateAutoMessages] = useState(true);
  const [autoBusy, setAutoBusy] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [lastResult, setLastResult] = useState<{
    emailDetail?: string;
    emailSent?: boolean;
    whatsappDetail?: string;
    whatsappSent?: boolean;
    whatsappUrl?: string | null;
    mailtoUrl?: string | null;
  } | null>(null);

  const syncCapabilitiesFromServer = () => {
    fetch('/api/partners/capabilities')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setCapabilities(data);
          if (Array.isArray(data.dispatches)) {
            setDispatchLog(data.dispatches);
          }
          if (data.autoSchedule) {
            setAutoSchedule(data.autoSchedule);
            setRotateAutoMessages(Boolean(data.autoSchedule.rotateMessages));
          }
        }
      })
      .catch(() => {
        // ignore
      });
  };

  useEffect(() => {
    syncCapabilitiesFromServer();
    const pollId = window.setInterval(syncCapabilitiesFromServer, 30000);
    return () => window.clearInterval(pollId);
  }, []);

  useEffect(() => {
    if (!autoSchedule.enabled) return;
    const tick = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(tick);
  }, [autoSchedule.enabled]);

  const formatCountdown = (targetMs: number | null): string => {
    if (!targetMs) return '03:00:00';
    const diffSec = Math.max(0, Math.floor((targetMs - nowMs) / 1000));
    const hrs = String(Math.floor(diffSec / 3600)).padStart(2, '0');
    const mins = String(Math.floor((diffSec % 3600) / 60)).padStart(2, '0');
    const secs = String(diffSec % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const persistPartnerDetails = (nextConsent: boolean) => {
    setEnabled(nextConsent);
    localStorage.setItem('pregmamas_partner_consent_v1', String(nextConsent));
    localStorage.setItem('pregmamas_partner_name_v1', partnerName);
    localStorage.setItem('pregmamas_partner_whatsapp_v1', whatsappPhone);
    localStorage.setItem('pregmamas_partner_email_v1', partnerEmail);

    if (!nextConsent && autoSchedule.enabled) {
      fetch('/api/partners/auto-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: false }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.autoSchedule) setAutoSchedule(data.autoSchedule);
        })
        .catch(() => {
          // ignore
        });
    }
  };

  const handleToggleAutoSchedule = async (nextEnabled: boolean, sendFirstNow = true) => {
    setSendError('');
    if (nextEnabled && !whatsappPhone.trim() && !partnerEmail.trim()) {
      setSendError('Please enter your partner’s WhatsApp number and/or email address before enabling automatic 3-hour messages.');
      return;
    }

    localStorage.setItem('pregmamas_partner_name_v1', partnerName);
    localStorage.setItem('pregmamas_partner_whatsapp_v1', whatsappPhone);
    localStorage.setItem('pregmamas_partner_email_v1', partnerEmail);

    setAutoBusy(true);
    try {
      const res = await fetch('/api/partners/auto-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: nextEnabled,
          partnerName: partnerName.trim() || 'Trusted Partner',
          whatsappPhone: whatsappPhone.trim(),
          partnerEmail: partnerEmail.trim(),
          subject: activeTemplate.subject,
          message: customMessage.trim(),
          rotateMessages: rotateAutoMessages,
          sendFirstNow,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSendError(data.error || 'Could not update 3-hour automatic schedule.');
        return;
      }
      if (data.autoSchedule) setAutoSchedule(data.autoSchedule);
      if (Array.isArray(data.dispatches)) setDispatchLog(data.dispatches);
      if (data.immediateResult) {
        setLastResult({
          emailDetail: data.immediateResult.emailResult?.attempted
            ? data.immediateResult.emailResult.detail
            : undefined,
          emailSent: Boolean(data.immediateResult.emailResult?.sent),
          whatsappDetail: data.immediateResult.whatsappResult?.attempted
            ? data.immediateResult.whatsappResult.detail
            : undefined,
          whatsappSent: Boolean(data.immediateResult.whatsappResult?.sent),
          whatsappUrl: data.immediateResult.whatsappUrl,
          mailtoUrl: data.immediateResult.mailtoUrl,
        });
      }
      setNowMs(Date.now());
    } catch {
      setSendError('Network error updating 3-hour automatic messaging.');
    } finally {
      setAutoBusy(false);
    }
  };

  const handleTriggerScheduledCycleNow = async () => {
    setSendError('');
    setAutoBusy(true);
    try {
      const res = await fetch('/api/partners/auto-schedule/trigger-now', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        setSendError(data.error || 'Could not run 3-hour cycle.');
        return;
      }
      if (data.autoSchedule) setAutoSchedule(data.autoSchedule);
      if (Array.isArray(data.dispatches)) setDispatchLog(data.dispatches);
      if (data.immediateResult) {
        setLastResult({
          emailDetail: data.immediateResult.emailResult?.attempted
            ? data.immediateResult.emailResult.detail
            : undefined,
          emailSent: Boolean(data.immediateResult.emailResult?.sent),
          whatsappDetail: data.immediateResult.whatsappResult?.attempted
            ? data.immediateResult.whatsappResult.detail
            : undefined,
          whatsappSent: Boolean(data.immediateResult.whatsappResult?.sent),
          whatsappUrl: data.immediateResult.whatsappUrl,
          mailtoUrl: data.immediateResult.mailtoUrl,
        });
      }
      setNowMs(Date.now());
    } catch {
      setSendError('Network error triggering 3-hour scheduled cycle.');
    } finally {
      setAutoBusy(false);
    }
  };

  const applyTemplate = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const found = PARTNER_TEMPLATES.find((t) => t.id === tplId) || PARTNER_TEMPLATES[0];
    setCustomMessage(found.buildText(partnerName.trim() || 'Trusted Partner'));
  };

  const activeTemplate =
    PARTNER_TEMPLATES.find((t) => t.id === selectedTemplateId) || PARTNER_TEMPLATES[0];

  const liveWhatsappDigits = formatWhatsappDigitsClient(whatsappPhone);
  const liveWhatsappUrl = liveWhatsappDigits
    ? `https://api.whatsapp.com/send?phone=${liveWhatsappDigits}&text=${encodeURIComponent(
        customMessage
      )}`
    : '';
  const liveMailtoUrl = partnerEmail.trim()
    ? `mailto:${encodeURIComponent(partnerEmail.trim())}?subject=${encodeURIComponent(
        activeTemplate.subject
      )}&body=${encodeURIComponent(customMessage)}`
    : '';

  const handleSendReal = async (opts: { sendWhatsapp: boolean; sendEmail: boolean }) => {
    setSendError('');
    if (!whatsappPhone.trim() && !partnerEmail.trim()) {
      setSendError('Please enter your partner’s WhatsApp number and/or email address.');
      return;
    }
    if (opts.sendWhatsapp && !liveWhatsappDigits) {
      setSendError('Please enter a valid partner WhatsApp mobile number.');
      return;
    }
    if (opts.sendEmail && !partnerEmail.trim()) {
      setSendError('Please enter a valid partner email address.');
      return;
    }

    localStorage.setItem('pregmamas_partner_name_v1', partnerName);
    localStorage.setItem('pregmamas_partner_whatsapp_v1', whatsappPhone);
    localStorage.setItem('pregmamas_partner_email_v1', partnerEmail);

    setSending(true);
    try {
      const res = await fetch('/api/partners/send-encouragement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerName: partnerName.trim() || 'Trusted Partner',
          whatsappPhone: whatsappPhone.trim(),
          partnerEmail: partnerEmail.trim(),
          subject: activeTemplate.subject,
          message: customMessage.trim(),
          sendWhatsapp: opts.sendWhatsapp,
          sendEmail: opts.sendEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSendError(data.error || 'Could not send message right now.');
        return;
      }
      setLastResult({
        emailDetail: data.emailResult?.attempted ? data.emailResult.detail : undefined,
        emailSent: Boolean(data.emailResult?.sent),
        whatsappDetail: data.whatsappResult?.attempted ? data.whatsappResult.detail : undefined,
        whatsappSent: Boolean(data.whatsappResult?.sent),
        whatsappUrl: data.whatsappUrl,
        mailtoUrl: data.mailtoUrl,
      });
      if (Array.isArray(data.dispatches)) {
        setDispatchLog(data.dispatches);
      }
    } catch {
      setSendError('Network error contacting server. You can still tap Send via WhatsApp or Email App directly below.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="pink-hero-panel p-6 sm:p-8 grid gap-6 md:grid-cols-12 items-center">
        <div className="md:col-span-7 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#9d174d] m-0">
            Step 6 — Real Partner WhatsApp &amp; Email Encouragement
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#3f0d24] m-0">
            Partner Care via Real WhatsApp &amp; Email
          </h1>
          <p className="text-sm text-[#5c223d] m-0">
            Send real WhatsApp and Email encouragement straight to your partner so they remember to support, respect, and take gentle care of their woman—without ever exposing private health logs.
          </p>
        </div>
        <div className="md:col-span-5">
          <img
            src={IMAGES.hero}
            alt="Mother resting peacefully by a sunlit window"
            referrerPolicy="no-referrer"
            className="w-full aspect-[4/3] object-cover rounded-2xl border border-[#ea91b8]"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5 space-y-6">
          <div className="pink-card p-6 space-y-4">
            <h2 className="font-display text-xl font-semibold text-[#3f0d24] m-0">
              How Partners &amp; Supporters Can Help Every Week
            </h2>
            <ul className="space-y-2.5 text-sm text-[#5c223d]">
              <li>
                <strong className="text-[#3f0d24]">Arrange transport early:</strong> Keep clinic transport fare or a driver confirmed day and night.
              </li>
              <li>
                <strong className="text-[#3f0d24]">Share household chores:</strong> Carry heavy water buckets, laundry, and cooking so the mother can rest.
              </li>
              <li>
                <strong className="text-[#3f0d24]">Arrive early for every antenatal clinic visit:</strong> Get to the clinic at least 30 minutes early together, help remember nurse advice, and support daily iron/folic acid supplement alarms.
              </li>
              <li>
                <strong className="text-[#3f0d24]">Prepare for birth together:</strong> Pack the hospital bag and memorise 10177 / 112 and clinic routes.
              </li>
              <li>
                <strong className="text-[#3f0d24]">Know danger signs:</strong> Never delay clinic care if bleeding, severe headache, swelling, or fever occurs.
              </li>
            </ul>
          </div>

          {dispatchLog.length > 0 && (
            <div className="pink-card p-5 space-y-3">
              <h3 className="font-display text-lg font-semibold text-[#3f0d24] m-0">
                Recent Partner Encouragements Sent
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {dispatchLog.map((d) => (
                  <div key={d.id} className="rounded-xl border border-[#ffd6e7] bg-white p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-[#3f0d24]">
                        {d.partnerName}
                        {d.isAutoScheduled ? ' · Auto 3h' : ''}
                      </strong>
                      <span className="font-mono text-[10px] text-[#7e405c]">{d.sentAt}</span>
                    </div>
                    <p className="text-[11px] text-[#be185d] m-0">
                      WhatsApp: {d.whatsappStatus} · Email: {d.emailStatus}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-7 pink-card p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl font-semibold text-[#3f0d24] m-0">
              Send Real WhatsApp &amp; Email to Partner
            </h2>
            <span className="text-xs font-bold text-[#be185d]">
              {enabled ? 'Consent Active' : 'Consent Off'}
            </span>
          </div>

          <div className="pink-panel p-3.5 text-xs text-[#3f0d24] space-y-1">
            <strong>Strict Privacy Rule</strong>
            <p className="m-0 text-[#5c223d]">
              Partner WhatsApp and email messages are sent <strong>only with the mother’s consent</strong> and NEVER include mood logs, weight, HIV status, clinic notes, or private community posts.
            </p>
          </div>

          {/* Partner Contact Details (Both WhatsApp & Email) */}
          <div className="space-y-3">
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="partner-name" className="block text-xs font-semibold text-[#3f0d24] mb-1">
                  Partner's Name
                </label>
                <input
                  id="partner-name"
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="e.g., Thabo"
                  className="pink-input"
                />
              </div>
              <div>
                <label htmlFor="partner-wa" className="block text-xs font-semibold text-[#3f0d24] mb-1">
                  Partner WhatsApp Number
                </label>
                <input
                  id="partner-wa"
                  type="tel"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  placeholder="e.g., 082 123 4567 or +27..."
                  className="pink-input font-mono"
                />
              </div>
              <div>
                <label htmlFor="partner-email" className="block text-xs font-semibold text-[#3f0d24] mb-1">
                  Partner Email Address
                </label>
                <input
                  id="partner-email"
                  type="email"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  placeholder="e.g., partner@email.com"
                  className="pink-input"
                />
              </div>
            </div>

            {!enabled ? (
              <button
                type="button"
                onClick={() => persistPartnerDetails(true)}
                className="pink-btn-primary w-full"
              >
                <Heart className="w-4 h-4" aria-hidden="true" />
                Enable Partner WhatsApp &amp; Email Encouragement
              </button>
            ) : (
              <div className="space-y-4 pt-1 border-t border-[#ffd6e7]">
                {/* Encouragement Message Picker */}
                <div className="space-y-2">
                  <span className="block text-xs font-bold uppercase tracking-wider text-[#9d174d]">
                    Choose an Encouragement Message (or Edit Below):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PARTNER_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => applyTemplate(tpl.id)}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                          selectedTemplateId === tpl.id
                            ? 'bg-[#be185d] text-white border-[#be185d]'
                            : 'bg-[#fff7fa] text-[#5c223d] border-[#ea91b8] hover:bg-[#ffe4ef]'
                        }`}
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="partner-msg" className="block text-xs font-semibold text-[#3f0d24] mb-1">
                    Encouraging Message to Send to {partnerName || 'Partner'}
                  </label>
                  <textarea
                    id="partner-msg"
                    rows={4}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="pink-input"
                  />
                </div>

                {capabilities && (
                  <div className="rounded-xl border border-[#f4b6d0] bg-[#fff7fa] px-3.5 py-2.5 text-[11px] text-[#5c223d] flex flex-wrap items-center justify-between gap-2">
                    <span>
                      WhatsApp: <strong>{capabilities.whatsappProvider}</strong>
                    </span>
                    <span>
                      Email: <strong>{capabilities.emailProvider}</strong>
                    </span>
                  </div>
                )}

                {sendError && (
                  <p className="text-xs font-semibold text-[#be123c] m-0" role="alert">
                    {sendError}
                  </p>
                )}

                {/* Automated Server Send + Direct Real App Links */}
                <div className="space-y-2.5">
                  <button
                    type="button"
                    disabled={sending}
                    onClick={() =>
                      void handleSendReal({
                        sendWhatsapp: Boolean(liveWhatsappDigits),
                        sendEmail: Boolean(partnerEmail.trim()),
                      })
                    }
                    className="pink-btn-primary w-full disabled:opacity-60"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        Sending WhatsApp &amp; Email...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" aria-hidden="true" />
                        Send Real WhatsApp &amp; Email Now
                      </>
                    )}
                  </button>

                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {liveWhatsappUrl ? (
                      <a
                        href={liveWhatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-[#db2777] bg-[#ffeef5] px-4 py-2 text-xs font-bold text-[#9d174d] hover:bg-[#ffe4ef] transition-colors text-center"
                      >
                        <MessageCircle className="w-4 h-4 text-[#be185d]" aria-hidden="true" />
                        Send Directly in WhatsApp App
                      </a>
                    ) : (
                      <span className="inline-flex min-h-[42px] items-center justify-center rounded-xl border border-dashed border-[#ea91b8] bg-white px-4 py-2 text-[11px] text-[#7e405c]">
                        Enter WhatsApp number above
                      </span>
                    )}

                    {liveMailtoUrl ? (
                      <a
                        href={liveMailtoUrl}
                        className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-[#db2777] bg-[#ffeef5] px-4 py-2 text-xs font-bold text-[#9d174d] hover:bg-[#ffe4ef] transition-colors text-center"
                      >
                        <Mail className="w-4 h-4 text-[#be185d]" aria-hidden="true" />
                        Send Directly in Email App
                      </a>
                    ) : (
                      <span className="inline-flex min-h-[42px] items-center justify-center rounded-xl border border-dashed border-[#ea91b8] bg-white px-4 py-2 text-[11px] text-[#7e405c]">
                        Enter Email address above
                      </span>
                    )}
                  </div>
                </div>

                {lastResult && (
                  <div
                    role="status"
                    className="rounded-xl border border-[#db2777] bg-[#fff0f6] p-4 space-y-2 text-xs text-[#3f0d24]"
                  >
                    {lastResult.whatsappDetail && (
                      <p className="m-0 flex items-start gap-2">
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            lastResult.whatsappSent ? 'text-[#15803d]' : 'text-[#be185d]'
                          }`}
                          aria-hidden="true"
                        />
                        <span>
                          <strong>WhatsApp:</strong> {lastResult.whatsappDetail}
                        </span>
                      </p>
                    )}
                    {lastResult.emailDetail && (
                      <p className="m-0 flex items-start gap-2">
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            lastResult.emailSent ? 'text-[#15803d]' : 'text-[#be185d]'
                          }`}
                          aria-hidden="true"
                        />
                        <span>
                          <strong>Email:</strong> {lastResult.emailDetail}
                        </span>
                      </p>
                    )}
                  </div>
                )}

                {/* Automatic Every-3-Hours Background Scheduler */}
                <div className="rounded-2xl border-2 border-[#db2777] bg-[#fff4f9] p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#be185d]" aria-hidden="true" />
                      <strong className="text-sm text-[#3f0d24]">
                        Automatic Messaging Every 3 Hours
                      </strong>
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        autoSchedule.enabled ? 'text-[#15803d]' : 'text-[#7e405c]'
                      }`}
                    >
                      {autoSchedule.enabled ? 'Active · Every 3 Hours' : 'Inactive'}
                    </span>
                  </div>

                  <p className="text-xs text-[#5c223d] m-0">
                    When turned on, PregMamas automatically sends a WhatsApp &amp; Email encouragement to your partner <strong>every 3 hours</strong> in the background—even if you navigate away or close this page.
                  </p>

                  <label className="flex items-center gap-2 text-xs text-[#3f0d24] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rotateAutoMessages}
                      onChange={(e) => setRotateAutoMessages(e.target.checked)}
                      className="accent-[#be185d] w-4 h-4"
                    />
                    <span>
                      Rotate 4 different supportive reminders every 3 hours (recommended)
                    </span>
                  </label>

                  {autoSchedule.enabled ? (
                    <div className="space-y-2.5">
                      <div className="rounded-xl border border-[#f4b6d0] bg-white px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="text-[#5c223d]">
                          Next 3-Hour Auto-Send In:{' '}
                          <strong className="font-mono text-sm text-[#be185d]">
                            {formatCountdown(autoSchedule.nextSendAtMs)}
                          </strong>
                        </span>
                        <span className="font-mono text-[11px] text-[#7e405c]">
                          Cycles Sent: {autoSchedule.totalAutoSent}
                        </span>
                      </div>

                      {autoSchedule.lastRunSummary && (
                        <p className="text-[11px] text-[#5c223d] m-0">
                          <Bell className="w-3.5 h-3.5 inline mr-1 text-[#be185d]" aria-hidden="true" />
                          {autoSchedule.lastRunSummary}
                        </p>
                      )}

                      <div className="grid sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={autoBusy}
                          onClick={() => void handleTriggerScheduledCycleNow()}
                          className="pink-btn-secondary text-xs disabled:opacity-60"
                        >
                          {autoBusy ? 'Running...' : 'Test 3-Hour Auto-Send Now'}
                        </button>
                        <button
                          type="button"
                          disabled={autoBusy}
                          onClick={() => void handleToggleAutoSchedule(false, false)}
                          className="rounded-xl border border-[#be123c] bg-white px-3 py-2 text-xs font-bold text-[#be123c] hover:bg-[#ffe4ef] cursor-pointer disabled:opacity-60"
                        >
                          Pause 3-Hour Auto-Send
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={autoBusy}
                      onClick={() => void handleToggleAutoSchedule(true, true)}
                      className="pink-btn-primary w-full text-xs disabled:opacity-60"
                    >
                      {autoBusy ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                          Activating 3-Hour Auto-Sender...
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4" aria-hidden="true" />
                          Enable Auto-Send Every 3 Hours (Send First Now)
                        </>
                      )}
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => persistPartnerDetails(false)}
                  className="pink-btn-secondary w-full text-xs"
                >
                  Withdraw Partner Education Consent Immediately
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PrivacyPage() {
  const rules = [
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="pink-hero-panel p-6 sm:p-8 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#9d174d] m-0">
          Section 8 — Safety, Privacy & Responsible Use
        </p>
        <h1 className="font-display text-3xl font-semibold text-[#3f0d24] m-0">
          How PregMamas Protects Mothers & Families
        </h1>
        <p className="text-sm text-[#5c223d] m-0">
          Clear rules governing consent, data privacy, medical disclaimers, and clinical content review.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {rules.map((r) => (
          <div key={r.title} className="pink-card p-5 space-y-1.5">
            <h2 className="font-display text-lg font-semibold text-[#3f0d24] flex items-center gap-2 m-0">
              <ShieldCheck className="w-4 h-4 text-[#be185d]" aria-hidden="true" />
              {r.title}
            </h2>
            <p className="text-sm text-[#5c223d] m-0 leading-relaxed">{r.body}</p>
          </div>
        ))}
      </div>

      <div className="pink-panel p-6 space-y-2">
        <h2 className="font-display text-lg font-semibold text-[#3f0d24] m-0">
          South African Clinical Guideline Reference
        </h2>
        <p className="text-sm text-[#5c223d] m-0">
          South African National Department of Health,{' '}
          <span className="italic">
            National Integrated Maternal and Perinatal Care Guidelines for South Africa (2024)
          </span>
          . Qualified healthcare reviewers consult these national clinical guidelines when preparing and checking educational health content.
        </p>
      </div>
    </div>
  );
}
