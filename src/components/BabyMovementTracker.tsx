import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  BellOff,
  BellRing,
  Calendar,
  CheckCircle2,
  Clock,
  Droplets,
  Footprints,
  Plus,
  ShieldAlert,
  Trash2,
  Utensils,
} from 'lucide-react';
import { IMAGES } from '../data/pregmamasData';
import { useTranslatedTexts } from '../context/LanguageContext';
import {
  DAILY_MOVEMENT_STORAGE_KEY,
  DAILY_MOVEMENT_UPDATED_EVENT,
  formatCountdownMMSS,
  useSupplementAlarms,
} from '../context/AlarmContext';
import { PinkDatePickerButton } from './PinkDatePickerButton';

interface DailyMovementMap {
  [isoDate: string]: number;
}

const DO_TRIGGER_TIPS = [
  {
    title: 'Drink a tall glass of cold water',
    desc: 'Cool hydration gently wakes a sleepy baby and often sparks kicks within 15–20 minutes.',
  },
  {
    title: 'Lie quietly on your left side',
    desc: 'Resting on your left side increases blood and oxygen flow to the placenta so baby moves more clearly.',
  },
  {
    title: 'Talk, sing, or place warm hands on your tummy',
    desc: 'From week 24+, babies recognize your voice and gentle touch—pause and listen for kicks.',
  },
  {
    title: 'Take a slow 5-minute walk, then sit down',
    desc: 'Walking rocks baby softly to sleep, and sitting calmly afterward often triggers kicks and stretches.',
  },
];

const EAT_TRIGGER_TIPS = [
  {
    title: 'Fresh sweet fruit (orange, banana, apple, or berries)',
    desc: 'Natural fruit sugars give baby a gentle, healthy energy lift within 20–30 minutes.',
  },
  {
    title: 'Cold milk, amasi, or yoghurt with sliced fruit',
    desc: 'Combines cool temperature, calcium, protein, and natural lactose energy safely.',
  },
  {
    title: 'Peanut butter on wholewheat toast or unsalted nuts',
    desc: 'Balanced complex carbs and protein provide steady fuel without sudden sugar spikes.',
  },
  {
    title: 'Cold 100% fruit juice diluted 50/50 with water',
    desc: 'A small glass of cold diluted orange or apple juice helps rouse baby—avoid energy drinks or excess caffeine.',
  },
];

function getTodayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
}

function loadDailyLogsFromStorage(): DailyMovementMap {
  try {
    const raw = localStorage.getItem(DAILY_MOVEMENT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DailyMovementMap;
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch {
    // ignore
  }
  return {};
}

const MOVEMENT_TEXTS: string[] = [
  ...DO_TRIGGER_TIPS.flatMap((item) => [item.title, item.desc]),
  ...EAT_TRIGGER_TIPS.flatMap((item) => [item.title, item.desc]),
  'Daily Baby Movement Diary & Trigger Guide',
  'What to Do & Eat to Trigger Movements',
  'Follow the safe food, drink, and rest steps below to wake a sleepy baby—then record how many times baby moved today in your Daily Movement Diary and stay prompted every hour.',
  '1. What to Do to Wake a Sleepy Baby',
  '2. What to Eat & Drink to Trigger Movements',
  'Has your baby moved today?',
  'Hourly Check-In Reminder (Every 1 Hour)',
  'Log How Many Times Baby Moved Per Day',
  'Save Daily Count',
  'Same-Day Clinic Rule: If baby still moves noticeably less than normal after trying cold water, a healthy snack, and 30 minutes resting on your left side, go straight to your clinic/MOU or call 10177 / 112.',
];

export function BabyMovementTracker({
  onGoEmergency,
}: {
  onGoEmergency?: () => void;
}) {
  const stableTexts = useMemo(() => MOVEMENT_TEXTS, []);
  const { translated } = useTranslatedTexts(stableTexts);
  const doEnd = DO_TRIGGER_TIPS.length * 2;
  const eatEnd = doEnd + EAT_TRIGGER_TIPS.length * 2;

  const {
    hourlyMovementEnabled,
    setHourlyMovementEnabled,
    hourlyMovementRemainingSec,
    notifPermission,
    requestNotifications,
    triggerHourlyMovementReminderNow,
  } = useSupplementAlarms();

  const todayIso = getTodayIso();

  const [dailyLogs, setDailyLogs] = useState<DailyMovementMap>(() => loadDailyLogsFromStorage());
  const [manualDate, setManualDate] = useState(todayIso);
  const [manualCountInput, setManualCountInput] = useState('');
  const [diarySavedNote, setDiarySavedNote] = useState('');

  const syncFromStorage = useCallback(() => {
    setDailyLogs(loadDailyLogsFromStorage());
  }, []);

  useEffect(() => {
    window.addEventListener(DAILY_MOVEMENT_UPDATED_EVENT, syncFromStorage);
    return () => {
      window.removeEventListener(DAILY_MOVEMENT_UPDATED_EVENT, syncFromStorage);
    };
  }, [syncFromStorage]);

  useEffect(() => {
    try {
      localStorage.setItem(DAILY_MOVEMENT_STORAGE_KEY, JSON.stringify(dailyLogs));
    } catch {
      // ignore
    }
  }, [dailyLogs]);

  const incrementDailyTotal = (dateIso: string, amount: number) => {
    setDailyLogs((prev) => ({
      ...prev,
      [dateIso]: Math.max(0, (prev[dateIso] || 0) + amount),
    }));
  };

  const handleManualDailySave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(manualCountInput);
    if (!manualDate || manualCountInput.trim() === '' || Number.isNaN(parsed) || parsed < 0) return;
    const total = Math.round(parsed);
    setDailyLogs((prev) => ({
      ...prev,
      [manualDate]: total,
    }));
    setDiarySavedNote(`Saved ${total} baby movements for ${manualDate}.`);
    setManualCountInput('');
  };

  const sortedDailyEntries = useMemo(() => {
    return Object.entries(dailyLogs).sort((a, b) => b[0].localeCompare(a[0]));
  }, [dailyLogs]);

  const todayTotalMoves = dailyLogs[todayIso] || 0;

  return (
    <section
      aria-label="Baby Movement Advice, Hourly Reminder and Daily Movement Diary"
      className="rounded-3xl border-2 border-[#ea91b8] bg-gradient-to-br from-[#ffe4ef] via-[#fff0f6] to-[#ffd6e7] p-6 sm:p-8 space-y-8 shadow-sm"
    >
      {/* Header with Picture */}
      <div className="grid gap-6 lg:grid-cols-12 items-center">
        <div className="lg:col-span-7 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-xl border border-[#ea91b8] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#be185d]">
            <Footprints className="w-4 h-4 text-[#db2777]" aria-hidden="true" />
            <span>{translated[eatEnd] || MOVEMENT_TEXTS[eatEnd]}</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#3f0d24] m-0">
            {translated[eatEnd + 1] || MOVEMENT_TEXTS[eatEnd + 1]}
          </h2>
          <p className="text-sm sm:text-base text-[#5c223d] leading-relaxed m-0">
            {translated[eatEnd + 2] || MOVEMENT_TEXTS[eatEnd + 2]}
          </p>
        </div>

        <div className="lg:col-span-5">
          <figure className="m-0 rounded-2xl border-2 border-[#ea91b8] bg-[#fff7fa] p-2.5 shadow-sm space-y-2">
            <img
              src={IMAGES.navBabyKicks}
              alt="Smiling expectant mother resting comfortably with hands on her belly while logging baby movements"
              referrerPolicy="no-referrer"
              className="w-full aspect-[4/3] object-cover rounded-xl"
            />
            <figcaption className="text-[11px] text-center font-medium text-[#7e405c]">
              Cold water + sweet fruit or yoghurt + lying calmly on your left side gently helps wake a resting baby to kick.
            </figcaption>
          </figure>
        </div>
      </div>

      {/* Main Grid: What to Do & Eat (with Picture Examples) + Hourly Reminder & Daily Diary */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left: Actionable Advice with Picture Examples */}
        <div className="lg:col-span-6 space-y-5">
          {/* Section 1: What to Do to Wake a Sleepy Baby + Visual Picture Examples */}
          <div className="rounded-2xl border-2 border-[#ea91b8] bg-[#fff7fa] p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-[#be185d] shrink-0" aria-hidden="true" />
              <h3 className="font-display text-xl font-semibold text-[#3f0d24] m-0">
                {translated[eatEnd + 3] || MOVEMENT_TEXTS[eatEnd + 3]}
              </h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <figure className="m-0 rounded-xl border border-[#f4b6d0] bg-white p-2 space-y-1.5">
                <img
                  src={IMAGES.wakeSleepyBaby}
                  alt="Pregnant mother lying peacefully on her left side on a sofa with her hand on her belly next to a tall glass of cold water"
                  referrerPolicy="no-referrer"
                  className="w-full aspect-[4/3] object-cover rounded-lg"
                />
                <figcaption className="text-[11px] font-medium text-[#5c223d] leading-snug">
                  <strong>Picture Example 1:</strong> Rest quietly on your left side after drinking cold water.
                </figcaption>
              </figure>
              <figure className="m-0 rounded-xl border border-[#f4b6d0] bg-white p-2 space-y-1.5">
                <img
                  src={IMAGES.exerciseCatCow}
                  alt="Pregnant mother doing slow gentle prenatal movement before sitting to feel kicks"
                  referrerPolicy="no-referrer"
                  className="w-full aspect-[4/3] object-cover rounded-lg"
                />
                <figcaption className="text-[11px] font-medium text-[#5c223d] leading-snug">
                  <strong>Picture Example 2:</strong> Take a slow 5-minute walk or gentle stretch, then sit calmly.
                </figcaption>
              </figure>
            </div>

            <div className="space-y-2.5">
              {DO_TRIGGER_TIPS.map((item, idx) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-[#f4b6d0] bg-white p-3.5 space-y-1"
                >
                  <strong className="block text-sm font-semibold text-[#3f0d24]">
                    {idx + 1}. {translated[idx * 2] || item.title}
                  </strong>
                  <p className="text-xs text-[#5c223d] m-0 leading-relaxed">
                    {translated[idx * 2 + 1] || item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: What to Eat & Drink to Trigger Movements + Picture Examples */}
          <div className="rounded-2xl border-2 border-[#ea91b8] bg-[#fff7fa] p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-[#be185d] shrink-0" aria-hidden="true" />
              <h3 className="font-display text-xl font-semibold text-[#3f0d24] m-0">
                {translated[eatEnd + 4] || MOVEMENT_TEXTS[eatEnd + 4]}
              </h3>
            </div>

            <figure className="m-0 rounded-xl border border-[#f4b6d0] bg-white p-2.5 space-y-2">
              <img
                src={IMAGES.triggerSnacks}
                alt="Healthy pregnancy snack platter showing fresh orange slices, banana, apple wedges, plain yoghurt with berries, peanut butter wholewheat toast, and a glass of chilled diluted orange juice"
                referrerPolicy="no-referrer"
                className="w-full aspect-[16/10] object-cover rounded-lg"
              />
              <figcaption className="text-[11px] font-medium text-[#5c223d] leading-snug">
                <strong>Picture Examples — Safe Food & Drink Triggers:</strong> Fresh sweet fruit (oranges, bananas, apples), cold yoghurt with berries, peanut butter wholewheat toast, and chilled 50/50 diluted juice.
              </figcaption>
            </figure>

            <div className="space-y-2.5">
              {EAT_TRIGGER_TIPS.map((item, idx) => {
                const baseIdx = doEnd + idx * 2;
                return (
                  <div
                    key={item.title}
                    className="rounded-xl border border-[#f4b6d0] bg-[#ffeef5] p-3.5 space-y-1"
                  >
                    <strong className="block text-sm font-semibold text-[#3f0d24]">
                      • {translated[baseIdx] || item.title}
                    </strong>
                    <p className="text-xs text-[#5c223d] m-0 leading-relaxed">
                      {translated[baseIdx + 1] || item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Every-Hour "Has your baby moved today?" Reminder + Daily Movement Diary */}
        <div className="lg:col-span-6 space-y-6">
          {/* 1. Hourly "Has your baby moved today?" Reminder */}
          <div className="rounded-2xl border-2 border-[#be185d] bg-[#fff7fa] p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#be185d] m-0 flex items-center gap-1.5">
                  <BellRing className="w-3.5 h-3.5" aria-hidden="true" />
                  {translated[eatEnd + 6] || MOVEMENT_TEXTS[eatEnd + 6]}
                </p>
                <h3 className="font-display text-2xl font-semibold text-[#3f0d24] mt-0.5 m-0">
                  {translated[eatEnd + 5] || MOVEMENT_TEXTS[eatEnd + 5]}
                </h3>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-mono text-xs font-bold tabular-nums ${
                  hourlyMovementEnabled
                    ? 'border-[#db2777] bg-[#ffe4ef] text-[#9d174d]'
                    : 'border-[#e5c2d1] bg-white text-[#7e405c]'
                }`}
              >
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                {hourlyMovementEnabled
                  ? `Next check: ${formatCountdownMMSS(hourlyMovementRemainingSec)}`
                  : 'Paused'}
              </span>
            </div>

            <p className="text-xs text-[#5c223d] m-0 leading-relaxed">
              PregMamas automatically reminds you <strong>every 1 hour</strong> asking <em>“Has your baby moved today?”</em> with an in-app alert, gentle chime, and device notification so you never go too long without noticing a quiet period.
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setHourlyMovementEnabled(!hourlyMovementEnabled)}
                className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold cursor-pointer transition-colors ${
                  hourlyMovementEnabled
                    ? 'bg-[#be185d] text-white hover:bg-[#9d174d]'
                    : 'border border-[#ea91b8] bg-white text-[#9d174d] hover:bg-[#ffe4ef]'
                }`}
              >
                {hourlyMovementEnabled ? (
                  <>
                    <Bell className="w-3.5 h-3.5" aria-hidden="true" />
                    Hourly Reminder Active (Pause)
                  </>
                ) : (
                  <>
                    <BellOff className="w-3.5 h-3.5" aria-hidden="true" />
                    Turn On Hourly Reminder
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  void triggerHourlyMovementReminderNow();
                }}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-[#ea91b8] bg-[#ffe4ef] px-3.5 py-2 text-xs font-semibold text-[#9d174d] hover:bg-[#ffd6e7] cursor-pointer"
              >
                <BellRing className="w-3.5 h-3.5" aria-hidden="true" />
                Preview Hourly Check Now
              </button>

              {notifPermission !== 'granted' && notifPermission !== 'unsupported' && (
                <button
                  type="button"
                  onClick={() => {
                    void requestNotifications();
                  }}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-[#ea91b8] bg-white px-3.5 py-2 text-xs font-semibold text-[#5c223d] hover:bg-[#ffe4ef] cursor-pointer"
                >
                  Allow Device Popups
                </button>
              )}
            </div>
          </div>

          {/* 2. Daily Movement Diary: Put How Many Times Baby Moved */}
          <div className="rounded-2xl border-2 border-[#db2777] bg-[#fff7fa] p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#be185d] m-0 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                  Daily Movement Diary
                </p>
                <h3 className="font-display text-2xl font-semibold text-[#3f0d24] mt-0.5 m-0">
                  {translated[eatEnd + 7] || MOVEMENT_TEXTS[eatEnd + 7]}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => incrementDailyTotal(todayIso, 1)}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-[#db2777] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#be185d] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                +1 Movement Today ({todayTotalMoves})
              </button>
            </div>

            <form onSubmit={handleManualDailySave} className="grid sm:grid-cols-3 gap-3 items-end">
              <div>
                <label htmlFor="daily-move-date" className="block text-xs font-semibold text-[#3f0d24] mb-1">
                  Date
                </label>
                <PinkDatePickerButton
                  id="daily-move-date"
                  value={manualDate}
                  onChange={setManualDate}
                  allowFuture={false}
                />
              </div>
              <div>
                <label htmlFor="daily-move-count" className="block text-xs font-semibold text-[#3f0d24] mb-1">
                  How Many Times Did Baby Move?
                </label>
                <input
                  id="daily-move-count"
                  type="number"
                  min={0}
                  max={500}
                  required
                  value={manualCountInput}
                  onChange={(e) => setManualCountInput(e.target.value)}
                  placeholder="Enter count (e.g., 24)"
                  className="rounded-xl border border-[#ea91b8] bg-white px-3 py-2 font-mono text-xs text-[#3f0d24] w-full"
                />
              </div>
              <button
                type="submit"
                className="min-h-[38px] rounded-xl bg-[#be185d] px-4 py-2 text-xs font-semibold text-white hover:bg-[#9d174d] cursor-pointer"
              >
                {translated[eatEnd + 8] || MOVEMENT_TEXTS[eatEnd + 8]}
              </button>
            </form>

            {diarySavedNote && (
              <p className="text-xs font-semibold text-[#15803d] flex items-center gap-1.5 m-0" role="status">
                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{diarySavedNote}</span>
              </p>
            )}

            {sortedDailyEntries.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#ea91b8] bg-white p-4 text-xs text-[#7e405c] text-center m-0">
                No daily totals logged yet. Enter how many times baby moved above, or tap +1 Movement Today whenever baby kicks.
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {sortedDailyEntries.map(([dateKey, total]) => (
                  <div
                    key={dateKey}
                    className="flex items-center justify-between gap-2 rounded-xl border border-[#f4b6d0] bg-white px-3.5 py-2.5 text-xs"
                  >
                    <div>
                      <strong className="font-mono text-[#3f0d24] tabular-nums">{dateKey}</strong>
                      <span className="block font-semibold text-[#be185d] tabular-nums">
                        {total} baby movements recorded
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setDailyLogs((prev) => {
                          const next = { ...prev };
                          delete next[dateKey];
                          return next;
                        })
                      }
                      aria-label={`Delete daily entry for ${dateKey}`}
                      className="text-[#7e405c] hover:text-[#be123c] cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-xl border border-[#f4b6d0] bg-[#ffeef5] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5 text-xs text-[#3f0d24]">
                <ShieldAlert className="w-4 h-4 shrink-0 text-[#be123c] mt-0.5" aria-hidden="true" />
                <p className="m-0 leading-relaxed">
                  {translated[eatEnd + 9] || MOVEMENT_TEXTS[eatEnd + 9]}
                </p>
              </div>
              {onGoEmergency && (
                <button
                  type="button"
                  onClick={onGoEmergency}
                  className="pink-btn-urgent !min-h-[36px] !px-3 text-xs shrink-0"
                >
                  10177 / 112 Help
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
