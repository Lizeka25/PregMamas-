import { useState } from 'react';
import { Clock, Keyboard } from 'lucide-react';

interface PinkTimePickerProps {
  id?: string;
  value: string; // HH:MM (24-hour)
  onChange: (nextHHMM: string) => void;
  ariaLabel?: string;
  compact?: boolean;
}

const OUTER_HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const INNER_HOURS = [0, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
const MINUTE_STEPS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

function parseHHMM(val: string): { hour: number; minute: number } {
  const [hStr, mStr] = (val || '09:00').split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  return {
    hour: Number.isFinite(h) && h >= 0 && h <= 23 ? h : 9,
    minute: Number.isFinite(m) && m >= 0 && m <= 59 ? m : 0,
  };
}

function formatHHMM(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function polarToXY(index: number, total: number, radiusPct: number) {
  const angleRad = ((index / total) * 360 - 90) * (Math.PI / 180);
  return {
    x: 50 + radiusPct * Math.cos(angleRad),
    y: 50 + radiusPct * Math.sin(angleRad),
  };
}

export function PinkTimePicker({
  id,
  value,
  onChange,
  ariaLabel = 'Choose alarm time',
  compact = false,
}: PinkTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'hours' | 'minutes'>('hours');
  const [keyboardMode, setKeyboardMode] = useState(false);
  const [draftHour, setDraftHour] = useState<number>(() => parseHHMM(value).hour);
  const [draftMinute, setDraftMinute] = useState<number>(() => parseHHMM(value).minute);

  const openModal = () => {
    const parsed = parseHHMM(value);
    setDraftHour(parsed.hour);
    setDraftMinute(parsed.minute);
    setMode('hours');
    setKeyboardMode(false);
    setOpen(true);
  };

  // Compute active hand tip angle & radius on the SVG clock dial
  let handIndex = 0;
  let handRadius = 39;
  if (mode === 'hours') {
    handIndex = draftHour % 12;
    const isOuter = draftHour >= 1 && draftHour <= 12;
    handRadius = isOuter ? 39 : 25;
  } else {
    handIndex = draftMinute;
    handRadius = 38;
  }
  const handPoint =
    mode === 'hours'
      ? polarToXY(handIndex, 12, handRadius)
      : polarToXY(handIndex, 60, handRadius);

  const commitSet = () => {
    onChange(formatHHMM(draftHour, draftMinute));
    setOpen(false);
  };

  return (
    <>
      <button
        id={id}
        type="button"
        aria-label={ariaLabel}
        onClick={openModal}
        className={
          compact
            ? 'inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border-2 border-[#db2777] bg-gradient-to-r from-[#be185d] to-[#db2777] px-3 py-1.5 font-mono text-xs font-bold text-white shadow-sm hover:opacity-95 cursor-pointer tabular-nums'
            : 'mt-1 inline-flex w-full min-h-[40px] items-center justify-between gap-2 rounded-xl border-2 border-[#db2777] bg-gradient-to-r from-[#ffe4ef] to-[#ffd6e7] px-3 py-2 font-mono text-sm font-bold text-[#9d174d] hover:border-[#be185d] cursor-pointer tabular-nums'
        }
      >
        <span>{value || '09:00'}</span>
        <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pink Alarm Time Picker"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
        >
          <div className="w-full max-w-xs sm:max-w-sm overflow-hidden rounded-3xl border-2 border-[#ea91b8] bg-white shadow-2xl">
            {/* Pink Digital Readout Banner matching the screenshot clock header */}
            <div className="bg-gradient-to-r from-[#be185d] via-[#db2777] to-[#ec4899] px-6 py-5 text-white flex items-center justify-center gap-1 select-none">
              <button
                type="button"
                onClick={() => {
                  setKeyboardMode(false);
                  setMode('hours');
                }}
                className={`rounded-xl px-2.5 py-1 font-mono text-5xl font-semibold tabular-nums cursor-pointer transition-colors ${
                  mode === 'hours' && !keyboardMode
                    ? 'bg-white/25 text-white'
                    : 'text-[#ffe4ef] hover:bg-white/10'
                }`}
              >
                {String(draftHour).padStart(2, '0')}
              </button>
              <span className="font-mono text-5xl font-semibold text-[#ffe4ef] pb-1">:</span>
              <button
                type="button"
                onClick={() => {
                  setKeyboardMode(false);
                  setMode('minutes');
                }}
                className={`rounded-xl px-2.5 py-1 font-mono text-5xl font-semibold tabular-nums cursor-pointer transition-colors ${
                  mode === 'minutes' && !keyboardMode
                    ? 'bg-white/25 text-white'
                    : 'text-[#ffe4ef] hover:bg-white/10'
                }`}
              >
                {String(draftMinute).padStart(2, '0')}
              </button>
            </div>

            <div className="p-5 bg-[#fffafc] space-y-4">
              {keyboardMode ? (
                <div className="rounded-2xl border border-[#ea91b8] bg-[#fff0f6] p-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#be185d] m-0">
                    Enter Exact Time (24-hour)
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="pink-kb-hour" className="block text-xs font-semibold text-[#3f0d24] mb-1">
                        Hour (0–23)
                      </label>
                      <input
                        id="pink-kb-hour"
                        type="number"
                        min={0}
                        max={23}
                        value={draftHour}
                        onChange={(e) => {
                          const v = Math.max(0, Math.min(23, Number(e.target.value) || 0));
                          setDraftHour(v);
                        }}
                        className="w-full rounded-xl border-2 border-[#db2777] bg-white px-3 py-2 font-mono text-lg font-bold text-[#9d174d] text-center focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="pink-kb-min" className="block text-xs font-semibold text-[#3f0d24] mb-1">
                        Minute (0–59)
                      </label>
                      <input
                        id="pink-kb-min"
                        type="number"
                        min={0}
                        max={59}
                        value={draftMinute}
                        onChange={(e) => {
                          const v = Math.max(0, Math.min(59, Number(e.target.value) || 0));
                          setDraftMinute(v);
                        }}
                        className="w-full rounded-xl border-2 border-[#db2777] bg-white px-3 py-2 font-mono text-lg font-bold text-[#9d174d] text-center focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Pink Circular Analog Clock Face */}
                  <div className="relative mx-auto h-64 w-64 rounded-full border-2 border-[#f4b6d0] bg-[#ffeef5] select-none">
                    {/* Clock Hand SVG */}
                    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full pointer-events-none">
                      <line
                        x1="50"
                        y1="50"
                        x2={handPoint.x}
                        y2={handPoint.y}
                        stroke="#db2777"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                      <circle cx="50" cy="50" r="2.2" fill="#be185d" />
                    </svg>

                    {mode === 'hours' ? (
                      <>
                        {/* Outer Ring: 12, 1..11 */}
                        {OUTER_HOURS.map((hr, idx) => {
                          const pos = polarToXY(idx, 12, 39);
                          const selected = draftHour === hr;
                          return (
                            <button
                              key={`outer-${hr}`}
                              type="button"
                              onClick={() => {
                                setDraftHour(hr);
                                setMode('minutes');
                              }}
                              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                              className={`absolute -translate-x-1/2 -translate-y-1/2 h-9 w-9 rounded-full text-sm font-semibold tabular-nums transition-colors cursor-pointer grid place-items-center ${
                                selected
                                  ? 'bg-gradient-to-br from-[#be185d] to-[#db2777] text-white shadow-md'
                                  : 'text-[#3f0d24] hover:bg-[#ffd6e7]'
                              }`}
                            >
                              {hr}
                            </button>
                          );
                        })}

                        {/* Inner Ring: 00, 13..23 */}
                        {INNER_HOURS.map((hr, idx) => {
                          const pos = polarToXY(idx, 12, 25);
                          const selected = draftHour === hr;
                          return (
                            <button
                              key={`inner-${hr}`}
                              type="button"
                              onClick={() => {
                                setDraftHour(hr);
                                setMode('minutes');
                              }}
                              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                              className={`absolute -translate-x-1/2 -translate-y-1/2 h-7 w-7 rounded-full text-[11px] font-semibold tabular-nums transition-colors cursor-pointer grid place-items-center ${
                                selected
                                  ? 'bg-gradient-to-br from-[#be185d] to-[#db2777] text-white shadow-sm'
                                  : 'text-[#7e405c] hover:bg-[#ffd6e7]'
                              }`}
                            >
                              {hr === 0 ? '00' : hr}
                            </button>
                          );
                        })}
                      </>
                    ) : (
                      <>
                        {/* Minute Dial: 00, 05..55 */}
                        {MINUTE_STEPS.map((min, idx) => {
                          const pos = polarToXY(idx, 12, 38);
                          const selected = draftMinute === min;
                          return (
                            <button
                              key={`min-${min}`}
                              type="button"
                              onClick={() => setDraftMinute(min)}
                              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                              className={`absolute -translate-x-1/2 -translate-y-1/2 h-9 w-9 rounded-full text-xs font-semibold tabular-nums transition-colors cursor-pointer grid place-items-center ${
                                selected
                                  ? 'bg-gradient-to-br from-[#be185d] to-[#db2777] text-white shadow-md'
                                  : 'text-[#3f0d24] hover:bg-[#ffd6e7]'
                              }`}
                            >
                              {String(min).padStart(2, '0')}
                            </button>
                          );
                        })}
                      </>
                    )}
                  </div>

                  {/* Fine 1-minute adjuster in Minutes mode */}
                  {mode === 'minutes' && (
                    <div className="flex items-center justify-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setDraftMinute((m) => (m + 59) % 60)}
                        className="rounded-lg border border-[#ea91b8] bg-[#ffeef5] px-2.5 py-1 font-bold text-[#9d174d] hover:bg-[#ffd6e7] cursor-pointer"
                      >
                        -1 min
                      </button>
                      <span className="font-mono font-bold text-[#be185d] tabular-nums">
                        :{String(draftMinute).padStart(2, '0')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setDraftMinute((m) => (m + 1) % 60)}
                        className="rounded-lg border border-[#ea91b8] bg-[#ffeef5] px-2.5 py-1 font-bold text-[#9d174d] hover:bg-[#ffd6e7] cursor-pointer"
                      >
                        +1 min
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Pink Action Bar matching user screenshot: [Keyboard]  Clear  CANCEL  Set */}
              <div className="flex items-center justify-between pt-2 border-t border-[#ffd6e7]">
                <button
                  type="button"
                  onClick={() => setKeyboardMode((v) => !v)}
                  aria-label="Toggle keyboard time entry"
                  className="rounded-xl p-2 text-[#be185d] hover:bg-[#ffe4ef] cursor-pointer"
                >
                  <Keyboard className="h-5 w-5" aria-hidden="true" />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDraftHour(9);
                      setDraftMinute(0);
                    }}
                    className="px-2.5 py-1.5 text-sm font-semibold text-[#be185d] hover:bg-[#ffe4ef] rounded-xl cursor-pointer"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-2.5 py-1.5 text-sm font-semibold text-[#9d174d] hover:bg-[#ffe4ef] rounded-xl cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    onClick={commitSet}
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
