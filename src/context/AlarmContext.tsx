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
  Check,
  Music,
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
  const remindersRef = useRef(reminders);
  remindersRef.current = reminders;

  const activeCustomUrl = idbTrackUrl || audioMeta?.dataUrl || null;
  const activeCustomName = idbFileName || audioMeta?.fileName || '';

  // Register lightweight service worker so Android Chrome & Desktop Browser Alerts work cleanly
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
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
          'Native browser notifications are unavailable here—PregMamas full-screen pink alarm popup, sound & vibration are active instead.'
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
  }, [snoozeState, triggerAlarm]);

  const requestNotifications = useCallback(async () => {
    await unlockAudio();
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotifPermission('unsupported');
      setBrowserAlertNotice(
        'This browser does not support native OS notifications. PregMamas in-app pink alarm modal, ringtone & vibration will still alert you.'
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
          'Permission was denied or blocked by the embedded preview. Click the lock/site-settings icon in your browser bar (or open PregMamas in a full tab) to allow Notifications. In-app pink alerts still work!'
        );
      } else {
        setBrowserAlertNotice(
          'Notification prompt was dismissed. Click "Enable Browser Alerts" again or allow notifications in browser site settings.'
        );
      }
    } catch {
      setBrowserAlertNotice(
        'Browser prompt was blocked in this preview frame—in-app pink alarm popup, sound & vibration still work cleanly.'
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
          setAudioNotice(`Saved "${file.name}" permanently as your pink supplement alarm tone.`);
        })
        .catch(() => {
          setAudioNotice(`Loaded "${file.name}" as your active pink alarm tone.`);
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

  const snoozeRemainingSec = useMemo(() => {
    if (!snoozeState) return 0;
    return Math.max(0, Math.ceil((snoozeState.triggerAtMs - now.getTime()) / 1000));
  }, [now, snoozeState]);

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
                      <span>Pink Alarm Chime</span>
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
