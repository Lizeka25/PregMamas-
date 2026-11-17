import { useEffect, useMemo, useState } from 'react';
import { Check, Pause, Play, RotateCcw, ShieldCheck } from 'lucide-react';
import { IMAGES, SAFE_EXERCISES, SafeExercise } from '../data/pregmamasData';
import { SafeImage } from './SafeImage';

type StageFilter = 'All' | SafeExercise['stage'];

export function SafeExercisesSection() {
  const [stageFilter, setStageFilter] = useState<StageFilter>('All');
  const [selectedId, setSelectedId] = useState<string>(SAFE_EXERCISES[0].id);
  const [secondsLeft, setSecondsLeft] = useState<number>(SAFE_EXERCISES[0].durationSec);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const filteredExercises = useMemo(() => {
    if (stageFilter === 'All') return SAFE_EXERCISES;
    return SAFE_EXERCISES.filter((ex) => ex.stage === stageFilter);
  }, [stageFilter]);

  const activeExercise = useMemo(() => {
    return (
      filteredExercises.find((ex) => ex.id === selectedId) ||
      filteredExercises[0] ||
      SAFE_EXERCISES[0]
    );
  }, [filteredExercises, selectedId]);

  useEffect(() => {
    setIsRunning(false);
    setSecondsLeft(activeExercise.durationSec);
  }, [activeExercise.id, activeExercise.durationSec]);

  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setCompletedIds((done) =>
            done.includes(activeExercise.id) ? done : [...done, activeExercise.id]
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRunning, activeExercise.id]);

  const selectExercise = (ex: SafeExercise) => {
    setSelectedId(ex.id);
    setIsRunning(false);
    setSecondsLeft(ex.durationSec);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(activeExercise.durationSec);
  };

  const pctElapsed = Math.round(
    ((activeExercise.durationSec - secondsLeft) / activeExercise.durationSec) * 100
  );

  return (
    <section id="exercises" className="border-t border-[#f4b6d0] bg-white py-14 lg:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-wide text-[#be185d]">
              04. Safe Pregnancy & Postpartum Movement
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#3f0d24] sm:text-4xl">
              Gentle, Illustrated Exercises with Guided Timers
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#5c223d]">
              Low-impact movement eases back tension, improves sleep, and prepares your hips and pelvic floor for labor. Always pass the "talk test"—you should be able to hold a conversation comfortably while moving.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-xl bg-[#ffeef5] p-1">
            {(['All', '1st–2nd Trimester', '3rd Trimester', 'Postpartum Gentle'] as const).map(
              (stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => setStageFilter(stage)}
                  className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    stageFilter === stage
                      ? 'bg-white text-[#3f0d24] shadow-sm'
                      : 'text-[#5c223d] hover:text-[#3f0d24]'
                  }`}
                >
                  {stage}
                </button>
              )
            )}
          </div>
        </div>

        {/* Visual Showcase Gallery of Core Safe Moves */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          <SafeImage
            src={IMAGES.exerciseCatCow}
            alt="Pregnant mother in sage activewear practicing a slow Cat-Cow back stretch on a cork mat"
            caption="Example 1: Prenatal Cat-Cow Stretch — Releases lumbar tension and creates gentle abdominal space without lying flat."
            aspectClass="aspect-[4/3]"
          />
          <SafeImage
            src={IMAGES.exerciseSquat}
            alt="Pregnant mother practicing a safe chair-and-ball supported squat in a sunlit living room"
            caption="Example 2: Chair & Stability-Ball Supported Squat — Builds leg stamina and opens the pelvic outlet safely."
            aspectClass="aspect-[4/3]"
          />
        </div>

        {/* Interactive Guided Movement Studio */}
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-5">
            {filteredExercises.map((ex) => {
              const isSelected = activeExercise.id === ex.id;
              const isDone = completedIds.includes(ex.id);
              return (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => selectExercise(ex)}
                  className={`w-full rounded-xl border p-4 text-left transition-colors ${
                    isSelected
                      ? 'border-[#be185d] bg-[#fff0f6]'
                      : 'border-[#ffd6e7] bg-[#fff7fa] hover:border-[#be185d]/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-[#5c223d]">
                    <span>
                      {ex.stage} · {ex.repsLabel}
                    </span>
                    {isDone && (
                      <span className="inline-flex items-center gap-1 font-medium text-[#be185d]">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        Done
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 font-sans text-base font-semibold text-[#3f0d24]">
                    {ex.title}
                  </h3>
                  <p className="mt-1 text-xs text-[#5c223d]">Focus: {ex.targetMuscles}</p>
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-[#f4b6d0] bg-[#fff7fa] p-6 sm:p-8 lg:col-span-7">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-12">
              <div className="sm:col-span-5">
                <SafeImage
                  src={activeExercise.image}
                  alt={activeExercise.imageAlt}
                  aspectClass="aspect-[4/3]"
                />
              </div>

              <div className="flex flex-col justify-between sm:col-span-7">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#be185d]">
                    <span className="font-medium">{activeExercise.stage}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{activeExercise.repsLabel}</span>
                  </div>
                  <h3 className="mt-1.5 text-2xl font-semibold text-[#3f0d24]">
                    {activeExercise.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-[#5c223d]">
                    Breathing rhythm: {activeExercise.breathCue}
                  </p>
                </div>

                <div className="mt-5 rounded-xl border border-[#ffd6e7] bg-white p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-[#5c223d]">Guided Set Timer</p>
                      <p className="font-mono text-3xl font-semibold text-[#3f0d24] tabular-nums">
                        00:{String(secondsLeft).padStart(2, '0')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsRunning((r) => !r)}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-[#be185d] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#9d174d] whitespace-nowrap shrink-0"
                      >
                        {isRunning ? (
                          <>
                            <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-3.5 w-3.5" aria-hidden="true" />
                            {secondsLeft === 0 ? 'Restart' : 'Start Guided Set'}
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={resetTimer}
                        aria-label="Reset exercise timer"
                        className="flex h-[40px] w-[40px] items-center justify-center rounded-lg border border-[#f4b6d0] bg-white text-[#5c223d] hover:text-[#3f0d24]"
                      >
                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#ffeef5]">
                    <div
                      className="h-full bg-[#be185d] transition-all duration-300"
                      style={{ width: `${pctElapsed}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-[#ffd6e7] pt-5">
              <h4 className="font-sans text-sm font-semibold text-[#3f0d24]">
                Step-by-Step Safe Form
              </h4>
              <ol className="mt-2.5 space-y-2 text-sm leading-relaxed text-[#5c223d]">
                {activeExercise.steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="font-mono text-xs font-semibold text-[#be185d]">
                      0{idx + 1}.
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[#ffd6e7] bg-white p-3.5 text-xs leading-relaxed text-[#5c223d]">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#be185d]" aria-hidden="true" />
                <span>
                  <strong className="text-[#3f0d24]">Safety Rule:</strong> {activeExercise.safetyRule}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
