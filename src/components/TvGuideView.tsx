import { useMemo, useState } from 'react';
import { Play, Plus, Upload, X } from 'lucide-react';
import {
  INDIAN_LANGUAGES,
  TV_CATEGORIES,
  getChannelEpgSchedule,
  getCurrentIstClock,
} from '../data/indianTvTaxonomy';
import type { IndianLanguage, TvCategory, TvChannel } from '../types/tv';
import { ChannelLogo } from './ChannelLogo';

interface TvGuideViewProps {
  channels: TvChannel[];
  onPlayChannel: (channel: TvChannel) => void;
  onAddCustomChannels: (newChannels: TvChannel[]) => void;
  customCount: number;
  onClearCustomChannels: () => void;
}

export function TvGuideView({
  channels,
  onPlayChannel,
  onAddCustomChannels,
  customCount,
  onClearCustomChannels,
}: TvGuideViewProps) {
  const [langFilter, setLangFilter] = useState<IndianLanguage>('All');
  const [catFilter, setCatFilter] = useState<TvCategory>('All');
  const [showImporter, setShowImporter] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [playlistText, setPlaylistText] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  const visibleChannels = useMemo(() => {
    return channels
      .filter((ch) => (langFilter === 'All' ? true : ch.language === langFilter))
      .filter((ch) => (catFilter === 'All' ? true : ch.category === catFilter))
      .slice(0, 60);
  }, [channels, langFilter, catFilter]);

  const headerSlots = useMemo(() => {
    const sample = channels[0];
    if (!sample) return [];
    return getChannelEpgSchedule(sample);
  }, [channels]);

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportError('');
    setImportSuccess('');
    setImporting(true);

    try {
      const res = await fetch('/api/playlist/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: playlistUrl.trim() || undefined,
          content: playlistText.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse playlist');
      }
      onAddCustomChannels(data.channels);
      setImportSuccess(`Added ${data.channels.length} channels to your lineup.`);
      setPlaylistUrl('');
      setPlaylistText('');
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Unable to import playlist');
    } finally {
      setImporting(false);
    }
  };

  return (
    <section className="space-y-6" aria-label="Indian TV Guide Schedule">
      {/* Header row */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Live TV Guide
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Indian Standard Time (IST · {getCurrentIstClock()}) schedule across live channels. Select any program to tune in.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {customCount > 0 && (
            <button
              type="button"
              onClick={onClearCustomChannels}
              className="px-3.5 py-2 rounded-xl bg-[#131924] border border-slate-700 text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
            >
              Clear Custom ({customCount})
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowImporter((s) => !s)}
            data-tv-focusable="true"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A2232] border border-slate-700 text-slate-100 text-sm font-medium hover:border-amber-400 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add M3U Playlist</span>
          </button>
        </div>
      </div>

      {/* Collapsible M3U Importer */}
      {showImporter && (
        <form
          onSubmit={handleImportSubmit}
          className="rounded-2xl bg-[#131924] border border-slate-800 p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-white">
                Import Custom M3U / IPTV Playlist
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Paste a public `.m3u` / `.m3u8` playlist URL or raw `#EXTINF` entries to add channels to your TV Guide.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowImporter(false)}
              aria-label="Close importer"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-slate-300">Playlist URL (.m3u)</span>
              <input
                type="url"
                value={playlistUrl}
                onChange={(e) => setPlaylistUrl(e.target.value)}
                placeholder="https://example.com/india-channels.m3u"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F17] border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-slate-300">Or paste M3U content</span>
              <textarea
                rows={2}
                value={playlistText}
                onChange={(e) => setPlaylistText(e.target.value)}
                placeholder={'#EXTINF:-1 group-title="News",My Channel\nhttps://.../playlist.m3u8'}
                className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F17] border border-slate-700 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </label>
          </div>

          {importError && <p className="text-xs text-rose-400">{importError}</p>}
          {importSuccess && <p className="text-xs text-emerald-400">{importSuccess}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={importing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-[#0B0F17] text-sm font-semibold hover:bg-amber-300 disabled:opacity-60 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{importing ? 'Importing...' : 'Load Channels'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          aria-label="Filter TV guide by language"
          value={langFilter}
          onChange={(e) => setLangFilter(e.target.value as IndianLanguage)}
          className="px-3.5 py-2 rounded-xl bg-[#131924] border border-slate-800 text-sm text-slate-200 cursor-pointer"
        >
          {INDIAN_LANGUAGES.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter TV guide by category"
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value as TvCategory)}
          className="px-3.5 py-2 rounded-xl bg-[#131924] border border-slate-800 text-sm text-slate-200 cursor-pointer"
        >
          {TV_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        <span className="text-xs text-slate-400 font-mono tabular-nums ml-auto">
          Showing {visibleChannels.length} channels
        </span>
      </div>

      {/* EPG Schedule Grid */}
      <div className="rounded-2xl border border-slate-800 bg-[#131924] overflow-hidden">
        <div className="overflow-x-auto tv-scroll">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0E131C]">
                <th className="py-3.5 px-4 text-xs font-semibold text-slate-400 w-64">
                  Channel
                </th>
                {headerSlots.map((slot, idx) => (
                  <th
                    key={slot.startTime}
                    className={`py-3.5 px-4 text-xs font-mono tabular-nums ${
                      idx === 0 ? 'text-amber-400 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    {idx === 0 ? `On Now · ${slot.startTime}` : slot.startTime}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {visibleChannels.map((ch) => {
                const slots = getChannelEpgSchedule(ch);
                return (
                  <tr
                    key={ch.id}
                    className="hover:bg-[#192231] transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => onPlayChannel(ch)}
                        data-tv-focusable="true"
                        className="flex items-center gap-3 text-left w-full cursor-pointer rounded-lg"
                      >
                        <ChannelLogo channel={ch} size="sm" />
                        <div className="min-w-0">
                          <div className="font-mono text-xs text-amber-400 tabular-nums">
                            CH {ch.number}
                          </div>
                          <div className="text-sm font-semibold text-white truncate max-w-[165px]">
                            {ch.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {ch.language} · {ch.category}
                          </div>
                        </div>
                      </button>
                    </td>

                    {slots.map((slot, idx) => (
                      <td key={slot.startTime} className="py-3 px-4 align-top">
                        <button
                          type="button"
                          onClick={() => onPlayChannel(ch)}
                          className={`w-full text-left p-2.5 rounded-xl border transition-colors cursor-pointer ${
                            idx === 0
                              ? 'bg-amber-400/10 border-amber-400/35 hover:border-amber-400'
                              : 'bg-[#0E131C]/70 border-slate-800/80 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-slate-100 truncate">
                              {slot.title}
                            </span>
                            {idx === 0 && (
                              <Play className="w-3 h-3 text-amber-400 shrink-0 fill-current" />
                            )}
                          </div>
                          <p className="font-mono text-[11px] text-slate-400 tabular-nums mt-1">
                            {slot.startTime} – {slot.endTime}
                          </p>
                        </button>
                      </td>
                    ))}
                  </tr>
                );
              })}

              {visibleChannels.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-slate-400">
                    No channels match that language and category combination.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
