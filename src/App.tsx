import { useEffect, useState } from 'react';
import { AppRoute, DemoUser, LearningTopic } from './data/pregmamasData';
import { SiteLayout } from './components/SiteLayout';
import { AlarmProvider } from './context/AlarmContext';
import { LanguageProvider } from './context/LanguageContext';
import { SharedContentProvider } from './context/SharedContentContext';
import { applyRouteSeo, normalizeLegacyPath } from './lib/seo';
import { LandingPage } from './pages/LandingPage';
import {
  BabyKicksPage,
  HealthLogsPage,
  LabourPrepPage,
  MotherDashboardPage,
  PostpartumPage,
} from './pages/MotherPages';
import {
  AdvisorPage,
  EmergencyPage,
  LearnPage,
  PartnersPage,
  PrivacyPage,
} from './pages/EducationPages';
import {
  AdminPage,
  CommunityPage,
  LoginPage,
  ProfessionalPage,
  RegisterPage,
} from './pages/CommunityAuthStaffPages';

const USER_STORAGE_KEY = 'pregmamas_user_v1';

const VALID_ROUTES: AppRoute[] = [
  '/',
  '/dashboard',
  '/week-by-week',
  '/learn',
  '/nutrition',
  '/kicks',
  '/emergency',
  '/danger-signs',
  '/community',
  '/advisor',
  '/health-logs',
  '/labour-prep',
  '/postpartum',
  '/partners',
  '/professional',
  '/admin',
  '/privacy',
  '/login',
  '/register',
];

function getInitialRoute(): AppRoute {
  if (typeof window !== 'undefined') {
    const normalized = normalizeLegacyPath(window.location.pathname);
    if (normalized && VALID_ROUTES.includes(normalized)) {
      if (window.location.pathname !== normalized) {
        window.history.replaceState({}, '', normalized);
      }
      return normalized;
    }
  }
  return '/';
}

export default function App() {
  const [currentPath, setCurrentPath] = useState<AppRoute>(getInitialRoute);
  const [learnTopic, setLearnTopic] = useState<LearningTopic['slug']>('all');
  const [user, setUser] = useState<DemoUser | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  useEffect(() => {
    applyRouteSeo(currentPath);
  }, [currentPath]);

  useEffect(() => {
    const onPop = () => {
      setCurrentPath(getInitialRoute());
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const handleNavigate = (path: AppRoute, topic?: string) => {
    if (topic) {
      setLearnTopic(topic as LearningTopic['slug']);
    } else if (path === '/learn' && currentPath !== '/learn') {
      setLearnTopic('all');
    }
    setCurrentPath(path);
    if (typeof window !== 'undefined' && window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  };

  const handleAuthSuccess = (nextUser: DemoUser) => {
    setUser(nextUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    handleNavigate('/');
  };

  const renderPage = () => {
    switch (currentPath) {
      case '/':
        return <LandingPage user={user} onNavigate={handleNavigate} />;
      case '/dashboard':
      case '/week-by-week':
        return <MotherDashboardPage user={user} onNavigate={handleNavigate} />;
      case '/learn':
        return <LearnPage initialTopic={learnTopic} user={user} onNavigate={handleNavigate} />;
      case '/nutrition':
        return <LearnPage initialTopic="general" user={user} onNavigate={handleNavigate} />;
      case '/kicks':
        return <BabyKicksPage onNavigate={handleNavigate} />;
      case '/emergency':
      case '/danger-signs':
        return <EmergencyPage />;
      case '/community':
        return <CommunityPage user={user} />;
      case '/advisor':
        return <AdvisorPage onNavigate={handleNavigate} />;
      case '/health-logs':
        return <HealthLogsPage onNavigate={handleNavigate} />;
      case '/labour-prep':
        return <LabourPrepPage />;
      case '/postpartum':
        return <PostpartumPage />;
      case '/partners':
        return <PartnersPage />;
      case '/professional':
        return <ProfessionalPage user={user} onNavigate={handleNavigate} />;
      case '/admin':
        return <AdminPage />;
      case '/privacy':
        return <PrivacyPage />;
      case '/login':
        return <LoginPage onAuthSuccess={handleAuthSuccess} onNavigate={handleNavigate} />;
      case '/register':
        return <RegisterPage onAuthSuccess={handleAuthSuccess} onNavigate={handleNavigate} />;
      default:
        return <LandingPage user={user} onNavigate={handleNavigate} />;
    }
  };

  return (
    <LanguageProvider>
      <SharedContentProvider>
        <AlarmProvider>
          <SiteLayout
            currentPath={currentPath}
            onNavigate={handleNavigate}
            user={user}
            onLogout={handleLogout}
          >
            {renderPage()}
          </SiteLayout>
        </AlarmProvider>
      </SharedContentProvider>
    </LanguageProvider>
  );
}
