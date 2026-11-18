import { useMemo, useState } from 'react';
import { Download, Share, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useTranslatedTexts } from '../context/LanguageContext';

interface PWAInstallButtonProps {
  variant?: 'hero' | 'compact';
  className?: string;
}

const INSTALL_BUTTON_TEXTS = [
  'Install App',
  'Install PregMamas App',
  'Save on your phone to read Danger Signs, Nutrition & Week-by-Week offline',
  'Got It',
];

export function PWAInstallButton({
  variant = 'hero',
  className = '',
}: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const stableTexts = useMemo(() => INSTALL_BUTTON_TEXTS, []);
  const { translated } = useTranslatedTexts(stableTexts);
  const installLabel = translated[0] || 'Install App';
  const modalTitle = translated[1] || 'Install PregMamas App';
  const modalSub =
    translated[2] ||
    'Save on your phone to read Danger Signs, Nutrition & Week-by-Week offline';
  const gotItLabel = translated[3] || 'Got It';

  // Suppress button when already running in standalone installed PWA mode
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) return;
    }
    setShowGuideModal(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={
          variant === 'compact'
            ? `inline-flex items-center gap-1.5 rounded-lg bg-[#EC4899] hover:bg-[#be185d] text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors cursor-pointer shrink-0 ${className}`
            : `inline-flex items-center justify-center gap-2 rounded-xl bg-[#EC4899] hover:bg-[#be185d] text-white font-semibold px-5 py-3 text-sm shadow-sm transition-colors cursor-pointer ${className}`
        }
      >
        <Download className={variant === 'compact' ? 'w-3.5 h-3.5' : 'w-4 h-4'} aria-hidden="true" />
        <span>{installLabel}</span>
      </button>

      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-guide-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-[#fff7fa] border-2 border-[#ea91b8] p-6 shadow-xl space-y-4 text-[#3f0d24]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-xl bg-[#EC4899] text-white grid place-items-center shrink-0">
                  <Smartphone className="w-5 h-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 id="install-guide-title" className="font-display text-lg font-semibold m-0">
                    {modalTitle}
                  </h3>
                  <p className="text-xs text-[#7e405c] m-0">{modalSub}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                aria-label="Close install instructions"
                className="w-8 h-8 rounded-lg border border-[#f4b6d0] bg-white text-[#7e1343] grid place-items-center hover:bg-[#ffe4ef] cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="rounded-xl bg-white border border-[#f4b6d0] p-4 space-y-2.5 text-sm text-[#5c223d]">
                <p className="font-semibold text-[#3f0d24] m-0 flex items-center gap-2">
                  <Share className="w-4 h-4 text-[#EC4899]" aria-hidden="true" />
                  <span>Install on iPhone / iPad (Safari):</span>
                </p>
                <ol className="list-decimal pl-5 space-y-1.5 m-0 text-xs sm:text-sm">
                  <li>
                    Open this page in <strong>Safari</strong> on your iPhone.
                  </li>
                  <li>
                    Tap the <strong>Share</strong> button (square with arrow pointing up) at the bottom of Safari.
                  </li>
                  <li>
                    Scroll down and tap <strong>Add to Home Screen</strong>.
                  </li>
                  <li>
                    Tap <strong>Add</strong> in the top corner to install PregMamas.
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl bg-white border border-[#f4b6d0] p-4 space-y-1.5 text-xs sm:text-sm text-[#5c223d]">
                  <p className="font-semibold text-[#3f0d24] m-0">On Android (Chrome):</p>
                  <ol className="list-decimal pl-5 space-y-1 m-0">
                    <li>
                      Tap the <strong>⋮</strong> menu in the top-right corner of Chrome.
                    </li>
                    <li>
                      Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                    </li>
                    <li>
                      Tap <strong>Install</strong> to save PregMamas on your phone.
                    </li>
                  </ol>
                </div>
                <div className="rounded-xl bg-white border border-[#f4b6d0] p-4 space-y-1.5 text-xs sm:text-sm text-[#5c223d]">
                  <p className="font-semibold text-[#3f0d24] m-0">On iPhone / iPad (Safari):</p>
                  <ol className="list-decimal pl-5 space-y-1 m-0">
                    <li>
                      Tap the <strong>Share</strong> button in Safari&apos;s toolbar.
                    </li>
                    <li>
                      Scroll down and tap <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.
                    </li>
                  </ol>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="pink-btn-primary w-full text-sm"
            >
              {gotItLabel}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
