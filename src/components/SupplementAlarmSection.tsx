import { useMemo, useRef, useState } from 'react';
import {
  AlarmClock,
  Bell,
  BellRing,
  Check,
  Clock,
  Music,
  Play,
  Plus,
  RotateCcw,
  Square,
  Trash2,
  Upload,
  Volume2,
} from 'lucide-react';
import {
  IMAGES,
  SUPPLEMENT_GUIDES,
} from '../data/pregmamasData';
import { SafeImage } from './SafeImage';
import { PinkTimePicker } from './PinkTimePicker';
import { PartnerMessagingSection } from './PartnerMessagingSection';
import {
  formatCountdownMMSS,
  formatTime12h,
  getTodayDateString,
  useSupplementAlarms,
} from '../context/AlarmContext';
import { useTranslatedTexts } from '../context/LanguageContext';

const SUPPLEMENT_TEXTS: string[] = [
  ...SUPPLEMENT_GUIDES.flatMap((g) => [g.nutrient, g.role, g.foodPairings]),
  '01. Pregnancy Nutrition & Daily Supplement Alarm',
  'Daily Supplement Schedule & Real Alarm Clock',
  'Taking your prenatal vitamins, iron, folic acid, and calcium every day supports baby’s brain and spine while preventing maternal anemia. Set your own daily times and upload your favourite alarm song—PregMamas watches the clock continuously across all pages, rings for 2 full minutes with vibration & Snooze, and sends a real browser notification.',
  'Your Personal Daily Supplement Alarm Studio',
  'Upload Your Own Alarm Music',
  'Set Your Own Supplement Reminder',
  'Add Daily Alarm',
  'Test Alarm & Browser Alert',
];

export function SupplementAlarmSection() {
  const stableTexts = useMemo(() => SUPPLEMENT_TEXTS, []);
  const { translated } = useTranslatedTexts(stableTexts);
  const {
    reminders,
    now,
    activeCustomName,
    activeCustomUrl,
    soundMode,
    setSoundMode,
    audioNotice,
    audioUnlocked,
    unlockAudio,
    isPlayingMusic,
    ringtoneRemainingSec,
    activeAlarm,
    notifPermission,
    browserAlertNotice,
    requestNotifications,
    triggerTestAlarm,
    playSelectedAlarmSound,
    stopAlarmAudio,
    dismissActiveAlarm,
    snoozeActiveAlarm,
    addReminder,
    toggleTakenToday,
    toggleEnabled,
    updateTime,
    deleteReminder,
    resetTodayTaken,
    handleMusicUpload,
    removeUploadedMusic,
  } = useSupplementAlarms();

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('09:00');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const todayStr = getTodayDateString();

  const sortedReminders = useMemo(() => {
    return [...reminders].sort((a, b) => a.time.localeCompare(b.time));
  }, [reminders]);

  const takenCount = useMemo(
    () => reminders.filter((r) => r.takenDate === todayStr).length,
    [reminders, todayStr]
  );

  const nextAlarmInfo = useMemo(() => {
    const enabledPending = sortedReminders.filter(
      (r) => r.enabled && r.takenDate !== todayStr
    );
    if (enabledPending.length === 0) return null;

    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    let next = enabledPending.find((r) => {
      const [h, m] = r.time.split(':').map(Number);
      return h * 60 + m > nowMinutes;
    });
    let isTomorrow = false;
    if (!next) {
      next = enabledPending[0];
      isTomorrow = true;
    }

    const [nh, nm] = next.time.split(':').map(Number);
    let diffMinutes = nh * 60 + nm - nowMinutes;
    if (isTomorrow) diffMinutes += 24 * 60;
    const hrs = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;

    return {
      reminder: next,
      countdown: hrs > 0 ? `in ${hrs}h ${mins}m` : `in ${mins}m`,
    };
  }, [sortedReminders, now, todayStr]);

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleMusicUpload(file);
  };

  const onRemoveMusic = () => {
    removeUploadedMusic();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Please enter a supplement name (e.g., Folic Acid, Iron, Water).');
      return;
    }
    if (!time) {
      setFormError('Please select a daily reminder time.');
      return;
    }
    addReminder({
      name: name.trim(),
      dosage: dosage.trim() || '1 serving with water',
      time,
      notes: notes.trim() || 'Daily prenatal supplement alarm',
    });
    setName('');
    setDosage('');
    setNotes('');
    setFormError('');
  };

  return (
    <section id="supplements" className="border-t border-[#f4b6d0] py-14 lg:py-20 bg-[#fff7fa]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#be185d]">
              {translated[12] || SUPPLEMENT_TEXTS[12]}
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#3f0d24] sm:text-4xl">
              {translated[13] || SUPPLEMENT_TEXTS[13]}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#5c223d]">
              {translated[14] || SUPPLEMENT_TEXTS[14]}
            </p>

            <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {SUPPLEMENT_GUIDES.map((item, idx) => (
                <div
                  key={item.nutrient}
                  className="rounded-xl border border-[#ea91b8] bg-[#ffeef5] p-4"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-sans text-sm font-semibold text-[#3f0d24]">
                      {translated[idx * 3] || item.nutrient}
                    </h3>
                    <span className="font-mono text-xs font-semibold text-[#be185d] tabular-nums">
                      {item.dailyTarget}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#5c223d]">
                    {translated[idx * 3 + 1] || item.role}
                  </p>
                  <p className="mt-2 text-xs text-[#5c223d]">
                    <span className="font-medium text-[#3f0d24]">Food pairings:</span>{' '}
                    {translated[idx * 3 + 2] || item.foodPairings}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <SafeImage
              src={IMAGES.supplements}
              alt="Daily prenatal vitamins, folic acid, iron capsules, fresh leafy greens, avocado, and a tall glass of water"
              caption="Take iron with water or citrus juice; space calcium at least 2 hours apart for better absorption."
              aspectClass="aspect-[4/3]"
            />
          </div>
        </div>

        {/* Inline Active Ringing Banner (complements Global Modal) */}
        {activeAlarm && (
          <div
            role="alert"
            className="mb-8 flex flex-col justify-between gap-4 rounded-2xl border-2 border-[#db2777] bg-gradient-to-r from-[#be185d] via-[#db2777] to-[#ec4899] p-5 text-white shadow-md sm:flex-row sm:items-center"
          >
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20">
                <BellRing className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-[#ffe4ef] tabular-nums">
                  Supplement Alarm · {formatTime12h(activeAlarm.time)}
                  {ringtoneRemainingSec > 0
                    ? ` · Ringing ${formatCountdownMMSS(ringtoneRemainingSec)} left`
                    : ''}
                  {soundMode === 'custom' && activeCustomName ? ` · Playing ${activeCustomName}` : ''}
                </p>
                <p className="mt-0.5 text-lg font-semibold">
                  Time to take {activeAlarm.name} ({activeAlarm.dosage})
                </p>
                <p className="mt-0.5 text-sm text-[#fff0f6]">
                  Drink a full glass of water. {activeAlarm.notes}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => toggleTakenToday(activeAlarm.id)}
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#9d174d] transition-colors hover:bg-[#ffe4ef] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Check className="h-4 w-4" aria-hidden="true" />
                Mark Taken Now
              </button>
              <button
                type="button"
                onClick={() => snoozeActiveAlarm(5)}
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-white/50 bg-white/15 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/25 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <AlarmClock className="h-4 w-4" aria-hidden="true" />
                Snooze 5m
              </button>
              <button
                type="button"
                onClick={dismissActiveAlarm}
                className="min-h-[42px] rounded-xl border border-white/50 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/25 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Stop & Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Pink Interactive Alarm Workbench */}
        <div className="rounded-3xl border-2 border-[#ea91b8] bg-gradient-to-br from-[#ffe4ef] via-[#fff0f6] to-[#ffd6e7] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-[#ea91b8] pb-6 lg:flex-row lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#5c223d]">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#ea91b8] bg-white px-2.5 py-1 font-mono font-semibold text-[#be185d] tabular-nums">
                  <Clock className="h-3.5 w-3.5 text-[#db2777]" aria-hidden="true" />
                  {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span className="rounded-lg border border-[#ea91b8] bg-[#fff7fa] px-2.5 py-1 font-medium tabular-nums">
                  Taken today: <strong className="text-[#be185d]">{takenCount}</strong> / {reminders.length}
                </span>
                {nextAlarmInfo && (
                  <span className="rounded-lg border border-[#ea91b8] bg-[#fff7fa] px-2.5 py-1 tabular-nums">
                    Next alarm: <strong className="text-[#be185d]">{nextAlarmInfo.reminder.name}</strong> ({formatTime12h(nextAlarmInfo.reminder.time)}, {nextAlarmInfo.countdown})
                  </span>
                )}
              </div>
              <h3 className="mt-2.5 text-xl font-semibold text-[#3f0d24]">
                {translated[15] || SUPPLEMENT_TEXTS[15]}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {!audioUnlocked && (
                <button
                  type="button"
                  onClick={() => void unlockAudio()}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#db2777] bg-white px-3.5 py-2 text-xs font-semibold text-[#be185d] transition-colors hover:bg-[#ffe4ef] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Arm Alarm Sound
                </button>
              )}

              {isPlayingMusic ? (
                <button
                  type="button"
                  onClick={stopAlarmAudio}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#be185d] bg-[#be185d] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#9d174d] whitespace-nowrap shrink-0 cursor-pointer tabular-nums"
                >
                  <Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  Stop Ringtone ({formatCountdownMMSS(ringtoneRemainingSec)})
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void triggerTestAlarm()}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#db2777] bg-[#db2777] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#be185d] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <BellRing className="h-3.5 w-3.5" aria-hidden="true" />
                  {translated[19] || SUPPLEMENT_TEXTS[19]}
                </button>
              )}

              {notifPermission !== 'unsupported' && notifPermission !== 'granted' && (
                <button
                  type="button"
                  onClick={() => void requestNotifications()}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#ea91b8] bg-white px-3.5 py-2 text-xs font-semibold text-[#9d174d] transition-colors hover:bg-[#ffe4ef] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Bell className="h-3.5 w-3.5 text-[#be185d]" aria-hidden="true" />
                  Enable Browser Alerts
                </button>
              )}
              {notifPermission === 'granted' && (
                <span className="rounded-xl border border-[#ea91b8] bg-white px-3 py-2 text-xs font-semibold text-[#be185d] whitespace-nowrap">
                  Browser Alerts On
                </span>
              )}
              <button
                type="button"
                onClick={resetTodayTaken}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#ea91b8] bg-white px-3.5 py-2 text-xs font-medium text-[#5c223d] transition-colors hover:bg-[#ffe4ef] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Reset Today
              </button>
            </div>
          </div>

          {/* Browser Alert Status Feedback */}
          {browserAlertNotice && (
            <div
              role="status"
              className="mt-4 rounded-xl border border-[#ea91b8] bg-white px-4 py-2.5 text-xs text-[#3f0d24]"
            >
              <strong className="text-[#be185d]">Browser Alert Status:</strong> {browserAlertNotice}
            </div>
          )}

          {/* Custom Pink Alarm Music Upload Bar */}
          <div className="mt-6 rounded-2xl border border-[#ea91b8] bg-[#fff7fa] p-4 sm:p-5">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#be185d]">
                  <Music className="h-4 w-4" aria-hidden="true" />
                  <span>{translated[16] || SUPPLEMENT_TEXTS[16]}</span>
                </div>
                <p className="text-xs text-[#5c223d] m-0">
                  Choose any favourite song or soothing voice note (.mp3, .wav, .m4a) from your phone or computer—it saves permanently and loops for 2 full minutes when your alarm rings.
                </p>
                {activeCustomName && (
                  <p className="text-xs font-semibold text-[#9d174d] m-0">
                    Uploaded track: <span className="underline">{activeCustomName}</span> ({soundMode === 'custom' ? 'Active Alarm Tone' : 'Saved'})
                  </p>
                )}
                {audioNotice && (
                  <p className="text-xs font-medium text-[#be185d] m-0" role="status">
                    {audioNotice}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <input
                  ref={fileInputRef}
                  id="alarm-music-upload"
                  type="file"
                  accept="audio/*"
                  onChange={onFileSelected}
                  className="sr-only"
                />
                <label
                  htmlFor="alarm-music-upload"
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-[#db2777] bg-[#ffe4ef] px-4 py-2 text-xs font-semibold text-[#9d174d] transition-colors hover:bg-[#ffd6e7] cursor-pointer whitespace-nowrap"
                >
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                  {activeCustomName ? 'Change Alarm Music' : 'Upload Alarm Music'}
                </label>

                {activeCustomUrl && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setSoundMode('custom');
                        if (isPlayingMusic) {
                          stopAlarmAudio();
                        } else {
                          void playSelectedAlarmSound(true);
                        }
                      }}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#be185d] bg-[#be185d] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#9d174d] cursor-pointer whitespace-nowrap"
                    >
                      {isPlayingMusic ? (
                        <>
                          <Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                          Stop Preview
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                          Play My Song
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSoundMode(soundMode === 'custom' ? 'chime' : 'custom')}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#ea91b8] bg-white px-3 py-2 text-xs font-semibold text-[#5c223d] hover:bg-[#ffe4ef] cursor-pointer whitespace-nowrap"
                    >
                      Tone: {soundMode === 'custom' ? 'My Music' : 'Alarm Chime'}
                    </button>

                    <button
                      type="button"
                      onClick={onRemoveMusic}
                      aria-label="Remove uploaded alarm music"
                      className="inline-flex min-h-[40px] items-center gap-1 rounded-xl border border-[#f4b6d0] bg-white px-3 py-2 text-xs font-medium text-[#be123c] hover:bg-[#ffe0e9] cursor-pointer whitespace-nowrap"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Existing Reminders List */}
            <div className="space-y-3 lg:col-span-7">
              {sortedReminders.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#ea91b8] bg-[#fff7fa] p-8 text-center">
                  <p className="text-sm font-medium text-[#3f0d24]">
                    No supplement alarms set yet.
                  </p>
                  <p className="mt-1 text-xs text-[#5c223d]">
                    Use the form on the right to schedule your own daily supplement and water reminders.
                  </p>
                </div>
              ) : (
                sortedReminders.map((reminder) => {
                  const isTaken = reminder.takenDate === todayStr;
                  return (
                    <div
                      key={reminder.id}
                      className={`flex flex-col justify-between gap-4 rounded-2xl border p-4 transition-colors sm:flex-row sm:items-center ${
                        isTaken
                          ? 'border-[#db2777] bg-[#ffd6e7]/75'
                          : 'border-[#ea91b8] bg-[#fff7fa]'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => toggleTakenToday(reminder.id)}
                            aria-label={`Mark ${reminder.name} as ${isTaken ? 'not taken' : 'taken'} today`}
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors cursor-pointer ${
                              isTaken
                                ? 'border-[#be185d] bg-[#be185d] text-white'
                                : 'border-[#db2777] bg-white text-transparent hover:border-[#be185d]'
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <h4
                            className={`text-sm font-semibold ${
                              isTaken ? 'text-[#7e405c] line-through' : 'text-[#3f0d24]'
                            }`}
                          >
                            {reminder.name}
                          </h4>
                          <span className="text-xs font-medium text-[#9d174d]">· {reminder.dosage}</span>
                        </div>
                        <p className="mt-1.5 pl-8 text-xs leading-relaxed text-[#5c223d]">
                          {reminder.notes}
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 pl-8 sm:pl-0 shrink-0">
                        <PinkTimePicker
                          id={`time-${reminder.id}`}
                          compact
                          value={reminder.time}
                          onChange={(nextTime) => updateTime(reminder.id, nextTime)}
                          ariaLabel={`Alarm time for ${reminder.name}`}
                        />
                        <button
                          type="button"
                          onClick={() => toggleEnabled(reminder.id)}
                          aria-pressed={reminder.enabled}
                          className={`min-h-[38px] rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            reminder.enabled
                              ? 'bg-[#db2777] text-white hover:bg-[#be185d]'
                              : 'border border-[#ea91b8] bg-white text-[#5c223d] hover:bg-[#ffe4ef]'
                          }`}
                        >
                          {reminder.enabled ? 'Alarm On' : 'Paused'}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteReminder(reminder.id)}
                          aria-label={`Delete ${reminder.name} reminder`}
                          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl border border-[#ea91b8] bg-white text-[#9d174d] transition-colors hover:border-[#be123c] hover:text-[#be123c] cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Custom Pink Reminder Form */}
            <form
              onSubmit={handleAddReminder}
              className="rounded-2xl border-2 border-[#ea91b8] bg-[#ffeef5] p-5 lg:col-span-5"
            >
              <h4 className="font-sans text-base font-semibold text-[#3f0d24]">
                {translated[17] || SUPPLEMENT_TEXTS[17]}
              </h4>
              <p className="mt-1 text-xs text-[#5c223d]">
                Add any prescribed clinic vitamin, folic acid, iron, or daily water alarm at your chosen time.
              </p>

              <div className="mt-4 space-y-3.5">
                <div>
                  <label htmlFor="supp-name" className="block text-xs font-semibold text-[#3f0d24]">
                    Supplement or Drink Name
                  </label>
                  <input
                    id="supp-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Iron + Folic Acid, Calcium, 2L Water"
                    className="mt-1 w-full rounded-xl border border-[#ea91b8] bg-white px-3 py-2 text-sm text-[#3f0d24] placeholder:text-[#a66a85] focus:border-[#be185d] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="supp-dosage" className="block text-xs font-semibold text-[#3f0d24]">
                      Dosage / Amount
                    </label>
                    <input
                      id="supp-dosage"
                      type="text"
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                      placeholder="e.g., 1 tablet + water"
                      className="mt-1 w-full rounded-xl border border-[#ea91b8] bg-white px-3 py-2 text-sm text-[#3f0d24] placeholder:text-[#a66a85] focus:border-[#be185d] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="supp-time" className="block text-xs font-semibold text-[#3f0d24]">
                      Daily Alarm Time
                    </label>
                    <PinkTimePicker
                      id="supp-time"
                      value={time}
                      onChange={setTime}
                      ariaLabel="Select daily supplement alarm time"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="supp-notes" className="block text-xs font-semibold text-[#3f0d24]">
                    Note (optional)
                  </label>
                  <input
                    id="supp-notes"
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., Take after breakfast with water"
                    className="mt-1 w-full rounded-xl border border-[#ea91b8] bg-white px-3 py-2 text-sm text-[#3f0d24] placeholder:text-[#a66a85] focus:border-[#be185d] focus:outline-none"
                  />
                </div>

                {formError && (
                  <p className="text-xs font-medium text-[#be123c]" role="alert">
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#be185d] to-[#db2777] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-95 whitespace-nowrap cursor-pointer"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  {translated[18] || SUPPLEMENT_TEXTS[18]}
                </button>
              </div>
            </form>
          </div>

          <PartnerMessagingSection />
        </div>
      </div>
    </section>
  );
}
