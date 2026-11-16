import { INDIAN_LANGUAGES, TV_CATEGORIES } from '../data/indianTvTaxonomy';
import type { IndianLanguage, TvCategory } from '../types/tv';

interface LanguageAndCategoryBarProps {
  selectedLanguage: IndianLanguage;
  selectedCategory: TvCategory;
  onSelectLanguage: (lang: IndianLanguage) => void;
  onSelectCategory: (cat: TvCategory) => void;
  languageCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  totalCount: number;
}

export function LanguageAndCategoryBar({
  selectedLanguage,
  selectedCategory,
  onSelectLanguage,
  onSelectCategory,
  languageCounts,
  categoryCounts,
  totalCount,
}: LanguageAndCategoryBarProps) {
  return (
    <section aria-label="Language and Category Filters" className="space-y-4">
      {/* Language Division Rail */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Language
          </h2>
          <span className="text-xs text-slate-400 font-mono tabular-nums">
            {totalCount} channels available
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 tv-scroll">
          {INDIAN_LANGUAGES.map((lang) => {
            const count =
              lang.id === 'All' ? totalCount : languageCounts[lang.id] || 0;
            if (lang.id !== 'All' && count === 0) return null;

            const isSelected = selectedLanguage === lang.id;
            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => onSelectLanguage(lang.id)}
                data-tv-focusable="true"
                aria-pressed={isSelected}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'bg-amber-400 text-[#0B0F17] border-amber-400 font-semibold'
                    : 'bg-[#131924] text-slate-200 border-slate-800 hover:bg-[#1A2232] hover:border-slate-700'
                }`}
              >
                <span>{lang.label}</span>
                {lang.id !== 'All' && lang.id !== 'English' && (
                  <span
                    className={`text-xs ${
                      isSelected ? 'text-[#0B0F17]/75' : 'text-slate-400'
                    }`}
                  >
                    {lang.nativeLabel}
                  </span>
                )}
                <span
                  className={`font-mono text-xs tabular-nums ${
                    isSelected ? 'text-[#0B0F17]/80' : 'text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Division Strip */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Category
        </h2>

        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 tv-scroll">
          {TV_CATEGORIES.map((cat) => {
            const count =
              cat.id === 'All' ? totalCount : categoryCounts[cat.id] || 0;
            if (cat.id !== 'All' && count === 0) return null;

            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                data-tv-focusable="true"
                aria-pressed={isSelected}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'bg-[#1E293B] text-amber-300 border-amber-400/70 font-semibold'
                    : 'bg-[#131924] text-slate-300 border-slate-800/80 hover:bg-[#1A2232] hover:text-white'
                }`}
              >
                <span>{cat.label}</span>
                <span className="font-mono text-xs tabular-nums text-slate-500">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
