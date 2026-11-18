import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Droplets, HeartHandshake, ShieldAlert } from 'lucide-react';
import {
  CSECTION_TYPES,
  EPISIOTOMY_CARE_STEPS,
  EPISIOTOMY_TYPES,
  FAMILY_PLANNING_VISUAL_EXAMPLES,
  IMAGES,
  LOCHIA_STAGES,
  LochiaStage,
} from '../data/pregmamasData';
import { useTranslatedTexts } from '../context/LanguageContext';
import { SafeImage } from './SafeImage';

export type RecoveryTab = 'lochia' | 'csection' | 'episiotomy' | 'selfcare' | 'contraception';

const POSTPARTUM_STATIC_TEXTS = [
  '03. Postpartum Recovery, C-Section Types, Episiotomy & Lochia',
  'Caring for Yourself, Incisions, Episiotomy Steps & Postpartum Lochia',
  'The first six weeks after birth are a major physical healing phase. Explore step-by-step picture guides for C-section incision types, episiotomy recovery, practical daily self-care, lochia maternity pads, and family planning options.',
  'Postpartum Lochia',
  'Types of C-Section',
  'Episiotomy & Steps',
  'Daily Self-Care',
  'Family Planning',
  'The 3 Normal Stages of Postpartum Lochia (Days 1 to Week 6)',
  'Warning Signs — Go to the Clinic or Call 10177 / 112 Immediately If:',
  'Types of C-Section Incisions, Examples & Scar Recovery',
  'Episiotomy Examples & Step-by-Step Healing Pictures',
  'How to Take Care of an Episiotomy Step by Step',
  'How to Take Care of Yourself Daily in the First 6 Weeks',
  'Family Planning Choices: Different Contraceptive Pictures & Examples',
];

export function PostpartumSection({ initialTab = 'lochia' }: { initialTab?: RecoveryTab }) {
  const [activeTab, setActiveTab] = useState<RecoveryTab>(initialTab);
  const [selectedLochia, setSelectedLochia] = useState<LochiaStage>(LOCHIA_STAGES[0]);

  const textsToTranslate = useMemo(
    () => [
      ...POSTPARTUM_STATIC_TEXTS,
      ...LOCHIA_STAGES.flatMap((l) => [l.name, l.colorLabel, l.whatToExpect, l.normalClots, l.padManagement]),
      ...CSECTION_TYPES.flatMap((c) => [c.name, c.whereCut, c.exampleUse, c.recoveryNote]),
      ...EPISIOTOMY_TYPES.flatMap((e) => [e.name, e.whyUsed]),
      ...EPISIOTOMY_CARE_STEPS.flatMap((s) => [s.title, s.detail]),
      ...FAMILY_PLANNING_VISUAL_EXAMPLES.flatMap((f) => [f.name, f.howItWorks]),
    ],
    []
  );
  const { translated } = useTranslatedTexts(textsToTranslate);

  const lochiaOff = POSTPARTUM_STATIC_TEXTS.length;
  const csecOff = lochiaOff + LOCHIA_STAGES.length * 5;
  const epiTypeOff = csecOff + CSECTION_TYPES.length * 4;
  const epiStepOff = epiTypeOff + EPISIOTOMY_TYPES.length * 2;
  const fpOff = epiStepOff + EPISIOTOMY_CARE_STEPS.length * 2;

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <section id="postpartum" className="border-t border-[#f4b6d0] py-14 lg:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-xs font-medium tracking-wide text-[#be185d]">
              {translated[0] || POSTPARTUM_STATIC_TEXTS[0]}
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#3f0d24] sm:text-4xl">
              {translated[1] || POSTPARTUM_STATIC_TEXTS[1]}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#5c223d]">
              {translated[2] || POSTPARTUM_STATIC_TEXTS[2]}
            </p>

            {/* Interactive Topic Selector Tabs */}
            <div className="mt-7 flex flex-wrap items-center gap-1.5 rounded-xl bg-[#ffeef5] p-1.5">
              {(
                [
                  { id: 'lochia', label: translated[3] || 'Postpartum Lochia' },
                  { id: 'csection', label: translated[4] || 'Types of C-Section' },
                  { id: 'episiotomy', label: translated[5] || 'Episiotomy & Steps' },
                  { id: 'selfcare', label: translated[6] || 'Daily Self-Care' },
                  { id: 'contraception', label: translated[7] || 'Family Planning' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`min-h-[38px] rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white text-[#3f0d24] shadow-sm'
                      : 'text-[#5c223d] hover:text-[#3f0d24]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <SafeImage
              src={IMAGES.postpartumCare}
              alt="Postpartum healing tray with peri rinse bottle, organic cotton maternity pads, clean white towel, chamomile sitz bath bowl, and herbal tea"
              caption="Keep a postpartum recovery basket in your bathroom: peri bottle, thick cotton pads, clean towels, and soothing chamomile."
              aspectClass="aspect-[4/3]"
            />
          </div>
        </div>

        {/* Tab Panels */}
        <div className="mt-10">
          {activeTab === 'lochia' && (
            <div className="rounded-2xl border border-[#f4b6d0] bg-white p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-4 border-b border-[#ffd6e7] pb-6 md:flex-row md:items-end">
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-[#be185d]">
                    <Droplets className="h-4 w-4" aria-hidden="true" />
                    <span>What to Expect & How to Manage Postpartum Bleeding</span>
                  </div>
                  <h3 className="mt-1.5 text-2xl font-semibold text-[#3f0d24]">
                    {translated[8] || POSTPARTUM_STATIC_TEXTS[8]}
                  </h3>
                </div>
                <p className="text-xs text-[#5c223d]">
                  Select each stage below to compare pad appearance, clot guidance, and pad care.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                {LOCHIA_STAGES.map((stage, idx) => {
                  const isSelected = selectedLochia.id === stage.id;
                  const trName = translated[lochiaOff + idx * 5] || stage.name;
                  const trColor = translated[lochiaOff + idx * 5 + 1] || stage.colorLabel;
                  return (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => setSelectedLochia(stage)}
                      className={`flex flex-col rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#be185d] bg-[#fff0f6] ring-2 ring-[#be185d]'
                          : 'border-[#ffd6e7] bg-[#fff7fa] hover:border-[#be185d]/60'
                      }`}
                    >
                      <div className="mb-3 overflow-hidden rounded-xl border border-[#f4b6d0] bg-white">
                        <img
                          src={stage.padImage}
                          alt={stage.padImageAlt}
                          referrerPolicy="no-referrer"
                          className="aspect-[4/3] w-full object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-semibold text-[#be185d]">
                          {stage.stageNumber} · {stage.daysRange}
                        </span>
                        <span
                          aria-hidden="true"
                          className="h-5 w-5 rounded-full border border-black/15 shrink-0"
                          style={{ backgroundColor: stage.colorHex }}
                        />
                      </div>
                      <h4 className="mt-1.5 font-sans text-base font-semibold text-[#3f0d24]">
                        {trName}
                      </h4>
                      <p className="mt-1 text-xs font-medium text-[#5c223d]">
                        {stage.padType} · {trColor}
                      </p>
                    </button>
                  );
                })}
              </div>

              {(() => {
                const sIdx = Math.max(
                  0,
                  LOCHIA_STAGES.findIndex((s) => s.id === selectedLochia.id)
                );
                const trName = translated[lochiaOff + sIdx * 5] || selectedLochia.name;
                const trColor = translated[lochiaOff + sIdx * 5 + 1] || selectedLochia.colorLabel;
                const trExpect = translated[lochiaOff + sIdx * 5 + 2] || selectedLochia.whatToExpect;
                const trClots = translated[lochiaOff + sIdx * 5 + 3] || selectedLochia.normalClots;
                const trPad = translated[lochiaOff + sIdx * 5 + 4] || selectedLochia.padManagement;
                return (
                  <div className="mt-6 grid grid-cols-1 gap-6 rounded-2xl border border-[#ea91b8] bg-[#fff7fa] p-6 lg:grid-cols-12 items-center">
                    <div className="lg:col-span-5 space-y-3">
                      <div className="overflow-hidden rounded-xl border border-[#f4b6d0] bg-white">
                        <img
                          src={selectedLochia.padImage}
                          alt={selectedLochia.padImageAlt}
                          referrerPolicy="no-referrer"
                          className="aspect-[4/3] w-full object-cover"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className="h-9 w-9 shrink-0 rounded-lg border border-black/15"
                          style={{ backgroundColor: selectedLochia.colorHex }}
                          aria-label={`Color sample for ${trName}: ${trColor}`}
                        />
                        <div>
                          <p className="font-mono text-xs font-semibold text-[#be185d] m-0">
                            {selectedLochia.stageNumber} · {selectedLochia.daysRange}
                          </p>
                          <h4 className="text-lg font-semibold text-[#3f0d24] m-0">
                            {trName} — {selectedLochia.padType}
                          </h4>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm leading-relaxed text-[#5c223d] lg:col-span-7">
                      <p>
                        <strong className="text-[#3f0d24]">Expected color on pad:</strong> {trColor}
                      </p>
                      <p>
                        <strong className="text-[#3f0d24]">What to expect:</strong> {trExpect}
                      </p>
                      <p>
                        <strong className="text-[#3f0d24]">Clot guidance:</strong> {trClots}
                      </p>
                      <p>
                        <strong className="text-[#3f0d24]">How to manage it:</strong> {trPad}
                      </p>
                    </div>
                  </div>
                );
              })()}

              <div className="mt-6 rounded-xl border border-[#be123c]/30 bg-[#fff0f3] p-5">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#be123c]" aria-hidden="true" />
                  <div>
                    <h4 className="font-sans text-sm font-semibold text-[#3f0d24]">
                      {translated[9] || POSTPARTUM_STATIC_TEXTS[9]}
                    </h4>
                    <ul className="mt-2 grid grid-cols-1 gap-1.5 text-xs leading-relaxed text-[#5c223d] sm:grid-cols-2">
                      <li>• You soak through 1 maxi pad in 1 hour or less for 2 hours straight</li>
                      <li>• You pass blood clots larger than a golf ball or lemon</li>
                      <li>• Lochia develops a strong foul or fishy odor</li>
                      <li>• Fever over 38°C, chills, dizziness, or racing heartbeat</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'csection' && (
            <div className="rounded-2xl border border-[#f4b6d0] bg-white p-6 sm:p-8 space-y-6">
              <div className="grid gap-8 lg:grid-cols-12 items-center">
                <div className="lg:col-span-6 space-y-3">
                  <h3 className="text-2xl font-semibold text-[#3f0d24] m-0">
                    {translated[10] || POSTPARTUM_STATIC_TEXTS[10]}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#5c223d] m-0">
                    Obstetricians choose an abdominal and uterine cut based on baby’s position, placenta location, and how urgently delivery is needed. Always check your discharge summary to know which uterine cut was performed.
                  </p>
                  <div className="space-y-3 pt-1">
                    {CSECTION_TYPES.map((type, idx) => (
                      <div key={type.id} className="rounded-xl border border-[#ffd6e7] bg-[#fff7fa] p-4 space-y-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h4 className="font-sans text-sm font-bold text-[#3f0d24] m-0">
                            {translated[csecOff + idx * 4] || type.name}
                          </h4>
                          <span className="font-mono text-xs font-semibold text-[#be185d]">
                            {type.frequency}
                          </span>
                        </div>
                        <p className="text-xs text-[#5c223d] m-0 leading-relaxed">
                          <strong className="text-[#3f0d24]">Where & When:</strong>{' '}
                          {translated[csecOff + idx * 4 + 1] || type.whereCut}{' '}
                          {translated[csecOff + idx * 4 + 2] || type.exampleUse}
                        </p>
                        <p className="text-xs text-[#7e405c] m-0">
                          <strong className="text-[#3f0d24]">Healing note:</strong>{' '}
                          {translated[csecOff + idx * 4 + 3] || type.recoveryNote}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-6">
                  <figure className="m-0 rounded-2xl border border-[#ea91b8] bg-[#fff7fa] p-3 space-y-2">
                    <img
                      src={IMAGES.cSectionTypes}
                      alt="Diagram comparing the 3 types of Cesarean section incisions: 1. Low Transverse Bikini Cut, 2. Low Vertical Cut, and 3. Classical Vertical Cut"
                      referrerPolicy="no-referrer"
                      className="w-full aspect-[4/3] object-cover rounded-xl"
                    />
                    <figcaption className="text-[11px] text-center text-[#7e405c]">
                      Common Types of C-Section Incisions — Low Transverse ("bikini cut"), Low Vertical, and Classical Vertical.
                    </figcaption>
                  </figure>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 border-t border-[#ffd6e7] pt-6">
                <div className="rounded-xl border border-[#ffd6e7] bg-[#fff7fa] p-5">
                  <h4 className="font-sans text-base font-semibold text-[#3f0d24]">
                    Daily Washing & Clothing Rules
                  </h4>
                  <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-[#5c223d]">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#be185d]" aria-hidden="true" />
                      <span>
                        <strong className="text-[#3f0d24]">Shower gently daily:</strong> Let warm water and mild unscented soap flow over the incision—never scrub or soak in a bathtub until cleared at 6 weeks.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#be185d]" aria-hidden="true" />
                      <span>
                        <strong className="text-[#3f0d24]">Pat dry cleanly:</strong> Use a fresh towel (or cool air dry) so skin folds stay dry and breathable.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#be185d]" aria-hidden="true" />
                      <span>
                        <strong className="text-[#3f0d24]">High-waisted cotton underwear:</strong> Choose soft waistbands sitting well above the scar line to avoid friction.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-[#ffd6e7] bg-[#fff7fa] p-5">
                  <h4 className="font-sans text-base font-semibold text-[#3f0d24]">
                    Movement Protection & Infection Watch
                  </h4>
                  <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-[#5c223d]">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#be185d]" aria-hidden="true" />
                      <span>
                        <strong className="text-[#3f0d24]">Pillow splinting:</strong> Hold a firm pillow lightly against your scar whenever you cough, sneeze, laugh, or stand up.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#be185d]" aria-hidden="true" />
                      <span>
                        <strong className="text-[#3f0d24]">Lifting limit:</strong> Lift nothing heavier than your newborn for the first 6 weeks; roll onto your side first before sitting up.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#be123c]" aria-hidden="true" />
                      <span>
                        <strong className="text-[#3f0d24]">Call your clinic if:</strong> The scar becomes hot, increasingly red, swollen, oozes yellow/green fluid, or edges separate.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'episiotomy' && (
            <div className="rounded-2xl border border-[#f4b6d0] bg-white p-6 sm:p-8 space-y-8">
              <div className="grid gap-8 lg:grid-cols-12 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <h3 className="text-2xl font-semibold text-[#3f0d24] m-0">
                    {translated[11] || POSTPARTUM_STATIC_TEXTS[11]}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#5c223d] m-0">
                    An episiotomy is a small surgical cut made when medically needed during delivery to widen the vaginal opening. Dissolvable stitches usually absorb within 2–4 weeks.
                  </p>
                  <div className="space-y-3">
                    {EPISIOTOMY_TYPES.map((epi, idx) => (
                      <div key={epi.id} className="rounded-xl border border-[#ffd6e7] bg-[#fff7fa] p-4 space-y-1">
                        <h4 className="font-sans text-sm font-bold text-[#3f0d24] m-0">
                          {translated[epiTypeOff + idx * 2] || epi.name}
                        </h4>
                        <span className="block font-mono text-xs font-semibold text-[#be185d]">
                          {epi.angle}
                        </span>
                        <p className="text-xs text-[#5c223d] m-0 leading-relaxed">
                          {translated[epiTypeOff + idx * 2 + 1] || epi.whyUsed}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-6">
                  <figure className="m-0 rounded-2xl border border-[#ea91b8] bg-[#fff7fa] p-3 space-y-2">
                    <img
                      src={IMAGES.episiotomyTypes}
                      alt="Illustrative comparison showing Mediolateral Episiotomy angled 45 degrees away from rectum versus vertical Midline Episiotomy"
                      referrerPolicy="no-referrer"
                      className="w-full aspect-[4/3] object-cover rounded-xl"
                    />
                    <figcaption className="text-[11px] text-center text-[#7e405c]">
                      Episiotomy Examples — Mediolateral (angled safely away from rectum) vs Midline vertical incision.
                    </figcaption>
                  </figure>
                </div>
              </div>

              {/* Step-by-step Visual Sequence */}
              <div className="space-y-5 border-t border-[#ffd6e7] pt-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#be185d] m-0">
                    Step-by-Step Visual Recovery Guide
                  </p>
                  <h4 className="font-display text-xl font-semibold text-[#3f0d24] mt-1 m-0">
                    {translated[12] || POSTPARTUM_STATIC_TEXTS[12]}
                  </h4>
                </div>

                <figure className="m-0 rounded-2xl border border-[#ea91b8] bg-[#fff7fa] p-3 space-y-2">
                  <img
                    src={IMAGES.episiotomyCareSteps}
                    alt="4-panel step-by-step guide: 1. Warm peri bottle rinsing, 2. Cool ice compress, 3. Warm shallow sitz bath, 4. Pat dry and clean maternity pad"
                    referrerPolicy="no-referrer"
                    className="w-full rounded-xl aspect-[16/9] object-cover"
                  />
                  <figcaption className="text-[11px] text-center text-[#7e405c]">
                    Step 1: Warm peri rinse while urinating · Step 2: Cloth-wrapped ice pack · Step 3: Warm shallow sitz bath · Step 4: Pat dry & clean cotton pad.
                  </figcaption>
                </figure>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {EPISIOTOMY_CARE_STEPS.map((s, idx) => (
                    <div key={s.step} className="rounded-xl border border-[#ffd6e7] bg-[#fff7fa] p-4 space-y-1.5">
                      <p className="font-mono text-xs font-semibold text-[#be185d] m-0">{s.step}</p>
                      <h5 className="font-sans text-sm font-bold text-[#3f0d24] m-0">
                        {translated[epiStepOff + idx * 2] || s.title}
                      </h5>
                      <p className="text-xs leading-relaxed text-[#5c223d] m-0">
                        {translated[epiStepOff + idx * 2 + 1] || s.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'selfcare' && (
            <div className="rounded-2xl border border-[#f4b6d0] bg-white p-6 sm:p-8 space-y-6">
              <div className="grid gap-8 lg:grid-cols-12 items-center">
                <div className="lg:col-span-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#be185d]">
                    <HeartHandshake className="h-4 w-4" aria-hidden="true" />
                    <span>Whole-Body Postpartum Healing Examples</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-[#3f0d24] m-0">
                    {translated[13] || POSTPARTUM_STATIC_TEXTS[13]}
                  </h3>
                  <p className="text-sm text-[#5c223d] m-0 leading-relaxed">
                    Look at the photo example beside this guide: set up a rest station next to baby’s bassinet with a 1L refillable water bottle, warm iron-rich meals within arm’s reach, soft cotton loungewear, and cushions supporting your back while healing.
                  </p>
                </div>

                <div className="lg:col-span-6">
                  <figure className="m-0 rounded-2xl border border-[#ea91b8] bg-[#fff7fa] p-3 space-y-2">
                    <img
                      src={IMAGES.postpartumSelfCare}
                      alt="Recovering new mother resting in soft pink loungewear drinking water beside warm lentil vegetable soup, greens, toast, and newborn sleeping in a bassinet"
                      referrerPolicy="no-referrer"
                      className="w-full aspect-[4/3] object-cover rounded-xl"
                    />
                    <figcaption className="text-[11px] text-center text-[#7e405c]">
                      Daily Self-Care Setup Example — 1L water bottle, warm iron-rich soup & greens, soft clothes, and resting while baby naps nearby.
                    </figcaption>
                  </figure>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="rounded-xl border border-[#ffd6e7] bg-[#fff7fa] p-5">
                  <h4 className="font-sans text-base font-semibold text-[#3f0d24]">
                    Nourishment, Hydration & the 5-5-5 Rest Rhythm
                  </h4>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#5c223d]">
                    <li>• Keep a 1L water bottle next to every feeding chair; aim for 10–12 cups daily.</li>
                    <li>• Prioritize iron, protein, and warm easy meals (lentil soup, eggs, oats, beans, leafy greens) to rebuild blood lost during delivery.</li>
                    <li>• Follow the 5-5-5 rest rhythm if possible: 5 days in bed, 5 days on the bed, 5 days near the bed.</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-[#ffd6e7] bg-[#fff7fa] p-5">
                  <h4 className="font-sans text-base font-semibold text-[#3f0d24]">
                    Emotional Health & Asking Helpers for Specific Tasks
                  </h4>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#5c223d]">
                    <li>• "Baby blues" (tearfulness, mood swings) affect up to 80% of new moms in days 3–10 due to steep hormone shifts.</li>
                    <li>• If sadness, panic, insomnia, or hopelessness lasts longer than 2 weeks, tell your clinic nurse right away.</li>
                    <li>• Hand off chores when visitors arrive: ask them to fold laundry, wash bottles, or bring dinner while you rest.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contraception' && (
            <div className="rounded-2xl border border-[#f4b6d0] bg-white p-6 sm:p-8 space-y-6">
              <div className="space-y-2 border-b border-[#ffd6e7] pb-5">
                <h3 className="text-2xl font-semibold text-[#3f0d24] m-0">
                  {translated[14] || POSTPARTUM_STATIC_TEXTS[14]}
                </h3>
                <p className="text-sm leading-relaxed text-[#5c223d] m-0 max-w-3xl">
                  Your reproductive choices belong to you. Public clinics and MOUs provide each of these safe, breastfeeding-friendly options free of charge—compare individual photos of every method below.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {FAMILY_PLANNING_VISUAL_EXAMPLES.map((method, idx) => (
                  <div
                    key={method.name}
                    className="rounded-2xl border border-[#ea91b8] bg-[#fff7fa] overflow-hidden flex flex-col"
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden border-b border-[#f4b6d0] bg-white">
                      <img
                        src={method.image}
                        alt={method.imageAlt}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 space-y-1.5 flex-1">
                      <span className="font-mono text-[11px] font-semibold text-[#be185d]">
                        {method.imageNote}
                      </span>
                      <h4 className="font-sans text-sm font-bold text-[#3f0d24] m-0">
                        {translated[fpOff + idx * 2] || method.name}
                      </h4>
                      <p className="text-xs leading-relaxed text-[#5c223d] m-0">
                        {translated[fpOff + idx * 2 + 1] || method.howItWorks}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
