import { ArrowRight } from 'lucide-react';
import { INDIAN_LANGUAGES } from '../data/indianTvTaxonomy';
import type { IndianLanguage, TvChannel } from '../types/tv';

interface LanguagesViewProps {
  channels: TvChannel[];
  onSelectLanguageAndBrowse: (lang: IndianLanguage) => void;
  onPlayChannel: (channel: TvChannel) => void;
}

export function LanguagesView({
  channels,
  onSelectLanguageAndBrowse,
  onPlayChannel,
}: LanguagesViewProps) {
  const languageSections = INDIAN_LANGUAGES.filter((l) => l.id !== 'All').map((lang) => {
    const matching = channels.filter((ch) => ch.language === lang.id);
    return {
      ...lang,
      count: matching.length,
      preview: matching.slice(0, 4),
    };
  }).filter((section) => section.count > 0);

  return (
    <section className="space-y-6" aria-label="Browse Indian Channels by Language">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Channels by Indian Language
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Select a regional or national language to open its live television lineup.
          </p>
        </div>
        <p className="font-mono text-xs text-slate-400 tabular-nums">
          {languageSections.length} languages · {channels.length} total channels
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {languageSections.map((section) => (
          <div
            key={section.id}
            className="rounded-2xl bg-[#131924] border border-slate-800/90 p-5 flex flex-col justify-between gap-4 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-slate-400">{section.region}</p>
                <h2 className="font-display text-xl font-bold text-white mt-0.5 flex items-baseline gap-2.5">
                  <span>{section.label}</span>
                  {section.id !== 'English' && (
                    <span className="text-base font-medium text-amber-400/90">
                      {section.nativeLabel}
                    </span>
                  )}
                </h2>
              </div>
              <span className="font-mono text-xs text-slate-300 tabular-nums shrink-0">
                {section.count} ch
              </span>
            </div>

            <div className="space-y-1.5">
              {section.preview.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => onPlayChannel(ch)}
                  data-tv-focusable="true"
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#0E131C] hover:bg-[#1A2232] text-left transition-colors cursor-pointer"
                >
                  <span className="text-sm text-slate-200 truncate">{ch.name}</span>
                  <span className="text-xs text-slate-400 font-mono tabular-nums shrink-0">
                    CH {ch.number} · {ch.category}
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onSelectLanguageAndBrowse(section.id)}
              data-tv-focusable="true"
              className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-[#1A2232] hover:bg-amber-400 hover:text-[#0B0F17] text-slate-100 text-sm font-semibold transition-colors cursor-pointer"
            >
              <span>Browse {section.label}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
