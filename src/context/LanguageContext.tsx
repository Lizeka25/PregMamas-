import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import {
  getSaLanguageInfo,
  SA_LANGUAGES,
  SA_TRANSLATIONS,
  SaLanguageCode,
  SaLanguageInfo,
  TranslationKey,
} from '../data/saLanguages';

const LANG_STORAGE_KEY = 'pregmamas_language_v1';
const TR_CACHE_STORAGE_KEY = 'pregmamas_tr_cache_v1';

const clientTranslationCache = new Map<string, string>();
let cacheHydrated = false;

function hydrateClientCache() {
  if (cacheHydrated || typeof window === 'undefined') return;
  cacheHydrated = true;
  try {
    const raw = localStorage.getItem(TR_CACHE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, string>;
      if (parsed && typeof parsed === 'object') {
        for (const [k, v] of Object.entries(parsed)) {
          if (typeof v === 'string' && v.trim()) {
            clientTranslationCache.set(k, v);
          }
        }
      }
    }
  } catch {
    // ignore storage errors
  }
}

function persistClientCache() {
  if (typeof window === 'undefined') return;
  try {
    const entries = Array.from(clientTranslationCache.entries()).slice(-600);
    localStorage.setItem(TR_CACHE_STORAGE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // ignore quota errors
  }
}

interface LanguageContextValue {
  language: SaLanguageCode;
  setLanguage: (code: SaLanguageCode) => void;
  languageInfo: SaLanguageInfo;
  supportedLanguages: SaLanguageInfo[];
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SaLanguageCode>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY) as SaLanguageCode | null;
      if (saved && SA_LANGUAGES.some((l) => l.code === saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  useEffect(() => {
    hydrateClientCache();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, language);
    } catch {
      // ignore
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = (code: SaLanguageCode) => {
    if (SA_LANGUAGES.some((l) => l.code === code)) {
      setLanguageState(code);
    }
  };

  const languageInfo = useMemo(() => getSaLanguageInfo(language), [language]);

  const t = useMemo(() => {
    const dict = SA_TRANSLATIONS[language] || SA_TRANSLATIONS.en;
    const fallback = SA_TRANSLATIONS.en;
    return (key: TranslationKey) => dict[key] || fallback[key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, languageInfo, supportedLanguages: SA_LANGUAGES, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}

export function useTranslatedTexts(texts: string[]): {
  translated: string[];
  translating: boolean;
} {
  const { language, languageInfo } = useLanguage();
  const textsKey = JSON.stringify(texts);
  const [translated, setTranslated] = useState<string[]>(texts);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    hydrateClientCache();
    if (language === 'en' || texts.length === 0) {
      setTranslated(texts);
      setTranslating(false);
      return;
    }

    const immediate = texts.map((txt) => {
      const clean = (txt || '').trim();
      if (!clean) return txt;
      return clientTranslationCache.get(`${language}::${clean}`) || txt;
    });
    setTranslated(immediate);

    const missingIndices: number[] = [];
    const missingTexts: string[] = [];
    texts.forEach((txt, idx) => {
      const clean = (txt || '').trim();
      if (!clean) return;
      if (!clientTranslationCache.has(`${language}::${clean}`)) {
        missingIndices.push(idx);
        missingTexts.push(txt);
      }
    });

    if (missingTexts.length === 0) {
      setTranslating(false);
      return;
    }

    let cancelled = false;
    setTranslating(true);

    fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetLanguage: language,
        targetLanguageName: languageInfo.nativeName,
        texts: missingTexts,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { translations?: string[] } | null) => {
        if (cancelled || !data || !Array.isArray(data.translations)) return;
        const next = [...immediate];
        missingIndices.forEach((origIdx, j) => {
          const val = data.translations?.[j];
          if (typeof val === 'string' && val.trim()) {
            next[origIdx] = val.trim();
            const cleanOrig = (texts[origIdx] || '').trim();
            if (cleanOrig) {
              clientTranslationCache.set(`${language}::${cleanOrig}`, val.trim());
            }
          }
        });
        persistClientCache();
        setTranslated(next);
      })
      .catch(() => {
        // keep fallback texts gracefully
      })
      .finally(() => {
        if (!cancelled) setTranslating(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, languageInfo.nativeName, textsKey]);

  return { translated, translating };
}
