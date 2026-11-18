import { useEffect, useMemo, useState } from 'react';
import { Check, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { BagItem, HOSPITAL_BAG_ITEMS, IMAGES } from '../data/pregmamasData';
import { useTranslatedTexts } from '../context/LanguageContext';
import { SafeImage } from './SafeImage';

const PACKED_KEY = 'pregmamas_hospital_bag_packed_v1';
const CUSTOM_ITEMS_KEY = 'pregmamas_custom_bag_items_v1';
const TRANSPORT_KEY = 'pregmamas_transport_plan_v1';

type BagFilter = 'all' | 'mom' | 'baby' | 'unpacked';

const BAG_STATIC_TEXTS = [
  '02. Labour Preparation, Transport Plan & Exact Hospital Bag',
  'What to Pack in Your Hospital Bag—Exact Clothes, Hygiene & Counts for Mom & Baby',
  'Have your bags ready by week 36 for a typical 2-to-3-day maternity stay (or 3–4 days after a C-section). Prepare both your exact clothes counts and personal intimate hygiene necessities ahead of labour.',
  'Facility, Birth Companion & 24-Hour Transport Plan',
  'Plan ahead so when contractions start or your water breaks, you and your family know exactly where to go.',
  'For Mom: Exact Clothing & Care Count',
  'For Baby: Exact Clothing & Discharge Count',
  'Intimate Hygiene Before Labour: Shave Neatly, Stay Clean & Pack Necessities',
  'Interactive Hospital-Bag Checklist',
  'All Items',
  "Mom's Bag",
  "Baby's Bag",
  'Remaining',
  'Uncheck All',
  'Add Item',
];

export function LaborBagSection() {
  const [packedIds, setPackedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(PACKED_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [customItems, setCustomItems] = useState<BagItem[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_ITEMS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [transportPlan, setTransportPlan] = useState(() => {
    try {
      const saved = localStorage.getItem(TRANSPORT_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return { facility: '', companion: '', phone: '', transport: '' };
  });

  const [filter, setFilter] = useState<BagFilter>('all');
  const [customName, setCustomName] = useState('');
  const [customWho, setCustomWho] = useState<'mom' | 'baby'>('mom');
  const [customQty, setCustomQty] = useState('1');

  useEffect(() => {
    localStorage.setItem(PACKED_KEY, JSON.stringify(packedIds));
  }, [packedIds]);

  useEffect(() => {
    localStorage.setItem(CUSTOM_ITEMS_KEY, JSON.stringify(customItems));
  }, [customItems]);

  useEffect(() => {
    localStorage.setItem(TRANSPORT_KEY, JSON.stringify(transportPlan));
  }, [transportPlan]);

  const allItems = useMemo(() => [...HOSPITAL_BAG_ITEMS, ...customItems], [customItems]);

  const textsToTranslate = useMemo(
    () => [
      ...BAG_STATIC_TEXTS,
      ...HOSPITAL_BAG_ITEMS.flatMap((i) => [i.name, i.category, i.whyNeeded]),
    ],
    []
  );
  const { translated } = useTranslatedTexts(textsToTranslate);
  const itemsOffset = BAG_STATIC_TEXTS.length;

  const toggleItem = (id: string) => {
    setPackedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const addCustomBagItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const newItem: BagItem = {
      id: `custom-bag-${Date.now()}`,
      who: customWho,
      category: customWho === 'mom' ? 'Mother Care' : 'Baby Care',
      name: customName.trim(),
      exactQty: customQty.trim() || '1 item',
      whyNeeded: 'Added to your personal PregMamas hospital checklist.',
    };
    setCustomItems((prev) => [...prev, newItem]);
    setCustomName('');
    setCustomQty('1');
  };

  const removeCustomItem = (id: string) => {
    setCustomItems((prev) => prev.filter((i) => i.id !== id));
    setPackedIds((prev) => prev.filter((p) => p !== id));
  };

  const momItems = useMemo(() => allItems.filter((i) => i.who === 'mom'), [allItems]);
  const babyItems = useMemo(() => allItems.filter((i) => i.who === 'baby'), [allItems]);

  const momPackedCount = useMemo(
    () => momItems.filter((i) => packedIds.includes(i.id)).length,
    [momItems, packedIds]
  );
  const babyPackedCount = useMemo(
    () => babyItems.filter((i) => packedIds.includes(i.id)).length,
    [babyItems, packedIds]
  );

  const visibleItems = useMemo(() => {
    return allItems.filter((item) => {
      if (filter === 'mom') return item.who === 'mom';
      if (filter === 'baby') return item.who === 'baby';
      if (filter === 'unpacked') return !packedIds.includes(item.id);
      return true;
    });
  }, [allItems, filter, packedIds]);

  const totalCount = allItems.length;
  const packedCount = packedIds.filter((id) => allItems.some((item) => item.id === id)).length;
  const progressPct = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  return (
    <section id="labour-bag" className="border-t border-[#f4b6d0] bg-white py-14 lg:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-medium tracking-wide text-[#be185d]">
            {translated[0] || BAG_STATIC_TEXTS[0]}
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#3f0d24] sm:text-4xl">
            {translated[1] || BAG_STATIC_TEXTS[1]}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#5c223d]">
            {translated[2] || BAG_STATIC_TEXTS[2]}
          </p>
        </div>

        {/* Facility, Birth Companion & 24-Hour Transport Plan (from MamaCare SA) */}
        <div className="mt-8 rounded-2xl border border-[#f4b6d0] bg-[#fff7fa] p-6">
          <h3 className="text-lg font-semibold text-[#3f0d24]">
            {translated[3] || BAG_STATIC_TEXTS[3]}
          </h3>
          <p className="mt-1 text-xs text-[#5c223d]">
            {translated[4] || BAG_STATIC_TEXTS[4]}
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              type="text"
              value={transportPlan.facility}
              onChange={(e) => setTransportPlan({ ...transportPlan, facility: e.target.value })}
              placeholder="Preferred Clinic / MOU / Hospital"
              className="rounded-lg border border-[#f4b6d0] bg-white px-3 py-2 text-sm text-[#3f0d24] placeholder:text-[#a66a85] focus:border-[#be185d] focus:outline-none"
            />
            <input
              type="text"
              value={transportPlan.companion}
              onChange={(e) => setTransportPlan({ ...transportPlan, companion: e.target.value })}
              placeholder="Birth Companion / Support Person"
              className="rounded-lg border border-[#f4b6d0] bg-white px-3 py-2 text-sm text-[#3f0d24] placeholder:text-[#a66a85] focus:border-[#be185d] focus:outline-none"
            />
            <input
              type="tel"
              value={transportPlan.phone}
              onChange={(e) => setTransportPlan({ ...transportPlan, phone: e.target.value })}
              placeholder="Emergency Contact Phone"
              className="rounded-lg border border-[#f4b6d0] bg-white px-3 py-2 font-mono text-sm text-[#3f0d24] placeholder:text-[#a66a85] focus:border-[#be185d] focus:outline-none"
            />
            <input
              type="text"
              value={transportPlan.transport}
              onChange={(e) => setTransportPlan({ ...transportPlan, transport: e.target.value })}
              placeholder="24-Hour Transport & Backup Plan"
              className="rounded-lg border border-[#f4b6d0] bg-white px-3 py-2 text-sm text-[#3f0d24] placeholder:text-[#a66a85] focus:border-[#be185d] focus:outline-none"
            />
          </div>
        </div>

        {/* Side-by-Side Visual Packing Breakdown */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#f4b6d0] bg-[#fff7fa] p-5 sm:p-6">
            <SafeImage
              src={IMAGES.laborMomBag}
              alt="Neatly packed maternal hospital bag showing 3 folded button-down cotton nightgowns, high-waisted underwear, grip socks, shower sandals, peri bottle, lip balm, and long charging cable"
              aspectClass="aspect-[4/3]"
            />
            <div className="mt-5">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-xl font-semibold text-[#3f0d24]">
                  {translated[5] || BAG_STATIC_TEXTS[5]}
                </h3>
                <span className="font-mono text-xs text-[#be185d] tabular-nums">
                  {momPackedCount} / {momItems.length} packed
                </span>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-[#5c223d]">
                <li>
                  <strong className="text-[#3f0d24]">3 Front-Opening Cotton Nightgowns:</strong> Button or wrap fronts make skin-to-skin and breastfeeding effortless.
                </li>
                <li>
                  <strong className="text-[#3f0d24]">2 Loose Going-Home Outfits:</strong> Soft maternity dress or high-rise joggers plus a loose nursing top.
                </li>
                <li>
                  <strong className="text-[#3f0d24]">4–5 Pairs High-Waisted Cotton Underwear:</strong> Sits comfortably above a C-section scar without rolling.
                </li>
                <li>
                  <strong className="text-[#3f0d24]">3 Wire-Free Nursing Bras · 2 Grip Socks · 1 Robe · 1 Shower Sandals · 2 Packs Maternity Pads</strong>
                </li>
                <li>
                  <strong className="text-[#3f0d24]">Hygiene Necessities Pouch:</strong> Mild unscented soap, clean safety razor/trimmer, 2 cotton washcloths, bath towel, peri rinse bottle, unscented wipes, deodorant & toothbrush/paste.
                </li>
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-[#f4b6d0] bg-[#fff7fa] p-5 sm:p-6">
            <SafeImage
              src={IMAGES.laborBabyClothes}
              alt="Newborn hospital clothes arranged neatly: 5 side-snap kimono cotton bodysuits, 3 zip-up footed sleepers, 2 muslin swaddle blankets, 2 tiny knit hats, mittens, and socks"
              aspectClass="aspect-[4/3]"
            />
            <div className="mt-5">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-xl font-semibold text-[#3f0d24]">
                  {translated[6] || BAG_STATIC_TEXTS[6]}
                </h3>
                <span className="font-mono text-xs text-[#be185d] tabular-nums">
                  {babyPackedCount} / {babyItems.length} packed
                </span>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-[#5c223d]">
                <li>
                  <strong className="text-[#3f0d24]">5–6 Side-Snap Kimono Bodysuits:</strong> Pack 3 Newborn + 3 size 0–3M so nothing pulls over baby’s head or cord stump.
                </li>
                <li>
                  <strong className="text-[#3f0d24]">3–4 Two-Way Zip Footed Sleepers:</strong> Opens from the ankle up for quick midnight diaper changes.
                </li>
                <li>
                  <strong className="text-[#3f0d24]">2–3 Cotton Muslin Swaddles + 1 Going-Home Romper</strong>
                </li>
                <li>
                  <strong className="text-[#3f0d24]">2 Knit Hats · 2 Pairs Scratch Mittens · 3 Pairs Socks · 24 Diapers · Rear-Facing Car Seat</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Intimate Hygiene, Safe Shaving/Trimming & Cleanliness Necessities */}
        <div className="mt-8 rounded-2xl border border-[#ea91b8] bg-[#fff7fa] p-6 sm:p-7">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <SafeImage
                src={IMAGES.laborHygieneKit}
                alt="Labour hygiene necessities kit on blush linen: mild fragrance-free soap, clean pastel razor/trimmer, soft washcloths, angled peri rinse bottle, unscented wipes, deodorant, toothbrush and toothpaste, and extra-heavy maternity pads"
                caption="Labour Hygiene Necessities — Clean razor/trimmer, mild unscented soap, washcloths, peri rinse bottle, wipes & maternity pads."
                aspectClass="aspect-[4/3]"
              />
            </div>

            <div className="lg:col-span-7 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#be185d]">
                  Labour Preparation · Hygiene & Comfort
                </p>
                <h3 className="mt-1 text-2xl font-semibold text-[#3f0d24]">
                  {translated[7] || BAG_STATIC_TEXTS[7]}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5c223d]">
                  Preparing cleanly helps prevent infection, keeps examinations and stitches comfortable, and helps you feel fresh before and after delivery.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-[#f4b6d0] bg-white p-4 space-y-2">
                  <h4 className="font-sans text-sm font-bold text-[#3f0d24]">
                    1. Shave Safely & Keep Clean Down There
                  </h4>
                  <ul className="space-y-1.5 text-xs leading-relaxed text-[#5c223d]">
                    <li>
                      <strong className="text-[#3f0d24]">Shave or trim neatly ahead of time:</strong> Gently shave or trim pubic hair a couple of days before your due date using a brand-new clean razor or safety trimmer (avoid razor cuts right before birth—or ask your nurse to trim safely if you cannot see or reach comfortably).
                    </li>
                    <li>
                      <strong className="text-[#3f0d24]">Wash gently every day:</strong> Clean outer intimate skin with warm water and mild unscented soap only, rinse well, pat dry with a clean towel, and always wipe front-to-back.
                    </li>
                    <li>
                      <strong className="text-[#3f0d24]">Keep breathable & fresh:</strong> Wear clean 100% cotton underwear daily and never use scented sprays or internal douching.
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-[#f4b6d0] bg-white p-4 space-y-2">
                  <h4 className="font-sans text-sm font-bold text-[#3f0d24]">
                    2. Exact Hygiene Necessities to Pack
                  </h4>
                  <ul className="space-y-1.5 text-xs leading-relaxed text-[#5c223d]">
                    <li>
                      <strong className="text-[#3f0d24]">Clean grooming & wash kit:</strong> Mild fragrance-free bar or liquid soap, clean personal safety razor/trimmer, 2 soft cotton washcloths & 1 dark bath towel.
                    </li>
                    <li>
                      <strong className="text-[#3f0d24]">Perineal & lochia care:</strong> 1 angled peri rinse bottle (filled with lukewarm water), 2 packs extra-heavy maternity pads & 2 packs unscented water wipes.
                    </li>
                    <li>
                      <strong className="text-[#3f0d24]">Daily personal care:</strong> Toothbrush, toothpaste, mild roll-on deodorant, toilet tissues, lip balm & clean hair ties.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Packing Checklist */}
        <div className="mt-10 rounded-2xl border border-[#f4b6d0] bg-[#fff7fa] p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-4 border-b border-[#ffd6e7] pb-5 lg:flex-row lg:items-center">
            <div>
              <div className="flex items-center gap-3 text-xs text-[#5c223d]">
                <span className="font-mono font-medium text-[#3f0d24] tabular-nums">
                  {packedCount} of {totalCount} items packed ({progressPct}%)
                </span>
                <span aria-hidden="true">·</span>
                <span>Saved automatically on this device</span>
              </div>
              <h3 className="mt-1.5 text-xl font-semibold text-[#3f0d24]">
                {translated[8] || BAG_STATIC_TEXTS[8]}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg bg-[#ffe4ef] p-1">
                {(
                  [
                    { key: 'all', label: translated[9] || 'All Items' },
                    { key: 'mom', label: translated[10] || "Mom's Bag" },
                    { key: 'baby', label: translated[11] || "Baby's Bag" },
                    { key: 'unpacked', label: translated[12] || 'Remaining' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setFilter(tab.key)}
                    className={`min-h-[34px] rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      filter === tab.key
                        ? 'bg-white text-[#3f0d24] shadow-sm'
                        : 'text-[#5c223d] hover:text-[#3f0d24]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setPackedIds([])}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#f4b6d0] bg-white px-3 py-1.5 text-xs font-medium text-[#5c223d] transition-colors hover:text-[#3f0d24] whitespace-nowrap shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                {translated[13] || 'Uncheck All'}
              </button>
            </div>
          </div>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#ffe4ef]">
            <div
              className="h-full bg-[#be185d] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Add Custom Bag Item */}
          <form onSubmit={addCustomBagItem} className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Add your own hospital bag item (e.g., Maternity Case Record, warm shawl)..."
              className="flex-1 rounded-lg border border-[#f4b6d0] bg-white px-3 py-2 text-sm text-[#3f0d24] placeholder:text-[#a66a85] focus:border-[#be185d] focus:outline-none"
            />
            <select
              value={customWho}
              onChange={(e) => setCustomWho(e.target.value as 'mom' | 'baby')}
              aria-label="Bag owner"
              className="rounded-lg border border-[#f4b6d0] bg-white px-3 py-2 text-sm text-[#3f0d24] focus:border-[#be185d] focus:outline-none"
            >
              <option value="mom">Mom's Bag</option>
              <option value="baby">Baby's Bag</option>
            </select>
            <input
              type="text"
              value={customQty}
              onChange={(e) => setCustomQty(e.target.value)}
              placeholder="Qty"
              aria-label="Quantity"
              className="w-full rounded-lg border border-[#f4b6d0] bg-white px-3 py-2 font-mono text-sm text-[#3f0d24] sm:w-28 focus:border-[#be185d] focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg bg-[#be185d] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#9d174d] whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {translated[14] || 'Add Item'}
            </button>
          </form>

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            {visibleItems.length === 0 ? (
              <div className="col-span-full rounded-xl border border-dashed border-[#f4b6d0] bg-white p-8 text-center">
                <p className="text-sm font-medium text-[#3f0d24]">
                  Everything in this filter is packed and ready.
                </p>
              </div>
            ) : (
              visibleItems.map((item) => {
                const isPacked = packedIds.includes(item.id);
                const isCustom = item.id.startsWith('custom-bag-');
                const staticIdx = HOSPITAL_BAG_ITEMS.findIndex((b) => b.id === item.id);
                const itemName =
                  staticIdx >= 0 ? translated[itemsOffset + staticIdx * 3] || item.name : item.name;
                const itemCat =
                  staticIdx >= 0
                    ? translated[itemsOffset + staticIdx * 3 + 1] || item.category
                    : item.category;
                const itemWhy =
                  staticIdx >= 0
                    ? translated[itemsOffset + staticIdx * 3 + 2] || item.whyNeeded
                    : item.whyNeeded;
                return (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                      isPacked
                        ? 'border-[#ea91b8] bg-[#fff0f6]'
                        : 'border-[#ffd6e7] bg-white hover:border-[#be185d]/50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      className="flex flex-1 items-start gap-3.5 text-left"
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                          isPacked
                            ? 'border-[#be185d] bg-[#be185d] text-white'
                            : 'border-[#ea91b8] bg-white text-transparent'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span
                            className={`text-sm font-semibold ${
                              isPacked ? 'text-[#7e405c] line-through' : 'text-[#3f0d24]'
                            }`}
                          >
                            {itemName}
                          </span>
                          <span className="font-mono text-xs font-medium text-[#be185d] tabular-nums">
                            {item.exactQty}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-[#5c223d]">
                          <span className="font-medium text-[#3f0d24]">
                            {item.who === 'mom' ? 'Mom' : 'Baby'} · {itemCat}:
                          </span>{' '}
                          {itemWhy}
                        </p>
                      </div>
                    </button>
                    {isCustom && (
                      <button
                        type="button"
                        onClick={() => removeCustomItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="mt-0.5 text-[#7e405c] hover:text-[#be123c]"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
