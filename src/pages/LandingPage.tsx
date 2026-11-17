import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Baby,
  BookOpen,
  Calendar,
  Footprints,
  Heart,
  HeartHandshake,
  Luggage,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { AppRoute, DemoUser, HOW_IT_WORKS_STEPS, IMAGES } from '../data/pregmamasData';
import { PinkLmpCalendar } from '../components/PinkLmpCalendar';

interface LandingPageProps {
  user: DemoUser | null;
  onNavigate: (path: AppRoute, topic?: string) => void;
}

const DEFAULT_PREVIEW_LMP = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 24 * 7);
  return d.toISOString().split('T')[0];
})();

export function LandingPage({ user, onNavigate }: LandingPageProps) {
  const [lmpDate, setLmpDate] = useState<string>(() => {
    return localStorage.getItem('pregmamas_lmp_date_v1') || DEFAULT_PREVIEW_LMP;
  });

  useEffect(() => {
    localStorage.setItem('pregmamas_lmp_date_v1', lmpDate);
  }, [lmpDate]);

  const exploreCards = [
    {
      href: '/dashboard' as AppRoute,
      title: 'Mother Dashboard & Pink Supplement Alarm',
      desc: 'Pink LMP calendar with baby size pictures, self-set supplement alarms with custom music, and clinic reminders.',
      icon: Heart,
      image: IMAGES.clinicMidwife,
      imageAlt: 'South African clinic nurse speaking with expectant mother holding her maternity booklet',
    },
    {
      href: '/kicks' as AppRoute,
      title: 'Baby Movement Trigger Sounds & Daily Log',
      desc: 'Pink movement tracker with wake-up stimulus sounds to encourage baby kicks plus a per-day movement log.',
      icon: Footprints,
      image: IMAGES.navBabyKicks,
      imageAlt: 'Expectant mother playing cheerful sounds to trigger baby movement and logging daily kicks',
    },
    {
      href: '/learn' as AppRoute,
      title: 'Blood Type (Rh), HIV PMTCT & PrEP Guides',
      desc: 'Visual guides on Rh-/Rh+ Anti-D protection, supplement defect prevention, HIV+ baby protection, and 3 PrEP types.',
      icon: BookOpen,
      image: IMAGES.bloodTypeRh,
      imageAlt: 'Blood type Rh-negative and Rh-positive Anti-D protection guide',
    },
    {
      href: '/labour-prep' as AppRoute,
      title: 'Labour Prep, Hygiene & Hospital Bag',
      desc: 'Exact clothing counts for mom & baby with pictures, intimate shaving/hygiene necessities, 24-hour transport plan, and checklist.',
      icon: Luggage,
      image: IMAGES.laborBabyClothes,
      imageAlt: 'Newborn kimono bodysuits, sleepers, blankets, hats, mittens, and socks',
    },
    {
      href: '/postpartum' as AppRoute,
      title: 'C-Section Types, Episiotomy Steps & Family Planning',
      desc: 'Types of C-section pictures, 4-step episiotomy care images, daily self-care examples, lochia pads, and contraception examples.',
      icon: Baby,
      image: IMAGES.episiotomyCareSteps,
      imageAlt: 'Four-step postpartum episiotomy care guide diagram',
    },
    {
      href: '/health-logs' as AppRoute,
      title: 'Private Health Logs',
      desc: 'Optional personal mood, weight, and clinic notes kept strictly private on your device.',
      icon: Calendar,
      image: IMAGES.supplements,
      imageAlt: 'Daily prenatal vitamins and water glass',
    },
    {
      href: '/emergency' as AppRoute,
      title: 'Emergency Information (10177 / 112)',
      desc: 'Clear warning signs with icons + text labels and urgent South African provincial clinic referral.',
      icon: AlertTriangle,
      image: IMAGES.clinicMidwife,
      imageAlt: 'Midwife ready to assist with urgent South African maternity care',
    },
    {
      href: '/community' as AppRoute,
      title: 'Open Supportive Community',
      desc: 'Share your thoughts, questions, and opinions freely without topic restrictions—safe and peer-supportive.',
      icon: Users,
      image: IMAGES.teenSupport,
      imageAlt: 'Young mothers talking with a counselor in a supportive community circle',
    },
    {
      href: '/advisor' as AppRoute,
      title: 'Fast Streaming AI Advisor',
      desc: 'Instant word-by-word Gemini educational answers with danger-wording emergency protection.',
      icon: Sparkles,
      image: IMAGES.navAiAdvisor,
      imageAlt: 'Expectant mother smiling while reading helpful PregMamas AI guidance on her phone',
    },
    {
      href: '/partners' as AppRoute,
      title: 'Partner Consent & Support',
      desc: 'Practical weekly supporter tips with withdrawable mother consent—never exposes private health logs.',
      icon: HeartHandshake,
      image: IMAGES.hero,
      imageAlt: 'Mother resting peacefully by a sunlit window',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-12">
      {/* Hero Section */}
      <section className="pink-hero-panel p-6 sm:p-10 grid gap-8 lg:grid-cols-12 items-center">
        <div className="lg:col-span-7 space-y-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#9d174d] m-0">
            Supportive Pregnancy & Family Website · South Africa
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-semibold text-[#3f0d24] leading-[1.08] m-0">
            Simple, trusted pregnancy education and support—held together in one place.
          </h1>
          <p className="text-base sm:text-lg text-[#5c223d] max-w-2xl leading-relaxed m-0">
            PregMamas combines LMP stage estimation, self-set daily supplement reminders, specific mom & baby hospital bag checklists, postpartum lochia and scar care, illustrated safe exercises, and judgment-free teen support.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {user ? (
              <button
                type="button"
                onClick={() => onNavigate('/dashboard')}
                className="pink-btn-primary"
              >
                Open My Dashboard
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('/register')}
                  className="pink-btn-primary"
                >
                  Register Free Account
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/login')}
                  className="pink-btn-secondary"
                >
                  Sign In / Role Demo
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => onNavigate('/learn')}
              className="pink-btn-secondary"
            >
              Browse Learning Guides
            </button>
          </div>

          <p className="text-xs text-[#7e405c] flex items-center gap-2 pt-1 m-0">
            <ShieldCheck className="w-4 h-4 text-[#be185d] shrink-0" aria-hidden="true" />
            <span>
              Educational support aligned with SA DoH 2024 maternal guidance · Private health logs stay private.
            </span>
          </p>
        </div>

        <div className="lg:col-span-5 space-y-3">
          <div className="rounded-2xl overflow-hidden border-2 border-[#ea91b8] bg-[#ffe4ef] aspect-[4/3] shadow-sm">
            <img
              src={IMAGES.hero}
              alt="Expectant mother sitting calmly by a sunlit window representing supportive pregnancy preparation"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/learn')}
              className="pink-card px-4 py-3 text-left hover:border-[#db2777] transition-colors cursor-pointer"
            >
              <strong className="block font-display text-lg text-[#be185d] tabular-nums">
                10 Core Topics
              </strong>
              <span className="text-xs text-[#5c223d]">
                Blood Rh, HIV/PrEP, unplanned, teens & birth
              </span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/emergency')}
              className="pink-card px-4 py-3 text-left hover:border-[#be123c] transition-colors cursor-pointer"
            >
              <strong className="block font-display text-lg text-[#be123c] tabular-nums">
                10177 / 112
              </strong>
              <span className="text-xs text-[#5c223d]">
                Instant South African urgent care guide
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Why PregMamas Exists + Live Stage Calculator */}
      <section className="grid gap-6 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7 pink-card p-6 sm:p-8 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#be185d] m-0">
            Why PregMamas Exists
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#3f0d24] m-0">
            Closing everyday information gaps without judgment or jargon
          </h2>
          <p className="text-sm sm:text-base text-[#5c223d] leading-relaxed m-0">
            Expecting mothers and young families deserve clear answers on daily supplements, exact hospital clothes to pack, safe movement, postpartum lochia, and clinic care—written simply and visually.
          </p>

          <div className="grid sm:grid-cols-2 gap-3 pt-1">
            <div className="pink-panel p-4">
              <strong className="block text-sm font-semibold text-[#3f0d24] mb-1">
                Built for Mobile & Low Data
              </strong>
              <p className="text-xs text-[#5c223d] m-0">
                Short explanations, helpful visual photos, and fast-loading pages designed for South African phones.
              </p>
            </div>
            <div className="pink-panel p-4">
              <strong className="block text-sm font-semibold text-[#3f0d24] mb-1">
                Respectful & Non-Judgmental
              </strong>
              <p className="text-xs text-[#5c223d] m-0">
                Dedicated guidance for teenagers and unplanned pregnancies alongside practical clinic visit preparation.
              </p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-[#ea91b8] bg-[#fff7fa] grid sm:grid-cols-12 items-center">
            <img
              src={IMAGES.clinicMidwife}
              alt="South African clinic nurse welcoming an expectant mother with her Road to Health booklet"
              referrerPolicy="no-referrer"
              className="sm:col-span-5 w-full h-40 object-cover"
            />
            <div className="sm:col-span-7 p-4 space-y-1">
              <strong className="block text-sm font-semibold text-[#3f0d24]">
                Antenatal Checkups Made Clear — Arrive Early Every Visit
              </strong>
              <p className="text-xs text-[#5c223d] m-0 leading-relaxed">
                Arrive at least 30 minutes early for every antenatal visit with your Road to Health / antenatal booklet, ID, water, and a snack—and keep your appointment dates, supplement alarms, and questions saved ahead of time.
              </p>
            </div>
          </div>
        </div>

        {/* Pink LMP Calendar & Baby Size Comparison */}
        <div className="lg:col-span-5">
          <PinkLmpCalendar lmpDate={lmpDate} onChangeLmpDate={setLmpDate} compact />
        </div>
      </section>

      {/* Visual Education Library (Pictures across all topics) */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#be185d] m-0">
              Visual Education Library
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#3f0d24] m-0">
              Clear pictures that make pregnancy & postnatal topics easy to understand
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/learn')}
            className="text-sm font-semibold text-[#be185d] hover:underline cursor-pointer"
          >
            Open All 10 Visual Learning Guides →
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <button
            type="button"
            onClick={() => onNavigate('/learn', 'blood-rh-hiv')}
            className="pink-card overflow-hidden flex flex-col hover:border-[#db2777] transition-colors group text-left cursor-pointer"
          >
            <div className="bg-[#ffe4ef] border-b border-[#f4b6d0] aspect-[4/3] overflow-hidden">
              <img
                src={IMAGES.bloodTypeRh}
                alt="Blood type Rh-negative and Rh-positive chart explaining Anti-D shot protection"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain bg-[#fff7fa] p-2"
              />
            </div>
            <div className="p-5 space-y-1.5 flex-1">
              <span className="text-xs font-bold text-[#be185d]">Blood Type, Rh & Defects Prevention</span>
              <h3 className="font-display text-lg font-semibold text-[#3f0d24] m-0 group-hover:text-[#be185d]">
                Why Rh-, Rh+, Folic Acid & Anti-D Prevent Defects
              </h3>
              <p className="text-xs text-[#5c223d] m-0 leading-relaxed">
                See picture examples of neural tube defects, anemia, newborn jaundice, and how daily supplements and Anti-D shots protect baby.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/learn', 'blood-rh-hiv')}
            className="pink-card overflow-hidden flex flex-col hover:border-[#db2777] transition-colors group text-left cursor-pointer"
          >
            <div className="bg-[#ffe4ef] border-b border-[#f4b6d0] aspect-[4/3] overflow-hidden">
              <img
                src={IMAGES.hivPmtctPrep}
                alt="HIV-positive baby protection PMTCT steps and 3 types of PrEP"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain bg-[#fff7fa] p-2"
              />
            </div>
            <div className="p-5 space-y-1.5 flex-1">
              <span className="text-xs font-bold text-[#be185d]">HIV Protection & PrEP</span>
              <h3 className="font-display text-lg font-semibold text-[#3f0d24] m-0 group-hover:text-[#be185d]">
                HIV+ Baby Protection & 3 Types of PrEP Pictures
              </h3>
              <p className="text-xs text-[#5c223d] m-0 leading-relaxed">
                Step-by-step ART viral suppression to keep baby HIV-negative plus pictures of oral PrEP pills, injectable PrEP, and the PrEP ring.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/learn', 'unplanned-support')}
            className="pink-card overflow-hidden flex flex-col hover:border-[#db2777] transition-colors group text-left cursor-pointer"
          >
            <div className="bg-[#ffe4ef] border-b border-[#f4b6d0] aspect-[4/3] overflow-hidden">
              <img
                src={IMAGES.unplannedOptions}
                alt="Unplanned pregnancy visual paths: parenting support, confidential clinic counseling, legal options, and adoption"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain bg-[#fff7fa] p-2"
              />
            </div>
            <div className="p-5 space-y-1.5 flex-1">
              <span className="text-xs font-bold text-[#be185d]">Unplanned Pregnancy Guide</span>
              <h3 className="font-display text-lg font-semibold text-[#3f0d24] m-0 group-hover:text-[#be185d]">
                Picture Decision Paths to Choose Right for You
              </h3>
              <p className="text-xs text-[#5c223d] m-0 leading-relaxed">
                Calm visual guide comparing parenting with support, adoption planning, and free safe legal SA clinic care without judgment.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/postpartum')}
            className="pink-card overflow-hidden flex flex-col hover:border-[#db2777] transition-colors group text-left cursor-pointer"
          >
            <div className="bg-[#ffe4ef] border-b border-[#f4b6d0] aspect-[4/3] overflow-hidden">
              <img
                src={IMAGES.cSectionTypes}
                alt="Diagram of C-section types: Low Transverse, Low Vertical, and Classical Vertical"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain bg-[#fff7fa] p-2"
              />
            </div>
            <div className="p-5 space-y-1.5 flex-1">
              <span className="text-xs font-bold text-[#be185d]">Postpartum Recovery</span>
              <h3 className="font-display text-lg font-semibold text-[#3f0d24] m-0 group-hover:text-[#be185d]">
                Types of C-Section, Episiotomy Care & Self-Care
              </h3>
              <p className="text-xs text-[#5c223d] m-0 leading-relaxed">
                Illustrated C-section incisions, Mediolateral vs Midline episiotomy, 4-step healing care, lochia pads, and daily self-care examples.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/learn', 'contraception')}
            className="pink-card overflow-hidden flex flex-col hover:border-[#db2777] transition-colors group text-left cursor-pointer"
          >
            <div className="bg-[#ffe4ef] border-b border-[#f4b6d0] aspect-[4/3] overflow-hidden grid grid-cols-2 grid-rows-2 gap-0.5">
              <img
                src={IMAGES.contraceptivePills}
                alt="28-day oral contraceptive pills"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <img
                src={IMAGES.contraceptiveInjection}
                alt="Clinic contraceptive injection vial and syringe"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <img
                src={IMAGES.contraceptiveImplant}
                alt="Subdermal arm implant rod"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <img
                src={IMAGES.contraceptiveIud}
                alt="T-shaped copper IUD"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5 space-y-1.5 flex-1">
              <span className="text-xs font-bold text-[#be185d]">Family Planning Pictures</span>
              <h3 className="font-display text-lg font-semibold text-[#3f0d24] m-0 group-hover:text-[#be185d]">
                Different Contraceptive Pictures & Options
              </h3>
              <p className="text-xs text-[#5c223d] m-0 leading-relaxed">
                Separate clear photos of pills, 2–3 month injections, arm implants, copper/hormonal IUDs, and male & female condoms.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/labour-prep')}
            className="pink-card overflow-hidden flex flex-col hover:border-[#db2777] transition-colors group text-left cursor-pointer"
          >
            <div className="bg-[#ffe4ef] border-b border-[#f4b6d0] aspect-[4/3] overflow-hidden">
              <img
                src={IMAGES.laborBabyClothes}
                alt="Exact newborn hospital clothes laid out: kimono bodysuits, sleepers, blankets, hats, mittens, socks"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5 space-y-1.5 flex-1">
              <span className="text-xs font-bold text-[#be185d]">Labour Preparation</span>
              <h3 className="font-display text-lg font-semibold text-[#3f0d24] m-0 group-hover:text-[#be185d]">
                Exact Hospital Bag Clothes & Counts for Mom & Baby
              </h3>
              <p className="text-xs text-[#5c223d] m-0 leading-relaxed">
                See exact counts (3 nightgowns, 5–6 kimono bodysuits, 3–4 sleepers, 24 nappies) with pictures and interactive packing checklists.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/learn', 'baby-positions')}
            className="pink-card overflow-hidden flex flex-col hover:border-[#db2777] transition-colors group text-left cursor-pointer"
          >
            <div className="bg-[#ffe4ef] border-b border-[#f4b6d0] aspect-[4/3] overflow-hidden">
              <img
                src={IMAGES.babyPositions}
                alt="Illustrated chart showing baby positions inside the womb: cephalic, breech, transverse, and posterior"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain bg-[#fff7fa] p-2"
              />
            </div>
            <div className="p-5 space-y-1.5 flex-1">
              <span className="text-xs font-bold text-[#be185d]">Baby Positions Guide</span>
              <h3 className="font-display text-lg font-semibold text-[#3f0d24] m-0 group-hover:text-[#be185d]">
                Cephalic, Breech, Transverse & Posterior Explained
              </h3>
              <p className="text-xs text-[#5c223d] m-0 leading-relaxed">
                See what common baby positions look like before labour—with clear reminders that only a midwife or doctor confirms position.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/learn', 'exercises')}
            className="pink-card overflow-hidden flex flex-col hover:border-[#db2777] transition-colors group text-left cursor-pointer"
          >
            <div className="bg-[#ffe4ef] border-b border-[#f4b6d0] aspect-[4/3] overflow-hidden">
              <img
                src={IMAGES.exerciseCatCow}
                alt="Pregnant mother practicing safe prenatal cat-cow stretch on a cork yoga mat"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5 space-y-1.5 flex-1">
              <span className="text-xs font-bold text-[#be185d]">Safe Exercises</span>
              <h3 className="font-display text-lg font-semibold text-[#3f0d24] m-0 group-hover:text-[#be185d]">
                Illustrated Trimester & Postpartum Movement
              </h3>
              <p className="text-xs text-[#5c223d] m-0 leading-relaxed">
                Photo examples and guided set timers for Cat-Cow stretches, supported squats, pelvic tilts, and postpartum breathing.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/learn', 'teen-support')}
            className="pink-card overflow-hidden flex flex-col hover:border-[#db2777] transition-colors group text-left cursor-pointer"
          >
            <div className="bg-[#ffe4ef] border-b border-[#f4b6d0] aspect-[4/3] overflow-hidden">
              <img
                src={IMAGES.teenSupport}
                alt="Smiling teen mother talking with a counselor and peer young mom in a bright resource room"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5 space-y-1.5 flex-1">
              <span className="text-xs font-bold text-[#be185d]">Teen Support</span>
              <h3 className="font-display text-lg font-semibold text-[#3f0d24] m-0 group-hover:text-[#be185d]">
                Real Examples, School Rights & Scripts
              </h3>
              <p className="text-xs text-[#5c223d] m-0 leading-relaxed">
                Specific teen mom examples, school accommodation scripts, youth-friendly clinic rights, and toll-free helplines.
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* Emergency Warning Signs Banner */}
      <section className="rounded-2xl bg-[#ffe0e9] border-2 border-[#e11d48] p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-start gap-4 max-w-2xl">
          <div className="w-11 h-11 rounded-xl bg-[#be123c] text-white grid place-items-center shrink-0">
            <AlertTriangle className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h2 className="font-display text-xl font-semibold text-[#881337] m-0">
              Experiencing warning signs right now? Do not wait for an AI or website reply.
            </h2>
            <p className="text-sm text-[#5c223d] m-0">
              Heavy bleeding, severe headache, blurred vision, sudden face/hand swelling, high fever, waters breaking early, or reduced baby movements need immediate clinic or hospital care.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <a href="tel:10177" className="pink-btn-urgent tabular-nums">
            <PhoneCall className="w-4 h-4" aria-hidden="true" />
            <span>Ambulance 10177</span>
          </a>
          <a href="tel:112" className="pink-btn-urgent tabular-nums">
            <PhoneCall className="w-4 h-4" aria-hidden="true" />
            <span>Emergency 112</span>
          </a>
          <button
            type="button"
            onClick={() => onNavigate('/emergency')}
            className="pink-btn-secondary"
          >
            View All Danger Signs
          </button>
        </div>
      </section>

      {/* How PregMamas Works (7 Steps) */}
      <section className="space-y-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#be185d] m-0">
            How PregMamas Works
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#3f0d24] m-0">
            Seven simple steps from registration to verified guidance
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS_STEPS.map((item) => (
            <div key={item.step} className="pink-card p-5 flex flex-col gap-2">
              <span className="text-xs font-bold text-[#be185d] tabular-nums">{item.step}</span>
              <h3 className="font-display text-lg font-semibold text-[#3f0d24] m-0">{item.title}</h3>
              <p className="text-xs sm:text-sm text-[#5c223d] m-0 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Explore Every Section */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#be185d] m-0">
              Explore Every Section
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#3f0d24] m-0">
              Everything inside PregMamas
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/privacy')}
            className="text-sm font-semibold text-[#be185d] hover:underline cursor-pointer"
          >
            Read Safety, Privacy & Consent Rules →
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exploreCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.href}
                type="button"
                onClick={() => onNavigate(card.href)}
                className="pink-card overflow-hidden flex flex-col hover:bg-[#ffe4ef] hover:border-[#db2777] transition-colors group text-left cursor-pointer"
              >
                {card.image && (
                  <div className="aspect-[16/9] w-full border-b border-[#f4b6d0] bg-[#fff7fa] overflow-hidden">
                    <img
                      src={card.image}
                      alt={card.imageAlt || card.title}
                      referrerPolicy="no-referrer"
                      className={`w-full h-full ${
                        card.image === IMAGES.babyPositions ||
                        card.image === IMAGES.bloodTypeRh ||
                        card.image === IMAGES.episiotomyCareSteps
                          ? 'object-contain p-1.5'
                          : 'object-cover'
                      }`}
                    />
                  </div>
                )}
                <div className="p-5 flex items-start gap-3.5">
                  <span className="w-10 h-10 rounded-xl bg-[#ffd6e7] border border-[#ea91b8] text-[#9d174d] grid place-items-center shrink-0">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <span className="space-y-1 min-w-0">
                    <strong className="block font-display text-base font-semibold text-[#3f0d24] group-hover:text-[#be185d]">
                      {card.title}
                    </strong>
                    <span className="block text-xs text-[#5c223d] leading-relaxed">{card.desc}</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
