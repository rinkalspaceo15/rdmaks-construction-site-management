import { Languages } from 'lucide-react';
import { useTranslation, Lang } from '../i18n';

const OPTIONS: { code: Lang; key: string }[] = [
  { code: 'en', key: 'lang.en' },
  { code: 'hi', key: 'lang.hi' },
];

function LanguageSwitcher() {
  const { lang, setLang, t } = useTranslation();

  return (
    <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1" role="group" aria-label="Language">
      <Languages size={16} className="text-gray-400 ml-1 mr-0.5 shrink-0" />
      {OPTIONS.map((o) => (
        <button
          key={o.code}
          onClick={() => setLang(o.code)}
          aria-pressed={lang === o.code}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
            lang === o.code
              ? 'bg-amber-600 text-white'
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          {t(o.key)}
        </button>
      ))}
    </div>
  );
}

export default LanguageSwitcher;
