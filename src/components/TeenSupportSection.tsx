import { useState } from 'react';
import { BookOpen, Check, Copy, HeartHandshake, PhoneCall, Users } from 'lucide-react';
import { IMAGES, TEEN_EXAMPLES, TEEN_SCRIPTS } from '../data/pregmamasData';
import { SafeImage } from './SafeImage';

export function TeenSupportSection() {
  const [activeScriptId, setActiveScriptId] = useState<string>(TEEN_SCRIPTS[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedScript =
    TEEN_SCRIPTS.find((s) => s.id === activeScriptId) || TEEN_SCRIPTS[0];

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(selectedScript.script);
      setCopiedId(selectedScript.id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <section id="teen-support" className="border-t border-[#f4b6d0] py-14 lg:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="text-xs font-medium tracking-wide text-[#be185d]">
              05. Teen Pregnancy & Young Mama Support
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#3f0d24] sm:text-4xl">
              Practical Support, School Rights & Real Examples for Teen Moms
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#5c223d]">
              Public clinics offer free, confidential youth-friendly antenatal support for teen mothers—with no judgment. Whether you are finishing high school, talking with family, or arranging baby gear, you have legal school protections and real community support.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-[#f4b6d0] bg-white p-4">
                <BookOpen className="h-4 w-4 text-[#be185d]" aria-hidden="true" />
                <h3 className="mt-2 font-sans text-sm font-semibold text-[#3f0d24]">
                  Stay in School
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#5c223d]">
                  Right to excused prenatal clinic visits, homebound study during recovery, and return-to-class accommodations.
                </p>
              </div>
              <div className="rounded-xl border border-[#f4b6d0] bg-white p-4">
                <HeartHandshake className="h-4 w-4 text-[#be185d]" aria-hidden="true" />
                <h3 className="mt-2 font-sans text-sm font-semibold text-[#3f0d24]">
                  Free Clinic & Arrive Early
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#5c223d]">
                  Arrive early (30+ minutes before opening) for free antenatal visits, prenatal vitamins, Road to Health booklets, and school return notes.
                </p>
              </div>
              <div className="rounded-xl border border-[#f4b6d0] bg-white p-4">
                <Users className="h-4 w-4 text-[#be185d]" aria-hidden="true" />
                <h3 className="mt-2 font-sans text-sm font-semibold text-[#3f0d24]">
                  Peer Circles
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#5c223d]">
                  Young-mama groups connecting teen parents with mentors, diapers, and baby clothing pantries.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <SafeImage
              src={IMAGES.teenSupport}
              alt="Smiling young teen mother sitting at a sunlit table with a caring counselor and peer young mom reviewing notebooks"
              caption="Connecting early with a youth-friendly clinic nurse, school counselor, or young-mom group builds steady support."
              aspectClass="aspect-[4/3]"
            />
          </div>
        </div>

        {/* Real-World Teen Mom Examples */}
        <div className="mt-12">
          <h3 className="text-2xl font-semibold text-[#3f0d24]">
            Real-World Examples: How Teen Moms Navigate School, Family & Care
          </h3>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {TEEN_EXAMPLES.map((example) => (
              <article
                key={example.id}
                className="flex flex-col justify-between rounded-2xl border border-[#f4b6d0] bg-white p-6"
              >
                <div>
                  <p className="font-mono text-xs font-medium text-[#be185d]">
                    {example.nameAge}
                  </p>
                  <h4 className="mt-2 font-sans text-base font-semibold text-[#3f0d24]">
                    Challenge: {example.situation}
                  </h4>
                  <p className="mt-3 text-sm leading-relaxed text-[#5c223d]">
                    <strong className="text-[#3f0d24]">Step taken:</strong> {example.whatSheDid}
                  </p>
                </div>
                <p className="mt-4 border-t border-[#ffd6e7] pt-3 text-xs font-medium leading-relaxed text-[#be185d]">
                  Outcome: {example.outcome}
                </p>
              </article>
            ))}
          </div>
        </div>

        {/* Interactive Conversation Script Helper + Confidential Support Directory */}
        <div className="mt-10 grid grid-cols-1 gap-8 rounded-2xl border border-[#f4b6d0] bg-white p-6 sm:p-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h3 className="text-xl font-semibold text-[#3f0d24]">
              Ready-to-Use Conversation Scripts
            </h3>
            <p className="mt-1 text-sm text-[#5c223d]">
              Not sure how to start a tough conversation? Pick a situation and copy or adapt the exact words below.
            </p>

            <div className="mt-4 flex flex-wrap gap-1.5 rounded-xl bg-[#ffeef5] p-1">
              {TEEN_SCRIPTS.map((script) => (
                <button
                  key={script.id}
                  type="button"
                  onClick={() => setActiveScriptId(script.id)}
                  className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    activeScriptId === script.id
                      ? 'bg-white text-[#3f0d24] shadow-sm'
                      : 'text-[#5c223d] hover:text-[#3f0d24]'
                  }`}
                >
                  {script.label}
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-[#ffd6e7] bg-[#fff7fa] p-5">
              <p className="text-xs font-medium text-[#be185d]">{selectedScript.audience}</p>
              <p className="mt-2.5 text-sm leading-relaxed text-[#3f0d24]">
                {selectedScript.script}
              </p>
              <button
                type="button"
                onClick={handleCopyScript}
                className="mt-4 inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#f4b6d0] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#3f0d24] transition-colors hover:bg-[#ffeef5] whitespace-nowrap shrink-0"
              >
                {copiedId === selectedScript.id ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#be185d]" aria-hidden="true" />
                    Copied to Clipboard
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-[#be185d]" aria-hidden="true" />
                    Copy Script
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-[#ffd6e7] bg-[#fff7fa] p-5 lg:col-span-5">
            <div className="flex items-center gap-2 text-xs font-medium text-[#be185d]">
              <PhoneCall className="h-4 w-4" aria-hidden="true" />
              <span>Free & Confidential Youth Support Lines</span>
            </div>
            <h4 className="mt-2 font-sans text-base font-semibold text-[#3f0d24]">
              Who You Can Reach Out to Today
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-[#5c223d]">
              <li className="border-b border-[#ffd6e7] pb-3">
                <p className="font-semibold text-[#3f0d24]">South African Emergency & Ambulance</p>
                <p className="mt-0.5 font-mono text-xs text-[#be185d]">
                  10177 (Ambulance) · 112 (Cell Emergency)
                </p>
              </li>
              <li className="border-b border-[#ffd6e7] pb-3">
                <p className="font-semibold text-[#3f0d24]">MomConnect SA (Free Maternal SMS/WhatsApp)</p>
                <p className="mt-0.5 font-mono text-xs text-[#be185d]">
                  Dial *134*550# at clinic registration
                </p>
              </li>
              <li className="border-b border-[#ffd6e7] pb-3">
                <p className="font-semibold text-[#3f0d24]">Childline South Africa (Free Teen Helpline)</p>
                <p className="mt-0.5 font-mono text-xs text-[#be185d]">
                  Call 116 (24/7 toll-free, confidential)
                </p>
              </li>
              <li>
                <p className="font-semibold text-[#3f0d24]">LifeLine SA / Maternal Mental Health</p>
                <p className="mt-0.5 font-mono text-xs text-[#be185d]">
                  0861 322 322 (SA) · 1-833-TLC-MAMA (US)
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
