import { ReactNode, useState } from 'react';
import { Heart, LogOut, Menu, X } from 'lucide-react';
import { AccountRole, AppRoute, DemoUser } from '../data/pregmamasData';

interface SiteLayoutProps {
  currentPath: AppRoute;
  onNavigate: (path: AppRoute) => void;
  user: DemoUser | null;
  onLogout: () => void;
  children: ReactNode;
}

const PRIMARY_NAV: Array<{ href: AppRoute; label: string }> = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/learn', label: 'Learn' },
  { href: '/emergency', label: 'Emergency' },
  { href: '/community', label: 'Community' },
  { href: '/advisor', label: 'AI Advisor' },
];

const SECONDARY_NAV: Array<{ href: AppRoute; label: string }> = [
  { href: '/kicks', label: 'Baby Kicks & Sounds' },
  { href: '/health-logs', label: 'Health Logs' },
  { href: '/labour-prep', label: 'Labour Prep' },
  { href: '/postpartum', label: 'Postpartum & Contraception' },
  { href: '/partners', label: 'Partner Support' },
  { href: '/professional', label: 'Healthcare Staff' },
  { href: '/admin', label: 'Admin' },
  { href: '/privacy', label: 'Privacy & Guidelines' },
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

  const go = (path: AppRoute) => {
    setMobileMenuOpen(false);
    onNavigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fff0f6] text-[#3f0d24]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-[#ffe4ef]/95 backdrop-blur border-b border-[#f4b6d0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Mark */}
          <button
            type="button"
            onClick={() => go('/')}
            className="inline-flex items-center gap-2.5 text-[#3f0d24] font-display text-xl font-semibold whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span className="w-8 h-8 rounded-lg bg-[#be185d] text-white grid place-items-center shrink-0">
              <Heart className="w-4 h-4 fill-current" aria-hidden="true" />
            </span>
            <span>PregMamas</span>
          </button>

          {/* Primary Navigation */}
          <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-6">
            {PRIMARY_NAV.map((item) => {
              const active = currentPath === item.href;
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => go(item.href)}
                  className={`text-sm font-medium whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                    active
                      ? 'border-[#be185d] text-[#9d174d] font-semibold'
                      : 'border-transparent text-[#5c223d] hover:text-[#be185d]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Account / Auth Actions */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
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
                  className="pink-btn-secondary !min-h-[36px] !px-3 !py-1.5 text-xs"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Sign out</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => go('/login')}
                  className="pink-btn-secondary !min-h-[38px] !px-4 text-xs sm:text-sm"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => go('/register')}
                  className="pink-btn-primary !min-h-[38px] !px-4 text-xs sm:text-sm"
                >
                  Register
                </button>
              </>
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

        {/* Secondary Sub-Nav Row */}
        <div className="hidden lg:block bg-[#fff7fa] border-t border-[#f4b6d0]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-10 flex items-center gap-5 overflow-x-auto">
            {SECONDARY_NAV.map((item) => {
              const active = currentPath === item.href;
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => go(item.href)}
                  className={`text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    active
                      ? 'text-[#be185d] font-semibold underline underline-offset-4'
                      : 'text-[#7e405c] hover:text-[#be185d]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#fff7fa] border-t border-[#f4b6d0] px-4 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {[...PRIMARY_NAV, ...SECONDARY_NAV].map((item) => (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => go(item.href)}
                  className={`text-left px-3 py-2.5 rounded-lg text-xs font-semibold border transition-colors ${
                    currentPath === item.href
                      ? 'bg-[#be185d] text-white border-[#be185d]'
                      : 'bg-white text-[#3f0d24] border-[#f4b6d0]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-[#f4b6d0]">
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="pink-btn-secondary w-full text-xs"
                >
                  Sign out ({user.name})
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => go('/login')}
                    className="pink-btn-secondary flex-1 text-xs"
                  >
                    Sign in / Role Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => go('/register')}
                    className="pink-btn-primary flex-1 text-xs"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Active Page Content */}
      <main className="flex-1">{children}</main>

      {/* Footer matching MamaCare SA */}
      <footer className="bg-[#ffe4ef] border-t border-[#f4b6d0] mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid gap-8 md:grid-cols-12">
          <div className="md:col-span-6 space-y-2.5">
            <div className="flex items-center gap-2 font-display text-lg font-semibold text-[#3f0d24]">
              <Heart className="w-5 h-5 text-[#be185d]" aria-hidden="true" />
              <span>PregMamas</span>
            </div>
            <p className="text-sm text-[#5c223d] max-w-md leading-relaxed">
              Supportive pregnancy education, LMP week estimation, daily supplement reminders, hospital bag counts, private health logs, and urgent care guidance for South African families.
            </p>
            <p className="text-xs text-[#7e405c] pt-1">
              Reference: South African National Department of Health,{' '}
              <span className="italic">
                National Integrated Maternal and Perinatal Care Guidelines for South Africa (2024)
              </span>
              .
            </p>
          </div>

          <div className="md:col-span-3 space-y-2">
            <h3 className="text-sm font-semibold text-[#3f0d24] font-sans">Website Sections</h3>
            <ul className="space-y-1.5 text-sm text-[#5c223d] list-none p-0 m-0">
              <li>
                <button type="button" onClick={() => go('/dashboard')} className="hover:text-[#be185d] cursor-pointer">
                  Mother Dashboard
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('/learn')} className="hover:text-[#be185d] cursor-pointer">
                  Learn & Articles
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('/kicks')} className="hover:text-[#be185d] cursor-pointer">
                  Baby Kicks & Sounds
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('/health-logs')} className="hover:text-[#be185d] cursor-pointer">
                  Private Health Logs
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('/labour-prep')} className="hover:text-[#be185d] cursor-pointer">
                  Labour Preparation
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('/postpartum')} className="hover:text-[#be185d] cursor-pointer">
                  Postpartum & Contraception
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-2">
            <h3 className="text-sm font-semibold text-[#3f0d24] font-sans">Safety & Roles</h3>
            <ul className="space-y-1.5 text-sm text-[#5c223d] list-none p-0 m-0">
              <li>
                <button
                  type="button"
                  onClick={() => go('/emergency')}
                  className="font-semibold text-[#be123c] hover:underline cursor-pointer"
                >
                  Emergency Info (10177 / 112)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('/advisor')} className="hover:text-[#be185d] cursor-pointer">
                  Educational AI Advisor
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('/partners')} className="hover:text-[#be185d] cursor-pointer">
                  Partner Consent & Support
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('/professional')} className="hover:text-[#be185d] cursor-pointer">
                  Healthcare Professional Area
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('/admin')} className="hover:text-[#be185d] cursor-pointer">
                  Administrator Area
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('/privacy')} className="hover:text-[#be185d] cursor-pointer">
                  Privacy & Consent
                </button>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
