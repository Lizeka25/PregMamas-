import { ReactNode, useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, Globe, Heart, LogOut, Menu, X } from 'lucide-react';
import { AccountRole, AppRoute, DemoUser } from '../data/pregmamasData';
import { SaLanguageCode, TranslationKey } from '../data/saLanguages';
import { useLanguage, useTranslatedTexts } from '../context/LanguageContext';
import { NotificationBar, useAppNotifications } from './NotificationBar';
import { OfflineBanner } from './OfflineBanner';
import { PWAInstallButton } from './PWAInstallButton';

interface SiteLayoutProps {
  currentPath: AppRoute;
  onNavigate: (path: AppRoute, topic?: string) => void;
  user: DemoUser | null;
  onLogout: () => void;
  children: ReactNode;
}

const PRIMARY_NAV: Array<{ href: AppRoute; key: TranslationKey }> = [
  { href: '/', key: 'nav.home' },
  { href: '/dashboard', key: 'nav.dashboard' },
  { href: '/learn', key: 'nav.learn' },
  { href: '/emergency', key: 'nav.emergency' },
  { href: '/advisor', key: 'nav.advisor' },
];

const MORE_CARE_NAV: Array<{ href: AppRoute; key: TranslationKey }> = [
  { href: '/community', key: 'nav.community' },
  { href: '/kicks', key: 'nav.kicks' },
  { href: '/labour-prep', key: 'nav.labourPrep' },
  { href: '/postpartum', key: 'nav.postpartum' },
  { href: '/health-logs', key: 'nav.healthLogs' },
  { href: '/partners', key: 'nav.partners' },
];

const CLINIC_POLICY_NAV: Array<{ href: AppRoute; key: TranslationKey }> = [
  { href: '/professional', key: 'nav.professional' },
  { href: '/admin', key: 'nav.admin' },
  { href: '/privacy', key: 'nav.privacy' },
];

function roleTag(role: AccountRole): string {
  if (role === 'professional') return ' · Staff';
  if (role === 'admin') return ' · Admin';
  if (role === 'partner') return ' · Partner';
  return '';
}

export function SiteLayout({
  currentPath,
  onNavigate,
  user,
  onLogout,
  children,
}: SiteLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const { unreadNotifications, unreadCount, dismissNotification, markAllRead } =
    useAppNotifications();
  const { language, setLanguage, supportedLanguages, t } = useLanguage();
  const navLabels = useTranslatedTexts([
    'Care & Tools',
    'Maternal Tools & Support',
    'Staff & Privacy',
    'Main Pages',
    'Care Tools, Staff & Privacy',
  ]).translated;

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMoreOpen(false);
        setNotifOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const go = (path: AppRoute, topic?: string) => {
    setMobileMenuOpen(false);
    setMoreOpen(false);
    onNavigate(path, topic);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isMoreActive = [...MORE_CARE_NAV, ...CLINIC_POLICY_NAV].some(
    (item) => item.href === currentPath
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#fff0f6] text-[#3f0d24]">
      {/* Single-Row Sticky Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#ffeef5]/95 backdrop-blur-md border-b border-[#f4b6d0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Wordmark */}
          <button
            type="button"
            onClick={() => go('/')}
            className="inline-flex items-center gap-2 text-[#3f0d24] font-display text-lg sm:text-xl font-semibold whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span className="w-8 h-8 rounded-lg bg-[#be185d] text-white grid place-items-center shrink-0">
              <Heart className="w-4 h-4 fill-current" aria-hidden="true" />
            </span>
            <span>PregMamas</span>
          </button>

          {/* Primary Single-Line Links + Organized Tools Popover */}
          <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-4 xl:gap-5">
            {PRIMARY_NAV.map((item) => {
              const active = currentPath === item.href;
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => go(item.href)}
                  className={`text-sm font-medium whitespace-nowrap shrink-0 py-1.5 border-b-2 transition-colors cursor-pointer ${
                    active
                      ? 'border-[#be185d] text-[#9d174d] font-semibold'
                      : 'border-transparent text-[#5c223d] hover:text-[#be185d]'
                  }`}
                >
                  {t(item.key)}
                </button>
              );
            })}

            <div className="relative" ref={moreMenuRef}>
              <button
                type="button"
                onClick={() => setMoreOpen((prev) => !prev)}
                aria-expanded={moreOpen}
                aria-haspopup="menu"
                className={`inline-flex items-center gap-1 text-sm font-medium whitespace-nowrap shrink-0 py-1.5 border-b-2 transition-colors cursor-pointer ${
                  isMoreActive || moreOpen
                    ? 'border-[#be185d] text-[#9d174d] font-semibold'
                    : 'border-transparent text-[#5c223d] hover:text-[#be185d]'
                }`}
              >
                <span>{navLabels[0] || 'Care & Tools'}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-150 ${
                    moreOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {moreOpen && (
                <div
                  role="menu"
                  className="absolute left-0 mt-2 w-60 rounded-2xl border border-[#ea91b8] bg-[#fff7fa] p-2 shadow-lg z-40"
                >
                  <p className="px-2.5 pt-1 pb-1.5 text-[11px] font-semibold text-[#7e405c] m-0">
                    {navLabels[1] || 'Maternal Tools & Support'}
                  </p>
                  <div className="space-y-0.5">
                    {MORE_CARE_NAV.map((item) => {
                      const active = currentPath === item.href;
                      return (
                        <button
                          key={item.href}
                          type="button"
                          role="menuitem"
                          onClick={() => go(item.href)}
                          className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#be185d] text-white'
                              : 'text-[#3f0d24] hover:bg-[#ffe4ef]'
                          }`}
                        >
                          {t(item.key)}
                        </button>
                      );
                    })}
                  </div>
                  <div className="my-1.5 border-t border-[#ffd6e7]" />
                  <p className="px-2.5 pt-0.5 pb-1 text-[11px] font-semibold text-[#7e405c] m-0">
                    {navLabels[2] || 'Staff & Privacy'}
                  </p>
                  <div className="space-y-0.5">
                    {CLINIC_POLICY_NAV.map((item) => {
                      const active = currentPath === item.href;
                      return (
                        <button
                          key={item.href}
                          type="button"
                          role="menuitem"
                          onClick={() => go(item.href)}
                          className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#be185d] text-white'
                              : 'text-[#5c223d] hover:bg-[#ffe4ef] hover:text-[#3f0d24]'
                          }`}
                        >
                          {t(item.key)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right Utility Zone: Notifications + Language Selector + Account */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative" ref={notifMenuRef}>
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                aria-label={
                  unreadCount > 0
                    ? `Notifications (${unreadCount} unread)`
                    : 'Notifications'
                }
                aria-expanded={notifOpen}
                className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[#ea91b8] bg-[#fff7fa] text-[#9d174d] hover:bg-[#ffe4ef] cursor-pointer"
              >
                <Bell className="w-4 h-4" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-[#be185d] text-white text-[10px] font-bold px-1 flex items-center justify-center tabular-nums">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div
                  role="region"
                  aria-label="Notifications panel"
                  className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border-2 border-[#ea91b8] bg-[#fff7fa] p-3 shadow-xl z-50 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#ffd6e7]">
                    <strong className="text-xs font-bold uppercase tracking-wider text-[#be185d]">
                      Notifications ({unreadCount})
                    </strong>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllRead}
                        className="text-[11px] font-semibold text-[#9d174d] hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {unreadNotifications.length === 0 ? (
                    <p className="text-xs text-[#5c223d] py-3 text-center m-0 leading-relaxed">
                      No new notifications right now. Alerts for new doctor posts, comments, community replies, and hourly baby check-ins will appear here.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
                      {unreadNotifications.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-[#f4b6d0] bg-white p-2.5 text-xs space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <strong className="text-[#3f0d24] leading-snug">{item.title}</strong>
                            <button
                              type="button"
                              onClick={() => dismissNotification(item.id)}
                              aria-label="Dismiss notification"
                              className="text-[#7e405c] hover:text-[#be123c] cursor-pointer shrink-0"
                            >
                              <X className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          </div>
                          <p className="text-[11px] text-[#5c223d] m-0 leading-relaxed">
                            {item.message}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              dismissNotification(item.id);
                              setNotifOpen(false);
                              go(item.route);
                            }}
                            className="text-[11px] font-semibold text-[#be185d] hover:underline cursor-pointer"
                          >
                            {item.actionLabel} →
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <label className="relative inline-flex items-center">
              <span className="sr-only">{t('lang.label')}</span>
              <Globe
                className="w-3.5 h-3.5 text-[#be185d] pointer-events-none absolute left-2.5"
                aria-hidden="true"
              />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SaLanguageCode)}
                aria-label={t('lang.label')}
                title={t('lang.label')}
                className="min-h-[38px] rounded-lg border border-[#ea91b8] bg-[#fff7fa] pl-7 pr-6 py-1 text-xs font-semibold text-[#7e1343] hover:bg-[#ffe4ef] focus:outline-none focus:border-[#be185d] cursor-pointer max-w-[138px] sm:max-w-[190px]"
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName}
                    {lang.code !== 'en' ? ` (${lang.englishName})` : ''}
                  </option>
                ))}
              </select>
            </label>

            <div className="hidden md:flex items-center gap-2 shrink-0">
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={() => go('/dashboard')}
                    className="text-xs font-semibold text-[#7e1343] bg-[#ffd6e7] border border-[#ea91b8] px-3 py-2 rounded-lg whitespace-nowrap hover:bg-[#ffc4dc] cursor-pointer"
                  >
                    {user.name.split(' ')[0]}
                    {roleTag(user.role)}
                  </button>
                  <button
                    type="button"
                    onClick={onLogout}
                    aria-label={t('auth.signOut')}
                    title={t('auth.signOut')}
                    className="pink-btn-secondary !min-h-[38px] !px-3 text-xs"
                  >
                    <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="hidden xl:inline">{t('auth.signOut')}</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => go('/login')}
                  className="pink-btn-primary !min-h-[38px] !px-4 text-xs"
                >
                  {t('auth.signIn')}
                </button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#ea91b8] bg-[#fff7fa] text-[#9d174d]"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Organized Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#fff7fa] border-t border-[#f4b6d0] px-4 py-4 space-y-5 max-h-[82vh] overflow-y-auto">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#7e405c] m-0">
                {navLabels[3] || 'Main Pages'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {PRIMARY_NAV.map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => go(item.href)}
                    className={`text-left px-3 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                      currentPath === item.href
                        ? 'bg-[#be185d] text-white border-[#be185d]'
                        : 'bg-white text-[#3f0d24] border-[#f4b6d0]'
                    }`}
                  >
                    {t(item.key)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#7e405c] m-0">
                {navLabels[4] || 'Care Tools, Staff & Privacy'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[...MORE_CARE_NAV, ...CLINIC_POLICY_NAV].map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => go(item.href)}
                    className={`text-left px-3 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                      currentPath === item.href
                        ? 'bg-[#be185d] text-white border-[#be185d]'
                        : 'bg-white text-[#3f0d24] border-[#f4b6d0]'
                    }`}
                  >
                    {t(item.key)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-[#f4b6d0]">
              <PWAInstallButton variant="compact" className="w-full justify-center !py-2.5" />
              <div className="flex flex-wrap gap-2">
                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="pink-btn-secondary w-full text-xs"
                  >
                    {t('auth.signOut')} ({user.name})
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => go('/login')}
                      className="pink-btn-secondary flex-1 text-xs"
                    >
                      {t('auth.signIn')}
                    </button>
                    <button
                      type="button"
                      onClick={() => go('/register')}
                      className="pink-btn-primary flex-1 text-xs"
                    >
                      {t('auth.register')}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Automatic Notification Bar (shows when unread notifications exist) */}
      <NotificationBar
        unreadNotifications={unreadNotifications}
        onNavigate={go}
        onDismiss={dismissNotification}
        onMarkAllRead={markAllRead}
        onOpenPanel={() => setNotifOpen(true)}
      />

      {/* Offline Mode Message & Quick Offline Links */}
      <OfflineBanner onNavigate={go} />

      {/* Active Page Content */}
      <main className="flex-1">{children}</main>

      {/* Quiet, Balanced 3-Column Footer */}
      <footer className="bg-[#ffe4ef] border-t border-[#f4b6d0] mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid gap-8 md:grid-cols-12">
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-2 font-display text-lg font-semibold text-[#3f0d24]">
              <Heart className="w-5 h-5 text-[#be185d]" aria-hidden="true" />
              <span>PregMamas</span>
            </div>
            <p className="text-sm text-[#5c223d] max-w-md leading-relaxed">
              {t('footer.tagline')}
            </p>
            <p className="text-xs text-[#7e405c] pt-1 leading-relaxed">
              Reference: South African National Department of Health,{' '}
              <span className="italic">
                National Integrated Maternal and Perinatal Care Guidelines for South Africa (2024)
              </span>
              .
            </p>
            <p className="text-xs text-[#7e405c] m-0">
              Official site:{' '}
              <a
                href="https://pregmamas.ai.studio"
                className="font-semibold text-[#be185d] hover:underline"
              >
                pregmamas.ai.studio
              </a>
            </p>
          </div>

          <div className="md:col-span-3 space-y-2.5">
            <h3 className="text-sm font-semibold text-[#3f0d24] font-sans">{t('footer.sections')}</h3>
            <ul className="space-y-2 text-sm text-[#5c223d] list-none p-0 m-0">
              <li>
                <button type="button" onClick={() => go('/dashboard')} className="hover:text-[#be185d] cursor-pointer">
                  {t('nav.dashboard')}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('/learn')} className="hover:text-[#be185d] cursor-pointer">
                  {t('nav.learn')}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('/kicks')} className="hover:text-[#be185d] cursor-pointer">
                  {t('nav.kicks')}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('/health-logs')} className="hover:text-[#be185d] cursor-pointer">
                  {t('nav.healthLogs')}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('/labour-prep')} className="hover:text-[#be185d] cursor-pointer">
                  {t('nav.labourPrep')}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('/postpartum')} className="hover:text-[#be185d] cursor-pointer">
                  {t('nav.postpartum')}
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-2.5">
            <h3 className="text-sm font-semibold text-[#3f0d24] font-sans">{t('footer.safetyRoles')}</h3>
            <ul className="space-y-2 text-sm text-[#5c223d] list-none p-0 m-0">
              <li>
                <button
                  type="button"
                  onClick={() => go('/emergency')}
                  className="font-semibold text-[#be123c] hover:underline cursor-pointer"
                >
                  {t('nav.emergency')} (10177 / 112)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('/advisor')} className="hover:text-[#be185d] cursor-pointer">
                  {t('nav.advisor')}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('/community')} className="hover:text-[#be185d] cursor-pointer">
                  {t('nav.community')}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('/partners')} className="hover:text-[#be185d] cursor-pointer">
                  {t('nav.partners')}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('/professional')} className="hover:text-[#be185d] cursor-pointer">
                  {t('nav.professional')}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('/admin')} className="hover:text-[#be185d] cursor-pointer">
                  {t('nav.admin')}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('/privacy')} className="hover:text-[#be185d] cursor-pointer">
                  {t('nav.privacy')}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
