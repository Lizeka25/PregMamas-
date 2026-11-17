import { useEffect, useMemo, useState } from 'react';
import { Baby, Calendar, ChevronLeft, ChevronRight, Scale, Sparkles, X } from 'lucide-react';
import { BABY_SIZE_STAGES, IMAGES } from '../data/pregmamasData';

interface PinkLmpCalendarProps {
  lmpDate: string;
  onChangeLmpDate: (nextIsoDate: string) => void;
  compact?: boolean;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const SHORT_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SINGLE_WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function toIsoDate(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatReadableBanner(iso: string): { year: string; headline: string } {
  if (!iso) {
    return { year: String(new Date().getFullYear()), headline: 'Choose Date' };
  }
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) {
    return { year: String(new Date().getFullYear()), headline: 'Choose Date' };
  }
  const dayName = SHORT_WEEKDAYS[d.getDay()];
  const monthShort = MONTH_NAMES[d.getMonth()].slice(0, 3);
  return {
    year: String(d.getFullYear()),
    headline: `${dayName}, ${d.getDate()} ${monthShort}`,
  };
}

function buildMonthCells(year: number, monthIndex: number): Array<{ day: number; iso: string } | null> {
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();
  const cells: Array<{ day: number; iso: string } | null> = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) {
    cells.push({ day: d, iso: toIsoDate(year, monthIndex, d) });
  }
  return cells;
}

export function PinkLmpCalendar({
  lmpDate,
  onChangeLmpDate,
  compact = false,
}: PinkLmpCalendarProps) {
  const initialDate = useMemo(() => {
    const parsed = new Date(`${lmpDate}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [lmpDate]);

  const [viewYear, setViewYear] = useState<number>(() => initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(() => initialDate.getMonth());
  const [showFullChart, setShowFullChart] = useState<boolean>(!compact);
  const [previewMinWeek, setPreviewMinWeek] = useState<number | null>(null);

  // Custom Pink Modal Date Picker (replaces native browser blue <input type="date"> dialog)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftDate, setDraftDate] = useState<string>(lmpDate);
  const [modalYear, setModalYear] = useState<number>(() => initialDate.getFullYear());
  const [modalMonth, setModalMonth] = useState<number>(() => initialDate.getMonth());

  useEffect(() => {
    setPreviewMinWeek(null);
  }, [lmpDate]);

  const todayIso = useMemo(() => {
    const t = new Date();
    return toIsoDate(t.getFullYear(), t.getMonth(), t.getDate());
  }, []);

  const estimate = useMemo(() => {
    if (!lmpDate) return null;
    const start = new Date(`${lmpDate}T00:00:00`);
    if (Number.isNaN(start.getTime())) return null;
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0 || diffDays > 294) return null;
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    const due = new Date(start.getTime() + 280 * 24 * 60 * 60 * 1000);
    const trimester = weeks < 13 ? 'Trimester 1' : weeks < 28 ? 'Trimester 2' : 'Trimester 3';
    const babyStage =
      BABY_SIZE_STAGES.find((b) => weeks >= b.minWeek) ||
      BABY_SIZE_STAGES[BABY_SIZE_STAGES.length - 1];

    return {
      weeks,
      days,
      trimester,
      dueDate: due.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
      babyStage,
    };
  }, [lmpDate]);

  const displayedStage = useMemo(() => {
    if (previewMinWeek !== null) {
      return (
        BABY_SIZE_STAGES.find((s) => s.minWeek === previewMinWeek) ||
        estimate?.babyStage ||
        BABY_SIZE_STAGES[1]
      );
    }
    return estimate?.babyStage || BABY_SIZE_STAGES[1];
  }, [previewMinWeek, estimate]);

  const calendarDays = useMemo(() => buildMonthCells(viewYear, viewMonth), [viewYear, viewMonth]);
  const modalDays = useMemo(() => buildMonthCells(modalYear, modalMonth), [modalYear, modalMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const openPinkPickerModal = () => {
    const base = lmpDate ? new Date(`${lmpDate}T00:00:00`) : new Date();
    const valid = Number.isNaN(base.getTime()) ? new Date() : base;
    setDraftDate(lmpDate);
    setModalYear(valid.getFullYear());
    setModalMonth(valid.getMonth());
    setIsModalOpen(true);
  };

  const modalPrevMonth = () => {
    if (modalMonth === 0) {
      setModalYear((y) => y - 1);
      setModalMonth(11);
    } else {
      setModalMonth((m) => m - 1);
    }
  };

  const modalNextMonth = () => {
    if (modalMonth === 11) {
      setModalYear((y) => y + 1);
      setModalMonth(0);
    } else {
      setModalMonth((m) => m + 1);
    }
  };

  const commitModalDate = () => {
    onChangeLmpDate(draftDate);
    if (draftDate) {
      const parsed = new Date(`${draftDate}T00:00:00`);
      if (!Number.isNaN(parsed.getTime())) {
        setViewYear(parsed.getFullYear());
        setViewMonth(parsed.getMonth());
      }
    }
    setIsModalOpen(false);
  };

  const selectedBanner = formatReadableBanner(lmpDate);
  const modalBanner = formatReadableBanner(draftDate);
  const shortStageNames: Record<number, string> = {
    36: 'Watermelon',
    32: 'Pineapple',
    28: 'Squash',
    24: 'Corn',
    20: 'Banana',
    16: 'Avocado',
    12: 'Plum',
    8: 'Raspberry',
    0: 'Poppy Seed',
  };

  return (
    <div className="rounded-3xl border-2 border-[#ea91b8] bg-gradient-to-br from-[#ffe4ef] via-[#fff0f6] to-[#ffd6e7] p-5 sm:p-6 space-y-5 shadow-sm">
      {/* Header + Pink Custom Modal Trigger (no native blue date picker!) */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#be185d] m-0 flex items-center gap-1.5">
            <Calendar className="w-4 h-4" aria-hidden="true" />
            Pink LMP Calendar & Baby Size / Weight Guide
          </p>
          <h3 className="font-display text-xl font-semibold text-[#3f0d24] mt-1 m-0">
            Select First Day of Last Menstrual Period
          </h3>
        </div>
        <button
          type="button"
          onClick={openPinkPickerModal}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-[#be185d] bg-gradient-to-r from-[#be185d] to-[#db2777] px-3.5 py-2 font-mono text-xs font-bold text-white shadow-sm hover:opacity-95 cursor-pointer tabular-nums"
        >
          <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{lmpDate ? `${selectedBanner.headline} · ${selectedBanner.year}` : 'Open Pink Calendar'}</span>
        </button>
      </div>

      {/* Inline Pink Material-Styled Calendar Card */}
      <div className="overflow-hidden rounded-2xl border-2 border-[#ea91b8] bg-white shadow-sm">
        <div className="bg-gradient-to-r from-[#be185d] via-[#db2777] to-[#ec4899] px-5 py-3.5 text-white flex items-center justify-between gap-2">
          <div>
            <span className="block text-xs font-medium text-[#ffe4ef] tabular-nums">
              {selectedBanner.year}
            </span>
            <strong className="font-display text-2xl font-bold leading-tight">
              {selectedBanner.headline}
            </strong>
          </div>
          <button
            type="button"
            onClick={openPinkPickerModal}
            className="rounded-xl bg-white/20 hover:bg-white/30 px-3 py-1.5 text-xs font-semibold text-white cursor-pointer"
          >
            Popup View
          </button>
        </div>

        <div className="p-4 space-y-3 bg-[#fffafc]">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Previous month"
              className="h-9 w-9 rounded-full border border-[#ea91b8] bg-[#ffe4ef] text-[#be185d] grid place-items-center hover:bg-[#ffd6e7] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>

            <div className="flex items-center gap-2">
              <select
                aria-label="Select month"
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="rounded-xl border border-[#ea91b8] bg-[#ffe4ef] px-2.5 py-1 text-xs font-bold text-[#9d174d] focus:outline-none cursor-pointer"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                aria-label="Select year"
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="rounded-xl border border-[#ea91b8] bg-[#ffe4ef] px-2.5 py-1 font-mono text-xs font-bold text-[#9d174d] focus:outline-none cursor-pointer"
              >
                {[viewYear - 1, viewYear, viewYear + 1].map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              aria-label="Next month"
              className="h-9 w-9 rounded-full border border-[#ea91b8] bg-[#ffe4ef] text-[#be185d] grid place-items-center hover:bg-[#ffd6e7] cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-[#be185d]">
            {SINGLE_WEEKDAYS.map((wd, idx) => (
              <div key={`${wd}-${idx}`} className="py-1">
                {wd}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((cell, i) => {
              if (!cell) return <div key={`empty-${i}`} className="h-9" />;
              const isSelected = cell.iso === lmpDate;
              const isToday = cell.iso === todayIso;
              const isFuture = cell.iso > todayIso;
              return (
                <button
                  key={cell.iso}
                  type="button"
                  disabled={isFuture}
                  onClick={() => onChangeLmpDate(cell.iso)}
                  className={`h-9 w-9 mx-auto rounded-full text-xs font-semibold tabular-nums transition-colors cursor-pointer grid place-items-center ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#be185d] to-[#ec4899] text-white shadow-sm'
                      : isToday
                        ? 'border-2 border-[#db2777] bg-[#ffd6e7] text-[#9d174d]'
                        : isFuture
                          ? 'text-[#d8b4c4] cursor-not-allowed'
                          : 'text-[#3f0d24] hover:bg-[#ffe4ef]'
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stage Summary + Exact Fruit Photo (e.g. Pineapple) + Baby Length & Weight */}
      <div className="rounded-2xl border-2 border-[#db2777]/40 bg-white p-4 sm:p-5 space-y-4">
        {estimate ? (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#ffd6e7] pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#be185d]">
                {estimate.trimester} · Educational Estimate
              </span>
              <div className="font-display text-2xl sm:text-3xl font-bold text-[#3f0d24] tabular-nums">
                Week {estimate.weeks} · {estimate.days} days
              </div>
            </div>
            <div className="rounded-xl border border-[#ea91b8] bg-[#ffe4ef] px-3 py-2 text-right">
              <span className="block text-[10px] font-bold uppercase text-[#9d174d]">
                Estimated Due Date
              </span>
              <strong className="font-mono text-xs text-[#3f0d24] tabular-nums">
                {estimate.dueDate}
              </strong>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-[#ea91b8] bg-[#fff0f6] p-3 text-xs text-[#7e405c]">
            Select an LMP date within the last 42 weeks on the pink calendar above to calculate your exact week & due date—or preview baby size examples below.
          </div>
        )}

        {/* Featured Fruit Photo + Length + Baby Weight Card */}
        <div className="rounded-2xl border border-[#f4b6d0] bg-[#fff0f6] p-3.5 sm:p-4 grid gap-4 sm:grid-cols-12 items-center">
          <div className="sm:col-span-5 overflow-hidden rounded-xl border border-[#ea91b8] bg-white">
            <img
              src={displayedStage.image}
              alt={displayedStage.imageAlt}
              referrerPolicy="no-referrer"
              className="w-full aspect-square object-cover"
            />
          </div>

          <div className="sm:col-span-7 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#be185d]">
                <Baby className="w-3.5 h-3.5" aria-hidden="true" />
                {previewMinWeek !== null
                  ? `Stage Example (${displayedStage.minWeek}+ Weeks)`
                  : `Your Baby Now (Week ${estimate?.weeks ?? displayedStage.minWeek})`}
              </span>
              {previewMinWeek !== null && estimate && (
                <button
                  type="button"
                  onClick={() => setPreviewMinWeek(null)}
                  className="text-[11px] font-bold text-[#be185d] underline cursor-pointer"
                >
                  Back to Week {estimate.weeks}
                </button>
              )}
            </div>

            <h4 className="font-display text-xl font-bold text-[#3f0d24] m-0">
              {displayedStage.fruit} Example
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-[#ea91b8] bg-white p-2.5">
                <span className="block text-[10px] font-bold uppercase text-[#9d174d]">
                  Estimated Weight
                </span>
                <strong className="mt-0.5 flex items-center gap-1 font-mono text-xs font-bold text-[#be185d] tabular-nums">
                  <Scale className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  {displayedStage.weightApprox}
                </strong>
              </div>
              <div className="rounded-xl border border-[#ea91b8] bg-white p-2.5">
                <span className="block text-[10px] font-bold uppercase text-[#9d174d]">
                  Approx. Length
                </span>
                <strong className="mt-0.5 block font-mono text-xs font-bold text-[#3f0d24] tabular-nums">
                  {displayedStage.sizeApprox}
                </strong>
              </div>
            </div>

            <p className="text-xs text-[#5c223d] m-0 leading-relaxed">
              {displayedStage.milestone}
            </p>
          </div>
        </div>

        {/* Interactive Stage Quick-Preview Strip (Tap Pineapple, Watermelon, etc.) */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#9d174d] m-0">
            Tap any stage below to see its picture & how much baby weighs (e.g., Pineapple at 32w):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {BABY_SIZE_STAGES.map((stage) => {
              const active = displayedStage.minWeek === stage.minWeek;
              return (
                <button
                  key={stage.minWeek}
                  type="button"
                  onClick={() => setPreviewMinWeek(stage.minWeek)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#be185d] text-white'
                      : 'border border-[#ea91b8] bg-[#fff7fa] text-[#5c223d] hover:bg-[#ffe4ef]'
                  }`}
                >
                  {stage.minWeek}w · {shortStageNames[stage.minWeek] || stage.fruit}
                </button>
              );
            })}
          </div>
        </div>

        {/* Full Week 4-40 Visual Chart Toggle */}
        <div className="space-y-2.5 pt-1 border-t border-[#ffd6e7]">
          <button
            type="button"
            onClick={() => setShowFullChart((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#be185d] hover:underline cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            {showFullChart
              ? 'Hide Full Week 4–40 Baby Size Comparison Chart'
              : 'Show Full Week 4–40 Baby Size Comparison Chart'}
          </button>

          {showFullChart && (
            <figure className="m-0 rounded-xl border border-[#ea91b8] bg-[#fff7fa] p-2 space-y-1.5">
              <img
                src={IMAGES.babySizeChart}
                alt="Weekly pregnancy baby size comparison illustration from Poppy Seed at Week 4 through Watermelon at Week 40"
                referrerPolicy="no-referrer"
                className="w-full rounded-lg aspect-[4/3] object-cover"
              />
              <figcaption className="text-[11px] text-center font-medium text-[#7e405c]">
                Full Growth Chart — From Poppy Seed (&lt;1 g) through Golden Pineapple (~1.7–2.2 kg at 32w) to Striped Watermelon (~2.7–3.8 kg at birth).
              </figcaption>
            </figure>
          )}
        </div>
      </div>

      {/* Custom Pink Material-Style Date Picker Modal (zero system blue popup!) */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pink Last Menstrual Period Date Picker"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
        >
          <div className="w-full max-w-sm overflow-hidden rounded-3xl border-2 border-[#ea91b8] bg-white shadow-2xl">
            {/* Pink Top Banner matching user screenshot layout in PregMamas Pink */}
            <div className="bg-gradient-to-r from-[#be185d] via-[#db2777] to-[#ec4899] px-6 py-5 text-white flex items-start justify-between">
              <div>
                <span className="block text-sm font-medium text-[#ffe4ef] tabular-nums">
                  {modalBanner.year}
                </span>
                <strong className="mt-1 block font-display text-3xl font-bold tracking-tight">
                  {modalBanner.headline}
                </strong>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close pink date picker"
                className="rounded-full p-1.5 text-white/90 hover:bg-white/20 cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Calendar Month Navigation */}
            <div className="p-5 space-y-4 bg-[#fffafc]">
              <div className="flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={modalPrevMonth}
                  aria-label="Previous month in picker"
                  className="h-9 w-9 rounded-full text-[#9d174d] hover:bg-[#ffe4ef] grid place-items-center cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                </button>
                <span className="text-sm font-bold text-[#3f0d24]">
                  {MONTH_NAMES[modalMonth]} {modalYear}
                </span>
                <button
                  type="button"
                  onClick={modalNextMonth}
                  aria-label="Next month in picker"
                  className="h-9 w-9 rounded-full text-[#9d174d] hover:bg-[#ffe4ef] grid place-items-center cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-[#9d174d]">
                {SINGLE_WEEKDAYS.map((wd, idx) => (
                  <div key={`modal-wd-${idx}`} className="py-1">
                    {wd}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {modalDays.map((cell, idx) => {
                  if (!cell) return <div key={`m-empty-${idx}`} className="h-10" />;
                  const isSelected = cell.iso === draftDate;
                  const isToday = cell.iso === todayIso;
                  const isFuture = cell.iso > todayIso;
                  return (
                    <button
                      key={cell.iso}
                      type="button"
                      disabled={isFuture}
                      onClick={() => setDraftDate(cell.iso)}
                      className={`h-10 w-10 mx-auto rounded-full text-sm font-semibold tabular-nums grid place-items-center transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-br from-[#be185d] to-[#db2777] text-white shadow-md'
                          : isToday
                            ? 'border-2 border-[#db2777] text-[#be185d] bg-[#ffeef5]'
                            : isFuture
                              ? 'text-[#d8b4c4] cursor-not-allowed'
                              : 'text-[#3f0d24] hover:bg-[#ffe4ef]'
                      }`}
                    >
                      {cell.day}
                    </button>
                  );
                })}
              </div>

              {/* Bottom Modal Actions: Clear | CANCEL | Set in PregMamas Pink */}
              <div className="flex items-center justify-between pt-2 border-t border-[#ffd6e7]">
                <button
                  type="button"
                  onClick={() => setDraftDate('')}
                  className="px-3 py-2 text-sm font-semibold text-[#be185d] hover:bg-[#ffe4ef] rounded-xl cursor-pointer"
                >
                  Clear
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-2 text-sm font-semibold text-[#9d174d] hover:bg-[#ffe4ef] rounded-xl cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    onClick={commitModalDate}
                    className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-[#be185d] to-[#db2777] hover:opacity-95 rounded-xl shadow-sm cursor-pointer"
                  >
                    Set
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
