import { useMemo, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface PinkDatePickerButtonProps {
  id?: string;
  value: string;
  onChange: (nextIso: string) => void;
  placeholder?: string;
  allowFuture?: boolean;
  className?: string;
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
  return {
    year: String(d.getFullYear()),
    headline: `${SHORT_WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)}`,
  };
}

export function PinkDatePickerButton({
  id,
  value,
  onChange,
  placeholder = 'Select date',
  allowFuture = true,
  className = '',
}: PinkDatePickerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const baseDate = useMemo(() => {
    const parsed = value ? new Date(`${value}T00:00:00`) : new Date();
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [value]);

  const [draftDate, setDraftDate] = useState(value);
  const [viewYear, setViewYear] = useState(() => baseDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => baseDate.getMonth());

  const todayIso = useMemo(() => {
    const t = new Date();
    return toIsoDate(t.getFullYear(), t.getMonth(), t.getDate());
  }, []);

  const openModal = () => {
    setDraftDate(value);
    setViewYear(baseDate.getFullYear());
    setViewMonth(baseDate.getMonth());
    setIsOpen(true);
  };

  const days = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: Array<{ day: number; iso: string } | null> = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) {
      cells.push({ day: d, iso: toIsoDate(viewYear, viewMonth, d) });
    }
    return cells;
  }, [viewYear, viewMonth]);

  const banner = formatReadableBanner(draftDate);
  const yearOptions = useMemo(() => {
    const cur = new Date().getFullYear();
    const years: number[] = [];
    for (let y = cur + 2; y >= cur - 70; y--) years.push(y);
    return years;
  }, []);

  return (
    <>
      <button
        id={id}
        type="button"
        onClick={openModal}
        className={`flex min-h-[40px] w-full items-center justify-between gap-2 rounded-xl border border-[#ea91b8] bg-[#ffeef5] px-3 py-2 font-mono text-xs font-semibold text-[#9d174d] hover:border-[#db2777] cursor-pointer tabular-nums ${className}`}
      >
        <span>{value || placeholder}</span>
        <Calendar className="h-4 w-4 shrink-0 text-[#be185d]" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pink Calendar Date Picker"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
        >
          <div className="w-full max-w-sm overflow-hidden rounded-3xl border-2 border-[#ea91b8] bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-[#be185d] via-[#db2777] to-[#ec4899] px-6 py-5 text-white flex items-start justify-between">
              <div>
                <span className="block text-sm font-medium text-[#ffe4ef] tabular-nums">
                  {banner.year}
                </span>
                <strong className="mt-1 block font-display text-3xl font-bold tracking-tight">
                  {banner.headline}
                </strong>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close calendar"
                className="rounded-full p-1.5 text-white/90 hover:bg-white/20 cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="p-5 space-y-4 bg-[#fffafc]">
              <div className="flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (viewMonth === 0) {
                      setViewYear((y) => y - 1);
                      setViewMonth(11);
                    } else {
                      setViewMonth((m) => m - 1);
                    }
                  }}
                  aria-label="Previous month"
                  className="h-9 w-9 rounded-full text-[#9d174d] hover:bg-[#ffe4ef] grid place-items-center cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                </button>
                <div className="flex items-center gap-1.5">
                  <select
                    aria-label="Select month"
                    value={viewMonth}
                    onChange={(e) => setViewMonth(Number(e.target.value))}
                    className="rounded-lg border border-[#ea91b8] bg-[#ffe4ef] px-2 py-1 text-xs font-bold text-[#9d174d] cursor-pointer"
                  >
                    {MONTH_NAMES.map((m, i) => (
                      <option key={m} value={i}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Select year"
                    value={viewYear}
                    onChange={(e) => setViewYear(Number(e.target.value))}
                    className="rounded-lg border border-[#ea91b8] bg-[#ffe4ef] px-2 py-1 font-mono text-xs font-bold text-[#9d174d] cursor-pointer"
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (viewMonth === 11) {
                      setViewYear((y) => y + 1);
                      setViewMonth(0);
                    } else {
                      setViewMonth((m) => m + 1);
                    }
                  }}
                  aria-label="Next month"
                  className="h-9 w-9 rounded-full text-[#9d174d] hover:bg-[#ffe4ef] grid place-items-center cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-[#9d174d]">
                {SINGLE_WEEKDAYS.map((wd, idx) => (
                  <div key={`${wd}-${idx}`} className="py-1">
                    {wd}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {days.map((cell, idx) => {
                  if (!cell) return <div key={`empty-${idx}`} className="h-9" />;
                  const isSelected = cell.iso === draftDate;
                  const isToday = cell.iso === todayIso;
                  const disabled = !allowFuture && cell.iso > todayIso;
                  return (
                    <button
                      key={cell.iso}
                      type="button"
                      disabled={disabled}
                      onClick={() => setDraftDate(cell.iso)}
                      className={`h-9 w-9 mx-auto rounded-full text-xs font-semibold tabular-nums grid place-items-center transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-br from-[#be185d] to-[#db2777] text-white shadow-md'
                          : isToday
                            ? 'border-2 border-[#db2777] text-[#be185d] bg-[#ffeef5]'
                            : disabled
                              ? 'text-[#d8b4c4] cursor-not-allowed'
                              : 'text-[#3f0d24] hover:bg-[#ffe4ef]'
                      }`}
                    >
                      {cell.day}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#ffd6e7]">
                <button
                  type="button"
                  onClick={() => setDraftDate('')}
                  className="px-3 py-1.5 text-sm font-semibold text-[#be185d] hover:bg-[#ffe4ef] rounded-xl cursor-pointer"
                >
                  Clear
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-1.5 text-sm font-semibold text-[#9d174d] hover:bg-[#ffe4ef] rounded-xl cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(draftDate);
                      setIsOpen(false);
                    }}
                    className="px-4 py-1.5 text-sm font-bold text-white bg-gradient-to-r from-[#be185d] to-[#db2777] hover:opacity-95 rounded-xl shadow-sm cursor-pointer"
                  >
                    Set
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
