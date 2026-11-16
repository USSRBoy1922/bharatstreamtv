import { Play, Star } from 'lucide-react';
import { getChannelEpgSchedule } from '../data/indianTvTaxonomy';
import type { TvChannel } from '../types/tv';
import { ChannelLogo } from './ChannelLogo';

interface ChannelCardProps {
  channel: TvChannel;
  isFavorite: boolean;
  isPlaying?: boolean;
  onPlay: (channel: TvChannel) => void;
  onToggleFavorite: (channelId: string) => void;
}

export function ChannelCard({
  channel,
  isFavorite,
  isPlaying = false,
  onPlay,
  onToggleFavorite,
}: ChannelCardProps) {
  const currentProgram = getChannelEpgSchedule(channel)[0];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPlay(channel);
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      onToggleFavorite(channel.id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      data-tv-focusable="true"
      aria-label={`Channel ${channel.number} ${channel.name}, ${channel.language} ${channel.category}. Press Enter to watch, F to favorite.`}
      onClick={() => onPlay(channel)}
      onKeyDown={handleKeyDown}
      className={`group relative rounded-xl bg-[#131924] border transition-all duration-150 flex flex-col justify-between p-4 text-left cursor-pointer hover:bg-[#192231] hover:scale-[1.02] focus:bg-[#1B2536] focus:scale-[1.03] ${
        isPlaying
          ? 'border-amber-400/80 ring-1 ring-amber-400/40'
          : 'border-slate-800/90 hover:border-slate-700'
      }`}
    >
      {/* Top row: Channel number + Logo + Star icon (tabIndex=-1 so D-pad moves cleanly card-to-card) */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <ChannelLogo channel={channel} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono tabular-nums">
              <span className="text-amber-400/95 font-semibold">CH {channel.number}</span>
              {channel.isPublicBroadcaster && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-sans text-slate-400">Free-to-Air</span>
                </>
              )}
            </div>
            <h3 className="font-display text-base font-semibold text-slate-100 truncate group-hover:text-amber-300 group-focus:text-amber-300 transition-colors mt-0.5">
              {channel.name}
            </h3>
          </div>
        </div>

        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(channel.id);
          }}
          aria-label={isFavorite ? `Remove ${channel.name} from favorites` : `Favorite ${channel.name}`}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-400 hover:bg-slate-800/70 transition-colors shrink-0 cursor-pointer"
        >
          <Star
            className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`}
          />
        </button>
      </div>

      {/* Middle: Current program & EPG progress */}
      <div className="mt-4 w-full">
        <p className="text-xs text-slate-300 truncate font-medium">
          {currentProgram.title}
        </p>
        <div className="mt-1.5 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-400/75 rounded-full"
            style={{ width: `${currentProgram.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Bottom: Unboxed metadata with dot separators + Watch cue */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/70 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate">
          <span>{channel.language}</span>
          <span aria-hidden="true">·</span>
          <span>{channel.category}</span>
          {channel.resolution && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{channel.resolution}</span>
            </>
          )}
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 shrink-0">
          <Play className="w-3 h-3 fill-current" aria-hidden="true" />
          <span>{isPlaying ? 'Playing' : 'Watch'}</span>
        </span>
      </div>
    </div>
  );
}
