import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Search, X } from 'lucide-react';
import type { TvChannel } from '../types/tv';
import { ChannelLogo } from './ChannelLogo';

interface SearchOverlayProps {
  channels: TvChannel[];
  onClose: () => void;
  onPlayChannel: (channel: TvChannel) => void;
}

const QUICK_TERMS = ['DD National', 'News', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Sports', 'Music'];

export function SearchOverlay({ channels, onClose, onPlayChannel }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    inputRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return channels.slice(0, 18);
    return channels
      .filter(
        (ch) =>
          ch.name.toLowerCase().includes(q) ||
          ch.language.toLowerCase().includes(q) ||
          ch.category.toLowerCase().includes(q) ||
          (ch.network && ch.network.toLowerCase().includes(q)) ||
          String(ch.number).includes(q)
      )
      .slice(0, 36);
  }, [channels, query]);

  const handleKeyPressDial = (digit: string) => {
    setQuery((prev) => prev + digit);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search Indian TV Channels"
      onClick={onClose}
      className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md flex items-start justify-center p-4 sm:p-8 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl rounded-2xl bg-[#131924] border border-slate-800 shadow-2xl overflow-hidden mt-4 sm:mt-10"
      >
        {/* Search Input Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search channel name, language, category, or channel number (e.g. 101)..."
            className="flex-1 bg-transparent text-base sm:text-lg text-white placeholder:text-slate-500 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="w-9 h-9 rounded-xl bg-[#1A2232] flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Filter Buttons + Number Pad */}
        <div className="px-5 py-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-[#0E131C]">
          <div className="flex flex-wrap items-center gap-1.5">
            {QUICK_TERMS.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setQuery(term)}
                className="px-3 py-1.5 rounded-lg bg-[#1A2232] hover:bg-amber-400 hover:text-[#0B0F17] text-xs font-medium text-slate-300 transition-colors cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => handleKeyPressDial(d)}
                className="w-7 h-7 rounded-md bg-[#1A2232] hover:bg-slate-700 font-mono text-xs text-slate-200 cursor-pointer"
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Matching Results */}
        <div className="max-h-[60vh] overflow-y-auto tv-scroll p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {results.map((ch) => (
            <button
              key={ch.id}
              type="button"
              onClick={() => {
                onPlayChannel(ch);
                onClose();
              }}
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#0E131C] border border-slate-800/80 hover:border-amber-400 hover:bg-[#192231] text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <ChannelLogo channel={ch} size="sm" />
                <div className="min-w-0">
                  <div className="font-mono text-xs text-amber-400 tabular-nums">
                    CH {ch.number}
                  </div>
                  <p className="text-sm font-semibold text-white truncate">{ch.name}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {ch.language} · {ch.category}
                  </p>
                </div>
              </div>
              <Play className="w-4 h-4 text-amber-400 shrink-0 fill-current" />
            </button>
          ))}

          {results.length === 0 && (
            <div className="col-span-full py-10 text-center text-sm text-slate-400">
              No Indian channels matched &ldquo;{query}&rdquo;. Try searching by language like Hindi, Tamil, or Telugu.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
