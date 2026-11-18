import { useMemo } from 'react';
import { AlertTriangle, BookOpen, Calendar, WifiOff } from 'lucide-react';
import { AppRoute } from '../data/pregmamasData';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useTranslatedTexts } from '../context/LanguageContext';

interface OfflineBannerProps {
  onNavigate: (path: AppRoute, topic?: string) => void;
}

const OFFLINE_BANNER_TEXTS = [
  'You are offline, but you can still read Danger Signs and Nutrition',
  'Danger Signs',
  'Nutrition',
  'Week-by-Week',
];

export function OfflineBanner({ onNavigate }: OfflineBannerProps) {
  const isOnline = useOnlineStatus();
  const stableTexts = useMemo(() => OFFLINE_BANNER_TEXTS, []);
  const { translated } = useTranslatedTexts(stableTexts);

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-[#9d174d] text-white border-b-2 border-[#EC4899] px-4 py-3 shadow-sm"
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
          <WifiOff className="w-4 h-4 text-[#fbcfe8] shrink-0" aria-hidden="true" />
          <span>{translated[0] || OFFLINE_BANNER_TEXTS[0]}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('/emergency')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white text-[#9d174d] px-2.5 py-1 text-xs font-bold hover:bg-[#ffe4ef] cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#be123c]" aria-hidden="true" />
            <span>{translated[1] || 'Danger Signs'}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/learn', 'general')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#EC4899] text-white px-2.5 py-1 text-xs font-bold hover:bg-[#be185d] cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{translated[2] || 'Nutrition'}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/dashboard')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#fbcfe8]/50 text-white px-2.5 py-1 text-xs font-semibold hover:bg-white/10 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{translated[3] || 'Week-by-Week'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
