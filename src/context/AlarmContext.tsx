import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AlarmClock,
  Bell,
  BellRing,
  CalendarClock,
  Check,
  Droplets,
  Music,
  Utensils,
  Volume2,
  X,
} from 'lucide-react';
import {
  DEFAULT_SUPPLEMENT_REMINDERS,
  SupplementReminder,
} from '../data/pregmamasData';

const STORAGE_KEY = 'pregmamas_supplement_reminders_v1';
const AUDIO_META_KEY = 'pregmamas_alarm_audio_v1';
const FIRED_TODAY_KEY = 'pregmamas_alarm_fired_v1';
const IDB_NAME = 'pregmamas_alarm_audio_db';
const IDB_STORE = 'tracks';
const IDB_TRACK_KEY = 'active_track';
const MIN_RINGTONE_SECONDS = 120; // At least 2 minutes continuous alarm ringtone
export const HOURLY_MOVEMENT_INTERVAL_MS = 60 * 60 * 1000; // Every 1 hour
const HOURLY_MOVEMENT_ENABLED_KEY = 'pregmamas_hourly_movement_enabled_v1';
const HOURLY_MOVEMENT_NEXT_KEY = 'pregmamas_hourly_movement_next_v1';
export const DAILY_MOVEMENT_STORAGE_KEY = 'pregmamas_daily_movements_v1';
export const DAILY_MOVEMENT_UPDATED_EVENT = 'pregmamas-daily-movement-updated';
const ANTENATAL_VISITS_KEY = 'pregmamas_appointments_v1';
const ANTENATAL_FIRED_KEY = 'pregmamas_antenatal_fired_v1';
const HYDRATION_ENABLED_KEY = 'pregmamas_hydration_enabled_v1';
const HYDRATION_INTERVAL_MIN_KEY = 'pregmamas_hydration_interval_min_v1';
const HYDRATION_NEXT_KEY = 'pregmamas_hydration_next_v1';
const WATER_LOG_KEY = 'pregmamas_water_log_v1';
const MEAL_ENABLED_KEY = 'pregmamas_meal_enabled_v1';
const MEAL_INTERVAL_MIN_KEY = 'pregmamas_meal_interval_min_v1';
const MEAL_NEXT_KEY = 'pregmamas_meal_next_v1';
const MEAL_LOG_KEY = 'pregmamas_meal_log_v1';

export interface AntenatalVisit {
  id: string;
  title: string;
  date: string;
  time: string;
  facility: string;
  notes?: string;
  completed?: boolean;
}

const BABY_NUTRIENT_TIPS = [
  'Your baby needs iron, folate, calcium, and protein to grow strong. Try spinach (morogo), beans, eggs, yoghurt, or fresh fruit.',
  'Skipping meals can make you dizzy or tired. Even a small nourishing snack like peanuts, banana, avocado, or wholewheat bread with peanut butter feeds your baby.',
  'Healthy meals build your baby’s brain and bones—pair iron-rich foods (beans, lean meat, pilchards, or dark greens) with vitamin C like an orange or tomato.',
];

interface SavedAudioMeta {
  fileName: string;
  mode: 'custom' | 'chime';
  dataUrl?: string;
}

interface SnoozeState {
  reminder: SupplementReminder;
  triggerAtMs: number;
}

interface AlarmContextValue {
  reminders: SupplementReminder[];
  now: Date;
  activeCustomName: string;
  activeCustomUrl: string | null;
  soundMode: 'custom' | 'chime';
  setSoundMode: (mode: 'custom' | 'chime') => void;
  audioNotice: string;
  setAudioNotice: (msg: string) => void;
  audioUnlocked: boolean;
  unlockAudio: () => Promise<boolean>;
  isPlayingMusic: boolean;
  ringtoneRemainingSec: number;
  activeAlarm: SupplementReminder | null;
  snoozeState: SnoozeState | null;
  notifPermission: NotificationPermission | 'unsupported';
  browserAlertNotice: string;
  requestNotifications: () => Promise<void>;
  triggerTestAlarm: () => Promise<void>;
  playSelectedAlarmSound: (startCountdown?: boolean) => Promise<void>;
  stopAlarmAudio: () => void;
  dismissActiveAlarm: () => void;
  snoozeActiveAlarm: (minutes?: number) => void;
  cancelSnooze: () => void;
  addReminder: (item: Omit<SupplementReminder, 'id' | 'enabled' | 'takenDate'>) => void;
  toggleTakenToday: (id: string) => void;
  toggleEnabled: (id: string) => void;
  updateTime: (id: string, newTime: string) => void;
  deleteReminder: (id: string) => void;
  resetTodayTaken: () => void;
  handleMusicUpload: (file: File) => void;
  removeUploadedMusic: () => void;
  hourlyMovementEnabled: boolean;
  setHourlyMovementEnabled: (enabled: boolean) => void;
  nextHourlyMovementAtMs: number;
  hourlyMovementRemainingSec: number;
  activeHourlyMovementPrompt: boolean;
  dismissHourlyMovementPrompt: () => void;
  confirmHourlyBabyMovedToday: () => void;
  triggerHourlyMovementReminderNow: () => Promise<void>;
  // Antenatal Clinic Visit notes & automatic reminders
  antenatalVisits: AntenatalVisit[];
  addAntenatalVisit: (visit: Omit<AntenatalVisit, 'id' | 'completed'>) => void;
  toggleAntenatalVisitCompleted: (id: string) => void;
  deleteAntenatalVisit: (id: string) => void;
  activeVisitAlert: { visit: AntenatalVisit; label: string } | null;
  dismissVisitAlert: () => void;
  triggerTestVisitAlert: (visit?: AntenatalVisit) => Promise<void>;
  // Always-on Hydration (Drink Water) reminder
  hydrationEnabled: boolean;
  setHydrationEnabled: (enabled: boolean) => void;
  hydrationIntervalMin: number;
  setHydrationIntervalMin: (minutes: number) => void;
  hydrationRemainingSec: number;
  waterGlassesToday: number;
  logWaterGlass: (delta?: number) => void;
  activeHydrationPrompt: boolean;
  dismissHydrationPrompt: () => void;
  triggerHydrationReminderNow: () => Promise<void>;
  // Always-on Meal & Baby Nutrients reminder
  mealReminderEnabled: boolean;
  setMealReminderEnabled: (enabled: boolean) => void;
  mealIntervalMin: number;
  setMealIntervalMin: (minutes: number) => void;
  mealRemainingSec: number;
  mealsLoggedToday: number;
  logNourishingMeal: (delta?: number) => void;
  activeMealPrompt: boolean;
  dismissMealPrompt: () => void;
  triggerMealReminderNow: () => Promise<void>;
}

const AlarmContext = createContext<AlarmContextValue | null>(null);

export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatTime12h(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(':');
  const h = Number(hStr);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${mStr} ${suffix}`;
}

export function formatCountdownMMSS(totalSec: number): string {
  const clamped = Math.max(0, Math.floor(totalSec));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatCountdownHMS(totalSec: number): string {
  const clamped = Math.max(0, Math.floor(totalSec));
  const hrs = Math.floor(clamped / 3600);
  const mins = Math.floor((clamped % 3600) / 60);
  const secs = clamped % 60;
  if (hrs > 0) {
    return `${hrs}h ${String(mins).padStart(2, '0')}m`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// IndexedDB helper for large uploaded alarm songs so they persist across reloads
function openAudioDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveTrackBlobToIdb(blob: Blob, fileName: string): Promise<void> {
  const db = await openAudioDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put({ blob, fileName }, IDB_TRACK_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function loadTrackBlobFromIdb(): Promise<{ blob: Blob; fileName: string } | null> {
  const db = await openAudioDb();
  return new Promise((resolve) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(IDB_TRACK_KEY);
    req.onsuccess = () => resolve((req.result as { blob: Blob; fileName: string }) || null);
    req.onerror = () => resolve(null);
  });
}

async function clearTrackBlobFromIdb(): Promise<void> {
  try {
    const db = await openAudioDb();
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).delete(IDB_TRACK_KEY);
  } catch {
    // ignore
  }
}

// Clear, unmistakable real-alarm chime pattern using Web Audio API
function playRealAlarmPattern(ctx: AudioContext) {
  const pattern = [
    { freq: 880, offset: 0.0, dur: 0.16, gain: 0.34 },
    { freq: 1046.5, offset: 0.18, dur: 0.16, gain: 0.36 },
    { freq: 1318.5, offset: 0.36, dur: 0.28, gain: 0.38 },
    { freq: 880, offset: 0.78, dur: 0.16, gain: 0.34 },
    { freq: 1046.5, offset: 0.96, dur: 0.16, gain: 0.36 },
    { freq: 1318.5, offset: 1.14, dur: 0.32, gain: 0.38 },
  ];
  pattern.forEach((n) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    const startAt = ctx.currentTime + n.offset;
    osc.frequency.setValueAtTime(n.freq, startAt);
    gain.gain.setValueAtTime(0.001, startAt);
    gain.gain.exponentialRampToValueAtTime(n.gain, startAt + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, startAt + n.dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startAt);
    osc.stop(startAt + n.dur + 0.02);
  });
}

export function AlarmProvider({ children }: { children: React.ReactNode }) {
  const [reminders, setReminders] = useState<SupplementReminder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as SupplementReminder[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_SUPPLEMENT_REMINDERS;
  });

  const [audioMeta, setAudioMeta] = useState<SavedAudioMeta | null>(() => {
    try {
      const raw = localStorage.getItem(AUDIO_META_KEY);
      if (raw) return JSON.parse(raw) as SavedAudioMeta;
    } catch {
      // ignore
    }
    return null;
  });

  const [idbTrackUrl, setIdbTrackUrl] = useState<string | null>(null);
  const [idbFileName, setIdbFileName] = useState<string>('');
  const [soundMode, setSoundModeState] = useState<'custom' | 'chime'>(() => {
    try {
      const raw = localStorage.getItem(AUDIO_META_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedAudioMeta;
        return parsed.mode || 'chime';
      }
    } catch {
      // ignore
    }
    return 'chime';
  });

  const [audioNotice, setAudioNotice] = useState('');
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [ringtoneRemainingSec, setRingtoneRemainingSec] = useState(0);
  const [now, setNow] = useState<Date>(() => new Date());
  const [activeAlarm, setActiveAlarm] = useState<SupplementReminder | null>(null);
  const [snoozeState, setSnoozeState] = useState<SnoozeState | null>(null);

  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  });
  const [browserAlertNotice, setBrowserAlertNotice] = useState('');

  const [hourlyMovementEnabled, setHourlyMovementEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(HOURLY_MOVEMENT_ENABLED_KEY);
      if (saved === 'false') return false;
    } catch {
      // ignore
    }
    return true;
  });

  const [nextHourlyMovementAtMs, setNextHourlyMovementAtMs] = useState<number>(() => {
    const nowMs = Date.now();
    try {
      const saved = localStorage.getItem(HOURLY_MOVEMENT_NEXT_KEY);
      if (saved) {
        const num = Number(saved);
        if (!Number.isNaN(num) && num > nowMs) return num;
      }
    } catch {
      // ignore
    }
    return nowMs + HOURLY_MOVEMENT_INTERVAL_MS;
  });

  const [activeHourlyMovementPrompt, setActiveHourlyMovementPrompt] = useState<boolean>(false);

  // Antenatal Clinic Visits (notes + automatic reminders)
  const [antenatalVisits, setAntenatalVisits] = useState<AntenatalVisit[]>(() => {
    try {
      const raw = localStorage.getItem(ANTENATAL_VISITS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AntenatalVisit>[];
        if (Array.isArray(parsed)) {
          return parsed
            .filter((item) => item && typeof item.title === 'string' && typeof item.date === 'string')
            .map((item) => ({
              id: item.id || `appt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              title: item.title || 'Antenatal Clinic Visit',
              date: item.date || getTodayDateString(),
              time: item.time || '08:30',
              facility: item.facility || 'Antenatal Clinic',
              notes: item.notes || '',
              completed: Boolean(item.completed),
            }));
        }
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [activeVisitAlert, setActiveVisitAlert] = useState<{
    visit: AntenatalVisit;
    label: string;
  } | null>(null);

  // Always-on Hydration Reminder (Drink Water & Stay Hydrated)
  const [hydrationEnabled, setHydrationEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(HYDRATION_ENABLED_KEY);
      if (saved === 'false') return false;
    } catch {
      // ignore
    }
    return true;
  });
  const [hydrationIntervalMin, setHydrationIntervalMinState] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem(HYDRATION_INTERVAL_MIN_KEY));
      if (!Number.isNaN(saved) && saved >= 30 && saved <= 360) return saved;
    } catch {
      // ignore
    }
    return 120; // Every 2 hours by default
  });
  const [nextHydrationAtMs, setNextHydrationAtMs] = useState<number>(() => {
    const nowMs = Date.now();
    try {
      const saved = Number(localStorage.getItem(HYDRATION_NEXT_KEY));
      if (!Number.isNaN(saved) && saved > nowMs) return saved;
    } catch {
      // ignore
    }
    return nowMs + 120 * 60 * 1000;
  });
  const [waterLog, setWaterLog] = useState<Record<string, number>>(() => {
    try {
      const raw = localStorage.getItem(WATER_LOG_KEY);
      if (raw) return JSON.parse(raw) as Record<string, number>;
    } catch {
      // ignore
    }
    return {};
  });
  const [activeHydrationPrompt, setActiveHydrationPrompt] = useState<boolean>(false);

  // Always-on Meal & Baby Nutrients Reminder
  const [mealReminderEnabled, setMealReminderEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(MEAL_ENABLED_KEY);
      if (saved === 'false') return false;
    } catch {
      // ignore
    }
    return true;
  });
  const [mealIntervalMin, setMealIntervalMinState] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem(MEAL_INTERVAL_MIN_KEY));
      if (!Number.isNaN(saved) && saved >= 60 && saved <= 480) return saved;
    } catch {
      // ignore
    }
    return 180; // Every 3 hours by default
  });
  const [nextMealAtMs, setNextMealAtMs] = useState<number>(() => {
    const nowMs = Date.now();
    try {
      const saved = Number(localStorage.getItem(MEAL_NEXT_KEY));
      if (!Number.isNaN(saved) && saved > nowMs) return saved;
    } catch {
      // ignore
    }
    return nowMs + 180 * 60 * 1000;
  });
  const [mealLog, setMealLog] = useState<Record<string, number>>(() => {
    try {
      const raw = localStorage.getItem(MEAL_LOG_KEY);
      if (raw) return JSON.parse(raw) as Record<string, number>;
    } catch {
      // ignore
    }
    return {};
  });
  const [activeMealPrompt, setActiveMealPrompt] = useState<boolean>(false);
  const [mealTipIndex, setMealTipIndex] = useState<number>(0);

  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const sharedCtxRef = useRef<AudioContext | null>(null);
  const chimeLoopRef = useRef<number | null>(null);
  const vibrateLoopRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const swRegRef = useRef<ServiceWorkerRegistration | null>(null);
  const originalTitleRef = useRef<string>(
    typeof document !== 'undefined' ? document.title : 'PregMamas'
  );
  const firedTodayRef = useRef<Record<string, string>>(
    (() => {
      try {
        const saved = localStorage.getItem(FIRED_TODAY_KEY);
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
      return {};
    })()
  );
  const visitFiredRef = useRef<Record<string, boolean>>(
    (() => {
      try {
        const saved = localStorage.getItem(ANTENATAL_FIRED_KEY);
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
      return {};
    })()
  );
  const remindersRef = useRef(reminders);
  remindersRef.current = reminders;
  const hourlyEnabledRef = useRef(hourlyMovementEnabled);
  hourlyEnabledRef.current = hourlyMovementEnabled;
  const nextHourlyMsRef = useRef(nextHourlyMovementAtMs);
  nextHourlyMsRef.current = nextHourlyMovementAtMs;
  const visitsRef = useRef(antenatalVisits);
  visitsRef.current = antenatalVisits;
  const hydrationEnabledRef = useRef(hydrationEnabled);
  hydrationEnabledRef.current = hydrationEnabled;
  const hydrationIntervalMinRef = useRef(hydrationIntervalMin);
  hydrationIntervalMinRef.current = hydrationIntervalMin;
  const nextHydrationMsRef = useRef(nextHydrationAtMs);
  nextHydrationMsRef.current = nextHydrationAtMs;
  const mealEnabledRef = useRef(mealReminderEnabled);
  mealEnabledRef.current = mealReminderEnabled;
  const mealIntervalMinRef = useRef(mealIntervalMin);
  mealIntervalMinRef.current = mealIntervalMin;
  const nextMealMsRef = useRef(nextMealAtMs);
  nextMealMsRef.current = nextMealAtMs;

  const activeCustomUrl = idbTrackUrl || audioMeta?.dataUrl || null;
  const activeCustomName = idbFileName || audioMeta?.fileName || '';

  // Attach active PWA service worker registration so Android Chrome & Desktop Browser Alerts work cleanly
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((reg) => {
          swRegRef.current = reg;
        })
        .catch(() => {
          // Non-fatal if preview sandbox restricts SW registration
        });
    }
  }, []);

  // Load persisted custom audio blob from IndexedDB on mount
  useEffect(() => {
    let cancelled = false;
    loadTrackBlobFromIdb().then((entry) => {
      if (cancelled || !entry) return;
      const url = URL.createObjectURL(entry.blob);
      setIdbTrackUrl(url);
      setIdbFileName(entry.fileName);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const getOrCreateAudioContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (!sharedCtxRef.current || sharedCtxRef.current.state === 'closed') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      sharedCtxRef.current = new AudioCtx();
    }
    return sharedCtxRef.current;
  }, []);

  const unlockAudio = useCallback(async (): Promise<boolean> => {
    try {
      const ctx = getOrCreateAudioContext();
      if (ctx) {
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
        // Play a zero-gain 1ms pulse so mobile browsers unlock background interval audio
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.01);
        setAudioUnlocked(ctx.state === 'running');
        return ctx.state === 'running';
      }
    } catch {
      // ignore
    }
    return false;
  }, [getOrCreateAudioContext]);

  // Automatically unlock audio on the user's first tap/key press anywhere in PregMamas
  useEffect(() => {
    const onFirstGesture = () => {
      void unlockAudio();
    };
    window.addEventListener('pointerdown', onFirstGesture, { once: true, passive: true });
    window.addEventListener('keydown', onFirstGesture, { once: true, passive: true });
    return () => {
      window.removeEventListener('pointerdown', onFirstGesture);
      window.removeEventListener('keydown', onFirstGesture);
    };
  }, [unlockAudio]);

  const stopAlarmAudio = useCallback(() => {
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.currentTime = 0;
    }
    if (chimeLoopRef.current !== null) {
      window.clearInterval(chimeLoopRef.current);
      chimeLoopRef.current = null;
    }
    if (vibrateLoopRef.current !== null) {
      window.clearInterval(vibrateLoopRef.current);
      vibrateLoopRef.current = null;
    }
    if (countdownRef.current !== null) {
      window.clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(0);
      } catch {
        // ignore
      }
    }
    setIsPlayingMusic(false);
    setRingtoneRemainingSec(0);
  }, []);

  const startBuiltInAlarmLoop = useCallback(async () => {
    const ctx = getOrCreateAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        // ignore
      }
    }
    setIsPlayingMusic(true);
    playRealAlarmPattern(ctx);
    chimeLoopRef.current = window.setInterval(() => {
      const c = sharedCtxRef.current;
      if (c && c.state !== 'closed') {
        if (c.state === 'suspended') {
          void c.resume();
        }
        playRealAlarmPattern(c);
      }
    }, 1750);
  }, [getOrCreateAudioContext]);

  const startVibrationLoop = useCallback(() => {
    if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
    try {
      navigator.vibrate([450, 180, 450, 180, 700]);
      vibrateLoopRef.current = window.setInterval(() => {
        try {
          navigator.vibrate([450, 180, 450, 180, 700]);
        } catch {
          // ignore
        }
      }, 2800);
    } catch {
      // ignore
    }
  }, []);

  const playSelectedAlarmSound = useCallback(
    async (withCountdown = true) => {
      stopAlarmAudio();
      await unlockAudio();

      if (withCountdown) {
        setRingtoneRemainingSec(MIN_RINGTONE_SECONDS);
        countdownRef.current = window.setInterval(() => {
          setRingtoneRemainingSec((prev) => {
            if (prev <= 1) {
              stopAlarmAudio();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }

      startVibrationLoop();

      if (soundMode === 'custom' && activeCustomUrl) {
        try {
          if (!audioElRef.current) {
            audioElRef.current = new Audio();
          }
          const el = audioElRef.current;
          el.src = activeCustomUrl;
          el.loop = true;
          el.volume = 1.0;
          setIsPlayingMusic(true);
          await el.play();
          return;
        } catch {
          // Fall back cleanly to built-in Web Audio alarm bell
        }
      }

      await startBuiltInAlarmLoop();
    },
    [activeCustomUrl, soundMode, startBuiltInAlarmLoop, startVibrationLoop, stopAlarmAudio, unlockAudio]
  );

  const fireBrowserAlert = useCallback(
    async (title: string, body: string, tag: string): Promise<boolean> => {
      if (typeof window === 'undefined' || !('Notification' in window)) {
        setBrowserAlertNotice(
          'Native browser notifications are unavailable here—PregMamas full-screen alarm popup, sound & vibration are active instead.'
        );
        return false;
      }

      const perm = Notification.permission;
      setNotifPermission(perm);

      if (perm !== 'granted') {
        if (perm === 'denied') {
          setBrowserAlertNotice(
            'Browser notifications are currently blocked in browser/preview settings. In-app full-screen alarm, ringtone & vibration are active; to enable OS popups, allow Notifications for this site or open PregMamas in a dedicated browser tab.'
          );
        }
        return false;
      }

      try {
        // 1. Prefer ServiceWorkerRegistration.showNotification (required by Android Chrome!)
        const reg =
          swRegRef.current ||
          (typeof navigator !== 'undefined' && 'serviceWorker' in navigator
            ? await Promise.race([
                navigator.serviceWorker.ready,
                new Promise<null>((r) => setTimeout(() => r(null), 600)),
              ])
            : null);

        if (reg && 'showNotification' in reg) {
          await reg.showNotification(title, {
            body,
            tag,
            requireInteraction: true,
            vibrate: [400, 150, 400],
          } as NotificationOptions);
          setBrowserAlertNotice('Browser alert sent cleanly!');
          return true;
        }
      } catch {
        // Fall through to direct Notification API
      }

      try {
        const notif = new Notification(title, {
          body,
          tag,
          requireInteraction: true,
        });
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
        setBrowserAlertNotice('Browser alert sent cleanly!');
        return true;
      } catch {
        setBrowserAlertNotice(
          'Preview frame restricted native OS popup—PregMamas in-app alarm popup, 2-min sound & vibration triggered instead.'
        );
        return false;
      }
    },
    []
  );

  const triggerAlarm = useCallback(
    (reminder: SupplementReminder, sourceLabel = 'Scheduled Alarm') => {
      setActiveAlarm(reminder);
      void playSelectedAlarmSound(true);
      void fireBrowserAlert(
        `PregMamas Alarm · ${reminder.name}`,
        `Time to take ${reminder.name} (${reminder.dosage}) with a full glass of water.`,
        `pregmamas-alarm-${reminder.id}`
      );
      setAudioNotice(`${sourceLabel} ringing: ${reminder.name}`);
    },
    [fireBrowserAlert, playSelectedAlarmSound]
  );

  const playGentleHourlyChime = useCallback(async () => {
    try {
      const ctx = getOrCreateAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      if (ctx.state === 'running') {
        playRealAlarmPattern(ctx);
      }
    } catch {
      // ignore if autoplay locked before user gesture
    }
  }, [getOrCreateAudioContext]);

  const fireHourlyMovementAlert = useCallback(
    (resetTimer = true) => {
      if (resetTimer) {
        const nextTarget = Date.now() + HOURLY_MOVEMENT_INTERVAL_MS;
        nextHourlyMsRef.current = nextTarget;
        setNextHourlyMovementAtMs(nextTarget);
      }
      setActiveHourlyMovementPrompt(true);
      void playGentleHourlyChime();
      void fireBrowserAlert(
        'Has Your Baby Moved Today? · PregMamas Hourly Check',
        "Take a gentle pause to feel baby's movements. Try cold water, sweet fruit or yoghurt, and left-side rest if baby is quiet, then log today's count.",
        'pregmamas-hourly-movement'
      );
    },
    [fireBrowserAlert, playGentleHourlyChime]
  );

  const fireHydrationAlert = useCallback(
    (resetTimer = true) => {
      if (resetTimer) {
        const nextTarget = Date.now() + hydrationIntervalMinRef.current * 60 * 1000;
        nextHydrationMsRef.current = nextTarget;
        setNextHydrationAtMs(nextTarget);
      }
      setActiveHydrationPrompt(true);
      void playGentleHourlyChime();
      void fireBrowserAlert(
        'Drink Water & Stay Hydrated · PregMamas',
        'Time for a glass of clean water, Mama! Staying hydrated supports healthy amniotic fluid, reduces swelling and headaches, and keeps energy up for you and baby.',
        'pregmamas-hydration-reminder'
      );
    },
    [fireBrowserAlert, playGentleHourlyChime]
  );

  const fireMealAlert = useCallback(
    (resetTimer = true) => {
      if (resetTimer) {
        const nextTarget = Date.now() + mealIntervalMinRef.current * 60 * 1000;
        nextMealMsRef.current = nextTarget;
        setNextMealAtMs(nextTarget);
      }
      setMealTipIndex((prev) => (prev + 1) % BABY_NUTRIENT_TIPS.length);
      setActiveMealPrompt(true);
      void playGentleHourlyChime();
      void fireBrowserAlert(
        'Time to Eat — Your Baby Needs Nutrients · PregMamas',
        'Please have a nourishing meal or healthy snack, Mama. Your baby needs iron, folate, protein, and calcium to grow strong and healthy.',
        'pregmamas-meal-reminder'
      );
    },
    [fireBrowserAlert, playGentleHourlyChime]
  );

  const fireAntenatalVisitAlert = useCallback(
    (visit: AntenatalVisit, label: string) => {
      setActiveVisitAlert({ visit, label });
      void playGentleHourlyChime();
      void fireBrowserAlert(
        `${label} · ${visit.title}`,
        `${visit.date} at ${formatTime12h(visit.time || '08:30')} · ${visit.facility}.${visit.notes ? ` Notes: ${visit.notes}` : ' Remember your Green Maternity Case Record & ID.'}`,
        `pregmamas-visit-${visit.id}`
      );
    },
    [fireBrowserAlert, playGentleHourlyChime]
  );

  // Flash browser tab title while an alarm is actively ringing
  useEffect(() => {
    if (!activeAlarm) {
      document.title = originalTitleRef.current;
      return;
    }
    const base = originalTitleRef.current;
    let toggle = false;
    const flashId = window.setInterval(() => {
      toggle = !toggle;
      document.title = toggle
        ? `🔔 ALARM: ${activeAlarm.name}!`
        : `💊 Take ${activeAlarm.name} — PregMamas`;
    }, 900);
    return () => {
      window.clearInterval(flashId);
      document.title = base;
    };
  }, [activeAlarm]);

  // Persist reminders
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
    } catch {
      // ignore
    }
  }, [reminders]);

  // Persist sound mode / metadata
  useEffect(() => {
    try {
      const next: SavedAudioMeta = {
        fileName: activeCustomName || '',
        mode: soundMode,
        dataUrl: audioMeta?.dataUrl,
      };
      localStorage.setItem(AUDIO_META_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, [activeCustomName, audioMeta?.dataUrl, soundMode]);

  useEffect(() => {
    try {
      localStorage.setItem(HOURLY_MOVEMENT_ENABLED_KEY, String(hourlyMovementEnabled));
    } catch {
      // ignore
    }
  }, [hourlyMovementEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(HOURLY_MOVEMENT_NEXT_KEY, String(nextHourlyMovementAtMs));
    } catch {
      // ignore
    }
  }, [nextHourlyMovementAtMs]);

  useEffect(() => {
    try {
      localStorage.setItem(ANTENATAL_VISITS_KEY, JSON.stringify(antenatalVisits));
    } catch {
      // ignore
    }
  }, [antenatalVisits]);

  useEffect(() => {
    try {
      localStorage.setItem(HYDRATION_ENABLED_KEY, String(hydrationEnabled));
      localStorage.setItem(HYDRATION_INTERVAL_MIN_KEY, String(hydrationIntervalMin));
      localStorage.setItem(HYDRATION_NEXT_KEY, String(nextHydrationAtMs));
    } catch {
      // ignore
    }
  }, [hydrationEnabled, hydrationIntervalMin, nextHydrationAtMs]);

  useEffect(() => {
    try {
      localStorage.setItem(WATER_LOG_KEY, JSON.stringify(waterLog));
    } catch {
      // ignore
    }
  }, [waterLog]);

  useEffect(() => {
    try {
      localStorage.setItem(MEAL_ENABLED_KEY, String(mealReminderEnabled));
      localStorage.setItem(MEAL_INTERVAL_MIN_KEY, String(mealIntervalMin));
      localStorage.setItem(MEAL_NEXT_KEY, String(nextMealAtMs));
    } catch {
      // ignore
    }
  }, [mealReminderEnabled, mealIntervalMin, nextMealAtMs]);

  useEffect(() => {
    try {
      localStorage.setItem(MEAL_LOG_KEY, JSON.stringify(mealLog));
    } catch {
      // ignore
    }
  }, [mealLog]);

  // Real-time background clock + snooze + catch-up monitor (runs regardless of active page!)
  useEffect(() => {
    const checkAlarms = () => {
      const current = new Date();
      setNow(current);

      const today = getTodayDateString();
      const hh = String(current.getHours()).padStart(2, '0');
      const mm = String(current.getMinutes()).padStart(2, '0');
      const currentHHMM = `${hh}:${mm}`;
      const nowMinutes = current.getHours() * 60 + current.getMinutes();

      // 1. Check active Snooze target first
      if (snoozeState && Date.now() >= snoozeState.triggerAtMs) {
        const snoozedItem = snoozeState.reminder;
        setSnoozeState(null);
        triggerAlarm(snoozedItem, 'Snoozed Alarm');
        return;
      }

      // 2. Check scheduled supplement reminders (exact minute OR 2-min catch-up if tab woke up!)
      for (const r of remindersRef.current) {
        if (!r.enabled || r.takenDate === today) continue;
        if (firedTodayRef.current[r.id] === today) continue;

        const [rh, rm] = r.time.split(':').map(Number);
        const remMinutes = rh * 60 + rm;
        const deltaMin = nowMinutes - remMinutes;

        // Exact minute match OR tab just woke up within 2 minutes after scheduled alarm
        if (r.time === currentHHMM || (deltaMin > 0 && deltaMin <= 2)) {
          firedTodayRef.current = { ...firedTodayRef.current, [r.id]: today };
          try {
            localStorage.setItem(FIRED_TODAY_KEY, JSON.stringify(firedTodayRef.current));
          } catch {
            // ignore
          }
          triggerAlarm(r, 'Supplement Alarm');
          break;
        }
      }

      // 3. Check hourly "Has your baby moved today?" check-in (runs every 60 minutes while enabled)
      if (hourlyEnabledRef.current && Date.now() >= nextHourlyMsRef.current) {
        fireHourlyMovementAlert(true);
      }

      // 4. Check Always-On Hydration Reminder ("Drink water & stay hydrated")
      if (hydrationEnabledRef.current && Date.now() >= nextHydrationMsRef.current) {
        fireHydrationAlert(true);
      }

      // 5. Check Always-On Meal & Baby Nutrients Reminder
      if (mealEnabledRef.current && Date.now() >= nextMealMsRef.current) {
        fireMealAlert(true);
      }

      // 6. Check Antenatal Clinic Visit reminders (day before + on the day & scheduled time)
      const todayMidnight = new Date(`${today}T00:00:00`).getTime();
      for (const visit of visitsRef.current) {
        if (visit.completed || !visit.date) continue;
        const visitMidnight = new Date(`${visit.date}T00:00:00`).getTime();
        if (Number.isNaN(visitMidnight)) continue;
        const diffDays = Math.round((visitMidnight - todayMidnight) / (24 * 60 * 60 * 1000));

        const markFired = (key: string) => {
          visitFiredRef.current = { ...visitFiredRef.current, [key]: true };
          try {
            localStorage.setItem(ANTENATAL_FIRED_KEY, JSON.stringify(visitFiredRef.current));
          } catch {
            // ignore
          }
        };

        if (diffDays === 1) {
          const dayBeforeKey = `day-before-${visit.id}-${today}`;
          if (!visitFiredRef.current[dayBeforeKey]) {
            markFired(dayBeforeKey);
            fireAntenatalVisitAlert(visit, "Tomorrow's Antenatal Clinic Visit");
            break;
          }
        } else if (diffDays === 0) {
          const visitTime = visit.time || '08:30';
          const [vh, vm] = visitTime.split(':').map(Number);
          const visitMinutes = vh * 60 + vm;
          const deltaMin = nowMinutes - visitMinutes;

          const exactKey = `today-time-${visit.id}-${today}`;
          const morningKey = `today-morning-${visit.id}-${today}`;

          if (
            (visitTime === currentHHMM || (deltaMin > 0 && deltaMin <= 15)) &&
            !visitFiredRef.current[exactKey]
          ) {
            markFired(exactKey);
            fireAntenatalVisitAlert(visit, 'Antenatal Visit Time Now');
            break;
          } else if (!visitFiredRef.current[morningKey]) {
            markFired(morningKey);
            fireAntenatalVisitAlert(visit, 'Antenatal Visit Today');
            break;
          }
        }
      }
    };

    checkAlarms();
    const interval = window.setInterval(checkAlarms, 1000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkAlarms();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [
    fireAntenatalVisitAlert,
    fireHourlyMovementAlert,
    fireHydrationAlert,
    fireMealAlert,
    snoozeState,
    triggerAlarm,
  ]);

  const requestNotifications = useCallback(async () => {
    await unlockAudio();
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotifPermission('unsupported');
      setBrowserAlertNotice(
        'This browser does not support native OS notifications. PregMamas in-app alarm modal, ringtone & vibration will still alert you.'
      );
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      if (perm === 'granted') {
        setBrowserAlertNotice('Browser Alerts are ON! Sending a sample alert now...');
        await fireBrowserAlert(
          'PregMamas Browser Alerts Enabled',
          'You will receive real browser notifications and a 2-minute alarm whenever your daily supplement alarm rings.',
          'pregmamas-test-enable'
        );
      } else if (perm === 'denied') {
        setBrowserAlertNotice(
          'Permission was denied or blocked by the embedded preview. Click the lock/site-settings icon in your browser bar (or open PregMamas in a full tab) to allow Notifications. In-app alerts still work!'
        );
      } else {
        setBrowserAlertNotice(
          'Notification prompt was dismissed. Click "Enable Browser Alerts" again or allow notifications in browser site settings.'
        );
      }
    } catch {
      setBrowserAlertNotice(
        'Browser prompt was blocked in this preview frame—in-app alarm popup, sound & vibration still work cleanly.'
      );
    }
  }, [fireBrowserAlert, unlockAudio]);

  const triggerTestAlarm = useCallback(async () => {
    await unlockAudio();

    // Auto-request browser notification permission on explicit user click if not yet granted/denied
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      try {
        const perm = await Notification.requestPermission();
        setNotifPermission(perm);
      } catch {
        // ignore if frame rejects prompt
      }
    }

    const sorted = [...remindersRef.current].sort((a, b) => a.time.localeCompare(b.time));
    const sample =
      sorted.find((r) => r.enabled) ||
      sorted[0] || {
        id: 'test',
        name: 'Prenatal Vitamin + Water',
        dosage: '1 tablet + full glass of water',
        time: `${String(new Date().getHours()).padStart(2, '0')}:${String(
          new Date().getMinutes()
        ).padStart(2, '0')}`,
        notes: 'Test alarm from PregMamas daily supplement studio.',
        enabled: true,
        takenDate: null,
      };

    triggerAlarm(sample, 'Test Alarm');
  }, [triggerAlarm, unlockAudio]);

  const dismissActiveAlarm = useCallback(() => {
    setActiveAlarm(null);
    stopAlarmAudio();
  }, [stopAlarmAudio]);

  const snoozeActiveAlarm = useCallback(
    (minutes = 5) => {
      if (!activeAlarm) return;
      const target = activeAlarm;
      setActiveAlarm(null);
      stopAlarmAudio();
      setSnoozeState({
        reminder: target,
        triggerAtMs: Date.now() + minutes * 60 * 1000,
      });
      setAudioNotice(`Snoozed "${target.name}" for ${minutes} minutes.`);
    },
    [activeAlarm, stopAlarmAudio]
  );

  const cancelSnooze = useCallback(() => {
    setSnoozeState(null);
  }, []);

  const addReminder = useCallback(
    (item: Omit<SupplementReminder, 'id' | 'enabled' | 'takenDate'>) => {
      void unlockAudio();
      const newItem: SupplementReminder = {
        ...item,
        id: `custom-${Date.now()}`,
        enabled: true,
        takenDate: null,
      };
      setReminders((prev) => [...prev, newItem]);
    },
    [unlockAudio]
  );

  const toggleTakenToday = useCallback(
    (id: string) => {
      void unlockAudio();
      const today = getTodayDateString();
      setReminders((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, takenDate: r.takenDate === today ? null : today } : r
        )
      );
      if (activeAlarm?.id === id) {
        setActiveAlarm(null);
        stopAlarmAudio();
      }
      if (snoozeState?.reminder.id === id) {
        setSnoozeState(null);
      }
    },
    [activeAlarm?.id, snoozeState?.reminder.id, stopAlarmAudio, unlockAudio]
  );

  const toggleEnabled = useCallback(
    (id: string) => {
      void unlockAudio();
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
      );
      // Clear fired flag so re-enabling after editing lets it trigger cleanly
      const copy = { ...firedTodayRef.current };
      delete copy[id];
      firedTodayRef.current = copy;
      try {
        localStorage.setItem(FIRED_TODAY_KEY, JSON.stringify(copy));
      } catch {
        // ignore
      }
    },
    [unlockAudio]
  );

  const updateTime = useCallback(
    (id: string, newTime: string) => {
      void unlockAudio();
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, time: newTime } : r))
      );
      // Reset today's fired lock so moving an alarm to a new upcoming minute rings today!
      const copy = { ...firedTodayRef.current };
      delete copy[id];
      firedTodayRef.current = copy;
      try {
        localStorage.setItem(FIRED_TODAY_KEY, JSON.stringify(copy));
      } catch {
        // ignore
      }
    },
    [unlockAudio]
  );

  const deleteReminder = useCallback(
    (id: string) => {
      setReminders((prev) => prev.filter((r) => r.id !== id));
      if (activeAlarm?.id === id) {
        setActiveAlarm(null);
        stopAlarmAudio();
      }
      if (snoozeState?.reminder.id === id) {
        setSnoozeState(null);
      }
    },
    [activeAlarm?.id, snoozeState?.reminder.id, stopAlarmAudio]
  );

  const resetTodayTaken = useCallback(() => {
    setReminders((prev) => prev.map((r) => ({ ...r, takenDate: null })));
    firedTodayRef.current = {};
    try {
      localStorage.removeItem(FIRED_TODAY_KEY);
    } catch {
      // ignore
    }
  }, []);

  const handleMusicUpload = useCallback(
    (file: File) => {
      stopAlarmAudio();
      void unlockAudio();
      setAudioNotice('');

      if (!file.type.startsWith('audio/') && !/\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(file.name)) {
        setAudioNotice('Please select an audio file (.mp3, .wav, .m4a, or .ogg).');
        return;
      }

      if (idbTrackUrl) {
        URL.revokeObjectURL(idbTrackUrl);
      }
      const objectUrl = URL.createObjectURL(file);
      setIdbTrackUrl(objectUrl);
      setIdbFileName(file.name);
      setSoundModeState('custom');

      // Save large binary cleanly in IndexedDB so even big songs persist across browser restarts
      saveTrackBlobToIdb(file, file.name)
        .then(() => {
          setAudioNotice(`Saved "${file.name}" permanently as your daily supplement alarm tone.`);
        })
        .catch(() => {
          setAudioNotice(`Loaded "${file.name}" as your active supplement alarm tone.`);
        });

      setAudioMeta({ fileName: file.name, mode: 'custom' });
    },
    [idbTrackUrl, stopAlarmAudio, unlockAudio]
  );

  const removeUploadedMusic = useCallback(() => {
    stopAlarmAudio();
    if (idbTrackUrl) {
      URL.revokeObjectURL(idbTrackUrl);
    }
    setIdbTrackUrl(null);
    setIdbFileName('');
    setAudioMeta(null);
    setSoundModeState('chime');
    setAudioNotice('Switched back to the built-in real alarm chime.');
    void clearTrackBlobFromIdb();
    try {
      localStorage.removeItem(AUDIO_META_KEY);
    } catch {
      // ignore
    }
  }, [idbTrackUrl, stopAlarmAudio]);

  const setSoundMode = useCallback((mode: 'custom' | 'chime') => {
    setSoundModeState(mode);
  }, []);

  const setHourlyMovementEnabled = useCallback((enabled: boolean) => {
    void unlockAudio();
    setHourlyMovementEnabledState(enabled);
    if (enabled && Date.now() >= nextHourlyMsRef.current) {
      const nextTarget = Date.now() + HOURLY_MOVEMENT_INTERVAL_MS;
      nextHourlyMsRef.current = nextTarget;
      setNextHourlyMovementAtMs(nextTarget);
    }
  }, [unlockAudio]);

  const dismissHourlyMovementPrompt = useCallback(() => {
    setActiveHourlyMovementPrompt(false);
    const nextTarget = Date.now() + HOURLY_MOVEMENT_INTERVAL_MS;
    nextHourlyMsRef.current = nextTarget;
    setNextHourlyMovementAtMs(nextTarget);
  }, []);

  const confirmHourlyBabyMovedToday = useCallback(() => {
    void unlockAudio();
    const today = getTodayDateString();
    try {
      const raw = localStorage.getItem(DAILY_MOVEMENT_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as Record<string, number>) : {};
      const nextMap = {
        ...(parsed && typeof parsed === 'object' ? parsed : {}),
        [today]: Math.max(0, Number(parsed?.[today] || 0) + 1),
      };
      localStorage.setItem(DAILY_MOVEMENT_STORAGE_KEY, JSON.stringify(nextMap));
      window.dispatchEvent(new CustomEvent(DAILY_MOVEMENT_UPDATED_EVENT));
    } catch {
      // ignore
    }
    setActiveHourlyMovementPrompt(false);
    const nextTarget = Date.now() + HOURLY_MOVEMENT_INTERVAL_MS;
    nextHourlyMsRef.current = nextTarget;
    setNextHourlyMovementAtMs(nextTarget);
  }, [unlockAudio]);

  const triggerHourlyMovementReminderNow = useCallback(async () => {
    await unlockAudio();
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      try {
        const perm = await Notification.requestPermission();
        setNotifPermission(perm);
      } catch {
        // ignore
      }
    }
    fireHourlyMovementAlert(true);
  }, [fireHourlyMovementAlert, unlockAudio]);

  // Antenatal Clinic Visit handlers
  const addAntenatalVisit = useCallback(
    (visit: Omit<AntenatalVisit, 'id' | 'completed'>) => {
      void unlockAudio();
      const nextVisit: AntenatalVisit = {
        id: `appt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: visit.title.trim(),
        date: visit.date,
        time: visit.time || '08:30',
        facility: visit.facility.trim() || 'Antenatal Clinic',
        notes: visit.notes?.trim() || '',
        completed: false,
      };
      setAntenatalVisits((prev) =>
        [...prev, nextVisit].sort((a, b) =>
          `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
        )
      );
    },
    [unlockAudio]
  );

  const toggleAntenatalVisitCompleted = useCallback((id: string) => {
    setAntenatalVisits((prev) =>
      prev.map((v) => (v.id === id ? { ...v, completed: !v.completed } : v))
    );
    setActiveVisitAlert((curr) => (curr?.visit.id === id ? null : curr));
  }, []);

  const deleteAntenatalVisit = useCallback((id: string) => {
    setAntenatalVisits((prev) => prev.filter((v) => v.id !== id));
    setActiveVisitAlert((curr) => (curr?.visit.id === id ? null : curr));
  }, []);

  const dismissVisitAlert = useCallback(() => {
    setActiveVisitAlert(null);
  }, []);

  const triggerTestVisitAlert = useCallback(
    async (visit?: AntenatalVisit) => {
      await unlockAudio();
      const sample: AntenatalVisit =
        visit ||
        visitsRef.current.find((v) => !v.completed) || {
          id: 'sample-visit',
          title: 'Next Antenatal Clinic Check-up',
          date: getTodayDateString(),
          time: '08:30',
          facility: 'Local Antenatal Clinic / MOU',
          notes: 'Bring your Green Maternity Case Record, ID, and any questions for your midwife.',
        };
      fireAntenatalVisitAlert(sample, 'Antenatal Visit Reminder');
    },
    [fireAntenatalVisitAlert, unlockAudio]
  );

  // Hydration Reminder handlers
  const setHydrationEnabled = useCallback(
    (enabled: boolean) => {
      void unlockAudio();
      setHydrationEnabledState(enabled);
      if (enabled && Date.now() >= nextHydrationMsRef.current) {
        const nextTarget = Date.now() + hydrationIntervalMinRef.current * 60 * 1000;
        nextHydrationMsRef.current = nextTarget;
        setNextHydrationAtMs(nextTarget);
      }
    },
    [unlockAudio]
  );

  const setHydrationIntervalMin = useCallback(
    (minutes: number) => {
      void unlockAudio();
      const clamped = Math.max(30, Math.min(360, minutes));
      setHydrationIntervalMinState(clamped);
      hydrationIntervalMinRef.current = clamped;
      const nextTarget = Date.now() + clamped * 60 * 1000;
      nextHydrationMsRef.current = nextTarget;
      setNextHydrationAtMs(nextTarget);
    },
    [unlockAudio]
  );

  const logWaterGlass = useCallback(
    (delta = 1) => {
      void unlockAudio();
      const today = getTodayDateString();
      setWaterLog((prev) => ({
        ...prev,
        [today]: Math.max(0, Math.min(20, (prev[today] || 0) + delta)),
      }));
      if (delta > 0) {
        setActiveHydrationPrompt(false);
        const nextTarget = Date.now() + hydrationIntervalMinRef.current * 60 * 1000;
        nextHydrationMsRef.current = nextTarget;
        setNextHydrationAtMs(nextTarget);
      }
    },
    [unlockAudio]
  );

  const dismissHydrationPrompt = useCallback(() => {
    setActiveHydrationPrompt(false);
    const nextTarget = Date.now() + hydrationIntervalMinRef.current * 60 * 1000;
    nextHydrationMsRef.current = nextTarget;
    setNextHydrationAtMs(nextTarget);
  }, []);

  const triggerHydrationReminderNow = useCallback(async () => {
    await unlockAudio();
    fireHydrationAlert(true);
  }, [fireHydrationAlert, unlockAudio]);

  // Meal & Baby Nutrients Reminder handlers
  const setMealReminderEnabled = useCallback(
    (enabled: boolean) => {
      void unlockAudio();
      setMealReminderEnabledState(enabled);
      if (enabled && Date.now() >= nextMealMsRef.current) {
        const nextTarget = Date.now() + mealIntervalMinRef.current * 60 * 1000;
        nextMealMsRef.current = nextTarget;
        setNextMealAtMs(nextTarget);
      }
    },
    [unlockAudio]
  );

  const setMealIntervalMin = useCallback(
    (minutes: number) => {
      void unlockAudio();
      const clamped = Math.max(60, Math.min(480, minutes));
      setMealIntervalMinState(clamped);
      mealIntervalMinRef.current = clamped;
      const nextTarget = Date.now() + clamped * 60 * 1000;
      nextMealMsRef.current = nextTarget;
      setNextMealAtMs(nextTarget);
    },
    [unlockAudio]
  );

  const logNourishingMeal = useCallback(
    (delta = 1) => {
      void unlockAudio();
      const today = getTodayDateString();
      setMealLog((prev) => ({
        ...prev,
        [today]: Math.max(0, Math.min(12, (prev[today] || 0) + delta)),
      }));
      if (delta > 0) {
        setActiveMealPrompt(false);
        const nextTarget = Date.now() + mealIntervalMinRef.current * 60 * 1000;
        nextMealMsRef.current = nextTarget;
        setNextMealAtMs(nextTarget);
      }
    },
    [unlockAudio]
  );

  const dismissMealPrompt = useCallback(() => {
    setActiveMealPrompt(false);
    const nextTarget = Date.now() + mealIntervalMinRef.current * 60 * 1000;
    nextMealMsRef.current = nextTarget;
    setNextMealAtMs(nextTarget);
  }, []);

  const triggerMealReminderNow = useCallback(async () => {
    await unlockAudio();
    fireMealAlert(true);
  }, [fireMealAlert, unlockAudio]);

  const snoozeRemainingSec = useMemo(() => {
    if (!snoozeState) return 0;
    return Math.max(0, Math.ceil((snoozeState.triggerAtMs - now.getTime()) / 1000));
  }, [now, snoozeState]);

  const hourlyMovementRemainingSec = useMemo(() => {
    if (!hourlyMovementEnabled) return 0;
    return Math.max(0, Math.ceil((nextHourlyMovementAtMs - now.getTime()) / 1000));
  }, [hourlyMovementEnabled, nextHourlyMovementAtMs, now]);

  const hydrationRemainingSec = useMemo(() => {
    if (!hydrationEnabled) return 0;
    return Math.max(0, Math.ceil((nextHydrationAtMs - now.getTime()) / 1000));
  }, [hydrationEnabled, nextHydrationAtMs, now]);

  const mealRemainingSec = useMemo(() => {
    if (!mealReminderEnabled) return 0;
    return Math.max(0, Math.ceil((nextMealAtMs - now.getTime()) / 1000));
  }, [mealReminderEnabled, nextMealAtMs, now]);

  const todayKey = getTodayDateString();
  const waterGlassesToday = waterLog[todayKey] || 0;
  const mealsLoggedToday = mealLog[todayKey] || 0;

  const value: AlarmContextValue = {
    reminders,
    now,
    activeCustomName,
    activeCustomUrl,
    soundMode,
    setSoundMode,
    audioNotice,
    setAudioNotice,
    audioUnlocked,
    unlockAudio,
    isPlayingMusic,
    ringtoneRemainingSec,
    activeAlarm,
    snoozeState,
    notifPermission,
    browserAlertNotice,
    requestNotifications,
    triggerTestAlarm,
    playSelectedAlarmSound,
    stopAlarmAudio,
    dismissActiveAlarm,
    snoozeActiveAlarm,
    cancelSnooze,
    addReminder,
    toggleTakenToday,
    toggleEnabled,
    updateTime,
    deleteReminder,
    resetTodayTaken,
    handleMusicUpload,
    removeUploadedMusic,
    hourlyMovementEnabled,
    setHourlyMovementEnabled,
    nextHourlyMovementAtMs,
    hourlyMovementRemainingSec,
    activeHourlyMovementPrompt,
    dismissHourlyMovementPrompt,
    confirmHourlyBabyMovedToday,
    triggerHourlyMovementReminderNow,
    antenatalVisits,
    addAntenatalVisit,
    toggleAntenatalVisitCompleted,
    deleteAntenatalVisit,
    activeVisitAlert,
    dismissVisitAlert,
    triggerTestVisitAlert,
    hydrationEnabled,
    setHydrationEnabled,
    hydrationIntervalMin,
    setHydrationIntervalMin,
    hydrationRemainingSec,
    waterGlassesToday,
    logWaterGlass,
    activeHydrationPrompt,
    dismissHydrationPrompt,
    triggerHydrationReminderNow,
    mealReminderEnabled,
    setMealReminderEnabled,
    mealIntervalMin,
    setMealIntervalMin,
    mealRemainingSec,
    mealsLoggedToday,
    logNourishingMeal,
    activeMealPrompt,
    dismissMealPrompt,
    triggerMealReminderNow,
  };

  return (
    <AlarmContext.Provider value={value}>
      {children}

      {/* GLOBAL FULL-SCREEN REAL ALARM MODAL — Rings on ANY page of PregMamas */}
      {activeAlarm && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="global-alarm-title"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#3f0d24]/70 backdrop-blur-sm p-4"
        >
          <div className="w-full max-w-md rounded-3xl border-2 border-[#db2777] bg-gradient-to-b from-[#be185d] via-[#db2777] to-[#9d174d] text-white shadow-2xl overflow-hidden">
            <div className="p-6 sm:p-7 text-center space-y-5">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center animate-bounce">
                <BellRing className="w-8 h-8 text-white" aria-hidden="true" />
              </div>

              <div className="space-y-1">
                <p className="font-mono text-xs uppercase tracking-widest text-[#ffe4ef] m-0">
                  PregMamas Supplement Alarm
                </p>
                <p className="font-mono text-4xl font-bold tracking-tight tabular-nums m-0">
                  {formatTime12h(activeAlarm.time)}
                </p>
                <h2 id="global-alarm-title" className="font-display text-2xl font-semibold pt-1 m-0">
                  Take {activeAlarm.name}
                </h2>
                <p className="text-sm font-medium text-[#ffe4ef] m-0">
                  {activeAlarm.dosage} · Drink a full glass of water
                </p>
                {activeAlarm.notes && (
                  <p className="text-xs text-[#ffd6e7] pt-1 m-0">{activeAlarm.notes}</p>
                )}
              </div>

              <div className="rounded-xl bg-black/20 border border-white/20 px-4 py-2.5 flex items-center justify-between text-xs font-mono">
                <span className="inline-flex items-center gap-1.5 text-[#ffe4ef]">
                  {soundMode === 'custom' && activeCustomName ? (
                    <>
                      <Music className="w-3.5 h-3.5" aria-hidden="true" />
                      <span className="truncate max-w-[170px]">{activeCustomName}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Supplement Alarm Chime</span>
                    </>
                  )}
                </span>
                <span className="font-bold text-white tabular-nums">
                  {formatCountdownMMSS(ringtoneRemainingSec)} / 02:00
                </span>
              </div>

              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => toggleTakenToday(activeAlarm.id)}
                  className="w-full min-h-[48px] rounded-xl bg-white text-[#9d174d] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#ffe4ef] transition-colors cursor-pointer shadow-sm"
                >
                  <Check className="w-4 h-4" aria-hidden="true" />
                  Mark Taken & Stop Alarm
                </button>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => snoozeActiveAlarm(5)}
                    className="min-h-[44px] rounded-xl bg-white/15 border border-white/40 text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-white/25 transition-colors cursor-pointer"
                  >
                    <AlarmClock className="w-4 h-4" aria-hidden="true" />
                    Snooze 5 Min
                  </button>
                  <button
                    type="button"
                    onClick={dismissActiveAlarm}
                    className="min-h-[44px] rounded-xl bg-white/10 border border-white/30 text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                    Stop & Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Snooze Status Indicator */}
      {!activeAlarm && snoozeState && (
        <div className="fixed bottom-4 right-4 z-[90] flex items-center gap-3 rounded-2xl border-2 border-[#db2777] bg-[#fff0f6] px-4 py-2.5 shadow-lg text-xs text-[#3f0d24]">
          <Bell className="w-4 h-4 text-[#be185d] shrink-0" aria-hidden="true" />
          <div>
            <strong className="block text-[#be185d]">Snoozed: {snoozeState.reminder.name}</strong>
            <span className="font-mono text-[11px] tabular-nums">
              Rings again in {formatCountdownMMSS(snoozeRemainingSec)}
            </span>
          </div>
          <button
            type="button"
            onClick={cancelSnooze}
            aria-label="Cancel snooze"
            className="rounded-lg border border-[#ea91b8] bg-white px-2 py-1 text-[11px] font-semibold text-[#9d174d] hover:bg-[#ffe4ef] cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Global Antenatal Clinic Visit Reminder Popup */}
      {!activeAlarm && activeVisitAlert && (
        <div
          role="dialog"
          aria-live="polite"
          aria-labelledby="antenatal-visit-prompt-title"
          className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-[95] rounded-2xl border-2 border-[#be185d] bg-gradient-to-br from-[#fff0f6] via-[#ffe4ef] to-[#ffd6e7] p-4 shadow-xl text-[#3f0d24] space-y-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#be185d] text-white flex items-center justify-center shrink-0">
                <CalendarClock className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#be185d] m-0">
                  {activeVisitAlert.label}
                </p>
                <h3
                  id="antenatal-visit-prompt-title"
                  className="font-display text-lg font-semibold text-[#3f0d24] m-0 leading-tight"
                >
                  {activeVisitAlert.visit.title}
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={dismissVisitAlert}
              aria-label="Dismiss antenatal visit reminder"
              className="rounded-lg p-1 text-[#7e405c] hover:bg-white/70 cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
          <div className="rounded-xl bg-white/85 border border-[#f4b6d0] px-3 py-2 text-xs text-[#3f0d24] space-y-1">
            <p className="font-semibold m-0">
              {activeVisitAlert.visit.date} at {formatTime12h(activeVisitAlert.visit.time || '08:30')} ·{' '}
              {activeVisitAlert.visit.facility}
            </p>
            {activeVisitAlert.visit.notes ? (
              <p className="text-[#5c223d] m-0">Notes: {activeVisitAlert.visit.notes}</p>
            ) : (
              <p className="text-[#5c223d] m-0">
                Remember to pack your Green Maternity Case Record, ID, water bottle, and any questions for your midwife.
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {activeVisitAlert.visit.id !== 'sample-visit' && (
              <button
                type="button"
                onClick={() => toggleAntenatalVisitCompleted(activeVisitAlert.visit.id)}
                className="flex-1 min-h-[38px] rounded-xl bg-[#be185d] px-3 py-2 text-xs font-semibold text-white hover:bg-[#9d174d] inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                Mark Visit Done
              </button>
            )}
            <button
              type="button"
              onClick={dismissVisitAlert}
              className="flex-1 min-h-[38px] rounded-xl border border-[#ea91b8] bg-white px-3 py-2 text-xs font-semibold text-[#9d174d] hover:bg-[#fff7fa] cursor-pointer"
            >
              Got It, Remind Me
            </button>
          </div>
        </div>
      )}

      {/* Global Always-On Hydration Reminder Popup */}
      {!activeAlarm && !activeVisitAlert && activeHydrationPrompt && (
        <div
          role="dialog"
          aria-live="polite"
          aria-labelledby="hydration-prompt-title"
          className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-[94] rounded-2xl border-2 border-[#0284c7] bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#fff0f6] p-4 shadow-xl text-[#0c4a6e] space-y-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#0284c7] text-white flex items-center justify-center shrink-0">
                <Droplets className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#0369a1] m-0">
                  Hydration Check-In · {waterGlassesToday} / 8 Glasses Today
                </p>
                <h3
                  id="hydration-prompt-title"
                  className="font-display text-lg font-semibold text-[#0c4a6e] m-0 leading-tight"
                >
                  Time to drink water &amp; stay hydrated!
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={dismissHydrationPrompt}
              aria-label="Dismiss hydration reminder"
              className="rounded-lg p-1 text-[#0369a1] hover:bg-white/70 cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
          <p className="text-xs text-[#075985] m-0 leading-relaxed">
            Have a full glass of clean water right now, Mama. Staying hydrated supports healthy amniotic fluid, eases headaches and swelling, and keeps you and your baby strong.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => logWaterGlass(1)}
              className="flex-1 min-h-[38px] rounded-xl bg-[#0284c7] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0369a1] inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              I Drank Water (+1 Glass)
            </button>
            <button
              type="button"
              onClick={dismissHydrationPrompt}
              className="min-h-[38px] rounded-xl border border-[#7dd3fc] bg-white px-3 py-2 text-xs font-semibold text-[#0369a1] hover:bg-[#f0f9ff] cursor-pointer"
            >
              Remind Later
            </button>
          </div>
        </div>
      )}

      {/* Global Always-On Meal & Baby Nutrients Reminder Popup */}
      {!activeAlarm && !activeVisitAlert && !activeHydrationPrompt && activeMealPrompt && (
        <div
          role="dialog"
          aria-live="polite"
          aria-labelledby="meal-prompt-title"
          className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-[93] rounded-2xl border-2 border-[#db2777] bg-gradient-to-br from-[#fff7fa] via-[#ffeef5] to-[#fef3c7] p-4 shadow-xl text-[#3f0d24] space-y-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#be185d] text-white flex items-center justify-center shrink-0">
                <Utensils className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#be185d] m-0">
                  Nourish Mama &amp; Baby · {mealsLoggedToday} / 5 Meals &amp; Snacks Today
                </p>
                <h3
                  id="meal-prompt-title"
                  className="font-display text-lg font-semibold text-[#3f0d24] m-0 leading-tight"
                >
                  Time to eat — your baby needs those nutrients!
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={dismissMealPrompt}
              aria-label="Dismiss meal reminder"
              className="rounded-lg p-1 text-[#7e405c] hover:bg-white/70 cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
          <p className="text-xs text-[#5c223d] m-0 leading-relaxed">
            {BABY_NUTRIENT_TIPS[mealTipIndex % BABY_NUTRIENT_TIPS.length]}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => logNourishingMeal(1)}
              className="flex-1 min-h-[38px] rounded-xl bg-[#be185d] px-3 py-2 text-xs font-semibold text-white hover:bg-[#9d174d] inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              I Ate a Meal / Snack (+1)
            </button>
            <button
              type="button"
              onClick={dismissMealPrompt}
              className="min-h-[38px] rounded-xl border border-[#ea91b8] bg-white px-3 py-2 text-xs font-semibold text-[#9d174d] hover:bg-[#fff7fa] cursor-pointer"
            >
              Remind Later
            </button>
          </div>
        </div>
      )}

      {/* Global Hourly "Has Your Baby Moved Today?" Reminder Prompt */}
      {!activeAlarm && !activeVisitAlert && !activeHydrationPrompt && !activeMealPrompt && activeHourlyMovementPrompt && (
        <div
          role="dialog"
          aria-live="polite"
          aria-labelledby="hourly-movement-prompt-title"
          className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-[92] rounded-2xl border-2 border-[#db2777] bg-gradient-to-br from-[#fff0f6] via-[#ffe4ef] to-[#ffd6e7] p-4 shadow-xl text-[#3f0d24] space-y-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#be185d] text-white flex items-center justify-center shrink-0">
                <BellRing className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#be185d] m-0">
                  Hourly Check-In · Every 1 Hour
                </p>
                <h3
                  id="hourly-movement-prompt-title"
                  className="font-display text-lg font-semibold text-[#3f0d24] m-0 leading-tight"
                >
                  Has your baby moved today?
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={dismissHourlyMovementPrompt}
              aria-label="Dismiss hourly movement reminder"
              className="rounded-lg p-1 text-[#7e405c] hover:bg-white/70 cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
          <p className="text-xs text-[#5c223d] m-0 leading-relaxed">
            If baby feels quiet, drink cold water, have sweet fruit or yoghurt, lie on your left side, and log today’s count in your Daily Movement Diary.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={confirmHourlyBabyMovedToday}
              className="flex-1 min-h-[38px] rounded-xl bg-[#be185d] px-3 py-2 text-xs font-semibold text-white hover:bg-[#9d174d] inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              Yes, Baby Moved (+1)
            </button>
            <button
              type="button"
              onClick={dismissHourlyMovementPrompt}
              className="min-h-[38px] rounded-xl border border-[#ea91b8] bg-white px-3 py-2 text-xs font-semibold text-[#9d174d] hover:bg-[#fff7fa] cursor-pointer"
            >
              Remind in 1 Hour
            </button>
          </div>
        </div>
      )}
    </AlarmContext.Provider>
  );
}

export function useSupplementAlarms() {
  const ctx = useContext(AlarmContext);
  if (!ctx) {
    throw new Error('useSupplementAlarms must be used inside AlarmProvider');
  }
  return ctx;
}
