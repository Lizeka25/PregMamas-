import { useEffect, useState } from 'react';
import {
  Baby,
  BookOpen,
  Calendar,
  Check,
  Droplets,
  Footprints,
  HeartHandshake,
  Luggage,
  Plus,
  ShieldAlert,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  AppRoute,
  DemoUser,
  FAMILY_PLANNING_VISUAL_EXAMPLES,
  IMAGES,
  LEARNING_TOPICS,
} from '../data/pregmamasData';
import { useSharedContent } from '../context/SharedContentContext';
import { ArticleCommentsBox } from '../components/ArticleCommentsBox';
import { SupplementAlarmSection } from '../components/SupplementAlarmSection';
import { LaborBagSection } from '../components/LaborBagSection';
import { PostpartumSection } from '../components/PostpartumSection';
import { BabyMovementTracker } from '../components/BabyMovementTracker';
import { PinkLmpCalendar } from '../components/PinkLmpCalendar';
import { PinkDatePickerButton } from '../components/PinkDatePickerButton';

interface MotherPageProps {
  user: DemoUser | null;
  onNavigate: (path: AppRoute, topic?: string) => void;
}

interface ClinicAppointment {
  id: string;
  title: string;
  date: string;
  facility: string;
}

interface WellbeingEntry {
  id: string;
  date: string;
  mood: string;
  weightKg: string;
  note: string;
}

interface ChildProfile {
  id: string;
  name: string;
  dob: string;
}

const MOOD_OPTIONS = [
  'Calm & steady',
  'Tired / needing rest',
  'Anxious or overwhelmed',
  'Hopeful & supported',
  'Uncomfortable / nauseous',
];

const DEFAULT_LMP = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 24 * 7);
  return d.toISOString().split('T')[0];
})();

export function MotherDashboardPage({ user, onNavigate }: MotherPageProps) {
  const { articles, customArticles } = useSharedContent();
  const [lmpDate, setLmpDate] = useState<string>(() => {
    return localStorage.getItem('pregmamas_lmp_date_v1') || DEFAULT_LMP;
  });

  const [appointments, setAppointments] = useState<ClinicAppointment[]>(() => {
    try {
      const saved = localStorage.getItem('pregmamas_appointments_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [apptTitle, setApptTitle] = useState('');
  const [apptDate, setApptDate] = useState('');
  const [apptFacility, setApptFacility] = useState('');

  useEffect(() => {
    localStorage.setItem('pregmamas_lmp_date_v1', lmpDate);
  }, [lmpDate]);

  useEffect(() => {
    localStorage.setItem('pregmamas_appointments_v1', JSON.stringify(appointments));
  }, [appointments]);

  const addAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apptTitle.trim() || !apptDate) return;
    setAppointments((prev) => [
      ...prev,
      {
        id: `appt-${Date.now()}`,
        title: apptTitle.trim(),
        date: apptDate,
        facility: apptFacility.trim() || 'Antenatal Clinic',
      },
    ]);
    setApptTitle('');
    setApptDate('');
    setApptFacility('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Youth-Friendly Care Notice + Dashboard Header */}
      <div className="pink-hero-panel p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9d174d] m-0">
              You Are Not Alone · Mother Dashboard
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#3f0d24] mt-1 m-0">
              Welcome{user ? `, ${user.name}` : ' to PregMamas'}
            </h1>
          </div>
          {!user && (
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              className="pink-btn-secondary text-xs"
            >
              Sign In / Switch Role Demo
            </button>
          )}
        </div>

        <div className="rounded-xl border border-[#ea91b8] bg-[#fff7fa] px-4 py-3 text-xs text-[#5c223d]">
          <strong className="text-[#be185d]">Youth-Friendly Care Active:</strong> South African clinics offer free, confidential antenatal support for teen mothers—arrive early on your visit day with your clinic card or school note.
        </div>

        <div className="grid gap-5 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7 space-y-3">
            <PinkLmpCalendar lmpDate={lmpDate} onChangeLmpDate={setLmpDate} compact />
            <div className="rounded-xl bg-[#ffeef5] border border-[#f4b6d0] p-3 text-xs text-[#5c223d]">
              <strong className="text-[#3f0d24]">Important Antenatal Clinic Reminder — Arrive Early:</strong> Always arrive at least 30 minutes early for every antenatal visit and bring your Road to Health / antenatal booklet, ID, water, and a light snack so your midwife can check blood pressure, urine, dates, and Rh blood tests calmly.
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            {[
              { path: '/kicks' as AppRoute, title: 'Baby Kicks & Sounds', sub: 'Wake-up sounds & daily log', icon: Footprints },
              { path: '/learn' as AppRoute, topic: 'blood-rh-hiv', title: 'Blood, Defects & HIV', sub: 'Rh-/Rh+, PrEP & folate', icon: Droplets },
              { path: '/learn' as AppRoute, title: 'Learn (All Guides)', sub: '10 visual topics + pictures', icon: BookOpen },
              { path: '/emergency' as AppRoute, title: 'Danger Signs', sub: '10177 / 112 urgent guide', icon: ShieldAlert },
              { path: '/labour-prep' as AppRoute, title: 'Birth Plan & Bag', sub: 'Exact Mom & Baby clothes', icon: Luggage },
              { path: '/postpartum' as AppRoute, title: 'Postpartum & Family', sub: 'C-section, episiotomy, pads', icon: Baby },
              { path: '/health-logs' as AppRoute, title: 'Health Logs', sub: 'Private mood & weight', icon: Calendar },
              { path: '/advisor' as AppRoute, title: 'Fast AI Advisor', sub: 'Instant Gemini Q&A stream', icon: Sparkles },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={`${item.path}-${item.title}`}
                  type="button"
                  onClick={() => onNavigate(item.path, item.topic)}
                  className="pink-card p-3.5 text-left hover:border-[#db2777] transition-colors cursor-pointer"
                >
                  <Icon className="w-4 h-4 text-[#be185d]" aria-hidden="true" />
                  <strong className="block text-sm font-semibold text-[#3f0d24] mt-1.5">
                    {item.title}
                  </strong>
                  <span className="block text-[11px] text-[#5c223d]">{item.sub}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily Supplement Reminder & Custom Alarm right inside Mother Dashboard */}
      <div className="pink-card overflow-hidden">
        <SupplementAlarmSection />
      </div>

      {/* Antenatal & Clinic Visit Reminders + Illustrated Shortcuts */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-6 pink-card p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-xl font-semibold text-[#3f0d24] m-0">
                Antenatal & Clinic Visit Reminders
              </h2>
              <p className="text-xs text-[#5c223d] mt-1 m-0">
                Arrive at least 30 minutes early for every antenatal visit—bring your clinic card, ID, water, and questions.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/emergency')}
              className="text-xs font-semibold text-[#be185d] hover:underline whitespace-nowrap cursor-pointer"
            >
              View Clinics →
            </button>
          </div>

          <form onSubmit={addAppointment} className="space-y-3">
            <input
              type="text"
              value={apptTitle}
              onChange={(e) => setApptTitle(e.target.value)}
              placeholder="Appointment Title (e.g., 28-Week Antenatal Visit)"
              className="pink-input"
            />
            <div className="grid sm:grid-cols-2 gap-3">
              <PinkDatePickerButton
                value={apptDate}
                onChange={setApptDate}
                placeholder="Pick Visit Date"
                allowFuture={true}
              />
              <input
                type="text"
                value={apptFacility}
                onChange={(e) => setApptFacility(e.target.value)}
                placeholder="Clinic or Hospital (Optional)"
                className="pink-input"
              />
            </div>
            <button type="submit" className="pink-btn-primary w-full text-xs">
              <Plus className="w-4 h-4" aria-hidden="true" />
              Save Clinic Appointment
            </button>
          </form>

          {appointments.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#f4b6d0] bg-white p-4 text-xs text-[#7e405c] text-center">
              No clinic appointments saved yet. Add your next antenatal or postnatal checkup above.
            </p>
          ) : (
            <div className="space-y-2">
              {appointments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#ffd6e7] bg-white px-3.5 py-2.5"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#3f0d24]">{a.title}</p>
                    <p className="font-mono text-xs text-[#7e405c]">
                      {a.date} · {a.facility}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAppointments((prev) => prev.filter((item) => item.id !== a.id))}
                    aria-label={`Remove ${a.title}`}
                    className="text-[#7e405c] hover:text-[#be123c]"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-6 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onNavigate('/learn', 'baby-positions')}
            className="pink-card overflow-hidden flex flex-col text-left hover:border-[#db2777] cursor-pointer"
          >
            <img
              src={IMAGES.babyPositions}
              alt="Baby positions inside the womb"
              referrerPolicy="no-referrer"
              className="w-full aspect-[4/3] object-contain bg-[#fff7fa] p-2 border-b border-[#f4b6d0]"
            />
            <div className="p-4 space-y-1">
              <span className="text-[11px] font-bold text-[#be185d]">Illustrated Chart</span>
              <strong className="block font-display text-base text-[#3f0d24]">
                Baby Positions Inside the Womb
              </strong>
              <span className="block text-xs text-[#5c223d]">
                See Cephalic, Breech, Transverse, and Posterior positions and talk to your nurse at week 36.
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/postpartum')}
            className="pink-card overflow-hidden flex flex-col text-left hover:border-[#db2777] cursor-pointer"
          >
            <img
              src={IMAGES.familyPlanningExamples}
              alt="Visual examples of family planning methods: implant, IUD, injection, oral pills, and condoms"
              referrerPolicy="no-referrer"
              className="w-full aspect-[4/3] object-contain bg-[#fff7fa] p-2 border-b border-[#f4b6d0]"
            />
            <div className="p-4 space-y-1">
              <span className="text-[11px] font-bold text-[#be185d]">Postpartum Guide</span>
              <strong className="block font-display text-base text-[#3f0d24]">
                Family Planning Picture Examples
              </strong>
              <span className="block text-xs text-[#5c223d]">
                See visual examples of pills, implants, IUDs, injections, and condoms offered free at SA clinics.
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Articles Written by Doctors & Midwives — Ask Questions & Comment */}
      <div className="pink-card p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#be185d] m-0">
              Doctor & Midwife Guidance Feed
            </p>
            <h2 className="font-display text-2xl font-semibold text-[#3f0d24] m-0">
              Articles from Doctors & Midwives — Ask Questions & Comment
            </h2>
            <p className="text-xs text-[#5c223d] mt-1 m-0">
              {customArticles.length > 0
                ? `${customArticles.length} newly published article(s) from PregMamas doctors and midwives—ask questions directly below.`
                : 'Read verified guidance from South African doctors and midwives and ask questions directly below.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/learn')}
            className="pink-btn-secondary text-xs"
          >
            View All {articles.length} Articles →
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {articles.slice(0, 4).map((art) => (
            <article
              key={art.id}
              className={`rounded-2xl border p-4 flex flex-col gap-3 ${
                art.isClinicianPublished
                  ? 'border-[#db2777] bg-[#fff0f6]'
                  : 'border-[#f4b6d0] bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <img
                  src={art.image}
                  alt={art.imageAlt}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-xl object-cover border border-[#f4b6d0] shrink-0 bg-[#fff7fa]"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {art.isClinicianPublished && (
                      <span className="rounded-md bg-[#be185d] px-2 py-0.5 text-[10px] font-bold text-white">
                        New Doctor / Midwife Article
                      </span>
                    )}
                    <span className="text-[11px] font-semibold text-[#be185d]">
                      {LEARNING_TOPICS.find((t) => t.slug === art.topic)?.label}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-[#3f0d24] m-0 leading-snug">
                    {art.title}
                  </h3>
                  <p className="text-[11px] text-[#7e405c] m-0">
                    By <strong>{art.authorName}</strong> · {art.authorProfession}
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#5c223d] m-0 leading-relaxed">{art.summary}</p>
              {art.body.length > 0 && (
                <ul className="space-y-1 text-xs text-[#3f0d24] m-0 pl-0 list-none">
                  {art.body.slice(0, 3).map((pt, idx) => (
                    <li key={idx}>• {pt}</li>
                  ))}
                </ul>
              )}

              <ArticleCommentsBox
                articleId={art.id}
                articleTitle={art.title}
                user={user}
                defaultOpen={Boolean(art.isClinicianPublished)}
              />
            </article>
          ))}
        </div>
      </div>

      {/* Partner Education Shortcut */}
      <div className="pink-panel p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <HeartHandshake className="w-6 h-6 text-[#be185d]" aria-hidden="true" />
          <div>
            <strong className="block text-sm font-semibold text-[#3f0d24]">
              Partner Education & Consent
            </strong>
            <span className="text-xs text-[#5c223d]">
              Control whether general weekly partner tips are enabled. Never shares your private health logs.
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('/partners')}
          className="pink-btn-secondary text-xs"
        >
          Manage →
        </button>
      </div>
    </div>
  );
}

export function HealthLogsPage({ onNavigate }: { onNavigate: (path: AppRoute) => void }) {
  const [logs, setLogs] = useState<WellbeingEntry[]>(() => {
    try {
      const saved = localStorage.getItem('pregmamas_health_logs_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [mood, setMood] = useState(MOOD_OPTIONS[0]);
  const [weightKg, setWeightKg] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    localStorage.setItem('pregmamas_health_logs_v1', JSON.stringify(logs));
  }, [logs]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        date: new Date().toLocaleDateString(),
        mood,
        weightKg: weightKg.trim(),
        note: note.trim() || 'Private check-in logged.',
      },
      ...prev,
    ]);
    setWeightKg('');
    setNote('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="pink-hero-panel p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#9d174d] m-0">
            Step 4 — Private Personal Records
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#3f0d24] m-0">
            Private Wellbeing & Health Logs
          </h1>
          <p className="text-sm text-[#5c223d] m-0">
            Recording entries is completely optional. Your mood, weight, and clinic questions stay strictly on your own device and are never shared with partners or staff.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('/emergency')}
          className="pink-btn-urgent text-xs"
        >
          Go to Urgent Help (10177 / 112)
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <form onSubmit={handleSave} className="lg:col-span-5 pink-card p-6 space-y-4">
          <h2 className="font-display text-xl font-semibold text-[#3f0d24] m-0">
            Add Optional Log Entry
          </h2>
          <div>
            <label htmlFor="hl-mood" className="block text-xs font-semibold text-[#3f0d24] mb-1">
              How are you feeling today?
            </label>
            <select
              id="hl-mood"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="pink-input"
            >
              {MOOD_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="hl-weight" className="block text-xs font-semibold text-[#3f0d24] mb-1">
              Weight (kg, optional)
            </label>
            <input
              id="hl-weight"
              type="text"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="e.g., 64.5"
              className="pink-input font-mono"
            />
          </div>
          <div>
            <label htmlFor="hl-note" className="block text-xs font-semibold text-[#3f0d24] mb-1">
              Personal Reflection or Question for Nurse
            </label>
            <textarea
              id="hl-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write anything you want to ask at your next clinic checkup..."
              className="pink-input"
            />
          </div>
          <button type="submit" className="pink-btn-primary w-full">
            <Check className="w-4 h-4" aria-hidden="true" />
            Save Private Log Entry
          </button>
        </form>

        <div className="lg:col-span-7 pink-card p-6 space-y-4">
          <h2 className="font-display text-xl font-semibold text-[#3f0d24] m-0">
            Your Private History
          </h2>
          {logs.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#f4b6d0] bg-white p-8 text-center text-sm text-[#7e405c]">
              You have not added any personal wellbeing logs yet. Recording entries is completely optional.
            </p>
          ) : (
            <div className="space-y-3">
              {logs.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-[#ffd6e7] bg-white p-4"
                >
                  <div>
                    <p className="text-xs font-mono text-[#be185d]">
                      {entry.date} · {entry.mood}
                      {entry.weightKg ? ` · ${entry.weightKg} kg` : ''}
                    </p>
                    <p className="mt-1 text-sm text-[#3f0d24]">{entry.note}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLogs((prev) => prev.filter((item) => item.id !== entry.id))}
                    aria-label="Delete log entry"
                    className="text-[#7e405c] hover:text-[#be123c]"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Also include Daily Supplement Alarm here */}
      <div className="pink-card overflow-hidden">
        <SupplementAlarmSection />
      </div>
    </div>
  );
}

export function LabourPrepPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="pink-card overflow-hidden">
        <LaborBagSection />
      </div>
    </div>
  );
}

export function PostpartumPage() {
  const [children, setChildren] = useState<ChildProfile[]>(() => {
    try {
      const saved = localStorage.getItem('pregmamas_children_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });
  const [childName, setChildName] = useState('');
  const [childDob, setChildDob] = useState('');

  useEffect(() => {
    localStorage.setItem('pregmamas_children_v1', JSON.stringify(children));
  }, [children]);

  const addChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName.trim() || !childDob) return;
    setChildren((prev) => [
      ...prev,
      { id: `child-${Date.now()}`, name: childName.trim(), dob: childDob },
    ]);
    setChildName('');
    setChildDob('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="pink-card overflow-hidden">
        <PostpartumSection />
      </div>

      {/* Contraception visual photo + Child Profiles & Road to Health Milestones from MamaCare SA */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-6 pink-card p-6 space-y-4">
          <h2 className="font-display text-xl font-semibold text-[#3f0d24] m-0">
            Family Planning Picture Examples: Contraception Choices
          </h2>
          <p className="text-xs text-[#5c223d] m-0">
            Your reproductive choices belong to you. Compare individual pictures of pills, injections, subdermal implants, IUDs, and condoms offered free at South African clinics.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FAMILY_PLANNING_VISUAL_EXAMPLES.map((method) => (
              <div
                key={method.name}
                className="rounded-xl overflow-hidden border border-[#f4b6d0] bg-[#fff7fa] flex flex-col"
              >
                <img
                  src={method.image}
                  alt={method.imageAlt}
                  referrerPolicy="no-referrer"
                  className="w-full aspect-[4/3] object-cover border-b border-[#f4b6d0]"
                />
                <div className="p-2">
                  <strong className="block text-[11px] font-bold text-[#3f0d24] leading-tight">
                    {method.imageNote}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 pink-card p-6 space-y-4">
          <h2 className="font-display text-xl font-semibold text-[#3f0d24] m-0">
            Child Profiles & Road to Health Milestones
          </h2>
          <p className="text-xs text-[#5c223d] m-0">
            Record your baby’s birth date and track 6-day, 6-week, 10-week, and 14-week clinic immunisations privately.
          </p>
          <form onSubmit={addChild} className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="Baby / Child Name"
                className="pink-input"
              />
              <PinkDatePickerButton
                value={childDob}
                onChange={setChildDob}
                placeholder="Baby Birth Date"
                allowFuture={false}
              />
            </div>
            <button type="submit" className="pink-btn-primary w-full text-xs">
              <Plus className="w-4 h-4" aria-hidden="true" />
              Add Child Profile
            </button>
          </form>

          {children.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#f4b6d0] bg-white p-6 text-center text-xs text-[#7e405c]">
              No child profiles added yet. Add your baby above after delivery to log checkups and Road to Health immunisations.
            </p>
          ) : (
            <div className="space-y-2">
              {children.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-xl border border-[#ffd6e7] bg-white px-4 py-3 text-sm"
                >
                  <div>
                    <strong className="text-[#3f0d24]">{c.name}</strong>
                    <span className="block font-mono text-xs text-[#7e405c]">DOB: {c.dob}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setChildren((prev) => prev.filter((item) => item.id !== c.id))}
                    className="text-[#7e405c] hover:text-[#be123c]"
                    aria-label={`Remove ${c.name}`}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function BabyKicksPage({ onNavigate }: { onNavigate: (path: AppRoute) => void }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <BabyMovementTracker onGoEmergency={() => onNavigate('/emergency')} />
    </div>
  );
}
