import { ArrowRight } from 'lucide-react';
import { TV_CATEGORIES } from '../data/indianTvTaxonomy';
import type { TvCategory, TvChannel } from '../types/tv';

interface CategoriesViewProps {
  channels: TvChannel[];
  onSelectCategoryAndBrowse: (cat: TvCategory) => void;
  onPlayChannel: (channel: TvChannel) => void;
}

export function CategoriesView({
  channels,
  onSelectCategoryAndBrowse,
  onPlayChannel,
}: CategoriesViewProps) {
  const categoryCards = TV_CATEGORIES.filter((c) => c.id !== 'All').map((cat) => {
    const matching = channels.filter((ch) => ch.category === cat.id);
    return {
      ...cat,
      count: matching.length,
      preview: matching.slice(0, 3),
    };
  }).filter((c) => c.count > 0);

  return (
    <section className="space-y-6" aria-label="Browse Indian Channels by Category">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Channels by Category
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Explore live Indian television across News, Entertainment, Movies, Sports, Music, and Devotional genres.
          </p>
        </div>
        <p className="font-mono text-xs text-slate-400 tabular-nums">
          {categoryCards.length} categories
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {categoryCards.map((cat) => (
          <div
            key={cat.id}
            className="rounded-2xl bg-[#131924] border border-slate-800/90 overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-colors"
          >
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-bold text-white">
                    {cat.label}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <span className="font-mono text-xs text-amber-400 tabular-nums shrink-0">
                  {cat.count} ch
                </span>
              </div>

              <div className="space-y-1.5">
                {cat.preview.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => onPlayChannel(ch)}
                    data-tv-focusable="true"
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#0E131C] hover:bg-[#1A2232] text-left transition-colors cursor-pointer"
                  >
                    <span className="text-sm text-slate-200 truncate">{ch.name}</span>
                    <span className="text-xs text-slate-400 font-mono tabular-nums shrink-0">
                      CH {ch.number} · {ch.language}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="px-5 pb-5">
              <button
                type="button"
                onClick={() => onSelectCategoryAndBrowse(cat.id)}
                data-tv-focusable="true"
                className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-[#1A2232] hover:bg-amber-400 hover:text-[#0B0F17] text-slate-100 text-sm font-semibold transition-colors cursor-pointer"
              >
                <span>Open {cat.label}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
