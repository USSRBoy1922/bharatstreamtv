import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Star } from 'lucide-react';
import { SPOTLIGHT_ITEMS, getChannelEpgSchedule } from '../data/indianTvTaxonomy';
import type { TvChannel, TvCategory, IndianLanguage } from '../types/tv';

interface SpotlightHeroProps {
  channels: TvChannel[];
  favorites: Set<string>;
  onPlayChannel: (channel: TvChannel) => void;
  onToggleFavorite: (channelId: string) => void;
  onApplyFilter: (language: IndianLanguage, category: TvCategory) => void;
}

export function SpotlightHero({
  channels,
  favorites,
  onPlayChannel,
  onToggleFavorite,
  onApplyFilter,
}: SpotlightHeroProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SPOTLIGHT_ITEMS.length);
    }, 8500);
    return () => clearInterval(timer);
  }, []);

  const currentSpot = SPOTLIGHT_ITEMS[activeSlide];

  // Match a real channel for this spotlight
  const matchedChannel =
    channels.find((ch) =>
      currentSpot.featuredChannelNames.some((target) =>
        ch.name.toLowerCase().includes(target.toLowerCase())
      )
    ) ||
    channels.find(
      (ch) => ch.category === currentSpot.category && ch.language === currentSpot.language
    ) ||
    channels[0];

  const liveProgram = matchedChannel ? getChannelEpgSchedule(matchedChannel)[0] : null;
  const isFav = matchedChannel ? favorites.has(matchedChannel.id) : false;

  return (
    <section
      aria-label="Featured Indian Broadcast Spotlight"
      className="relative w-full overflow-hidden rounded-2xl border border-slate-800/80 bg-[#131924]"
    >
      <div className="relative min-h-[210px] sm:min-h-[245px] xl:min-h-[310px] flex items-end">
        {/* Background photography with zero-broken-image fallback */}
        {!imgErrors[currentSpot.id] ? (
          <img
            src={currentSpot.image}
            alt={currentSpot.title}
            referrerPolicy="no-referrer"
            onError={() => setImgErrors((prev) => ({ ...prev, [currentSpot.id]: true }))}
            className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-[#192231] via-[#111827] to-[#0B0F17]"
          />
        )}

        {/* Measured directional scrim for guaranteed >=4.5:1 text contrast */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#0B0F17] via-[#0B0F17]/80 to-[#0B0F17]/25"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-transparent to-[#0B0F17]/30"
        />

        {/* Hero content */}
        <div className="relative z-10 w-full p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            {matchedChannel && (
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-amber-300 font-medium">
                <span className="font-mono tabular-nums">Ch {matchedChannel.number}</span>
                <span aria-hidden="true" className="text-slate-500">·</span>
                <span>{matchedChannel.name}</span>
                <span aria-hidden="true" className="text-slate-500">·</span>
                <span>{matchedChannel.language}</span>
                <span aria-hidden="true" className="text-slate-500">·</span>
                <span>{matchedChannel.category}</span>
              </div>
            )}

            <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-white leading-[1.12] [text-wrap:balance]">
              {currentSpot.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              {liveProgram
                ? `On Now (${liveProgram.startTime} – ${liveProgram.endTime} IST): ${liveProgram.title}. ${currentSpot.subtitle}`
                : currentSpot.subtitle}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              {matchedChannel && (
                <button
                  type="button"
                  onClick={() => onPlayChannel(matchedChannel)}
                  data-tv-focusable="true"
                  data-tv-initial-focus="true"
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-amber-400 text-[#0B0F17] font-semibold text-sm hover:bg-amber-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                  <span>Watch {matchedChannel.name}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onApplyFilter('All', currentSpot.category)}
                data-tv-focusable="true"
                data-tv-initial-focus={!matchedChannel ? 'true' : undefined}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1A2232]/90 border border-slate-700/80 text-slate-100 font-medium text-sm hover:bg-[#232D42] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Browse {currentSpot.category}</span>
              </button>

              {matchedChannel && (
                <button
                  type="button"
                  onClick={() => onToggleFavorite(matchedChannel.id)}
                  data-tv-focusable="true"
                  aria-label={isFav ? `Remove ${matchedChannel.name} from favorites` : `Add ${matchedChannel.name} to favorites`}
                  className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#1A2232]/90 border border-slate-700/80 text-slate-200 hover:text-amber-400 transition-colors cursor-pointer shrink-0"
                >
                  <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>
              )}
            </div>
          </div>

          {/* Slide switcher */}
          <div className="flex items-center gap-3 self-start lg:self-end shrink-0">
            <button
              type="button"
              onClick={() =>
                setActiveSlide((prev) => (prev - 1 + SPOTLIGHT_ITEMS.length) % SPOTLIGHT_ITEMS.length)
              }
              aria-label="Previous spotlight"
              data-tv-focusable="true"
              className="w-10 h-10 rounded-lg bg-[#131924]/85 border border-slate-700/80 flex items-center justify-center text-slate-200 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5" role="tablist" aria-label="Spotlight slides">
              {SPOTLIGHT_ITEMS.map((spot, idx) => (
                <button
                  key={spot.id}
                  type="button"
                  role="tab"
                  aria-selected={idx === activeSlide}
                  aria-label={spot.title}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === activeSlide
                      ? 'w-7 bg-amber-400'
                      : 'w-2 bg-slate-500/70 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setActiveSlide((prev) => (prev + 1) % SPOTLIGHT_ITEMS.length)}
              aria-label="Next spotlight"
              data-tv-focusable="true"
              className="w-10 h-10 rounded-lg bg-[#131924]/85 border border-slate-700/80 flex items-center justify-center text-slate-200 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
