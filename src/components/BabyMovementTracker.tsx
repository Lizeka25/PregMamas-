import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Baby,
  Calendar,
  CheckCircle2,
  Clock,
  Footprints,
  Heart,
  Music,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Save,
  ShieldAlert,
  Square,
  Trash2,
  Undo2,
  Volume2,
} from 'lucide-react';
import { IMAGES } from '../data/pregmamasData';
import { PinkDatePickerButton } from './PinkDatePickerButton';

const KICK_STORAGE_KEY = 'pregmamas_kick_sessions_v1';
const DAILY_LOG_STORAGE_KEY = 'pregmamas_daily_movements_v1';
const GOAL_KICKS = 10;
const MIN_MOVEMENT_SOUND_SEC = 120; // Play for at least 2 minutes to rouse baby

type TriggerSoundId = 'wakeup-bells' | 'double-tap' | 'upbeat-melody';

interface KickSession {
  id: string;
  dateLabel: string;
  kicks: number;
  durationSec: number;
  status: 'Goal Reached (10+)' | 'Logged Session';
}

interface DailyMovementMap {
  [isoDate: string]: number;
}

const TRIGGER_SOUNDS: Array<{
  id: TriggerSoundId;
  name: string;
  desc: string;
  tip: string;
}> = [
  {
    id: 'wakeup-bells',
    name: 'Bright Acoustic Wake-Up Bells',
    desc: 'Crisp ascending glockenspiel chimes (659–1318 Hz) tuned to catch baby’s hearing and trigger wiggles.',
    tip: 'Play near belly for 2–3 minutes after drinking cold water to wake a napping baby.',
  },
  {
    id: 'double-tap',
    name: 'Double-Tap Tummy Stimulus Chime',
    desc: 'Two playful crisp tones separated by short pauses—gentle acoustic contrast that prompts fetal kicks & stretches.',
    tip: 'Great when resting on your left side during quiet evenings to start a kick session.',
  },
  {
    id: 'upbeat-melody',
    name: 'Cheerful Upbeat Tummy Melody',
    desc: 'Sprightly bright major-key rhythm (instead of sleepy lullabies) to stimulate movement & alertness.',
    tip: 'Keep speaker gently beside belly at normal speaking volume—never press loud headphones directly on skin.',
  },
];

function getTodayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function BabyMovementTracker({
  onGoEmergency,
}: {
  onGoEmergency?: () => void;
}) {
  const [selectedSound, setSelectedSound] = useState<TriggerSoundId>('wakeup-bells');
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [soundElapsedSec, setSoundElapsedSec] = useState(0);
  const [volume, setVolume] = useState(0.65);

  const [kicks, setKicks] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [tapPulse, setTapPulse] = useState(false);

  const todayIso = getTodayIso();

  const [dailyLogs, setDailyLogs] = useState<DailyMovementMap>(() => {
    try {
      const raw = localStorage.getItem(DAILY_LOG_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DailyMovementMap;
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {
      // ignore
    }
    return {};
  });

  const [manualDate, setManualDate] = useState(todayIso);
  const [manualCountInput, setManualCountInput] = useState('');

  const [sessions, setSessions] = useState<KickSession[]>(() => {
    try {
      const raw = localStorage.getItem(KICK_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as KickSession[];
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const soundLoopRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(KICK_STORAGE_KEY, JSON.stringify(sessions));
    } catch {
      // ignore
    }
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem(DAILY_LOG_STORAGE_KEY, JSON.stringify(dailyLogs));
    } catch {
      // ignore
    }
  }, [dailyLogs]);

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(
        Math.max(0.02, volume * 0.5),
        audioCtxRef.current.currentTime,
        0.04
      );
    }
  }, [volume]);

  useEffect(() => {
    if (!isPlayingSound) return;
    const id = window.setInterval(() => {
      setSoundElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [isPlayingSound]);

  const stopSound = () => {
    if (soundLoopRef.current !== null) {
      window.clearInterval(soundLoopRef.current);
      soundLoopRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {
        // ignore
      }
      audioCtxRef.current = null;
      masterGainRef.current = null;
    }
    setIsPlayingSound(false);
    setSoundElapsedSec(0);
  };

  useEffect(() => {
    return () => {
      stopSound();
    };
  }, []);

  const startSound = (track: TriggerSoundId) => {
    stopSound();
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const master = ctx.createGain();
      master.gain.setValueAtTime(Math.max(0.02, volume * 0.5), ctx.currentTime);
      master.connect(ctx.destination);

      audioCtxRef.current = ctx;
      masterGainRef.current = master;
      setIsPlayingSound(true);

      const triggerTone = (freq: number, offset: number, duration: number, type: OscillatorType = 'triangle') => {
        if (!audioCtxRef.current || !masterGainRef.current) return;
        const now = audioCtxRef.current.currentTime;
        const osc = audioCtxRef.current.createOscillator();
        const g = audioCtxRef.current.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now + offset);
        g.gain.setValueAtTime(0.001, now + offset);
        g.gain.exponentialRampToValueAtTime(0.65, now + offset + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, now + offset + duration);
        osc.connect(g);
        g.connect(masterGainRef.current);
        osc.start(now + offset);
        osc.stop(now + offset + duration + 0.03);
      };

      if (track === 'wakeup-bells') {
        const bells = [659.25, 783.99, 987.77, 1174.66, 1318.51, 987.77];
        let step = 0;
        const playBell = () => {
          triggerTone(bells[step % bells.length], 0, 0.28, 'sine');
          triggerTone(bells[step % bells.length] * 2, 0.02, 0.14, 'sine');
          step += 1;
        };
        playBell();
        soundLoopRef.current = window.setInterval(playBell, 310);
      } else if (track === 'double-tap') {
        const playDoubleTap = () => {
          triggerTone(880, 0, 0.12, 'triangle');
          triggerTone(1174.66, 0.16, 0.16, 'triangle');
        };
        playDoubleTap();
        soundLoopRef.current = window.setInterval(playDoubleTap, 920);
      } else {
        const cheerfulNotes = [
          587.33, 739.99, 880, 1174.66, 880, 987.77, 783.99, 1174.66,
        ];
        let step = 0;
        const playBeat = () => {
          triggerTone(cheerfulNotes[step % cheerfulNotes.length], 0, 0.22, 'triangle');
          step += 1;
        };
        playBeat();
        soundLoopRef.current = window.setInterval(playBeat, 260);
      }
    } catch {
      setIsPlayingSound(false);
    }
  };

  const handleToggleSound = (trackId?: TriggerSoundId) => {
    const target = trackId || selectedSound;
    if (trackId && trackId !== selectedSound) {
      setSelectedSound(target);
      startSound(target);
      return;
    }
    if (isPlayingSound) {
      stopSound();
    } else {
      startSound(target);
    }
  };

  const incrementDailyTotal = (dateIso: string, amount: number) => {
    setDailyLogs((prev) => ({
      ...prev,
      [dateIso]: Math.max(0, (prev[dateIso] || 0) + amount),
    }));
  };

  const handleKickTap = () => {
    if (!timerRunning) setTimerRunning(true);
    setKicks((k) => k + 1);
    incrementDailyTotal(todayIso, 1);
    setTapPulse(true);
    window.setTimeout(() => setTapPulse(false), 200);
  };

  const handleUndoKick = () => {
    if (kicks <= 0) return;
    setKicks((k) => Math.max(0, k - 1));
    incrementDailyTotal(todayIso, -1);
  };

  const handleResetCounter = () => {
    setTimerRunning(false);
    setKicks(0);
    setElapsedSec(0);
  };

  const handleSaveSession = () => {
    if (kicks === 0 && elapsedSec === 0) return;
    const newSession: KickSession = {
      id: `kick-${Date.now()}`,
      dateLabel: new Date().toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      kicks,
      durationSec: elapsedSec,
      status: kicks >= GOAL_KICKS ? 'Goal Reached (10+)' : 'Logged Session',
    };
    setSessions((prev) => [newSession, ...prev].slice(0, 10));
    handleResetCounter();
  };

  const handleManualDailySave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(manualCountInput);
    if (!manualDate || Number.isNaN(parsed) || parsed < 0) return;
    setDailyLogs((prev) => ({
      ...prev,
      [manualDate]: Math.round(parsed),
    }));
    setManualCountInput('');
  };

  const sortedDailyEntries = useMemo(() => {
    return Object.entries(dailyLogs).sort((a, b) => b[0].localeCompare(a[0]));
  }, [dailyLogs]);

  const todayTotalMoves = dailyLogs[todayIso] || 0;
  const progressPct = Math.min(100, Math.round((kicks / GOAL_KICKS) * 100));
  const twoHoursReached = elapsedSec >= 7200 && kicks < GOAL_KICKS;

  return (
    <section
      aria-label="Baby Movement Trigger Sound Tool and Daily Movement Counter"
      className="rounded-3xl border-2 border-[#ea91b8] bg-gradient-to-br from-[#ffe4ef] via-[#fff0f6] to-[#ffd6e7] p-6 sm:p-8 space-y-8 shadow-sm"
    >
      {/* Header with Picture */}
      <div className="grid gap-6 lg:grid-cols-12 items-center">
        <div className="lg:col-span-7 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-xl border border-[#ea91b8] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#be185d]">
            <Footprints className="w-4 h-4 text-[#db2777]" aria-hidden="true" />
            <span>Pink Baby Movement Trigger Sounds & Daily Log</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#3f0d24] m-0">
            Stimulate Baby to Move & Log Movements Per Day
          </h2>
          <p className="text-sm sm:text-base text-[#5c223d] leading-relaxed m-0">
            Play the bright acoustic wake-up chimes below to gently rouse a resting baby and trigger movements—then tap the pink counter to track your 10-kick session and total baby movements per day.
          </p>
        </div>

        <div className="lg:col-span-5">
          <figure className="m-0 rounded-2xl border-2 border-[#ea91b8] bg-[#fff7fa] p-2.5 shadow-sm space-y-2">
            <img
              src={IMAGES.navBabyKicks}
              alt="Smiling expectant mother playing gentle acoustic chimes near her belly to prompt baby movements"
              referrerPolicy="no-referrer"
              className="w-full aspect-[4/3] object-cover rounded-xl"
            />
            <figcaption className="text-[11px] text-center font-medium text-[#7e405c]">
              Bright acoustic chimes + a cool glass of water + lying on your left side gently wake a sleepy baby to kick.
            </figcaption>
          </figure>
        </div>
      </div>

      {/* Main Grid: Movement-Triggering Sound Tool + Pink Kick Counter */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left: Baby-Movement-Triggering Sound Generator */}
        <div className="lg:col-span-5 rounded-2xl border-2 border-[#ea91b8] bg-[#fff7fa] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#be185d]">
                <Music className="w-4 h-4" aria-hidden="true" />
                Acoustic Wake-Up Sound Tool
              </span>
              <h3 className="font-display text-xl font-semibold text-[#3f0d24] mt-1 m-0">
                Sounds Designed to Trigger Movement
              </h3>
            </div>
            {isPlayingSound && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#be185d] px-2.5 py-1 font-mono text-[11px] font-bold text-white tabular-nums">
                <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                {formatDuration(soundElapsedSec)} / {formatDuration(MIN_MOVEMENT_SOUND_SEC)}+
              </span>
            )}
          </div>

          <p className="text-xs text-[#5c223d] bg-[#ffeef5] border border-[#f4b6d0] rounded-xl px-3 py-2 m-0">
            Plays continuously until stopped—keep near belly for <strong>at least 2:00 minutes</strong> to help wake baby and trigger movements.
          </p>

          <div className="space-y-2.5">
            {TRIGGER_SOUNDS.map((track) => {
              const active = selectedSound === track.id;
              const playingThis = active && isPlayingSound;
              return (
                <div
                  key={track.id}
                  className={`rounded-xl border p-3.5 transition-colors ${
                    active
                      ? 'border-[#db2777] bg-[#ffe4ef]'
                      : 'border-[#f4b6d0] bg-white hover:bg-[#fff0f6]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <strong className="block text-sm font-semibold text-[#3f0d24]">
                        {track.name}
                      </strong>
                      <span className="block text-xs text-[#5c223d] mt-0.5 leading-relaxed">
                        {track.desc}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleSound(track.id)}
                      className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold shrink-0 cursor-pointer transition-colors ${
                        playingThis
                          ? 'bg-[#9d174d] text-white'
                          : 'bg-[#db2777] text-white hover:bg-[#be185d]'
                      }`}
                    >
                      {playingThis ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                          Trigger Sound
                        </>
                      )}
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] font-medium text-[#9d174d] m-0">
                    Tip: {track.tip}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-[#f4b6d0] bg-[#ffeef5] p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#3f0d24]">
              <label htmlFor="baby-sound-vol" className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-[#be185d]" aria-hidden="true" />
                Speaker Volume (Safe Speaking Level)
              </label>
              <span className="font-mono text-[#be185d] tabular-nums">
                {Math.round(volume * 100)}%
              </span>
            </div>
            <input
              id="baby-sound-vol"
              type="range"
              min={0.15}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full accent-[#db2777] cursor-pointer"
            />
          </div>
        </div>

        {/* Right: Pink Kick Counter + Daily Movement Totals */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border-2 border-[#ea91b8] bg-[#fff7fa] p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f4b6d0] pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#be185d] m-0">
                  Pink Movement Counter
                </p>
                <h3 className="font-display text-2xl font-semibold text-[#3f0d24] mt-0.5 m-0">
                  Goal: 10 Movements within 2 Hours
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-xl border border-[#ea91b8] bg-[#ffe4ef] px-3 py-2 text-xs font-bold text-[#9d174d] tabular-nums">
                  <span>Today: {todayTotalMoves} moves</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-xl border border-[#ea91b8] bg-[#ffe4ef] px-3 py-2 font-mono text-xs font-bold text-[#9d174d] tabular-nums">
                  <Clock className="w-3.5 h-3.5 text-[#db2777]" aria-hidden="true" />
                  {formatDuration(elapsedSec)}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold text-[#5c223d]">
                  Current Session Progress
                </span>
                <span className="font-display text-2xl font-bold text-[#be185d] tabular-nums">
                  {kicks} / {GOAL_KICKS} kicks
                </span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full border border-[#ea91b8] bg-[#ffe4ef]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#f472b6] via-[#db2777] to-[#be185d] transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              {kicks >= GOAL_KICKS && (
                <p className="flex items-center gap-1.5 text-xs font-semibold text-[#9d174d] m-0">
                  <CheckCircle2 className="w-4 h-4 text-[#be185d]" aria-hidden="true" />
                  Wonderful! You counted 10 baby movements in {formatDuration(elapsedSec)}. Save your session below.
                </p>
              )}
            </div>

            <div className="flex flex-col items-center justify-center py-2">
              <button
                type="button"
                onClick={handleKickTap}
                className={`w-full sm:w-auto sm:min-w-[300px] min-h-[82px] rounded-2xl border-2 border-[#be185d] bg-gradient-to-r from-[#be185d] via-[#db2777] to-[#ec4899] px-8 py-4 text-white shadow-md transition-transform cursor-pointer flex items-center justify-center gap-3 ${
                  tapPulse ? 'scale-[0.97]' : 'hover:scale-[1.01]'
                }`}
              >
                <Heart className="w-7 h-7 fill-current text-[#ffe4ef]" aria-hidden="true" />
                <span className="text-left">
                  <span className="block text-lg font-bold leading-tight">
                    Tap When Baby Moves (+1)
                  </span>
                  <span className="block text-xs text-[#ffe4ef]">
                    Adds to session & today’s daily movement total
                  </span>
                </span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setTimerRunning((r) => !r)}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#ea91b8] bg-[#ffe4ef] px-4 py-2 text-xs font-semibold text-[#9d174d] hover:bg-[#ffd6e7] cursor-pointer"
              >
                {timerRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                    Pause Timer
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" aria-hidden="true" />
                    Start Timer
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleUndoKick}
                disabled={kicks === 0}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#ea91b8] bg-white px-4 py-2 text-xs font-semibold text-[#5c223d] hover:bg-[#ffe4ef] disabled:opacity-50 cursor-pointer"
              >
                <Undo2 className="w-3.5 h-3.5" aria-hidden="true" />
                Undo Last
              </button>

              <button
                type="button"
                onClick={handleSaveSession}
                disabled={kicks === 0}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#be185d] px-4 py-2 text-xs font-semibold text-white hover:bg-[#9d174d] disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" aria-hidden="true" />
                Save Session
              </button>

              <button
                type="button"
                onClick={handleResetCounter}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#ea91b8] bg-white px-3.5 py-2 text-xs font-medium text-[#5c223d] hover:bg-[#ffe4ef] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                Reset
              </button>
            </div>

            <div
              className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                twoHoursReached
                  ? 'border-[#be123c] bg-[#ffe0e9]'
                  : 'border-[#f4b6d0] bg-[#ffeef5]'
              }`}
            >
              <div className="flex items-start gap-2.5 text-xs text-[#3f0d24]">
                <ShieldAlert className="w-4 h-4 shrink-0 text-[#be123c] mt-0.5" aria-hidden="true" />
                <p className="m-0 leading-relaxed">
                  <strong>Same-Day Clinic Rule:</strong> From week 24+, if baby moves noticeably less than normal or does not reach 10 movements in 2 hours, go straight to your clinic/MOU or call 10177 / 112.
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

          {/* Log How Many Times Baby Moved Per Day */}
          <div className="rounded-2xl border-2 border-[#ea91b8] bg-[#fff7fa] p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#be185d] m-0 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                  Daily Movement Diary
                </p>
                <h3 className="font-display text-xl font-semibold text-[#3f0d24] mt-0.5 m-0">
                  Log How Many Times Baby Moved Per Day
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
                  Total Movements That Day
                </label>
                <input
                  id="daily-move-count"
                  type="number"
                  min={0}
                  max={500}
                  value={manualCountInput}
                  onChange={(e) => setManualCountInput(e.target.value)}
                  placeholder="e.g., 24"
                  className="rounded-xl border border-[#ea91b8] bg-white px-3 py-2 font-mono text-xs text-[#3f0d24] w-full"
                />
              </div>
              <button
                type="submit"
                className="min-h-[38px] rounded-xl bg-[#be185d] px-4 py-2 text-xs font-semibold text-white hover:bg-[#9d174d] cursor-pointer"
              >
                Save Daily Count
              </button>
            </form>

            {sortedDailyEntries.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#ea91b8] bg-white p-4 text-xs text-[#7e405c] text-center m-0">
                No daily totals logged yet. Every tap on the pink kick counter adds to today automatically, or enter a day’s total above.
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
                        {total} total baby movements
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

            {sessions.length > 0 && (
              <div className="pt-3 border-t border-[#f4b6d0] space-y-2">
                <strong className="text-xs font-semibold uppercase tracking-wider text-[#9d174d] flex items-center gap-1.5">
                  <Baby className="w-4 h-4" aria-hidden="true" />
                  Timed 10-Kick Sessions
                </strong>
                <div className="grid gap-2 sm:grid-cols-2">
                  {sessions.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-[#f4b6d0] bg-[#ffeef5] px-3 py-2 text-xs"
                    >
                      <div>
                        <strong className="block text-[#3f0d24]">
                          {s.kicks} kicks · {formatDuration(s.durationSec)}
                        </strong>
                        <span className="text-[11px] text-[#7e405c]">
                          {s.dateLabel} · {s.status}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSessions((prev) => prev.filter((item) => item.id !== s.id))}
                        aria-label="Delete kick session"
                        className="text-[#7e405c] hover:text-[#be123c] cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
