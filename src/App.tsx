import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshCw, Star, Tv } from 'lucide-react';
import { CategoriesView } from './components/CategoriesView';
import { ChannelCard } from './components/ChannelCard';
import { ChannelPlayerModal } from './components/ChannelPlayerModal';
import { LanguageAndCategoryBar } from './components/LanguageAndCategoryBar';
import { LanguagesView } from './components/LanguagesView';
import { RemoteControlDrawer } from './components/RemoteControlDrawer';
import { SearchOverlay } from './components/SearchOverlay';
import { SpotlightHero } from './components/SpotlightHero';
import { TopNav } from './components/TopNav';
import { TvGuideView } from './components/TvGuideView';
import { getCurrentIstClock } from './data/indianTvTaxonomy';
import { isNativeCapacitorApp, loadIndianChannelsClientSide } from './utils/clientChannels';
import type { AppView, IndianLanguage, TvCategory, TvChannel } from './types/tv';

const FAVORITES_KEY = 'bharatstream_favorites_v1';
const RECENT_KEY = 'bharatstream_recent_v1';
const CUSTOM_CHANNELS_KEY = 'bharatstream_custom_channels_v1';

function loadStoredArray(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function loadCustomChannels(): TvChannel[] {
  try {
    const raw = localStorage.getItem(CUSTOM_CHANNELS_KEY);
    return raw ? (JSON.parse(raw) as TvChannel[]) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [directoryChannels, setDirectoryChannels] = useState<TvChannel[]>([]);
  const [customChannels, setCustomChannels] = useState<TvChannel[]>(() => loadCustomChannels());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeView, setActiveView] = useState<AppView>('live');
  const [selectedLanguage, setSelectedLanguage] = useState<IndianLanguage>('All');
  const [selectedCategory, setSelectedCategory] = useState<TvCategory>('All');
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set(loadStoredArray(FAVORITES_KEY)));
  const [recentIds, setRecentIds] = useState<string[]>(() => loadStoredArray(RECENT_KEY));
  const [activeChannel, setActiveChannel] = useState<TvChannel | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dialBuffer, setDialBuffer] = useState('');
  const [istClock, setIstClock] = useState(() => getCurrentIstClock());

  const dialTimerRef = useRef<number | null>(null);

  const fetchChannels = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await fetch(forceRefresh ? '/api/channels?refresh=1' : '/api/channels');
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        throw new Error('Backend API unavailable');
      }
      const data = (await res.json()) as { channels: TvChannel[] };
      setDirectoryChannels(data.channels || []);
    } catch {
      try {
        const clientChannels = await loadIndianChannelsClientSide();
        setDirectoryChannels(clientChannels);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Unable to load Indian channel directory');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChannels(false);
  }, [fetchChannels]);

  useEffect(() => {
    const timer = setInterval(() => {
      setIstClock(getCurrentIstClock());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const allChannels = useMemo(
    () => [...directoryChannels, ...customChannels],
    [directoryChannels, customChannels]
  );

  // Spatial D-Pad navigation across focusable Fire TV elements
  const moveSpatialFocus = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>('[data-tv-focusable="true"]')
    ).filter((el) => el.offsetParent !== null);

    if (nodes.length === 0) return;

    const current = document.activeElement as HTMLElement | null;
    if (!current || !nodes.includes(current)) {
      nodes[0].focus();
      nodes[0].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
      return;
    }

    const curRect = current.getBoundingClientRect();
    const curX = curRect.left + curRect.width / 2;
    const curY = curRect.top + curRect.height / 2;

    let best: HTMLElement | null = null;
    let bestScore = Infinity;

    for (const candidate of nodes) {
      if (candidate === current) continue;
      const rect = candidate.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      const dx = x - curX;
      const dy = y - curY;

      let valid = false;
      let primary = 0;
      let secondary = 0;

      if (dir === 'right' && dx > 10) {
        valid = true;
        primary = dx;
        secondary = Math.abs(dy);
      } else if (dir === 'left' && dx < -10) {
        valid = true;
        primary = -dx;
        secondary = Math.abs(dy);
      } else if (dir === 'down' && dy > 10) {
        valid = true;
        primary = dy;
        secondary = Math.abs(dx);
      } else if (dir === 'up' && dy < -10) {
        valid = true;
        primary = -dy;
        secondary = Math.abs(dx);
      }

      if (!valid) continue;

      const score = primary + secondary * 2.2;
      if (score < bestScore) {
        bestScore = score;
        best = candidate;
      }
    }

    if (best) {
      best.focus({ preventScroll: true });
      if (best.closest('header')) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        best.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
      }
    }
  }, []);

  // Scroll to top cleanly when switching views and focus top initial TV item so screen never starts scrolled/cut off
  useEffect(() => {
    if (loading || activeChannel || searchOpen) return;
    window.scrollTo({ top: 0 });
    const initial =
      document.querySelector<HTMLElement>('[data-tv-initial-focus="true"]') ||
      document.querySelector<HTMLElement>('main [data-tv-focusable="true"]') ||
      document.querySelector<HTMLElement>('[data-tv-focusable="true"]');
    initial?.focus({ preventScroll: true });
  }, [loading, activeView]);

  // Restore focus cleanly after closing Player or Search overlay
  useEffect(() => {
    if (loading || activeChannel || searchOpen) return;
    const active = document.activeElement as HTMLElement | null;
    if (active && active !== document.body && active.offsetParent !== null) return;
    const fallback =
      document.querySelector<HTMLElement>('[data-tv-initial-focus="true"]') ||
      document.querySelector<HTMLElement>('main [data-tv-focusable="true"]');
    fallback?.focus({ preventScroll: true });
  }, [loading, activeChannel, searchOpen]);

  // Expose hardware Back handler for Amazon Fire TV MainActivity
  useEffect(() => {
    const win = window as unknown as { __handleFireTvBack?: () => boolean };
    win.__handleFireTvBack = () => {
      if (searchOpen) {
        setSearchOpen(false);
        return true;
      }
      if (activeChannel) {
        setActiveChannel(null);
        return true;
      }
      if (window.scrollY > 180) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const navFocus =
          document.querySelector<HTMLElement>('header [aria-current="page"]') ||
          document.querySelector<HTMLElement>('header [data-tv-focusable="true"]');
        navFocus?.focus({ preventScroll: true });
        return true;
      }
      if (activeView !== 'live') {
        setActiveView('live');
        return true;
      }
      if (selectedLanguage !== 'All' || selectedCategory !== 'All') {
        setSelectedLanguage('All');
        setSelectedCategory('All');
        return true;
      }
      return false; // Let Fire TV OS exit app when already at top of home screen
    };
    return () => {
      delete win.__handleFireTvBack;
    };
  }, [searchOpen, activeChannel, activeView, selectedLanguage, selectedCategory]);

  const handlePlayChannel = useCallback((channel: TvChannel) => {
    setActiveChannel(channel);
    setRecentIds((prev) => {
      const next = [channel.id, ...prev.filter((id) => id !== channel.id)].slice(0, 12);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage error
      }
      return next;
    });
  }, []);

  const handleToggleFavorite = useCallback((channelId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(channelId)) {
        next.delete(channelId);
      } else {
        next.add(channelId);
      }
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(next)));
      } catch {
        // Ignore storage error
      }
      return next;
    });
  }, []);

  const handleAddCustomChannels = useCallback((incoming: TvChannel[]) => {
    setCustomChannels((prev) => {
      const existingUrls = new Set(prev.map((c) => c.streamUrl));
      const merged = [...prev, ...incoming.filter((c) => !existingUrls.has(c.streamUrl))];
      try {
        localStorage.setItem(CUSTOM_CHANNELS_KEY, JSON.stringify(merged));
      } catch {
        // Ignore storage error
      }
      return merged;
    });
  }, []);

  const handleClearCustomChannels = useCallback(() => {
    setCustomChannels([]);
    try {
      localStorage.removeItem(CUSTOM_CHANNELS_KEY);
    } catch {
      // Ignore storage error
    }
  }, []);

  // Global D-pad + 3-digit channel dialer
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (activeChannel || searchOpen) return;

      const target = e.target as HTMLElement | null;
      const isInput =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT';
      if (isInput) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        moveSpatialFocus('right');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        moveSpatialFocus('left');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        moveSpatialFocus('down');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        moveSpatialFocus('up');
      } else if (e.key === 's' || e.key === 'S' || e.key === 'F3') {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        setActiveView((v) => (v === 'guide' ? 'live' : 'guide'));
      } else if (e.key === 'Backspace' || e.key === 'Escape') {
        const win = window as unknown as { __handleFireTvBack?: () => boolean };
        if (win.__handleFireTvBack?.()) {
          e.preventDefault();
        }
      } else if (/^[0-9]$/.test(e.key)) {
        const nextBuffer = (dialBuffer + e.key).slice(0, 3);
        setDialBuffer(nextBuffer);
        if (dialTimerRef.current) window.clearTimeout(dialTimerRef.current);
        dialTimerRef.current = window.setTimeout(() => {
          const num = Number(nextBuffer);
          const match = allChannels.find((ch) => ch.number === num);
          if (match) {
            handlePlayChannel(match);
          }
          setDialBuffer('');
        }, 900);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeChannel, searchOpen, moveSpatialFocus, dialBuffer, allChannels, handlePlayChannel]);

  // Language & Category counts
  const { languageCounts, categoryCounts } = useMemo(() => {
    const lCounts: Record<string, number> = {};
    const cCounts: Record<string, number> = {};
    for (const ch of allChannels) {
      lCounts[ch.language] = (lCounts[ch.language] || 0) + 1;
      cCounts[ch.category] = (cCounts[ch.category] || 0) + 1;
    }
    return { languageCounts: lCounts, categoryCounts: cCounts };
  }, [allChannels]);

  const filteredChannels = useMemo(() => {
    return allChannels
      .filter((ch) => (selectedLanguage === 'All' ? true : ch.language === selectedLanguage))
      .filter((ch) => (selectedCategory === 'All' ? true : ch.category === selectedCategory));
  }, [allChannels, selectedLanguage, selectedCategory]);

  const recentChannels = useMemo(() => {
    return recentIds
      .map((id) => allChannels.find((ch) => ch.id === id))
      .filter((c): c is TvChannel => Boolean(c));
  }, [recentIds, allChannels]);

  const favoriteChannels = useMemo(() => {
    return allChannels.filter((ch) => favorites.has(ch.id));
  }, [allChannels, favorites]);

  const handleApplyFilter = (lang: IndianLanguage, cat: TvCategory) => {
    setSelectedLanguage(lang);
    setSelectedCategory(cat);
    setActiveView('live');
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-[#F1F5F9] flex flex-col">
      <TopNav
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenSearch={() => setSearchOpen(true)}
      />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-8 lg:px-12 py-5 lg:py-7 space-y-8">
        {loading && allChannels.length === 0 ? (
          <div className="space-y-6" aria-busy="true" aria-label="Loading Indian channels">
            <div className="h-[340px] rounded-2xl bg-[#131924] border border-slate-800 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-36 rounded-xl bg-[#131924] border border-slate-800 animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : loadError && allChannels.length === 0 ? (
          <div className="rounded-2xl bg-[#131924] border border-slate-800 p-8 text-center space-y-4">
            <Tv className="w-10 h-10 text-amber-400 mx-auto" />
            <h1 className="font-display text-xl font-bold text-white">
              Unable to Load Channel Directory
            </h1>
            <p className="text-sm text-slate-400 max-w-md mx-auto">{loadError}</p>
            <button
              type="button"
              data-tv-focusable="true"
              onClick={() => fetchChannels(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-[#0B0F17] text-sm font-semibold hover:bg-amber-300 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        ) : (
          <>
            {activeView === 'live' && (
              <div className="space-y-8">
                <SpotlightHero
                  channels={allChannels}
                  favorites={favorites}
                  onPlayChannel={handlePlayChannel}
                  onToggleFavorite={handleToggleFavorite}
                  onApplyFilter={handleApplyFilter}
                />

                {recentChannels.length > 0 && (
                  <section aria-label="Recently Watched Channels" className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="font-display text-lg font-semibold text-white">
                        Continue Watching
                      </h2>
                      <span className="text-xs text-slate-400 font-mono tabular-nums">
                        {recentChannels.length} recent
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {recentChannels.slice(0, 4).map((ch) => (
                        <ChannelCard
                          key={ch.id}
                          channel={ch}
                          isFavorite={favorites.has(ch.id)}
                          isPlaying={activeChannel?.id === ch.id}
                          onPlay={handlePlayChannel}
                          onToggleFavorite={handleToggleFavorite}
                        />
                      ))}
                    </div>
                  </section>
                )}

                <LanguageAndCategoryBar
                  selectedLanguage={selectedLanguage}
                  selectedCategory={selectedCategory}
                  onSelectLanguage={setSelectedLanguage}
                  onSelectCategory={setSelectedCategory}
                  languageCounts={languageCounts}
                  categoryCounts={categoryCounts}
                  totalCount={allChannels.length}
                />

                <section aria-label="Live Channels Grid" className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-display text-xl font-bold text-white">
                      {selectedLanguage === 'All' && selectedCategory === 'All'
                        ? 'All Indian Live Channels'
                        : `${selectedLanguage === 'All' ? 'All Languages' : selectedLanguage} · ${
                            selectedCategory === 'All' ? 'All Categories' : selectedCategory
                          }`}
                    </h2>

                    <div className="flex items-center gap-3">
                      {(selectedLanguage !== 'All' || selectedCategory !== 'All') && (
                        <button
                          type="button"
                          data-tv-focusable="true"
                          onClick={() => {
                            setSelectedLanguage('All');
                            setSelectedCategory('All');
                          }}
                          className="text-xs font-medium text-amber-400 hover:text-amber-300 cursor-pointer px-2 py-1 rounded-lg"
                        >
                          Reset Filters
                        </button>
                      )}
                      <span className="text-xs text-slate-400 font-mono tabular-nums">
                        {filteredChannels.length} showing
                      </span>
                    </div>
                  </div>

                  {filteredChannels.length === 0 ? (
                    <div className="rounded-2xl bg-[#131924] border border-slate-800 p-10 text-center space-y-3">
                      <p className="font-display text-lg font-semibold text-white">
                        No channels found for this combination
                      </p>
                      <p className="text-sm text-slate-400">
                        Try switching back to All Categories or pick another Indian language.
                      </p>
                      <button
                        type="button"
                        data-tv-focusable="true"
                        onClick={() => {
                          setSelectedLanguage('All');
                          setSelectedCategory('All');
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-400 text-[#0B0F17] text-sm font-semibold hover:bg-amber-300 cursor-pointer"
                      >
                        Show All Channels
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredChannels.map((ch) => (
                        <ChannelCard
                          key={ch.id}
                          channel={ch}
                          isFavorite={favorites.has(ch.id)}
                          isPlaying={activeChannel?.id === ch.id}
                          onPlay={handlePlayChannel}
                          onToggleFavorite={handleToggleFavorite}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}

            {activeView === 'languages' && (
              <LanguagesView
                channels={allChannels}
                onSelectLanguageAndBrowse={(lang) => handleApplyFilter(lang, 'All')}
                onPlayChannel={handlePlayChannel}
              />
            )}

            {activeView === 'categories' && (
              <CategoriesView
                channels={allChannels}
                onSelectCategoryAndBrowse={(cat) => handleApplyFilter('All', cat)}
                onPlayChannel={handlePlayChannel}
              />
            )}

            {activeView === 'favorites' && (
              <section className="space-y-6" aria-label="Favorite Channels">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-800/80 pb-4">
                  <div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      Saved Favorite Channels
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                      Quick access to the Indian channels you watch most on your TV.
                    </p>
                  </div>
                  <p className="font-mono text-xs text-slate-400 tabular-nums">
                    {favoriteChannels.length} saved
                  </p>
                </div>

                {favoriteChannels.length === 0 ? (
                  <div className="rounded-2xl bg-[#131924] border border-slate-800 p-12 text-center space-y-4">
                    <Star className="w-8 h-8 text-amber-400 mx-auto" />
                    <div className="space-y-1">
                      <h2 className="font-display text-lg font-semibold text-white">
                        No favorite channels yet
                      </h2>
                      <p className="text-sm text-slate-400 max-w-md mx-auto">
                        Press the star icon on any channel card or while watching live to pin it here.
                      </p>
                    </div>
                    <button
                      type="button"
                      data-tv-focusable="true"
                      onClick={() => setActiveView('live')}
                      className="px-5 py-2.5 rounded-xl bg-amber-400 text-[#0B0F17] text-sm font-semibold hover:bg-amber-300 cursor-pointer"
                    >
                      Browse Live TV
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {favoriteChannels.map((ch) => (
                      <ChannelCard
                        key={ch.id}
                        channel={ch}
                        isFavorite
                        isPlaying={activeChannel?.id === ch.id}
                        onPlay={handlePlayChannel}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeView === 'guide' && (
              <TvGuideView
                channels={allChannels}
                onPlayChannel={handlePlayChannel}
                onAddCustomChannels={handleAddCustomChannels}
                customCount={customChannels.length}
                onClearCustomChannels={handleClearCustomChannels}
              />
            )}
          </>
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-800/80 py-5 mt-8">
        <div className="max-w-[1440px] mx-auto px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            BharatStream TV · Indian Internet Television Launcher · IST {istClock}
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              data-tv-focusable="true"
              onClick={() => fetchChannels(true)}
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer px-2 py-1 rounded-lg"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Lineup</span>
            </button>
            <button
              type="button"
              data-tv-focusable="true"
              onClick={() => setActiveView('guide')}
              className="text-slate-300 hover:text-amber-400 transition-colors cursor-pointer px-2 py-1 rounded-lg"
            >
              Add M3U Playlist
            </button>
          </div>
        </div>
      </footer>

      {/* Channel Number Dial Overlay */}
      {dialBuffer && (
        <div className="fixed top-20 right-8 z-40 px-5 py-3 rounded-2xl bg-[#131924] border border-amber-400 shadow-2xl">
          <p className="text-[11px] text-slate-400">Tuning Channel</p>
          <p className="font-mono text-2xl font-bold text-amber-400 tabular-nums">
            CH {dialBuffer}
          </p>
        </div>
      )}

      {/* Full-Screen Live HLS Player */}
      {activeChannel && (
        <ChannelPlayerModal
          channel={activeChannel}
          allChannels={allChannels}
          isFavorite={favorites.has(activeChannel.id)}
          onClose={() => setActiveChannel(null)}
          onSelectChannel={handlePlayChannel}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* Search & Channel Dialer Overlay */}
      {searchOpen && (
        <SearchOverlay
          channels={allChannels}
          onClose={() => setSearchOpen(false)}
          onPlayChannel={handlePlayChannel}
        />
      )}

      {/* Tactile Fire TV Remote Widget (shown on web/desktop, hidden inside native Fire TV APK) */}
      {!activeChannel && !searchOpen && !isNativeCapacitorApp() && (
        <RemoteControlDrawer
          onNavigateDirection={moveSpatialFocus}
          onSelect={() => {
            const focused = document.activeElement as HTMLElement | null;
            if (focused && focused.getAttribute('data-tv-focusable') === 'true') {
              focused.click();
            }
          }}
          onBack={() => {
            setSelectedLanguage('All');
            setSelectedCategory('All');
            setActiveView('live');
          }}
          onHome={() => setActiveView('live')}
          onOpenSearch={() => setSearchOpen(true)}
        />
      )}
    </div>
  );
}
