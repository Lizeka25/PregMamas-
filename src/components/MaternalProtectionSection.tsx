import { useState } from 'react';
import {
  CheckCircle2,
  Droplet,
  HeartHandshake,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  IMAGES,
  PREP_TYPES,
  PREVENTABLE_DEFECT_EXAMPLES,
} from '../data/pregmamasData';

export function MaternalProtectionSection() {
  const [rhStatus, setRhStatus] = useState<'rh-negative' | 'rh-positive' | 'unsure'>('rh-negative');

  return (
    <section id="blood-defects-hiv" className="border-t border-[#f4b6d0] py-12 lg:py-16 space-y-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 1. Blood Type (Rh- vs Rh+) & Anti-D Protection */}
        <div className="rounded-3xl border border-[#ea91b8] bg-white p-6 sm:p-8 space-y-6">
          <div className="grid gap-8 lg:grid-cols-12 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#be185d]">
                <Droplet className="w-4 h-4" aria-hidden="true" />
                <span>Blood Type (ABO) · Rh Negative vs Rh Positive</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#3f0d24] m-0">
                Why Knowing Your Blood Type & Rh Factor Protects Your Baby
              </h2>
              <p className="text-sm leading-relaxed text-[#5c223d] m-0">
                Every pregnant mother should arrive early (at least 30 minutes ahead) at her first antenatal booking visit to check her ABO blood group (A, B, AB, or O) and <strong>Rh factor (Rh+ or Rh-)</strong>. If you are <strong>Rh-negative</strong> and your baby inherits <strong>Rh-positive</strong> blood from the father, your immune system can form antibodies against baby’s red blood cells—unless you receive a protective <strong>Anti-D injection</strong>.
              </p>

              {/* Interactive Rh Checker */}
              <div className="rounded-2xl border border-[#ea91b8] bg-[#fff7fa] p-4 space-y-3">
                <p className="text-xs font-bold text-[#3f0d24] m-0">
                  Select your clinic blood test result to see what care you need:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'rh-negative' as const, label: 'I am Rh-Negative (-)' },
                    { id: 'rh-positive' as const, label: 'I am Rh-Positive (+)' },
                    { id: 'unsure' as const, label: 'Not Tested Yet' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setRhStatus(opt.id)}
                      className={`min-h-[38px] rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                        rhStatus === opt.id
                          ? 'bg-[#be185d] text-white'
                          : 'border border-[#ea91b8] bg-white text-[#5c223d] hover:bg-[#ffe4ef]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {rhStatus === 'rh-negative' && (
                  <div className="rounded-xl border border-[#db2777]/40 bg-[#ffe4ef] p-3.5 text-xs text-[#3f0d24] space-y-1.5">
                    <strong className="block text-[#9d174d]">
                      Rh-Negative Action Plan (Essential to Prevent Newborn Jaundice / Hemolytic Disease):
                    </strong>
                    <ul className="space-y-1 m-0 pl-4">
                      <li>• Get a routine <strong>Anti-D Immunoglobulin injection at 28 weeks</strong> at your clinic or MOU.</li>
                      <li>• Go to your clinic immediately for an Anti-D shot after any vaginal bleeding, abdominal bump, amniocentesis, or miscarriage.</li>
                      <li>• After delivery, receive a booster Anti-D dose within <strong>72 hours</strong> if baby is tested Rh-positive.</li>
                    </ul>
                  </div>
                )}

                {rhStatus === 'rh-positive' && (
                  <div className="rounded-xl border border-[#ea91b8] bg-[#fff0f6] p-3.5 text-xs text-[#3f0d24]">
                    <strong className="block text-[#be185d]">Rh-Positive (+):</strong>
                    You do not need Anti-D injections. Still record your exact blood group (A+, B+, AB+, or O+) in your Maternity Case Record in case blood support is ever needed during birth.
                  </div>
                )}

                {rhStatus === 'unsure' && (
                  <div className="rounded-xl border border-[#ea91b8] bg-[#fff0f6] p-3.5 text-xs text-[#3f0d24]">
                    <strong className="block text-[#be185d]">Ask for a Free Blood Group Test Now:</strong>
                    Arrive early for your next antenatal clinic visit and bring your booklet—public antenatal clinics run rapid blood typing + hemoglobin checks and give you your Rh result.
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-6">
              <figure className="m-0 rounded-2xl border border-[#ea91b8] bg-[#fff7fa] p-3 space-y-2">
                <img
                  src={IMAGES.bloodTypeRh}
                  alt="Diagram of ABO blood types (A, B, AB, O), Rh Positive vs Rh Negative blood cells, and protective Anti-D arm injection for Rh-negative mothers"
                  referrerPolicy="no-referrer"
                  className="w-full aspect-[4/3] object-cover rounded-xl"
                />
                <figcaption className="text-[11px] text-center text-[#7e405c]">
                  Blood Type & Rh Compatibility — Anti-D antibodies shield baby’s red blood cells in Rh-negative pregnancies.
                </figcaption>
              </figure>
            </div>
          </div>
        </div>

        {/* 2. Preventable Baby Defects & Supplement Examples */}
        <div className="rounded-3xl border border-[#ea91b8] bg-white p-6 sm:p-8 space-y-6">
          <div className="grid gap-8 lg:grid-cols-12 items-center">
            <div className="lg:col-span-5">
              <figure className="m-0 rounded-2xl border border-[#ea91b8] bg-[#fff7fa] p-3 space-y-2">
                <img
                  src={IMAGES.defectsPrevention}
                  alt="Medical illustration showing Folic Acid preventing Spina Bifida, Iron supporting birth weight and blood cells, Calcium and Vitamin D building strong bones, and Anti-D protecting newborn red blood cells"
                  referrerPolicy="no-referrer"
                  className="w-full aspect-[4/3] object-cover rounded-xl"
                />
                <figcaption className="text-[11px] text-center text-[#7e405c]">
                  Visual Defect Prevention — Daily folic acid, iron, calcium, and Anti-D protect spine, blood & bone formation.
                </figcaption>
              </figure>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#be185d]">
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                <span>Preventing Birth Defects & Deficiency Conditions</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#3f0d24] m-0">
                Examples of Baby Defects Caused by Skipping Supplements & How to Prevent Them
              </h2>
              <p className="text-sm text-[#5c223d] m-0 leading-relaxed">
                Taking your prenatal vitamins every day—and avoiding alcohol, smoking, unprescribed herbal mixtures, or missed Rh shots—protects your baby during critical early organ and spine formation.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                {PREVENTABLE_DEFECT_EXAMPLES.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-[#ea91b8] bg-[#fff7fa] overflow-hidden flex flex-col"
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden border-b border-[#f4b6d0] bg-white">
                      <img
                        src={item.image}
                        alt={item.imageAlt}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain bg-[#fffafc]"
                      />
                    </div>
                    <div className="p-4 space-y-1.5 flex-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#be123c]">
                        {item.missingNutrient}
                      </span>
                      <h3 className="font-sans text-sm font-bold text-[#3f0d24] m-0">
                        {item.defectExample}
                      </h3>
                      <p className="text-xs text-[#5c223d] m-0 leading-relaxed">
                        {item.explanation}
                      </p>
                      <p className="text-xs font-semibold text-[#9d174d] pt-1 m-0">
                        How to prevent: {item.howToPrevent}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. HIV-Positive Mothers Protecting Baby & Types of PrEP */}
        <div className="rounded-3xl border border-[#ea91b8] bg-white p-6 sm:p-8 space-y-6">
          <div className="grid gap-8 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#be185d]">
                <ShieldAlert className="w-4 h-4" aria-hidden="true" />
                <span>HIV Care During Pregnancy (PMTCT) & Types of PrEP</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#3f0d24] m-0">
                Protecting Your Baby If You Are HIV-Positive — Plus Types of PrEP
              </h2>
              <p className="text-sm text-[#5c223d] m-0 leading-relaxed">
                With modern antiretroviral treatment (ART), an HIV-positive mother with an <strong>undetectable viral load</strong> has an overwhelmingly high chance (&gt;99%) of giving birth to an HIV-negative, healthy baby. And if you are HIV-negative, <strong>PrEP</strong> helps keep both you and baby HIV-free.
              </p>

              <div className="rounded-2xl border border-[#ea91b8] bg-[#ffeef5] p-4 space-y-2">
                <strong className="block text-sm text-[#3f0d24]">
                  If You Are HIV-Positive: 4 Essential Steps to Protect Your Baby
                </strong>
                <ul className="space-y-1.5 text-xs text-[#5c223d] m-0 p-0 list-none">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#be185d] shrink-0 mt-0.5" aria-hidden="true" />
                    <span><strong>Take daily ART at the same hour every day:</strong> Never skip doses—keeping your Viral Load suppressed prevents transmission in pregnancy and birth.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#be185d] shrink-0 mt-0.5" aria-hidden="true" />
                    <span><strong>Give newborn infant prophylaxis syrup:</strong> Right after birth, your midwife gives baby daily Nevirapine/AZT syrup for the full prescribed weeks.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#be185d] shrink-0 mt-0.5" aria-hidden="true" />
                    <span><strong>Safe feeding + repeat viral load checks:</strong> Exclusive breastfeeding while taking daily ART is safe when virally suppressed; bring baby for birth, 10-week & 6-month PCR checks.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2.5">
                <strong className="block text-xs font-bold uppercase tracking-wider text-[#9d174d]">
                  Types of PrEP (Pre-Exposure Prophylaxis for HIV-Negative Mothers)
                </strong>
                <div className="grid gap-3 sm:grid-cols-3">
                  {PREP_TYPES.map((prep) => (
                    <div key={prep.id} className="rounded-xl border border-[#f4b6d0] bg-[#fff7fa] p-3.5 space-y-1">
                      <strong className="block text-xs font-bold text-[#3f0d24]">{prep.name}</strong>
                      <span className="block text-[11px] font-semibold text-[#be185d]">{prep.schedule}</span>
                      <p className="text-[11px] text-[#5c223d] m-0 leading-relaxed">{prep.bestFor}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <figure className="m-0 rounded-2xl border border-[#ea91b8] bg-[#fff7fa] p-3 space-y-2">
                <img
                  src={IMAGES.hivPmtctPrep}
                  alt="Illustration showing a mother taking daily ART and giving infant prophylaxis drops on left, and Daily Oral PrEP, Long-Acting PrEP Injection, and Vaginal PrEP Ring on right"
                  referrerPolicy="no-referrer"
                  className="w-full aspect-[4/3] object-cover rounded-xl"
                />
                <figcaption className="text-[11px] text-center text-[#7e405c]">
                  Visual HIV Protection — Left: ART + infant drops protect baby. Right: 3 PrEP options for HIV-negative moms.
                </figcaption>
              </figure>
            </div>
          </div>
        </div>

        {/* 4. Unplanned Pregnancy Picture Examples & Calm Decisions */}
        <div className="rounded-3xl border border-[#ea91b8] bg-gradient-to-br from-[#ffe4ef] via-[#fff7fa] to-[#ffd6e7] p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-12 items-center">
            <div className="lg:col-span-5">
              <figure className="m-0 rounded-2xl border-2 border-[#ea91b8] bg-white p-2.5 space-y-2">
                <img
                  src={IMAGES.unplannedOptions}
                  alt="Calm young woman speaking privately with a clinic counselor reviewing 3 path cards: Clinic Health Check, Parenting Support, and Confidential Options Info"
                  referrerPolicy="no-referrer"
                  className="w-full aspect-[4/3] object-cover rounded-xl"
                />
                <figcaption className="text-[11px] text-center text-[#7e405c]">
                  Safe, non-judgmental clinic counseling helps you understand your exact dates and real legal options.
                </figcaption>
              </figure>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#be185d]">
                <HeartHandshake className="w-4 h-4" aria-hidden="true" />
                <span>Unplanned Pregnancy · Picture-Guided Calm Decisions</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#3f0d24] m-0">
                Making the Right Choice Safely & Without Pressure
              </h2>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#ea91b8] bg-white p-4 space-y-1.5">
                  <Sparkles className="w-4 h-4 text-[#be185d]" aria-hidden="true" />
                  <strong className="block text-xs font-bold text-[#3f0d24]">
                    Path 1: Confirm & Get Checked
                  </strong>
                  <p className="text-xs text-[#5c223d] m-0 leading-relaxed">
                    Visit a clinic nurse for a confidential pregnancy test, blood pressure screening, and ultrasound dating so you have clear facts before deciding.
                  </p>
                </div>
                <div className="rounded-2xl border border-[#ea91b8] bg-white p-4 space-y-1.5">
                  <Sparkles className="w-4 h-4 text-[#be185d]" aria-hidden="true" />
                  <strong className="block text-xs font-bold text-[#3f0d24]">
                    Path 2: Parenting Support Plan
                  </strong>
                  <p className="text-xs text-[#5c223d] m-0 leading-relaxed">
                    Bring a trusted aunt, friend, or school counselor. Access free clinic vitamins, school maternity study accommodations, and the SASSA Child Support Grant after birth.
                  </p>
                </div>
                <div className="rounded-2xl border border-[#ea91b8] bg-white p-4 space-y-1.5">
                  <Sparkles className="w-4 h-4 text-[#be185d]" aria-hidden="true" />
                  <strong className="block text-xs font-bold text-[#3f0d24]">
                    Path 3: Legal Choices & Adoption
                  </strong>
                  <p className="text-xs text-[#5c223d] m-0 leading-relaxed">
                    Ask a clinic social worker about safe adoption placement or legal termination services under South Africa’s Choice Act—never buy unsafe pills online or from street posters.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
