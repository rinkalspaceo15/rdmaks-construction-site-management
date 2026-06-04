import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import en from './en.json';
import hi from './hi.json';

export type Lang = 'en' | 'hi';

const STORAGE_KEY = 'sm_lang';

// Catalogs are flat key → string maps. English is the source of truth and the
// fallback for any key a translation is missing.
const CATALOGS: Record<Lang, Record<string, string>> = { en, hi };

function lookup(catalog: Record<string, string>, key: string): string | undefined {
  return Object.prototype.hasOwnProperty.call(catalog, key)
    ? catalog[key]
    : undefined;
}

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'hi' || saved === 'en' ? saved : 'en';
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // localStorage may be unavailable (private mode) — language just won't persist.
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      let str = lookup(CATALOGS[lang], key) ?? lookup(CATALOGS.en, key);
      if (str === undefined) {
        if (import.meta.env.DEV) console.warn(`[i18n] missing key: ${key}`);
        return key;
      }
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        }
      }
      return str;
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return ctx;
}
